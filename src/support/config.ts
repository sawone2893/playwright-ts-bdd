import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

export type Environment = 'dev' | 'qa' | 'staging' | 'prod' | 'local';
export type BrowserType = 'chromium' | 'firefox' | 'webkit';

// 1. Determine active environment (CLI flag takes precedence, defaults to 'qa')
const activeEnv: Environment = (process.env.ENV as Environment) || 'qa';

// 2. Resolve paths pointing inside the env/ directory
const rootDir = process.cwd();
const envDirPath = path.resolve(rootDir, 'env');
const baseEnvPath = path.resolve(envDirPath, '.env');
const targetEnvPath = path.resolve(envDirPath, `.env.${activeEnv}`);

// 3. Load default fallback env if it exists
if (fs.existsSync(baseEnvPath)) {
  dotenv.config({ path: baseEnvPath });
}

// 4. Load the target environment file (e.g., env/.env.qa), overriding defaults
if (fs.existsSync(targetEnvPath)) {
  dotenv.config({ path: targetEnvPath, override: true });
} else {
  console.warn(`[Config] Warning: Environment file not found at ${targetEnvPath}. Using process defaults.`);
}

export interface AppConfig {
  env: Environment;
  baseUrl: string;
  browser: BrowserType;
  headless: boolean;
  device?: string;
  parallelWorkers: number;
  retryCount: number;
  defaultTimeout: number;
  slowMo: number;
}

const toBoolean = (val: string | undefined, fallback: boolean): boolean => {
  if (val === undefined) return fallback;
  return val.toLowerCase() === 'true';
};

const toNumber = (val: string | undefined, fallback: number): number => {
  if (val === undefined) return fallback;
  const parsed = parseInt(val, 10);
  return isNaN(parsed) ? fallback : parsed;
};

export const config: AppConfig = {
  env: activeEnv,
  baseUrl: process.env.BASE_URL || 'https://www.saucedemo.com',
  browser: (process.env.BROWSER as BrowserType) || 'chromium',
  headless: toBoolean(process.env.HEADLESS, true),
  device: process.env.DEVICE,
  parallelWorkers: toNumber(process.env.PARALLEL, 4),
  retryCount: toNumber(process.env.RETRY, 0),
  defaultTimeout: toNumber(process.env.TIMEOUT, 60000),
  slowMo: toNumber(process.env.SLOW_MO, 0),
};