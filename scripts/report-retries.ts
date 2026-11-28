import * as fs from 'node:fs';
import * as path from 'node:path';
import type { RetryRecord } from '../src/support/retry-metrics';
import { getRetryMetricsPath, summarizeRetries } from '../src/support/retry-metrics';

const reportPath = path.resolve('reports/cucumber-report.json');
const runId = process.env.CUCUMBER_RUN_ID;

if (!runId) {
  throw new Error('CUCUMBER_RUN_ID must match the Cucumber test run.');
}

if (!fs.existsSync(reportPath)) {
  throw new Error(`Cucumber JSON report was not found: ${reportPath}`);
}

const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
const scenarios = report
  .flatMap((feature: { elements?: Array<{ type?: string }> }) => feature.elements ?? [])
  .filter((element: { type?: string }) => element.type === 'scenario');

const retryMetricsPath = getRetryMetricsPath(runId);
const retryRecords: RetryRecord[] = fs.existsSync(retryMetricsPath)
  ? fs
      .readFileSync(retryMetricsPath, 'utf8')
      .split(/\r?\n/)
      .filter(Boolean)
      .map((line) => JSON.parse(line) as RetryRecord)
  : [];
const summary = summarizeRetries(scenarios.length, retryRecords);
const retryRate = (summary.retryRate * 100).toFixed(1);

console.log(
  `Retry rate: ${summary.retriedScenarioCount}/${summary.scenarioCount} scenarios (${retryRate}%), ${summary.retryAttemptCount} retry-triggering failure(s).`,
);

for (const record of retryRecords) {
  console.log(`[Retried] ${record.featureUri} - ${record.scenarioName}`);
}

if (summary.retryAttemptCount > 0) {
  console.error('This run is not a clean pass because at least one scenario required a retry.');
  process.exitCode = 1;
}
