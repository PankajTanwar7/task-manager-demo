---
name: Bug Fix
about: Report and track bug fixes (works with @claude + Claude Code workflow)
title: "[BUG] "
labels: bug
assignees: ''
---

## 🐛 Bug Description
<!-- Clear description of the bug -->



## 🔄 Steps to Reproduce
1.
2.
3.

## ✅ Expected Behavior
<!-- What should happen -->


## ❌ Actual Behavior
<!-- What actually happens -->


## 📊 Error Logs/Screenshots
<!-- Paste error messages or screenshots -->
```
[paste error logs here]
```

## 🏗️ Root Cause Analysis (@claude)
<!-- Tag @claude to help investigate -->

@claude Can you help identify the root cause?

**Relevant context:**
- Files involved:
- Recent changes:
- Environment:

## 🔧 Proposed Solution
<!-- @claude will suggest solution here -->


## 📁 Files to Fix
<!-- List files that need changes -->
- `path/to/file.js`

---

## ✅ Workflow Checklist

### Phase 1: Investigation (GitHub @claude)
- [ ] Root cause identified with @claude
- [ ] Solution approach agreed upon
- [ ] Edge cases considered

### Phase 2: Fix (Claude Code)
- [ ] Create branch: `fix/{issue-number}-{short-name}`
- [ ] Implement fix using Claude Code
- [ ] Add regression tests
- [ ] Verify fix locally

### Phase 3: Review & Deploy
- [ ] Create PR
- [ ] Team review
- [ ] Merge & auto-close issue

---

**🤖 Claude Code Prompt Template:**
```
Fix bug from GitHub issue #{issue-number}.

Root cause (from @claude analysis):
[Copy analysis from above]

Solution approach:
[Copy proposed solution]

Files to fix:
[Copy from "Files to Fix" section]

Please:
1. Implement the fix
2. Add regression test to prevent recurrence
3. Verify existing tests still pass
4. Commit with proper message
```
