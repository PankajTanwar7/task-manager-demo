#!/bin/bash

# Test script for prompt logger hook
# Usage: ./test-hook.sh

echo "🧪 Testing Claude Code UserPromptSubmit Hook"
echo "=============================================="
echo ""

# Test 1: Technical prompt (should be logged)
echo "Test 1: Technical prompt (should log)"
echo '{"prompt":"Please implement user authentication with JWT tokens in src/auth.js","hook_event_name":"UserPromptSubmit","cwd":"'$(pwd)'","session_id":"test123"}' | .claude/hooks/user-prompt-submit.sh
echo ""

# Test 2: Short prompt (should skip)
echo "Test 2: Short prompt (should skip - too short)"
echo '{"prompt":"Hi","hook_event_name":"UserPromptSubmit","cwd":"'$(pwd)'","session_id":"test124"}' | .claude/hooks/user-prompt-submit.sh
echo ""

# Test 3: Greeting (should skip)
echo "Test 3: Greeting (should skip - not technical)"
echo '{"prompt":"Hello, how are you today? Can you help me with something?","hook_event_name":"UserPromptSubmit","cwd":"'$(pwd)'","session_id":"test125"}' | .claude/hooks/user-prompt-submit.sh
echo ""

# Test 4: File-related prompt (should log)
echo "Test 4: File-related prompt (should log)"
echo '{"prompt":"Can you read the package.json file and update the version number?","hook_event_name":"UserPromptSubmit","cwd":"'$(pwd)'","session_id":"test126"}' | .claude/hooks/user-prompt-submit.sh
echo ""

# Test 5: Bug fix (should log)
echo "Test 5: Bug fix prompt (should log)"
echo '{"prompt":"There is a bug in the login function where users cannot authenticate. Please fix the authentication logic in the UserController class.","hook_event_name":"UserPromptSubmit","cwd":"'$(pwd)'","session_id":"test127"}' | .claude/hooks/user-prompt-submit.sh
echo ""

echo "=============================================="
echo "✅ Test complete!"
echo ""
echo "Check results:"
echo "  ls -la docs/dev-logs/"
echo "  cat docs/dev-logs/*.md"
echo ""
