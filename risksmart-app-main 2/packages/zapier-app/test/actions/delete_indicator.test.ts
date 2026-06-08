import { beforeEach, describe, expect, it } from 'vitest';

import deleteIndicator from '../../src/actions/delete_indicator.js';
import {
  createBundle,
  createMockZ,
  mockResponse,
  TEST_BASE_URL,
} from '../helpers/bundle.js';

const INDICATOR_ID = 'e5f6a7b8-c9d0-1234-efab-345678901234';

describe('delete_indicator', () => {
  let z: ReturnType<typeof createMockZ>;

  beforeEach(() => {
    z = createMockZ();
  });

  it('sends DELETE to /indicators/:id', async () => {
    z.request.mockResolvedValue(
      mockResponse(200, { id: INDICATOR_ID })
    );
    const bundle = createBundle({ id: INDICATOR_ID });
    await deleteIndicator.operation.perform(z, bundle);
    expect(z.request).toHaveBeenCalledWith(
      expect.objectContaining({
        url: `${TEST_BASE_URL}/api/v1/indicators/${INDICATOR_ID}`,
        method: 'DELETE',
      })
    );
  });

  it('does not send a request body', async () => {
    z.request.mockResolvedValue(
      mockResponse(200, { id: INDICATOR_ID })
    );
    const bundle = createBundle({ id: INDICATOR_ID });
    await deleteIndicator.operation.perform(z, bundle);
    const callArg = (z.request.mock.calls[0] as unknown[])[0] as Record<
      string,
      unknown
    >;
    expect(callArg).not.toHaveProperty('body');
  });

  it('returns response data', async () => {
    const responseData = { id: INDICATOR_ID };
    z.request.mockResolvedValue(mockResponse(200, responseData));
    const bundle = createBundle({ id: INDICATOR_ID });
    const result = await deleteIndicator.operation.perform(z, bundle);
    expect(result).toEqual(responseData);
  });
});
