// src/steps/windows_demo.steps.ts
import { Given, When, Then } from '@cucumber/cucumber';
import { CustomWorld } from '../support/custom-world';

Given('the user opens the windows test page', async function (this: CustomWorld) {
  await this.pageManager!.windowsDemoPage.navigate();
});

When('the user clicks the link to open a new tab', async function (this: CustomWorld) {
  await this.pageManager!.windowsDemoPage.openChildTab();
});

Then('the new window should display heading {string}', async function (this: CustomWorld, heading: string) {
  // Evaluates on the new window automatically
  await this.pageManager!.windowsDemoPage.verifyHeading(heading);
});

When('the user closes the child tab and returns to the parent window', async function (this: CustomWorld) {
  // Closes child and switches holder.current back to parent
  await this.pageManager!.windowsDemoPage.closeActiveWindowAndSwitchToParent();
});

Then('the parent window heading should display {string}', async function (this: CustomWorld, heading: string) {
  // Evaluates on the parent window automatically
  await this.pageManager!.windowsDemoPage.verifyHeading(heading);
});