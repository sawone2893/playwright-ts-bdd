import { expect, type Locator, type Page } from '@playwright/test';

export class UiAssertions {
  private static readonly defaultTimeout = 5000;

  static async toBeVisible(
    locator: Locator,
    timeout = this.defaultTimeout,
    message?: string,
  ): Promise<void> {
    await expect(locator, message).toBeVisible({ timeout });
  }

  static async toBeHidden(
    locator: Locator,
    timeout = this.defaultTimeout,
    message?: string,
  ): Promise<void> {
    await expect(locator, message).toBeHidden({ timeout });
  }

  static async toHaveText(
    locator: Locator,
    expectedText: string | RegExp,
    timeout = this.defaultTimeout,
    message?: string,
  ): Promise<void> {
    await expect(locator, message).toHaveText(expectedText, { timeout });
  }

  static async toContainText(
    locator: Locator,
    expectedSubstring: string | RegExp,
    timeout = this.defaultTimeout,
    message?: string,
  ): Promise<void> {
    await expect(locator, message).toContainText(expectedSubstring, { timeout });
  }

  static async toHaveValue(
    locator: Locator,
    expectedValue: string | RegExp,
    timeout = this.defaultTimeout,
    message?: string,
  ): Promise<void> {
    await expect(locator, message).toHaveValue(expectedValue, { timeout });
  }

  static async toBeEnabled(
    locator: Locator,
    timeout = this.defaultTimeout,
    message?: string,
  ): Promise<void> {
    await expect(locator, message).toBeEnabled({ timeout });
  }

  static async toBeDisabled(
    locator: Locator,
    timeout = this.defaultTimeout,
    message?: string,
  ): Promise<void> {
    await expect(locator, message).toBeDisabled({ timeout });
  }

  static async toHaveAttribute(
    locator: Locator,
    name: string,
    value: string | RegExp,
    timeout = this.defaultTimeout,
    message?: string,
  ): Promise<void> {
    await expect(locator, message).toHaveAttribute(name, value, { timeout });
  }

  static async toHaveCount(
    locator: Locator,
    count: number,
    timeout = this.defaultTimeout,
    message?: string,
  ): Promise<void> {
    await expect(locator, message).toHaveCount(count, { timeout });
  }

  // --- Page-Level Assertions ---

  static async toHaveUrl(
    page: Page,
    expectedUrl: string | RegExp,
    timeout = this.defaultTimeout,
    message?: string,
  ): Promise<void> {
    await expect(page, message).toHaveURL(expectedUrl, { timeout });
  }

  static async toHaveTitle(
    page: Page,
    expectedTitle: string | RegExp,
    timeout = this.defaultTimeout,
    message?: string,
  ): Promise<void> {
    await expect(page, message).toHaveTitle(expectedTitle, { timeout });
  }
}
