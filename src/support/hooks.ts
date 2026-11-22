import {
  Before,
  After,
  BeforeAll,
  AfterAll,
  Status,
  setDefaultTimeout,
} from "@cucumber/cucumber";
import { Browser, request } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";
import { CustomWorld } from "./custom-world";
import { BrowserFactory } from "./browser-factory";
import { config } from "./config";
import { PageManager } from "../pages/PageManager";
import { ApiManager } from "../api/ApiManager";

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

Before(async function (this: CustomWorld,scenario) {

  // 1. Initialize API context for all scenarios (supports @api and hybrid UI+API tests)
 this.apiContext = await request.newContext({
    baseURL: config.apiBaseUrl,
    extraHTTPHeaders: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });
  this.apiManager = new ApiManager(this.apiContext);

  // 2. Skip browser initialization for @api-only scenarios
  const isApiOnly = scenario.pickle.tags.some((tag) => tag.name === "@api");
  if (isApiOnly) {
    return;
  }

  // 3. Initialize Browser Context, Tracing, and PageManager for UI / Hybrid tests
  this.browser = browser;
  const contextOptions = BrowserFactory.getContextOptions();
  this.context = await browser.newContext(contextOptions);
  
// Start Playwright tracing for this scenario's context
  await this.context.tracing.start({
    screenshots: true,
    snapshots: true,
    sources: true,
  });

  this.page = await this.context.newPage();
  // Scoped strictly to this scenario's thread:
  this.pageManager = new PageManager(this.page);
});

After(async function (this: CustomWorld, scenario) {

  const isFailed = scenario.result?.status === Status.FAILED;

  // Attach last API response body on failure for debugging in Allure/HTML reports
  if (isFailed && this.lastResponse) {
    try {
      const responseBody = await this.lastResponse.text();
      this.attach(
        `Status: ${this.lastResponse.status()}\nURL: ${this.lastResponse.url()}\nBody:\n${responseBody}`,
        'text/plain'
      );
    } catch {
      // Ignore if response stream was already disposed
    }
  }

  //Dispose API context
  if (this.apiContext) {
    await this.apiContext.dispose();
  }

  const activePage = this.pageManager?.page ?? this.page;
  const context = this.context;
  const sanitizedName = scenario.pickle.name.replace(/[^a-zA-Z0-9]/g, '_');

  let videoPath: string | null = null;

  // 1. Capture screenshot on failure (from whichever tab is currently active)
  if (isFailed && activePage && !activePage.isClosed()) {
    const screenshotDir = path.resolve('reports/screenshots');
    fs.mkdirSync(screenshotDir, { recursive: true });

    const screenshot = await activePage.screenshot({
      path: path.join(screenshotDir, `${sanitizedName}.png`),
      fullPage: true,
    });
    this.attach(screenshot, 'image/png');
  }

  // 2. Stop and save trace on failure (must happen BEFORE context.close())
  if (context) {
    if (isFailed) {
      const tracesDir = path.resolve('reports/traces');
      fs.mkdirSync(tracesDir, { recursive: true });

      const tracePath = path.join(tracesDir, `${sanitizedName}.zip`);
      await context.tracing.stop({ path: tracePath });
      console.log(`Trace saved: ${tracePath}`);
    } else {
      await context.tracing.stop();
    }
  }

  // 3. Obtain video path reference before closing page
  if (activePage) {
    const video = activePage.video();
    if (video) {
      videoPath = await video.path();
    }
  }

  // 4. Close page and context to allow Playwright to finalize video file
  await activePage?.close();
  await context?.close();

  // 5. Handle video retention
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
      const videosDir = path.resolve('reports/videos');
      fs.mkdirSync(videosDir, { recursive: true });

      const targetVideoPath = path.join(videosDir, `${sanitizedName}.webm`);
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