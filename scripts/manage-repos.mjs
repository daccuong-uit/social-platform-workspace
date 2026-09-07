import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const repositories = [
  '.',
  'platform',
  'frontend/social-web-client',
  'services/gateway',
  'services/iam-service',
  'services/media-service',
  'services/media-worker',
  'services/social-service',
];

const command = process.argv[2] ?? 'status';
const message = process.argv.slice(3).join(' ') || 'chore: synchronize workspace changes';

function run(repository, gitArguments, options = {}) {
  const cwd = resolve(root, repository);
  if (!existsSync(cwd)) {
    throw new Error(`Repository directory does not exist: ${repository}`);
  }

  return execFileSync('git', gitArguments, {
    cwd,
    encoding: 'utf8',
    stdio: options.capture ? ['ignore', 'pipe', 'pipe'] : 'inherit',
  });
}

function status() {
  for (const repository of repositories) {
    const output = run(repository, ['status', '--short', '--branch'], { capture: true }).trim();
    console.log(`\n[${repository}]\n${output || 'clean'}`);
  }
}

function verify() {
  execFileSync('docker', ['compose', 'config', '--quiet'], { cwd: root, stdio: 'inherit' });
  for (const repository of repositories) {
    run(repository, ['diff', '--check']);
  }
}

function hasStagedChanges(repository) {
  try {
    run(repository, ['diff', '--cached', '--quiet']);
    return false;
  } catch (error) {
    if (error.status === 1) {
      return true;
    }
    throw error;
  }
}

function commit() {
  for (const repository of repositories) {
    run(repository, ['add', '-A']);
    if (!hasStagedChanges(repository)) {
      console.log(`[${repository}] no changes to commit`);
      continue;
    }
    run(repository, ['commit', '-m', message]);
  }
}

function push() {
  for (const repository of repositories) {
    run(repository, ['push', 'origin', 'main']);
  }
}

switch (command) {
  case 'status':
    status();
    break;
  case 'verify':
    verify();
    break;
  case 'commit':
    commit();
    break;
  case 'push':
    push();
    break;
  default:
    throw new Error(`Unknown command: ${command}. Use status, verify, commit, or push.`);
}
