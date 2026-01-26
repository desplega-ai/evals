# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Project Overview

A Next.js 16.1 application serving as an AI QA Agent evaluation frontend. It provides various UI components and interactions to test AI agents' ability to interact with web elements.

## Running the Application

### Default: Port 3001

```bash
PORT=3001 pnpm dev
```

### Running in Background (Recommended for qa-use testing)

Use the Task tool to run the dev server in the background:

```
Task: Run `PORT=3001 pnpm dev` in the background
```

This keeps the main session free for running tests while the server runs.

### Other Commands

```bash
pnpm build    # Build production bundle
pnpm start    # Start production server
pnpm lint     # Run linting
```

## qa-use Testing

This project is configured for qa-use browser automation testing.

### Configuration

- **Test directory**: `./qa-tests`
- **App config ID**: `c568a53e-f5ab-4065-9a4a-565136a2d73c`
- **Config file**: `.qa-use-tests.json`

### Existing Tests

Check for existing tests before creating new ones:

```bash
qa-use test list              # List local tests
qa-use test list --cloud      # List cloud tests (includes shared/login tests)
```

Reuse existing tests when creating browser sessions with `--after-test-id`:

```bash
# Start session already authenticated (runs login test first)
qa-use browser create --tunnel --after-test-id <test-uuid>

# Example: find and reuse a login test
qa-use test list --cloud | grep -i login
qa-use browser create --tunnel --after-test-id abc123-def456-...
```

This is useful for:
- Starting sessions in an authenticated state
- Reusing setup/navigation steps from existing tests
- Building on top of established test flows

### Testing Localhost

Since the app runs locally, use `--tunnel` flag for all qa-use operations.

**Important:** Always use `--headless` for browser sessions (not `--no-headless`).

```bash
# Interactive browser session (tunnel required for localhost)
qa-use browser create --tunnel --headless
qa-use browser goto http://localhost:3001
qa-use browser snapshot
qa-use browser click e3
qa-use browser close

# Run tests against localhost
qa-use test run my-test --tunnel
```

### Slash Commands

| Command | Description |
|---------|-------------|
| `/qa-use:verify "<feature>"` | Verify a feature works (e.g., `/qa-use:verify "checkbox toggles"`) |
| `/qa-use:verify-pr` | Verify PR frontend changes through browser automation |
| `/qa-use:explore` | Explore a web page interactively |
| `/qa-use:test-run <name>` | Run a specific test |

### Typical Workflow

1. Start dev server in background: `PORT=3001 pnpm dev`
2. Check existing tests: `qa-use test list --cloud`
3. Create tunneled browser session:
   - Fresh: `qa-use browser create --tunnel`
   - With setup: `qa-use browser create --tunnel --after-test-id <uuid>`
4. Navigate and interact: `qa-use browser goto http://localhost:3001`
5. Take snapshots and interact with elements
6. Generate test from session: `qa-use browser generate-test`
7. Close session: `qa-use browser close`

### Verifying New Features

After implementing a feature, verify it works:

```
/qa-use:verify "table displays data correctly"
/qa-use:verify "checkboxes toggle on click"
```

### Verifying PRs

Before merging, verify frontend changes:

```
/qa-use:verify-pr #123
/qa-use:verify-pr                    # infers from current branch
/qa-use:verify-pr --base-url https://preview.example.com
```

This analyzes changed files, creates an authenticated session, navigates to affected routes, and generates a verification report.

## Architecture

### Tech Stack
- Next.js 16.1.1 with App Router (Turbopack default)
- React 19.2.3
- TypeScript (strict mode)
- Tailwind CSS v4
- pnpm

### Project Structure
```
/src/app/
  layout.tsx      # Root layout with Geist font
  page.tsx        # Home page with navigation
  /table/         # Table display demo
  /checkboxes/    # Checkbox interaction demo
  /visible/       # Visibility testing demo
  /buttons/       # Button interaction demo
```

### Key Patterns
- All pages have a back link to home
- Tailwind CSS for styling
- Light theme with gray color scheme
- Path alias: `@/*` maps to `./src/*`

## Testing Scenarios

The app tests AI agents' abilities to:
1. Navigate between pages
2. Interact with table data
3. Handle checkbox states
4. Work with visible/hidden elements
5. Click various button types

Each demo page is self-contained with dummy data.
