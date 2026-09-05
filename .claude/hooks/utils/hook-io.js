/**
 * Claude Code Hook Helper Utilities
 * Pure Node.js - Zero external runtime dependencies.
 * Follows Anthropic Claude Code Hooks JSON-RPC specification.
 */

const fs = require('fs');

/**
 * Read and parse JSON payload piped into stdin by Claude Code CLI
 * @returns {Promise<Object>} The hook context object
 */
function readHookInput() {
  return new Promise((resolve) => {
    let rawData = '';

    process.stdin.setEncoding('utf8');

    process.stdin.on('data', (chunk) => {
      rawData += chunk;
    });

    process.stdin.on('end', () => {
      if (!rawData || rawData.trim().length === 0) {
        resolve({});
        return;
      }
      try {
        const parsed = JSON.parse(rawData);
        resolve(parsed);
      } catch (err) {
        // Fallback: If not valid JSON, treat as empty context
        resolve({});
      }
    });

    process.stdin.resume();
  });
}

/**
 * Output structured decision response to stdout and exit with 0
 * @param {string} eventName Name of the hook event (e.g. 'PreToolUse', 'PostToolUse')
 * @param {Object} outputData Object containing fields like permissionDecision, permissionDecisionReason, additionalContext
 */
function outputHookSuccess(eventName, outputData = {}) {
  const payload = {
    hookSpecificOutput: {
      hookEventName: eventName,
      ...outputData,
    },
  };
  process.stdout.write(JSON.stringify(payload) + '\n');
  process.exit(0);
}

/**
 * Deterministically block action using official Claude Code Exit Code 2
 * Any message sent to stderr is returned to the agent as the blocking reason.
 * @param {string} reason Explanatory message for why the tool or action was blocked
 */
function blockAction(reason) {
  process.stderr.write(`[BLOCKED BY HOOK]: ${reason}\n`);
  process.exit(2);
}

/**
 * Exit normally with code 0 without any modification
 */
function allowAction() {
  process.exit(0);
}

module.exports = {
  readHookInput,
  outputHookSuccess,
  blockAction,
  allowAction,
};
