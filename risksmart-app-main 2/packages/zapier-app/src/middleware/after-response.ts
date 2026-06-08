import type { HttpResponse, ZObject } from 'zapier-platform-core';

export const handleErrorResponse = (
  response: HttpResponse,
  z: ZObject
): HttpResponse => {
  if (response.status === 401) {
    throw new z.errors.RefreshAuthError(
      'Session expired. Zapier will re-authenticate automatically.'
    );
  }

  if (response.status === 403) {
    throw new z.errors.Error(
      'Your API client does not have permission for this resource. Check the scopes assigned to your API key in RiskSmart Settings > Integrations.',
      'Forbidden',
      403
    );
  }

  if (response.status === 429) {
    const retryAfter = String(response.headers?.['retry-after'] ?? '60');

    throw new z.errors.ThrottledError(
      `Rate limited. Retry after ${retryAfter}s.`,
      parseInt(retryAfter, 10) || 60
    );
  }

  return response;
};
