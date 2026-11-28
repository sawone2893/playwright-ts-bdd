import assert from 'node:assert/strict';
import { mock, test } from 'node:test';
import { chromium, firefox, webkit, type LaunchOptions } from '@playwright/test';
import { BrowserFactory } from '../src/support/browser-factory';
import { config, type BrowserType } from '../src/support/config';

const launchers = { chromium, firefox, webkit };
const chromiumArgs = ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'];

for (const browserName of Object.keys(launchers) as BrowserType[]) {
  test(`${browserName} receives the appropriate launch options`, async () => {
    let receivedOptions: unknown;
    const launchMock = mock.method(launchers[browserName], 'launch', async (options: LaunchOptions | undefined) => {
      receivedOptions = options;
      throw new Error('Intercepted browser launch');
    });

    try {
      await assert.rejects(
        BrowserFactory.getBrowser(browserName),
        /Intercepted browser launch/,
      );
    } finally {
      launchMock.mock.restore();
    }

    const expectedOptions = {
      headless: config.headless,
      slowMo: config.slowMo,
      ...(browserName === 'chromium' ? { args: chromiumArgs } : {}),
    };

    assert.deepEqual(receivedOptions, expectedOptions);
  });
}

test('video recording follows the configured setting', () => {
  const contextOptions = BrowserFactory.getContextOptions();

  assert.equal('recordVideo' in contextOptions, config.recordVideo);
});
