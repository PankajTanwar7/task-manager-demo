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

### 0.1. Enable Claude Code Prompt Capture (Optional but Recommended)

To capture your actual prompts from Claude Code desktop app:

**Step 1:** Add the hook to your Claude Code settings

Open your Claude Code settings (usually `~/.config/claude-code/config.json` or similar) and add:

```json
{
  "hooks": {
    "UserPromptSubmit": {
      "command": "/absolute/path/to/your/repo/.claude/hooks/prompt-logger.js"
    }
  }
}
```

**Step 2:** Make the hook executable

```bash
chmod +x .claude/hooks/prompt-logger.js
```

**Step 3:** Test it

Open Claude Code, give it a prompt like "Add a loading spinner", and you should see:
```
✓ Prompt logged to issue-23.md
```

Your prompts will now be saved to `.claude/prompt-history.json` and automatically included in GitHub comments!

**Without this setup:** Comments will still work, but will use commit messages or GitHub @claude mentions as the "prompt".

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
- ✅ Captures the trigger prompt (@claude mention) autonomously
- ✅ Extracts context from git (commits, diff, files)
- ✅ Generates summary from your commit message
- ✅ Posts formatted update to GitHub issue/PR automatically
- ✅ **Zero manual work required!**

**Comment Format:**
```markdown
### 💬 Actual Prompt
> [Your @claude mention that triggered the work]

### ✅ What Was Delivered
[Summary from commit messages and changes]

### 📁 Files Changed
[List of modified files]
```

**Note:** Comments post immediately after commits (before push). This is intentional - you commit when ready to share, then push shortly after. If you're experimenting with commits you don't intend to push, use `export DISABLE_AUTO_COMMENT=true` to prevent auto-posting.

### 4. Create PR & Merge

```bash
gh pr create --fill  # Creates PR with auto-generated description
# After review and approval:
gh pr merge          # Merges and auto-closes issue
```

---

## How It Works

### Autonomous Context System

The system captures everything automatically from three sources with a priority chain:

**Priority Chain for Prompt Capture:**
1. **Claude Code Prompt History** (`.claude/prompt-history.json`) - Highest priority
   - Captures actual prompts from local Claude Code desktop usage
   - Requires Claude Code hook setup (see section 0.1 above)
   - Most accurate for local development

2. **GitHub API** (@claude mentions) - Fallback
   - Extracts @claude mentions from GitHub comments
   - Works in GitHub Actions workflows
   - Good for collaborative development

3. **Commit Messages** - Last resort
   - Uses commit message as proxy for intent
   - Always available

**Implementation Data (Git History):**
- Extracts commits, diffs, and file changes
- Shows what was actually delivered
- All data persists across sessions

```
LOCAL DEVELOPMENT WORKFLOW:
User works with Claude Code desktop app
      ↓
Gives prompt: "Add a loading spinner"
      ↓
Claude Code hook captures prompt → .claude/prompt-history.json
      ↓
Claude Code implements changes
      ↓
User commits: git commit -m "feat: add loading state"
      ↓
Post-commit hook triggers (.git/hooks/post-commit)
      ↓
Auto-summary script runs (.claude/scripts/auto-summary.sh)
      ├─ Reads prompt from: .claude/prompt-history.json
      ├─ Extracts commits: git log
      ├─ Extracts changes: git diff
      ├─ Extracts context: gh issue view
      └─ Generates: formatted summary
      ↓
Posts to GitHub (issue or PR) with:
      ├─ 💬 Actual Prompt: "Add a loading spinner"
      └─ ✅ What Was Delivered: [commit details]
      ↓
Done! Perfect traceability

GITHUB ACTIONS WORKFLOW:
User posts: @claude add loading spinner
      ↓
GitHub Actions triggers
      ↓
Claude Code Action implements changes and commits
      ↓
Post-commit hook extracts @claude mention from GitHub API
      ↓
Posts formatted comment with GitHub mention as prompt
```

**Why This Works:**
- ✅ Captures actual prompts from Claude Code desktop (with hook)
- ✅ Fallback to GitHub mentions (without hook)
- ✅ Git history persists across sessions
- ✅ No stale data (all sources are current)
- ✅ Clear "request vs delivery" format
- ✅ Works for both local and CI/CD workflows

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
  │   ├─ auto-summary.sh       # Auto-generates comments from git + prompts
  │   └─ install-hooks.sh      # Installs git hooks
  ├─ hooks/
  │   ├─ post-summary.sh       # Manual comment posting (legacy)
  │   ├─ prompt-logger.js      # Captures prompts from Claude Code ⭐
  │   └─ templates/
  │       └─ post-commit       # Template for git post-commit hook
  ├─ prompt-history.json       # Captured prompts (auto-generated) ⭐
  └─ README.md                 # This file

.git/hooks/
  └─ post-commit               # Triggers auto-summary after commits

scripts/
  ├─ start-work.sh             # Initialize work on an issue
  ├─ parse-coverage.sh         # Parse test coverage
  └─ cleanup.sh                # Post-merge cleanup (if exists)

docs/dev-logs/                 # Detailed session logs per issue
```

**⭐ Key Files for Prompt Capture:**
- `.claude/hooks/prompt-logger.js` - Hook that captures your Claude Code prompts
- `.claude/prompt-history.json` - Where captured prompts are stored (auto-generated)

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
