// Current API version, latest version of the API
export const CURRENT_API_VERSION = '2025-10-14' as const;

// current supported versions of the API.
export const SUPPORTED_API_VERSIONS = [
  '2025-10-14',
  '2025-10-10',
  '2025-09-01',
] as const;

export type SupportedApiVersion = (typeof SUPPORTED_API_VERSIONS)[number];
