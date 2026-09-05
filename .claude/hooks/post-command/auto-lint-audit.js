#!/usr/bin/env node
/**
 * PostToolUse Hook: Automated Quality & Linter Audit Feedback
 * Triggered on tool: 'Edit|Write'
 * When code files (.ts, .js) are modified, provides deterministic context feedback
 * to remind the model to check types, schema validations, and module layers.
 */

const path = require('path');
const { readHookInput, outputHookSuccess, allowAction } = require('../utils/hook-io');

async function main() {
  const input = await readHookInput();
  const toolInput = input.tool_input || {};
  const filePath = toolInput.file_path || toolInput.path || toolInput.target_file || '';

  if (!filePath) {
    allowAction();
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  
  if (ext === '.ts' || ext === '.js') {
    let reminder = `[PostToolUse Audit] File '${path.basename(filePath)}' was updated.\n`;

    if (filePath.includes('services') || filePath.includes('src')) {
      reminder += `- Layer Reminder: Ensure strict adherence to Controller -> Service -> Repository / Listener pattern.\n` +
                  `- Validation Reminder: Ensure DTOs use class-validator or zod.\n` +
                  `- Run 'turbo run lint' or 'turbo run build' if you modified exported types or interfaces.`;
    } else {
      reminder += `- Verify syntax and formatting before concluding.`;
    }

    outputHookSuccess('PostToolUse', {
      additionalContext: reminder,
    });
    return;
  }

  allowAction();
}

main().catch((err) => {
  process.stderr.write(`PostToolUse error: ${err.message}\n`);
  process.exit(0); // Post-tool errors shouldn't crash the session
});
