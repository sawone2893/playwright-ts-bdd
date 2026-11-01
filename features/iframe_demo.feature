@iframe
Feature: Verify BasePage Iframe Support

  Scenario: Write and verify text inside a single iframe
    Given the user navigates to the iframe sandbox
    When the user writes "Hello from Playwright Iframe Framework" into the editor iframe
    Then the editor iframe should display "Hello from Playwright Iframe Framework"

  Scenario: Verify text inside nested frames
    Given the user navigates to the nested frames sandbox
    Then the middle nested frame should display "MIDDLE"