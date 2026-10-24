import { Before, After, BeforeAll, AfterAll, Status, setDefaultTimeout } from '@cucumber/cucumber';
import { Browser } from '@playwright/test';
import { CustomWorld } from './custom-world';
import { BrowserFactory } from './browser-factory';
import { config } from './config';

setDefaultTimeout(config.defaultTimeout);

let browser: Browser;

BeforeAll(async function () {
  browser = await BrowserFactory.getBrowser();
});

AfterAll(async function () {
  if (browser) {
    await browser.close();
  }
});

Before(async function (this: CustomWorld) {
  this.browser = browser;
  const contextOptions = BrowserFactory.getContextOptions();
  this.context = await browser.newContext(contextOptions);
  this.page = await this.context.newPage();
});

After(async function (this: CustomWorld, scenario) {
  if (scenario.result?.status === Status.FAILED && this.page) {
    const sanitized = scenario.pickle.name.replace(/[^a-zA-Z0-9]/g, '_');
    const screenshot = await this.page.screenshot({
      path: `reports/screenshots/${sanitized}.png`,
      fullPage: true,
    });
    this.attach(screenshot, 'image/png');
  }

  await this.page?.close();
  await this.context?.close();
});