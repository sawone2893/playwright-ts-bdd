import { setWorldConstructor, World, IWorldOptions } from '@cucumber/cucumber';
import { Browser, BrowserContext, Page } from '@playwright/test';
import { PageManager } from '../pages/PageManager';

export interface CustomWorld extends World {
  browser?: Browser;
  context?: BrowserContext;
  page?: Page;
  pageManager?: PageManager;
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