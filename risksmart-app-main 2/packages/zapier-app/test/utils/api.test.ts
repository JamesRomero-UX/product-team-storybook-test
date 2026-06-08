import { describe, expect, it } from 'vitest';

import { getBaseUrl, getEntityUrl } from '../../src/utils/api.js';
import { createBundle, TEST_BASE_URL } from '../helpers/bundle.js';

describe('getBaseUrl', () => {
  it('returns base URL with /api/v1 suffix', () => {
    const bundle = createBundle();
    expect(getBaseUrl(bundle)).toBe(`${TEST_BASE_URL}/api/v1`);
  });

  it('works with different api_base_url values', () => {
    const bundle = createBundle();
    bundle.authData.api_base_url = 'https://custom.example.com';
    expect(getBaseUrl(bundle)).toBe('https://custom.example.com/api/v1');
  });

  it('works with localhost URLs', () => {
    const bundle = createBundle();
    bundle.authData.api_base_url = 'http://localhost:3200';
    expect(getBaseUrl(bundle)).toBe('http://localhost:3200/api/v1');
  });
});

describe('getEntityUrl', () => {
  it('appends entity to base URL', () => {
    const bundle = createBundle();
    expect(getEntityUrl(bundle, 'risks')).toBe(
      `${TEST_BASE_URL}/api/v1/risks`
    );
  });

  it('handles nested entity paths', () => {
    const bundle = createBundle();
    expect(getEntityUrl(bundle, 'compliance/obligations')).toBe(
      `${TEST_BASE_URL}/api/v1/compliance/obligations`
    );
  });
});
