import type { APIGatewayProxyEventV2, Context } from 'aws-lambda';
import { getOrgFeatures } from 'src/services/orgUtilities';
import { server } from 'src/testing/mocks/server';
import { stub } from 'src/testing/stub';
import { auth0RiskManagerRole } from 'src/testing/test-data/roles';
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { handler } from './patch';
import { mockHandlers, resetMockUserRoles } from './patch.mockHandlers';
import type { PatchSchema } from './schema';

vi.mock('sst/node/config', () => {
  return {
    Config: {
      AUTH0_CLIENT_SECRET: 'mock-auth0-client-secret',
    },
  };
});

vi.mock('src/services/orgUtilities');

const generateEvent = (requestBody: PatchSchema) => {
  return stub<APIGatewayProxyEventV2>({
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: '',
      input: requestBody,
      session_variables: {
        'x-hasura-org-id': 'org-key',
        'x-hasura-tenant-name': 'MultiTenant',
      },
    }),
  });
};

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterAll(() => server.close());

describe('PATCH /User', () => {
  server.use(...mockHandlers);

  beforeEach(() => {
    resetMockUserRoles();
  });

  describe('When tRPC feature flag is disabled (legacy Auth0 system)', () => {
    beforeEach(() => {
      vi.mocked(getOrgFeatures).mockResolvedValue([]);
    });

    describe('Given a valid request', () => {
      describe('When the user does not exist in hasura', () => {
        it('should return status 404', async () => {
          const requestBody: PatchSchema = {
            userId: 'non-existent-user',
            roleIds: ['rol_tyYWnbJZQUu9XOoP'],
          };
          const result = await handler(
            generateEvent(requestBody),
            stub<Context>({})
          );
          const responseBody = JSON.parse(result.body ?? '');

          expect(result.statusCode).toBe(404);
          expect(responseBody).toMatchObject({
            message: 'User not found',
          });
        });
      });

      describe('When the user exists in hasura', () => {
        describe('And the user does not have an email address', () => {
          it('should return status 400 and a message indicating that the user does not have an email address', async () => {
            const requestBody: PatchSchema = {
              userId: 'hasura-user-no-email',
              roleIds: ['rol_tyYWnbJZQUu9XOoP'],
            };
            const result = await handler(
              generateEvent(requestBody),
              stub<Context>({})
            );
            const responseBody = JSON.parse(result.body ?? '');

            expect(result.statusCode).toBe(400);
            expect(responseBody).toMatchObject({
              message: 'Cannot change role for user without an email address',
            });
          });
        });

        describe('And the user is not part of the organization in hasura', () => {
          it('should return status 400 and a message indicating that the user is not part of the organization', async () => {
            const requestBody: PatchSchema = {
              userId: 'hasura-user-different-org',
              roleIds: ['rol_tyYWnbJZQUu9XOoP'],
            };
            const result = await handler(
              generateEvent(requestBody),
              stub<Context>({})
            );
            const responseBody = JSON.parse(result.body ?? '');

            expect(result.statusCode).toBe(400);
            expect(responseBody).toMatchObject({
              message: 'Cannot change roles for user outside your organisation',
            });
          });
        });

        describe('And the user is part of the organization in hasura', () => {
          describe('And the user is not found in auth0', () => {
            it('should update the users role in hasura & return status 200', async () => {
              const requestBody: PatchSchema = {
                userId: 'hasura-user-no-auth0',
                roleIds: ['rol_tyYWnbJZQUu9XOoP'],
              };
              const result = await handler(
                generateEvent(requestBody),
                stub<Context>({})
              );
              const responseBody = JSON.parse(result.body ?? '');

              expect(result.statusCode).toBe(200);
              expect(responseBody).toMatchObject({
                roles: [
                  {
                    id: 'rol_tyYWnbJZQUu9XOoP',
                    name: 'Standard',
                    description:
                      'Permissions granted by being an owner or contributor',
                  },
                ],
              });
            });
          });

          describe('And the user has no external ID (non-SCIM)', () => {
            describe('And the non-SCIM user is not found in auth0', () => {
              it('should update the users role in hasura & return status 200', async () => {
                const requestBody: PatchSchema = {
                  userId: 'hasura-user-non-scim',
                  roleIds: ['rol_tyYWnbJZQUu9XOoP'],
                };
                const result = await handler(
                  generateEvent(requestBody),
                  stub<Context>({})
                );
                const responseBody = JSON.parse(result.body ?? '');

                expect(result.statusCode).toBe(200);
                expect(responseBody).toMatchObject({
                  roles: [
                    {
                      id: 'rol_tyYWnbJZQUu9XOoP',
                      name: 'Standard',
                      description:
                        'Permissions granted by being an owner or contributor',
                    },
                  ],
                });
              });
            });

            describe('And the non-SCIM user exists in auth0', () => {
              it('should update both auth0 and hasura roles & return status 200', async () => {
                const requestBody: PatchSchema = {
                  userId: 'hasura-user-non-scim-in-auth0',
                  roleIds: [auth0RiskManagerRole.id],
                };
                const result = await handler(
                  generateEvent(requestBody),
                  stub<Context>({})
                );
                const responseBody = JSON.parse(result.body ?? '');

                expect(result.statusCode).toBe(200);
                expect(responseBody).toMatchObject({
                  roles: [auth0RiskManagerRole],
                });
              });
            });
          });
        });

        describe('And the user is found in auth0', () => {
          describe('And the user is part of the organization in auth0', () => {
            describe('And the user has existing roles in auth0', () => {
              it('should update the users roles & return status 200', async () => {
                const requestBody: PatchSchema = {
                  userId: 'hasura-auth0-user',
                  roleIds: [auth0RiskManagerRole.id],
                };
                const result = await handler(
                  generateEvent(requestBody),
                  stub<Context>({})
                );
                const responseBody = JSON.parse(result.body ?? '');

                expect(result.statusCode).toBe(200);
                expect(responseBody).toMatchObject({
                  roles: [auth0RiskManagerRole],
                });
              });
            });

            describe('And the user does not have existing roles in auth0', () => {
              it('should update the users roles & return status 200', async () => {
                const requestBody: PatchSchema = {
                  userId: 'hasura-auth0-user-no-existing-roles',
                  roleIds: [auth0RiskManagerRole.id],
                };
                const result = await handler(
                  generateEvent(requestBody),
                  stub<Context>({})
                );
                const responseBody = JSON.parse(result.body ?? '');

                expect(result.statusCode).toBe(200);
                expect(responseBody).toMatchObject({
                  roles: [auth0RiskManagerRole],
                });
              });
            });
          });

          describe('And the user is not part of the organization in auth0', () => {
            it('should add the user to the org in auth0, update the users role & return status 200', async () => {
              const requestBody: PatchSchema = {
                userId: 'hasura-auth0-user-different-org',
                roleIds: [auth0RiskManagerRole.id],
              };
              const result = await handler(
                generateEvent(requestBody),
                stub<Context>({})
              );
              const responseBody = JSON.parse(result.body ?? '');

              expect(result.statusCode).toBe(200);
              expect(responseBody).toMatchObject({
                roles: [auth0RiskManagerRole],
              });
            });
          });
        });
      });
    });
  });
});

describe('When tRPC feature flag is enabled (new permit role system)', () => {
  beforeEach(() => {
    vi.mocked(getOrgFeatures).mockResolvedValue(['trpc']);
  });

  describe('Given a valid request', () => {
    describe('When the user does not exist in hasura', () => {
      it('should return status 404', async () => {
        const requestBody: PatchSchema = {
          userId: 'non-existent-user',
          roleIds: ['role-id-1'],
        };
        const result = await handler(
          generateEvent(requestBody),
          stub<Context>({})
        );
        const responseBody = JSON.parse(result.body ?? '');

        expect(result.statusCode).toBe(404);
        expect(responseBody).toMatchObject({
          message: 'User not found',
        });
      });
    });

    describe('When the user exists in hasura', () => {
      describe('And the user is not part of the organization in hasura', () => {
        it('should return status 400 and a message indicating that the user is not part of the organization', async () => {
          const requestBody: PatchSchema = {
            userId: 'hasura-user-different-org',
            roleIds: ['role-id-1'],
          };
          const result = await handler(
            generateEvent(requestBody),
            stub<Context>({})
          );
          const responseBody = JSON.parse(result.body ?? '');

          expect(result.statusCode).toBe(400);
          expect(responseBody).toMatchObject({
            message: 'Cannot change roles for user outside your organisation',
          });
        });
      });

      describe('And the user is part of the organization in hasura', () => {
        describe('And the user is not SCIM enabled', () => {
          describe('And the non-SCIM user is not in auth0', () => {
            it('should successfully change roles for non-SCIM user (no SCIM restriction)', async () => {
              const requestBody: PatchSchema = {
                userId: 'hasura-user-non-scim',
                roleIds: ['role-id-1', 'Standard'],
              };
              const result = await handler(
                generateEvent(requestBody),
                stub<Context>({})
              );
              const responseBody = JSON.parse(result.body ?? '');

              expect(result.statusCode).toBe(200);
              expect(responseBody).toMatchObject({
                roles: [
                  {
                    id: 'role-id-1',
                    name: 'Risk Viewer',
                    description: 'Can view risks',
                  },
                  {
                    description: 'Standard User Description',
                    id: 'Standard',
                    name: 'Standard User',
                  },
                ],
              });
            });
          });

          describe('And the non-SCIM user exists in auth0', () => {
            it('should successfully change roles for non-SCIM user in auth0 (no SCIM restriction)', async () => {
              const requestBody: PatchSchema = {
                userId: 'hasura-user-non-scim-in-auth0',
                roleIds: ['role-id-1', 'Standard'],
              };
              const result = await handler(
                generateEvent(requestBody),
                stub<Context>({})
              );
              const responseBody = JSON.parse(result.body ?? '');

              expect(result.statusCode).toBe(200);
              expect(responseBody).toMatchObject({
                roles: [
                  {
                    id: 'role-id-1',
                    name: 'Risk Viewer',
                    description: 'Can view risks',
                  },
                  {
                    description: 'Standard User Description',
                    id: 'Standard',
                    name: 'Standard User',
                  },
                ],
              });
            });
          });
        });

        describe('And the user has existing roles', () => {
          it('should update user roles by adding new ones and removing old ones', async () => {
            const requestBody: PatchSchema = {
              userId: 'hasura-user-with-trpc-roles',
              roleIds: ['role-id-2', 'role-id-3', 'Standard'], // New set of roles
            };
            const result = await handler(
              generateEvent(requestBody),
              stub<Context>({})
            );
            const responseBody = JSON.parse(result.body ?? '');

            expect(result.statusCode).toBe(200);
            expect(responseBody).toMatchObject({
              roles: [
                {
                  id: 'role-id-2',
                  name: 'Risk Analyst',
                  description: 'Can analyze risks',
                },
                {
                  id: 'role-id-3',
                  name: 'Compliance Officer',
                  description: 'Can review compliance',
                },
                {
                  description: 'Standard User Description',
                  id: 'Standard',
                  name: 'Standard User',
                },
              ],
            });
          });
        });

        describe('And the user has no existing roles', () => {
          it('should add new roles to the user', async () => {
            const requestBody: PatchSchema = {
              userId: 'hasura-user-no-roles',
              roleIds: ['role-id-1'],
            };
            const result = await handler(
              generateEvent(requestBody),
              stub<Context>({})
            );
            const responseBody = JSON.parse(result.body ?? '');

            expect(result.statusCode).toBe(200);
            expect(responseBody).toMatchObject({
              roles: [
                {
                  id: 'role-id-1',
                  name: 'Risk Viewer',
                  description: 'Can view risks',
                },
              ],
            });
          });
        });

        describe('And removing all roles from user', () => {
          it('should remove all existing roles', async () => {
            const requestBody: PatchSchema = {
              userId: 'hasura-user-with-trpc-roles',
              roleIds: [], // Remove all roles
            };
            const result = await handler(
              generateEvent(requestBody),
              stub<Context>({})
            );
            const responseBody = JSON.parse(result.body ?? '');

            expect(result.statusCode).toBe(200);
            expect(responseBody).toMatchObject({
              roles: [],
            });
          });
        });
      });
    });
  });
});

describe('Given an invalid request', () => {
  it('should return status 400', async () => {
    const result = await handler(
      stub<APIGatewayProxyEventV2>({}),
      stub<Context>({})
    );
    expect(result).toMatchObject({
      statusCode: 400,
    });
  });
});
