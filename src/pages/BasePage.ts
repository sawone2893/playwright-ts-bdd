import { Page, Locator, expect } from '@playwright/test';

export abstract class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // --- Navigation & Window Management ---

  async goto(url: string): Promise<void> {
    await this.page.goto(url, { waitUntil: 'domcontentloaded' });
  }

  async getPageTitle(): Promise<string> {
    return await this.page.title();
  }

  async getPageUrl(): Promise<string> {
    return this.page.url();
  }

  async reload(): Promise<void> {
    await this.page.reload({ waitUntil: 'domcontentloaded' });
  }

  // --- Centralized Locator Resolver ---

  protected getLocator(selector: string | Locator): Locator {
    return typeof selector === 'string' ? this.page.locator(selector) : selector;
  }

  // --- Element Actions with Auto-Wait ---

  async click(selector: string | Locator): Promise<void> {
    const element = this.getLocator(selector);
    await element.waitFor({ state: 'visible' });
    await element.click();
  }

  async type(selector: string | Locator, text: string, delay = 0): Promise<void> {
    const element = this.getLocator(selector);
    await element.waitFor({ state: 'visible' });
    await element.fill(''); // Clear existing text
    if (delay > 0) {
      await element.pressSequentially(text, { delay });
    } else {
      await element.fill(text);
    }
  }

  async getText(selector: string | Locator): Promise<string> {
    const element = this.getLocator(selector);
    await element.waitFor({ state: 'visible' });
    return (await element.textContent())?.trim() ?? '';
  }

  async getInputValue(selector: string | Locator): Promise<string> {
    const element = this.getLocator(selector);
    await element.waitFor({ state: 'visible' });
    return await element.inputValue();
  }

  async selectDropdownByValue(selector: string | Locator, value: string): Promise<string[]> {
    const element = this.getLocator(selector);
    await element.waitFor({ state: 'visible' });
    return await element.selectOption({ value });
  }

  async selectDropdownByLabel(selector: string | Locator, label: string): Promise<string[]> {
    const element = this.getLocator(selector);
    await element.waitFor({ state: 'visible' });
    return await element.selectOption({ label });
  }

  async check(selector: string | Locator): Promise<void> {
    const element = this.getLocator(selector);
    await element.waitFor({ state: 'visible' });
    await element.check();
  }

  async uncheck(selector: string | Locator): Promise<void> {
    const element = this.getLocator(selector);
    await element.waitFor({ state: 'visible' });
    await element.uncheck();
  }

  async hover(selector: string | Locator): Promise<void> {
    const element = this.getLocator(selector);
    await element.waitFor({ state: 'visible' });
    await element.hover();
  }

  // --- State Assertions ---

  async expectToBeVisible(selector: string | Locator, timeout = 5000): Promise<void> {
    const element = this.getLocator(selector);
    await expect(element).toBeVisible({ timeout });
  }

  async expectToBeHidden(selector: string | Locator, timeout = 5000): Promise<void> {
    const element = this.getLocator(selector);
    await expect(element).toBeHidden({ timeout });
  }

  async expectToHaveText(selector: string | Locator, expectedText: string, timeout = 5000): Promise<void> {
    const element = this.getLocator(selector);
    await expect(element).toHaveText(expectedText, { timeout });
  }

  async expectToContainText(selector: string | Locator, expectedSubstring: string, timeout = 5000): Promise<void> {
    const element = this.getLocator(selector);
    await expect(element).toContainText(expectedSubstring, { timeout });
  }

  // --- Explicit Wait Utils ---

  async waitForElementState(selector: string | Locator, state: 'attached' | 'detached' | 'visible' | 'hidden', timeout = 10000): Promise<void> {
    const element = this.getLocator(selector);
    await element.waitFor({ state, timeout });
  }

  async waitForPageNetworkIdle(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }
}