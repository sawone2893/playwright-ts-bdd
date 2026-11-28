import { config } from './src/support/config.ts';

const common = {
  import: ['src/steps/**/*.ts', 'src/support/**/*.ts'],
  format: [
    'summary',
    'html:reports/cucumber-report.html',
    'json:reports/cucumber-report.json',
  ],
};

const defaultProfile = {
  ...common,
  parallel: config.parallelWorkers,
  retry: config.retryCount,
  retryTagFilter: '@flaky or not @smoke',
};

const single = {
  ...common,
  format: ['summary'],
  parallel: 1,
  retry: 0,
};

export { defaultProfile as default, single };
