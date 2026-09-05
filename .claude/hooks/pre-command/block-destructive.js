#!/usr/bin/env node
/**
 * PreToolUse Hook: Destructive Command Guard
 * Triggered on tool: 'Bash'
 * Intercepts dangerous operations like deleting critical directories, dropping databases,
 * or committing sensitive files/keys.
 */

const { readHookInput, blockAction, allowAction } = require('../utils/hook-io');

const DANGEROUS_PATTERNS = [
  {
    pattern: /(?:rm\s+-(?:rf|fr|r)\s+(?:[\/\\]|\*|\.|\.\.|\b(?:services|src|frontend)\b(?!\/)))/i,
    reason: 'Destructive deletion of critical workspace folders or root is forbidden.',
  },
  {
    pattern: /(?:prisma\s+migrate\s+reset|prisma\s+db\s+push\s+--force-reset)/i,
    reason: 'Database destructive reset commands must be executed manually by human operator.',
  },
  {
    pattern: /(?:git\s+push\s+(?:--force|-f))/i,
    reason: 'Force-pushing to git repository is blocked by deterministic guardrail.',
  },
  {
    pattern: /(?:git\s+add\s+.*\.(?:env|pem|key|crt)(?:\s|$))/i,
    reason: 'Staging environment (.env) or private key/certificate files is strictly prohibited.',
  },
  {
    pattern: /(?:drop\s+database|truncate\s+table)/i,
    reason: 'Direct destructive SQL database operations are blocked.',
  },
];

async function main() {
  const input = await readHookInput();
  const toolName = input.tool_name || '';
  const toolInput = input.tool_input || {};
  const command = toolInput.command || '';

  if (toolName === 'Bash' && command) {
    for (const check of DANGEROUS_PATTERNS) {
      if (check.pattern.test(command)) {
        blockAction(check.reason);
        return;
      }
    }
  }

  // Safe command
  allowAction();
}

main().catch((err) => {
  process.stderr.write(`Hook error: ${err.message}\n`);
  process.exit(1);
});
