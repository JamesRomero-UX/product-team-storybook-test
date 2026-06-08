import { beforeEach, describe, expect, it } from 'vitest';

import updateRisk from '../../src/actions/update_risk.js';
import {
  createBundle,
  createMockZ,
  mockResponse,
  TEST_BASE_URL,
} from '../helpers/bundle.js';

const RISK_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

describe('update_risk', () => {
  let z: ReturnType<typeof createMockZ>;

  beforeEach(() => {
    z = createMockZ();
  });

  it('sends PUT to /risks/:id', async () => {
    z.request.mockResolvedValue(
      mockResponse(200, { id: RISK_ID, title: 'Updated' })
    );
    const bundle = createBundle({
      id: RISK_ID,
      title: 'Updated',
      owners: ['user-1'],
    });
    await updateRisk.operation.perform(z, bundle);
    expect(z.request).toHaveBeenCalledWith(
      expect.objectContaining({
        url: `${TEST_BASE_URL}/api/v1/risks/${RISK_ID}`,
        method: 'PUT',
      })
    );
  });

  it('sends required fields in body', async () => {
    z.request.mockResolvedValue(mockResponse(200, { id: RISK_ID }));
    const bundle = createBundle({
      id: RISK_ID,
      title: 'New Title',
      owners: ['user-1'],
    });
    await updateRisk.operation.perform(z, bundle);
    const body = JSON.parse(
      ((z.request.mock.calls[0] as unknown[])[0] as Record<string, string>)
        .body
    );
    expect(body).toEqual({ title: 'New Title', owners: ['user-1'] });
  });

  it('includes all optional fields when provided', async () => {
    z.request.mockResolvedValue(mockResponse(200, { id: RISK_ID }));
    const bundle = createBundle({
      id: RISK_ID,
      title: 'Risk',
      owners: ['user-1'],
      description: 'Desc',
      treatment: 'tolerate',
      status: 'emerging',
      parentRiskId: 'parent-id',
    });
    await updateRisk.operation.perform(z, bundle);
    const body = JSON.parse(
      ((z.request.mock.calls[0] as unknown[])[0] as Record<string, string>)
        .body
    );
    expect(body).toEqual({
      title: 'Risk',
      owners: ['user-1'],
      description: 'Desc',
      treatment: 'tolerate',
      status: 'emerging',
      parentRiskId: 'parent-id',
    });
  });

  it('returns response data', async () => {
    const responseData = { id: RISK_ID, title: 'Updated Risk' };
    z.request.mockResolvedValue(mockResponse(200, responseData));
    const bundle = createBundle({
      id: RISK_ID,
      title: 'Updated Risk',
      owners: ['user-1'],
    });
    const result = await updateRisk.operation.perform(z, bundle);
    expect(result).toEqual(responseData);
  });
});
