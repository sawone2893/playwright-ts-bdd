// src/support/page-holder.ts
import type { Page } from '@playwright/test';

export interface PageHolder {
  current: Page;
}
