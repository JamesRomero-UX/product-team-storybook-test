import { TRPCError } from '@trpc/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

import { createCallerFactory } from '../../init';
import { createSsoConfigurationService } from '../../services/frontend/index';
import { Strategy } from '../../services/service.types';
import { createMockContext } from '../../test-utils/mock-context';
import { ssoConfigurationRouter } from './sso-configuration.router';

vi.mock('@sentry/node', () => ({
  trpcMiddleware: () => (opts: { next: () => unknown }) => opts.next(),
}));

vi.mock('@risksmart-app/permitio/src/permit', () => ({
  filter: vi.fn(),
  preFilter: vi.fn(),
}));

vi.mock('../../services/frontend/index');

const mockGetSsoConfigurations = vi.fn();
const mockSaveSsoConfiguration = vi.fn();
const mockDeleteSsoConfiguration = vi.fn();

const mockContext = createMockContext({
  orgId: 'test-org-id',
  userId: 'test-user-id',
  tenant: 'test-tenant',
  isBackend: false,
  features: [],
});

const createCaller = createCallerFactory(ssoConfigurationRouter);

describe('ssoConfigurationRouter.list', () => {
  beforeEach(() => {
    vi.mocked(createSsoConfigurationService).mockReturnValue({
      getSsoConfigurations: mockGetSsoConfigurations,
      saveSsoConfiguration: mockSaveSsoConfiguration,
      deleteSsoConfiguration: mockDeleteSsoConfiguration,
    });
  });

  it('calls getSsoConfigurations with correct context', async () => {
    const mockResponse = [{ ConnectionId: 'conn-1' }];
    mockGetSsoConfigurations.mockResolvedValueOnce(mockResponse);

    const caller = createCaller(mockContext);
    const result = await caller.list();

    expect(mockGetSsoConfigurations).toHaveBeenCalledWith({
      orgId: 'test-org-id',
      userId: 'test-user-id',
      tenant: 'test-tenant',
    });
    expect(result).toEqual(mockResponse);
  });

  it('propagates TRPCError from service (FORBIDDEN)', async () => {
    mockGetSsoConfigurations.mockRejectedValueOnce(
      new TRPCError({ code: 'FORBIDDEN' })
    );

    const caller = createCaller(mockContext);
    await expect(caller.list()).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('throws UNAUTHORIZED when user context is missing', async () => {
    const unauthCaller = createCaller(createMockContext(null));
    await expect(unauthCaller.list()).rejects.toThrow(TRPCError);
  });
});

describe('ssoConfigurationRouter.save', () => {
  beforeEach(() => {
    vi.mocked(createSsoConfigurationService).mockReturnValue({
      getSsoConfigurations: mockGetSsoConfigurations,
      saveSsoConfiguration: mockSaveSsoConfiguration,
      deleteSsoConfiguration: mockDeleteSsoConfiguration,
    });
  });

  const saveSchema = z.object({
    strategy: z.string().min(1),
    domain: z.string().min(1),
    clientId: z.string().min(1),
    clientSecret: z.string().min(1),
    addOrgConnection: z.boolean(),
    connectionId: z.string().optional(),
    domainAliases: z.array(z.string()).optional(),
  });

  describe('input validation', () => {
    it('accepts valid required-only input', () => {
      const result = saveSchema.safeParse({
        strategy: Strategy.Azure,
        domain: 'example.com',
        clientId: 'client-123',
        clientSecret: 'secret-abc',
        addOrgConnection: false,
      });
      expect(result.success).toBe(true);
    });

    it('rejects empty strategy', () => {
      const result = saveSchema.safeParse({
        strategy: '',
        domain: 'example.com',
        clientId: 'client-123',
        clientSecret: 'secret-abc',
        addOrgConnection: false,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.errors.some((e) => e.path.includes('strategy'))
        ).toBe(true);
      }
    });

    it('rejects empty domain', () => {
      const result = saveSchema.safeParse({
        strategy: Strategy.Azure,
        domain: '',
        clientId: 'client-123',
        clientSecret: 'secret-abc',
        addOrgConnection: false,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.some((e) => e.path.includes('domain'))).toBe(
          true
        );
      }
    });

    it('rejects empty clientId', () => {
      const result = saveSchema.safeParse({
        strategy: Strategy.Azure,
        domain: 'example.com',
        clientId: '',
        clientSecret: 'secret-abc',
        addOrgConnection: false,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.errors.some((e) => e.path.includes('clientId'))
        ).toBe(true);
      }
    });

    it('rejects empty clientSecret', () => {
      const result = saveSchema.safeParse({
        strategy: Strategy.Azure,
        domain: 'example.com',
        clientId: 'client-123',
        clientSecret: '',
        addOrgConnection: false,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.errors.some((e) => e.path.includes('clientSecret'))
        ).toBe(true);
      }
    });

    it('accepts all optional fields', () => {
      const result = saveSchema.safeParse({
        strategy: Strategy.Azure,
        domain: 'example.com',
        clientId: 'client-123',
        clientSecret: 'secret-abc',
        addOrgConnection: true,
        connectionId: 'conn-existing',
        domainAliases: ['alias.example.com'],
      });
      expect(result.success).toBe(true);
    });
  });

  describe('mutation', () => {
    it('calls saveSsoConfiguration with correct context and input', async () => {
      const mockResponse = {
        ConnectionId: 'conn-1',
        Enabled: true,
        IsOrgConnected: false,
        Action: 'created',
        Options: {},
      };
      mockSaveSsoConfiguration.mockResolvedValueOnce(mockResponse);

      const caller = createCaller(mockContext);
      const result = await caller.save({
        strategy: Strategy.Azure,
        domain: 'example.com',
        clientId: 'client-123',
        clientSecret: 'secret-abc',
        addOrgConnection: false,
      });

      expect(mockSaveSsoConfiguration).toHaveBeenCalledWith(
        {
          orgId: 'test-org-id',
          userId: 'test-user-id',
          tenant: 'test-tenant',
        },
        expect.objectContaining({
          strategy: Strategy.Azure,
          domain: 'example.com',
          clientId: 'client-123',
          clientSecret: 'secret-abc',
          addOrgConnection: false,
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('propagates TRPCError from service (FORBIDDEN)', async () => {
      mockSaveSsoConfiguration.mockRejectedValueOnce(
        new TRPCError({ code: 'FORBIDDEN' })
      );

      const caller = createCaller(mockContext);
      await expect(
        caller.save({
          strategy: Strategy.Azure,
          domain: 'example.com',
          clientId: 'client-123',
          clientSecret: 'secret-abc',
          addOrgConnection: false,
        })
      ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    });

    it('throws UNAUTHORIZED when user context is missing', async () => {
      const unauthCaller = createCaller(createMockContext(null));
      await expect(
        unauthCaller.save({
          strategy: Strategy.Azure,
          domain: 'example.com',
          clientId: 'client-123',
          clientSecret: 'secret-abc',
          addOrgConnection: false,
        })
      ).rejects.toThrow(TRPCError);
    });
  });
});

describe('ssoConfigurationRouter.delete', () => {
  beforeEach(() => {
    vi.mocked(createSsoConfigurationService).mockReturnValue({
      getSsoConfigurations: mockGetSsoConfigurations,
      saveSsoConfiguration: mockSaveSsoConfiguration,
      deleteSsoConfiguration: mockDeleteSsoConfiguration,
    });
  });

  const deleteSchema = z.object({
    connectionId: z.string().min(1),
  });

  describe('input validation', () => {
    it('accepts valid connectionId', () => {
      const result = deleteSchema.safeParse({ connectionId: 'conn-1' });
      expect(result.success).toBe(true);
    });

    it('rejects empty connectionId', () => {
      const result = deleteSchema.safeParse({ connectionId: '' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.errors.some((e) => e.path.includes('connectionId'))
        ).toBe(true);
      }
    });

    it('rejects missing connectionId', () => {
      const result = deleteSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  describe('mutation', () => {
    it('calls deleteSsoConfiguration with correct context and connectionId', async () => {
      mockDeleteSsoConfiguration.mockResolvedValueOnce(undefined);

      const caller = createCaller(mockContext);
      await caller.delete({ connectionId: 'conn-1' });

      expect(mockDeleteSsoConfiguration).toHaveBeenCalledWith(
        {
          orgId: 'test-org-id',
          userId: 'test-user-id',
          tenant: 'test-tenant',
        },
        'conn-1'
      );
    });

    it('propagates TRPCError from service (NOT_FOUND)', async () => {
      mockDeleteSsoConfiguration.mockRejectedValueOnce(
        new TRPCError({
          code: 'NOT_FOUND',
          message: 'SSO configuration not found',
        })
      );

      const caller = createCaller(mockContext);
      await expect(
        caller.delete({ connectionId: 'conn-1' })
      ).rejects.toMatchObject({
        code: 'NOT_FOUND',
        message: 'SSO configuration not found',
      });
    });

    it('throws UNAUTHORIZED when user context is missing', async () => {
      const unauthCaller = createCaller(createMockContext(null));
      await expect(
        unauthCaller.delete({ connectionId: 'conn-1' })
      ).rejects.toThrow(TRPCError);
    });
  });
});
