export interface ScenarioResources {
  api: boolean;
  browser: boolean;
}

export function getScenarioResources(tags: readonly string[]): ScenarioResources {
  const apiOnly = tags.includes('@api-only');

  return {
    api: apiOnly || tags.includes('@api'),
    browser: !apiOnly,
  };
}
