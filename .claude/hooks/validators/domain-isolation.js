#!/usr/bin/env node
/**
 * PreToolUse Validator: Microservice Domain Isolation Guard
 * Triggered on tool: 'Edit|Write'
 * Enforces Architectural Invariants:
 * 1. Prohibits direct relative imports between microservices (e.g. `../../services/auth-service` inside social-service).
 * 2. Enforces usage of @platform/* packages from services/shared-kernel.
 */

const { readHookInput, blockAction, allowAction } = require('../utils/hook-io');

// Match relative import crossing services boundaries
// e.g. from '../services/auth-service' or '../../services/identity-service'
const CROSS_SERVICE_IMPORT_REGEX = /(?:import|from|require)\s*\(?['"][^'"]*\/services\/(?:iam-service|gateway|social-service|media-service)/i;

async function main() {
  const input = await readHookInput();
  const toolName = input.tool_name || '';
  const toolInput = input.tool_input || {};

  // Check file content to be written
  const content = toolInput.content || toolInput.new_string || toolInput.replacement || '';
  const targetPath = toolInput.file_path || toolInput.path || toolInput.target_file || '';

  if ((toolName === 'Edit' || toolName === 'Write') && content) {
    if (CROSS_SERVICE_IMPORT_REGEX.test(content)) {
      blockAction(
        `Architecture Violation: Direct relative cross-service imports are prohibited. ` +
        `Target file: ${targetPath}. ` +
        `Services must communicate via API Gateway or shared packages under @platform/* namespace.`
      );
      return;
    }
  }

  allowAction();
}

main().catch((err) => {
  process.stderr.write(`Validator error: ${err.message}\n`);
  process.exit(1);
});
