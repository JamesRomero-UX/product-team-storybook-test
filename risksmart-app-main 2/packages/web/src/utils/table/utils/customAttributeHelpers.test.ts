import type { AltValueOption } from '@risksmart-app/form-configuration/src/types';
import { describe, expect, it } from 'vitest';

import { EMPTY_VALUE } from '@/utils/collectionUtils';

import { matchToArrayField, matchToField } from './customAttributeHelpers';

const AltValueOptions: AltValueOption[] = [
  {
    _tag: 'AltValueOption',
    AltValue: 'risk-1',
    Value: 'Risk One',
    GeneratedId: 'b7e2a9b2-1c4e-4f7a-8c2a-1a2b3c4d5e6f',
  },
  {
    _tag: 'AltValueOption',
    AltValue: 'risk-2',
    Value: 'Risk Two',
    GeneratedId: 'c8f3b1a3-2d5f-4e8b-9d3b-2b3c4d5e6f7a',
  },
  {
    _tag: 'AltValueOption',
    AltValue: 'risk-3',
    Value: 'Risk Three',
    GeneratedId: 'd9a4c2b4-3e6a-5f9c-0e4c-3c4d5e6f7a8b',
  },
];

describe('matchToField', () => {
  it('returns mapped value when options contains a correlating alt value', () => {
    const data = { risk: 'risk-1' };
    expect(matchToField(data, 'risk', AltValueOptions)).toBe('Risk One');
  });

  it('returns stored value when not found in options', () => {
    const data = { risk: 'unknown' };
    expect(matchToField(data, 'risk', AltValueOptions)).toBe('unknown');
  });

  it('returns EMPTY_VALUE when stored value is null', () => {
    expect(matchToField(null, 'risk', AltValueOptions)).toBe(EMPTY_VALUE);
  });

  it('returns EMPTY_VALUE when stored value is undefined', () => {
    const data = {};
    expect(matchToField(data, 'risk', AltValueOptions)).toBe(EMPTY_VALUE);
  });

  it('returns stored value when AltValueOptions is empty', () => {
    const data = { risk: 'risk-1' };
    expect(matchToField(data, 'risk', [])).toBe('risk-1');
  });

  it('returns a comma-separated string for array of stored values', () => {
    const data = {
      '1756731359098_multiselect': ['risk-1', 'risk-2'],
    };
    expect(
      matchToField(data, '1756731359098_multiselect', AltValueOptions)
    ).toBe('Risk One,Risk Two');
  });
});

describe('matchToArrayField', () => {
  it('returns mapped values for array of stored values', () => {
    const data = { risks: ['risk-1', 'risk-2'] };
    expect(matchToArrayField(data, 'risks', AltValueOptions)).toEqual([
      'Risk One',
      'Risk Two',
    ]);
  });

  it('returns stored values when not found in options', () => {
    const data = { risks: ['unknown', 'risk-2'] };
    expect(matchToArrayField(data, 'risks', AltValueOptions)).toEqual([
      'unknown',
      'Risk Two',
    ]);
  });

  it('returns empty array when data is null', () => {
    expect(matchToArrayField(null, 'risks', AltValueOptions)).toEqual([]);
  });

  it('returns empty array when data is empty object', () => {
    const data = {};
    expect(matchToArrayField(data, 'risks', AltValueOptions)).toEqual([]);
  });

  it('returns stored values when AltValueOptions is empty', () => {
    const data = { risks: ['risk-1', 'risk-2'] };
    expect(matchToArrayField(data, 'risks', [])).toEqual(['risk-1', 'risk-2']);
  });

  it('filters out null values from mapping', () => {
    const data = { risks: ['risk-1', null, 'risk-3'] };
    expect(matchToArrayField(data, 'risks', AltValueOptions)).toEqual([
      'Risk One',
      'Risk Three',
    ]);
  });

  it('returns empty array when stored value is null', () => {
    const data = { risks: null };
    expect(matchToArrayField(data, 'risks', AltValueOptions)).toEqual([]);
  });
});
