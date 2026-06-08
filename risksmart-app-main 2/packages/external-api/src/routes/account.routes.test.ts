import express from 'express';
import type { RateLimiterRes } from 'rate-limiter-flexible';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { DynamoRateLimiter } from '../rate-limiter/dynamo.rate-limiter';
import type { AccountResponse } from '../schemas/account/account.schema';
import type { DocumentationService } from '../services/documentation/documentation.service';
import { createRequestLogger } from '../utils/logger';
import { accountRouter } from './account.routes';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const mockTenantId = '123e4567-e89b-12d3-a456-426614174000';
const mockOrgId = 'org-abc123';
const mockClientId = 'cid-xyz';

const createMockRateLimiterRes = (
  overrides: Partial<RateLimiterRes> = {}
): RateLimiterRes =>
  ({
    consumedPoints: 5,
    remainingPoints: 55,
    msBeforeNext: 30000,
    isFirstInDuration: false,
    ...overrides,
  }) as RateLimiterRes;

const buildApp = (
  rateLimiter: DynamoRateLimiter | null,
  docsService: DocumentationService,
  authOverrides: Record<string, unknown> = {},
  { includeAuth = true }: { includeAuth?: boolean } = {}
) => {
  const app = express();
  app.use(express.json());

  // Inject requestLogger (and optionally auth) via middleware to simulate JWT middleware
  app.use((req, _res, next) => {
    if (includeAuth) {
      (req as never as Record<string, unknown>).auth = {
        org_id: mockOrgId,
        client_id: mockClientId,
        tenant_id: mockTenantId,
        role: 'rs-external',
        exp: 1740000000, // seconds
        rl_profile: 'cruise',
        permissions: 'risks:list,risks:get,controls:list',
        ...authOverrides,
      };
    }
    (req as never as Record<string, unknown>).requestLogger =
      createRequestLogger({
        requestId: 'test-id',
        tenantId: mockTenantId,
        userId: 'test-user',
        method: req.method,
        path: req.path,
        timestamp: new Date().toISOString(),
      });
    next();
  });

  app.use('/', accountRouter({ docsService, rateLimiter }));

  // Express error handler (4-arg signature required)
  app.use(
    (
      err: Error & { status?: number },
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction
    ) => {
      res.status(err.status ?? 500).json({ message: err.message });
    }
  );

  return app;
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('accountRouter GET /', () => {
  let mockGetUsage: ReturnType<typeof vi.fn>;
  let mockRateLimiter: DynamoRateLimiter;
  let mockDocsService: DocumentationService;

  beforeEach(() => {
    mockGetUsage = vi.fn().mockResolvedValue({
      t1: createMockRateLimiterRes({
        consumedPoints: 1,
        remainingPoints: 9,
        msBeforeNext: 45000,
      }),
      t2: createMockRateLimiterRes({
        consumedPoints: 15,
        remainingPoints: 45,
        msBeforeNext: 30000,
      }),
      t3: createMockRateLimiterRes({
        consumedPoints: 50,
        remainingPoints: 250,
        msBeforeNext: 20000,
      }),
      t4: null,
    });

    mockRateLimiter = {
      consumeTier: vi.fn(),
      getUsage: mockGetUsage,
    } as unknown as DynamoRateLimiter;

    mockDocsService = {
      getSignedDocumentationPath: vi.fn().mockReturnValue({
        signedDocsPath: '/api/v1/docs?sig=abc123&exp=1740003600000',
      }),
    } as unknown as DocumentationService;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('happy path', () => {
    it('should return 200 with full account info', async () => {
      const app = buildApp(mockRateLimiter, mockDocsService);
      const res = await request(app).get('/');

      expect(res.status).toBe(200);
    });

    it('should return correct identity fields from JWT claims', async () => {
      const app = buildApp(mockRateLimiter, mockDocsService);
      const res = await request(app).get('/');

      expect(res.body).toMatchObject({
        orgId: mockOrgId,
        clientId: mockClientId,
        role: 'rs-external',
      });
    });

    it('should convert exp (seconds) to tokenExpiresAt (ms) and tokenExpiresAtUtc', async () => {
      const app = buildApp(mockRateLimiter, mockDocsService);
      const res = await request(app).get('/');
      const body = res.body as AccountResponse;

      expect(body.tokenExpiresAt).toBe(1740000000 * 1000);
      expect(body.tokenExpiresAtUtc).toBe(
        new Date(1740000000 * 1000).toISOString()
      );
    });

    it('should normalise permissions from comma-separated string to array', async () => {
      const app = buildApp(mockRateLimiter, mockDocsService);
      const res = await request(app).get('/');

      expect((res.body as AccountResponse).permissions).toEqual([
        'risks:list',
        'risks:get',
        'controls:list',
      ]);
    });

    it('should return rate limit profile', async () => {
      const app = buildApp(mockRateLimiter, mockDocsService);
      const res = await request(app).get('/');

      expect((res.body as AccountResponse).rateLimit.profile).toBe('cruise');
    });

    it('should return tier config and usage for all 4 tiers', async () => {
      const app = buildApp(mockRateLimiter, mockDocsService);
      const res = await request(app).get('/');

      const { tiers } = (res.body as AccountResponse).rateLimit;
      expect(tiers.t1).toMatchObject({ points: 10, durationSec: 60 });
      expect(tiers.t2).toMatchObject({ points: 60, durationSec: 60 });
      expect(tiers.t3).toMatchObject({ points: 300, durationSec: 60 });
      expect(tiers.t4).toMatchObject({ points: 1500, durationSec: 60 });
    });

    it('should populate currentUsage for tiers with prior usage', async () => {
      const app = buildApp(mockRateLimiter, mockDocsService);
      const res = await request(app).get('/');

      const { t1, t2, t3 } = (res.body as AccountResponse).rateLimit.tiers;
      expect(t1.currentUsage).toMatchObject({ consumed: 1, remaining: 9 });
      expect(t2.currentUsage).toMatchObject({ consumed: 15, remaining: 45 });
      expect(t3.currentUsage).toMatchObject({ consumed: 50, remaining: 250 });
    });

    it('should set currentUsage to null for tiers with no prior usage', async () => {
      const app = buildApp(mockRateLimiter, mockDocsService);
      const res = await request(app).get('/');

      expect(
        (res.body as AccountResponse).rateLimit.tiers.t4.currentUsage
      ).toBeNull();
    });

    it('should compute resetAt as Date.now() + msBeforeNext', async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2025-02-19T12:00:00.000Z'));
      const now = new Date('2025-02-19T12:00:00.000Z').getTime();

      const app = buildApp(mockRateLimiter, mockDocsService);
      const res = await request(app).get('/');

      vi.useRealTimers();

      const { currentUsage } = (res.body as AccountResponse).rateLimit.tiers.t1;
      expect(currentUsage?.resetAt).toBe(Math.ceil(now + 45000));
    });

    it('should call getUsage with clientKey derived from client_id', async () => {
      const app = buildApp(mockRateLimiter, mockDocsService);
      await request(app).get('/');

      expect(mockGetUsage).toHaveBeenCalledWith(
        `cid:${mockClientId}`,
        'cruise'
      );
    });

    it('should include the signed docs URL', async () => {
      const app = buildApp(mockRateLimiter, mockDocsService);
      const res = await request(app).get('/');

      expect((res.body as AccountResponse).documentation.href).toBe(
        '/api/v1/docs?sig=abc123&exp=1740003600000'
      );
    });
  });

  describe('rate limiter disabled (rateLimiter = null)', () => {
    it('should return 200', async () => {
      const app = buildApp(null, mockDocsService);
      const res = await request(app).get('/');

      expect(res.status).toBe(200);
    });

    it('should return null currentUsage for all tiers', async () => {
      const app = buildApp(null, mockDocsService);
      const res = await request(app).get('/');

      const { tiers } = (res.body as AccountResponse).rateLimit;
      expect(tiers.t1.currentUsage).toBeNull();
      expect(tiers.t2.currentUsage).toBeNull();
      expect(tiers.t3.currentUsage).toBeNull();
      expect(tiers.t4.currentUsage).toBeNull();
    });

    it('should not call getUsage when rateLimiter is null', async () => {
      const app = buildApp(null, mockDocsService);
      await request(app).get('/');

      expect(mockGetUsage).not.toHaveBeenCalled();
    });

    it('should still return profile config and identity fields', async () => {
      const app = buildApp(null, mockDocsService);
      const res = await request(app).get('/');
      const body = res.body as AccountResponse;

      expect(body.rateLimit.profile).toBe('cruise');
      expect(body.orgId).toBe(mockOrgId);
    });
  });

  describe('nullable fields', () => {
    it('should return null for role when not present in JWT', async () => {
      const app = buildApp(mockRateLimiter, mockDocsService, {
        role: undefined,
      });
      const res = await request(app).get('/');

      expect((res.body as AccountResponse).role).toBeNull();
    });

    it('should fall back to DEFAULT_RATE_LIMIT_PROFILE when rl_profile is missing', async () => {
      const app = buildApp(mockRateLimiter, mockDocsService, {
        rl_profile: undefined,
      });
      const res = await request(app).get('/');

      // DEFAULT_RATE_LIMIT_PROFILE is 'cruise'
      expect((res.body as AccountResponse).rateLimit.profile).toBe('cruise');
    });
  });

  describe('missing auth (401)', () => {
    it('should return 401 when auth is not present', async () => {
      const app = buildApp(
        mockRateLimiter,
        mockDocsService,
        {},
        { includeAuth: false }
      );

      const res = await request(app).get('/');
      expect(res.status).toBe(401);
    });
  });
});
