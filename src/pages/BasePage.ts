import {
  Page,
  Locator,
  FrameLocator,
  BrowserContext,
  expect,
} from "@playwright/test";
import { PageHolder } from '../support/page-holder';
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
  protected readonly holder: PageHolder;

  constructor(holder: PageHolder) {
    this.holder = holder;
  }

  // --- Dynamic Page & Context Accessors ---

  get page(): Page {
    return this.holder.current;
  }

  get context(): BrowserContext {
    return this.holder.current.context();
  }

  // --- Centralized Window / Tab Controls ---

  /**
   * Triggers an action that spawns a new window, waits for it,
   * updates the shared holder, and brings the new tab to the front.
   */
  async openAndSwitchToNewWindow(triggerAction: () => Promise<void>): Promise<Page> {
    const [newPage] = await Promise.all([
      this.context.waitForEvent('page'),
      triggerAction(),
    ]);

    await newPage.waitForLoadState('domcontentloaded');
    this.holder.current = newPage;
    await newPage.bringToFront();
    return newPage;
  }

  /**
   * Helper to click an element and switch active focus to the newly opened tab.
   */
  async clickAndSwitchToNewWindow(selector: string | Locator, options?: ActionOptions): Promise<Page> {
    return await this.openAndSwitchToNewWindow(async () => {
      await this.click(selector, options);
    });
  }

  /**
   * Switches active context to an already open window matching title or URL.
   */
  async switchToWindow(identifier: string | RegExp): Promise<void> {
    const pages = this.context.pages();

    for (const p of pages) {
      const title = await p.title();
      const url = p.url();

      const isMatch = typeof identifier === 'string'
        ? title.includes(identifier) || url.includes(identifier)
        : identifier.test(title) || identifier.test(url);

      if (isMatch) {
        this.holder.current = p;
        await p.bringToFront();
        return;
      }
    }

    throw new Error(`Window matching "${identifier}" was not found.`);
  }

  /**
   * Switches active context to a window by its index (0 = parent, 1 = first popup, etc.).
   */
  async switchToWindowByIndex(index: number): Promise<void> {
    const pages = this.context.pages();
    if (!pages[index]) {
      throw new Error(`Window at index ${index} does not exist. Total open windows: ${pages.length}`);
    }
    this.holder.current = pages[index];
    await this.holder.current.bringToFront();
  }

  /**
   * Closes the active child tab and switches focus back to the parent window (index 0).
   */
  async closeActiveWindowAndSwitchToParent(): Promise<void> {
    const pages = this.context.pages();
    if (pages.length > 1) {
      await this.page.close();
      this.holder.current = pages[0];
      await this.holder.current.bringToFront();
    }
  }

  // --- Navigation & Window Management ---

  async goto(url: string): Promise<void> {
    await this.page.goto(url, { waitUntil: "domcontentloaded" });
  }

  async getPageTitle(): Promise<string> {
    return await this.page.title();
  }

  async getPageUrl(): Promise<string> {
    return this.page.url();
  }

  async reload(): Promise<void> {
    await this.page.reload({ waitUntil: "domcontentloaded" });
  }

  async bringToFront(): Promise<void> {
    await this.page.bringToFront();
  }

  async closeWindow(): Promise<void> {
    await this.page.close();
  }

  /**
   * Performs an action (like a link or button click) that spawns a new window/tab,
   * waits for the new page to be created, and returns the new Page instance.
   */
  async openNewWindow(triggerAction: () => Promise<void>): Promise<Page> {
    const [newPage] = await Promise.all([
      this.context.waitForEvent("page"),
      triggerAction(),
    ]);
    await newPage.waitForLoadState("domcontentloaded");
    return newPage;
  }

  /**
   * Helper to click an element and immediately capture the opened window/tab.
   */
  async clickAndOpenNewWindow(
    selector: string | Locator,
    options?: ActionOptions,
  ): Promise<Page> {
    return await this.openNewWindow(async () => {
      await this.click(selector, options);
    });
  }

  // --- Frame & Nested Frame Resolvers ---

  /**
   * Resolves single or deeply nested iframes into a chained FrameLocator.
   * Example: this.resolveFrame(['#parent-iframe', '#child-iframe'])
   */
  resolveFrame(frame: string | string[] | FrameLocator): FrameLocator {
    if (typeof frame !== "string" && !Array.isArray(frame)) {
      return frame;
    }

    const selectors = Array.isArray(frame) ? frame : [frame];
    if (selectors.length === 0) {
      throw new Error("Frame selector array cannot be empty.");
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

  protected getLocator(
    selector: string | Locator,
    options?: ActionOptions,
  ): Locator {
    if (typeof selector !== "string") {
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
  async write(
    selector: string | Locator,
    text: string,
    options?: ActionOptions & { delay?: number },
  ): Promise<void> {
    const element = this.getLocator(selector, options);
    await element.waitFor({ state: "visible", timeout: options?.timeout });
    await element.fill("", { timeout: options?.timeout });

    if (options?.delay && options.delay > 0) {
      await element.pressSequentially(text, {
        delay: options.delay,
        timeout: options?.timeout,
      });
    } else {
      await element.fill(text, { timeout: options?.timeout });
    }
  }

  async type(
    selector: string | Locator,
    text: string,
    delay = 0,
    options?: ActionOptions,
  ): Promise<void> {
    await this.write(selector, text, { ...options, delay });
  }

  async click(
    selector: string | Locator,
    options?: ActionOptions,
  ): Promise<void> {
    const element = this.getLocator(selector, options);
    await element.waitFor({ state: "visible", timeout: options?.timeout });
    await element.click({ timeout: options?.timeout });
  }

  async getText(
    selector: string | Locator,
    options?: ActionOptions,
  ): Promise<string> {
    const element = this.getLocator(selector, options);
    await element.waitFor({ state: "visible", timeout: options?.timeout });
    return (
      (await element.textContent({ timeout: options?.timeout }))?.trim() ?? ""
    );
  }

  async getInputValue(
    selector: string | Locator,
    options?: ActionOptions,
  ): Promise<string> {
    const element = this.getLocator(selector, options);
    await element.waitFor({ state: "visible", timeout: options?.timeout });
    return await element.inputValue({ timeout: options?.timeout });
  }

  async selectDropdownByValue(
    selector: string | Locator,
    value: string,
    options?: ActionOptions,
  ): Promise<string[]> {
    const element = this.getLocator(selector, options);
    await element.waitFor({ state: "visible", timeout: options?.timeout });
    return await element.selectOption({ value }, { timeout: options?.timeout });
  }

  async selectDropdownByLabel(
    selector: string | Locator,
    label: string,
    options?: ActionOptions,
  ): Promise<string[]> {
    const element = this.getLocator(selector, options);
    await element.waitFor({ state: "visible", timeout: options?.timeout });
    return await element.selectOption({ label }, { timeout: options?.timeout });
  }

  async check(
    selector: string | Locator,
    options?: ActionOptions,
  ): Promise<void> {
    const element = this.getLocator(selector, options);
    await element.waitFor({ state: "visible", timeout: options?.timeout });
    await element.check({ timeout: options?.timeout });
  }

  async uncheck(
    selector: string | Locator,
    options?: ActionOptions,
  ): Promise<void> {
    const element = this.getLocator(selector, options);
    await element.waitFor({ state: "visible", timeout: options?.timeout });
    await element.uncheck({ timeout: options?.timeout });
  }

  async hover(
    selector: string | Locator,
    options?: ActionOptions,
  ): Promise<void> {
    const element = this.getLocator(selector, options);
    await element.waitFor({ state: "visible", timeout: options?.timeout });
    await element.hover({ timeout: options?.timeout });
  }

  // --- State Assertions ---

  async expectToBeVisible(
    selector: string | Locator,
    timeout = 5000,
    options?: ActionOptions,
  ): Promise<void> {
    const element = this.getLocator(selector, options);
    await expect(element).toBeVisible({ timeout });
  }

  async expectToBeHidden(
    selector: string | Locator,
    timeout = 5000,
    options?: ActionOptions,
  ): Promise<void> {
    const element = this.getLocator(selector, options);
    await expect(element).toBeHidden({ timeout });
  }

  async expectToHaveText(
    selector: string | Locator,
    expectedText: string,
    timeout = 5000,
    options?: ActionOptions,
  ): Promise<void> {
    const element = this.getLocator(selector, options);
    await expect(element).toHaveText(expectedText, { timeout });
  }

  async expectToContainText(
    selector: string | Locator,
    expectedSubstring: string,
    timeout = 5000,
    options?: ActionOptions,
  ): Promise<void> {
    const element = this.getLocator(selector, options);
    await expect(element).toContainText(expectedSubstring, { timeout });
  }

  // --- Explicit Wait Utils ---

  async waitForElementState(
    selector: string | Locator,
    state: "attached" | "detached" | "visible" | "hidden",
    timeout = 10000,
    options?: ActionOptions,
  ): Promise<void> {
    const element = this.getLocator(selector, options);
    await element.waitFor({ state, timeout });
  }

  async waitForPageNetworkIdle(): Promise<void> {
    await this.page.waitForLoadState("networkidle");
  }
}
