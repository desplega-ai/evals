---
date: 2026-02-17T17:55:00-05:00
topic: "Fix PR Verify Workflow Early Exit"
researcher: Claude
branch: main
repository: desplega-ai/evals
tags: [plan, github-actions, qa-use, verify-pr, ci, claude-code]
status: draft
autonomy: autopilot
last_updated: 2026-02-17
last_updated_by: Claude
---

# Fix PR Verify Workflow Early Exit

## Overview

Fix the GitHub Actions `pr-verify.yml` workflow so that Claude Code actually completes the PR verification instead of silently exiting after 2 turns. The root cause is that the model (Haiku) launches the `qa-use:pr-verifier` sub-agent as a background task, and `--print` mode kills it when the parent exits.

## Current State Analysis

The workflow at `.github/workflows/pr-verify.yml` invokes Claude Code like this (line 92):

```bash
claude --print --verbose --dangerously-skip-permissions --output-format stream-json --model haiku \
  "/qa-use:verify-pr #${{ ... }} --base-url ${{ steps.vercel.outputs.url }}" 2>&1 \
  | jq -c 'select(.type == "assistant" or .type == "tool_use" or .type == "result")'
```

**Problems identified:**

1. **No CI-specific CLAUDE.md** — The model (any model) may decide to use `run_in_background: true` for the Task tool. In `--print` mode, background tasks are killed when the main agent exits. There is no instruction telling the model to avoid this.
2. **`--model haiku`** — Haiku doesn't reason well about execution context. It followed a tendency to background tasks without understanding that `--print` mode would kill them.
3. **Silent success on failure** — The workflow reports `success` even when no verification report is generated. The "Post Report to PR" step silently skips if the file doesn't exist.

### Key Discoveries:
- No `.github/CLAUDE.md` or CI-specific CLAUDE.md exists anywhere: `.github/workflows/pr-verify.yml:83-92`
- The qa-use CI reference guide shows a simpler `claude --print` invocation without `--model haiku`: `~/.claude/plugins/cache/desplega-ai/qa-use/2.4.0/skills/qa-use/references/ci.md:52`
- The verify-pr skill is a 9-step sequential workflow — it should never be backgrounded: `~/.claude/plugins/cache/desplega-ai/qa-use/2.4.0/commands/verify-pr.md:20-29`
- The Task tool description itself offers `run_in_background` as an option, so any model could use it regardless of CLAUDE.md instructions

## Desired End State

- Claude Code runs the full verify-pr workflow to completion (all 9 steps)
- A verification report is generated at `/tmp/pr-verify-report-<pr>.md`
- The report is posted as a PR comment
- Artifacts (screenshots, logs) are uploaded
- The workflow **fails** if no report is generated (no more silent success)

### How to verify:
1. Trigger the workflow via `workflow_dispatch` on an existing PR
2. Confirm the run takes several minutes (not 7 seconds)
3. Confirm a PR comment with the verification report is posted
4. Confirm artifacts are uploaded

## Quick Verification Reference

Commands:
- Validate YAML syntax: `python3 -c "import yaml; yaml.safe_load(open('.github/workflows/pr-verify.yml'))"`
- Check git diff: `git diff .github/workflows/pr-verify.yml`

Key files:
- `.github/workflows/pr-verify.yml` — the workflow
- `CLAUDE.md` — project instructions (NOT modified)

## What We're NOT Doing

- **Not modifying the project CLAUDE.md** — The "run in background" instruction is in Taras's global `~/.claude/CLAUDE.md`, which doesn't exist on CI runners. The CI fix is a workflow-level step.
- **Not modifying the qa-use plugin** — Skill-level `run_in_background` override would require changes to the plugin code. Deferred to a separate effort.
- **Not adding `--max-turns`** — With foreground execution and a capable model, the agent should use as many turns as needed. Adding an arbitrary limit could cause a different kind of truncation.

## Implementation Approach

Two phases: (1) inject CI-specific instructions into the workflow, (2) upgrade the model and add failure detection. Both phases modify the same file (`.github/workflows/pr-verify.yml`).

---

## Phase 1: Add CI-Specific Claude Instructions to Workflow

### Overview

Add a workflow step that appends CI-specific instructions to the project CLAUDE.md before Claude Code runs. Since the checkout is ephemeral, this doesn't affect the checked-in file. The instructions explicitly prohibit `run_in_background` and other interactive-only behaviors.

### Changes Required:

#### 1. New workflow step: "Write CI-specific Claude instructions"
**File**: `.github/workflows/pr-verify.yml`
**Changes**: Insert a new step between "Install qa-use plugin and CLI" (line 68-73) and "Wait for Vercel Preview" (line 75-81). This step appends CI-specific instructions to `CLAUDE.md`.

```yaml
- name: Write CI-specific Claude instructions
  if: steps.approval.outputs.approved == 'true'
  run: |
    cat >> CLAUDE.md << 'CIEOF'

    ## CI/CD Runner Instructions (Auto-generated)

    You are running in CI with `--print` mode. Follow these rules strictly:

    - **NEVER use `run_in_background: true`** when calling the Task tool. ALL tasks MUST run in the foreground. Background tasks are killed when `--print` mode exits.
    - **NEVER use `run_in_background: true`** for ANY tool call. This is a non-interactive environment.
    - Execute all steps sequentially and wait for each to complete before proceeding.
    - Do not attempt interactive user prompts — make autonomous decisions.
    - If a step fails, report the failure and continue to the next step where possible.
    CIEOF
```

### Success Criteria:

#### Automated Verification:
- [x] YAML syntax valid: `python3 -c "import yaml; yaml.safe_load(open('.github/workflows/pr-verify.yml'))"`
- [x] Step appears in correct position: `grep -n 'CI-specific Claude instructions' .github/workflows/pr-verify.yml`
- [x] CLAUDE.md not modified in git: `git diff CLAUDE.md` (should be empty)

#### Manual Verification:
- [ ] Read the workflow diff and confirm the new step is between plugin install and Vercel wait
- [ ] Confirm the heredoc syntax is correct (uses `'CIEOF'` with quotes to prevent variable expansion)

**Implementation Note**: After completing this phase, pause for manual confirmation.

---

## Phase 2: Upgrade Model and Add Failure Detection

### Overview

Switch from `--model haiku` to `--model sonnet` for better reasoning, and add a verification check that fails the workflow if no report is generated.

### Changes Required:

#### 1. Change model from haiku to sonnet
**File**: `.github/workflows/pr-verify.yml`
**Changes**: On the `claude` invocation line, change `--model haiku` to `--model sonnet`.

Before:
```bash
claude --print --verbose --dangerously-skip-permissions --output-format stream-json --model haiku "/qa-use:verify-pr ..."
```

After:
```bash
claude --print --verbose --dangerously-skip-permissions --output-format stream-json --model sonnet "/qa-use:verify-pr ..."
```

#### 2. Add report verification step
**File**: `.github/workflows/pr-verify.yml`
**Changes**: Add a new step between "Run PR Verification" and "Post Report to PR" that checks the report was generated and fails if not.

```yaml
- name: Verify report was generated
  if: steps.approval.outputs.approved == 'true'
  run: |
    REPORT="/tmp/pr-verify-report-${{ github.event.pull_request.number || inputs.pr_number }}.md"
    if [ ! -f "$REPORT" ]; then
      echo "::error::Verification report was not generated at $REPORT"
      echo "This usually means Claude Code exited before completing verification."
      echo "Check the 'Run PR Verification' step logs for details."
      exit 1
    fi
    echo "Report generated successfully:"
    wc -l "$REPORT"
```

### Success Criteria:

#### Automated Verification:
- [x] YAML syntax valid: `python3 -c "import yaml; yaml.safe_load(open('.github/workflows/pr-verify.yml'))"`
- [x] Model changed: `grep 'model sonnet' .github/workflows/pr-verify.yml`
- [x] Report check step exists: `grep -n 'Verify report was generated' .github/workflows/pr-verify.yml`

#### Manual Verification:
- [ ] Read full workflow diff and confirm the step ordering is: CI instructions → Vercel wait → Run verification → Verify report → Post report → Upload artifacts
- [ ] Confirm the report check step uses the correct PR number variable pattern (matching the existing steps)

**Implementation Note**: After completing this phase, pause for manual confirmation.

---

## Manual E2E Verification

After both phases are implemented and committed:

1. **Create a test PR** (or use an existing one):
   ```bash
   git checkout -b test/pr-verify-fix
   # Make a trivial frontend change
   git push -u origin test/pr-verify-fix
   gh pr create --title "Test PR verify fix" --body "Testing workflow fix"
   ```

2. **Trigger the workflow manually** (faster than waiting for Vercel deploy):
   ```bash
   gh workflow run "PR Verification" --field pr_number=<PR_NUMBER>
   ```

3. **Monitor the run**:
   ```bash
   gh run list --workflow=pr-verify.yml --limit 1
   gh run watch <RUN_ID>
   ```

4. **Verify the outcomes**:
   - Run takes several minutes (not seconds)
   - `gh run view <RUN_ID> --log` shows Claude Code executing multiple turns with foreground tasks
   - PR has a verification report comment: `gh pr view <PR_NUMBER> --comments`
   - Artifacts exist: `gh run view <RUN_ID>` shows uploaded artifacts

5. **Clean up** (if using a test PR):
   ```bash
   gh pr close <PR_NUMBER>
   git checkout main
   git branch -D test/pr-verify-fix
   ```

## References

- Research: `thoughts/taras/research/2026-02-06-gh-actions-early-exit.md`
- qa-use CI guide: `~/.claude/plugins/cache/desplega-ai/qa-use/2.4.0/skills/qa-use/references/ci.md`
- verify-pr command: `~/.claude/plugins/cache/desplega-ai/qa-use/2.4.0/commands/verify-pr.md`
