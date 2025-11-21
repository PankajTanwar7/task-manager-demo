# 🎯 How to Use GitHub Automation

## ✅ New Improved System

**Post ONE comprehensive summary when your work is DONE** (not after every commit)

---

## 📝 Workflow

### 1. Create Branch with Issue Number
```bash
git checkout -b feature/123-your-feature
```

### 2. Work on Your Task
```bash
# Make changes, commit as many times as needed
git add .
git commit -m "feat: add feature"
git commit -m "fix: bug fix"
git commit -m "test: add tests"
# ... multiple commits OK
```

### 3. When DONE, Post Summary
```bash
./.claude/hooks/post-summary.sh \
  "Your prompt: What you asked Claude to do" \
  "Achievement: What was actually done"
```

**Example:**
```bash
./.claude/hooks/post-summary.sh \
  "Add user authentication with JWT tokens" \
  "Implemented JWT auth with login/register endpoints, middleware for protected routes, and bcrypt password hashing. Added 15 tests. All passing."
```

---

## 📊 What Gets Posted

### Format (Both Issue & PR):

```markdown
## 🔄 Iteration 1

**Time:** 2025-11-21 11:18 (~64m)

### 📝 Request
```
Add comprehensive JSDoc comments throughout the codebase
```

### ✅ What Was Added

Added JSDoc to 9 source files and 2 test files.
Includes module-level docs, function-level JSDoc with
parameters, inline comments for complex logic.
Total: 460+ lines of documentation. All 19 tests passing.

### 📁 Files Changed (25 files)
- `src/server.js`
- `src/app.js`
- `src/controllers/taskController.js`
... (shows up to 15 files)

### 📊 Summary
- **Files changed:** 25
- **Commits:** 5
- **Duration:** ~64m

**Commits:**
6bd99be feat: complete automated system
e44cd24 feat: add automation
e7584c5 feat: add JSDoc comments
```

---

## 🎯 Key Differences from Old System

| Old System | New System |
|------------|------------|
| ❌ Posts after EVERY commit | ✅ Post ONCE when done |
| ❌ Redundant session comments | ✅ One comprehensive summary |
| ❌ Repeats commit messages | ✅ Meaningful descriptions |
| ❌ Automatic (annoying) | ✅ Manual trigger (control) |
| ❌ No context | ✅ Full context + achievement |

---

## 💡 Tips

### Good Prompts:
✅ "Add user authentication with JWT"
✅ "Implement file upload functionality"
✅ "Fix memory leak in data processor"

### Good Achievements:
✅ "Added JWT auth with login/register/logout. Includes middleware, tests, and password hashing. 12 tests passing."
✅ "Implemented S3 file uploads with progress tracking and error handling. Added validation and tests."
✅ "Fixed memory leak by properly closing database connections. Reduced memory usage by 60%."

### Bad Examples (too vague):
❌ Prompt: "fix stuff"
❌ Achievement: "made changes"

---

## 🔧 Script Location

**Main script:** `.claude/hooks/post-summary.sh`

**Usage:**
```bash
# Option 1: With arguments (recommended)
./.claude/hooks/post-summary.sh "prompt" "achievement"

# Option 2: Interactive (will ask you)
./.claude/hooks/post-summary.sh
# Then type when prompted
```

---

## ❓ FAQ

### Q: Do I need to post after every commit?
**A:** No! Make as many commits as you want, then post ONE summary when done.

### Q: What if I forget to post?
**A:** Just run the script later - it looks at all commits in your branch.

### Q: Can I edit the comment after posting?
**A:** Yes, go to GitHub and edit the comment manually.

### Q: What if I'm not done but want to post progress?
**A:** You can post multiple times - each gets a new iteration number (Iteration 1, 2, 3...).

### Q: How does it know what files changed?
**A:** Compares your branch against `main` branch automatically.

---

## 🎉 Summary

1. Work normally (commit as much as you want)
2. When done, run: `./.claude/hooks/post-summary.sh`
3. Provide prompt and achievement
4. ✅ Posted to GitHub!

**Much better than posting after every commit!**

---

**Created:** 2025-11-21
**Status:** ✅ Production Ready
