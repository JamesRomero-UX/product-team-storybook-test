import type { GetRolesQuery, GetRolesQueryVariables } from 'generated/graphql';
import { graphql, http, HttpResponse } from 'msw';
import { auth0Roles } from 'src/testing/test-data/roles';

const mockAuth0Domain = 'mocked-tenant.uk.auth0.com';

// Mock roles for the tRPC system
const mockTrpcRoles = [
  {
    RoleKey: 'permit-role-1',
    Name: 'Risk Viewer',
    Description: 'Can view risks',
  },
  {
    RoleKey: 'permit-role-2',
    Name: 'Risk Analyst',
    Description: 'Can analyze risks',
  },
  {
    RoleKey: 'permit-role-3',
    Name: 'Compliance Officer',
    Description: 'Can review compliance',
  },
  {
    RoleKey: 'permit-role-4',
    Name: 'Internal Audit',
    Description: 'Internal audit role',
  },
  {
    RoleKey: 'permit-role-5',
    Name: 'Technical Support',
    Description: 'Technical support role',
  },
];

export const mockHandlers = [
  // Auth0 roles endpoint
  http.get(`https://${mockAuth0Domain}/api/v2/roles`, () => {
    return HttpResponse.json(auth0Roles);
  }),

  // Auth0 token endpoint
  http.post(`https://${mockAuth0Domain}/oauth/token`, () => {
    return HttpResponse.json({
      access_token: 'fake_access_token',
      token_type: 'Bearer',
      expires_in: 86400,
    });
  }),

  // GraphQL handler for tRPC role system
  graphql.query<GetRolesQuery, GetRolesQueryVariables>('GetRoles', () => {
    return HttpResponse.json({
      data: {
        auth_role_type: mockTrpcRoles,
      },
    });
  }),
];
