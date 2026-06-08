import type { Context } from 'aws-lambda';
import { stub } from 'src/testing/stub';
import { vi } from 'vitest';

import { handler } from './riskNotifier';

describe('riskNotifier', () => {
  it('throws an error when an error is thrown within the handler (i.e. errors are not discarded)', async () => {
    await expect(
      handler(
        // loads of missing data on event to generate an error!
        stub<Parameters<typeof handler>[0]>({}),
        stub<Context>({}),
        vi.fn()
      )
    ).rejects.toThrow();
  });
});
