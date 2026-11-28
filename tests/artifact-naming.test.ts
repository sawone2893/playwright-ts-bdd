import assert from "node:assert/strict";
import { test } from "node:test";
import { createArtifactName } from "../src/support/artifact-naming";

test("artifact names distinguish same-named scenarios in different features", () => {
  const checkout = createArtifactName(
    "features/checkout.feature",
    "Complete purchase",
    "pickle-1",
    "attempt-1",
  );
  const account = createArtifactName(
    "features/account.feature",
    "Complete purchase",
    "pickle-2",
    "attempt-2",
  );

  assert.notEqual(checkout, account);
  assert.match(checkout, /^checkout_Complete_purchase_/);
});

test("artifact names distinguish separate scenario attempts", () => {
  const firstAttempt = createArtifactName(
    "features/login.feature",
    "Successful login",
    "pickle-1",
    "attempt-1",
  );
  const retry = createArtifactName(
    "features/login.feature",
    "Successful login",
    "pickle-1",
    "attempt-2",
  );

  assert.notEqual(firstAttempt, retry);
});
