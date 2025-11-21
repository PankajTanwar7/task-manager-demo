# Post-Merge Cleanup Guide

**Last Updated:** 2025-11-21

---

## Two-Step Cleanup After PR Merge

When you merge a PR on GitHub, cleanup happens in **two places**:

```
┌────────────────────────────────────────────────────────┐
│ 1. GITHUB (Remote) - Automatic                        │
│    ☑ Check "Delete branch" when merging               │
│    → Deletes remote branch automatically               │
└────────────────────────────────────────────────────────┘
                         +
┌────────────────────────────────────────────────────────┐
│ 2. LOCAL MACHINE - Run Script                         │
│    $ ./scripts/cleanup-after-merge.sh                 │
│    → Switches to main, pulls changes, deletes local   │
└────────────────────────────────────────────────────────┘
```

---

## Step-by-Step Guide

### **When Merging PR on GitHub:**

```
1. Review PR on GitHub
2. Click "Squash and merge" (or preferred merge type)
3. ☑ CHECK "Delete branch" checkbox           ← IMPORTANT!
4. Confirm merge
```

**Result:**
- ✅ PR merged to main
- ✅ Issue auto-closed (if "Fixes #N")
- ✅ Remote branch deleted

### **On Your Local Machine:**

```bash
# You're still on feature branch
$ git branch
  main
* feature/15-add-auth    ← Still here

# Run cleanup script
$ ./scripts/cleanup-after-merge.sh

# Script will:
# 1. Verify PR is merged
# 2. Switch to main
# 3. Pull latest changes (includes your merged PR)
# 4. Delete local feature branch
# 5. Confirm remote branch deleted (by GitHub)

# Result:
$ git branch
* main    ← Clean! Ready for next issue
```

---

## Visual Workflow

```
┌─────────────────────────────────────────────────────────┐
│ BEFORE MERGE                                            │
│                                                         │
│ GitHub:                                                 │
│   • main branch                                         │
│   • origin/feature/15-add-auth (remote branch)         │
│   • PR #20 (OPEN)                                      │
│                                                         │
│ Local Machine:                                          │
│   • main branch (outdated)                             │
│   • feature/15-add-auth (current) ← You are here       │
└─────────────────────────────────────────────────────────┘
                          ↓
        [Merge PR on GitHub with "Delete branch" checked]
                          ↓
┌─────────────────────────────────────────────────────────┐
│ AFTER GITHUB MERGE                                      │
│                                                         │
│ GitHub:                                                 │
│   • main branch (updated with your changes)            │
│   • origin/feature/15-add-auth DELETED ✓               │
│   • PR #20 (MERGED)                                    │
│   • Issue #15 (CLOSED)                                 │
│                                                         │
│ Local Machine:                                          │
│   • main branch (still outdated) ✗                     │
│   • feature/15-add-auth (still exists) ✗              │
│   ↑ Need to clean up!                                  │
└─────────────────────────────────────────────────────────┘
                          ↓
            [Run ./scripts/cleanup-after-merge.sh]
                          ↓
┌─────────────────────────────────────────────────────────┐
│ AFTER LOCAL CLEANUP                                     │
│                                                         │
│ GitHub:                                                 │
│   • main branch (your changes live)                    │
│   • PR #20 (MERGED)                                    │
│   • Issue #15 (CLOSED)                                 │
│                                                         │
│ Local Machine:                                          │
│   • main branch (updated) ✓ ← You are here            │
│   • feature/15-add-auth DELETED ✓                      │
│                                                         │
│ ✓ Ready for next issue!                                │
└─────────────────────────────────────────────────────────┘
```

---

## Script Output Example

```bash
$ ./scripts/cleanup-after-merge.sh

════════════════════════════════════════
  Post-Merge Cleanup
════════════════════════════════════════

ℹ Current branch: feature/15-add-auth
ℹ Target branch: main

════════════════════════════════════════
  Checking PR Status
════════════════════════════════════════
✓ PR #20 is merged

════════════════════════════════════════
  Step 1: Switch to main
════════════════════════════════════════
✓ Switched to main branch

════════════════════════════════════════
  Step 2: Pull Latest Changes
════════════════════════════════════════
From github.com:user/repo
   abc123..xyz999  main -> origin/main
Updating abc123..xyz999
Fast-forward
 src/auth/jwt.js | 50 +++++++++++++++++
 5 files changed, 200 insertions(+)
✓ Pulled latest changes from origin/main

════════════════════════════════════════
  Step 3: Delete Local Feature Branch
════════════════════════════════════════
✓ Deleted local branch: feature/15-add-auth

════════════════════════════════════════
  Step 4: Remote Branch Status
════════════════════════════════════════
✓ Remote branch already deleted (GitHub auto-delete)

════════════════════════════════════════
  Cleanup Complete!
════════════════════════════════════════

✓ Current branch: main
✓ Local feature branch: deleted
✓ Latest changes: pulled from origin
✓ PR #20 merged
✓ Issue #15 closed

Ready for next issue!

Run: ./scripts/start-work.sh <issue-number>
```

---

## Complete Workflow Cycle

```bash
# 1. Start new issue
./scripts/start-work.sh 15
# → Creates feature/15-add-auth

# 2. Work, commit, push, create PR, merge on GitHub
# → Check "Delete branch" when merging!

# 3. Cleanup after merge
./scripts/cleanup-after-merge.sh
# → Switches to main, pulls changes, deletes local branch

# 4. Start next issue
./scripts/start-work.sh 16
# → Creates feature/16-next-feature

# Repeat!
```

---

## Troubleshooting

### **Q: Script says "PR is still OPEN"**

**A:** You need to merge the PR on GitHub first before running cleanup.

---

### **Q: Script says "Remote branch still exists"**

**A:** You forgot to check "Delete branch" when merging. The script will ask if you want to delete it now.

---

### **Q: I'm already on main branch**

**A:** Script will exit. You only run this from a feature branch after merging.

---

### **Q: Can I run this even if I closed PR without merging?**

**A:** Yes, the script will ask for confirmation. It will still clean up your local branch.

---

## Benefits of Using the Script

✅ **Automated** - No manual git commands
✅ **Safe** - Verifies PR is merged first
✅ **Complete** - Handles all cleanup steps
✅ **Fast** - One command vs 4-5 manual commands
✅ **Consistent** - Same process every time

---

## Manual Alternative (If You Prefer)

```bash
# If you don't want to use the script:
git checkout main
git pull origin main
git branch -d feature/15-add-auth

# That's it!
```

---

## Remember!

**GitHub's "Delete branch" checkbox:**
- ☑ Deletes **remote** branch automatically
- ✅ Recommended: ALWAYS check this box

**Our cleanup script:**
- Deletes **local** branch
- Pulls latest changes
- Switches to main
- ✅ Recommended: Run after every merge

**Both are needed for complete cleanup!**

---

**Last Updated:** 2025-11-21
