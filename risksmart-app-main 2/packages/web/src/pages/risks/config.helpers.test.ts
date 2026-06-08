import { describe, expect, it } from 'vitest';

import {
  exportStyleFromLatestHistory,
  exportStyleFromOption,
  exportStyleFromValue,
  styleFromOption,
} from '@/utils/table/pdfExportStyles';

import type { RiskRegisterFields } from './types';

// Helper to construct a RiskRegisterFields with only the parts we need for tests
const mkRow = (partial: Partial<RiskRegisterFields>): RiskRegisterFields =>
  partial as unknown as RiskRegisterFields;

describe('PDF export cell style helpers', () => {
  it('styleFromOption returns getColorStyles when color present, else null', () => {
    const yes = styleFromOption({ color: 'red' });
    const no1 = styleFromOption(null);
    const no2 = styleFromOption({});

    expect(yes).toBeTruthy();
    expect(typeof yes?.backgroundColor).toBe('string');
    expect(no1).toBeNull();
    expect(no2).toBeNull();
  });

  it('exportStyleFromOption uses the optionSelector result', () => {
    const alwaysGreen = exportStyleFromOption(() => ({ color: 'green' }));
    const noColor = exportStyleFromOption(() => ({}));

    expect(alwaysGreen(mkRow({}))?.backgroundColor).toBeDefined();
    expect(noColor(mkRow({}))).toBeNull();
  });

  it('exportStyleFromValue maps value via optionGetter', () => {
    const fromConst = exportStyleFromValue(
      () => 'blue',
      (v: string) => ({ color: v })
    );
    const fromNull = exportStyleFromValue(
      () => null,
      (v: string | null) => (v ? { color: v } : {})
    );

    expect(fromConst(mkRow({}))?.backgroundColor).toBeDefined();
    expect(fromNull(mkRow({}))).toBeNull();
  });

  it('exportStyleFromLatestHistory picks latest non-null rating by date', () => {
    const styleFn = exportStyleFromLatestHistory(
      () => [
        { rating: 'yellow', testDate: '2023-01-01' },
        { rating: null, testDate: '2024-01-01' },
        { rating: 'purple', testDate: '2025-01-01' },
      ],
      (v: string) => ({ color: v })
    );

    const out = styleFn(mkRow({}));
    expect(out?.backgroundColor).toBeDefined();
  });

  it('exportStyleFromLatestHistory returns null when no ratings', () => {
    const styleFn = exportStyleFromLatestHistory(
      () => [],
      (v: string) => ({ color: v })
    );

    expect(styleFn(mkRow({}))).toBeNull();
  });
});
