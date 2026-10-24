import { Given, When, Then } from '@cucumber/cucumber';
import { CustomWorld } from '../support/custom-world';
import { LoginPage } from '../pages/LoginPage';

Given('the user navigates to the login page', async function (this: CustomWorld) {
  const loginPage = new LoginPage(this.page!);
  await loginPage.navigate();
});

When('the user enters credentials {string} and {string}', async function (this: CustomWorld, user: string, pass: string) {
  const loginPage = new LoginPage(this.page!);
  await loginPage.login(user, pass);
});

Then('the dashboard title should be displayed', async function (this: CustomWorld) {
  const loginPage = new LoginPage(this.page!);
  await loginPage.verifyDashboardDisplayed();
});

Then('the login error message should contain {string}', async function (this: CustomWorld, expectedError: string) {
  const loginPage = new LoginPage(this.page!);
  await loginPage.verifyErrorMessage(expectedError);
});

Then('the username field should be visible', async function (this: CustomWorld) {
  const loginPage = new LoginPage(this.page!);
  await loginPage.verifyUsernameFieldVisible();
});

Then('the password field should be visible', async function (this: CustomWorld) {
  const loginPage = new LoginPage(this.page!);
  await loginPage.verifyPasswordFieldVisible();
});

Then('the login button should be visible', async function (this: CustomWorld) {
  const loginPage = new LoginPage(this.page!);
  await loginPage.verifyLoginButtonVisible();
});