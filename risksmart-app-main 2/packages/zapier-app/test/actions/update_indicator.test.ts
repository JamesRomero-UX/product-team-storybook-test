import { beforeEach, describe, expect, it } from 'vitest';

import updateIndicator from '../../src/actions/update_indicator.js';
import {
  createBundle,
  createMockZ,
  mockResponse,
  TEST_BASE_URL,
} from '../helpers/bundle.js';

const INDICATOR_ID = 'e5f6a7b8-c9d0-1234-efab-345678901234';

describe('update_indicator', () => {
  let z: ReturnType<typeof createMockZ>;

  beforeEach(() => {
    z = createMockZ();
  });

  it('sends PUT to /indicators/:id', async () => {
    z.request.mockResolvedValue(
      mockResponse(200, { id: INDICATOR_ID })
    );
    const bundle = createBundle({
      id: INDICATOR_ID,
      title: 'Updated',
    });
    await updateIndicator.operation.perform(z, bundle);
    expect(z.request).toHaveBeenCalledWith(
      expect.objectContaining({
        url: `${TEST_BASE_URL}/api/v1/indicators/${INDICATOR_ID}`,
        method: 'PUT',
      })
    );
  });

  it('includes only provided fields in body', async () => {
    z.request.mockResolvedValue(
      mockResponse(200, { id: INDICATOR_ID })
    );
    const bundle = createBundle({
      id: INDICATOR_ID,
      title: 'New Title',
      type: 'text',
    });
    await updateIndicator.operation.perform(z, bundle);
    const body = JSON.parse(
      ((z.request.mock.calls[0] as unknown[])[0] as Record<string, string>)
        .body
    );
    expect(body).toEqual({ title: 'New Title', type: 'text' });
  });

  it('includes number-type fields with zero values', async () => {
    z.request.mockResolvedValue(
      mockResponse(200, { id: INDICATOR_ID })
    );
    const bundle = createBundle({
      id: INDICATOR_ID,
      upperTolerance: 0,
      lowerTolerance: 0,
    });
    await updateIndicator.operation.perform(z, bundle);
    const body = JSON.parse(
      ((z.request.mock.calls[0] as unknown[])[0] as Record<string, string>)
        .body
    );
    expect(body.upperTolerance).toBe(0);
    expect(body.lowerTolerance).toBe(0);
  });

  it('sends empty body when only id is provided', async () => {
    z.request.mockResolvedValue(
      mockResponse(200, { id: INDICATOR_ID })
    );
    const bundle = createBundle({ id: INDICATOR_ID });
    await updateIndicator.operation.perform(z, bundle);
    const body = JSON.parse(
      ((z.request.mock.calls[0] as unknown[])[0] as Record<string, string>)
        .body
    );
    expect(body).toEqual({});
  });

  it('returns response data', async () => {
    const responseData = { id: INDICATOR_ID, title: 'Updated' };
    z.request.mockResolvedValue(mockResponse(200, responseData));
    const bundle = createBundle({
      id: INDICATOR_ID,
      title: 'Updated',
    });
    const result = await updateIndicator.operation.perform(z, bundle);
    expect(result).toEqual(responseData);
  });
});
