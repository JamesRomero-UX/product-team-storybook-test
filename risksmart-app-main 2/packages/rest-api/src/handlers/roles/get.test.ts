import type { APIGatewayProxyEventV2, Context } from 'aws-lambda';
import { getOrgModuleContext } from 'src/services/orgUtilities';
import { getUserById } from 'src/services/user/userService';
import { server } from 'src/testing/mocks/server';
import { stub } from 'src/testing/stub';
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { handler } from './get';
import { mockHandlers } from './get.mockHandlers';

vi.mock('src/services/orgUtilities');
vi.mock('src/services/user/userService');
vi.mock('sst/node/config', () => {
  return {
    Config: {
      AUTH0_CLIENT_SECRET: 'mock-auth0-client-secret',
    },
  };
});

const generateEvent = () => {
  return stub<APIGatewayProxyEventV2>({
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: '',
      input: {},
      session_variables: {
        'x-hasura-org-id': 'org-key',
        'x-hasura-tenant-name': 'MultiTenant',
        'x-hasura-user-id': 'test-user-id',
      },
    }),
  });
};

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterAll(() => server.close());

describe('GET /Roles', () => {
  server.use(...mockHandlers);

  describe('When tRPC feature flag is disabled (legacy Auth0 system)', () => {
    beforeEach(() => {
      vi.mocked(getOrgModuleContext).mockResolvedValue({
        features: ['attestations'],
        modules: {},
      });
      vi.mocked(getUserById).mockResolvedValue({
        Id: 'test-user-id',
        Email: 'test@example.com',
        IsCustomerSupport: false,
        Status: 'active',
        organisationusers: [],
      });
    });

    it('Should return 200 status code and the filtered roles', async () => {
      const response = await handler(generateEvent(), stub<Context>({}));
      const body = JSON.parse(response.body ?? '');

      expect(response.statusCode).toBe(200);
      expect(body).toStrictEqual([
        {
          id: 'rol_npTYrMrZNzRJ4x13',
          name: 'Public',
          description: 'Public Access Forms / Default',
        },
        {
          id: 'rol_PXDRdeouYaxNck5Q',
          name: 'ReadOnly',
          description: 'Full ReadOnly Access',
        },
        {
          id: 'rol_Nm0MYvAH5dpArHrH',
          name: 'RiskManager',
          description: 'Risk Manager / Admin',
        },
        {
          id: 'rol_tyYWnbJZQUu9XOoP',
          name: 'Standard',
          description: 'Permissions granted by being an owner or contributor',
        },
        {
          id: 'rol_nLEl5fuOSGNNgXmY',
          name: 'StandardEnhanced',
          description: 'Standard Enhanced',
        },
      ]);
    });

    it('Should return 200 status code and the filtered roles including IA if enabled', async () => {
      vi.mocked(getOrgModuleContext).mockResolvedValue({
        features: ['attestations', 'internal_audit', 'approvers'],
        modules: {},
      });

      const response = await handler(generateEvent(), stub<Context>({}));
      const body = JSON.parse(response.body ?? '');

      expect(response.statusCode).toBe(200);
      expect(body).toStrictEqual([
        {
          id: 'rol_npTYrMrZNzRJ4x13',
          name: 'Public',
          description: 'Public Access Forms / Default',
        },
        {
          id: 'rol_PXDRdeouYaxNck5Q',
          name: 'ReadOnly',
          description: 'Full ReadOnly Access',
        },
        {
          id: 'rol_Nm0MYvAH5dpArHrH',
          name: 'RiskManager',
          description: 'Risk Manager / Admin',
        },
        {
          id: 'rol_tyYWnbJZQUu9XOoP',
          name: 'Standard',
          description: 'Permissions granted by being an owner or contributor',
        },
        {
          id: 'rol_nLEl5fuOSGNNgXmY',
          name: 'StandardEnhanced',
          description: 'Standard Enhanced',
        },
        {
          id: 'rol_Ow4YwMCrBTTVz0Cs',
          name: 'InternalAudit',
          description: 'Internal Audit',
        },
      ]);
    });

    it('Should return 200 status code and the filtered roles including TechnicalSupport if enabled', async () => {
      vi.mocked(getOrgModuleContext).mockResolvedValue({
        features: ['attestations', 'authentication'],
        modules: {},
      });

      const response = await handler(generateEvent(), stub<Context>({}));
      const body = JSON.parse(response.body ?? '');

      expect(response.statusCode).toBe(200);
      expect(body).toStrictEqual([
        {
          id: 'rol_npTYrMrZNzRJ4x13',
          name: 'Public',
          description: 'Public Access Forms / Default',
        },
        {
          id: 'rol_PXDRdeouYaxNck5Q',
          name: 'ReadOnly',
          description: 'Full ReadOnly Access',
        },
        {
          id: 'rol_Nm0MYvAH5dpArHrH',
          name: 'RiskManager',
          description: 'Risk Manager / Admin',
        },
        {
          id: 'rol_tyYWnbJZQUu9XOoP',
          name: 'Standard',
          description: 'Permissions granted by being an owner or contributor',
        },
        {
          id: 'rol_nLEl5fuOSGNNgXmY',
          name: 'StandardEnhanced',
          description: 'Standard Enhanced',
        },
        {
          id: 'rol_E4Vgh1WFCj8sUZcL',
          name: 'TechnicalSupport',
          description: 'Technical Support',
        },
      ]);
    });
  });

  describe('When tRPC feature flag is enabled (new permit role system)', () => {
    beforeEach(() => {
      vi.mocked(getOrgModuleContext).mockResolvedValue({
        features: ['trpc'],
        modules: {},
      });
    });

    it('Should return 200 status code and all permit roles', async () => {
      const response = await handler(generateEvent(), stub<Context>({}));
      const body = JSON.parse(response.body ?? '');

      expect(response.statusCode).toBe(200);
      expect(body).toStrictEqual([
        {
          id: 'permit-role-1',
          name: 'Risk Viewer',
          description: 'Can view risks',
        },
        {
          id: 'permit-role-2',
          name: 'Risk Analyst',
          description: 'Can analyze risks',
        },
        {
          id: 'permit-role-3',
          name: 'Compliance Officer',
          description: 'Can review compliance',
        },
        {
          id: 'permit-role-4',
          name: 'Internal Audit',
          description: 'Internal audit role',
        },
        {
          id: 'permit-role-5',
          name: 'Technical Support',
          description: 'Technical support role',
        },
      ]);
    });
  });
});
