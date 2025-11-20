# Development Logs

This directory contains auto-generated development logs from Claude Code sessions.

## Overview

Logs are automatically created by the `UserPromptSubmit` hook when you ask technical questions to Claude Code.

## How It Works

- **Hook:** `.claude/hooks/user-prompt-submit.sh`
- **Logger:** `.claude/hooks/prompt-logger.js`
- **Configured in:** `.claude/settings.json`

## Log Files

**Issue-based logs** (when working on feature branches):
- `issue-{N}.md` - All prompts related to issue #{N}
- Example: `issue-45.md` for branch `feature/45-user-auth`

**Date-based logs** (when on main/master):
- `session-{YYYY-MM-DD}.md` - All prompts from that date

## What Gets Logged

Each log entry includes:
- **Timestamp** - When the prompt was submitted
- **Branch name** - Git branch you were on
- **Issue number** - Extracted from branch name (if applicable)
- **User prompt** - Your exact question/request
- **Modified files** - Files changed in your working directory

## Smart Filtering

The logger **only captures technical conversations**, filtering out:
- Greetings (hi, hello, thanks)
- Short questions (< 50 characters)
- Casual chat without technical keywords

It **always logs**:
- Technical keywords (implement, fix, create, bug, feature, etc.)
- File mentions (package.json, src/auth.js, etc.)
- Code-related actions (write, read, update, delete, debug, test)

## Testing the Hook

Run the test script to verify the hook is working:

```bash
./.claude/hooks/test-hook.sh
```

## Disabling the Hook

To temporarily disable logging, rename the settings file:

```bash
mv .claude/settings.json .claude/settings.json.disabled
```

To re-enable:

```bash
mv .claude/settings.json.disabled .claude/settings.json
```

## Documentation

For complete setup and customization guide, see:
- **workflow-system/HOOKS-SETUP.md** - Complete hook system documentation

---

*This directory is managed by Claude Code hooks. Logs are auto-generated and should not be manually edited.*
- [2025-11-20T19:00:03.490Z] [session-2025-11-20.md](./session-2025-11-20.md) - Branch: `test/demo-hooks`
- [2025-11-20T19:08:31.068Z] [issue-4.md](./issue-4.md) - Branch: `feature/4-health-metrics`
- [2025-11-20T19:44:53.225Z] [issue-6.md](./issue-6.md) - Branch: `feature/6-add-health-check-endpoint`
