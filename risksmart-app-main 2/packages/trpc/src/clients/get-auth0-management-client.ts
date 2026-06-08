import { ManagementClient } from 'auth0';

import { getEnv } from '../utils/environment';

export const getAuth0ManagementClient = () => {
  const domain = getEnv('AUTH0_DOMAIN');
  const stubUrl = process.env.AUTH0_STUB_URL;

  const options: ConstructorParameters<typeof ManagementClient>[0] = {
    domain,
    clientId: getEnv('AUTH0_MANAGEMENT_CLIENT_ID'),
    clientSecret: getEnv('AUTH0_CLIENT_SECRET'),
  };

  if (stubUrl) {
    // The underlying FernClient accepts `fetch` at runtime even though
    // ManagementClientOptions omits it from its TypeScript interface.
    // This rewrites Auth0 API URLs to the stub server for integration tests.
    (options as unknown as Record<string, unknown>).fetch = (
      url: string | URL | Request,
      init?: RequestInit
    ) => {
      const urlStr = url instanceof Request ? url.url : String(url);
      const rewritten = urlStr.replace(`https://${domain}`, stubUrl);

      return fetch(rewritten, init);
    };
  }

  return new ManagementClient(options);
};
