---
date: 2026-02-06T13:16:00-05:00
researcher: Claude
git_commit: 08e297f3a26bc02da07d6ea1cf934765dbe6e997
branch: main
repository: desplega-ai/evals
topic: "Why did GitHub Actions run 21751290913 exit early without completing verification?"
tags: [research, github-actions, qa-use, verify-pr, ci, claude-code]
status: complete
autonomy: autopilot
last_updated: 2026-02-06
last_updated_by: Claude
---

# Research: GitHub Actions Run 21751290913 Early Exit

**Date**: 2026-02-06
**Researcher**: Claude
**Git Commit**: 08e297f3a26bc02da07d6ea1cf934765dbe6e997
**Branch**: main

## Research Question

Why did GitHub Actions run https://github.com/desplega-ai/evals/actions/runs/21751290913 exit early? The hypothesis is that it tried to trigger the verification but did not wait for the explore/verification to finish.

## Summary

The run did NOT technically fail or "early exit" -- all 14 steps completed with `conclusion: success`. However, the PR verification was **effectively a no-op** because Claude Code (Haiku model) launched the `qa-use:pr-verifier` sub-agent as a **background task** (`run_in_background: true`) and then immediately returned without waiting for it to complete. The `--print` flag used in the workflow causes Claude Code to exit after its main turns complete, which was just 2 turns (5.2 seconds) -- far too fast for any actual browser verification to happen.

As a result: no verification report was generated (`/tmp/pr-verify-report-5.md` did not exist), no artifacts were produced, and no comment was posted to the PR. The entire verification step was essentially a fire-and-forget that got killed when Claude Code exited.

## Detailed Findings

### The Workflow Configuration (`.github/workflows/pr-verify.yml`)

The workflow is triggered on PRs to `main` and via `workflow_dispatch`. The critical step is "Run PR Verification" (line 83-92):

```yaml
- name: Run PR Verification
  env:
    CLAUDE_CODE_OAUTH_TOKEN: ${{ secrets.CLAUDE_CODE_OAUTH_TOKEN }}
    QA_USE_API_KEY: ${{ secrets.QA_USE_API_KEY }}
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    CI: true
  run: |
    claude --print --verbose --dangerously-skip-permissions --output-format stream-json --model haiku \
      "/qa-use:verify-pr #${{ ... }} --base-url ${{ steps.vercel.outputs.url }}" 2>&1 \
      | jq -c 'select(.type == "assistant" or .type == "tool_use" or .type == "result")'
```

Key observations:
- Uses `--print` mode (non-interactive, exits when done)
- Uses `--model haiku` (fast but less capable model)
- Output is piped through `jq` for filtering

### What Claude Code (Haiku) Actually Did

From the stream-json output in the logs:

1. **Turn 1** (msg_0152vyTFiTBSnvjKjPMc1Dks): Claude said "I'll verify the PR #5 frontend changes using the preview URL you provided." and then called the `Task` tool with:
   ```json
   {
     "subagent_type": "qa-use:pr-verifier",
     "description": "Verify PR #5 frontend changes",
     "prompt": "Verify PR #5 with base_url=https://evals-7iypzjagi-desplega-ai.vercel.app...",
     "run_in_background": true  // <-- THE PROBLEM
   }
   ```

2. **Turn 2** (msg_01Qkv74zXvRUDEvReuNsU9xS): Claude returned the background task message with a `tail` command to check progress. Then Claude Code exited with a `result` type message showing `num_turns: 2`, `duration_ms: 5201`.

The background sub-agent (ID `a62f44e`) was launched but the parent Claude Code process exited immediately after, killing the sub-agent.

### Why Haiku Used `run_in_background: true`

The `/qa-use:verify-pr` command/skill does NOT instruct the model to use `run_in_background`. The skill document (`verify-pr.md`) describes a sequential 9-step workflow. However, Haiku independently decided to launch the verification as a background task -- likely because:

1. The CLAUDE.md for this project says: "Whenever you can run a tool or task (e.g. Explore) in the background, do it"
2. Haiku followed this instruction literally without understanding that in `--print` mode, the process exits when the main agent finishes, killing any background tasks

This is a model behavior issue: Haiku doesn't reason about the CI/`--print` context and how background tasks interact with process lifecycle.

### Timeline of the Full Run

| Time | Step | Duration |
|------|------|----------|
| 12:54:31 | Job started | - |
| 12:54:34 | Checkout complete | 3s |
| 12:54:34 | PR approval (hardcoded true) | <1s |
| 12:54:35 | Node.js setup | 1s |
| 12:54:37-44 | Claude Code CLI install | 9s |
| 12:54:46 | CLI version check | <1s |
| 12:54:46-57 | qa-use plugin + CLI install | 11s |
| 12:54:57-58 | Vercel preview wait | 1s |
| 12:54:58-12:55:05 | **Claude Code run** | **7s** |
| 12:55:05 | Post report (no file) | <1s |
| 12:55:05-06 | Upload artifacts (none found) | 1s |
| 12:55:06-08 | Cleanup | 2s |

Total job: ~37 seconds. The actual Claude Code execution was only ~7 seconds, of which only ~5.2s was API time (2 turns).

### Downstream Effects

- No `/tmp/pr-verify-report-5.md` was created (report step skipped)
- No artifacts uploaded (all glob patterns matched zero files)
- No comment posted to PR #5
- The workflow reported SUCCESS despite doing nothing useful

## Code References

| File | Line | Description |
|------|------|-------------|
| `.github/workflows/pr-verify.yml` | 83-92 | The "Run PR Verification" step that invokes Claude Code |
| `.github/workflows/pr-verify.yml` | 90 | `--model haiku` flag -- uses less capable model |
| `.github/workflows/pr-verify.yml` | 92 | `--print` mode -- non-interactive, exits when main agent done |
| `.github/workflows/pr-verify.yml` | 94-102 | Post report step -- checks for file that was never created |
| `CLAUDE.md` (project) | N/A | "Whenever you can run a tool or task in the background, do it" -- instruction Haiku followed too literally |
| `~/.claude/plugins/cache/desplega-ai/qa-use/2.4.0/commands/verify-pr.md` | 1-238 | The verify-pr skill definition (does NOT mention background execution) |

## Architecture Documentation

### How `--print` Mode Works
- Claude Code runs in non-interactive "print" mode
- The process exits when the main agent completes its turns
- Any background sub-agents (`run_in_background: true`) are orphaned/killed when the parent process exits
- There is no mechanism to wait for background tasks in `--print` mode

### Interaction Between CLAUDE.md Instructions and CI
- The project CLAUDE.md contains instructions optimized for interactive use (e.g., "run tasks in background")
- These instructions are also loaded in CI `--print` mode where they can cause incorrect behavior
- The model (especially Haiku) may not distinguish between interactive and CI contexts

## Historical Context (from thoughts/)

No prior research exists in `thoughts/taras/research/` (directory contains only `.gitkeep`).

## Related Research

None found.

## Decisions

Based on review:

1. **CLAUDE.md for CI runner**: Add a CI-specific CLAUDE.md *in the workflow* (e.g., write it as a step before running Claude Code) so it only affects the GH Actions runner. Include best practices like "NEVER use `run_in_background` -- all tasks must run in the foreground."
2. **Switch to Sonnet**: Change `--model haiku` to `--model sonnet` in the workflow for better reasoning about execution context.
3. **Skill-level `run_in_background` override**: Investigate whether the `verify-pr` skill can enforce `run_in_background: false` when `CI=true`. This needs further research into whether skills can override Task tool parameters.

## Rejected Approaches

- **Timeout loop waiting for report file**: Rejected -- doesn't address root cause.
- **Changing `--print` flag behavior**: Rejected -- prompting is sufficient for now.
