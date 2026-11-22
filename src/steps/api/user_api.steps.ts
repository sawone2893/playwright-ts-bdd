import { When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../../support/custom-world';
import { UserResponse } from '../../api/models/user.model';

When('the client requests user details for ID {int}', async function (this: CustomWorld, userId: number) {
  this.lastResponse = await this.apiManager!.userService.getUserById(userId);
});

When(
  'the client creates a user with name {string}, username {string}, and email {string}',
  async function (this: CustomWorld, name: string, username: string, email: string) {
    this.lastResponse = await this.apiManager!.userService.createUser({ name, username, email });
  }
);

Then('the API response status should be {int}', async function (this: CustomWorld, expectedStatus: number) {
  await this.apiManager!.userService.expectStatus(this.lastResponse!, expectedStatus);
});

Then('the user response should have username {string}', async function (this: CustomWorld, expectedUsername: string) {
  const user = await this.apiManager!.userService.parseJson<UserResponse>(this.lastResponse!);
  expect(user.username).toBe(expectedUsername);
});