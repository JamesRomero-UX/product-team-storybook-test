import { beforeEach, describe, expect, it } from 'vitest';

import type { Bundle, HttpRequestOptions, ZObject } from 'zapier-platform-core';

import App from '../src/index.js';
import authentication from '../src/authentication.js';
import {
  createBundle,
  createMockZ,
  mockResponse,
  TEST_BASE_URL,
  TEST_SESSION_KEY,
} from './helpers/bundle.js';

describe('authentication', () => {
  let z: ReturnType<typeof createMockZ>;

  beforeEach(() => {
    z = createMockZ();
  });

  describe('getSessionKey', () => {
    it('exchanges client credentials for a session key', async () => {
      z.request.mockResolvedValue(
        mockResponse(200, { accessToken: 'new-token-123' })
      );
      const bundle = createBundle();
      const result = await authentication.sessionConfig.perform(z, bundle);
      expect(result).toEqual({ sessionKey: 'new-token-123' });
    });

    it('sends client credentials in request body', async () => {
      z.request.mockResolvedValue(
        mockResponse(200, { accessToken: 'tok' })
      );
      const bundle = createBundle();
      await authentication.sessionConfig.perform(z, bundle);
      expect(z.request).toHaveBeenCalledWith(
        expect.objectContaining({
          url: `${TEST_BASE_URL}/api/v1/auth/token`,
          method: 'POST',
          body: JSON.stringify({
            clientKey: 'test-client-key',
            clientSecret: 'test-client-secret',
          }),
        })
      );
    });
  });

  describe('test', () => {
    it('makes a request to risks endpoint with page_size=1', async () => {
      z.request.mockResolvedValue(mockResponse(200, { data: [] }));
      const bundle = createBundle();
      await authentication.test(z, bundle);
      expect(z.request).toHaveBeenCalledWith(
        expect.objectContaining({
          url: `${TEST_BASE_URL}/api/v1/risks`,
          params: { page_size: '1' },
        })
      );
    });

    it('returns response data', async () => {
      const data = { data: [{ id: '1' }] };
      z.request.mockResolvedValue(mockResponse(200, data));
      const bundle = createBundle();
      const result = await authentication.test(z, bundle);
      expect(result).toEqual(data);
    });
  });

  describe('connectionLabel', () => {
    it('returns label with host from URL', async () => {
      const bundle = createBundle();
      bundle.authData.api_base_url = 'https://api.risksmart.com';
      const label = await authentication.connectionLabel(z, bundle);
      expect(label).toBe('RiskSmart (api.risksmart.com)');
    });

    it('returns fallback label for invalid URL', async () => {
      const bundle = createBundle();
      bundle.authData.api_base_url = 'not-a-url';
      const label = await authentication.connectionLabel(z, bundle);
      expect(label).toBe('RiskSmart');
    });

    it('returns fallback label for empty URL', async () => {
      const bundle = createBundle();
      bundle.authData.api_base_url = '';
      const label = await authentication.connectionLabel(z, bundle);
      expect(label).toBe('RiskSmart');
    });
  });

  describe('addBearerToken', () => {
    const addBearerToken = App.beforeRequest[0]!;

    it('adds Authorization header when sessionKey exists', () => {
      const request: HttpRequestOptions = { url: 'https://example.com', headers: {} };
      const bundle = createBundle();
      const result = addBearerToken(request, z as unknown as ZObject, bundle);
      expect(result.headers).toEqual(
        expect.objectContaining({
          Authorization: `Bearer ${TEST_SESSION_KEY}`,
        })
      );
    });

    it('preserves existing headers', () => {
      const request: HttpRequestOptions = {
        url: 'https://example.com',
        headers: { 'Content-Type': 'application/json' },
      };
      const bundle = createBundle();
      const result = addBearerToken(request, z as unknown as ZObject, bundle);
      expect(result.headers).toEqual(
        expect.objectContaining({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${TEST_SESSION_KEY}`,
        })
      );
    });

    it('does not add Authorization header when sessionKey is empty', () => {
      const request: HttpRequestOptions = { url: 'https://example.com', headers: {} };
      const bundle = createBundle();
      bundle.authData.sessionKey = '';
      const result = addBearerToken(request, z as unknown as ZObject, bundle);
      expect(result.headers).not.toHaveProperty('Authorization');
    });
  });
});
