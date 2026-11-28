// src/pages/WindowsDemoPage.ts

import { BasePage } from '../base/BasePage';
import type { PageHolder } from '../support/page-holder';

export class WindowsDemoPage extends BasePage {
  private readonly clickHereLink = 'a[href="/windows/new"]';
  private readonly windowHeading = 'h3';

  constructor(holder: PageHolder) {
    super(holder);
  }

  async navigate(): Promise<void> {
    await this.goto('https://the-internet.herokuapp.com/windows');
  }

  async openChildTab(): Promise<void> {
    // Automatically executes click, waits for child tab, and switches holder.current
    await this.clickAndSwitchToNewWindow(this.clickHereLink);
  }

  async verifyHeading(expectedText: string): Promise<void> {
    await this.expectToHaveText(this.windowHeading, expectedText);
  }
}
