const sanitizeSegment = (value: string, maxLength: number): string => {
  const sanitized = value
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, maxLength);

  return sanitized || 'unnamed';
};

export function createArtifactName(
  featureUri: string,
  scenarioName: string,
  pickleId: string,
  testCaseStartedId: string,
): string {
  const featureUriWithoutQuery = featureUri.split(/[?#]/, 1)[0];
  const featureFileName = featureUriWithoutQuery.split(/[\\/]/).pop() ?? 'feature';
  const featureName = featureFileName.replace(/\.[^.]+$/, '');

  return [
    sanitizeSegment(featureName, 36),
    sanitizeSegment(scenarioName, 48),
    sanitizeSegment(pickleId, 36),
    sanitizeSegment(testCaseStartedId, 36),
  ].join('_');
}
