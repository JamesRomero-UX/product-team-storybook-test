import { beforeEach, describe, expect, it } from 'vitest';

import createRisk from '../../src/actions/create_risk.js';
import {
  createBundle,
  createMockZ,
  mockResponse,
  TEST_BASE_URL,
} from '../helpers/bundle.js';

describe('create_risk', () => {
  let z: ReturnType<typeof createMockZ>;

  beforeEach(() => {
    z = createMockZ();
  });

  it('sends POST to /risks with required fields', async () => {
    z.request.mockResolvedValue(
      mockResponse(201, { id: 'new-id', title: 'Test Risk' })
    );
    const bundle = createBundle({
      title: 'Test Risk',
      owners: ['user-1'],
    });
    await createRisk.operation.perform(z, bundle);
    expect(z.request).toHaveBeenCalledWith(
      expect.objectContaining({
        url: `${TEST_BASE_URL}/api/v1/risks`,
        method: 'POST',
        body: JSON.stringify({
          title: 'Test Risk',
          owners: ['user-1'],
        }),
      })
    );
  });

  it('includes optional fields when provided', async () => {
    z.request.mockResolvedValue(mockResponse(201, { id: 'id' }));
    const bundle = createBundle({
      title: 'Risk',
      owners: ['user-1'],
      description: 'A description',
      treatment: 'treat',
      status: 'active',
      parentRiskId: 'parent-123',
    });
    await createRisk.operation.perform(z, bundle);
    expect(z.request).toHaveBeenCalledWith(
      expect.objectContaining({
        body: JSON.stringify({
          title: 'Risk',
          owners: ['user-1'],
          description: 'A description',
          treatment: 'treat',
          status: 'active',
          parentRiskId: 'parent-123',
        }),
      })
    );
  });

  it('omits optional fields when not provided', async () => {
    z.request.mockResolvedValue(mockResponse(201, { id: 'id' }));
    const bundle = createBundle({
      title: 'Risk',
      owners: ['user-1'],
    });
    await createRisk.operation.perform(z, bundle);
    const body = JSON.parse(
      ((z.request.mock.calls[0] as unknown[])[0] as Record<string, string>)
        .body
    );
    expect(body).not.toHaveProperty('description');
    expect(body).not.toHaveProperty('treatment');
    expect(body).not.toHaveProperty('status');
    expect(body).not.toHaveProperty('parentRiskId');
  });

  it('returns response data', async () => {
    const responseData = { id: 'new-id', title: 'Created Risk' };
    z.request.mockResolvedValue(mockResponse(201, responseData));
    const bundle = createBundle({
      title: 'Risk',
      owners: ['user-1'],
    });
    const result = await createRisk.operation.perform(z, bundle);
    expect(result).toEqual(responseData);
  });
});
