# Quick Start Guide - Automation Workflow

**Get started with the Claude Code automation system in 5 minutes.**

---

## 🚀 One-Time Setup (5 minutes)

### Step 1: Install Git Hooks
```bash
cd /path/to/task-manager-demo
./.claude/scripts/install-hooks.sh
```

**Output:**
```
✓ Installed: .git/hooks/post-commit
✓ Hook is executable
✓ Installation complete!
```

### Step 2: Verify Installation
```bash
ls -la .git/hooks/post-commit
# Should show: -rwx--x--x ... post-commit
```

✅ **Setup Complete!** You're ready to use the automation.

---

## 📋 Daily Workflow (5 commands)

### 1. Pick an Issue
```bash
gh issue list
# Pick an issue number, e.g., 27
```

### 2. Start Work
```bash
./scripts/start-work.sh 27
```

### 3. Work with Claude Code
```
You: "Add feature X"
Claude Code: *implements, commits*
🤖 Automatic comment posted to Issue #27!
```

### 4. Push Changes
```bash
git push
```

### 5. Create PR
```bash
gh pr create --fill
# Future commits now post to PR instead of Issue!
```

✅ **That's it!** Zero manual comment posting required.

---

## 💬 Prompt Capture Options

Choose one method to capture your actual prompts:

### Option A: @claude Mentions (Easiest)

**No setup required!** Just mention @claude in issue/PR comments:

```bash
# In Issue #27, post a comment:
"@claude add error handling to the login endpoint"

# Then work on it and commit
# Auto-comment will show:
# 💬 Actual Prompt
# > add error handling to the login endpoint
```

### Option B: Prompt Logger Hook (Best for Local Dev)

**One-time setup:**

1. Find your Claude Code settings file:
   - Linux: `~/.config/claude-code/settings.json`
   - Mac: `~/Library/Application Support/claude-code/settings.json`
   - Windows: `%APPDATA%/claude-code/settings.json`

2. Add this config:
```json
{
  "hooks": {
    "UserPromptSubmit": {
      "command": "/absolute/path/to/task-manager-demo/.claude/hooks/prompt-logger.js"
    }
  }
}
```

3. Make hook executable:
```bash
chmod +x .claude/hooks/prompt-logger.js
```

4. Test it:
   - Give Claude Code a prompt
   - Check `.claude/prompt-history.json`
   - Should see new entry!

**Result:** Every prompt automatically captured and included in GitHub comments.

---

## 📊 What You Get Automatically

### On Every Commit:

```markdown
## ClaudeCode Response #1

Time: 2025-11-22 10:30

---

### 💬 Actual Prompt
> Your prompt here (if captured)

---

### ✅ What Was Delivered
[Your full commit message]

**Changes:** 3 files changed, 45 insertions(+)

---

### 📁 Files Changed
<details>
<summary>3 files</summary>

- `src/app.js`
- `src/routes/hello.js`
- `tests/hello.test.js`

</details>

---

**Status:** Work in progress
```

---

## 🔧 Common Tasks

### Disable Auto-Comments (When Experimenting)
```bash
export DISABLE_AUTO_COMMENT=true

# Experiment freely
git commit -m "test: trying something"

# Re-enable
unset DISABLE_AUTO_COMMENT
```

### Manual Comment (If Needed)
```bash
./.claude/hooks/post-summary.sh \
  "What you requested" \
  "What was delivered"
```

### View Recent Comments
```bash
# For issues
gh issue view 27

# For PRs
gh pr view 28
```

### Check Hook Status
```bash
# See if hook runs
git log -1 --pretty=format:"%h %s"

# Should see output like:
# ℹ  Auto-generating GitHub comment...
# ✓ Posted to Issue #27 (Response #1)
```

---

## 🐛 Troubleshooting

### Problem: Hook Not Running

**Check if installed:**
```bash
ls -la .git/hooks/post-commit
```

**Reinstall:**
```bash
./.claude/scripts/install-hooks.sh
```

### Problem: No Comments Posted

**Check GitHub authentication:**
```bash
gh auth status
```

**Check branch name:**
```bash
git branch --show-current
# Should contain issue number: feature/27-description
```

### Problem: Wrong Issue Number

**Branch naming is important:**
```bash
# ✅ Good
feature/27-add-feature
fix/42-bug-fix

# ❌ Bad
my-feature-branch
```

### Problem: "jq: command not found"

**Install jq:**
```bash
# Ubuntu/Debian
sudo apt-get install jq

# Mac
brew install jq

# Verify
jq --version
```

---

## 📚 Examples

### Example 1: Simple Feature
```bash
# Start
./scripts/start-work.sh 30

# Work
# Claude Code implements feature, commits
# 🤖 Response #1 posted

git push

# Create PR
gh pr create --fill
```

### Example 2: Multiple Commits
```bash
# Start
./scripts/start-work.sh 31

# Work - Commit 1
# 🤖 Response #1 posted

# Work - Commit 2
# 🤖 Response #2 posted

# Work - Commit 3
# 🤖 Response #3 posted

git push
gh pr create --fill

# More work - Commit 4
# 🤖 Update #1 posted to PR (not issue!)
```

### Example 3: With @claude Mentions
```bash
# Start
./scripts/start-work.sh 32

# Comment on Issue #32:
"@claude add logging to the authentication system"

# Work and commit
# 🤖 Response #1 with prompt: "add logging to the authentication system"
```

---

## 🎯 Best Practices

### 1. Write Clear Commit Messages
```bash
# ❌ Bad
git commit -m "fix stuff"

# ✅ Good
git commit -m "fix: handle null values in user authentication

Added null checks to prevent crashes when user data is incomplete.
Updated tests to cover edge cases.

Files modified:
- src/auth/validator.js
- tests/auth.test.js"
```

### 2. Commit Logical Changes
- One feature/fix per commit
- Smaller commits = better tracking
- Each commit gets its own comment

### 3. Use @claude Mentions
- Document your intent in GitHub
- Team sees what you're working on
- Prompts automatically captured

### 4. Review Auto-Comments
- Check GitHub after committing
- Verify summary makes sense
- Improve commit messages if needed

---

## 🚀 Next Level

Once comfortable with basics, explore:

1. **Set up prompt logger hook** - Automatic prompt capture
2. **Use GitHub Actions** - Automate even more
3. **Team collaboration** - Share workflow with team
4. **Custom hooks** - Extend the system

---

## 📞 Support

- **Full Documentation:** `.claude/README.md`
- **Test Report:** `docs/AUTOMATION-WORKFLOW-TEST-RESULTS.md`
- **GitHub Issues:** https://github.com/PankajTanwar7/task-manager-demo/issues

---

**Last Updated:** 2025-11-22
**Status:** ✅ Production Ready
**Version:** 2.0
