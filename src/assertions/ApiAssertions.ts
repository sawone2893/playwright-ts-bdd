import { type APIResponse, expect } from '@playwright/test';

export class ApiAssertions {
  /**
   * Verifies exact HTTP status code and prints the response body on failure.
   */
  static async toHaveStatus(response: APIResponse, expectedStatus: number): Promise<void> {
    const actualStatus = response.status();
    if (actualStatus !== expectedStatus) {
      const bodyText = await response.text();
      expect(
        actualStatus,
        `Expected status ${expectedStatus}, got ${actualStatus}. URL: ${response.url()}\nBody: ${bodyText}`,
      ).toBe(expectedStatus);
    }
  }

  /**
   * Verifies response status is in the 2xx range.
   */
  static async toBeOk(response: APIResponse): Promise<void> {
    if (!response.ok()) {
      const bodyText = await response.text();
      expect(
        response.ok(),
        `Expected 2xx response, got ${response.status()}. URL: ${response.url()}\nBody: ${bodyText}`,
      ).toBe(true);
    }
  }

  /**
   * Verifies a specific response header exists and optionally matches an expected value.
   */
  static toHaveHeader(
    response: APIResponse,
    headerName: string,
    expectedValue?: string | RegExp,
  ): void {
    const headers = response.headers();
    const actualValue = headers[headerName.toLowerCase()];

    expect(actualValue, `Header "${headerName}" was not found in response.`).toBeDefined();

    if (expectedValue !== undefined) {
      if (typeof expectedValue === 'string') {
        expect(actualValue).toContain(expectedValue);
      } else {
        expect(actualValue).toMatch(expectedValue);
      }
    }
  }

  /**
   * Verifies a top-level or nested property in the JSON body (e.g., "user.address.city").
   */
  static async toHaveJsonProperty(
    response: APIResponse,
    propertyPath: string,
    expectedValue?: unknown,
  ): Promise<void> {
    const body = (await response.json()) as Record<string, unknown>;
    const keys = propertyPath.split('.');

    let current: unknown = body;
    for (const key of keys) {
      if (current === null || typeof current !== 'object' || !(key in current)) {
        throw new Error(
          `Property "${propertyPath}" not found in JSON response: ${JSON.stringify(body)}`,
        );
      }
      current = (current as Record<string, unknown>)[key];
    }

    if (expectedValue !== undefined) {
      expect(current, `Mismatch at JSON path "${propertyPath}"`).toEqual(expectedValue);
    }
  }

  /**
   * Verifies the JSON response is an array with at least `minLength` items.
   */
  static async toBeArrayWithMinLength(response: APIResponse, minLength = 1): Promise<void> {
    const body = await response.json();
    expect(Array.isArray(body), 'Expected JSON response to be an array.').toBe(true);
    expect((body as unknown[]).length).toBeGreaterThanOrEqual(minLength);
  }
}
