@checkout @e2e
Feature: E-Commerce Product Purchase and Checkout Flow

  As a standard registered user
  I want to select items, enter my shipping details, and place an order
  So that I can successfully purchase products online

  Background:
    Given the user navigates to the login page
    And the user logs in with standard credentials

  @smoke
  Scenario: Complete end-to-end checkout with multiple items
    When the user adds the following products to the cart:
      | productName         |
      | Sauce Labs Backpack |
      | Sauce Labs Bike Light |
      | Sauce Labs Bolt T-Shirt |
    And the user opens the shopping cart
    And the user proceeds to checkout
    And the user fills in shipping information:
      | firstName  | John       |
      | lastName   | Doe        |
      | postalCode | 12345      |
    And the user continues to the order summary
    Then the order overview should list the selected items:
      | productName             | quantity |
      | Sauce Labs Backpack     | 1        |
      | Sauce Labs Bike Light   | 1        |
      | Sauce Labs Bolt T-Shirt | 1        |
    When the user finishes the purchase
    Then the order confirmation message "Thank you for your order!" should be displayed