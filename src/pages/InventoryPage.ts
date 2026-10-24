import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class InventoryPage extends BasePage {
  private readonly cartIcon = '.shopping_cart_link';
  private readonly checkoutButton = '#checkout';

  constructor(page: Page) {
    super(page);
  }

  async addProductToCart(productName: string): Promise<void> {
    // Dynamic selector based on text locator strategy
    const addToCartButton = this.page
      .locator('.inventory_item')
      .filter({ hasText: productName })
      .locator('button');
    await this.click(addToCartButton);
  }

  async openCart(): Promise<void> {
    await this.click(this.cartIcon);
  }

  async proceedToCheckout(): Promise<void> {
    await this.click(this.checkoutButton);
  }
}