# Automated GitHub Commenting System

## 🎯 Purpose

This system automatically posts session summaries to GitHub Issues and PRs after each commit, **WITHOUT relying on Claude Code hooks** (which currently don't fire in this environment).

## ✅ What's Automated

After every `git commit`:
1. ✅ Extracts commit details (message, hash, changed files)
2. ✅ Determines session number (auto-incremented)
3. ✅ Posts formatted comment to linked GitHub Issue
4. ✅ Posts formatted comment to linked GitHub PR
5. ✅ Includes timing, file changes, and commit info

## 🚀 How It Works

### System Components

```
Git Commit Triggered
    ↓
.git/hooks/post-commit (Git hook)
    ↓
.claude/hooks/auto-commenter.sh (Main script)
    ↓
Extracts: Branch → Issue # → PR #
    ↓
Generates formatted comments
    ↓
Posts to GitHub (using gh CLI)
```

### Files Involved

1. **`.git/hooks/post-commit`** - Git hook that triggers after every commit
2. **`.claude/hooks/auto-commenter.sh`** - Main automation script
3. **`.claude/session-counter.json`** - Tracks session numbers per issue/PR

## 📝 Usage

### Automatic (Recommended)

Just commit normally - the system handles everything:

```bash
git add .
git commit -m "feat: add new feature (#8)"
# ✓ Automatically posts to Issue #8 and PR (if exists)
```

### Manual Trigger

If you want to post a comment without committing:

```bash
./.claude/hooks/auto-commenter.sh "Your task description here"
```

## 🔧 Configuration

### Branch Naming Convention

The system extracts issue numbers from branch names:

**Supported patterns:**
- `feature/123-description` → Issue #123
- `fix/456-bug-fix` → Issue #456
- `issue/789` → Issue #789
- `refactor/101-cleanup` → Issue #101
- `chore/202-update` → Issue #202

**Examples:**
```bash
git checkout -b feature/10-add-auth
# Commits will post to Issue #10

git checkout -b fix/25-security-patch
# Commits will post to Issue #25
```

### Commit Message Format

The system extracts the task description from your commit message:

**Pattern:** `type: description (#issue)`

**Examples:**
```bash
git commit -m "feat: add user authentication (#10)"
# Posts: "add user authentication"

git commit -m "fix: resolve memory leak in parser (#25)"
# Posts: "resolve memory leak in parser"

git commit -m "docs: update API documentation (#30)"
# Posts: "update API documentation"
```

### Session Numbering

Sessions are auto-incremented per Issue/PR:

```json
{
  "issue-8": 3,    // Issue #8 has 3 sessions
  "pr-9": 2        // PR #9 has 2 iterations
}
```

Stored in: `.claude/session-counter.json`

## 📊 Comment Format

### Issue Comment Format

```markdown
## 💻 Claude Code Session 1

**Time:** 2025-11-21 05:45:28 | **Duration:** 21m

### 📝 Your Request
```
add automatic GitHub commenting system
```

### 🎯 What Was Accomplished

Commit: `e44cd24` - feat: add automatic GitHub commenting system

### 📁 Files Changed (3 files)

- `.claude/hooks/auto-commenter.sh`
- `.git/hooks/post-commit`
- `.claude/session-counter.json`

### 📊 Summary

- **Files changed:** 3
- **Duration:** 21m
- **Commit:** `e44cd24`

---
*🤖 Automated update from Claude Code (manual trigger)*
```

### PR Comment Format

```markdown
## 🔄 Iteration 1

**Time:** 2025-11-21 05:45:28 (21m)

### 📝 Request
```
add automatic GitHub commenting system
```

### ✅ What Was Done

**Commit:** `e44cd24` - feat: add automatic GitHub commenting system

**Files Modified (3):**
- `.claude/hooks/auto-commenter.sh`
- `.git/hooks/post-commit`
- `.claude/session-counter.json`

---
*Session 1 • Auto-generated (manual trigger)*
```

## 🐛 Troubleshooting

### "No issue or PR found"

**Problem:** Script can't find issue/PR from branch name

**Solution:**
1. Check branch naming: `git branch --show-current`
2. Rename branch: `git branch -m feature/123-your-description`
3. Or create branch correctly: `git checkout -b feature/123-desc`

### "Failed to post to GitHub"

**Problem:** GitHub CLI authentication issue

**Solution:**
```bash
# Check auth status
gh auth status

# Re-authenticate if needed
gh auth login
```

### "Session counter not updating"

**Problem:** Permission issue with session-counter.json

**Solution:**
```bash
chmod 666 .claude/session-counter.json
```

### Hook not executing

**Problem:** Git hook not executable

**Solution:**
```bash
chmod +x .git/hooks/post-commit
chmod +x .claude/hooks/auto-commenter.sh
```

## 🔍 Debugging

### Enable Verbose Output

Edit `.git/hooks/post-commit` and add debug flag:

```bash
#!/bin/bash
set -x  # Add this line
# ... rest of script
```

### Check Hook Execution

```bash
# Test the hook manually
.git/hooks/post-commit

# Test auto-commenter directly
./.claude/hooks/auto-commenter.sh "test description"
```

### View Session Data

```bash
# Check current session numbers
cat .claude/session-counter.json | jq .

# View last git commit
git log -1 --oneline

# Check changed files
git diff --name-only HEAD~1..HEAD
```

## 📚 Advanced Usage

### Customize Comment Template

Edit `.claude/hooks/auto-commenter.sh` and modify the `ISSUE_COMMENT` or `PR_COMMENT` variables.

### Skip Auto-Posting

Use `--no-verify` flag to skip hooks:

```bash
git commit -m "WIP: work in progress" --no-verify
```

### Manual Session Number Reset

```bash
# Reset all sessions
echo '{}' > .claude/session-counter.json

# Reset specific issue
jq 'del(.["issue-8"])' .claude/session-counter.json > tmp.json
mv tmp.json .claude/session-counter.json
```

## 🎓 Why This Exists

**Original Plan:** Use Claude Code's built-in hook system
- Configured in `.claude/settings.json`
- `UserPromptSubmit` and `PostToolUse` events
- Should fire automatically during Claude Code sessions

**Reality:** Claude Code hooks don't fire in this environment
- Hooks are configured correctly
- Scripts work when tested manually
- But Claude Code never calls them during tool execution

**Solution:** Git-based automation
- Uses Git's post-commit hook (always works)
- Extracts info from commits (reliable)
- Posts to GitHub after each commit (predictable)

## ✨ Benefits

✅ **Fully Automatic** - No manual action needed
✅ **Always Works** - Git hooks are reliable
✅ **Complete Tracking** - Every commit logged
✅ **Issue + PR** - Posts to both automatically
✅ **Session Numbers** - Auto-incremented per issue/PR
✅ **Rich Context** - Includes files, timing, commits

## 🔗 Related Files

- **Main Script:** `.claude/hooks/auto-commenter.sh`
- **Git Hook:** `.git/hooks/post-commit`
- **Session Data:** `.claude/session-counter.json`
- **Config (unused):** `.claude/settings.json` (for future when hooks work)

## 📞 Support

If the automation stops working:

1. Check GitHub CLI is authenticated: `gh auth status`
2. Verify hook is executable: `ls -la .git/hooks/post-commit`
3. Test manually: `./.claude/hooks/auto-commenter.sh "test"`
4. Check branch naming follows pattern
5. Review troubleshooting section above

---

**Last Updated:** 2025-11-21
**Status:** ✅ Production Ready
