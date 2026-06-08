import type { Bundle } from 'zapier-platform-core';

export const getBaseUrl = (bundle: Bundle): string =>
  `${bundle.authData.api_base_url}/api/v1`;

export const getEntityUrl = (bundle: Bundle, entity: string): string =>
  `${getBaseUrl(bundle)}/${entity}`;
