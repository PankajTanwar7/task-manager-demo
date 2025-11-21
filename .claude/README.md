# Claude Code Automation System

**Version:** 2.0 (Post-Security Audit)
**Status:** Production-Ready

## Overview

Automated workflow system for Claude Code development with GitHub integration. This system eliminates manual work while maintaining high-quality progress tracking.

---

## Quick Start

### 0. Install Git Hooks (One-Time Setup)

```bash
./.claude/scripts/install-hooks.sh
```

This installs the post-commit hook that enables automatic GitHub comments.

### 1. Start Work on an Issue

```bash
./scripts/start-work.sh 23
```

This automatically:
- ✅ Creates feature branch (`feature/23-description`)
- ✅ Fetches issue context from GitHub
- ✅ Generates Claude Code prompt file
- ✅ Sets up development environment

### 2. Work with Claude Code

Develop normally with Claude Code. Make commits as usual:

```bash
git commit -m "feat: implement feature X

Added functionality Y because of requirement Z.
Modified files A, B, C to support this change."
```

### 3. Automatic GitHub Updates

**The post-commit hook runs automatically** and:
- ✅ Extracts context from git (commits, diff, files)
- ✅ Generates summary from your commit message
- ✅ Posts to GitHub issue/PR automatically
- ✅ **Zero manual work required!**

### 4. Create PR & Merge

```bash
gh pr create --fill  # Creates PR with auto-generated description
# After review and approval:
gh pr merge          # Merges and auto-closes issue
```

---

## How It Works

### Git-Based Context System

Instead of trying to capture your prompts, we use git as the source of truth:

```
User commits code
      ↓
Post-commit hook triggers (.git/hooks/post-commit)
      ↓
Auto-summary script runs (.claude/scripts/auto-summary.sh)
      ├─ Extracts: git log (commits)
      ├─ Extracts: git diff (changes)
      ├─ Extracts: gh issue view (requirements)
      └─ Generates: summary from commit messages
      ↓
Posts to GitHub (issue or PR)
      ↓
Done! No manual input needed
```

**Why This Works:**
- ✅ Git history persists across sessions
- ✅ No stale data (git is always current)
- ✅ No fragile JSON files to maintain
- ✅ Quality depends on commit messages (which you write anyway)

---

## Security Features

**Post-Audit Status:** All critical vulnerabilities patched

### Input Sanitization
- All user inputs sanitized (prompts, commits, mentions)
- Shell metacharacters escaped: `$ ` \ `
- Prevents command injection attacks

### Validation
- Issue numbers validated (must be positive integers)
- File sizes validated (1MB limit)
- Prevents path traversal attacks

### Strict Mode
- All scripts use `set -euo pipefail`
- Fails fast on errors
- Prevents undefined variable access

---

## Configuration

### Disable Auto-Commenting

```bash
export DISABLE_AUTO_COMMENT=true
# Now commits won't trigger auto-comments

# To re-enable:
unset DISABLE_AUTO_COMMENT
```

### Enable Debug Logging

```bash
export DEBUG_POST_SUMMARY=true
# Debug logs written to: .claude/post-summary-debug.log
```

---

## File Structure

```
.claude/
  ├─ scripts/
  │   └─ auto-summary.sh       # Auto-generates comments from git
  ├─ hooks/
  │   ├─ post-summary.sh       # Manual comment posting (legacy)
  │   └─ prompt-logger.js      # Captures prompts (informational only)
  └─ README.md                 # This file

.git/hooks/
  └─ post-commit               # Triggers auto-summary after commits

scripts/
  ├─ start-work.sh             # Initialize work on an issue
  ├─ parse-coverage.sh         # Parse test coverage
  └─ cleanup.sh                # Post-merge cleanup (if exists)

docs/dev-logs/                 # Session logs per issue
```

---

## Writing Good Commit Messages

Since summaries are generated from commit messages, write clear commits:

### Bad Commit Message
```
git commit -m "fix stuff"
```
**Result:** Poor auto-generated summary

### Good Commit Message
```
git commit -m "fix: handle null values in task validation

Added null checks in validateTask() to prevent crashes.
Fixes edge case where completed tasks had no completedAt field.

Modified: src/middleware/validation.js (line 45)
Tests: Added test case for null completedAt"
```
**Result:** Excellent auto-generated summary!

### Commit Message Template

```
<type>: <short description>

<detailed explanation of what was done and why>

<optional: files modified, tests added, etc.>
```

**Types:** `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `security`

---

## Comparison: Old vs New System

| Feature | Old System | New System |
|---------|-----------|-----------|
| **Prompt Capture** | Tried to capture prompts from hooks | Uses git commits (source of truth) |
| **Session Resumption** | Broke after context limit | Works forever (git persists) |
| **Manual Work** | Required calling post-summary.sh | Fully automatic (post-commit hook) |
| **Data Files** | prompt-history.json (stale data bugs) | None (git is the data) |
| **Comment Quality** | Good (manual input) | Excellent (based on actual changes) |
| **Security** | 4 critical vulnerabilities | All patched, audited |

---

## Troubleshooting

### Hook Not Installed

If automatic comments aren't working:

```bash
# Re-run the installation script:
./.claude/scripts/install-hooks.sh

# Verify installation:
ls -la .git/hooks/post-commit
# Should show: -rwxr-xr-x (executable)
```

### Hook Not Running

```bash
# Check if hook is executable:
ls -la .git/hooks/post-commit

# If not executable:
chmod +x .git/hooks/post-commit
```

### Comments Not Posting

```bash
# Check if auto-commenting is disabled:
echo $DISABLE_AUTO_COMMENT

# If "true", re-enable:
unset DISABLE_AUTO_COMMENT
```

### "No issue or PR found" Error

Make sure your branch name contains the issue number:
```bash
# Good:
feature/23-add-pagination
fix/42-security-patch

# Bad:
my-feature-branch
```

---

## Legacy Scripts (Still Available)

### Manual Comment Posting

If you need to post a custom comment manually:

```bash
./.claude/hooks/post-summary.sh \
  "Custom request description" \
  "Custom achievement description"
```

This is useful for:
- Special announcements
- Milestone summaries
- When you want custom wording

---

## Best Practices

1. **Write Clear Commit Messages**
   - Explain what you did and why
   - Mention files changed
   - Note tests added

2. **Commit Frequently**
   - Each logical change = one commit
   - Smaller commits = better tracking
   - Auto-comments show incremental progress

3. **Review Auto-Generated Comments**
   - Check GitHub after committing
   - Verify summary makes sense
   - Improve commit messages if needed

4. **Keep Branches Focused**
   - One branch = one issue/feature
   - Makes auto-tracking cleaner
   - Easier to review

---

## Support

**Issues:** https://github.com/PankajTanwar7/task-manager-demo/issues
**Documentation:** This file
**Security:** All vulnerabilities from Issue #23 audit fixed

---

**Last Updated:** 2025-11-21 (Phase 2 Complete + Review Fixes)
**Audit Status:** ✅ Security Hardened
**Automation Status:** ✅ Fully Automatic
