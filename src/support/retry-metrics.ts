import * as fs from 'node:fs';
import * as path from 'node:path';

export interface RetryRecord {
  featureUri: string;
  scenarioName: string;
  pickleId: string;
  failedAttemptId: string;
}

export interface RetrySummary {
  scenarioCount: number;
  retriedScenarioCount: number;
  retryAttemptCount: number;
  retryRate: number;
}

export function getRetryMetricsPath(runId: string): string {
  const safeRunId = runId.replace(/[^a-zA-Z0-9_-]/g, '_');
  if (!safeRunId) {
    throw new Error('A non-empty Cucumber run ID is required for retry metrics.');
  }

  return path.resolve('reports', `cucumber-retries-${safeRunId}.jsonl`);
}

export function recordRetry(runId: string, record: RetryRecord): void {
  const metricsPath = getRetryMetricsPath(runId);
  fs.mkdirSync(path.dirname(metricsPath), { recursive: true });
  fs.appendFileSync(metricsPath, `${JSON.stringify(record)}\n`, 'utf8');
}

export function summarizeRetries(
  scenarioCount: number,
  records: readonly RetryRecord[],
): RetrySummary {
  if (!Number.isSafeInteger(scenarioCount) || scenarioCount < 0) {
    throw new Error('Scenario count must be a non-negative integer.');
  }

  const retriedScenarioCount = new Set(records.map((record) => record.pickleId)).size;

  return {
    scenarioCount,
    retriedScenarioCount,
    retryAttemptCount: records.length,
    retryRate: scenarioCount === 0 ? 0 : retriedScenarioCount / scenarioCount,
  };
}
