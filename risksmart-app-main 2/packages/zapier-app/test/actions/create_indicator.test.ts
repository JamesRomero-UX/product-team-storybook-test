import { beforeEach, describe, expect, it } from 'vitest';

import createIndicator from '../../src/actions/create_indicator.js';
import {
  createBundle,
  createMockZ,
  mockResponse,
  TEST_BASE_URL,
} from '../helpers/bundle.js';

describe('create_indicator', () => {
  let z: ReturnType<typeof createMockZ>;

  beforeEach(() => {
    z = createMockZ();
  });

  it('sends POST to /indicators with required fields', async () => {
    z.request.mockResolvedValue(mockResponse(201, { id: 'new-id' }));
    const bundle = createBundle({
      title: 'Uptime',
      type: 'number',
      owners: ['user-1'],
      parentId: 'risk-1',
    });
    await createIndicator.operation.perform(z, bundle);
    expect(z.request).toHaveBeenCalledWith(
      expect.objectContaining({
        url: `${TEST_BASE_URL}/api/v1/indicators`,
        method: 'POST',
        body: JSON.stringify({
          title: 'Uptime',
          type: 'number',
          owners: ['user-1'],
          parentId: 'risk-1',
        }),
      })
    );
  });

  it('includes number-type fields when provided', async () => {
    z.request.mockResolvedValue(mockResponse(201, { id: 'id' }));
    const bundle = createBundle({
      title: 'KRI',
      type: 'number',
      owners: ['user-1'],
      parentId: 'risk-1',
      unit: '%',
      upperTolerance: 100,
      lowerTolerance: 0,
      upperAppetite: 95,
      lowerAppetite: 50,
    });
    await createIndicator.operation.perform(z, bundle);
    const body = JSON.parse(
      ((z.request.mock.calls[0] as unknown[])[0] as Record<string, string>)
        .body
    );
    expect(body.unit).toBe('%');
    expect(body.upperTolerance).toBe(100);
    expect(body.lowerTolerance).toBe(0);
    expect(body.upperAppetite).toBe(95);
    expect(body.lowerAppetite).toBe(50);
  });

  it('includes zero values for number fields (not falsy-skipped)', async () => {
    z.request.mockResolvedValue(mockResponse(201, { id: 'id' }));
    const bundle = createBundle({
      title: 'KRI',
      type: 'number',
      owners: ['user-1'],
      parentId: 'risk-1',
      upperTolerance: 0,
      lowerTolerance: 0,
      upperAppetite: 0,
      lowerAppetite: 0,
    });
    await createIndicator.operation.perform(z, bundle);
    const body = JSON.parse(
      ((z.request.mock.calls[0] as unknown[])[0] as Record<string, string>)
        .body
    );
    expect(body.upperTolerance).toBe(0);
    expect(body.lowerTolerance).toBe(0);
    expect(body.upperAppetite).toBe(0);
    expect(body.lowerAppetite).toBe(0);
  });

  it('includes text-type fields when provided', async () => {
    z.request.mockResolvedValue(mockResponse(201, { id: 'id' }));
    const bundle = createBundle({
      title: 'Status',
      type: 'text',
      owners: ['user-1'],
      parentId: 'risk-1',
      targetValue: 'On Track',
    });
    await createIndicator.operation.perform(z, bundle);
    const body = JSON.parse(
      ((z.request.mock.calls[0] as unknown[])[0] as Record<string, string>)
        .body
    );
    expect(body.targetValue).toBe('On Track');
  });

  it('includes description when provided', async () => {
    z.request.mockResolvedValue(mockResponse(201, { id: 'id' }));
    const bundle = createBundle({
      title: 'KRI',
      type: 'number',
      owners: ['user-1'],
      parentId: 'risk-1',
      description: 'Measures uptime',
    });
    await createIndicator.operation.perform(z, bundle);
    const body = JSON.parse(
      ((z.request.mock.calls[0] as unknown[])[0] as Record<string, string>)
        .body
    );
    expect(body.description).toBe('Measures uptime');
  });

  it('returns response data', async () => {
    const responseData = { id: 'new-id', title: 'Created Indicator' };
    z.request.mockResolvedValue(mockResponse(201, responseData));
    const bundle = createBundle({
      title: 'KRI',
      type: 'number',
      owners: ['user-1'],
      parentId: 'risk-1',
    });
    const result = await createIndicator.operation.perform(z, bundle);
    expect(result).toEqual(responseData);
  });
});
