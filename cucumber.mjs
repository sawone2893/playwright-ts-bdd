import { randomUUID } from 'node:crypto';
import { config } from './src/support/config.ts';

process.env.CUCUMBER_RUN_ID ??= randomUUID();
console.log(`[Cucumber] Retry metrics run ID: ${process.env.CUCUMBER_RUN_ID}`);

const common = {
  import: ['src/steps/**/*.ts', 'src/support/**/*.ts'],
  format: ['summary', 'html:reports/cucumber-report.html', 'json:reports/cucumber-report.json'],
};

const defaultProfile = {
  ...common,
  parallel: config.parallelWorkers,
  retry: config.retryCount,
  retryTagFilter: '@flaky',
};

const single = {
  ...common,
  format: ['summary'],
  parallel: 1,
  retry: 0,
};

export { defaultProfile as default, single };
