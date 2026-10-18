#!/usr/bin/env node
/**
 * SessionStart Lifecycle Hook
 * Triggered on: 'SessionStart'
 * Injects deterministic workspace overview, active services, and architecture invariants.
 */

const fs = require('fs');
const path = require('path');
const { readHookInput, outputHookSuccess, allowAction } = require('../utils/hook-io');

async function main() {
  const input = await readHookInput();
  const source = input.source || 'startup';

  const contextMessage = 
    `=== Social Platform Workspace Active ===\n` +
    `- Event: SessionStart (Source: ${source})\n` +
    `- Polyrepo Architecture: Independent Fastify + NestJS services\n` +
    `- Active Microservices: gateway, iam-service, social-service, media-service, stories-service, media-worker\n` +
    `- Shared Packages: platform/ and platform-frontend/; verify registry availability before consumer migrations\n` +
    `- Invariant Rule: Cross-service direct relative imports are forbidden by PreToolUse hooks.\n` +
    `- For task guidance, consult CLAUDE.md and docs/architecture/.`;

  outputHookSuccess('SessionStart', {
    additionalContext: contextMessage,
  });
}

main().catch((err) => {
  process.stderr.write(`SessionStart error: ${err.message}\n`);
  allowAction();
});
