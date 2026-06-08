import { ParameterNotFound } from '@aws-sdk/client-ssm';
import type { Context, EventBridgeEvent } from 'aws-lambda';
import type { DataChangeEvent, EventDetail } from 'src/DataChangeEvent';
import type { AuthOrganisation } from 'src/types/AuthOrganisation';
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { handler } from './onScimEnabled';

const { mockSsmSend } = vi.hoisted(() => ({
  mockSsmSend: vi.fn(),
}));
vi.mock('src/utils/ssm-client', () => ({
  ssmClient: { send: mockSsmSend },
}));

const mockTenant = 'test-tenant';
const mockOrgKey = 'test-org';
const stage = process.env.SST_STAGE ?? 'test-stage';

vi.mock('crypto', () => ({
  randomBytes: () => ({
    toString: () => 'mock-secret',
  }),
}));

const mockOrg: AuthOrganisation = {
  Name: 'Test Org',
  ScimEnabled: false,
};

const createMockEvent = (
  op: 'INSERT' | 'UPDATE' | 'DELETE',
  scimEnabledNew: boolean,
  scimEnabledOld?: boolean
): EventBridgeEvent<
  string,
  DataChangeEvent<AuthOrganisation, 'auth_organisation'>
> => ({
  id: '1',
  version: '1',
  account: '123456789012',
  time: new Date().toISOString(),
  region: 'eu-west-2',
  resources: [],
  source: 'risksmart.dataEvent',
  'detail-type': 'DataChanged',
  detail: {
    created_at: '2021-01-01T00:00:00Z',
    delivery_info: { max_retries: 3, current_retry: 0 },
    id: '1',
    table: { schema: 'auth', name: 'auth_organisation' },
    trigger: { name: 'organisation' },
    meta: { tenant: mockTenant },
    event: {
      op,
      session_variables: {
        'x-hasura-tenant-name': mockTenant,
        'x-hasura-org-id': mockOrgKey,
      },
      trace_context: null,
      data: {
        new:
          op !== 'DELETE' ? { ...mockOrg, ScimEnabled: scimEnabledNew } : null,
        old:
          scimEnabledOld !== undefined
            ? { ...mockOrg, ScimEnabled: scimEnabledOld }
            : null,
      },
    } as EventDetail<AuthOrganisation>,
  },
});

describe('onScimEnabled Token Secret Generation Lambda', () => {
  beforeAll(() => {
    vi.stubEnv('SST_STAGE', stage);
  });

  beforeEach(() => {
    // Default SSM mock: getParameter returns v1, putParameter succeeds
    mockSsmSend.mockImplementation((command: unknown) => {
      const name = (command as { constructor: { name: string } }).constructor
        .name;
      if (name === 'GetParameterCommand') {
        const input = (command as { input: { Name?: string } }).input;
        if (input.Name?.includes('active-version')) {
          return Promise.resolve({ Parameter: { Value: 'v1' } });
        }

        // Simulate ParameterNotFound for other params
        throw new ParameterNotFound({
          $metadata: {},
          message: 'Parameter not found',
        });
      }
      if (name === 'PutParameterCommand') {
        return Promise.resolve({});
      }

      return Promise.resolve({});
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should generate a new SCIM token secret version when SCIM is enabled and previous version exists', async () => {
    const putParameterCalls: unknown[] = [];
    mockSsmSend.mockImplementation((command: unknown) => {
      const name = (command as { constructor: { name: string } }).constructor
        .name;
      if (name === 'GetParameterCommand') {
        const input = (command as { input: { Name?: string } }).input;
        if (input.Name?.includes('active-version')) {
          return Promise.resolve({ Parameter: { Value: 'v1' } });
        }

        throw new ParameterNotFound({
          $metadata: {},
          message: 'Parameter not found',
        });
      }
      if (name === 'PutParameterCommand') {
        putParameterCalls.push((command as { input: unknown }).input);

        return Promise.resolve({});
      }

      return Promise.resolve({});
    });

    const event = createMockEvent('UPDATE', true, false);
    await handler(event, {} as Context, vi.fn());

    const expectedVersion = 'v2';

    expect(putParameterCalls[0]).toEqual(
      expect.objectContaining({
        Name: `/${stage}/scim-api/token-secret/${mockTenant}/${mockOrgKey}/${expectedVersion}`,
        Value: 'mock-secret',
        Type: 'SecureString',
        Overwrite: false,
      })
    );

    expect(putParameterCalls[1]).toEqual(
      expect.objectContaining({
        Name: `/${stage}/scim-api/token-secret/${mockTenant}/${mockOrgKey}/active-version`,
        Value: expectedVersion,
        Type: 'String',
        Overwrite: true,
      })
    );
  });

  it('should create a v1 token secret if no existing version is found', async () => {
    const putParameterCalls: unknown[] = [];
    mockSsmSend.mockImplementation((command: unknown) => {
      const name = (command as { constructor: { name: string } }).constructor
        .name;
      if (name === 'GetParameterCommand') {
        throw new ParameterNotFound({
          $metadata: {},
          message: 'Parameter not found',
        });
      }
      if (name === 'PutParameterCommand') {
        putParameterCalls.push((command as { input: unknown }).input);

        return Promise.resolve({});
      }

      return Promise.resolve({});
    });

    const event = createMockEvent('UPDATE', true, false);
    await handler(event, {} as Context, vi.fn());

    expect(putParameterCalls[0]).toEqual(
      expect.objectContaining({
        Name: `/${stage}/scim-api/token-secret/${mockTenant}/${mockOrgKey}/v1`,
        Value: 'mock-secret',
        Type: 'SecureString',
        Overwrite: false,
      })
    );
  });

  it('should ignore non-UPDATE events', async () => {
    const event = createMockEvent('INSERT', true);
    await handler(event, {} as Context, vi.fn());

    expect(mockSsmSend).not.toHaveBeenCalled();
  });

  it('should ignore updates where SCIM is not being enabled', async () => {
    const event = createMockEvent('UPDATE', false, false);
    await handler(event, {} as Context, vi.fn());

    expect(mockSsmSend).not.toHaveBeenCalled();
  });

  it('should handle errors from AWS SSM gracefully', async () => {
    mockSsmSend.mockImplementation((command: unknown) => {
      const name = (command as { constructor: { name: string } }).constructor
        .name;
      if (name === 'GetParameterCommand') {
        return Promise.resolve({ Parameter: { Value: 'v1' } });
      }
      if (name === 'PutParameterCommand') {
        return Promise.reject(new Error('AWS SSM failure'));
      }

      return Promise.resolve({});
    });

    const event = createMockEvent('UPDATE', true, false);
    await expect(handler(event, {} as Context, vi.fn())).rejects.toThrow(
      'AWS SSM failure'
    );
  });
});
