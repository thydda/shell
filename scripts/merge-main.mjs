import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
function git(args, allowFailure = false) {
  const result = spawnSync('git', args, { cwd: root, encoding: 'utf8' });
  if (result.error) throw result.error;
  if (result.status !== 0 && !allowFailure) {
    throw new Error(result.stderr.trim() || result.stdout.trim() || `git ${args[0]} failed`);
  }
  return result;
}
function value(args) {
  return git(args).stdout.trim();
}
const statePath = resolve(root, value(['rev-parse', '--git-path', 'frontend-merge-main.json']));
function clearState() {
  if (existsSync(statePath)) unlinkSync(statePath);
}
function pendingMerge() {
  return git(['rev-parse', '--verify', 'MERGE_HEAD'], true).status === 0;
}

try {
  const args = process.argv.slice(2);
  if (args.length !== 1)
    throw new Error('Usage: npm run merge:main -- <local-branch> | --continue');
  if (value(['symbolic-ref', '--short', 'HEAD']) !== 'main')
    throw new Error('Switch to main first. No branch was changed.');
  let state;
  if (args[0] === '--continue') {
    if (!existsSync(statePath) || !pendingMerge())
      throw new Error('No pending merge created by this command.');
    state = JSON.parse(readFileSync(statePath, 'utf8'));
  } else {
    if (pendingMerge())
      throw new Error('A merge is already pending. Resolve it or use git merge --abort.');
    if (value(['status', '--porcelain']))
      throw new Error('Working tree must be clean, including untracked files.');
    git(['check-ref-format', '--branch', args[0]]);
    const target = value(['rev-parse', '--verify', `refs/heads/${args[0]}^{commit}`]);
    const base = value(['rev-parse', 'HEAD']);
    if (git(['merge-base', '--is-ancestor', target, base], true).status === 0) {
      console.log('The branch is already included in main. No merge needed.');
      process.exit(0);
    }
    state = { base, target };
    writeFileSync(statePath, JSON.stringify(state));
    const prepared = git(['merge', '--no-ff', '--no-commit', target], true);
    process.stdout.write(prepared.stdout);
    process.stderr.write(prepared.stderr);
    if (prepared.status !== 0) {
      if (!pendingMerge()) clearState();
      throw new Error(
        'Merge preparation failed. Resolve conflicts and use --continue, or abort with git merge --abort.',
      );
    }
  }
  if (
    value(['rev-parse', 'HEAD']) !== state.base ||
    value(['rev-parse', 'MERGE_HEAD']) !== state.target
  ) {
    throw new Error('Pending merge no longer matches the prepared branches. No commit created.');
  }
  if (value(['ls-files', '--unmerged']))
    throw new Error('Resolve and stage all conflicts before continuing.');
  if (
    git(['diff', '--quiet'], true).status !== 0 ||
    value(['ls-files', '--others', '--exclude-standard'])
  ) {
    throw new Error(
      'Stage all intended resolutions and remove unintended untracked files before continuing.',
    );
  }
  const tree = value(['write-tree']);
  console.log(
    'Validating the combined merge result. Complete the manual best-practices review before using this command.',
  );
  const check = spawnSync(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'check'], {
    cwd: root,
    stdio: 'inherit',
  });
  if (check.error) throw check.error;
  if (check.status !== 0)
    throw new Error(
      'Validation failed. Merge remains uncommitted. Fix and stage changes, then use --continue, or abort.',
    );
  if (
    value(['rev-parse', 'HEAD']) !== state.base ||
    value(['rev-parse', 'MERGE_HEAD']) !== state.target ||
    value(['write-tree']) !== tree ||
    git(['diff', '--quiet'], true).status !== 0 ||
    value(['ls-files', '--others', '--exclude-standard'])
  ) {
    throw new Error(
      'Repository changed during validation. Recheck and use --continue. No commit created.',
    );
  }
  const committed = git(['commit', '--no-edit']);
  process.stdout.write(committed.stdout);
  clearState();
  console.log('Validated merge committed locally. Nothing was pushed.');
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
