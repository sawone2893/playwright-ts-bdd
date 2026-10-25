const os = require('os');
const fs = require('fs');
const path = require('path');

// Safe loader that bypasses Node 22/24 package.json "exports" restrictions
function loadReporter() {
  try {
    return require('multiple-cucumber-html-reporter');
  } catch (error) {
    if (error.code === 'ERR_PACKAGE_PATH_NOT_EXPORTED') {
      const pkgDir = path.resolve(process.cwd(), 'node_modules/multiple-cucumber-html-reporter');
      const pkgJson = JSON.parse(fs.readFileSync(path.join(pkgDir, 'package.json'), 'utf8'));
      const mainFile = pkgJson.main || 'index.js';
      return require(path.join(pkgDir, mainFile));
    }
    throw error;
  }
}

const report = loadReporter();
const jsonFilePath = path.resolve(process.cwd(), 'reports/cucumber-report.json');

// Verify that the cucumber test output exists
if (!fs.existsSync(jsonFilePath)) {
  console.error(`\x1b[31m[Report Error]\x1b[0m File not found: ${jsonFilePath}`);
  console.error('Make sure your tests ran and produced cucumber-report.json before generating the report.');
  process.exit(1);
}

try {
  const browserName = process.env.BROWSER || 'chromium';
  const activeEnv = process.env.ENV || 'qa';

  report.generate({
    jsonDir: './reports',
    reportPath: './reports/html-report',
    openReportInBrowser: false,
    saveCollectedJSON: false,
    disableLog: false,
    metadata: {
      browser: {
        name: browserName.toUpperCase(),
        version: 'Latest',
      },
      device: process.env.DEVICE || 'Desktop (1920x1080)',
      platform: {
        name: os.platform(),
        version: os.release(),
      },
    },
    customData: {
      title: 'Run Execution Details',
      data: [
        { label: 'Environment', value: activeEnv.toUpperCase() },
        { label: 'Target Browser', value: browserName },
        { label: 'Generated At', value: new Date().toLocaleString() },
      ],
    },
  });

  console.log('\x1b[32m[Success]\x1b[0m HTML Report generated at: reports/html-report/index.html');
} catch (error) {
  console.error('\x1b[31m[Report Generation Failed]:\x1b[0m', error);
}