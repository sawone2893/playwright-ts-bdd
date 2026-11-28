import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

const environments = ['dev', 'qa', 'staging', 'prod', 'local'] as const;
const browsers = ['chromium', 'firefox', 'webkit'] as const;

export type Environment = (typeof environments)[number];
export type BrowserType = (typeof browsers)[number];

const parseEnum = <T extends string>(
  name: string,
  value: string | undefined,
  allowedValues: readonly T[],
  fallback: T,
): T => {
  const normalized = value === undefined ? fallback : value.trim().toLowerCase();
  const match = allowedValues.find((allowedValue) => allowedValue === normalized);

  if (!match) {
    throw new Error(
      `Invalid configuration: ${name} must be one of ${allowedValues.join(', ')}; received "${value}".`,
    );
  }

  return match;
};

const activeEnv = parseEnum('ENV', process.env.ENV, environments, 'qa');
const envDirPath = path.resolve(process.cwd(), 'env');
const baseEnvPath = path.resolve(envDirPath, '.env');
const targetEnvPath = path.resolve(envDirPath, `.env.${activeEnv}`);

const readEnvFile = (filePath: string): Record<string, string> =>
  fs.existsSync(filePath) ? dotenv.parse(fs.readFileSync(filePath)) : {};

if (!fs.existsSync(targetEnvPath)) {
  console.warn(
    `[Config] Warning: Environment file not found at ${targetEnvPath}. Using available defaults.`,
  );
}

const fileEnvironment = {
  ...readEnvFile(baseEnvPath),
  ...readEnvFile(targetEnvPath),
};
delete fileEnvironment.ENV;

const processEnvironment = { ...process.env };
delete processEnvironment.ENV;

const values: NodeJS.ProcessEnv = {
  ...fileEnvironment,
  ...processEnvironment,
};

const getString = (name: string, fallback: string): string => {
  const value = values[name];
  if (value === undefined) return fallback;

  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error(`Invalid configuration: ${name} must not be empty.`);
  }

  return trimmed;
};

const getOptionalString = (name: string): string | undefined => {
  const value = values[name];
  if (value === undefined) return undefined;

  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error(`Invalid configuration: ${name} must not be empty.`);
  }

  return trimmed;
};

const getBoolean = (name: string, fallback: boolean): boolean => {
  const value = values[name];
  if (value === undefined) return fallback;

  switch (value.trim().toLowerCase()) {
    case 'true':
      return true;
    case 'false':
      return false;
    default:
      throw new Error(
        `Invalid configuration: ${name} must be "true" or "false"; received "${value}".`,
      );
  }
};

const getInteger = (name: string, fallback: number, minimum: number): number => {
  const value = values[name];
  if (value === undefined) return fallback;

  const normalized = value.trim();
  const parsed = Number(normalized);
  if (!normalized || !Number.isSafeInteger(parsed) || parsed < minimum) {
    throw new Error(
      `Invalid configuration: ${name} must be a whole number greater than or equal to ${minimum}; received "${value}".`,
    );
  }

  return parsed;
};

const getNonNegativeNumber = (name: string, fallback: number): number => {
  const value = values[name];
  if (value === undefined) return fallback;

  const normalized = value.trim();
  const parsed = Number(normalized);
  if (!normalized || !Number.isFinite(parsed) || parsed < 0) {
    throw new Error(
      `Invalid configuration: ${name} must be a non-negative number; received "${value}".`,
    );
  }

  return parsed;
};

export interface AppConfig {
  env: Environment;
  baseUrl: string;
  apiBaseUrl: string;
  apiTimeout: number;
  browser: BrowserType;
  headless: boolean;
  recordVideo: boolean;
  enableTracing: boolean;
  device?: string;
  parallelWorkers: number;
  retryCount: number;
  defaultTimeout: number;
  slowMo: number;
}

export const config: AppConfig = {
  env: activeEnv,
  baseUrl: getString('BASE_URL', 'https://www.saucedemo.com'),
  apiBaseUrl: getString('API_BASE_URL', 'https://jsonplaceholder.typicode.com'),
  apiTimeout: getInteger('API_TIMEOUT', 15000, 1),
  browser: parseEnum('BROWSER', values.BROWSER, browsers, 'chromium'),
  headless: getBoolean('HEADLESS', true),
  recordVideo: getBoolean('RECORD_VIDEO', false),
  enableTracing: getBoolean('ENABLE_TRACING', false),
  device: getOptionalString('DEVICE'),
  parallelWorkers: getInteger('PARALLEL', 4, 1),
  retryCount: getInteger('RETRY', 2, 0),
  defaultTimeout: getInteger('TIMEOUT', 60000, 1),
  slowMo: getNonNegativeNumber('SLOW_MO', 0),
};
