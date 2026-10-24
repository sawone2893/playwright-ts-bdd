import { Given, When, Then, DataTable } from '@cucumber/cucumber';
import { CustomWorld } from '../support/custom-world';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CheckoutPage, ShippingInfo } from '../pages/CheckoutPage';

Given('the user logs in with standard credentials', async function (this: CustomWorld) {
  const loginPage = new LoginPage(this.page!);
  await loginPage.login('standard_user', 'secret_sauce');
  await loginPage.verifyDashboardDisplayed();
});

When('the user adds the following products to the cart:', async function (this: CustomWorld, dataTable: DataTable) {
  const inventoryPage = new InventoryPage(this.page!);
  // dataTable.hashes() returns: [{ productName: 'Sauce Labs Backpack' }, ...]
  const items = dataTable.hashes();

  for (const item of items) {
    await inventoryPage.addProductToCart(item.productName);
  }
});

When('the user opens the shopping cart', async function (this: CustomWorld) {
  const inventoryPage = new InventoryPage(this.page!);
  await inventoryPage.openCart();
});

When('the user proceeds to checkout', async function (this: CustomWorld) {
  const inventoryPage = new InventoryPage(this.page!);
  await inventoryPage.proceedToCheckout();
});

When('the user fills in shipping information:', async function (this: CustomWorld, dataTable: DataTable) {
  const checkoutPage = new CheckoutPage(this.page!);
  // dataTable.rowsHash() turns two columns into an object: { firstName: 'John', ... }
  const shippingData = dataTable.rowsHash() as unknown as ShippingInfo;
  await checkoutPage.fillShippingDetails(shippingData);
});

When('the user continues to the order summary', async function (this: CustomWorld) {
  const checkoutPage = new CheckoutPage(this.page!);
  await checkoutPage.continueCheckout();
});

Then('the order overview should list the selected items:', async function (this: CustomWorld, dataTable: DataTable) {
  const checkoutPage = new CheckoutPage(this.page!);
  const expectedItems = dataTable.hashes();

  for (const item of expectedItems) {
    await checkoutPage.verifyItemPresentInOverview(item.productName, item.quantity);
  }
});

When('the user finishes the purchase', async function (this: CustomWorld) {
  const checkoutPage = new CheckoutPage(this.page!);
  await checkoutPage.finishOrder();
});

Then('the order confirmation message {string} should be displayed', async function (this: CustomWorld, message: string) {
  const checkoutPage = new CheckoutPage(this.page!);
  await checkoutPage.verifyConfirmationHeader(message);
});