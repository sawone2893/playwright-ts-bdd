import { config } from './src/support/config.ts';

const common = {
  import: ['src/steps/**/*.ts', 'src/support/**/*.ts'],
  format: [
    'summary',
    'html:reports/cucumber-report.html',
    'json:reports/cucumber-report.json',
  ],
  parallel: config.parallelWorkers,
  retry: config.retryCount,
  retryTagFilter: '@flaky or not @smoke',
};

export default common;
