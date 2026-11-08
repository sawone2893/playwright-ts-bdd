// src/support/page-holder.ts
import { Page } from '@playwright/test';

export interface PageHolder {
  current: Page;
}