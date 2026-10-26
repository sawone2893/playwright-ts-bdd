import { Given, When, Then, DataTable } from "@cucumber/cucumber";
import { CustomWorld } from "../support/custom-world";
import { ShippingInfo } from "../pages/CheckoutPage";

Given(
  "the user logs in with standard credentials",
  async function (this: CustomWorld) {
    await this.pageManager!.loginPage.login("standard_user", "secret_sauce");
    await this.pageManager!.loginPage.verifyDashboardDisplayed();
  },
);

When(
  "the user adds the following products to the cart:",
  async function (this: CustomWorld, dataTable: DataTable) {
    // dataTable.hashes() returns: [{ productName: 'Sauce Labs Backpack' }, ...]
    const items = dataTable.hashes();
    for (const item of items) {
      await this.pageManager!.inventoryPage.addProductToCart(item.productName);
    }
  },
);

When("the user opens the shopping cart", async function (this: CustomWorld) {
  await this.pageManager!.inventoryPage.openCart();
});

When("the user proceeds to checkout", async function (this: CustomWorld) {
  await this.pageManager!.inventoryPage.proceedToCheckout();
});

When(
  "the user fills in shipping information:",
  async function (this: CustomWorld, dataTable: DataTable) {
    const rawData = dataTable.rowsHash();

    const shippingData: ShippingInfo = {
      firstName: rawData["firstName"] ?? "",
      lastName: rawData["lastName"] ?? "",
      postalCode: rawData["postalCode"] ?? "",
    };

    await this.pageManager!.checkoutPage.fillShippingDetails(shippingData);
  },
);

When(
  "the user continues to the order summary",
  async function (this: CustomWorld) {
    await this.pageManager!.checkoutPage.continueCheckout();
  },
);

Then(
  "the order overview should list the selected items:",
  async function (this: CustomWorld, dataTable: DataTable) {
    const expectedItems = dataTable.hashes();

    for (const item of expectedItems) {
      await this.pageManager!.checkoutPage.verifyItemPresentInOverview(
        item.productName,
        item.quantity,
      );
    }
  },
);

When("the user finishes the purchase", async function (this: CustomWorld) {
  await this.pageManager!.checkoutPage.finishOrder();
});

Then(
  "the order confirmation message {string} should be displayed",
  async function (this: CustomWorld, message: string) {
    await this.pageManager!.checkoutPage.verifyConfirmationHeader(message);
  },
);
