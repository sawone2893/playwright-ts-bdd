@windows
Feature: Multi-Window and Tab Handling

  Scenario: Switching between parent window and child popup tab
    Given the user opens the windows test page
    When the user clicks the link to open a new tab
    Then the new window should display heading "New Window"
    And the user closes the child tab and returns to the parent window
    Then the parent window heading should display "Opening a new window"