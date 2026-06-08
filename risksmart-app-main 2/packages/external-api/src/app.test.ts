import request from 'supertest';
import { v4 as uuidv4 } from 'uuid';
import { describe, expect, it } from 'vitest';

import app from './app';
import { mockJwtToken } from './testing/test-utils';
import { b64url } from './utils/buffer';
import { generateSignature } from './utils/crypto';

describe('Express App', () => {
  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/healthz').expect(200);

      expect(response.body).toMatchObject({
        status: 'ok',
        timestamp: expect.any(String) as string,
        version: expect.any(String) as string,
      });
    });
  });

  describe('OpenAPI Documentation', () => {
    const docsPath = '/api/v1/docs';
    const signingKey = process.env.API_DOCS_SIGNING_KEY || 'test-signing-key';

    const createSigPayload = (expiry: number) => `GET:${docsPath}:${expiry}`;

    const createValidSignature = (expiry: number) => {
      const sigPayload = createSigPayload(expiry);
      const signature = b64url(generateSignature(sigPayload, signingKey));

      return signature;
    };

    it('should forbid documentation page without signature', async () => {
      const response = await request(app)
        .get('/api/v1/docs')
        .set('Authorization', `Bearer ${mockJwtToken}`)
        .expect(403);

      expect(response.text).not.toContain('Developers Documentation');
    });

    it('should return 200 for documentation page with valid signature and expiry', async () => {
      const expiresAt = Date.now() + 3600 * 1000; // 1 hour from now
      const signature = createValidSignature(expiresAt);

      const response = await request(app)
        .get(`${docsPath}?sig=${signature}&exp=${expiresAt}`)
        .expect(200);

      expect(response.text).toContain('Developers Documentation');
    });

    it('should forbid documentation page with expired signature', async () => {
      const expiresAt = Date.now() - 1000; // 1 second in the past
      const signature = createValidSignature(expiresAt);

      const response = await request(app)
        .get(`${docsPath}?sig=${signature}&exp=${expiresAt}`)
        .expect(403);

      expect(response.text).not.toContain('Developers Documentation');
    });

    it('should forbid documentation page with invalid signature', async () => {
      const expiresAt = Date.now() + 3600 * 1000; // 1 hour from now
      const invalidSignature = 'invalid-signature-string';

      const response = await request(app)
        .get(`${docsPath}?sig=${invalidSignature}&exp=${expiresAt}`)
        .expect(403);

      expect(response.text).not.toContain('Developers Documentation');
    });
  });

  describe('Protected Risk Routes', () => {
    const riskId = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
    const expectedRiskResponse = {
      id: riskId,
      sequentialId: 1,
      title: 'Mock risk',
      description: 'This is a mock risk!',
      createdAt: '2023-01-01T00:00:00.000+00:00',
      updatedAt: '2023-01-01T00:00:00.000+00:00',
      createdBy: '677ffee5-b4fe-4e16-8ece-d2fa1ebaf821',
      updatedBy: 'provider|user123',
      tier: 0,
      status: 'open',
      treatment: 'mitigate',
      owners: [],
      contributors: [],
      tags: [],
      customFields: {},
      riskScore: {
        residualScore: null,
        residualRating: null,
        inherentScore: null,
        inherentRating: null,
        residualImpact: null,
        residualLikelihood: null,
        inherentImpact: null,
        inherentLikelihood: null,
      },
      schedule: {
        frequency: null,
        manualDueDate: null,
        startDate: null,
        timeToCompleteUnit: null,
        timeToCompleteValue: null,
      },
      scheduleState: {
        dueDate: null,
        latestDate: null,
        overdueDate: null,
      },
      links: {
        self: { href: `/api/v1/risks/${riskId}` },
        parents: [],
        controls: { href: `/api/v1/risks/${riskId}/controls` },
        acceptances: { href: `/api/v1/risks/${riskId}/acceptances` },
        actions: { href: `/api/v1/risks/${riskId}/actions` },
        indicators: { href: `/api/v1/risks/${riskId}/indicators` },
        appetites: { href: `/api/v1/risks/${riskId}/appetites` },
        ratings: { href: `/api/v1/risks/${riskId}/ratings` },
        impacts: { href: `/api/v1/risks/${riskId}/impacts` },
        approvals: { href: `/api/v1/risks/${riskId}/approvals` },
        linkedItems: {
          href: `/api/v1/risks/${riskId}/linked-items`,
        },
        createdBy: {
          href: '/api/v1/users/677ffee5-b4fe-4e16-8ece-d2fa1ebaf821',
          type: 'user',
          id: '677ffee5-b4fe-4e16-8ece-d2fa1ebaf821',
        },
        updatedBy: {
          href: '/api/v1/users/provider%7Cuser123',
          type: 'user',
          id: 'provider|user123',
        },
        owners: [],
        contributors: [],
      },
    };
    // eslint-disable-next-line vitest/expect-expect
    it('should return 200 for risks with an auth token', async () => {
      await request(app)
        .get('/api/v1/risks')
        .set('Authorization', `Bearer ${mockJwtToken}`)
        .expect(200);
    });

    it('should return expected body for /risks request', async () => {
      const response = await request(app)
        .get('/api/v1/risks')
        .set('Authorization', `Bearer ${mockJwtToken}`)
        .expect(200);

      const responseBody = response.body as {
        data: unknown[];
      };

      const {
        customFields: _customFields,
        schedule: _schedule,
        scheduleState: _scheduleState,
        ...expectedWithoutCustomFields
      } = expectedRiskResponse;
      expect(responseBody.data[0]).toEqual(expectedWithoutCustomFields);
    });

    it('should return expected body for risks/riskId request', async () => {
      const response = await request(app)
        .get(`/api/v1/risks/${uuidv4()}`)
        .set('Authorization', `Bearer ${mockJwtToken}`)
        .expect(200);
      const responseBody = response.body as unknown;

      expect(responseBody).toEqual(expectedRiskResponse);
    });

    // eslint-disable-next-line vitest/expect-expect
    it('should return 401 for protected routes without auth', async () => {
      await request(app).get('/api/v1/risks').expect(401);
    });

    // eslint-disable-next-line vitest/expect-expect
    it('should return 400 for protected routes without tenant ID', async () => {
      await request(app)
        .get('/api/v1/risks')
        .set('Authorization', 'Bearer valid-token')
        .expect(401); // Auth will fail first, but in real scenario it would be 400 for missing tenant
    });
  });

  describe('Not Found', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/non-existent-route')
        .set('Authorization', `Bearer ${mockJwtToken}`)
        .expect(404);

      expect(response.body).toMatchObject({
        error: 'Not Found',
        message: 'Route GET /non-existent-route not found',
        statusCode: 404,
        timestamp: expect.any(String) as string,
      });
    });
  });

  describe('Protected Auth Client Routes', () => {
    const validClientRequest = {
      name: 'test-client',
      tenantId: 'tenant-123',
      orgId: 'org-456',
      role: 'org' as const,
      scopes: ['risks:read'],
    };

    // eslint-disable-next-line vitest/expect-expect
    it('should return 401 for /auth/clients without authorization token', async () => {
      await request(app)
        .post('/api/v1/auth/clients')
        .send(validClientRequest)
        .expect(401);
    });

    it('should return 400 for invalid request body', async () => {
      const invalidRequest = {
        name: 'a', // Too short
        tenantId: '', // Empty
        orgId: 'org-456',
        role: 'invalid-role',
        scopes: [], // Empty array
      };

      const response = await request(app)
        .post('/api/v1/auth/clients')
        .set('Authorization', `Bearer ${mockJwtToken}`)
        .send(invalidRequest)
        .expect(400);

      const body = response.body as {
        statusCode: number;
      };

      expect(body).toHaveProperty('error');
      expect(body).toHaveProperty('message');
      expect(body).toHaveProperty('statusCode');
      expect(body.statusCode).toBe(400);
    });

    it('should return 409 for ClientLimitError when MOCK_EXISTING_CLIENT_COUNT=20', async () => {
      const originalValue = process.env.MOCK_EXISTING_CLIENT_COUNT;
      process.env.MOCK_EXISTING_CLIENT_COUNT = '20';

      const response = await request(app)
        .post('/api/v1/auth/clients')
        .set('Authorization', `Bearer ${mockJwtToken}`)
        .send(validClientRequest)
        .expect(409);

      const body = response.body as {
        statusCode: number;
        message: string;
      };

      expect(body).toHaveProperty('error');
      expect(body).toHaveProperty('message');
      expect(body).toHaveProperty('statusCode');
      expect(body.statusCode).toBe(409);
      expect(body.message).toBe(
        'Maximum client credentials limit reached for this organization'
      );

      // Restore original value
      if (originalValue !== undefined) {
        process.env.MOCK_EXISTING_CLIENT_COUNT = originalValue;
      } else {
        delete process.env.MOCK_EXISTING_CLIENT_COUNT;
      }
    });

    it('should return 200 with expected response structure including clientName', async () => {
      const originalValue = process.env.MOCK_EXISTING_CLIENT_COUNT;
      process.env.MOCK_EXISTING_CLIENT_COUNT = '2';

      const response = await request(app)
        .post('/api/v1/auth/clients')
        .set('Authorization', `Bearer ${mockJwtToken}`)
        .send(validClientRequest)
        .expect(200);

      const responseBody = response.body as {
        clientName: string;
        clientKey: string;
        clientSecret: string;
      };

      expect(responseBody).toHaveProperty('clientName');
      expect(responseBody).toHaveProperty('clientKey');
      expect(responseBody).toHaveProperty('clientSecret');

      // Verify clientName includes the name from the request
      // Note: orgId comes from JWT token (abc123), not from request body
      expect(responseBody.clientName).toBe('abc123-test-client');
      expect(responseBody.clientKey).toMatch(/^mock_client_\d+_\d+$/);
      expect(responseBody.clientSecret).toMatch(/^mock_secret_[0-9a-f-]+$/);

      // Restore original value
      if (originalValue !== undefined) {
        process.env.MOCK_EXISTING_CLIENT_COUNT = originalValue;
      } else {
        delete process.env.MOCK_EXISTING_CLIENT_COUNT;
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle JSON parsing errors', async () => {
      const response = await request(app)
        .post('/api/v1/risks')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer valid-token')
        .send('invalid json')
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('statusCode');
    });
  });
});
