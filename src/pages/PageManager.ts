import { Page, BrowserContext } from "@playwright/test";
import { PageHolder } from "../support/page-holder";
import { LoginPage } from "./LoginPage";
import { InventoryPage } from "./InventoryPage";
import { CheckoutPage } from "./CheckoutPage";
import { IframeSandboxPage } from "./IframeSandboxPage";
import { WindowsDemoPage } from "./WindowsDemoPage";

export class PageManager {
  private readonly holder: PageHolder;
  private _loginPage?: LoginPage;
  private _inventoryPage?: InventoryPage;
  private _checkoutPage?: CheckoutPage;
  private _iframeSandboxPage?: IframeSandboxPage;
  private _windowsDemoPage?: WindowsDemoPage;

  constructor(initialPage: Page) {
    this.holder = { current: initialPage };
  }

  get page(): Page {
    return this.holder.current;
  }

  // --- Page Object Getters ---

  get loginPage(): LoginPage {
    if (!this._loginPage) {
      this._loginPage = new LoginPage(this.holder);
    }
    return this._loginPage;
  }

  get inventoryPage(): InventoryPage {
    if (!this._inventoryPage) {
      this._inventoryPage = new InventoryPage(this.holder);
    }
    return this._inventoryPage;
  }

  get checkoutPage(): CheckoutPage {
    if (!this._checkoutPage) {
      this._checkoutPage = new CheckoutPage(this.holder);
    }
    return this._checkoutPage;
  }

  get iframeSandboxPage(): IframeSandboxPage {
    if (!this._iframeSandboxPage) {
      this._iframeSandboxPage = new IframeSandboxPage(this.holder);
    }
    return this._iframeSandboxPage;
  }

  get windowsDemoPage(): WindowsDemoPage {
    if (!this._windowsDemoPage) {
      this._windowsDemoPage = new WindowsDemoPage(this.holder);
    }
    return this._windowsDemoPage;
  }
}
