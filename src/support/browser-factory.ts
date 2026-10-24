import { chromium, firefox, webkit, Browser, devices, BrowserContextOptions } from '@playwright/test';
import { config, BrowserType } from './config';

export class BrowserFactory {
  static async getBrowser(browserName: BrowserType = config.browser): Promise<Browser> {
    const launchOptions = {
      headless: config.headless,
      slowMo: config.slowMo,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    };

    switch (browserName.toLowerCase()) {
      case 'firefox':
        return await firefox.launch(launchOptions);
      case 'webkit':
        return await webkit.launch(launchOptions);
      case 'chromium':
      default:
        return await chromium.launch(launchOptions);
    }
  }

  static getContextOptions(deviceName?: string): BrowserContextOptions {
    const targetDevice = deviceName || config.device;

    if (targetDevice && devices[targetDevice]) {
      return {
        ...devices[targetDevice],
        recordVideo: { dir: 'reports/videos/' },
      };
    }

    return {
      viewport: { width: 1920, height: 1080 },
      recordVideo: { dir: 'reports/videos/' },
    };
  }
}