import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');

const allRepositories = [
  '.',
  'platform',
  'frontend/social-web-client',
  'frontend/iam-web-client',
  'frontend/video-web-client',
  'frontend/shop-web-client',
  'frontend/stories-web-client',
  'frontend/portfolio-web-client',
  'services/gateway',
  'services/iam-service',
  'services/media-service',
  'services/media-worker',
  'services/social-service',
];

const aliasMap = {
  root: '.',
  workspace: '.',
  platform: 'platform',
  'fe-social': 'frontend/social-web-client',
  'social-web-client': 'frontend/social-web-client',
  'fe-iam': 'frontend/iam-web-client',
  'iam-web-client': 'frontend/iam-web-client',
  'fe-video': 'frontend/video-web-client',
  'video-web-client': 'frontend/video-web-client',
  'fe-shop': 'frontend/shop-web-client',
  'shop-web-client': 'frontend/shop-web-client',
  'fe-stories': 'frontend/stories-web-client',
  'stories-web-client': 'frontend/stories-web-client',
  'fe-portfolio': 'frontend/portfolio-web-client',
  'portfolio-web-client': 'frontend/portfolio-web-client',
  gateway: 'services/gateway',
  'iam-service': 'services/iam-service',
  'media-service': 'services/media-service',
  'media-worker': 'services/media-worker',
  'social-service': 'services/social-service',
};

const args = process.argv.slice(2);
const command = args[0] ?? 'status';

let targetRepo = null;
const messageArgs = [];

for (let i = 1; i < args.length; i++) {
  const arg = args[i];
  if (arg.startsWith('--repo=')) {
    targetRepo = arg.split('=')[1];
  } else if (!targetRepo && (aliasMap[arg] || allRepositories.includes(arg))) {
    targetRepo = aliasMap[arg] || arg;
  } else {
    messageArgs.push(arg);
  }
}

const resolvedRepo = targetRepo ? (aliasMap[targetRepo] || targetRepo) : null;
if (targetRepo && (!resolvedRepo || !allRepositories.includes(resolvedRepo))) {
  console.error(`Error: Unknown repository or alias "${targetRepo}".`);
  console.error(`Available aliases: ${Object.keys(aliasMap).join(', ')}`);
  process.exit(1);
}

const repositories = resolvedRepo ? [resolvedRepo] : allRepositories;
const message = messageArgs.join(' ') || 'chore: synchronize workspace changes';

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
