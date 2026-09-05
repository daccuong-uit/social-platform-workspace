#!/usr/bin/env node
/**
 * Automated Verification Suite for Claude Code Hooks
 * Simulates Claude Code CLI JSON-RPC payloads over stdin/stdout
 * Verifies Exit Codes, Stderr Blocking, and Json-RPC responses.
 */

const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const HOOKS_DIR = path.resolve(__dirname, '..');
let totalTests = 0;
let passedTests = 0;

function runHookTest({ name, scriptPath, stdinPayload, expectedExitCode, expectedStderrContains, expectedStdoutContains }) {
  totalTests++;
  process.stdout.write(`Testing: ${name}... `);

  const fullPath = path.join(HOOKS_DIR, scriptPath);
  const result = spawnSync(process.execPath, [fullPath], {
    input: JSON.stringify(stdinPayload),
    encoding: 'utf8',
    timeout: 5000,
  });

  const exitCodeMatch = result.status === expectedExitCode;
  const stderrMatch = expectedStderrContains
    ? (result.stderr || '').includes(expectedStderrContains)
    : true;
  const stdoutMatch = expectedStdoutContains
    ? (result.stdout || '').includes(expectedStdoutContains)
    : true;

  if (exitCodeMatch && stderrMatch && stdoutMatch) {
    console.log('\x1b[32m[PASS]\x1b[0m');
    passedTests++;
  } else {
    console.log('\x1b[31m[FAIL]\x1b[0m');
    console.error(`  Expected Exit Code: ${expectedExitCode}, Actual: ${result.status}`);
    if (expectedStderrContains) {
      console.error(`  Expected Stderr to contain: "${expectedStderrContains}"`);
      console.error(`  Actual Stderr: "${result.stderr.trim()}"`);
    }
    if (expectedStdoutContains) {
      console.error(`  Expected Stdout to contain: "${expectedStdoutContains}"`);
      console.error(`  Actual Stdout: "${result.stdout.trim()}"`);
    }
  }
}

console.log('====================================================');
console.log('CLAUDE CODE HOOKS VERIFICATION SUITE (OFFICIAL SPEC)');
console.log('====================================================\n');

// 1. Test Block Destructive Hook (PreToolUse)
runHookTest({
  name: 'PreToolUse: Block destructive "rm -rf services"',
  scriptPath: 'pre-command/block-destructive.js',
  stdinPayload: {
    hook_event_name: 'PreToolUse',
    tool_name: 'Bash',
    tool_input: { command: 'rm -rf services' },
  },
  expectedExitCode: 2, // Official Anthropic exit code for blocking tool execution
  expectedStderrContains: '[BLOCKED BY HOOK]',
});

runHookTest({
  name: 'PreToolUse: Block destructive "prisma migrate reset"',
  scriptPath: 'pre-command/block-destructive.js',
  stdinPayload: {
    hook_event_name: 'PreToolUse',
    tool_name: 'Bash',
    tool_input: { command: 'npx prisma migrate reset' },
  },
  expectedExitCode: 2,
  expectedStderrContains: 'Database destructive reset commands must be executed manually',
});

runHookTest({
  name: 'PreToolUse: Block "git push --force"',
  scriptPath: 'pre-command/block-destructive.js',
  stdinPayload: {
    hook_event_name: 'PreToolUse',
    tool_name: 'Bash',
    tool_input: { command: 'git push --force origin main' },
  },
  expectedExitCode: 2,
  expectedStderrContains: 'Force-pushing to git repository is blocked',
});

runHookTest({
  name: 'PreToolUse: Block accidental commit of .env file',
  scriptPath: 'pre-command/block-destructive.js',
  stdinPayload: {
    hook_event_name: 'PreToolUse',
    tool_name: 'Bash',
    tool_input: { command: 'git add services/social-service/.env' },
  },
  expectedExitCode: 2,
  expectedStderrContains: 'Staging environment (.env)',
});

runHookTest({
  name: 'PreToolUse: Allow safe build command',
  scriptPath: 'pre-command/block-destructive.js',
  stdinPayload: {
    hook_event_name: 'PreToolUse',
    tool_name: 'Bash',
    tool_input: { command: 'npm run build' },
  },
  expectedExitCode: 0,
});

// 2. Test Domain Isolation Validator (PreToolUse)
runHookTest({
  name: 'PreToolUse: Block relative cross-service import',
  scriptPath: 'validators/domain-isolation.js',
  stdinPayload: {
    hook_event_name: 'PreToolUse',
    tool_name: 'Edit',
    tool_input: {
      file_path: 'services/social-service/src/posts/post.service.ts',
      content: "import { AuthService } from '../../services/iam-service/auth-service/src/auth.service';",
    },
  },
  expectedExitCode: 2,
  expectedStderrContains: 'Architecture Violation: Direct relative cross-service imports are prohibited',
});

runHookTest({
  name: 'PreToolUse: Allow valid internal import and @platform package',
  scriptPath: 'validators/domain-isolation.js',
  stdinPayload: {
    hook_event_name: 'PreToolUse',
    tool_name: 'Write',
    tool_input: {
      file_path: 'services/social-service/src/posts/post.service.ts',
      content: "import { AppLogger } from '@platform/logger';\nimport { PostEntity } from '../entities/post.entity';",
    },
  },
  expectedExitCode: 0,
});

// 3. Test PostToolUse Audit Feedback
runHookTest({
  name: 'PostToolUse: Feedback layer reminder after editing TypeScript file',
  scriptPath: 'post-command/auto-lint-audit.js',
  stdinPayload: {
    hook_event_name: 'PostToolUse',
    tool_name: 'Edit',
    tool_input: {
      file_path: 'services/social-service/src/modules/posts/services/posts.service.ts',
    },
  },
  expectedExitCode: 0,
  expectedStdoutContains: 'hookSpecificOutput',
});

// 4. Test SessionStart Lifecycle Event
runHookTest({
  name: 'SessionStart: Inject workspace context',
  scriptPath: 'event-handlers/session-start.js',
  stdinPayload: {
    hook_event_name: 'SessionStart',
    source: 'startup',
  },
  expectedExitCode: 0,
  expectedStdoutContains: 'Social Platform Workspace Active',
});

// 5. Test Turn Complete (Stop)
runHookTest({
  name: 'Stop: Turn complete cleanly',
  scriptPath: 'event-handlers/turn-complete.js',
  stdinPayload: {
    hook_event_name: 'Stop',
  },
  expectedExitCode: 0,
});

console.log('\n----------------------------------------------------');
console.log(`Results: ${passedTests}/${totalTests} tests passed.`);
console.log('----------------------------------------------------');

if (passedTests === totalTests) {
  console.log('\x1b[32mAll Claude Code Hooks verified successfully against Official Spec!\x1b[0m');
  process.exit(0);
} else {
  console.error('\x1b[31mSome hook verification tests failed!\x1b[0m');
  process.exit(1);
}
