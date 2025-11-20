# 🚀 Ultimate Development Workflow System

**Combining GitHub @claude + Claude Code + Auto Logging for Maximum Productivity**

---

## 📖 What is This?

This is a complete workflow system that integrates:

1. **GitHub @claude** - For planning, architecture discussions, and code reviews
2. **Claude Code** - For implementation, testing, and git operations
3. **Auto Prompt Logger** - For automatic documentation of development sessions

The result: **Perfect documentation with zero manual effort** ✨

---

## 🎯 Key Features

- ✅ **Automatic session logging** - Every important conversation saved to `docs/dev-logs/`
- ✅ **GitHub issue templates** - Optimized for @claude collaboration
- ✅ **Helper scripts** - One command to start work on any issue
- ✅ **Smart filtering** - Only logs technically relevant conversations
- ✅ **Git integration** - Logs linked to branches and commits
- ✅ **Zero configuration** - Works out of the box

---

## 📦 What's Included

```
workflow-system/
├── .claude/
│   └── hooks/
│       └── prompt-logger.js          # Auto-logging hook
├── .github/
│   └── ISSUE_TEMPLATE/
│       ├── feature.md                # Feature template
│       └── bug.md                    # Bug template
├── scripts/
│   └── start-work.sh                 # Helper script
├── docs/
│   └── dev-logs/                     # Auto-generated logs go here
│       └── README.md                 # Log index
├── WORKFLOW.md                       # Complete workflow guide
├── QUICKREF.md                       # Quick reference
└── README.md                         # This file
```

---

## ⚡ Quick Start

### 1. Copy to Your Project

```bash
# Navigate to your project
cd ~/your-project

# Copy workflow system
cp -r ~/workflow-system/.claude .
cp -r ~/workflow-system/.github .
cp -r ~/workflow-system/scripts .
cp ~/workflow-system/WORKFLOW.md .
cp ~/workflow-system/QUICKREF.md .

# Create logs directory
mkdir -p docs/dev-logs
```

### 2. Install Prerequisites

```bash
# Install GitHub CLI (if not already installed)
# macOS:
brew install gh

# Linux:
sudo apt install gh

# Windows:
winget install GitHub.cli

# Install jq (for helper scripts)
sudo apt install jq  # Linux
brew install jq      # macOS

# Authenticate with GitHub
gh auth login
```

### 3. Configure Claude Code Hook

**Option A: Manual Configuration**

Edit `~/.config/claude-code/config.json`:

```json
{
  "hooks": {
    "post-response": "node .claude/hooks/prompt-logger.js"
  }
}
```

**Option B: Automatic Configuration** (if Claude Code supports it)

```bash
claude-code config set hooks.post-response "node .claude/hooks/prompt-logger.js"
```

### 4. Test the Setup

```bash
# Test the prompt logger
echo '{"userPrompt":"Implement user authentication feature", "claudeResponse":"Here is the implementation with JWT tokens..."}' | node .claude/hooks/prompt-logger.js

# Should output:
# ✅ Logged to: docs/dev-logs/session-2025-11-20.md

# Test the helper script
./scripts/start-work.sh --help
```

---

## 🎓 How to Use

### Basic Workflow

```
1. Create GitHub Issue → 2. Discuss with @claude → 3. Implement with Claude Code → 4. Auto-logged → 5. Create PR → 6. Review with @claude → 7. Merge
```

### Detailed Steps

1. **Plan in GitHub Issue**
   - Create issue using template
   - Tag @claude for architecture discussion
   - Document decisions in issue

2. **Start Work**
   ```bash
   ./scripts/start-work.sh 45  # Issue number
   ```

3. **Implement in Claude Code**
   - Use generated prompt (includes all context from issue)
   - Claude Code implements, tests, commits
   - **Hook automatically logs session to `docs/dev-logs/issue-45.md`**

4. **Create Pull Request**
   ```bash
   gh pr create --fill
   ```

5. **Review with @claude**
   - Tag @claude in PR comments
   - Apply feedback in Claude Code
   - Logs updated automatically

6. **Merge**
   - PR merge auto-closes issue
   - Development log preserved for future reference

---

## 📚 Documentation

- **[WORKFLOW.md](WORKFLOW.md)** - Complete guide with step-by-step example
- **[QUICKREF.md](QUICKREF.md)** - Copy-paste commands for daily use

---

## 🎯 Examples

### Example 1: Quick Feature

```bash
# 1. Create issue on GitHub (issue #45)
# 2. Start work
./scripts/start-work.sh 45

# 3. Claude Code implements (copies generated prompt)
# 4. Automatic log created: docs/dev-logs/issue-45.md
# 5. Create PR
gh pr create --fill

# 6. Merge
gh pr merge
```

### Example 2: Bug Fix

```bash
# 1. Bug reported in issue #78
# 2. Discuss with @claude in issue
# 3. Start work
./scripts/start-work.sh 78

# 4. Claude Code fixes bug (auto-logged)
# 5. Create PR with fix
gh pr create --fill

# 6. Merge
```

### Example 3: Complex Feature with Review

```bash
# 1. Create issue #92
# 2. Architecture discussion with @claude
# 3. Start implementation
./scripts/start-work.sh 92

# 4. Implement phase 1 (auto-logged)
# 5. Create PR
gh pr create --fill

# 6. @claude reviews PR, suggests changes
# 7. Apply changes in Claude Code (auto-logged)
# 8. Merge PR

# Result: Complete history in docs/dev-logs/issue-92.md
```

---

## 🔧 Configuration

### Customize Prompt Logger

Edit `.claude/hooks/prompt-logger.js`:

```javascript
const CONFIG = {
  // Minimum prompt length to log
  minPromptLength: 50,

  // Add your technical keywords
  technicalKeywords: [
    'implement', 'create', 'add', 'fix', 'bug',
    // Add more...
  ],

  // Add keywords to ignore
  ignoreKeywords: [
    'hello', 'hi', 'thanks',
    // Add more...
  ]
};
```

### Customize Issue Templates

Edit `.github/ISSUE_TEMPLATE/feature.md` or `bug.md` to match your team's needs.

### Customize Helper Script

Edit `scripts/start-work.sh` to add project-specific setup steps.

---

## 🤔 FAQ

### Q: Does the hook slow down Claude Code?

No, the hook runs after Claude responds, not before. It doesn't affect response time.

### Q: Can I use this without GitHub @claude?

Yes! The workflow works with just Claude Code. You'll miss out on team collaboration features, but auto-logging still works.

### Q: What if I don't want certain sessions logged?

The hook automatically filters out casual conversations. For manual control, you can disable the hook temporarily by removing it from config.

### Q: Can I view session history in Claude Code?

Claude Code stores its own history separately. The hook creates an additional project-specific log in `docs/dev-logs/`.

### Q: Does this work with private repositories?

Yes! All tools (GitHub CLI, Claude Code, hooks) work with private repos.

### Q: Can multiple developers use this on the same project?

Yes! Each developer's Claude Code sessions are logged to the shared `docs/dev-logs/` directory, creating a complete team history.

---

## 🐛 Troubleshooting

### Hook Not Logging

```bash
# Check hook is executable
chmod +x .claude/hooks/prompt-logger.js

# Check Node.js installed
node --version  # Need v14+

# Test manually
echo '{"userPrompt":"test implement feature", "claudeResponse":"test response"}' | node .claude/hooks/prompt-logger.js
```

### Helper Script Fails

```bash
# Install missing dependencies
sudo apt install gh jq  # Linux
brew install gh jq      # macOS

# Authenticate with GitHub
gh auth login
```

### @claude Not Responding

- Verify GitHub @claude integration is enabled for your org/repo
- Check spelling: must be exactly `@claude`
- Contact GitHub support if not available

---

## 📈 Benefits

### For Individual Developers

- ✅ Never lose context between sessions
- ✅ Perfect documentation without effort
- ✅ Easy debugging with full history
- ✅ Learn from past decisions

### For Teams

- ✅ Complete project history
- ✅ Easy onboarding for new developers
- ✅ Code review with AI assistance
- ✅ Consistent workflow across team

### For Projects

- ✅ Architecture decisions documented
- ✅ Implementation details preserved
- ✅ Bug fix history tracked
- ✅ Knowledge base builds automatically

---

## 🚀 Advanced Usage

### CI/CD Integration

Add log checking to CI:

```yaml
# .github/workflows/check-logs.yml
name: Check Development Logs

on: [pull_request]

jobs:
  check-logs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Verify log exists
        run: |
          ISSUE_NUM=$(echo "${{ github.head_ref }}" | grep -oP '\d+')
          if [ ! -f "docs/dev-logs/issue-${ISSUE_NUM}.md" ]; then
            echo "Warning: No development log found for issue #${ISSUE_NUM}"
          fi
```

### Automated Reporting

Generate weekly report:

```bash
# scripts/generate-weekly-report.sh
#!/bin/bash
find docs/dev-logs -name "*.md" -mtime -7 | while read log; do
  echo "## $(basename $log)"
  grep "^## Session:" "$log" | wc -l
  echo "---"
done
```

### Custom Metrics

Extract metrics from logs:

```bash
# Count sessions this month
find docs/dev-logs -name "*.md" -mtime -30 | xargs grep "^## Session:" | wc -l

# List most active issues
grep -r "**Issue:**" docs/dev-logs/ | cut -d'#' -f2 | sort | uniq -c | sort -nr
```

---

## 🤝 Contributing

Found a bug or have a suggestion? This is your personal workflow system - customize it to your needs!

Ideas for improvements:
- Add more language-specific templates
- Create hooks for other events
- Build visualization dashboard for logs
- Add AI-powered log analysis

---

## 📄 License

MIT License - Feel free to use and modify for your projects!

---

## 🎉 Get Started Now!

```bash
# 1. Copy to your project
cp -r ~/workflow-system/.claude ~/your-project/
cp -r ~/workflow-system/.github ~/your-project/
cp -r ~/workflow-system/scripts ~/your-project/
mkdir -p ~/your-project/docs/dev-logs

# 2. Configure Claude Code hook (see Quick Start)

# 3. Create your first issue on GitHub

# 4. Start working
cd ~/your-project
./scripts/start-work.sh <issue-number>

# 5. Watch the magic happen! ✨
```

---

**Questions? Check [WORKFLOW.md](WORKFLOW.md) for the complete guide!**
