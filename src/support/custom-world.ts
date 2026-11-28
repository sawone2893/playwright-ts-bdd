import { setWorldConstructor, World, IWorldOptions } from '@cucumber/cucumber';
import { Browser, BrowserContext, Page, APIRequestContext, APIResponse } from '@playwright/test';
import { PageManager } from '../pageObjectFactory/PageManager';
import { ApiManager } from '../api/ApiManager';

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