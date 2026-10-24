import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export interface ShippingInfo {
  firstName: string;
  lastName: string;
  postalCode: string;
}

export class CheckoutPage extends BasePage {
  private readonly firstNameInput = '#first-name';
  private readonly lastNameInput = '#last-name';
  private readonly postalCodeInput = '#postal-code';
  private readonly continueButton = '#continue';
  private readonly finishButton = '#finish';
  private readonly confirmationHeader = '.complete-header';

  constructor(page: Page) {
    super(page);
  }

  async fillShippingDetails(info: ShippingInfo): Promise<void> {
    await this.type(this.firstNameInput, info.firstName);
    await this.type(this.lastNameInput, info.lastName);
    await this.type(this.postalCodeInput, info.postalCode);
  }

  async continueCheckout(): Promise<void> {
    await this.click(this.continueButton);
  }

  async finishOrder(): Promise<void> {
    await this.click(this.finishButton);
  }

  async verifyItemPresentInOverview(productName: string, quantity: string): Promise<void> {
    const itemRow = this.page.locator('.cart_item').filter({ hasText: productName });
    await this.expectToBeVisible(itemRow);
    await this.expectToHaveText(itemRow.locator('.cart_quantity'), quantity);
  }

  async verifyConfirmationHeader(expectedMessage: string): Promise<void> {
    await this.expectToHaveText(this.confirmationHeader, expectedMessage);
  }
}