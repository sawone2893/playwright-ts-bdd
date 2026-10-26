@auth @regression
Feature: User Authentication & Login Scenarios

  As an existing user of SauceDemo
  I want to be able to log in with valid credentials
  And see appropriate error messages when entering invalid credentials
  So that I can securely access the platform

  Background:
    Given the user navigates to the login page

  @smoke @positive
  Scenario: Successful login with standard valid credentials
    When the user enters credentials "standard_user" and "secret_sauce"
    Then the dashboard title should be displayed

  @negative
  Scenario Outline: Failed login with invalid or missing credentials
    When the user enters credentials "<username>" and "<password>"
    Then the login error message should contain "<expected_error>"

    Examples:
      | username        | password         | expected_error                                              |
      | locked_out_user | secret_sauce     | Epic sadface: Sorry, this user has been locked out.         |
      | standard_user   | wrong_password   | Epic sadface: Username and password do not match            |
      | invalid_user    | invalid_password | Epic sadface: Username and password do not match            |
      |                 | secret_sauce     | Epic sadface: Username is required                          |
      | standard_user   |                  | Epic sadface: Password is required                          |
      |                 |                  | Epic sadface: Username is required                          |

  @ui @visual
  Scenario: Verify all initial login form elements are visible
    Then the username field should be visible
    And the password field should be visible
    And the login button should be visible