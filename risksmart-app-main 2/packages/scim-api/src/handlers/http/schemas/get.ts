import { ApiHandler } from 'sst/node/api';

export const handler = ApiHandler(async () => {
  const schemaResponse = {
    schemas: ['urn:ietf:params:scim:api:messages:2.0:ListResponse'],
    itemsPerPage: 50,
    startIndex: 1,
    totalResults: 2,
    Resources: [
      {
        schemas: ['urn:ietf:params:scim:schemas:core:2.0:Schema'],
        id: 'urn:ietf:params:scim:schemas:core:2.0:User',
        name: 'User',
        description: 'User Account',
        attributes: [
          {
            name: 'userName',
            type: 'string',
            multiValued: false,
            description:
              "Unique identifier for the User. This should be set to the same value as the user's email address and is required.",
            required: true,
            caseExact: false,
            mutability: 'readWrite',
            returned: 'default',
            uniqueness: 'server',
          },
          {
            name: 'name',
            type: 'complex',
            multiValued: false,
            description: "The components of the user's real name.",
            required: false,
            subAttributes: [
              {
                name: 'givenName',
                type: 'string',
                multiValued: false,
                description: 'The given name of the User, or first name.',
                required: false,
                caseExact: false,
                mutability: 'readWrite',
                returned: 'default',
                uniqueness: 'none',
              },
              {
                name: 'familyName',
                type: 'string',
                multiValued: false,
                description: 'The family name of the User, or last name.',
                required: false,
                caseExact: false,
                mutability: 'readWrite',
                returned: 'default',
                uniqueness: 'none',
              },
              {
                name: 'formatted',
                type: 'string',
                multiValued: false,
                description: 'The full name, formatted for display.',
                required: false,
                caseExact: false,
                mutability: 'readWrite',
                returned: 'default',
                uniqueness: 'none',
              },
            ],
            mutability: 'readWrite',
            returned: 'default',
            uniqueness: 'none',
          },
          {
            name: 'emails',
            type: 'complex',
            multiValued: true,
            description:
              'Email addresses for the user. The email value is required and serves as the main identifier for users in the system.',
            required: true,
            subAttributes: [
              {
                name: 'value',
                type: 'string',
                multiValued: false,
                description:
                  'Email address for the User. This is required and serves as the main unique identifier for users in the system.',
                required: true,
                caseExact: false,
                mutability: 'readWrite',
                returned: 'default',
                uniqueness: 'server',
              },
              {
                name: 'type',
                type: 'string',
                multiValued: false,
                description:
                  'A label indicating the attribute\'s function. Supported value: "work".',
                required: false,
                caseExact: false,
                mutability: 'readWrite',
                returned: 'default',
                uniqueness: 'none',
                canonicalValues: ['work'],
              },
            ],
            mutability: 'readWrite',
            returned: 'default',
            uniqueness: 'none',
          },
          {
            name: 'active',
            type: 'boolean',
            multiValued: false,
            description:
              "A Boolean value indicating the User's administrative status in the source identity platform. When false user will be archived in the target platform.",
            required: false,
            mutability: 'readWrite',
            returned: 'default',
            uniqueness: 'none',
          },
          {
            name: 'title',
            type: 'string',
            multiValued: false,
            description: 'The user\'s job title, such as "Vice President".',
            required: false,
            caseExact: false,
            mutability: 'readWrite',
            returned: 'default',
            uniqueness: 'none',
          },
          {
            name: 'addresses',
            type: 'complex',
            multiValued: true,
            description: 'A physical mailing address for this User.',
            required: false,
            subAttributes: [
              {
                name: 'formatted',
                type: 'string',
                multiValued: false,
                description:
                  "The full address, formatted for display or use with a mailing label. Could be the user's city, country or office name for example.",
                required: false,
                caseExact: false,
                mutability: 'readWrite',
                returned: 'default',
                uniqueness: 'none',
              },
              {
                name: 'type',
                type: 'string',
                multiValued: false,
                description:
                  'A label indicating the attribute\'s function. Supported value: "work".',
                required: false,
                caseExact: false,
                mutability: 'readWrite',
                returned: 'default',
                uniqueness: 'none',
                canonicalValues: ['work'],
              },
            ],
            mutability: 'readWrite',
            returned: 'default',
            uniqueness: 'none',
          },
          {
            name: 'externalId',
            type: 'string',
            multiValued: false,
            description:
              'A String that is a unique identifier for the resource as defined by the provisioning client (e.g., Entra objectId GUID).',
            required: true,
            caseExact: true,
            mutability: 'readWrite',
            returned: 'default',
            uniqueness: 'none',
          },
        ],
        meta: {
          resourceType: 'Schema',
          location: '/v2/Schemas/urn:ietf:params:scim:schemas:core:2.0:User',
        },
      },
      {
        schemas: ['urn:ietf:params:scim:schemas:core:2.0:Schema'],
        id: 'urn:ietf:params:scim:schemas:extension:enterprise:2.0:User',
        name: 'EnterpriseUser',
        description: 'Enterprise User Extension',
        attributes: [
          {
            name: 'department',
            type: 'string',
            multiValued: false,
            description:
              'Identifies the name of a department within the organization.',
            required: false,
            caseExact: false,
            mutability: 'readWrite',
            returned: 'default',
            uniqueness: 'none',
          },
        ],
        meta: {
          resourceType: 'Schema',
          location:
            '/v2/Schemas/urn:ietf:params:scim:schemas:extension:enterprise:2.0:User',
        },
      },
    ],
  };

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/scim+json',
    },
    body: JSON.stringify(schemaResponse),
  };
});
