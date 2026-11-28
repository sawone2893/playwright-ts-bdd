import {
  Before,
  After,
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
import { PageManager } from "../pageObjectFactory/PageManager";
import { ApiManager } from "../api/ApiManager";
import { getScenarioResources } from "./scenario-resources";
import { createArtifactName } from "./artifact-naming";
import { recordRetry } from "./retry-metrics";

setDefaultTimeout(config.defaultTimeout);

let browser: Browser | undefined;

AfterAll(async function () {
  if (browser) {
    await browser.close();
  }
});

Before(async function (this: CustomWorld, scenario) {
  const tags = scenario.pickle.tags.map((tag) => tag.name);
  const resources = getScenarioResources(tags);

  if (resources.api) {
    this.apiContext = await request.newContext({
      baseURL: config.apiBaseUrl,
      extraHTTPHeaders: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    this.apiManager = new ApiManager(this.apiContext);
  }

  if (!resources.browser) {
    return;
  }

  if (!browser) {
    browser = await BrowserFactory.getBrowser();
  }

  this.browser = browser;
  const contextOptions = BrowserFactory.getContextOptions();
  this.context = await browser.newContext(contextOptions);
  
  // Start Playwright tracing for this scenario's context when enabled
  if (config.enableTracing) {
    await this.context.tracing.start({
      screenshots: true,
      snapshots: true,
      sources: true,
    });
  }

  this.page = await this.context.newPage();
  // Scoped strictly to this scenario's thread:
  this.pageManager = new PageManager(this.page);
});

After(async function (this: CustomWorld, scenario) {
  const isFailed = scenario.result?.status === Status.FAILED;
  const activePage = this.pageManager?.page ?? this.page;
  const context = this.context;
  const artifactName = createArtifactName(
    scenario.gherkinDocument.uri ?? "feature",
    scenario.pickle.name,
    scenario.pickle.id,
    scenario.testCaseStartedId,
  );
  const failures: Error[] = [];

  const attempt = async (
    operation: string,
    action: () => Promise<void>,
  ): Promise<void> => {
    try {
      await action();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      failures.push(new Error(`${operation} failed: ${message}`));
      console.error(`[Hooks] ${operation} failed`, error);
    }
  };

  if (isFailed && scenario.willBeRetried) {
    const retryRecord = {
      featureUri: scenario.gherkinDocument.uri ?? "feature",
      scenarioName: scenario.pickle.name,
      pickleId: scenario.pickle.id,
      failedAttemptId: scenario.testCaseStartedId,
    };

    console.warn(
      `[Retry] Failed attempt will be retried: ${retryRecord.featureUri} - ${retryRecord.scenarioName}`,
    );
    await attempt("record retry metric", async () => {
      const runId = process.env.CUCUMBER_RUN_ID;
      if (!runId) {
        throw new Error("CUCUMBER_RUN_ID was not set for this Cucumber run.");
      }
      recordRetry(runId, retryRecord);
    });
  }

  let videoPath: string | null = null;

  try {
    const lastResponse = this.lastResponse;
    if (isFailed && lastResponse) {
      await attempt("attach last API response", async () => {
        const responseBody = await lastResponse.text();
        await this.attach(
          `Status: ${lastResponse.status()}\nURL: ${lastResponse.url()}\nBody:\n${responseBody}`,
          "text/plain",
        );
      });
    }

    if (isFailed && activePage && !activePage.isClosed()) {
      await attempt("capture failure screenshot", async () => {
        const screenshotDir = path.resolve("reports/screenshots");
        fs.mkdirSync(screenshotDir, { recursive: true });

        const screenshot = await activePage.screenshot({
          path: path.join(screenshotDir, `${artifactName}.png`),
          fullPage: true,
        });
        await this.attach(screenshot, "image/png");
      });
    }

    if (context && config.enableTracing) {
      await attempt(isFailed ? "save failure trace" : "stop trace", async () => {
        if (isFailed) {
          const tracesDir = path.resolve("reports/traces");
          fs.mkdirSync(tracesDir, { recursive: true });

          const tracePath = path.join(tracesDir, `${artifactName}.zip`);
          await context.tracing.stop({ path: tracePath });
          console.log(`Trace saved: ${tracePath}`);
        } else {
          await context.tracing.stop();
        }
      });
    }

    if (config.recordVideo && activePage) {
      await attempt("resolve scenario video path", async () => {
        const video = activePage.video();
        if (video) {
          videoPath = await video.path();
        }
      });
    }
  } finally {
    await attempt("close scenario page", async () => {
      if (activePage && !activePage.isClosed()) {
        await activePage.close();
      }
    });
    await attempt("close scenario browser context", async () => {
      if (context) {
        await context.close();
      }
    });
    await attempt("dispose API request context", async () => {
      if (this.apiContext) {
        await this.apiContext.dispose();
      }
    });
  }

  if (videoPath) {
    const recordedVideoPath = videoPath;
    await attempt(
      isFailed ? "retain failure video" : "delete passing video",
      async () => {
        if (!fs.existsSync(recordedVideoPath)) {
          throw new Error(`Recorded video was not found: ${recordedVideoPath}`);
        }

        if (!isFailed) {
          fs.unlinkSync(recordedVideoPath);
          return;
        }

        const videosDir = path.resolve("reports/videos");
        fs.mkdirSync(videosDir, { recursive: true });

        const targetVideoPath = path.join(videosDir, `${artifactName}.webm`);
        fs.renameSync(recordedVideoPath, targetVideoPath);

        const videoBuffer = fs.readFileSync(targetVideoPath);
        await this.attach(videoBuffer, "video/webm");
      },
    );
  }

  if (failures.length > 0) {
    throw new AggregateError(
      failures,
      `Scenario teardown encountered ${failures.length} error(s): ${scenario.pickle.name}`,
    );
  }
});
