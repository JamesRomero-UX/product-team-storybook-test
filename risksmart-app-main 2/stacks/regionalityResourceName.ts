export const getResourcePrefix = (stage: string): string => {
  const isRisksmartRegion = process.env.IS_RISKSMART_REGION === 'true';
  const base = stage === 'prod' ? 'app' : stage;
  const suffix = isRisksmartRegion ? 'app' : 'risksmartApp';
  const prefix = isRisksmartRegion ? (process.env.RESOURCE_PREFIX ?? '') : '';
  return `${prefix}${base}-${suffix}`;
}