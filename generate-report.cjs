const report = require('multiple-cucumber-html-reporter');
const os = require('os');

const browserName = process.env.BROWSER || 'chromium';
const deviceName = process.env.DEVICE || 'Desktop (1920x1080)';

report.generate({
  jsonDir: './reports',
  reportPath: './reports/html-report',
  metadata: {
    browser: {
      name: browserName.toUpperCase(),
      version: 'Latest',
    },
    device: deviceName,
    platform: {
      name: os.platform(),
      version: os.release(),
    },
  },
  customData: {
    title: 'Run Details',
    data: [
      { label: 'Target Browser', value: browserName },
      { label: 'Device Profile', value: deviceName },
      { label: 'Execution Mode', value: 'Parallel Workers' },
    ],
  },
});