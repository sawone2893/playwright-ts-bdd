import { Before, After, BeforeAll, AfterAll, Status, setDefaultTimeout } from '@cucumber/cucumber';
import { Browser } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { CustomWorld } from './custom-world';
import { BrowserFactory } from './browser-factory';
import { config } from './config';
import { PageManager } from '../pages/PageManager';

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
  // Scoped strictly to this scenario's thread:
  this.pageManager = new PageManager(this.page);
});

After(async function (this: CustomWorld, scenario) {
  const isFailed = scenario.result?.status === Status.FAILED;
  const page = this.page;
  const context = this.context;
  const sanitizedName = scenario.pickle.name.replace(/[^a-zA-Z0-9]/g, '_');

  let videoPath: string | null = null;

  // 1. Capture screenshot on failure
  if (isFailed && page) {
    const screenshot = await page.screenshot({
      path: `reports/screenshots/${sanitizedName}.png`,
      fullPage: true,
    });
    this.attach(screenshot, 'image/png');
  }

  // 2. Obtain video path reference before closing page
  if (page) {
    const video = page.video();
    if (video) {
      videoPath = await video.path();
    }
  }

  // 3. Close page and context to allow Playwright to finalize video file
  await page?.close();
  await context?.close();

  // 4. Handle video retention
  if (videoPath && fs.existsSync(videoPath)) {
    if (!isFailed) {
      // Discard video for passed scenario
      try {
        fs.unlinkSync(videoPath);
      } catch (err) {
        console.warn(`Failed to delete passed video: ${videoPath}`, err);
      }
    } else {
      // Retain and rename video for failed scenario
      const targetVideoPath = path.resolve('reports/videos', `${sanitizedName}.webm`);
      try {
        fs.renameSync(videoPath, targetVideoPath);

        // Attach video to Cucumber HTML report
        const videoBuffer = fs.readFileSync(targetVideoPath);
        this.attach(videoBuffer, 'video/webm');
      } catch (err) {
        console.warn(`Failed to process failed video: ${videoPath}`, err);
      }
    }
  }
});