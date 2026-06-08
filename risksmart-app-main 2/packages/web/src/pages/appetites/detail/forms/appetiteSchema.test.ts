import { vi } from 'vitest';

import type { AppetiteFormFieldsData } from './appetiteSchema';
import { getAppetiteSchema } from './appetiteSchema';

describe('appetiteSchema', () => {
  const appetite: AppetiteFormFieldsData = {
    AppetiteType: 'risk',
    UpperAppetite: 20,
    EffectiveDate: '2024-01-01',
    files: [],
  };

  const mockDate = new Date(Date.UTC(2024, 1, 1, 0, 0, 0));

  beforeEach(() => {
    vi.resetAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(mockDate);
  });

  it('does not allow effective dates that are in the future', () => {
    const AppetiteSchema = getAppetiteSchema();

    const result = AppetiteSchema.safeParse({
      ...appetite,
      EffectiveDate: '2024-02-02',
    });

    expect(result.success).toEqual(false);
    expect(!result.success && result.error.errors).toEqual([
      {
        code: 'custom',
        message: 'Date cannot be in the future',
        path: ['EffectiveDate'],
      },
    ]);
  });

  it('allows effective dates in the past', () => {
    const AppetiteSchema = getAppetiteSchema();

    const result = AppetiteSchema.safeParse({
      ...appetite,
      EffectiveDate: '2024-01-01',
    });

    expect(result.success).toEqual(true);
  });
});
