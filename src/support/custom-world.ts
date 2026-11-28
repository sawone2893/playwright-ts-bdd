import { type IWorldOptions, setWorldConstructor, World } from '@cucumber/cucumber';
import type {
  APIRequestContext,
  APIResponse,
  Browser,
  BrowserContext,
  Page,
} from '@playwright/test';
import type { ApiManager } from '../api/ApiManager';
import type { PageManager } from '../pageObjectFactory/PageManager';

export interface CustomWorld extends World {
  browser?: Browser;
  context?: BrowserContext;
  page?: Page;
  pageManager?: PageManager;

  // API Testing properties
  apiContext?: APIRequestContext;
  apiManager?: ApiManager;
  lastResponse?: APIResponse;
}

export class CustomWorldImpl extends World implements CustomWorld {
  browser?: Browser;
  context?: BrowserContext;
  page?: Page;
  pageManager?: PageManager;
  constructor(options: IWorldOptions) {
    super(options);
  }
}

setWorldConstructor(CustomWorldImpl);
