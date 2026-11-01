import { Page } from "@playwright/test";
import { LoginPage } from "./LoginPage";
import { InventoryPage } from "./InventoryPage";
import { CheckoutPage } from "./CheckoutPage";
import { IframeSandboxPage } from "./IframeSandboxPage";

export class PageManager {
  private readonly page: Page;
  private _loginPage?: LoginPage;
  private _inventoryPage?: InventoryPage;
  private _checkoutPage?: CheckoutPage;
  private _iframeSandboxPage?: IframeSandboxPage;

  constructor(page: Page) {
    this.page = page;
  }

  get loginPage(): LoginPage {
    if (!this._loginPage) {
      this._loginPage = new LoginPage(this.page);
    }
    return this._loginPage;
  }

  get inventoryPage(): InventoryPage {
    if (!this._inventoryPage) {
      this._inventoryPage = new InventoryPage(this.page);
    }
    return this._inventoryPage;
  }

  get checkoutPage(): CheckoutPage {
    if (!this._checkoutPage) {
      this._checkoutPage = new CheckoutPage(this.page);
    }
    return this._checkoutPage;
  }

  get iframeSandboxPage(): IframeSandboxPage {
    if (!this._iframeSandboxPage) {
      this._iframeSandboxPage = new IframeSandboxPage(this.page);
    }
    return this._iframeSandboxPage;
  }
}
