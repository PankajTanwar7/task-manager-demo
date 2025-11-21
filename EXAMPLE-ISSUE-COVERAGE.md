# Example Issue: Add Test Coverage Reporting

**Copy this content when creating the issue on GitHub**

---

**Title:**
```
[FEATURE] Add test coverage reporting to automation system
```

**Body:**

```markdown
## 📋 Feature Description

Add automated test coverage reporting to the GitHub automation system. When `post-summary.sh` posts comments to Issues/PRs, it should include a test coverage section showing overall coverage percentage and highlighting files that need more test coverage.

This provides immediate visibility into test coverage without manual reports and creates a historical record of coverage improvements.

## 🎯 Acceptance Criteria

- [ ] Coverage report generated when tests are run
- [ ] Coverage percentage included in post-summary.sh GitHub comments
- [ ] Files with <80% coverage are highlighted in a list
- [ ] Coverage section uses collapsible `<details>` tag (consistent with existing format)
- [ ] Works for both Issue comments (Response #N) and PR comments (Update #N)
- [ ] Gracefully handles projects without coverage configured (skips section)
- [ ] No breaking changes to existing automation functionality

## 💡 Design Questions

**Questions to consider:**
1. Should we parse coverage from stdout or from coverage files (coverage/lcov.info)?
2. How to detect if coverage data is available vs. not configured?
3. Should we store/compare coverage between runs to show trends?
4. What's the threshold for "needs attention" (suggesting 80%)?

**Technical constraints:**
- Tech stack: Bash scripting (post-summary.sh is bash)
- Performance requirements: Should add <2 seconds to post-summary.sh execution
- Security considerations: Don't expose sensitive paths or internal logic
- Compatibility requirements: Must work with npm/jest coverage (this project uses npm test)

## 📝 Additional Context

**Example format in comments:**

```markdown
### Test Coverage

<details>
<summary>85.2% overall coverage</summary>

**Files needing attention (<80%):**
- `src/auth/jwt.js` - 72% coverage
- `src/middleware/auth.js` - 65% coverage

**Well covered (≥80%):**
- `src/routes/auth.js` - 95% coverage
- `tests/auth.test.js` - 100% coverage
</details>
```

**Estimated files to change:**
- `.claude/hooks/post-summary.sh` - Main coverage logic
- `scripts/parse-coverage.sh` (NEW) - Helper script (optional)
- Documentation updates (workflow examples)

**Benefits:**
- Immediate visibility into test coverage
- Identifies gaps in testing
- Encourages better test practices
- Historical coverage tracking

---

## 🚀 Implementation Workflow

**This issue will be implemented using Claude Code CLI:**

1. **Start:** Run `./scripts/start-work.sh {issue-number}`
2. **Implement:** Work with Claude Code in terminal (local commits)
3. **Document:** Claude posts progress to this issue
4. **Review:** Create PR when ready
5. **Merge:** Complete and auto-closes this issue

**Note:** Do NOT tag or mention any automation tools in this issue - they will be invoked manually via scripts.
```

---

## 🚫 DO NOT Include:

- ❌ `@claude` mentions anywhere
- ❌ "Tag @claude here" instructions
- ❌ References to GitHub automation bots
- ❌ Any triggers for automatic responses

## ✅ This Format:

- ✅ Clean requirements without automation triggers
- ✅ Clear acceptance criteria
- ✅ Design questions for manual consideration
- ✅ Workflow instructions pointing to scripts
- ✅ Explicit note about manual invocation
