@api
Feature: User API Management

  Scenario: Retrieve an existing user by ID
    When the client requests user details for ID 1
    Then the API response status should be 200
    And the user response should have username "Bret"

  Scenario: Create a new user
    When the client creates a user with name "Jane Doe", username "janedoe", and email "jane@example.com"
    Then the API response status should be 201