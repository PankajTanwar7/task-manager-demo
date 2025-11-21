# Automation System - FAQ

## Q1: How does the script know which Issue/PR to post to?

**Answer:** The script extracts the issue number from your **current Git branch name**.

### How It Works:
```bash
# Current branch determines the issue number
feature/10-my-feature  → Posts to Issue #10
fix/25-bug-fix        → Posts to Issue #25
feature/100-new-api   → Posts to Issue #100
```

### Multiple Issues:
You can work on multiple issues by switching branches:

```bash
# Work on Issue #10
git checkout feature/10-task-one
./.claude/hooks/post-summary.sh "..." "..."  # → Posts to Issue #10

# Switch to Issue #15
git checkout feature/15-task-two
./.claude/hooks/post-summary.sh "..." "..."  # → Posts to Issue #15
```

**Key Point:** The script only posts to the issue matching your current branch name!

---

## Q2: Can I enable/disable the automation system?

**Answer:** Yes! Use the `DISABLE_AUTO_COMMENT` environment variable.

### Disable Automation:
```bash
# Temporarily disable (current terminal session)
export DISABLE_AUTO_COMMENT=true

# Now the script will exit immediately without posting
./.claude/hooks/post-summary.sh "..." "..."
# Output: ℹ️  Auto-commenting is disabled
```

### Enable Automation:
```bash
# Re-enable
unset DISABLE_AUTO_COMMENT

# Now it works normally
./.claude/hooks/post-summary.sh "..." "..."
# Output: ✓ Posted to Issue #10
```

### Permanently Disable (Add to ~/.bashrc or ~/.zshrc):
```bash
# Add this line to your shell config
export DISABLE_AUTO_COMMENT=true

# Reload shell
source ~/.bashrc
```

### Permanently Enable:
```bash
# Remove the line from ~/.bashrc or set to false
export DISABLE_AUTO_COMMENT=false
```

---

## Q3: What if I'm on a branch without an issue number?

**Answer:** The script will exit with an error:

```bash
# On branch "main" or "develop" (no issue number)
./.claude/hooks/post-summary.sh "..." "..."
# Output: ❌ No issue or PR found
```

**Solution:** Always work on feature branches with issue numbers:
- ✅ `feature/10-description`
- ✅ `fix/25-bug-name`
- ❌ `my-branch` (no issue number)

---

## Q4: Does the script post to both Issue AND PR?

**Answer:** It depends on whether a PR exists:

### Before PR Created:
- ✅ Posts to **Issue only**
- Format: 💬 Response #N
- Status: "Completed and committed locally (not pushed yet)"

### After PR Created:
- ✅ Posts to **BOTH Issue AND PR**
- Issue format: 💬 Response #N
- PR format: 🔄 Update #N
- Status: "Pushed to PR"

---

## Q5: How do response numbers work?

**Answer:** Each Issue and PR has **independent sequential numbering**:

### Example:
```
Issue #10:
  - 💬 Response #1
  - 💬 Response #2
  - 💬 Response #3

PR #11 (for Issue #10):
  - 🔄 Update #1
  - 🔄 Update #2
```

The counters are stored in `.claude/session-counter.json`:
```json
{
  "issue-10": 3,
  "pr-11": 2
}
```

---

## Q6: Can I test the script without posting to GitHub?

**Answer:** Yes! Use the disable flag:

```bash
# Disable posting
export DISABLE_AUTO_COMMENT=true

# Run the script (won't post)
./.claude/hooks/post-summary.sh "test" "test"

# Re-enable
unset DISABLE_AUTO_COMMENT
```

Or you can add a `--dry-run` flag (would need to modify the script).

---

## Q7: What happens if I run the script twice with the same content?

**Answer:** It will create duplicate comments with incrementing numbers:

```
💬 Response #1 (first run)
💬 Response #2 (second run - duplicate content)
```

**Recommendation:** Only run the script once per response/update.

---

## Q8: Can I edit a comment after posting?

**Answer:** Yes, but manually on GitHub:
1. Go to the Issue/PR on GitHub
2. Find the comment
3. Click "Edit" (three dots menu)
4. Make changes

The script doesn't support editing existing comments.

---

---

## Q9: Does it work with multiple PRs the same as multiple Issues?

**Answer:** YES! It works exactly the same way.

### How It Works:
The script finds the PR that matches your **current branch**:

```bash
# Line 39 in post-summary.sh:
PR_NUM=$(gh pr list --head "$BRANCH" --json number --jq '.[0].number')
```

### Example with Multiple PRs:
```bash
# Situation: Multiple open PRs
PR #11 (branch: feature/10-verify-automation)
PR #12 (branch: feature/15-add-auth)
PR #13 (branch: fix/20-bug-fix)

# Work on Issue #10
git checkout feature/10-verify-automation
./post-summary.sh "..." "..."
# → Posts to Issue #10 AND PR #11 ✅

# Switch to Issue #15
git checkout feature/15-add-auth
./post-summary.sh "..." "..."
# → Posts to Issue #15 AND PR #12 ✅

# Switch to Issue #20
git checkout fix/20-bug-fix
./post-summary.sh "..." "..."
# → Posts to Issue #20 AND PR #13 ✅
```

### Branch-Based Routing:

| Current Branch | Issue # | PR # | Posts To |
|----------------|---------|------|----------|
| `feature/10-verify-automation` | #10 | #11 | Issue #10 + PR #11 |
| `feature/15-add-auth` | #15 | #12 | Issue #15 + PR #12 |
| `fix/20-bug-fix` | #20 | #13 | Issue #20 + PR #13 |

**Key:** The branch determines everything!
- Issue number from branch name
- PR number from GitHub (which PR uses this branch)
- One branch = One issue = One PR (maximum)

---

## Q10: How do I enable test coverage reporting?

**Answer:** Coverage reporting is automatically enabled when coverage data is available.

### Enable Coverage:
```bash
# Run tests with coverage flag
npm test -- --coverage

# Or use the test:coverage script
npm run test:coverage
```

### How It Works:
1. Jest generates `coverage/coverage-summary.json` when you run tests with `--coverage`
2. The automation system detects this file automatically
3. Coverage section appears in your GitHub comments (Issues and PRs)
4. If coverage file doesn't exist, the section is silently skipped (no errors)

### What's Included:
- Overall coverage percentage (lines, statements, functions, branches)
- Files needing attention (<80% coverage)
- Well-covered files (≥80% coverage)
- Trend indicators (+/- from previous response)

### Example Output:
```markdown
### Test Coverage

<details>
<summary>86.01% overall coverage</summary>

**Files needing attention (<80%):**
- `src/middleware/errorHandler.js` - 42.85%
- `src/utils/logger.js` - 57.14%

**Well covered (≥80%):**
- `src/routes/tasks.js` - 100%
- `src/controllers/taskController.js` - 85.29%

**Overall Statistics:**
- Lines: 86.01% (123/143)
- Statements: 86.66% (130/150)
- Functions: 76.66% (23/30)
- Branches: 55.76% (29/52)
</details>
```

**Key Point:** No configuration needed - just run tests with `--coverage`!

---

## Q11: Why isn't my coverage showing up in comments?

**Answer:** Coverage section appears only when coverage data is **available and recent**.

### Common Reasons:

**1. Coverage Not Generated:**
```bash
# Wrong: no coverage generated
npm test

# Correct: generates coverage
npm test -- --coverage
```

**2. Coverage File Too Old:**
- Coverage must be generated within the last 24 hours
- Solution: Run tests with coverage again

**3. Wrong Project Setup:**
- Project must use Jest (or compatible test framework)
- `coverage/coverage-summary.json` must exist

### Troubleshooting:
```bash
# Check if coverage file exists
ls -la coverage/coverage-summary.json

# Check file age
stat coverage/coverage-summary.json

# Regenerate coverage
npm test -- --coverage

# Test coverage parsing
source scripts/parse-coverage.sh
parse_coverage_section ".claude/session-counter.json" "test" "1"
```

**Key Point:** Coverage is optional - if unavailable, comments work normally without it!

---

## Q12: How do I change the coverage threshold?

**Answer:** Use the `COVERAGE_THRESHOLD` environment variable (default: 80%).

### Change Threshold:
```bash
# Set threshold to 90%
export COVERAGE_THRESHOLD=90

# Now files below 90% will be listed as "needing attention"
./.claude/hooks/post-summary.sh "..." "..."

# Reset to default (80%)
unset COVERAGE_THRESHOLD
```

### Permanent Change:
Add to your `.bashrc` or `.zshrc`:
```bash
# ~/.bashrc
export COVERAGE_THRESHOLD=90
```

### How It Works:
- Files below threshold: Listed as "Files needing attention"
- Files at/above threshold: Listed as "Well covered"
- Default: 80% (industry standard)

### Examples:
```bash
# Strict (95%)
export COVERAGE_THRESHOLD=95

# Moderate (80%) - default
export COVERAGE_THRESHOLD=80

# Lenient (70%)
export COVERAGE_THRESHOLD=70
```

**Key Point:** The threshold only affects how files are categorized in the report!

---

## Summary

| Question | Answer |
|----------|--------|
| Which issue does it post to? | Current branch name (e.g., `feature/10-...` → Issue #10) |
| Which PR does it post to? | PR that uses your current branch |
| Can I disable it? | Yes: `export DISABLE_AUTO_COMMENT=true` |
| Does it post to both Issue & PR? | Yes, if PR exists for the branch |
| How are numbers tracked? | `.claude/session-counter.json` |
| Can I work on multiple issues? | Yes, switch branches |
| Can I work on multiple PRs? | Yes, switch branches - same as issues |
| How to enable coverage reporting? | Run `npm test -- --coverage` |
| Why isn't coverage showing? | Check coverage file exists and is <24h old |
| How to change coverage threshold? | Set `COVERAGE_THRESHOLD` env variable (default: 80) |

---

**Last Updated:** 2025-11-21
