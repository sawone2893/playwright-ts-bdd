# Playwright TypeScript BDD Framework

An end-to-end browser automation framework built with Playwright, TypeScript, and Cucumber. The current examples cover SauceDemo authentication and the product checkout flow.

## Framework standards

### BDD features

- Store executable specifications as `.feature` files under `features/`.
- Write scenarios in Gherkin with a clear `Feature`, optional shared `Background`, and descriptive scenario names.
- Use `Scenario Outline` and an `Examples` table for related input variations; use Cucumber data tables for structured multi-value inputs.
- Tag features and scenarios to describe their purpose and to support selective execution. Existing tags include `@smoke`, `@negative`, `@positive`, `@regression`, `@ui`, `@visual`, `@checkout`, and `@e2e`.
- Keep feature steps focused on user behavior. Implement their automation in the matching TypeScript step-definition files under `src/steps/`.

### Step definitions and scenario state

- Register Cucumber `Given`, `When`, and `Then` steps in `src/steps/`, grouped by feature area.
- Use `async` steps and await browser actions and assertions.
- Access scenario state through the Cucumber `CustomWorld`. A `PageManager` is created for each scenario and provides the page objects used by its steps.
- Convert Cucumber tables into typed data before passing them to page-object methods when the data has a defined shape.

### Page objects and browser interactions

- Keep selectors and user-facing page operations in page objects under `src/pages/`; do not put page selectors or low-level browser interactions in feature files.
- Extend `BasePage` for shared navigation, locator resolution, common interactions, waits, and Playwright assertions.
- Use `PageManager` to expose page objects. Its page-object getters initialize their objects lazily using the current scenario's Playwright `Page`.
- Prefer the shared `BasePage` operations for interactions and assertions. They wait for visibility before common actions and use Playwright's assertion and waiting APIs.
- TypeScript is configured with `strict` mode. Keep page and data contracts explicitly typed.

### Configuration and environments

- `src/support/config.ts` centralizes environment, base URL, browser, headless mode, device, worker-count and retry-count values, timeout, and slow motion.
- Select an environment with `ENV`; supported names are `dev`, `qa`, `staging`, `prod`, and `local`. The default is `qa`.
- Environment files are loaded from `env/`: the shared `env/.env` file is loaded first, then `env/.env.<environment>` overrides it. Environment variables supplied by the process are also used for configuration.
- Keep environment-specific values in local `env/.env*` files and do not commit secrets. These files are excluded by `.gitignore`.
- Configuration variables read by `src/support/config.ts` include `BASE_URL`, `BROWSER`, `HEADLESS`, `DEVICE`, `PARALLEL`, `RETRY`, `TIMEOUT`, and `SLOW_MO`. Defaults include SauceDemo as the base URL, Chromium, headless mode, a 60-second Cucumber timeout, and no slow motion. Although `PARALLEL` and `RETRY` are parsed into the config object, Cucumber's effective worker and retry defaults are set separately in `cucumber.json` (four workers and two retries); npm scripts may also pass Cucumber CLI overrides.
- Supported browser names are `chromium`, `firefox`, and `webkit`. `DEVICE` can select a Playwright device profile; without one, the context uses a 1920 × 1080 viewport.

### Test lifecycle and artifacts

- Cucumber hooks in `src/support/hooks.ts` launch one browser for the test run, create a fresh browser context and page for each scenario, and close the page/context after each scenario.
- Browser contexts record video under `reports/videos/`. On failure, the framework captures a full-page screenshot and retains/attaches the scenario video. Videos from passing scenarios are discarded.
- Cucumber is configured to discover `features/**/*.feature`, import TypeScript steps and support code, and write summary, HTML, and JSON output under `reports/`.
- The Cucumber defaults in `cucumber.json` configure four parallel workers and two retries. The retry tag filter is `@flaky or not @smoke`.
- `npm run report` generates the expanded HTML report at `reports/html-report/index.html` from `reports/cucumber-report.json`; run tests first to create the JSON input.

## Project layout

| Path | Purpose |
| --- | --- |
| `features/` | Gherkin feature files |
| `src/steps/` | Cucumber step definitions |
| `src/pages/` | Page objects, shared page operations, and `PageManager` |
| `src/support/` | Browser factory, configuration, custom World, and Cucumber hooks |
| `env/` | Local environment configuration files |
| `reports/` | Generated Cucumber reports and test artifacts |
| `cucumber.json` | Cucumber feature discovery, imports, formatters, parallelism, and retry defaults |
| `tsconfig.json` | TypeScript compiler configuration |

## Getting started

Requirements: Node.js and npm. Install dependencies and run the default Cucumber suite:

```sh
npm install
npm test
```

Playwright browsers must be installed in the local environment for the selected browser. The framework's browser launch is provided by `@playwright/test`.

## Common commands

| Command | Purpose |
| --- | --- |
| `npm test` | Run the Cucumber suite with the configured defaults |
| `npm run test:chrome` | Run Chromium scenarios with four workers |
| `npm run test:firefox` | Run Firefox scenarios with four workers |
| `npm run test:webkit` | Run WebKit scenarios with four workers |
| `npm run test:mobile:ios` | Run WebKit with the configured iPhone 15 Pro device profile |
| `npm run test:mobile:android` | Run Chromium with the configured Pixel 7 device profile |
| `npm run test:headed` | Run with the browser visible |
| `npm run test:chrome:smoke` | Run scenarios tagged `@smoke` in Chromium |
| `npm run test:chrome:negative` | Run scenarios tagged `@negative` in Chromium with four workers |
| `npm run test:chrome:checkout` | Run scenarios tagged `@checkout` in Chromium |
| `npm run test:retry` | Run in Chromium with two retries |
| `npm run test:ci` | Run in Chromium with four workers and two retries |
| `npm run test:dev` | Run using the `dev` environment |
| `npm run test:qa` | Run using the `qa` environment |
| `npm run test:staging` | Run using the `staging` environment |
| `npm run test:local` | Run using the `local` environment |
| `npm run report` | Generate the expanded HTML report from the latest Cucumber JSON report |

Other browser, headed, environment, and tag combinations can be selected with the corresponding npm script or environment variables.
