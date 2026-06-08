import { beforeEach, describe, expect, it } from 'vitest';

import App from '../../src/index.js';
import {
  createBundle,
  createMockZ,
  mockResponse,
  TEST_BASE_URL,
} from '../helpers/bundle.js';

const TEST_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

const findSearches = [
  { key: 'find_risk', path: '/risks' },
  { key: 'find_indicator', path: '/indicators' },
  { key: 'find_control', path: '/controls' },
  { key: 'find_action', path: '/actions' },
  { key: 'find_issue', path: '/issues' },
  { key: 'find_policy', path: '/policies' },
  { key: 'find_assessment', path: '/assessments' },
  { key: 'find_obligation', path: '/compliance/obligations' },
  { key: 'find_third_party', path: '/third-parties' },
  { key: 'find_enterprise_risk', path: '/enterprise-risks' },
  { key: 'find_impact', path: '/impacts' },
  { key: 'find_user', path: '/users' },
] as const;

describe.each(findSearches)('$key', ({ key, path }) => {
  let z: ReturnType<typeof createMockZ>;

  beforeEach(() => {
    z = createMockZ();
  });

  const getPerform = () => {
    const search = App.searches[key];
    if (!search) throw new Error(`Search ${key} not found in App.searches`);
    return search.operation.perform;
  };

  it(`requests GET ${path}/:id`, async () => {
    z.request.mockResolvedValue(
      mockResponse(200, { id: TEST_ID, title: 'Test Entity' })
    );
    const bundle = createBundle({ id: TEST_ID });
    await getPerform()(z, bundle);
    expect(z.request).toHaveBeenCalledWith(
      expect.objectContaining({
        url: `${TEST_BASE_URL}/api/v1${path}/${TEST_ID}`,
        skipThrowForStatus: true,
      })
    );
  });

  it('returns entity wrapped in array on 200', async () => {
    const entity = { id: TEST_ID, title: 'Found' };
    z.request.mockResolvedValue(mockResponse(200, entity));
    const bundle = createBundle({ id: TEST_ID });
    const result = await getPerform()(z, bundle);
    expect(result).toEqual([entity]);
  });

  it('returns empty array on 404', async () => {
    z.request.mockResolvedValue(mockResponse(404, { message: 'Not found' }));
    const bundle = createBundle({ id: TEST_ID });
    const result = await getPerform()(z, bundle);
    expect(result).toEqual([]);
  });

  it('throws on non-404 error status', async () => {
    z.request.mockResolvedValue(mockResponse(500, { message: 'Server error' }));
    const bundle = createBundle({ id: TEST_ID });
    await expect(getPerform()(z, bundle)).rejects.toThrow();
  });
});
