import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';

const loadConfig = (overrides: NodeJS.ProcessEnv) =>
  spawnSync(
    process.execPath,
    ['--import', 'tsx', '--input-type=module', '-e', "await import('./src/support/config.ts')"],
    {
      cwd: process.cwd(),
      encoding: 'utf8',
      env: { ...process.env, ENV: 'qa', ...overrides },
      timeout: 10000,
    },
  );

test('configuration rejects an unsupported browser', () => {
  const result = loadConfig({ BROWSER: 'safari' });

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Invalid configuration: BROWSER/);
});

test('configuration rejects an invalid boolean', () => {
  const result = loadConfig({ HEADLESS: 'yes' });

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /HEADLESS must be "true" or "false"/);
});

test('configuration rejects a non-positive API timeout', () => {
  const result = loadConfig({ API_TIMEOUT: '0' });

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /API_TIMEOUT must be a whole number/);
});
