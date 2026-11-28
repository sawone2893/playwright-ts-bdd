import { Then, When } from '@cucumber/cucumber';
import { ApiAssertions } from '../../assertions/ApiAssertions';
import type { CustomWorld } from '../../support/custom-world';

When(
  'the client requests user details for ID {int}',
  async function (this: CustomWorld, userId: number) {
    this.lastResponse = await this.apiManager!.userService.getUserById(userId);
  },
);

When(
  'the client creates a user with name {string}, username {string}, and email {string}',
  async function (this: CustomWorld, name: string, username: string, email: string) {
    this.lastResponse = await this.apiManager!.userService.createUser({ name, username, email });
  },
);

Then(
  'the API response status should be {int}',
  async function (this: CustomWorld, statusCode: number) {
    await ApiAssertions.toHaveStatus(this.lastResponse!, statusCode);
  },
);

Then(
  'the user response should have username {string}',
  async function (this: CustomWorld, username: string) {
    await ApiAssertions.toHaveJsonProperty(this.lastResponse!, 'username', username);
  },
);
