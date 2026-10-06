import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, copyFileSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), 'frontend-merge-test-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  function git(...args) {
    const result = spawnSync('git', args, { cwd: root, encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr);
    return result.stdout.trim();
  }
  function write(name, contents) {
    writeFileSync(join(root, name), contents);
  }
  function commit(message) {
    git('add', '.');
    git('commit', '-m', message);
  }
  function run(arg, fail = false) {
    return spawnSync(process.execPath, ['scripts/merge-main.mjs', arg], {
      cwd: root,
      encoding: 'utf8',
      env: { ...process.env, MERGE_TEST_FAIL: fail ? '1' : '0' },
    });
  }
  git('init', '--initial-branch=main');
  git('config', 'user.name', 'Merge Test');
  git('config', 'user.email', 'merge-test@example.invalid');
  git('config', 'commit.gpgsign', 'false');
  git('config', 'core.hooksPath', '/dev/null');
  mkdirSync(join(root, 'scripts'));
  copyFileSync(new URL('./merge-main.mjs', import.meta.url), join(root, 'scripts/merge-main.mjs'));
  write('package.json', JSON.stringify({ private: true, scripts: { check: 'node check.mjs' } }));
  write(
    'check.mjs',
    "import { existsSync } from 'node:fs'; if (process.env.MERGE_TEST_FAIL === '1' || !existsSync('host.txt') || !existsSync('remote.txt')) process.exit(1);\n",
  );
  write('shared.txt', 'base\n');
  commit('initial');
  git('checkout', '-b', 'feature');
  write('remote.txt', 'remote\n');
  commit('remote change');
  git('checkout', 'main');
  write('host.txt', 'host\n');
  commit('host change');
  return { root, git, write, commit, run };
}

test('validates the combined tree and creates a two-parent local merge', (t) => {
  const f = fixture(t);
  const base = f.git('rev-parse', 'HEAD');
  const target = f.git('rev-parse', 'feature');
  const result = f.run('feature');
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.equal(f.git('show', '-s', '--format=%P', 'HEAD'), `${base} ${target}`);
  assert.equal(f.git('status', '--porcelain'), '');
  assert.equal(existsSync(join(f.root, '.git/frontend-merge-main.json')), false);
});

test('failed checks leave main unchanged and continuation repeats checks', (t) => {
  const f = fixture(t);
  const base = f.git('rev-parse', 'HEAD');
  assert.equal(f.run('feature', true).status, 1);
  assert.equal(f.git('rev-parse', 'HEAD'), base);
  assert.equal(f.git('rev-parse', 'MERGE_HEAD'), f.git('rev-parse', 'feature'));
  assert.equal(f.run('--continue', true).status, 1);
  assert.equal(f.git('rev-parse', 'HEAD'), base);
  const result = f.run('--continue');
  assert.equal(result.status, 0, result.stdout + result.stderr);
});

test('refuses dirty worktrees and a branch other than main', (t) => {
  const f = fixture(t);
  const base = f.git('rev-parse', 'HEAD');
  f.write('untracked.txt', 'keep me');
  assert.equal(f.run('feature').status, 1);
  assert.equal(f.git('rev-parse', 'HEAD'), base);
  rmSync(join(f.root, 'untracked.txt'));
  f.git('checkout', 'feature');
  assert.equal(f.run('main').status, 1);
  assert.equal(f.git('branch', '--show-current'), 'feature');
});

test('conflicts require staged resolution before continuation', (t) => {
  const f = fixture(t);
  f.git('checkout', 'feature');
  f.write('shared.txt', 'remote choice\n');
  f.commit('remote conflict');
  f.git('checkout', 'main');
  f.write('shared.txt', 'host choice\n');
  f.commit('host conflict');
  const base = f.git('rev-parse', 'HEAD');
  assert.equal(f.run('feature').status, 1);
  assert.equal(f.run('--continue').status, 1);
  assert.equal(f.git('rev-parse', 'HEAD'), base);
  f.write('shared.txt', 'resolved choice\n');
  assert.equal(f.run('--continue').status, 1);
  f.git('add', 'shared.txt');
  const result = f.run('--continue');
  assert.equal(result.status, 0, result.stdout + result.stderr);
});

test('an aborted merge is not continued and an included branch is a no-op', (t) => {
  const f = fixture(t);
  assert.equal(f.run('feature', true).status, 1);
  f.git('merge', '--abort');
  assert.equal(f.run('--continue').status, 1);
  assert.equal(f.run('feature').status, 0);
  const merged = f.git('rev-parse', 'HEAD');
  assert.equal(f.run('feature').status, 0);
  assert.equal(f.git('rev-parse', 'HEAD'), merged);
});

test('refuses a merge changed outside the command', (t) => {
  const f = fixture(t);
  assert.equal(f.run('feature', true).status, 1);
  f.git('merge', '--abort');
  f.git('checkout', '-b', 'other');
  f.write('other.txt', 'other\n');
  f.commit('other branch');
  f.git('checkout', 'main');
  f.git('merge', '--no-ff', '--no-commit', 'other');
  const base = f.git('rev-parse', 'HEAD');
  assert.equal(f.run('--continue').status, 1);
  assert.equal(f.git('rev-parse', 'HEAD'), base);
});
