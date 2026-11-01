import { Given, When, Then } from '@cucumber/cucumber';
import { CustomWorld } from '../support/custom-world';

Given('the user navigates to the iframe sandbox', async function (this: CustomWorld) {
  await this.pageManager!.iframeSandboxPage.navigateToSingleIframe();
});

When('the user writes {string} into the editor iframe', async function (this: CustomWorld, text: string) {
  await this.pageManager!.iframeSandboxPage.writeInEditor(text);
});

Then('the editor iframe should display {string}', async function (this: CustomWorld, expectedText: string) {
  await this.pageManager!.iframeSandboxPage.verifyEditorContent(expectedText);
});

Given('the user navigates to the nested frames sandbox', async function (this: CustomWorld) {
  await this.pageManager!.iframeSandboxPage.navigateToNestedFrames();
});

Then('the middle nested frame should display {string}', async function (this: CustomWorld, expectedText: string) {
  await this.pageManager!.iframeSandboxPage.verifyNestedMiddleFrameText(expectedText);
});