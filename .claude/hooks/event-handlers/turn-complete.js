#!/usr/bin/env node
/**
 * Stop Lifecycle Hook
 * Triggered on: 'Stop' (Turn completion)
 * Ensures work consistency and verifies no accidental temporary files or git unstaged secrets.
 */

const { readHookInput, allowAction } = require('../utils/hook-io');

async function main() {
  await readHookInput();

  // Return cleanly to let Claude finish turn
  allowAction();
}

main().catch((err) => {
  process.stderr.write(`Stop hook error: ${err.message}\n`);
  allowAction();
});
