import assert from 'node:assert/strict';
import { test } from 'node:test';
import { type RetryRecord, summarizeRetries } from '../src/support/retry-metrics';

const record = (pickleId: string, failedAttemptId: string): RetryRecord => ({
  featureUri: 'features/login.feature',
  scenarioName: 'Successful login',
  pickleId,
  failedAttemptId,
});

test('retry rate counts unique retried scenarios and all retry-triggering failures', () => {
  const summary = summarizeRetries(4, [
    record('scenario-1', 'attempt-1'),
    record('scenario-1', 'attempt-2'),
    record('scenario-2', 'attempt-3'),
  ]);

  assert.deepEqual(summary, {
    scenarioCount: 4,
    retriedScenarioCount: 2,
    retryAttemptCount: 3,
    retryRate: 0.5,
  });
});

test('retry rate is zero when no scenarios were executed', () => {
  assert.deepEqual(summarizeRetries(0, []), {
    scenarioCount: 0,
    retriedScenarioCount: 0,
    retryAttemptCount: 0,
    retryRate: 0,
  });
});
