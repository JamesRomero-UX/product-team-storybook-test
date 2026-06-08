import type {
  DeleteOrganizationMemberRolesOperationRequest,
  DeleteOrganizationMemberRolesRequest,
  GetOrganizationMemberRoles200ResponseOneOfInner,
  PostMembersOperationRequest,
  PostMembersRequest,
  PostOrganizationMemberRolesOperationRequest,
  PostOrganizationMemberRolesRequest,
} from 'auth0';
import type {
  DeleteUserRolesByIdsMutation,
  DeleteUserRolesByIdsMutationVariables,
  GetUserByIdQuery,
  GetUserByIdQueryVariables,
  GetUserRolesQuery,
  GetUserRolesQueryVariables,
  InsertUserRolesMutation,
  InsertUserRolesMutationVariables,
  UpdateUserMutation,
  UpdateUserMutationVariables,
} from 'generated/graphql';
import { UserStatusEnum } from 'generated/graphql';
import { graphql, http, HttpResponse } from 'msw';
import { buildHasuraUser } from 'src/testing/test-data/hasuraUser';
import {
  auth0InternalAuditRole,
  auth0ReadOnlyRole,
  auth0Roles,
} from 'src/testing/test-data/roles';

const mockAuth0Domain = 'mocked-tenant.uk.auth0.com';

// prettier-ignore
const mockHasuraUserData: GetUserByIdQuery["auth_user_by_pk"][] = [
  buildHasuraUser({ Id: 'hasura-user-no-auth0', UserName: 'username1', Email: 'no-auth0@user.com', Status: UserStatusEnum.Active, FirstName: 'Test1', LastName: 'Test1', organisationusers: [{ OrgKey: 'org-key', RoleKey: 'RiskManager', External_Id: '111111111'}]}),
  buildHasuraUser({ Id: 'hasura-user-different-org', UserName: 'username2', Email: 'test2@user.com', Status: UserStatusEnum.Active, FirstName: 'Test2', LastName: 'User2', organisationusers: [{ OrgKey: 'other-org-key', RoleKey: 'RiskManager', External_Id: '222222222' }]}),
  buildHasuraUser({ Id: 'hasura-auth0-user', UserName: 'username3', Email: 'auth0@user.com', Status: UserStatusEnum.Active, FirstName: 'Test3', LastName: 'User3', organisationusers: [{ OrgKey: 'org-key', RoleKey: 'RiskManager', External_Id: '333333333' }]}),
  buildHasuraUser({ Id: 'hasura-auth0-user-different-org', UserName: 'username4', Email: 'auth0-different-org@user.com', Status: UserStatusEnum.Active, FirstName: 'Test4', LastName: 'User4', organisationusers: [{ OrgKey: 'org-key', RoleKey: 'RiskManager', External_Id: '444444444' }]}),
  buildHasuraUser({ Id: 'hasura-user-non-scim', UserName: 'username5', Email: 'test50@user.com', Status: UserStatusEnum.Active, FirstName: 'Test5', LastName: 'User5', organisationusers: [{ OrgKey: 'org-key', RoleKey: 'RiskManager'}]}),
  buildHasuraUser({ Id: 'hasura-user-non-scim-in-auth0', UserName: 'username5b', Email: 'non-scim-in-auth0@user.com', Status: UserStatusEnum.Active, FirstName: 'Test5b', LastName: 'User5b', organisationusers: [{ OrgKey: 'org-key', RoleKey: 'RiskManager'}]}),
  buildHasuraUser({ Id: 'hasura-user-no-email', UserName: 'username6', Status: UserStatusEnum.Active, FirstName: 'Test6', LastName: 'User6', organisationusers: [{ OrgKey: 'org-key', RoleKey: 'RiskManager'}]}),
  buildHasuraUser({ Id: 'hasura-auth0-user-no-existing-roles', UserName: 'username7', Email: 'auth0-no-roles@user.com', Status: UserStatusEnum.Active, FirstName: 'Test7', LastName: 'User7', organisationusers: [{ OrgKey: 'org-key', RoleKey: 'RiskManager', External_Id: '333333333' }]}),
  // New users for tRPC role system testing
  buildHasuraUser({ Id: 'hasura-user-with-trpc-roles', UserName: 'username8', Email: 'trpc-roles@user.com', Status: UserStatusEnum.Active, FirstName: 'Test8', LastName: 'User8', organisationusers: [{ OrgKey: 'org-key', RoleKey: 'RiskManager', External_Id: '888888888' }]}),
  buildHasuraUser({ Id: 'hasura-user-no-roles', UserName: 'username9', Email: 'no-roles@user.com', Status: UserStatusEnum.Active, FirstName: 'Test9', LastName: 'User9', organisationusers: [{ OrgKey: 'org-key', RoleKey: 'RiskManager', External_Id: '999999999' }]}),
]

// Mock roles for the tRPC system
const mockTrpcRoles = [
  {
    RoleKey: 'role-id-1',
    Name: 'Risk Viewer',
    Description: 'Can view risks',
  },
  {
    RoleKey: 'role-id-2',
    Name: 'Risk Analyst',
    Description: 'Can analyze risks',
  },
  {
    RoleKey: 'role-id-3',
    Name: 'Compliance Officer',
    Description: 'Can review compliance',
  },
  {
    RoleKey: 'Standard',
    Name: 'Standard User',
    Description: 'Standard User Description',
  },
];

// Mock user roles for the tRPC system
const mockUserRoles: Array<{
  Id: string;
  UserId: string;
  RoleKey: string;
  OrgKey: string;
  role_type: { RoleKey: string; Name: string; Description: string };
}> = [
  {
    Id: 'user-role-1',
    UserId: 'hasura-user-with-trpc-roles',
    RoleKey: 'role-id-1',
    OrgKey: 'org-key',
    role_type: mockTrpcRoles[0]!,
  },
];

// Mutable version for mock operations
let mockUserRolesStore = [...mockUserRoles];

// Helper function to reset mock state between tests
export const resetMockUserRoles = () => {
  mockUserRolesStore = [...mockUserRoles];
};

interface TestAuth0User {
  user_id: string;
  roles: GetOrganizationMemberRoles200ResponseOneOfInner[];
}

// prettier-ignore
const mockAuth0UserData: TestAuth0User[] = [
  { user_id: 'auth0|user-id', roles: [auth0ReadOnlyRole, auth0InternalAuditRole] },
  { user_id: 'auth0|user-id-no-existing-roles', roles: [] },
  { user_id: 'auth0|non-scim-user-in-auth0', roles: [auth0ReadOnlyRole] },
];

export const mockHandlers = [
  graphql.query<GetUserByIdQuery, GetUserByIdQueryVariables>(
    'GetUserById',
    ({ variables }) => {
      const { Id: userId } = variables;

      return HttpResponse.json({
        data: {
          auth_user_by_pk:
            mockHasuraUserData.find((user) => user!.Id === userId) ?? null,
        },
      });
    }
  ),
  graphql.query<GetUserRolesQuery, GetUserRolesQueryVariables>(
    'GetUserRoles',
    ({ variables }) => {
      const { userId, orgKey } = variables;
      const userRoles = mockUserRolesStore.filter(
        (ur) => ur.UserId === userId && ur.OrgKey === orgKey
      );

      return HttpResponse.json({
        data: {
          auth_user_role: userRoles,
        },
      });
    }
  ),
  graphql.mutation<
    DeleteUserRolesByIdsMutation,
    DeleteUserRolesByIdsMutationVariables
  >('DeleteUserRolesByIds', ({ variables }) => {
    const { ids } = variables;
    const initialLength = mockUserRolesStore.length;

    // Remove user roles with matching IDs (simulate the deletion)
    const remainingRoles = mockUserRolesStore.filter(
      (ur) => !ids.includes(ur.Id)
    );
    const deletedCount = initialLength - remainingRoles.length;

    // Update the store
    mockUserRolesStore = remainingRoles;

    return HttpResponse.json({
      data: {
        delete_auth_user_role: {
          affected_rows: deletedCount,
        },
      },
    });
  }),
  graphql.mutation<InsertUserRolesMutation, InsertUserRolesMutationVariables>(
    'InsertUserRoles',
    ({ variables }) => {
      const { objects } = variables;
      const objectsArray = Array.isArray(objects) ? objects : [objects];
      const newUserRoles = objectsArray.map((obj) => {
        const role = mockTrpcRoles.find((r) => r.RoleKey === obj.RoleKey);

        return {
          __typename: 'auth_user_role' as const,
          Id: obj.Id!,
          RoleKey: obj.RoleKey!,
          role_type: {
            __typename: 'auth_role_type' as const,
            RoleKey: role!.RoleKey,
            Name: role!.Name,
            Description: role!.Description,
          },
        };
      });

      // Add to mock storage for future queries (simulate insertion)
      const mockStorageItems = objectsArray.map((obj) => {
        const role = mockTrpcRoles.find((r) => r.RoleKey === obj.RoleKey);

        return {
          Id: obj.Id!,
          UserId: obj.UserId!,
          RoleKey: obj.RoleKey!,
          OrgKey: obj.OrgKey!,
          role_type: role!,
        };
      });
      mockUserRolesStore.push(...mockStorageItems);

      return HttpResponse.json({
        data: {
          insert_auth_user_role: {
            affected_rows: newUserRoles.length,
            returning: newUserRoles,
          },
        },
      });
    }
  ),
  graphql.mutation<UpdateUserMutation, UpdateUserMutationVariables>(
    'UpdateUser',
    ({ variables }) => {
      const { Id, OrgKey, RoleKey } = variables;

      return HttpResponse.json({
        data: {
          update_auth_user_by_pk: {
            Id,
            RoleKey,
          },
          update_auth_organisationuser_by_pk: {
            OrgKey,
            RoleKey,
          },
        },
      });
    }
  ),
  http.get(
    `https://${mockAuth0Domain}/api/v2/users-by-email`,
    ({ request }) => {
      const url = new URL(request.url);
      const email = url.searchParams.get('email');

      switch (email) {
        case 'no-auth0@user.com':
          return HttpResponse.json([]);
        case 'auth0@user.com':
          return HttpResponse.json([
            {
              created_at: '2024-10-28T20:03:49.337Z',
              email,
              email_verified: false,
              identities: [],
              name: 'auth0 user',
              nickname: 'auth0 user',
              updated_at: '2024-10-28T20:03:49.337Z',
              user_id: 'auth0|user-id',
            },
          ]);
        case 'auth0-different-org@user.com':
          return HttpResponse.json([
            {
              created_at: '2024-10-28T20:03:49.337Z',
              email,
              email_verified: false,
              identities: [],
              name: 'auth0 user',
              nickname: 'auth0 user',
              updated_at: '2024-10-28T20:03:49.337Z',
              user_id: 'auth0|user-id-different-org',
            },
          ]);
        case 'auth0-no-roles@user.com':
          return HttpResponse.json([
            {
              created_at: '2024-10-28T20:03:49.337Z',
              email,
              email_verified: false,
              identities: [],
              name: 'auth0 user',
              nickname: 'auth0 user',
              updated_at: '2024-10-28T20:03:49.337Z',
              user_id: 'auth0|user-id-no-existing-roles',
            },
          ]);
        case 'test50@user.com':
          // Non-SCIM user - not found in Auth0
          return HttpResponse.json([]);
        case 'non-scim-in-auth0@user.com':
          // Non-SCIM user who exists in Auth0 (edge case)
          return HttpResponse.json([
            {
              created_at: '2024-10-28T20:03:49.337Z',
              email,
              email_verified: false,
              identities: [],
              name: 'Non-SCIM Auth0 User',
              nickname: 'Non-SCIM Auth0 User',
              updated_at: '2024-10-28T20:03:49.337Z',
              user_id: 'auth0|non-scim-user-in-auth0',
            },
          ]);
        default:
          return HttpResponse.json([]);
      }
    }
  ),
  http.get(
    `https://${mockAuth0Domain}/api/v2/organizations/:id/members/:user_id/roles`,
    ({ params }) => {
      const { user_id } = params;

      const user = mockAuth0UserData.find((user) => user.user_id === user_id);
      if (user) {
        return HttpResponse.json(user.roles);
      }

      return HttpResponse.json(
        {
          statusCode: 404,
          error: 'Not Found',
          message: 'User is not a member of this organization',
        },
        { status: 404 }
      );
    }
  ),
  http.post<
    PostOrganizationMemberRolesOperationRequest,
    PostOrganizationMemberRolesRequest
  >(
    `https://${mockAuth0Domain}/api/v2/organizations/:id/members/:user_id/roles`,
    async ({ params, request }) => {
      const { user_id } = params;
      const { roles } = await request.json();

      const auth0User = mockAuth0UserData.find(
        (user) => user.user_id === user_id
      );
      const newRoles = auth0Roles.filter((role) => roles.includes(role.id));
      if (auth0User) {
        auth0User.roles = auth0User.roles.concat(newRoles);

        return new HttpResponse(null, { status: 204 });
      }

      return HttpResponse.json(
        {
          statusCode: 404,
          error: 'Not Found',
          message: 'The user does not exist.',
          errorCode: 'inexistent_user',
        },
        { status: 404 }
      );
    }
  ),
  http.delete<
    DeleteOrganizationMemberRolesOperationRequest,
    DeleteOrganizationMemberRolesRequest
  >(
    `https://${mockAuth0Domain}/api/v2/organizations/:id/members/:user_id/roles`,
    async ({ params, request }) => {
      const { user_id } = params;
      const { roles } = await request.json();

      const auth0User = mockAuth0UserData.find(
        (user) => user.user_id === user_id
      );
      const rolesToRemove = auth0Roles.filter((role) =>
        roles.includes(role.id)
      );
      if (auth0User) {
        auth0User.roles = auth0User.roles.filter(
          (role) => !rolesToRemove.includes(role)
        );

        return new HttpResponse(null, { status: 204 });
      }

      return HttpResponse.json(
        {
          statusCode: 404,
          error: 'Not Found',
          message: 'The user does not exist.',
          errorCode: 'inexistent_user',
        },
        { status: 404 }
      );
    }
  ),
  http.post<PostMembersOperationRequest, PostMembersRequest>(
    `https://${mockAuth0Domain}/api/v2/organizations/:id/members`,
    async ({ request }) => {
      const { members } = await request.json();
      mockAuth0UserData.push(
        ...members.map((member) => ({ user_id: member, roles: [] }))
      );

      return new HttpResponse(null, { status: 204 });
    }
  ),
];
