import assert from "node:assert/strict";
import { test } from "node:test";
import { getScenarioResources } from "../src/support/scenario-resources";

test("UI scenarios use a browser without creating an API context", () => {
  assert.deepEqual(getScenarioResources([]), { api: false, browser: true });
});

test("@api scenarios support hybrid UI and API tests", () => {
  assert.deepEqual(getScenarioResources(["@api"]), { api: true, browser: true });
});

test("@api-only scenarios use an API context without a browser", () => {
  assert.deepEqual(getScenarioResources(["@api-only"]), { api: true, browser: false });
});
