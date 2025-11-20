#!/usr/bin/env node

/**
 * Claude Code GitHub Commenter Hook
 *
 * Automatically posts comments to GitHub Issues AND PRs with summary of:
 * - What prompt was asked
 * - What tools were used (files written/edited)
 * - Brief summary of what was done
 *
 * LOGIC:
 * 1. Extract issue number from branch (feature/5-login → Issue #5)
 * 2. Post to Issue #5 (implementation phase)
 * 3. If PR exists, also post to PR (review phase)
 * 4. Keep local logs as backup
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  // Tools that trigger comments
  significantTools: ['Write', 'Edit', 'Bash'],

  // Minimum tools used before commenting
  minToolsThreshold: 2,

  // Session tracking file
  sessionFile: path.join(process.cwd(), '.claude', 'session-tracking.json'),
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get issue number from branch name
 */
function getIssueFromBranch() {
  try {
    const branch = execSync('git branch --show-current', { encoding: 'utf-8' }).trim();

    // Extract issue number from branch name
    // Matches: feature/5-login, fix/123-bug, issue-42, etc.
    const match = branch.match(/(?:feature|fix|issue|refactor|chore)\/(\d+)/i) || branch.match(/^(\d+)-/);

    return match ? parseInt(match[1]) : null;
  } catch (error) {
    return null;
  }
}

/**
 * Get current PR number from branch
 */
function getCurrentPR() {
  try {
    const branch = execSync('git branch --show-current', { encoding: 'utf-8' }).trim();

    const prs = execSync(`gh pr list --head ${branch} --json number --jq '.[0].number'`, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'ignore']
    }).trim();

    return prs ? parseInt(prs) : null;
  } catch (error) {
    return null;
  }
}

/**
 * Load session tracking data
 */
function loadSession() {
  try {
    if (fs.existsSync(CONFIG.sessionFile)) {
      const data = fs.readFileSync(CONFIG.sessionFile, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    // Ignore
  }

  return {
    lastPrompt: '',
    toolsUsed: [],
    filesModified: [],
    startTime: Date.now()
  };
}

/**
 * Save session tracking data
 */
function saveSession(session) {
  try {
    const dir = path.dirname(CONFIG.sessionFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CONFIG.sessionFile, JSON.stringify(session, null, 2));
  } catch (error) {
    // Ignore
  }
}

/**
 * Clear session data
 */
function clearSession() {
  try {
    if (fs.existsSync(CONFIG.sessionFile)) {
      fs.unlinkSync(CONFIG.sessionFile);
    }
  } catch (error) {
    // Ignore
  }
}

/**
 * Format GitHub comment
 */
function formatComment(data, context) {
  const { prompt, toolsUsed, filesModified, duration } = data;
  const { isIssue, isPR, number } = context;

  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const durationStr = duration > 60000
    ? `${Math.round(duration / 60000)}m`
    : `${Math.round(duration / 1000)}s`;

  let comment = '';

  // Header depends on context
  if (isIssue) {
    comment += `## 💻 Claude Code Implementation Update\n\n`;
    comment += `**Time:** ${timestamp} | **Duration:** ${durationStr}\n\n`;
  } else {
    comment += `## 🤖 Claude Code Session Summary\n\n`;
    comment += `**Time:** ${timestamp} (${durationStr})\n\n`;
  }

  // User prompt
  comment += `### 📝 Prompt Asked\n\`\`\`\n${prompt.substring(0, 300)}${prompt.length > 300 ? '...' : ''}\n\`\`\`\n\n`;

  // What was done
  comment += `### ✅ What Was Done\n\n`;

  const written = filesModified.filter(f => f.operation === 'Write');
  const edited = filesModified.filter(f => f.operation === 'Edit');
  const commands = toolsUsed.filter(t => t.tool === 'Bash');

  if (written.length > 0) {
    comment += `**Files Created (${written.length}):**\n`;
    written.forEach(f => {
      comment += `- \`${f.file}\`\n`;
    });
    comment += `\n`;
  }

  if (edited.length > 0) {
    comment += `**Files Edited (${edited.length}):**\n`;
    edited.forEach(f => {
      comment += `- \`${f.file}\`\n`;
    });
    comment += `\n`;
  }

  if (commands.length > 0) {
    comment += `**Commands Run (${commands.length}):**\n`;
    commands.slice(0, 5).forEach(c => {
      const cmd = c.description || c.command || 'command';
      comment += `- ${cmd.substring(0, 100)}\n`;
    });
    if (commands.length > 5) {
      comment += `- ... and ${commands.length - 5} more\n`;
    }
    comment += `\n`;
  }

  // Summary
  const totalFiles = written.length + edited.length;
  comment += `### 📊 Summary\n\n`;
  comment += `- **Total files modified:** ${totalFiles}\n`;
  comment += `- **Tools used:** ${toolsUsed.length}\n`;
  comment += `- **Duration:** ${durationStr}\n\n`;

  comment += `---\n`;
  if (isIssue) {
    comment += `*🤖 Automated update from Claude Code - Implementation in progress*\n`;
  } else {
    comment += `*Auto-generated by Claude Code*\n`;
  }

  return comment;
}

/**
 * Post comment to GitHub (Issue or PR)
 */
function postGitHubComment(type, number, comment) {
  try {
    const tempFile = path.join('/tmp', `github-comment-${Date.now()}.md`);
    fs.writeFileSync(tempFile, comment);

    let cmd;
    if (type === 'issue') {
      cmd = `gh issue comment ${number} --body-file ${tempFile}`;
    } else {
      cmd = `gh pr comment ${number} --body-file ${tempFile}`;
    }

    execSync(cmd, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'ignore']
    });

    fs.unlinkSync(tempFile);

    return true;
  } catch (error) {
    console.error(`[github-commenter] Failed to post ${type} comment: ${error.message}`);
    return false;
  }
}

// ============================================================================
// MAIN HOOK LOGIC
// ============================================================================

function main() {
  // Read input from stdin
  let inputData = '';

  try {
    inputData = fs.readFileSync(0, 'utf-8');
  } catch (error) {
    process.exit(0);
  }

  if (!inputData.trim()) {
    process.exit(0);
  }

  try {
    const hookData = JSON.parse(inputData);

    // Get issue and PR numbers
    const issueNumber = getIssueFromBranch();
    const prNumber = getCurrentPR();

    // Need at least one target
    if (!issueNumber && !prNumber) {
      // Not on an issue/PR branch, skip
      process.exit(0);
    }

    // Load session data
    const session = loadSession();

    // Handle UserPromptSubmit - save prompt
    if (hookData.hook_event_name === 'UserPromptSubmit') {
      session.lastPrompt = hookData.prompt || '';
      session.toolsUsed = [];
      session.filesModified = [];
      session.startTime = Date.now();
      saveSession(session);
      process.exit(0);
    }

    // Handle PostToolUse - track tools
    if (hookData.hook_event_name === 'PostToolUse') {
      const toolName = hookData.tool_name;

      if (CONFIG.significantTools.includes(toolName)) {
        session.toolsUsed.push({
          tool: toolName,
          description: hookData.description,
          command: hookData.command
        });

        // Track file modifications
        if (toolName === 'Write' || toolName === 'Edit') {
          const filePath = hookData.file_path || hookData.parameters?.file_path || '';
          if (filePath) {
            session.filesModified.push({
              file: path.relative(process.cwd(), filePath),
              operation: toolName
            });
          }
        }

        saveSession(session);
      }

      // Check if we should post comments (after threshold)
      if (session.toolsUsed.length >= CONFIG.minToolsThreshold) {
        const duration = Date.now() - session.startTime;

        // Post to Issue first (implementation phase)
        if (issueNumber) {
          const comment = formatComment({
            prompt: session.lastPrompt,
            toolsUsed: session.toolsUsed,
            filesModified: session.filesModified,
            duration: duration
          }, { isIssue: true, isPR: false, number: issueNumber });

          const posted = postGitHubComment('issue', issueNumber, comment);
          if (posted) {
            console.log(`✓ Posted implementation update to Issue #${issueNumber}`);
          }
        }

        // Also post to PR if exists (review phase)
        if (prNumber) {
          const comment = formatComment({
            prompt: session.lastPrompt,
            toolsUsed: session.toolsUsed,
            filesModified: session.filesModified,
            duration: duration
          }, { isIssue: false, isPR: true, number: prNumber });

          const posted = postGitHubComment('pr', prNumber, comment);
          if (posted) {
            console.log(`✓ Posted session summary to PR #${prNumber}`);
          }
        }

        // Clear session after posting
        clearSession();
      }
    }

  } catch (error) {
    console.error(`[github-commenter] Error: ${error.message}`);
  }

  process.exit(0);
}

// Run hook
if (require.main === module) {
  main();
}

module.exports = { formatComment, getIssueFromBranch, getCurrentPR };
