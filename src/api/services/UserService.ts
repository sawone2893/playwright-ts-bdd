import { APIRequestContext, APIResponse } from '@playwright/test';
import { BaseApiClient } from '../core/BaseApiClient';
import { CreateUserRequest } from '../models/user.model';

export class UserService extends BaseApiClient {
  private readonly basePath = '/users';

  constructor(request: APIRequestContext) {
    super(request);
  }

  async getUserById(userId: number): Promise<APIResponse> {
    return await this.get(`${this.basePath}/${userId}`);
  }

  async createUser(payload: CreateUserRequest): Promise<APIResponse> {
    return await this.post(this.basePath, { data: payload });
  }

  async deleteUser(userId: number): Promise<APIResponse> {
    return await this.delete(`${this.basePath}/${userId}`);
  }
}