/**
 * Resolve the default deep link base URL for the current environment.
 * Precedence (lowest -> highest override):
 *  1. Derived from STAGE (prod => app.risksmart.link, staging => staging.risksmart.link, dev-cloud => dev-cloud.risksmart.link, other => localhost:3000)
 *  2. Explicit WEB_APP_BASE_URL / APP_BASE_URL env var (first one found)
 *  3. Explicit override passed in (function param) – mainly for tests.
 */
export interface ResolveBaseUrlOptions {
  /** Optional explicit override (mainly for tests) */
  override?: string;
}

const stripTrailingSlash = (v: string) => v.replace(/\/$/, '');

export const getDefaultDeepLinkBaseUrl = (
  opts: ResolveBaseUrlOptions = {}
): string => {
  if (opts.override) {
    return stripTrailingSlash(opts.override);
  }

  // Highest priority env vars
  const explicit =
    process.env.WEB_APP_BASE_URL || process.env.APP_BASE_URL || undefined;
  if (explicit) {
    return stripTrailingSlash(explicit);
  }

  const stage = process.env.STAGE || process.env.SST_STAGE || 'local';
  const map: Record<string, string> = {
    prod: 'https://app.risksmart.link',
    staging: 'https://staging.risksmart.link',
    'dev-cloud': 'https://dev-cloud.risksmart.link',
  };
  if (map[stage]) {
    return map[stage];
  }

  // Fallback to localhost for unknown / local stages
  return 'http://localhost:3000';
};

export default getDefaultDeepLinkBaseUrl;
