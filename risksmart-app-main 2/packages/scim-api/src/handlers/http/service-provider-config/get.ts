import { ApiHandler } from 'sst/node/api';

export const handler = ApiHandler(async () => {
  const serviceProviderConfig = {
    schemas: ['urn:ietf:params:scim:schemas:core:2.0:ServiceProviderConfig'],
    documentationUri:
      'https://risksmart.notion.site/RiskSmart-Enterprise-Auth-44b69c127767406c8fff20560e4b6cf5?pvs=74',
    patch: {
      supported: true,
    },
    bulk: {
      supported: false,
      maxOperations: 0,
      maxPayloadSize: 0,
    },
    filter: {
      supported: true,
      maxResults: 200,
    },
    changePassword: {
      supported: false,
    },
    sort: {
      supported: true,
    },
    etag: {
      supported: false,
    },
    authenticationSchemes: [
      {
        type: 'oauthbearertoken',
        name: 'OAuth Bearer Token',
        description:
          'Authentication scheme using the OAuth Bearer Token Standard',
        specUri: 'http://www.rfc-editor.org/info/rfc6750',
        documentationUri:
          'https://risksmart.notion.site/RiskSmart-Enterprise-Auth-44b69c127767406c8fff20560e4b6cf5?pvs=74',
        primary: true,
      },
    ],
    meta: {
      location: '/v2/ServiceProviderConfig',
      resourceType: 'ServiceProviderConfig',
      created: '2024-07-15T12:00:00.000Z',
      lastModified: '2024-07-15T12:00:00.000Z',
      version: '1.0.0',
    },
  };

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/scim+json',
    },
    body: JSON.stringify(serviceProviderConfig),
  };
});
