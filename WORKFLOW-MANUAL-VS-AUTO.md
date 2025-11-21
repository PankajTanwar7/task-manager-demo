# Complete Workflow: Manual vs Automated

**Last Updated:** 2025-11-21

---

## Visual Workflow

```
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 1: YOU (Manual) - Create GitHub Issue                         │
│                                                                     │
│ On GitHub website:                                                  │
│   • Click "New Issue"                                               │
│   • Title: "Add user authentication"                               │
│   • Description: Requirements, acceptance criteria                  │
│   • Submit → Creates Issue #10                                      │
└─────────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 2: YOU (Manual) - Run Start Script                            │
│                                                                     │
│ In terminal:                                                        │
│   $ ./scripts/start-work.sh 10                                     │
│                                                                     │
│ Script automatically:                                               │
│   ✓ Fetches Issue #10 from GitHub                                  │
│   ✓ Creates branch: feature/10-add-user-authentication             │
│   ✓ Generates prompt file: .claude-prompt-issue-10.md              │
│   ✓ Displays prompt for you to copy                                │
└─────────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 3: YOU (Manual) - Give Prompt to Claude                       │
│                                                                     │
│ Copy and paste to Claude Code:                                     │
│   "Implement user authentication with JWT tokens, bcrypt           │
│    password hashing, and protect routes with middleware..."        │
└─────────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 4: CLAUDE (Automated) - Implementation                        │
│                                                                     │
│ Claude automatically:                                               │
│   ✓ Reads codebase                                                 │
│   ✓ Creates/modifies files:                                        │
│     - src/auth/jwt.js                                              │
│     - src/middleware/auth.js                                       │
│     - src/routes/auth.js                                           │
│     - tests/auth.test.js                                           │
│   ✓ Makes commits (local only):                                    │
│     - abc123 feat: add JWT token generation                        │
│     - def456 feat: add authentication middleware                   │
│     - ghi789 test: add auth tests                                  │
└─────────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 5: CLAUDE (Manual Trigger) - Post to GitHub                   │
│                                                                     │
│ Claude runs:                                                        │
│   $ ./.claude/hooks/post-summary.sh \                              │
│       "Add user authentication with JWT" \                         │
│       "Implemented JWT auth with login/register endpoints..."      │
│                                                                     │
│ Script automatically:                                               │
│   ✓ Detects branch: feature/10-add-user-authentication             │
│   ✓ Extracts issue number: 10                                      │
│   ✓ Collects commits since main                                    │
│   ✓ Lists changed files                                            │
│   ✓ Posts formatted comment to Issue #10                           │
│                                                                     │
│ GitHub Issue #10 now shows:                                        │
│   ┌───────────────────────────────────────────────────────────┐   │
│   │ ## ClaudeCode Response #1                                 │   │
│   │                                                            │   │
│   │ ```                                                        │   │
│   │ Time: 2025-11-21 14:30                                    │   │
│   │ ```                                                        │   │
│   │                                                            │   │
│   │ ### Request                                                │   │
│   │ ```                                                        │   │
│   │ Add user authentication with JWT                          │   │
│   │ ```                                                        │   │
│   │                                                            │   │
│   │ ### Response                                               │   │
│   │                                                            │   │
│   │ Implemented JWT auth with login/register endpoints,       │   │
│   │ bcrypt password hashing, auth middleware for protected    │   │
│   │ routes. All 12 tests passing.                             │   │
│   │                                                            │   │
│   │ ### Files Changed                                          │   │
│   │ <details>                                                  │   │
│   │ <summary>8 files modified</summary>                       │   │
│   │ - src/auth/jwt.js                                         │   │
│   │ - src/middleware/auth.js                                  │   │
│   │ - src/routes/auth.js                                      │   │
│   │ - tests/auth.test.js                                      │   │
│   │ ...                                                        │   │
│   │ </details>                                                 │   │
│   │                                                            │   │
│   │ ### Commits                                                │   │
│   │ ```                                                        │   │
│   │ abc123 feat: add JWT token generation                     │   │
│   │ def456 feat: add authentication middleware                │   │
│   │ ghi789 test: add auth tests                               │   │
│   │ ```                                                        │   │
│   │                                                            │   │
│   │ Status: Implementation completed and committed locally    │   │
│   │ (not pushed yet)                                           │   │
│   │                                                            │   │
│   │ <sub>Response #1 - Auto-generated by ClaudeCode</sub>    │   │
│   └───────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                                ↓
                    ┌───────────────────────┐
                    │   Decision Point      │
                    └───────────────────────┘
                    ↙                       ↘
         More Changes Needed          Ready to Push & PR
                    ↓                           ↓

┌──────────────────────────────────┐  ┌──────────────────────────────────┐
│ OPTION A: Additional Iteration   │  │ OPTION B: Finalize               │
└──────────────────────────────────┘  └──────────────────────────────────┘
                ↓                                     ↓
┌──────────────────────────────────┐  ┌──────────────────────────────────┐
│ YOU (Manual): Give new prompt    │  │ CLAUDE (Manual): Ask permission  │
│                                  │  │                                  │
│ "Add rate limiting to auth       │  │ Claude: "Ready to push and       │
│  endpoints - 5 attempts per      │  │  create PR?"                     │
│  15 minutes"                     │  └──────────────────────────────────┘
└──────────────────────────────────┘                ↓
                ↓                      ┌──────────────────────────────────┐
┌──────────────────────────────────┐  │ YOU (Manual): Approve            │
│ CLAUDE (Automated):              │  │                                  │
│ Implementation                   │  │ "Yes, please proceed"            │
│                                  │  └──────────────────────────────────┘
│ ✓ Add rate limiter middleware   │                ↓
│ ✓ Apply to endpoints             │  ┌──────────────────────────────────┐
│ ✓ Add tests                      │  │ STEP 6: CLAUDE (Automated)       │
│ ✓ Commit locally                 │  │ Push to Remote                   │
└──────────────────────────────────┘  │                                  │
                ↓                      │ $ git push -u origin \           │
┌──────────────────────────────────┐  │   feature/10-add-user-auth       │
│ CLAUDE (Manual Trigger):         │  │                                  │
│ Post Response #2                 │  │ Automatically:                   │
│                                  │  │ ✓ Pushes all commits to GitHub   │
│ $ ./post-summary.sh \            │  └──────────────────────────────────┘
│   "Add rate limiting..." \       │                ↓
│   "Added rate limiter..."        │  ┌──────────────────────────────────┐
│                                  │  │ STEP 7: CLAUDE (Automated)       │
│ Posts to Issue #10:              │  │ Create Pull Request              │
│ → ClaudeCode Response #2         │  │                                  │
└──────────────────────────────────┘  │ $ gh pr create \                 │
                ↓                      │   --title "Add authentication" \ │
      (Repeat until done)              │   --body "..." \                 │
                ↓                      │   "Fixes #10"                    │
                └──────────────────────→                                  │
                                       │ Creates: PR #11                  │
                                       └──────────────────────────────────┘
                                                     ↓
                                       ┌──────────────────────────────────┐
                                       │ STEP 8: CLAUDE (Manual Trigger)  │
                                       │ Post Initial Summary to PR       │
                                       │                                  │
                                       │ $ ./post-summary.sh \            │
                                       │   "Add user authentication..." \ │
                                       │   "Implemented JWT auth..."      │
                                       │                                  │
                                       │ Script automatically:            │
                                       │ ✓ Detects PR #11 for this branch │
                                       │ ✓ Posts to BOTH:                 │
                                       │   - Issue #10 (Response #N)      │
                                       │   - PR #11 (Update #1)           │
                                       └──────────────────────────────────┘
                                                     ↓
                                       ┌──────────────────────────────────┐
                                       │ GitHub PR #11 now shows:         │
                                       │ ┌──────────────────────────────┐ │
                                       │ │ ## ClaudeCode Update #1      │ │
                                       │ │                              │ │
                                       │ │ ```                          │ │
                                       │ │ Time: 2025-11-21 15:00       │ │
                                       │ │ ```                          │ │
                                       │ │                              │ │
                                       │ │ ### Request                  │ │
                                       │ │ ```                          │ │
                                       │ │ Add user authentication...   │ │
                                       │ │ ```                          │ │
                                       │ │                              │ │
                                       │ │ ### Changes Made             │ │
                                       │ │                              │ │
                                       │ │ Implemented JWT auth...      │ │
                                       │ │                              │ │
                                       │ │ ### Files Modified           │ │
                                       │ │ <details>...</details>       │ │
                                       │ │                              │ │
                                       │ │ ### New Commits              │ │
                                       │ │ ```                          │ │
                                       │ │ abc123 feat: add JWT...      │ │
                                       │ │ ```                          │ │
                                       │ │                              │ │
                                       │ │ Status: Changes pushed       │ │
                                       │ │ to PR and ready for review   │ │
                                       │ │                              │ │
                                       │ │ <sub>Update #1 - Auto...</sub>│ │
                                       │ └──────────────────────────────┘ │
                                       └──────────────────────────────────┘
                                                     ↓
                                       ┌──────────────────────────────────┐
                                       │ IF YOU WANT PR CHANGES:          │
                                       │                                  │
                                       │ YOU (Manual): Give feedback      │
                                       │ ↓                                │
                                       │ CLAUDE (Automated): Implement    │
                                       │ ↓                                │
                                       │ CLAUDE (Manual Trigger): Post    │
                                       │ → Creates Update #2 on PR        │
                                       │                                  │
                                       │ (Repeat until approved)          │
                                       └──────────────────────────────────┘
                                                     ↓
                                       ┌──────────────────────────────────┐
                                       │ STEP 9: YOU (Manual)             │
                                       │ Review and Merge PR              │
                                       │                                  │
                                       │ On GitHub:                       │
                                       │ ✓ Review code changes            │
                                       │ ✓ Check all tests pass           │
                                       │ ✓ Approve PR                     │
                                       │ ✓ Click "Merge pull request"     │
                                       │                                  │
                                       │ Result:                          │
                                       │ ✓ PR #11 merged to main          │
                                       │ ✓ Issue #10 auto-closed          │
                                       │   (because "Fixes #10" in PR)    │
                                       └──────────────────────────────────┘
                                                     ↓
                                       ┌──────────────────────────────────┐
                                       │ ✓ COMPLETE                       │
                                       │                                  │
                                       │ • Issue #10: Closed              │
                                       │ • PR #11: Merged                 │
                                       │ • Feature live on main           │
                                       └──────────────────────────────────┘
```

---

## Summary: Who Does What?

### YOU (Manual Actions):

| Step | Action | Tool |
|------|--------|------|
| 1 | Create GitHub Issue | GitHub Website |
| 2 | Run start script | `./scripts/start-work.sh 10` |
| 3 | Give prompt to Claude | Copy/paste in Claude Code |
| 5+ | Additional prompts (if needed) | Type in Claude Code |
| 9 | Review and merge PR | GitHub Website |

### CLAUDE (Fully Automated):

| Step | Action | What Happens |
|------|--------|--------------|
| 4 | Implementation | Reads code, creates files, writes tests, commits |
| 6 | Push to remote | `git push` when you approve |
| 7 | Create PR | `gh pr create` automatically |

### CLAUDE (Manual Trigger - You tell Claude when):

| Step | Action | Command |
|------|--------|---------|
| 5 | Post to Issue | `./.claude/hooks/post-summary.sh` |
| 8 | Post to PR | `./.claude/hooks/post-summary.sh` |
| Iterations | Post updates | `./.claude/hooks/post-summary.sh` |

---

## Quick Reference

### When to Run post-summary.sh:

```bash
# After completing a response to your prompt
./.claude/hooks/post-summary.sh \
  "What you asked for" \
  "What was achieved"
```

**Run this:**
- ✅ After Claude finishes implementing your request
- ✅ Before asking for additional changes
- ✅ After PR is created (posts to both Issue + PR)
- ✅ After making PR updates

**Don't run on:**
- ❌ main or develop branches (will error)
- ❌ Before Claude has done any work
- ❌ Multiple times for same work (creates duplicates)

---

## Disable Comments Temporarily

```bash
# Disable
export DISABLE_AUTO_COMMENT=true

# Work without posting comments
./.claude/hooks/post-summary.sh "..." "..."
# Output: ℹ️  Auto-commenting is disabled

# Re-enable
unset DISABLE_AUTO_COMMENT
```

---

## Multiple Issues Workflow

```bash
# Work on Issue #10
git checkout feature/10-add-auth
# ... work, commit ...
./post-summary.sh "..." "..."  # → Posts to Issue #10

# Switch to Issue #15
git checkout feature/15-upload
# ... work, commit ...
./post-summary.sh "..." "..."  # → Posts to Issue #15

# Back to Issue #10
git checkout feature/10-add-auth
# ... more work ...
./post-summary.sh "..." "..."  # → Posts to Issue #10 (Response #2)
```

**The branch name determines everything!**

---

**Ready to test? Let's do it!** 🚀
