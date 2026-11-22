// src/api/core/BaseApiClient.ts
import { APIRequestContext, APIResponse, expect } from '@playwright/test';
import { config } from '../../support/config';

export interface ApiRequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
  data?: unknown;
  timeout?: number;
}

export abstract class BaseApiClient {
  protected readonly request: APIRequestContext;

  constructor(request: APIRequestContext) {
    this.request = request;
  }

  protected async sendRequest(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    endpoint: string,
    options?: ApiRequestOptions
  ): Promise<APIResponse> {
    const startTime = Date.now();

    const response = await this.request.fetch(endpoint, {
      method,
      headers: options?.headers,
      params: options?.params,
      data: options?.data,
      timeout: options?.timeout ?? config.apiTimeout,
    });

    const duration = Date.now() - startTime;
    console.log(`[API] ${method} ${endpoint} -> ${response.status()} (${duration}ms)`);

    return response;
  }

  async get(endpoint: string, options?: ApiRequestOptions): Promise<APIResponse> {
    return await this.sendRequest('GET', endpoint, options);
  }

  async post(endpoint: string, options?: ApiRequestOptions): Promise<APIResponse> {
    return await this.sendRequest('POST', endpoint, options);
  }

  async put(endpoint: string, options?: ApiRequestOptions): Promise<APIResponse> {
    return await this.sendRequest('PUT', endpoint, options);
  }

  async patch(endpoint: string, options?: ApiRequestOptions): Promise<APIResponse> {
    return await this.sendRequest('PATCH', endpoint, options);
  }

  async delete(endpoint: string, options?: ApiRequestOptions): Promise<APIResponse> {
    return await this.sendRequest('DELETE', endpoint, options);
  }

  // --- Centralized Assertions & Parsers ---

  async expectStatus(response: APIResponse, expectedStatus: number): Promise<void> {
    const actualStatus = response.status();
    if (actualStatus !== expectedStatus) {
      const bodyText = await response.text();
      expect(
        actualStatus,
        `Expected status ${expectedStatus}, got ${actualStatus}. Response: ${bodyText}`
      ).toBe(expectedStatus);
    }
  }

  async parseJson<T>(response: APIResponse): Promise<T> {
    return (await response.json()) as T;
  }
}