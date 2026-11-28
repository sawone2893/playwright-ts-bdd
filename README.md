# Playwright TypeScript Cucumber Framework

An end-to-end automation framework using Playwright, TypeScript, and Cucumber. The examples cover SauceDemo login and checkout, a JSONPlaceholder user API, and browser iframe/window handling on external demo sites.

## What is implemented

| Area | Current examples |
| --- | --- |
| UI authentication | Valid login, invalid/missing credentials, and login-form visibility |
| UI checkout | Add products to cart, provide shipping details, verify the order, and confirm checkout |
| API | Read a JSONPlaceholder user and submit a user-creation request |
| Browser capabilities | Edit a single iframe, inspect nested frames, and switch between a parent tab and popup |

The UI examples use SauceDemo. The API example uses JSONPlaceholder, and the iframe/window examples use `the-internet.herokuapp.com`. These are public demo services; a run needs network access and their availability is outside this repository's control. The `@visual` tag currently marks a login-form visibility scenario; it does not perform screenshot-based visual comparison.

## Architecture and conventions

### Gherkin and step definitions

- Feature specifications live under `features/`; their step implementations are grouped by area under `src/steps/`.
- Scenarios use behavior-focused Given/When/Then steps. The login feature uses a Scenario Outline for credential variations, and checkout uses data tables for products, shipping information, and expected order items.
- Current tags are `@api`, `@api-only`, `@auth`, `@checkout`, `@e2e`, `@iframe`, `@negative`, `@positive`, `@regression`, `@smoke`, `@ui`, `@visual`, and `@windows`. Use `@api` for API scenarios, including hybrid UI/API scenarios; add `@api-only` when the scenario does not need a browser.
- Retries are limited to scenarios explicitly tagged `@flaky`; non-flaky scenarios are never retried. Failed attempts scheduled for retry are recorded in a run-specific `reports/cucumber-retries-<run-id>.jsonl` file. CI reports the retry rate and fails the run if any scenario needed a retry, so a retry-pass is not treated as clean.

### Scenario state and lifecycle

- `CustomWorld` holds scenario-scoped browser, context, page, page manager, API context, API manager, and last API response references.
- Cucumber hooks launch a browser lazily once per worker when the first browser-backed scenario runs. Scenarios tagged `@api` get a fresh API request context and browser context/page, supporting hybrid UI/API tests. Scenarios tagged `@api-only` get an API context but no browser; scenarios without either API tag do not create an API context.
- Each UI context starts Playwright tracing. On failure, the hooks save a trace and screenshot, retain and attach the video, and attach the last API response body when available. Artifact names include feature, scenario, and attempt identities to avoid collisions. Artifact errors are reported after scenario resources have been closed.
- Cucumber's default step timeout comes from `TIMEOUT` (60,000 ms fallback). The shared UI assertion helpers use a 5,000 ms fallback; API requests use `API_TIMEOUT` (15,000 ms fallback).

### UI page layer

- `BasePage` centralizes navigation, common locator actions, state assertions, frame resolution, and window/tab operations. Actions can target a page or a single/nested frame.
- Concrete page objects keep page-specific selectors and workflows. `PageManager` creates those objects lazily and shares a mutable `PageHolder`; updating the holder when switching tabs makes existing page objects use the active tab.
- `UiAssertions` wraps Playwright assertions for elements and pages. Prefer these helpers or Playwright's built-in locator assertions over fixed sleeps.

### API layer

- A Playwright `APIRequestContext` is created for each `@api` or `@api-only` scenario and configured with `API_BASE_URL`.
- `BaseApiClient` provides GET, POST, PUT, PATCH, and DELETE requests, per-request timeout overrides, request timing/status logs, and shared status/JSON helpers.
- `UserService` currently exposes `GET /users/:id`, `POST /users`, and `DELETE /users/:id`. The feature examples exercise GET and POST only.
- `ApiAssertions` provides status, success, header, JSON-property, and array-size assertions. Request and response types are in `src/api/models/user.model.ts`.

## Configuration

`ENV` is selected once in the runner's process environment, not in an env file. Supported values are `dev`, `qa`, `staging`, `prod`, and `local`; it defaults to `qa`. The runner selects `env/.env.<ENV>`. The optional shared `env/.env` file is loaded first, then the selected environment file; process values override both. Code defaults are used for settings not supplied by either source.

The currently checked-in `env/.env.*` files are tracked by Git. The `.gitignore` pattern does not untrack files that are already tracked. Keep credentials and other secrets out of them; use CI secrets or process environment variables for sensitive values.

| Setting | Meaning | Code fallback / validation |
| --- | --- | --- |
| `ENV` | Selects the environment file; read from the process only | `qa`; one of `dev`, `qa`, `staging`, `prod`, `local` |
| `BASE_URL` | UI application base URL | `https://www.saucedemo.com` |
| `API_BASE_URL` | API request base URL | `https://jsonplaceholder.typicode.com` |
| `API_TIMEOUT` | API request timeout in milliseconds | `15000`; positive integer |
| `BROWSER` | Browser engine | `chromium`; one of `chromium`, `firefox`, `webkit` |
| `HEADLESS` | Headless browser mode | `true`; must be `true` or `false` |
| `RECORD_VIDEO` | Record scenario videos for failure retention | `false`; must be `true` or `false` |
| `ENABLE_TRACING` | Capture Playwright traces for failed scenarios | `false`; must be `true` or `false` |
| `DEVICE` | Playwright device profile | Unset; scripts provide `iPhone 15 Pro` or `Pixel 7` for mobile runs |
| `PARALLEL` | Cucumber worker count | `4`; integer of at least 1 |
| `RETRY` | Maximum Cucumber retries | `2`; integer of at least 0 |
| `TIMEOUT` | Cucumber step timeout in milliseconds | `60000`; positive integer |
| `SLOW_MO` | Browser action delay in milliseconds | `0`; non-negative number |

Invalid environment/browser names, boolean values, and numeric values fail during configuration loading. Video recording and tracing default to disabled for faster local runs; set `RECORD_VIDEO=true` and/or `ENABLE_TRACING=true` to enable them. CI explicitly enables both to retain failure artifacts. An unrecognized `DEVICE` currently falls back to the desktop context rather than failing validation.

`cucumber.mjs` imports `config.ts` for the default worker and retry counts, while retaining Cucumber-specific imports, formatters, and retry filter. The `single` Cucumber profile is a debug-only override (one worker, zero retries, summary output) used by the VS Code launch configurations.

## Getting started

Requirements: Node.js 24 (the version used in CI) and npm.

```sh
npm ci
npx playwright install
npm test
```

`npx playwright install` installs the supported browser engines. On Linux CI, the workflow uses `npx playwright install --with-deps`.

Run the TypeScript check separately with:

```sh
npm exec -- tsc --noEmit
```

## Common commands

| Command | Purpose |
| --- | --- |
| `npm test` | Run the default Cucumber suite; its `pretest` hook first removes screenshots, videos, and traces |
| `npm run test:unit` | Run unit tests, including browser launch options, scenario resources, artifact names, and retry metrics |
| `npm run report:retries` | Report the retry rate for the `CUCUMBER_RUN_ID` run; exits unsuccessfully if any retry occurred |
| `npm run test:chrome:parallel` | Run Chromium scenarios using the configured worker/retry settings |
| `npm run test:firefox:parallel` | Run Firefox scenarios using the configured worker/retry settings |
| `npm run test:webkit:parallel` | Run WebKit scenarios using the configured worker/retry settings |
| `npm run test:mobile:ios:parallel` | Run WebKit using the `iPhone 15 Pro` profile |
| `npm run test:mobile:android:parallel` | Run Chromium using the `Pixel 7` profile |
| `npm run test:chrome:headed` | Run the full suite in headed Chromium |
| `npm run test:firefox:headed` | Run the full suite in headed Firefox |
| `npm run test:webkit:headed` | Run the full suite in headed WebKit |
| `npm run test:chrome:smoke` | Run scenarios tagged `@smoke` in Chromium |
| `npm run test:chrome:negative` | Run scenarios tagged `@negative` in Chromium |
| `npm run test:chrome:checkout` | Run scenarios tagged `@checkout` in Chromium |
| `npm run test:chrome:checkout:headed` | Run checkout scenarios in headed Chromium |
| `npm run test:dev` | Run using the `dev` environment |
| `npm run test:qa` | Run using the `qa` environment |
| `npm run test:staging` | Run using the `staging` environment |
| `npm run test:local` | Run using the `local` environment |
| `npm run test:uifeature` | Run `features/iframe_demo.feature` only |
| `npm run test:apifeature` | Run `features/api/user_api.feature` only |
| `npm run report` | Generate `reports/html-report/index.html` from the latest Cucumber JSON report |
| `npm run test:report` | Run configured Chromium tests, then generate the expanded report if tests pass |
| `npm run test-trace` | Open the named checkout trace at `reports/traces/Complete_end_to_end_checkout_with_multiple_items.zip` |
| `npm run clean` | Delete screenshot, video, and trace artifact directories |

Other browser, environment, and tag combinations can be selected with process environment variables or Cucumber CLI options. Only `npm test` automatically runs the `pretest` cleanup script; the other test scripts do not.

## Reports and CI

Cucumber writes:

- `reports/cucumber-report.html` — Cucumber HTML output
- `reports/cucumber-report.json` — JSON input for the expanded report
- `reports/screenshots/` — failure screenshots
- `reports/traces/` — failure traces when `ENABLE_TRACING=true`
- `reports/videos/` — failed-scenario videos when `RECORD_VIDEO=true`
- `reports/html-report/index.html` — expanded report generated by `npm run report`

The GitHub Actions workflow in `.github/workflows/e2e-pipeline.yml` runs for pushes and pull requests targeting `main` or `master`, and can be started manually. Push and pull-request runs fan out into parallel Chromium, Firefox, and WebKit jobs; each runs the Cucumber suite with the configured worker count. Manual runs retain the selected `dev`, `qa`, or `staging` environment and run only the selected browser. Every job verifies browser-specific launch options, installs its browser and OS dependencies, attempts report generation and artifact upload even after test failure, then enforces the original test result. Reports are uploaded separately as `full-execution-report-<browser>` artifacts and retained for 14 days.

## Repository file map

### Project and tooling files

| File | Purpose |
| --- | --- |
| `README.md` | Framework overview, configuration, commands, and file map |
| `package.json` | Dependencies and npm commands |
| `package-lock.json` | Locked dependency tree used by `npm ci` |
| `cucumber.mjs` | Cucumber profiles, step/support imports, formatters, and retry filter |
| `scripts/report-retries.ts` | Reports retry counts/rate and fails when scenarios required retries |
| `tsconfig.json` | Strict TypeScript compiler settings and included source paths |
| `.gitignore` | Ignores dependencies, build output, reports, and matching env paths |
| `generate-report.cjs` | Builds the expanded Cucumber HTML report |
| `.github/workflows/e2e-pipeline.yml` | GitHub Actions test, report, and artifact workflow |
| `.vscode/launch.json` | Debug current feature or current scenario line using the `single` profile |
| `.vscode/settings.json` | Cucumber extension feature/glue patterns and editor parameter types |
| `LICENSE` | Apache License 2.0 text; package metadata declares `Apache-2.0` |
| `BDD Framework Masterclass.html` | Standalone BDD masterclass/instructor guide |
| `playwright_cucumber_framework_dashboard.html` | Standalone framework dashboard/reference page |
| `playwright_cucumber_framework_comprehensive_hub.html` | Standalone comprehensive framework hub/reference page |

### Environment files

| File | Purpose |
| --- | --- |
| `env/.env.dev` | Development settings |
| `env/.env.qa` | QA settings |
| `env/.env.staging` | Staging settings |
| `env/.env.prod` | Production settings |
| `env/.env.local` | Local settings |

These files contain application settings only; do not put the `ENV` selector in them. The optional shared `env/.env` file is not currently tracked.

### Feature specifications

| File | Coverage | Step definitions |
| --- | --- | --- |
| `features/login.feature` | Login success, negative credential cases, and form visibility | `src/steps/login.steps.ts` |
| `features/checkout.feature` | Multi-item purchase and checkout confirmation | `src/steps/checkout.steps.ts` |
| `features/api/user_api.feature` | User lookup and user creation | `src/steps/api/user_api.steps.ts` |
| `features/iframe_demo.feature` | Single and nested iframe behavior | `src/steps/iframe_demo.steps.ts` |
| `features/windows_demo.feature` | Parent and popup tab handling | `src/steps/windows_demo.steps.ts` |

### TypeScript implementation

| File | Responsibility |
| --- | --- |
| `src/support/config.ts` | Environment selection, env-file precedence, validation, and typed runtime settings |
| `src/support/browser-factory.ts` | Browser launch, device context options, viewport, and video recording |
| `src/support/custom-world.ts` | Cucumber World state for UI and API scenarios |
| `src/support/hooks.ts` | Browser/API setup and teardown, tracing, failure artifacts, and Cucumber timeout |
| `src/support/artifact-naming.ts` | Creates feature-, scenario-, and attempt-specific artifact names |
| `src/support/retry-metrics.ts` | Records retry-triggering failures and calculates retry rate |
| `src/support/scenario-resources.ts` | Resolves API and browser requirements from scenario tags |
| `src/support/page-holder.ts` | Mutable active-page reference shared by page objects |
| `src/base/BasePage.ts` | Shared Playwright navigation, frame/window, action, wait, and assertion operations |
| `src/pageObjectFactory/PageManager.ts` | Lazy access to the page objects |
| `src/pages/LoginPage.ts` | Login navigation, login action, and login assertions |
| `src/pages/InventoryPage.ts` | Product selection, cart navigation, and checkout entry |
| `src/pages/CheckoutPage.ts` | Shipping details, order overview, and confirmation |
| `src/pages/IframeSandboxPage.ts` | Single/nested iframe demo interactions |
| `src/pages/WindowsDemoPage.ts` | Popup window demo interactions |
| `src/assertions/UiAssertions.ts` | Shared locator and page-level Playwright assertions |
| `src/assertions/ApiAssertions.ts` | Shared HTTP status, header, JSON property, and array assertions |
| `src/api/ApiManager.ts` | Lazy API service access |
| `src/api/core/BaseApiClient.ts` | Shared API request methods, timeout handling, logging, and helpers |
| `src/api/models/user.model.ts` | User request and response TypeScript interfaces |
| `src/api/services/UserService.ts` | User API endpoints |
| `src/steps/login.steps.ts` | Login Gherkin step bindings |
| `src/steps/checkout.steps.ts` | Checkout Gherkin step bindings |
| `src/steps/api/user_api.steps.ts` | API Gherkin step bindings |
| `src/steps/iframe_demo.steps.ts` | Iframe Gherkin step bindings |
| `src/steps/windows_demo.steps.ts` | Window/tab Gherkin step bindings |

### Unit tests

| File | Purpose |
| --- | --- |
| `tests/browser-factory.test.ts` | Verifies the launch options passed to Chromium, Firefox, and WebKit, plus the video-recording setting |
| `tests/scenario-resources.test.ts` | Verifies UI, hybrid API/UI, and API-only resource selection |
| `tests/artifact-naming.test.ts` | Verifies artifact names distinguish features and scenario attempts |
| `tests/retry-metrics.test.ts` | Verifies retry-rate and retry-attempt calculations |

`reports/` is generated at runtime and ignored by Git. `node_modules/` is installed from the package manifests and is not part of the framework source. Unit tests run with `npm run test:unit`; no separate lint command is currently defined.
