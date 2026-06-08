import { beforeEach, describe, expect, it } from 'vitest';

import deleteRisk from '../../src/actions/delete_risk.js';
import {
  createBundle,
  createMockZ,
  mockResponse,
  TEST_BASE_URL,
} from '../helpers/bundle.js';

const RISK_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

describe('delete_risk', () => {
  let z: ReturnType<typeof createMockZ>;

  beforeEach(() => {
    z = createMockZ();
  });

  it('sends DELETE to /risks/:id', async () => {
    z.request.mockResolvedValue(mockResponse(200, { id: RISK_ID }));
    const bundle = createBundle({ id: RISK_ID });
    await deleteRisk.operation.perform(z, bundle);
    expect(z.request).toHaveBeenCalledWith(
      expect.objectContaining({
        url: `${TEST_BASE_URL}/api/v1/risks/${RISK_ID}`,
        method: 'DELETE',
      })
    );
  });

  it('does not send a request body', async () => {
    z.request.mockResolvedValue(mockResponse(200, { id: RISK_ID }));
    const bundle = createBundle({ id: RISK_ID });
    await deleteRisk.operation.perform(z, bundle);
    const callArg = (z.request.mock.calls[0] as unknown[])[0] as Record<
      string,
      unknown
    >;
    expect(callArg).not.toHaveProperty('body');
  });

  it('returns response data', async () => {
    const responseData = { id: RISK_ID };
    z.request.mockResolvedValue(mockResponse(200, responseData));
    const bundle = createBundle({ id: RISK_ID });
    const result = await deleteRisk.operation.perform(z, bundle);
    expect(result).toEqual(responseData);
  });
});
