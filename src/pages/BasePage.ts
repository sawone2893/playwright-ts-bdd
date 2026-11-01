import { Page, Locator, FrameLocator, expect } from '@playwright/test';

export interface ActionOptions {
  /**
   * Supports:
   * 1. Single frame selector string: 'iframe#parent'
   * 2. Nested frame selectors in sequence: ['iframe#parent', 'iframe#child', '#leaf-frame']
   * 3. An already resolved FrameLocator instance
   */
  frame?: string | string[] | FrameLocator;
  timeout?: number;
}

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

  // --- Frame & Nested Frame Resolvers ---

  /**
   * Resolves single or deeply nested iframes into a chained FrameLocator.
   * Example: this.resolveFrame(['#parent-iframe', '#child-iframe'])
   */
  resolveFrame(frame: string | string[] | FrameLocator): FrameLocator {
    if (typeof frame !== 'string' && !Array.isArray(frame)) {
      return frame;
    }

    const selectors = Array.isArray(frame) ? frame : [frame];
    if (selectors.length === 0) {
      throw new Error('Frame selector array cannot be empty.');
    }

    let currentFrame: FrameLocator = this.page.frameLocator(selectors[0]);
    for (let i = 1; i < selectors.length; i++) {
      currentFrame = currentFrame.frameLocator(selectors[i]);
    }

    return currentFrame;
  }

  /**
   * Shorthand helper to resolve nested frames directly.
   */
  getNestedFrame(...selectors: string[]): FrameLocator {
    return this.resolveFrame(selectors);
  }

  // --- Centralized Locator Resolver ---

  protected getLocator(selector: string | Locator, options?: ActionOptions): Locator {
    if (typeof selector !== 'string') {
      return selector;
    }

    if (options?.frame) {
      const frameLocator = this.resolveFrame(options.frame);
      return frameLocator.locator(selector);
    }

    return this.page.locator(selector);
  }

  // --- Element Actions with Auto-Wait ---

  /**
   * Alias / dedicated text-entry method that handles single frames, nested frames, or regular elements.
   * Clears the input field and fills or types text.
   */
  async write(selector: string | Locator, text: string, options?: ActionOptions & { delay?: number }): Promise<void> {
    const element = this.getLocator(selector, options);
    await element.waitFor({ state: 'visible', timeout: options?.timeout });
    await element.fill('', { timeout: options?.timeout });

    if (options?.delay && options.delay > 0) {
      await element.pressSequentially(text, { delay: options.delay, timeout: options?.timeout });
    } else {
      await element.fill(text, { timeout: options?.timeout });
    }
  }

  async type(selector: string | Locator, text: string, delay = 0, options?: ActionOptions): Promise<void> {
    await this.write(selector, text, { ...options, delay });
  }

  async click(selector: string | Locator, options?: ActionOptions): Promise<void> {
    const element = this.getLocator(selector, options);
    await element.waitFor({ state: 'visible', timeout: options?.timeout });
    await element.click({ timeout: options?.timeout });
  }

  async getText(selector: string | Locator, options?: ActionOptions): Promise<string> {
    const element = this.getLocator(selector, options);
    await element.waitFor({ state: 'visible', timeout: options?.timeout });
    return (await element.textContent({ timeout: options?.timeout }))?.trim() ?? '';
  }

  async getInputValue(selector: string | Locator, options?: ActionOptions): Promise<string> {
    const element = this.getLocator(selector, options);
    await element.waitFor({ state: 'visible', timeout: options?.timeout });
    return await element.inputValue({ timeout: options?.timeout });
  }

  async selectDropdownByValue(selector: string | Locator, value: string, options?: ActionOptions): Promise<string[]> {
    const element = this.getLocator(selector, options);
    await element.waitFor({ state: 'visible', timeout: options?.timeout });
    return await element.selectOption({ value }, { timeout: options?.timeout });
  }

  async selectDropdownByLabel(selector: string | Locator, label: string, options?: ActionOptions): Promise<string[]> {
    const element = this.getLocator(selector, options);
    await element.waitFor({ state: 'visible', timeout: options?.timeout });
    return await element.selectOption({ label }, { timeout: options?.timeout });
  }

  async check(selector: string | Locator, options?: ActionOptions): Promise<void> {
    const element = this.getLocator(selector, options);
    await element.waitFor({ state: 'visible', timeout: options?.timeout });
    await element.check({ timeout: options?.timeout });
  }

  async uncheck(selector: string | Locator, options?: ActionOptions): Promise<void> {
    const element = this.getLocator(selector, options);
    await element.waitFor({ state: 'visible', timeout: options?.timeout });
    await element.uncheck({ timeout: options?.timeout });
  }

  async hover(selector: string | Locator, options?: ActionOptions): Promise<void> {
    const element = this.getLocator(selector, options);
    await element.waitFor({ state: 'visible', timeout: options?.timeout });
    await element.hover({ timeout: options?.timeout });
  }

  // --- State Assertions ---

  async expectToBeVisible(selector: string | Locator, timeout = 5000, options?: ActionOptions): Promise<void> {
    const element = this.getLocator(selector, options);
    await expect(element).toBeVisible({ timeout });
  }

  async expectToBeHidden(selector: string | Locator, timeout = 5000, options?: ActionOptions): Promise<void> {
    const element = this.getLocator(selector, options);
    await expect(element).toBeHidden({ timeout });
  }

  async expectToHaveText(selector: string | Locator, expectedText: string, timeout = 5000, options?: ActionOptions): Promise<void> {
    const element = this.getLocator(selector, options);
    await expect(element).toHaveText(expectedText, { timeout });
  }

  async expectToContainText(selector: string | Locator, expectedSubstring: string, timeout = 5000, options?: ActionOptions): Promise<void> {
    const element = this.getLocator(selector, options);
    await expect(element).toContainText(expectedSubstring, { timeout });
  }

  // --- Explicit Wait Utils ---

  async waitForElementState(
    selector: string | Locator,
    state: 'attached' | 'detached' | 'visible' | 'hidden',
    timeout = 10000,
    options?: ActionOptions
  ): Promise<void> {
    const element = this.getLocator(selector, options);
    await element.waitFor({ state, timeout });
  }

  async waitForPageNetworkIdle(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }
}