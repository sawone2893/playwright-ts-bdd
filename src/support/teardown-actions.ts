export interface TeardownAction {
  operation: string;
  run: () => Promise<void>;
}

export async function runTeardownActions(actions: readonly TeardownAction[]): Promise<Error[]> {
  const failures: Error[] = [];

  for (const action of actions) {
    try {
      await action.run();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      failures.push(new Error(`${action.operation} failed: ${message}`));
      console.error(`[Hooks] ${action.operation} failed`, error);
    }
  }

  return failures;
}
