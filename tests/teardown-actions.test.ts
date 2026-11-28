import assert from 'node:assert/strict';
import { mock, test } from 'node:test';
import { runTeardownActions } from '../src/support/teardown-actions';

test('teardown continues cleanup actions after an artifact action fails', async () => {
  const actionsRun: string[] = [];
  const errorLog = mock.method(console, 'error', () => undefined);

  let failures: Error[];
  try {
    failures = await runTeardownActions([
      {
        operation: 'capture screenshot',
        run: async () => {
          actionsRun.push('screenshot');
          throw new Error('disk unavailable');
        },
      },
      {
        operation: 'close page',
        run: async () => {
          actionsRun.push('page');
        },
      },
      {
        operation: 'close context',
        run: async () => {
          actionsRun.push('context');
        },
      },
    ]);
  } finally {
    errorLog.mock.restore();
  }

  assert.deepEqual(actionsRun, ['screenshot', 'page', 'context']);
  assert.equal(failures.length, 1);
  assert.match(failures[0].message, /capture screenshot failed: disk unavailable/);
});
