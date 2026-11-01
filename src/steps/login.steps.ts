import { Given, When, Then } from "@cucumber/cucumber";
import { CustomWorld } from "../support/custom-world";

Given(
  "the user navigates to the login page",
  async function (this: CustomWorld) {
    await this.pageManager!.loginPage.navigate();
  },
);

When(
  "the user enters credentials {string} and {string}",
  async function (this: CustomWorld, user: string, pass: string) {
    await this.pageManager!.loginPage.login(user, pass);
  },
);

Then(
  "the dashboard title should be displayed",
  async function (this: CustomWorld) {
    await this.pageManager!.loginPage.verifyDashboardDisplayed();
  },
);

Then(
  "the login error message should contain {string}",
  async function (this: CustomWorld, expectedError: string) {
    await this.pageManager!.loginPage.verifyErrorMessage(expectedError);
  },
);

Then(
  "the username field should be visible",
  async function (this: CustomWorld) {
    await this.pageManager!.loginPage.verifyUsernameFieldVisible();
  },
);

Then(
  "the password field should be visible",
  async function (this: CustomWorld) {
    await this.pageManager!.loginPage.verifyPasswordFieldVisible();
  },
);

Then("the login button should be visible", async function (this: CustomWorld) {
  await this.pageManager!.loginPage.verifyLoginButtonVisible();
});
