# 🎯 FINAL WORKFLOW - What We Actually Follow

**Last Updated:** 2025-11-21

---

## Complete Visual Workflow

```
┌─────────────────────────────────────────────────────────────────────┐
│ 1. YOU: Create GitHub Issue                                        │
│                                                                     │
│ On GitHub.com:                                                      │
│   • Click "New Issue"                                               │
│   • Title: "Add user authentication"                               │
│   • Description: What you want (requirements, not implementation)   │
│   • Submit                                                          │
│                                                                     │
│ Result: Issue #15 created                                           │
└─────────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────────┐
│ 2. YOU: Run Start Script                                           │
│                                                                     │
│ Terminal:                                                           │
│   $ ./scripts/start-work.sh 15                                     │
│                                                                     │
│ Script automatically:                                               │
│   ✓ Fetches Issue #15 from GitHub                                  │
│   ✓ Creates branch: feature/15-add-user-authentication             │
│   ✓ Generates: .claude-prompt-issue-15.md                          │
│   ✓ Displays prompt for you to copy                                │
│   ✓ Shows Claude's workflow steps                                  │
└─────────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────────┐
│ 3. YOU: Give Prompt to Claude                                      │
│                                                                     │
│ Copy from terminal or .claude-prompt-issue-15.md:                  │
│                                                                     │
│   "Implement user authentication with JWT tokens,                  │
│    bcrypt password hashing, login/register endpoints,              │
│    and middleware to protect routes. All tests must pass."         │
│                                                                     │
│ Paste to Claude Code                                               │
└─────────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────────┐
│ 4. CLAUDE: Implementation (Automated)                              │
│                                                                     │
│ I automatically:                                                    │
│   ✓ Read codebase to understand architecture                       │
│   ✓ Create/modify files as needed:                                 │
│     - src/auth/jwt.js (NEW)                                        │
│     - src/middleware/auth.js (NEW)                                 │
│     - src/routes/auth.js (NEW)                                     │
│     - tests/auth.test.js (NEW)                                     │
│     - src/app.js (MODIFIED - add auth routes)                      │
│   ✓ Write tests                                                    │
│   ✓ Run tests to verify                                            │
│   ✓ Make commits (LOCAL ONLY - not pushed):                        │
│     abc123 feat: add JWT token utilities                           │
│     def456 feat: add auth middleware                               │
│     ghi789 feat: add login/register endpoints                      │
│     jkl012 test: add auth tests (12 tests)                         │
└─────────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────────┐
│ 5. CLAUDE: Post Summary to GitHub (Manual Trigger)                 │
│                                                                     │
│ I run:                                                              │
│   $ ./.claude/hooks/post-summary.sh \                              │
│       "Add user authentication with JWT" \                         │
│       "Implemented JWT auth with login/register endpoints,         │
│        bcrypt hashing, auth middleware, 12 tests passing"          │
│                                                                     │
│ Script automatically:                                               │
│   ✓ Detects: branch feature/15-add-user-authentication             │
│   ✓ Extracts: issue number 15                                      │
│   ✓ Collects: all commits since main                               │
│   ✓ Lists: all changed files                                       │
│   ✓ Posts to GitHub Issue #15                                      │
│                                                                     │
│ GitHub Issue #15 now shows:                                        │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ ## ClaudeCode Response #1                                       │ │
│ │                                                                 │ │
│ │ ```                                                             │ │
│ │ Time: 2025-11-21 15:30                                         │ │
│ │ ```                                                             │ │
│ │                                                                 │ │
│ │ ### Request                                                     │ │
│ │ ```                                                             │ │
│ │ Add user authentication with JWT                               │ │
│ │ ```                                                             │ │
│ │                                                                 │ │
│ │ ### Response                                                    │ │
│ │                                                                 │ │
│ │ Implemented JWT auth with login/register endpoints,            │ │
│ │ bcrypt hashing, auth middleware, 12 tests passing               │ │
│ │                                                                 │ │
│ │ ### Files Changed                                               │ │
│ │ <details>                                                       │ │
│ │ <summary>5 files modified</summary>                            │ │
│ │ - src/auth/jwt.js                                              │ │
│ │ - src/middleware/auth.js                                       │ │
│ │ - src/routes/auth.js                                           │ │
│ │ - tests/auth.test.js                                           │ │
│ │ - src/app.js                                                   │ │
│ │ </details>                                                      │ │
│ │                                                                 │ │
│ │ ### Commits                                                     │ │
│ │ ```                                                             │ │
│ │ abc123 feat: add JWT token utilities                           │ │
│ │ def456 feat: add auth middleware                               │ │
│ │ ghi789 feat: add login/register endpoints                      │ │
│ │ jkl012 test: add auth tests                                    │ │
│ │ ```                                                             │ │
│ │                                                                 │ │
│ │ Status: Implementation completed and committed locally         │ │
│ │ (not pushed yet)                                                │ │
│ │                                                                 │ │
│ │ <sub>Response #1 - Auto-generated by ClaudeCode</sub>         │ │
│ └─────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                                ↓
                    ┌───────────────────────┐
                    │   Your Decision       │
                    └───────────────────────┘
                    ↙                       ↘
         More Changes Needed          Looks Good - Ready to Push
                    ↓                           ↓

┌──────────────────────────────────┐  ┌──────────────────────────────────┐
│ OPTION A: Additional Changes    │  │ OPTION B: Finalize & Create PR   │
└──────────────────────────────────┘  └──────────────────────────────────┘
                ↓                                     ↓
┌──────────────────────────────────┐  ┌──────────────────────────────────┐
│ YOU: Give Another Prompt         │  │ CLAUDE: Ask Permission           │
│                                  │  │                                  │
│ "Add rate limiting - 5 attempts  │  │ I say:                           │
│  per 15 minutes on auth          │  │ "Ready to push and create PR?"   │
│  endpoints"                      │  └──────────────────────────────────┘
└──────────────────────────────────┘                ↓
                ↓                      ┌──────────────────────────────────┐
┌──────────────────────────────────┐  │ YOU: Approve                     │
│ CLAUDE: Implementation           │  │                                  │
│ (Automated)                      │  │ "Yes, please proceed"            │
│                                  │  └──────────────────────────────────┘
│ ✓ Add rate limiter middleware   │                ↓
│ ✓ Apply to endpoints             │  ┌──────────────────────────────────┐
│ ✓ Add tests                      │  │ 6. CLAUDE: Push to Remote        │
│ ✓ Commit locally:                │  │    (Automated)                   │
│   mno345 feat: add rate limiting │  │                                  │
│   pqr678 test: rate limit tests  │  │ I run:                           │
└──────────────────────────────────┘  │   $ git push -u origin \         │
                ↓                      │     feature/15-add-user-auth     │
┌──────────────────────────────────┐  │                                  │
│ CLAUDE: Post Response #2         │  │ Result: All commits pushed       │
│ (Manual Trigger)                 │  └──────────────────────────────────┘
│                                  │                ↓
│ I run:                           │  ┌──────────────────────────────────┐
│ $ ./post-summary.sh \            │  │ 7. CLAUDE: Create PR             │
│   "Add rate limiting..." \       │  │    (Automated)                   │
│   "Added rate limiter..."        │  │                                  │
│                                  │  │ I run:                           │
│ Posts to Issue #15:              │  │   $ gh pr create \               │
│ → ClaudeCode Response #2         │  │     --title "Add auth" \         │
│                                  │  │     --body "Implements JWT..." \ │
│ Status: "committed locally       │  │     "Fixes #15"                  │
│ (not pushed yet)"                │  │                                  │
└──────────────────────────────────┘  │ Result: PR #20 created           │
                ↓                      └──────────────────────────────────┘
                                                     ↓
    (Loop: Repeat until satisfied)     ┌──────────────────────────────────┐
                ↓                      │ 8. CLAUDE: Post Summary to PR    │
                ↓                      │    (Manual Trigger)              │
                └──────────────────────→                                  │
                                       │ I run:                           │
                                       │ $ ./post-summary.sh \            │
                                       │   "Add user authentication..." \ │
                                       │   "Implemented JWT auth..."      │
                                       │                                  │
                                       │ Script automatically:            │
                                       │ ✓ Detects PR #20 for this branch │
                                       │ ✓ Posts to BOTH:                 │
                                       │   - Issue #15 (Response #N)      │
                                       │   - PR #20 (Update #1)           │
                                       └──────────────────────────────────┘
                                                     ↓
                                       ┌──────────────────────────────────┐
                                       │ PR #20 now shows:                │
                                       │ ┌──────────────────────────────┐ │
                                       │ │ ## ClaudeCode Update #1      │ │
                                       │ │                              │ │
                                       │ │ ```                          │ │
                                       │ │ Time: 2025-11-21 16:00       │ │
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
                                       │ │ ...                          │ │
                                       │ │ ```                          │ │
                                       │ │                              │ │
                                       │ │ Status: Changes pushed to PR │ │
                                       │ │ and ready for review         │ │
                                       │ │                              │ │
                                       │ │ <sub>Update #1 - Auto...</sub>│ │
                                       │ └──────────────────────────────┘ │
                                       └──────────────────────────────────┘
                                                     ↓
                                       ┌──────────────────────────────────┐
                                       │ IF YOU WANT MORE PR CHANGES:     │
                                       │                                  │
                                       │ YOU: "Add email verification"    │
                                       │   ↓                              │
                                       │ CLAUDE: Implement (automated)    │
                                       │   ↓                              │
                                       │ CLAUDE: Commit & Push            │
                                       │   ↓                              │
                                       │ CLAUDE: Run post-summary.sh      │
                                       │   → Creates Update #2 on PR      │
                                       │                                  │
                                       │ (Loop until you approve)         │
                                       └──────────────────────────────────┘
                                                     ↓
                                       ┌──────────────────────────────────┐
                                       │ 9. YOU: Review & Merge PR        │
                                       │                                  │
                                       │ On GitHub.com:                   │
                                       │   ✓ Review all code changes      │
                                       │   ✓ Check tests pass (CI)        │
                                       │   ✓ Approve PR                   │
                                       │   ✓ Click "Merge pull request"   │
                                       │   ✓ Delete branch (optional)     │
                                       │                                  │
                                       │ Result:                          │
                                       │   ✓ PR #20 merged into main      │
                                       │   ✓ Issue #15 auto-closed        │
                                       │     (because "Fixes #15")        │
                                       └──────────────────────────────────┘
                                                     ↓
                                       ┌──────────────────────────────────┐
                                       │ ✓✓✓ COMPLETE ✓✓✓                │
                                       │                                  │
                                       │ • Issue #15: Closed              │
                                       │ • PR #20: Merged                 │
                                       │ • Feature: Live on main branch   │
                                       │ • Ready for next issue!          │
                                       └──────────────────────────────────┘
```

---

## 📋 Quick Reference

### Who Does What?

| Actor | Action | When |
|-------|--------|------|
| **YOU** | Create issue on GitHub | Start of task |
| **YOU** | Run `./scripts/start-work.sh N` | After creating issue |
| **YOU** | Paste prompt to Claude | After script runs |
| **CLAUDE** | Implement, test, commit (local) | Automated |
| **CLAUDE** | Run `./post-summary.sh` | After each response |
| **YOU** | Give more prompts OR approve push | After seeing Issue comment |
| **CLAUDE** | Ask "Ready to push and create PR?" | When you seem satisfied |
| **YOU** | Approve push | When ready |
| **CLAUDE** | Push + create PR + post summary | Automated after approval |
| **YOU** | Review and merge PR on GitHub | Final step |

---

## 🎯 Key Commands

### Start Work:
```bash
./scripts/start-work.sh 15
```

### Post Summary (Claude runs this):
```bash
./.claude/hooks/post-summary.sh \
  "What you requested" \
  "What was achieved"
```

### Disable Comments Temporarily:
```bash
export DISABLE_AUTO_COMMENT=true    # Disable
unset DISABLE_AUTO_COMMENT          # Enable
```

---

## 🔄 Multiple Issues Workflow

```bash
# Work on Issue #15
git checkout feature/15-add-auth
# ... work, commit ...
./post-summary.sh "..." "..."  # → Posts to Issue #15

# Switch to Issue #20
git checkout feature/20-add-upload
# ... work, commit ...
./post-summary.sh "..." "..."  # → Posts to Issue #20

# Back to Issue #15
git checkout feature/15-add-auth
# ... more work ...
./post-summary.sh "..." "..."  # → Posts to Issue #15 (Response #2)
```

**Branch name = Source of truth for issue/PR routing!**

---

## ⚠️ Important Notes

### ✅ DO:
- Create issues with clear requirements (WHAT, not HOW)
- Let Claude decide which files to create/modify
- Run post-summary.sh after each response
- Review Claude's work before approving push
- Use structured issue format if helpful (optional)

### ❌ DON'T:
- Specify exact files to modify in issues (too rigid)
- Run post-summary.sh on main/develop branches (will error)
- Push or create PR without Claude asking first
- Skip post-summary.sh (loses documentation trail)

---

## 📝 Issue Format (Flexible)

### Option 1: Simple (Works Great)
```markdown
Title: Add user authentication

Description:
Implement JWT-based authentication with login/register endpoints,
bcrypt password hashing, and middleware to protect routes.
All tests must pass.
```

### Option 2: Structured (Also Works)
```markdown
Title: Add user authentication

## 🎯 Acceptance Criteria
- User can register with email/password
- User can login and receive JWT token
- Protected routes require valid token
- Passwords hashed with bcrypt
- All tests pass

## 🏗️ Architecture Discussion
Use JWT for stateless authentication.
Store hashed passwords only.
```

**Both work! Claude adapts to either format.**

---

## 🎉 Summary

1. **YOU** create issue
2. **YOU** run start script
3. **YOU** give prompt to Claude
4. **CLAUDE** implements (auto)
5. **CLAUDE** posts to Issue (manual trigger)
6. **Repeat 3-5** OR proceed to push
7. **CLAUDE** asks permission
8. **YOU** approve
9. **CLAUDE** pushes + creates PR + posts summary (auto)
10. **YOU** merge PR on GitHub

**Clean. Controlled. Documented. Ready to use!** 🚀
