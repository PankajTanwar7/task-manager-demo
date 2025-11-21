# Claude Code Development Workflow
**Single Source of Truth - Read this at the start of each session**

---

## Quick Reference

**Current Project:** Task Manager Demo API
**Main Branch:** `main`
**Branch Pattern:** `feature/{issue-number}--{description}` or `fix/{issue-number}--{description}`
**Test Command:** `npm test` (must pass before PR)
**Automation Script:** `./.claude/hooks/post-summary.sh`

---

## Complete Development Workflow

### 1. Start Work on an Issue

```bash
# Run the start-work script
./scripts/start-work.sh {issue-number}

# This automatically:
# - Creates feature branch: feature/{issue-number}--{description}
# - Switches to that branch
# - Ready to start coding
```

**Branch Naming:**
- ✅ `feature/16--feature-add-pagination-to-tas`
- ✅ `fix/25--fix-validation-error`
- ❌ `my-feature-branch` (no issue number)

---

### 2. Implementation Phase

**Standard Process:**

1. **Read Requirements** - Understand the issue/acceptance criteria
2. **Plan** - Use TodoWrite tool to track tasks if complex (3+ steps)
3. **Implement** - Write code following best practices
4. **Test** - Ensure all tests pass (`npm test`)
5. **Commit** - Detailed commit messages
6. **Post Comment** - Document progress on GitHub

**When to Post Comments:**

Post a comment after every **milestone commit**:
- ✅ Feature implementation completed
- ✅ Bug fix completed and tested
- ✅ Significant refactoring done
- ✅ Test suite updated and passing
- ❌ Don't post for tiny changes or WIP commits

---

### 3. Commit Standards

**Commit Message Format:**

```bash
{type}: {short description}

{detailed explanation}

**What Was Done:**
- Specific change 1
- Specific change 2

**Why:**
- Reasoning

**Files Modified:**
- file.js (what changed)

**Testing:**
- What was verified

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Commit Types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `improve:` - Enhancement to existing feature
- `refactor:` - Code restructuring
- `test:` - Test additions/updates
- `docs:` - Documentation only
- `chore:` - Build/config changes

**Example:**
```bash
git add .
git commit -m "$(cat <<'EOF'
feat: implement pagination for task list API

Implemented pagination with page/limit query params, validation,
and comprehensive test coverage.

**What Was Done:**
- Added Task.findAll(options) with pagination
- Created validatePagination middleware
- Updated controller with metadata calculation

**Why:**
- Users need to handle large task lists efficiently
- API should support standard pagination patterns

**Files Modified:**
- src/models/Task.js (pagination logic)
- src/middleware/validation.js (validatePagination)
- src/controllers/taskController.js (metadata)
- tests/tasks.test.js (14 new tests)

**Testing:**
- All 32 tests passing
- Verified backward compatibility

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

---

### 4. Post Progress Comments

**CRITICAL:** Always run after milestone commits!

```bash
./.claude/hooks/post-summary.sh \
  "What you asked Claude to do (specific, with context)" \
  "What was achieved (detailed, structured)"
```

**USER_PROMPT (Parameter 1):**
- ❌ Bad: "Implement pagination"
- ✅ Good: "Implement pagination for GET /api/tasks endpoint (Issue #16)"
- ✅ Better: "Fix critical bug in post-summary.sh preventing file list from appearing in GitHub comments"

**ACHIEVEMENT (Parameter 2):**

Must be detailed and structured. See template below.

**Achievement Template:**

```markdown
Brief one-line summary.

**What Was Built:**
1. Component 1 (file:lines)
   - Detail
   - Detail
2. Component 2 (file:lines)
   - Detail

**How It Works:**
[Explanation]

**Design Decisions:**
- Decision 1: Rationale
- Decision 2: Rationale

**Acceptance Criteria Addressed:**
✅ Criterion 1
✅ Criterion 2

**Files Modified:**
- file1.js (lines X-Y: what changed)
- file2.js (lines A-B: what changed)

**Testing:**
- Test results
- Verification steps

**Result:**
Final outcome and status.
```

**Example:**

```bash
./.claude/hooks/post-summary.sh \
  "Implement pagination for GET /api/tasks endpoint (Issue #16)" \
  "Implemented complete pagination system with backward compatibility.

**What Was Built:**
1. Model Layer (src/models/Task.js:32-60)
   - Modified Task.findAll() to accept pagination options
   - Added deterministic sorting (createdAt DESC, ID DESC)
   - Added Task.count() method

2. Validation Middleware (src/middleware/validation.js:186-217)
   - Created validatePagination with express-validator
   - Page: positive integer >= 1
   - Limit: 1-100 (max enforced for security)

3. Controller (src/controllers/taskController.js:81-125)
   - Calculates pagination metadata
   - Two response formats (with/without pagination)

**Acceptance Criteria:**
✅ Query params accepted
✅ Validation enforced
✅ Metadata returned
✅ All tests passing (32/32)

**Testing:**
- All 32 tests passing
- 14 new pagination tests added

**Result:**
Feature complete and ready for PR."
```

**Comment Quality Checklist:**
- [ ] Specific file names and line numbers included
- [ ] Explained WHY, not just WHAT
- [ ] Listed acceptance criteria addressed
- [ ] Included testing information
- [ ] Structured with headings/bullets
- [ ] Would be useful to read in 6 months

📖 **Detailed Guide:** See `COMMENT-WRITING-GUIDE.md` for extensive examples

---

### 5. Posted Comment Structure

The script automatically creates:

```markdown
## ClaudeCode Response #N

Time: YYYY-MM-DD HH:MM

---

### Request
{USER_PROMPT}

---

### Response
{ACHIEVEMENT}

---

### Test Coverage (if available)
[Coverage statistics]

---

### Files Changed in this Response
1 files
- .claude/hooks/post-summary.sh

---

### All Files Changed in this Branch
Total: 8 files
- [all files listed]

---

### Commits in this Branch
[All commits]

---

**Status:** Implementation completed and committed locally (not pushed yet)
```

**Posting Logic:**
- If PR exists → Posts to **PR ONLY** (PR takes precedence)
- If no PR → Posts to **Issue**
- Never posts to both simultaneously

---

### 6. Create Pull Request

**When to create PR:**
- Feature fully implemented and tested
- All acceptance criteria met
- All tests passing
- Comments documenting progress posted

**Command:**

```bash
# Create PR with comprehensive description
gh pr create --title "feat: add pagination to task list API (Issue #16)" --body "$(cat <<'EOF'
## Summary
- Implemented pagination for GET /api/tasks endpoint
- Added query parameters: page, limit
- Includes validation, metadata, and comprehensive tests

## Implementation Details
[List key components built]

## Acceptance Criteria
✅ All 10 acceptance criteria met

## Testing
- 32/32 tests passing
- 14 new pagination tests added
- Coverage: 86.01%

## Design Decisions
[Key architectural choices]

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

**After PR created:**
- Future comments go to **PR only** (not Issue)
- Continue iterating based on review feedback

---

### 7. Cleanup After Merge

```bash
# Run cleanup script (switches to main, pulls, deletes branch)
./scripts/cleanup-after-merge.sh
```

**What it does:**
1. Switches to main branch
2. Pulls latest changes
3. Deletes feature branch locally

---

## Automation System

### How It Works

**Branch → Issue/PR Mapping:**

The script extracts the issue number from your current branch name:
```
feature/16--description → Posts to Issue #16
feature/25--description → Posts to Issue #25
```

**Multiple Issues:**
Switch branches to work on different issues:
```bash
git checkout feature/10-task-one
./.claude/hooks/post-summary.sh "..." "..."  # → Posts to Issue #10

git checkout feature/15-task-two
./.claude/hooks/post-summary.sh "..." "..."  # → Posts to Issue #15
```

**Session Tracking:**

Counters stored in `.claude/session-counter.json`:
```json
{
  "issue-16": 3,
  "pr-11": 2
}
```

Each Issue and PR has independent sequential numbering.

### Enable/Disable Automation

```bash
# Disable
export DISABLE_AUTO_COMMENT=true

# Enable
unset DISABLE_AUTO_COMMENT
```

📖 **Detailed Guide:** See `AUTOMATION-FAQ.md` for complete Q&A

---

## Git Workflow

### Files to Ignore

These are automatically ignored (`.gitignore`):
- `.claude/session-counter.json` - Local session tracking
- `.claude-prompt-*.md` - Conversation logs
- `docs/dev-logs/` - Development logs

**Never commit these!** They're local-only files.

### Working Tree Management

**Before committing:**
```bash
git status  # Should be clean or only show intended changes
```

**If you see unexpected files:**
- Session counter, prompt logs → Already ignored, safe to skip
- Other files → Verify they should be committed

### Push Timing

**Before PR:**
- Work locally, commit often
- Don't push to remote yet
- Post comments to Issue

**After PR created:**
- Push changes to remote
- Comments now go to PR
- Continue iterating

---

## Testing Requirements

### Before Every Commit

```bash
npm test
```

**Must pass:** All tests must pass before committing.

**If tests fail:**
1. Fix the issues
2. Re-run tests
3. Only commit when green

### Test Coverage

```bash
# Run with coverage
npm test -- --coverage
```

Coverage data automatically included in comments if available.

**Thresholds:**
- Target: 80%+ coverage
- Files below 80% flagged in comments

---

## Common Commands Quick Reference

```bash
# Start work
./scripts/start-work.sh {issue-number}

# Check status
git status

# Run tests
npm test

# Commit (use heredoc for long messages)
git add .
git commit -m "$(cat <<'EOF'
{detailed commit message}
EOF
)"

# Post comment
./.claude/hooks/post-summary.sh \
  "Request description" \
  "Achievement details"

# Create PR
gh pr create --title "..." --body "..."

# Cleanup after merge
./scripts/cleanup-after-merge.sh
```

---

## Common Issues & Solutions

### Issue: Cleanup script fails with uncommitted files

**Symptoms:**
```
error: cannot pull with rebase: You have unstaged changes.
.claude/session-counter.json
.claude-prompt-issue-16.md
docs/dev-logs/issue-16.md
```

**Solution:**
These files are already in `.gitignore`. Just commit your actual work:
```bash
git add {your-actual-files}
git commit -m "..."
```

The ignored files won't cause issues - they're local only.

### Issue: File list not appearing in GitHub comments

**Symptoms:**
Comment shows "8 files modified" but list is empty.

**Solution:**
This was a bash subshell bug, now fixed in post-summary.sh.
If you encounter this, it means you're on an old version of the script.

### Issue: Tests failing

**Symptoms:**
```
npm test
# Some tests fail
```

**Solution:**
1. Read the error messages carefully
2. Fix the failing tests or code
3. Re-run tests
4. Only commit when all pass

### Issue: Can't determine which issue to post to

**Symptoms:**
```
❌ No issue or PR found
```

**Solution:**
Your branch name doesn't match the pattern. Must be:
- `feature/{number}--{description}`
- `fix/{number}--{description}`

Check: `git branch --show-current`

---

## File Structure Reference

```
task-manager-demo/
├── .claude/
│   ├── WORKFLOW.md              ← YOU ARE HERE (single source of truth)
│   ├── hooks/
│   │   └── post-summary.sh      ← Automation script
│   └── session-counter.json     ← Local only (gitignored)
├── .github/
│   ├── README.md                ← GitHub integration overview
│   ├── claude.yml               ← GitHub @claude config
│   └── ISSUE_TEMPLATE/          ← Issue templates
├── scripts/
│   ├── start-work.sh            ← Start work on issue
│   └── cleanup-after-merge.sh   ← Cleanup after PR merge
├── src/                         ← Application code
├── tests/                       ← Test files
├── AUTOMATION-FAQ.md            ← Detailed automation Q&A
├── COMMENT-WRITING-GUIDE.md     ← Comment examples & templates
└── SETUP-COMPLETE.md            ← Initial setup documentation
```

---

## Best Practices

### DO:
✅ Read this file at the start of each session
✅ Run tests before every commit
✅ Post detailed comments after milestone commits
✅ Use TodoWrite for complex tasks (3+ steps)
✅ Follow commit message format
✅ Reference specific files and line numbers in comments
✅ Explain WHY, not just WHAT
✅ Keep working tree clean

### DON'T:
❌ Skip testing before commits
❌ Write one-sentence comments
❌ Commit without running post-summary.sh (after milestones)
❌ Create PRs with failing tests
❌ Push before creating PR
❌ Commit .claude/session-counter.json or prompt logs
❌ Use vague commit messages

---

## Checklist: Before Creating PR

- [ ] All acceptance criteria met
- [ ] All tests passing (32/32 or more)
- [ ] Code follows project conventions
- [ ] Detailed comments posted documenting progress
- [ ] Commit messages are detailed and clear
- [ ] No uncommitted changes in working tree
- [ ] No temporary/local files staged
- [ ] Ready for code review

---

## When in Doubt

1. **Check this file first** (single source of truth)
2. **For automation details:** See `AUTOMATION-FAQ.md`
3. **For comment examples:** See `COMMENT-WRITING-GUIDE.md`
4. **For git issues:** Check `.gitignore` and working tree status
5. **For testing:** Run `npm test` and verify all pass

---

**Last Updated:** 2025-11-21
**Version:** 1.0
**Maintainer:** This workflow is maintained and updated as improvements are discovered.
