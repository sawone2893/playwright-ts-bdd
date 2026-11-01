import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class IframeSandboxPage extends BasePage {
  // Using the-internet.herokuapp.com/iframe
  private readonly iframeSelector = 'iframe#mce_0_ifr';
  private readonly editorBody = '#tinymce';

  // Nested frames URL: the-internet.herokuapp.com/nested_frames
  private readonly nestedFrames = ['frame[name="frame-top"]', 'frame[name="frame-middle"]'];
  private readonly middleContent = '#content';

  constructor(page: Page) {
    super(page);
  }

  async navigateToSingleIframe(): Promise<void> {
    await this.goto('https://the-internet.herokuapp.com/iframe');
  }

  async writeInEditor(text: string): Promise<void> {
    // Tests your BasePage write() with a single frame
    await this.write(this.editorBody, text, { frame: this.iframeSelector });
  }

  async verifyEditorContent(expectedText: string): Promise<void> {
    // Tests your BasePage expectToHaveText() with a single frame
    await this.expectToHaveText(this.editorBody, expectedText, 5000, { frame: this.iframeSelector });
  }

  async navigateToNestedFrames(): Promise<void> {
    await this.goto('https://the-internet.herokuapp.com/nested_frames');
  }

  async verifyNestedMiddleFrameText(expectedText: string): Promise<void> {
    // Tests your BasePage expectToHaveText() with nested frame array!
    await this.expectToHaveText(this.middleContent, expectedText, 5000, { frame: this.nestedFrames });
  }
}