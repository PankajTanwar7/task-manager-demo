# ⚡ Quick Reference Guide

**Copy-paste commands for daily workflow**

---

## 🚀 Starting Work on an Issue

```bash
# 1. Fetch issue and prepare environment
./scripts/start-work.sh <issue-number>

# Example:
./scripts/start-work.sh 45

# This automatically:
# - Creates branch: feature/45-description
# - Generates Claude Code prompt with context
# - Sets up log file: docs/dev-logs/issue-45.md
```

---

## 💻 Claude Code Prompts

### Implementing New Feature

```
Implement [feature name] from GitHub issue #[number].

Context from @claude discussion:
- [Copy key architecture points from issue]
- [Copy technical decisions]

Files to create/modify:
- [List from issue]

Acceptance criteria:
- [Copy from issue]

Please:
1. Install any needed dependencies
2. Implement according to architecture
3. Write comprehensive tests
4. Ensure all tests pass
5. Commit with message: "feat: [description] (#[number])"
```

### Fixing Bug

```
Fix bug from GitHub issue #[number].

Root cause (from @claude analysis):
[Copy analysis from issue]

Solution approach:
[Copy proposed solution from issue]

Please:
1. Implement the fix
2. Add regression test
3. Verify existing tests still pass
4. Commit with message: "fix: [description] (#[number])"
```

### Applying PR Review Feedback

```
Apply @claude's review feedback from PR #[number]:

Critical items:
1. [Item 1]
2. [Item 2]

Nice-to-have (create follow-up issues):
3. [Item 3]
4. [Item 4]

Please implement critical items and update tests.
```

---

## 🔧 Git Operations

### Check Current Status

```bash
# See what's changed
git status
git diff

# See recent commits
git log --oneline -5

# See commits in current feature branch
git log --oneline main..HEAD
```

### Create Pull Request

```bash
# Create PR with auto-fill from commits
gh pr create --fill

# Or create with custom message
gh pr create \
  --title "Add Feature (#45)" \
  --body "Implements #45. See docs/dev-logs/issue-45.md for details.

## Changes
- [List changes]

## Testing
- [Test results]

Closes #45"
```

### Create Follow-up Issues

```bash
# From @claude review recommendations
gh issue create \
  --title "[TAG] Short description" \
  --body "As recommended by @claude in PR #XX: [full description]" \
  --label "enhancement"
```

---

## 📝 GitHub @claude Interactions

### In New Issue (Planning)

```markdown
@claude Can you help design the architecture for this feature?

Requirements:
- [Requirement 1]
- [Requirement 2]

Questions:
1. [Question 1]
2. [Question 2]

Constraints:
- Tech stack: [stack]
- Performance: [requirements]
```

### In PR (Code Review)

```markdown
@claude Please review this implementation for:
1. Security vulnerabilities
2. Performance issues
3. Edge cases we might have missed
4. Code quality improvements
```

### In Issue (Investigation)

```markdown
@claude Can you help debug this issue?

Error:
```
[paste error]
```

Context:
- What changed: [describe]
- When it started: [when]
- Environment: [env]
```

---

## 🔍 Checking Logs

### View Development Log for Issue

```bash
# View log for specific issue
cat docs/dev-logs/issue-45.md

# Or open in editor
code docs/dev-logs/issue-45.md
```

### View All Recent Logs

```bash
# List all logs
ls -lt docs/dev-logs/

# View index
cat docs/dev-logs/README.md
```

### Search Logs for Keyword

```bash
# Search all logs for keyword
grep -r "authentication" docs/dev-logs/

# Search specific log
grep "error" docs/dev-logs/issue-45.md
```

---

## 🧪 Testing

### Run All Tests

```bash
# Node.js
npm test

# Python
pytest

# Go
go test ./...

# Rust
cargo test
```

### Run Specific Test File

```bash
# Node.js
npm test -- path/to/test.js

# Python
pytest path/to/test.py

# Go
go test ./path/to/package

# Rust
cargo test --package package-name
```

### Run with Coverage

```bash
# Node.js
npm test -- --coverage

# Python
pytest --cov=src --cov-report=term-missing

# Go
go test -cover ./...

# Rust
cargo tarpaulin
```

---

## 📊 Project Health Checks

### Check for Issues Ready to Work On

```bash
# List open issues labeled "ready"
gh issue list --label "ready" --state open

# List issues assigned to you
gh issue list --assignee @me --state open
```

### Check PR Status

```bash
# List your open PRs
gh pr list --author @me --state open

# Check specific PR
gh pr view <pr-number>

# Check PR checks/CI status
gh pr checks <pr-number>
```

### Check Development Logs

```bash
# Count log entries
find docs/dev-logs -name "*.md" | wc -l

# Show recent activity
ls -lt docs/dev-logs/ | head -10

# Show log statistics
wc -l docs/dev-logs/*.md
```

---

## 🛠️ Maintenance

### Clean Up Old Branches

```bash
# List merged branches
git branch --merged main | grep -v "main"

# Delete merged branches
git branch --merged main | grep -v "main" | xargs git branch -d

# Delete remote branches
git fetch --prune
```

### Update Dependencies

```bash
# Node.js
npm update
npm audit fix

# Python
pip install --upgrade -r requirements.txt

# Go
go get -u ./...

# Rust
cargo update
```

### Sync with Main

```bash
# Update your main branch
git checkout main
git pull origin main

# Update your feature branch
git checkout feature/45-description
git merge main

# Or rebase
git rebase main
```

---

## 🚨 Emergency Procedures

### Rollback Last Commit

```bash
# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes) - DANGEROUS
git reset --hard HEAD~1
```

### Fix Wrong Branch

```bash
# You committed to main by mistake
git checkout main
git reset --soft HEAD~1  # Undo commit, keep changes
git stash                # Save changes
git checkout -b feature/45-description  # Create correct branch
git stash pop            # Apply changes
git commit -m "..."      # Commit to correct branch
```

### Abort Merge Conflict

```bash
# Cancel merge
git merge --abort

# Or cancel rebase
git rebase --abort
```

### Force Push (Use with Caution)

```bash
# ONLY for feature branches, NEVER for main/master
git push --force-with-lease origin feature/45-description
```

---

## 📞 Getting Help

### Claude Code Help

```
# In Claude Code, ask:
"How do I [task]?"
"What's the best way to [goal]?"
"Debug this error: [paste error]"
```

### GitHub @claude Help

```markdown
@claude I'm stuck on [problem]. Can you help?

What I've tried:
- [Attempt 1]
- [Attempt 2]

Error/issue:
[Describe or paste error]
```

### Check Workflow Documentation

```bash
# View full workflow guide
cat WORKFLOW.md

# View this quick reference
cat QUICKREF.md
```

---

## ⌨️ Shell Aliases (Optional)

Add to `~/.bashrc` or `~/.zshrc`:

```bash
# Workflow shortcuts
alias start-issue='./scripts/start-work.sh'
alias show-log='cat docs/dev-logs/issue-'
alias list-logs='ls -lt docs/dev-logs/'

# Git shortcuts
alias gst='git status'
alias gd='git diff'
alias glog='git log --oneline -10'
alias gco='git checkout'
alias gcb='git checkout -b'

# PR shortcuts
alias pr-create='gh pr create --fill'
alias pr-list='gh pr list --author @me'
alias pr-view='gh pr view'

# Issue shortcuts
alias issue-list='gh issue list --assignee @me'
alias issue-create='gh issue create'
alias issue-view='gh issue view'

# Testing shortcuts
alias test-all='npm test'
alias test-watch='npm test -- --watch'
alias test-cov='npm test -- --coverage'
```

Then reload:
```bash
source ~/.bashrc  # or ~/.zshrc
```

---

**💡 Pro Tip:** Bookmark this file and keep it open in a terminal tab for quick reference!
