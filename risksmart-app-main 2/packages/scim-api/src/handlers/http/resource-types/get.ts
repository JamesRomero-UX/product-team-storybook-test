import { ApiHandler } from 'sst/node/api';

export const handler = ApiHandler(async () => {
  try {
    const resourceTypes = [
      {
        schemas: ['urn:ietf:params:scim:schemas:core:2.0:ResourceType'],
        id: 'User',
        name: 'User',
        endpoint: '/Users',
        description: 'User Account',
        schema: 'urn:ietf:params:scim:schemas:core:2.0:User',
        schemaExtensions: [
          {
            schema:
              'urn:ietf:params:scim:schemas:extension:enterprise:2.0:User',
            required: false,
          },
        ],
        meta: {
          location: `/v2/ResourceTypes/User`,
          resourceType: 'ResourceType',
        },
      },
    ];

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/scim+json',
      },
      body: JSON.stringify(resourceTypes),
    };
  } catch (error) {
    console.error('ResourceTypes endpoint error:', error);

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/scim+json',
      },
      body: JSON.stringify({
        schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
        status: '500',
        detail: 'Internal server error',
      }),
    };
  }
});
