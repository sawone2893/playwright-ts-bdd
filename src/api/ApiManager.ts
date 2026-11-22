import { APIRequestContext } from '@playwright/test';
import { UserService } from './services/UserService';

export class ApiManager {
  private readonly request: APIRequestContext;
  private _userService?: UserService;

  constructor(request: APIRequestContext) {
    this.request = request;
  }

  get userService(): UserService {
    if (!this._userService) {
      this._userService = new UserService(this.request);
    }
    return this._userService;
  }
}