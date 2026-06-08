import type {
  GetAuthUserByIdQuery,
  GetAuthUserByIdQueryVariables,
  GetAuthUsersByFilterQuery,
  GetAuthUsersByFilterQueryVariables,
  GetUserByEmailQuery,
  GetUserByEmailQueryVariables,
  InsertOrganisationUserMutation,
  InsertOrganisationUserMutationVariables,
  InsertUserMutation,
  InsertUserMutationVariables,
  UpdateAuthUserMutation,
  UpdateAuthUserMutationVariables,
  UpdateOrganisationUserMutation,
  UpdateOrganisationUserMutationVariables,
  UpsertOrganisationMutation,
  UpsertOrganisationMutationVariables,
} from 'generated/graphql';
import { UserStatusEnum } from 'generated/graphql';
import { graphql, HttpResponse } from 'msw';
import type { HasuraUser } from 'src/scim/types';

// prettier-ignore
const mockUserData: HasuraUser[] = [
  { Id: '1', UserName: 'username1', Email: 'emile@gerlachsenger.uk', Status: UserStatusEnum.Active, FirstName: 'Caitlyn', LastName: 'Laney', CreatedOn: '2022-01-01', organisationusers: [{ OrgKey: 'org-key', RoleKey: 'RiskManager', External_Id: '123456789', LastSeen: '2022-01-01'}]},
  { Id: '2', UserName: 'username2', Email: 'test2@user.com', Status: UserStatusEnum.Active, FirstName: 'Test2', LastName: 'User2', CreatedOn: '2022-01-01', organisationusers: [{ OrgKey: 'org-key', RoleKey: 'RiskManager', External_Id: '222222222', LastSeen: '2022-01-01' }]},
  { Id: '3', UserName: 'username3', Email: 'test3@user.com', Status: UserStatusEnum.Active, FirstName: 'Test3', LastName: 'User3', CreatedOn: '2022-01-01', organisationusers: [{ OrgKey: 'org-key', RoleKey: 'RiskManager', External_Id: '333333333', LastSeen: '2022-01-01' }]},
  { Id: '4', UserName: 'username4', Email: 'test4@user.com', Status: UserStatusEnum.Active, FirstName: 'Test4', LastName: 'User4', CreatedOn: '2022-01-01', organisationusers: [{ OrgKey: 'org-key', RoleKey: 'RiskManager', External_Id: '444444444', LastSeen: '2022-01-01' }]},
  { Id: '5', UserName: 'username5', Email: 'test5@user.com', Status: UserStatusEnum.Archived, FirstName: 'Test5', LastName: 'User5', CreatedOn: '2022-01-01', organisationusers: [{ OrgKey: 'org-key', RoleKey: 'RiskManager', External_Id: '555555555', LastSeen: '2022-01-01' }]},
  { Id: '6', UserName: 'username6', Email: 'test6@user.com', Status: UserStatusEnum.Archived, FirstName: 'Test6', LastName: 'User6', CreatedOn: '2022-01-01', organisationusers: [{ OrgKey: 'org-key', RoleKey: 'RiskManager', External_Id: '666666666', LastSeen: '2022-01-01' }]},
]

export const handlers = [
  graphql.query<GetAuthUsersByFilterQuery, GetAuthUsersByFilterQueryVariables>(
    'GetAuthUsersByFilter',
    ({ variables }) => {
      const { where, limit, offset } = variables;
      let users: HasuraUser[] = [];

      // Return empty response
      if (
        where?._and &&
        where._and[0]._and &&
        where._and[0]._and[0].UserName?._ilike === 'username1' &&
        where._and[0]._and[1].Status?._eq === 'archived'
      ) {
        users = mockUserData.filter(
          (user) =>
            user.UserName === 'username1' &&
            user.Status === UserStatusEnum.Archived
        );
      }

      // Return response with multiple users
      else if (where?._and && where?._and[0].Status?._eq === 'active') {
        users = mockUserData.filter(
          (user) => user.Status === UserStatusEnum.Active
        );
      } else if (
        where?._and &&
        where._and[0]._or &&
        where._and[0]._or[0].UserName?._ilike === 'username1' &&
        where._and[0]._or[1].UserName?._ilike === 'username2'
      ) {
        users = mockUserData.filter(
          (user) =>
            user.UserName === 'username1' || user.UserName === 'username2'
        );
      }

      // Return response with 1 user
      else {
        users = mockUserData.filter((user) => user.UserName === 'username1');
      }

      // Total count
      const totalCount = users.length;

      // Pagination
      const startIndex = offset == null || offset < 0 ? 0 : offset;
      const count = limit != null ? (limit < 0 ? 0 : limit) : 200;
      if (startIndex > totalCount) {
        users = [];
      } else if (count === 0) {
        users = [];
      } else if (startIndex + count > totalCount) {
        users = users.slice(startIndex);
      } else {
        users = users.slice(startIndex, startIndex + count);
      }

      return HttpResponse.json({
        data: {
          auth_user: users,
          auth_user_aggregate: {
            aggregate: {
              count: totalCount,
            },
          },
        },
      });
    }
  ),
  graphql.query<GetAuthUserByIdQuery, GetAuthUserByIdQueryVariables>(
    'GetAuthUserById',
    ({ variables }) => {
      const { Id } = variables;

      const user: GetAuthUserByIdQuery['auth_user'][0] = {
        Id,
        UserName: 'testUser',
        Email: 'test@user.com',
        FirstName: null,
        LastName: null,
        CreatedOn: '2022-01-01',
        Status: UserStatusEnum.Active,
        AuthUser_Id: null,
        DisplayName: null,
        JobTitle: null,
        Department: null,
        OfficeLocation: null,
        organisationusers: [
          {
            OrgKey: 'org-key',
            RoleKey: null,
            External_Id: null,
            LastSeen: null,
          },
        ],
      };

      switch (Id) {
        case 'nonexistent-user-id':
        case 'auth0UserWithoutHasuraUser':
          return HttpResponse.json({
            data: {
              auth_user: [],
            },
          });
        case 'userNotInOrg':
          return HttpResponse.json({
            data: {
              auth_user: [
                {
                  ...user,
                  Id,
                  organisationusers: [],
                },
              ],
            },
          });
        case 'userWithInvalidDomain':
          return HttpResponse.json({
            data: {
              auth_user: [
                {
                  ...user,
                  Id,
                  Email: 'test@invaliddomain.com',
                },
              ],
            },
          });
        case '1':
        case 'existingUserId':
          return HttpResponse.json({
            data: {
              auth_user: [
                {
                  ...user,
                  Id,
                },
              ],
            },
          });
        case 'existingUserIdWithDifferentCasing':
          return HttpResponse.json({
            data: {
              auth_user: [
                {
                  ...user,
                  Id,
                  Email: 'test@UsEr.CoM',
                },
              ],
            },
          });
      }
    }
  ),
  graphql.query<GetUserByEmailQuery, GetUserByEmailQueryVariables>(
    'GetUserByEmail',
    ({ variables }) => {
      const { email } = variables;

      switch (email) {
        case 'existinguser-differentorg@test.com':
          return HttpResponse.json({
            data: {
              auth_user: [
                {
                  Id: 'existingUserId',
                  FirstName: 'User',
                  LastName: '1',
                  Email: email,
                  UserName: 'ExistingUser',
                  Status: UserStatusEnum.Active,
                  CreatedOn: '2024-05-09T06:49:01.185284+00:00',
                  LastSeen: null,
                  AuthUser_Id: null,
                  organisationusers: [
                    {
                      OrgKey: 'differentorg',
                      RoleKey: null,
                      External_Id: null,
                    },
                  ],
                },
              ],
            },
          });
        case 'existinguser-existingorg@test.com':
          return HttpResponse.json({
            data: {
              auth_user: [
                {
                  Id: 'existingUserId',
                  FirstName: 'User',
                  LastName: '1',
                  Email: email,
                  UserName: 'ExistingUser',
                  Status: UserStatusEnum.Active,
                  CreatedOn: '2024-05-09T06:49:01.185284+00:00',
                  LastSeen: null,
                  AuthUser_Id: null,
                  organisationusers: [
                    {
                      OrgKey: 'existing-org-key',
                      External_Id: null,
                      RoleKey: null,
                    },
                  ],
                },
              ],
            },
          });
        case 'nonexistinguser@test.com':
        default:
          return HttpResponse.json({
            data: {
              auth_user: [],
            },
          });
      }
    }
  ),
  graphql.mutation<UpdateAuthUserMutation, UpdateAuthUserMutationVariables>(
    'UpdateAuthUser',
    ({ variables }) => {
      const { User_Id, OrgKey } = variables;

      switch (User_Id) {
        case '1':
          return HttpResponse.json({
            data: {
              update_auth_user: {
                returning: [
                  {
                    Id: User_Id,
                    UserName: 'username1',
                    Email: 'emile@gerlachsenger.uk',
                    Status: UserStatusEnum.Active,
                    LastName: 'Laney',
                    CreatedOn: '2022-01-01',
                    organisationusers: [
                      {
                        OrgKey,
                        RoleKey: 'RiskManager',
                        External_Id: '123456789',
                        LastSeen: '2022-01-01',
                        Status: UserStatusEnum.Active,
                      },
                    ],
                  },
                ],
                affected_rows: 1,
              },
            },
          });
        case 'existingUserIdWithDifferentCasing':
          return HttpResponse.json({
            data: {
              update_auth_user: {
                returning: [
                  {
                    Id: User_Id,
                    UserName: 'username1',
                    Email: 'test@UsEr.CoM',
                    Status: UserStatusEnum.Active,
                    LastName: 'Laney',
                    CreatedOn: '2022-01-01',
                    organisationusers: [
                      {
                        OrgKey,
                        RoleKey: 'RiskManager',
                        External_Id: '123456789',
                        LastSeen: '2022-01-01',
                        Status: UserStatusEnum.Active,
                      },
                    ],
                  },
                ],
                affected_rows: 1,
              },
            },
          });
        case 'existingUserId':
          return HttpResponse.json({
            data: {
              update_auth_user: {
                returning: [
                  {
                    Id: 'existingUserId',
                    FirstName: 'User',
                    LastName: '1',
                    DisplayName: 'User 1',
                    Email: 'existinguser-differentorg@test.com',
                    UserName: 'user1',
                    Status: UserStatusEnum.Active,
                    CreatedOn: '2024-05-09T06:49:01.185284+00:00',
                    organisationusers: [
                      {
                        OrgKey: 'differentorg',
                        RoleKey: null,
                        External_Id: '123456789',
                        Status: UserStatusEnum.Active,
                      },
                      {
                        OrgKey: 'new-org-key',
                        RoleKey: null,
                        External_Id: '123456789',
                        Status: UserStatusEnum.Active,
                      },
                    ],
                  },
                ],
                affected_rows: 1,
              },
            },
          });
        case 'error-user-id':
          return HttpResponse.json({
            errors: [
              {
                message: 'Some hasura graphql error...',
                extensions: {
                  path: '$',
                  code: 'validation-failed',
                },
              },
            ],
          });
        default:
          return HttpResponse.json({
            data: {
              update_auth_user: {
                returning: [],
                affected_rows: 0,
              },
            },
          });
      }
    }
  ),
  graphql.mutation<
    UpsertOrganisationMutation,
    UpsertOrganisationMutationVariables
  >('UpsertOrganisation', ({ variables }) => {
    const { id } = variables;

    switch (id) {
      case 'new-org-key':
        return HttpResponse.json({
          data: {
            insert_auth_organisation_one: {
              OrgKey: id,
            },
          },
        });
      case 'error-org-key':
        return HttpResponse.json({
          errors: [
            {
              message: 'error',
            },
          ],
        });
      case 'existing-org-key':
      default:
        return HttpResponse.json({
          data: {
            insert_auth_organisation_one: null,
          },
        });
    }
  }),
  graphql.mutation<
    InsertOrganisationUserMutation,
    InsertOrganisationUserMutationVariables
  >('InsertOrganisationUser', ({ variables }) => {
    const { OrgKey } = variables;
    switch (OrgKey) {
      default:
        return HttpResponse.json({
          data: {
            insert_auth_organisationuser_one: {
              OrgKey,
            },
          },
        });
    }
  }),
  graphql.mutation<
    UpdateOrganisationUserMutation,
    UpdateOrganisationUserMutationVariables
  >('UpdateOrganisationUser', ({ variables }) => {
    const { User_Id, OrgKey, _set } = variables;
    const { External_Id, Status } = _set;

    return HttpResponse.json({
      data: {
        update_auth_organisationuser: {
          returning: [
            {
              OrgKey,
              User_Id,
              External_Id,
              Status,
            },
          ],
        },
      },
    });
  }),
  graphql.mutation<InsertUserMutation, InsertUserMutationVariables>(
    'InsertUser',
    ({ variables }) => {
      const {
        userId,
        firstName,
        lastName,
        userName,
        email,
        status,
        externalId,
        jobTitle,
        department,
        officeLocation,
        displayName,
      } = variables;

      return HttpResponse.json({
        data: {
          insert_auth_user_one: {
            Id: userId,
            FirstName: firstName,
            LastName: lastName,
            UserName: userName,
            Email: email,
            Status: status ?? UserStatusEnum.Active,
            CreatedOn: '2024-05-20T15:41:30.089358+00:00',
            AuthUser_Id: null,
            DisplayName: displayName,
            JobTitle: jobTitle,
            Department: department,
            OfficeLocation: officeLocation,
            organisationusers: [
              {
                RoleKey: null,
                External_Id: externalId,
                LastSeen: null,
                Status: status ?? UserStatusEnum.Active,
              },
            ],
          },
        },
      });
    }
  ),
  graphql.operation(({ query, variables }) => {
    // Catch all for unhandled requests
    console.warn({ query, variables });

    return HttpResponse.json({
      errors: [{ message: 'Request failed' }],
    });
  }),
];
