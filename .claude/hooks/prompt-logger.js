#!/usr/bin/env node

/**
 * Claude Code Prompt Logger Hook
 *
 * Automatically logs important interactions between user and Claude Code
 * Filters out trivial conversations and saves only development-relevant context
 *
 * Usage: This hook runs after each Claude Code interaction
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  // Where to save development logs
  logsDir: path.join(process.cwd(), 'docs', 'dev-logs'),

  // Minimum prompt length to consider logging (filters out trivial questions)
  minPromptLength: 50,

  // Keywords that indicate important technical conversations
  technicalKeywords: [
    'implement', 'create', 'add', 'fix', 'bug', 'error', 'test',
    'refactor', 'optimize', 'deploy', 'build', 'issue', 'feature',
    'architecture', 'design', 'database', 'api', 'endpoint',
    'function', 'class', 'component', 'service', 'model'
  ],

  // Keywords to ignore (casual conversations)
  ignoreKeywords: [
    'hello', 'hi', 'thanks', 'thank you', 'bye',
    'what time', 'what date', 'weather'
  ],

  // File patterns to ignore when logging file operations
  ignoreFilePatterns: [
    /node_modules/,
    /\.git\//,
    /dist\//,
    /build\//,
    /coverage\//
  ]
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if conversation is technically relevant
 */
function isRelevantConversation(userPrompt, claudeResponse) {
  const combined = (userPrompt + ' ' + claudeResponse).toLowerCase();

  // Too short = probably trivial
  if (userPrompt.length < CONFIG.minPromptLength) {
    return false;
  }

  // Contains ignore keywords = casual chat
  const hasIgnoreKeyword = CONFIG.ignoreKeywords.some(kw =>
    combined.includes(kw.toLowerCase())
  );
  if (hasIgnoreKeyword && !hasTechnicalKeyword(combined)) {
    return false;
  }

  // Contains technical keywords = important
  if (hasTechnicalKeyword(combined)) {
    return true;
  }

  // Contains code blocks = important
  if (claudeResponse.includes('```') || claudeResponse.includes('`')) {
    return true;
  }

  // Modified files mentioned = important
  if (claudeResponse.match(/\b\w+\.(js|py|ts|jsx|tsx|java|go|rs|cpp|h|css|html)\b/)) {
    return true;
  }

  return false;
}

function hasTechnicalKeyword(text) {
  return CONFIG.technicalKeywords.some(kw =>
    text.toLowerCase().includes(kw.toLowerCase())
  );
}

/**
 * Extract current git branch and issue number
 */
function getGitContext() {
  try {
    const branch = execSync('git branch --show-current', { encoding: 'utf-8' }).trim();

    // Extract issue number from branch name (e.g., feature/45-user-auth → 45)
    const issueMatch = branch.match(/(\d+)/);
    const issueNumber = issueMatch ? issueMatch[1] : null;

    return { branch, issueNumber };
  } catch (error) {
    return { branch: 'unknown', issueNumber: null };
  }
}

/**
 * Get list of modified files in current branch
 */
function getModifiedFiles() {
  try {
    const files = execSync('git diff --name-only HEAD', { encoding: 'utf-8' })
      .split('\n')
      .filter(f => f.trim() && !CONFIG.ignoreFilePatterns.some(p => p.test(f)));

    return files;
  } catch (error) {
    return [];
  }
}

/**
 * Format log entry
 */
function formatLogEntry(data) {
  const { userPrompt, claudeResponse, gitContext, modifiedFiles, timestamp } = data;

  const entry = `
## Session: ${timestamp}
**Branch:** \`${gitContext.branch}\`
${gitContext.issueNumber ? `**Issue:** #${gitContext.issueNumber}` : ''}

### 📝 User Prompt
\`\`\`
${userPrompt.trim()}
\`\`\`

### 🤖 Claude Response Summary
${extractSummary(claudeResponse)}

${modifiedFiles.length > 0 ? `### 📁 Files Modified
${modifiedFiles.map(f => `- ${f}`).join('\n')}
` : ''}

---
`;

  return entry;
}

/**
 * Extract key points from Claude's response (first 500 chars + code blocks)
 */
function extractSummary(response) {
  // Get first paragraph or 500 chars
  let summary = response.substring(0, 500);

  // If there are code blocks, include them
  const codeBlocks = response.match(/```[\s\S]*?```/g);
  if (codeBlocks && codeBlocks.length > 0) {
    summary += '\n\n**Code snippets provided:**\n' + codeBlocks[0];
  }

  if (response.length > 500) {
    summary += '\n\n_[Response truncated for brevity. See full context in Claude Code history.]_';
  }

  return summary;
}

/**
 * Save log entry to appropriate file
 */
function saveLogEntry(entry, gitContext) {
  // Ensure logs directory exists
  if (!fs.existsSync(CONFIG.logsDir)) {
    fs.mkdirSync(CONFIG.logsDir, { recursive: true });
  }

  // Determine log file name
  let logFileName;
  if (gitContext.issueNumber) {
    logFileName = `issue-${gitContext.issueNumber}.md`;
  } else {
    const date = new Date().toISOString().split('T')[0];
    logFileName = `session-${date}.md`;
  }

  const logFilePath = path.join(CONFIG.logsDir, logFileName);

  // Create or append to log file
  if (!fs.existsSync(logFilePath)) {
    const header = `# Development Log${gitContext.issueNumber ? ` - Issue #${gitContext.issueNumber}` : ''}

_Auto-generated by Claude Code Prompt Logger_

---
`;
    fs.writeFileSync(logFilePath, header);
  }

  fs.appendFileSync(logFilePath, entry);

  return logFilePath;
}

/**
 * Update index file
 */
function updateIndex(logFilePath, gitContext) {
  const indexPath = path.join(CONFIG.logsDir, 'README.md');

  if (!fs.existsSync(indexPath)) {
    fs.writeFileSync(indexPath, `# Development Logs Index

This directory contains auto-generated development logs from Claude Code sessions.

## Recent Sessions

`);
  }

  const logFileName = path.basename(logFilePath);
  const timestamp = new Date().toISOString();
  const indexEntry = `- [${timestamp}] [${logFileName}](./${logFileName}) - Branch: \`${gitContext.branch}\`\n`;

  // Read current index
  let indexContent = fs.readFileSync(indexPath, 'utf-8');

  // Add entry if not already present
  if (!indexContent.includes(logFileName)) {
    indexContent += indexEntry;
    fs.writeFileSync(indexPath, indexContent);
  }
}

// ============================================================================
// MAIN HOOK LOGIC
// ============================================================================

function main() {
  // Read input from stdin (Claude Code passes conversation data)
  const input = process.argv[2];

  if (!input) {
    console.error('No input provided to hook');
    process.exit(0);
  }

  try {
    // Parse conversation data
    const data = JSON.parse(input);
    const { userPrompt, claudeResponse } = data;

    // Filter: Only log relevant conversations
    if (!isRelevantConversation(userPrompt, claudeResponse)) {
      console.log('Skipping: Not technically relevant');
      process.exit(0);
    }

    // Gather context
    const gitContext = getGitContext();
    const modifiedFiles = getModifiedFiles();
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

    // Format log entry
    const entry = formatLogEntry({
      userPrompt,
      claudeResponse,
      gitContext,
      modifiedFiles,
      timestamp
    });

    // Save to file
    const logFilePath = saveLogEntry(entry, gitContext);
    updateIndex(logFilePath, gitContext);

    console.log(`✅ Logged to: ${path.relative(process.cwd(), logFilePath)}`);

  } catch (error) {
    console.error('Hook error:', error.message);
    // Don't fail the main Claude Code operation
    process.exit(0);
  }
}

// Run hook
if (require.main === module) {
  main();
}

module.exports = { isRelevantConversation, formatLogEntry };
