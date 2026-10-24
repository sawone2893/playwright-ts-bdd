import { Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { config } from '../support/config';

export class LoginPage extends BasePage {
  private readonly usernameInput = '#user-name';
  private readonly passwordInput = '#password';
  private readonly loginButton = '#login-button';
  private readonly dashboardHeader = '.title';
  private readonly errorMessage = '[data-test="error"]';

  constructor(page: Page) {
    super(page);
  }

  async navigate(): Promise<void> {
    await this.goto(config.baseUrl);
  }

  async login(user: string, pass: string): Promise<void> {
    await this.type(this.usernameInput, user);
    await this.type(this.passwordInput, pass);
    await this.click(this.loginButton);
  }

  async verifyDashboardDisplayed(): Promise<void> {
    await this.expectToBeVisible(this.dashboardHeader);
  }

  async verifyErrorMessage(expectedText: string): Promise<void> {
    await this.expectToContainText(this.errorMessage, expectedText);
  }

  async verifyUsernameFieldVisible(): Promise<void> {
    await this.expectToBeVisible(this.usernameInput);
  }

  async verifyPasswordFieldVisible(): Promise<void> {
    await this.expectToBeVisible(this.passwordInput);
  }

  async verifyLoginButtonVisible(): Promise<void> {
    await this.expectToBeVisible(this.loginButton);
  }
}