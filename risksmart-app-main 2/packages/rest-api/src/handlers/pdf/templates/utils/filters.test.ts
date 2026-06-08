import { describe, expect, it } from 'vitest';

import {
  buildAppliedFiltersText,
  buildReadableFiltersText,
  type FilterQuery,
} from './filters';

describe('filters utils', () => {
  it('builds readable text for simple tokens', () => {
    const q: FilterQuery = {
      operation: 'and',
      tokens: [
        { propertyKey: 'status', operator: 'equals', value: { key: 'Open' } },
        { propertyKey: 'owner', operator: 'contains', value: 'Alice' },
      ],
    };
    const txt = buildReadableFiltersText(q, {
      status: 'Status',
      owner: 'Owner',
    });
    expect(txt).toBe('Status equals Open AND Owner contains Alice');
  });

  it('supports groups and operator precedence', () => {
    const q: FilterQuery = {
      operation: 'or',
      tokens: [{ propertyKey: 'tier', operator: '>=', value: 3 }],
      tokenGroups: [
        {
          operation: 'and',
          tokens: [
            {
              propertyKey: 'status',
              operator: 'equals',
              value: { key: 'Open' },
            },
            { propertyKey: 'owner', operator: 'contains', value: 'Bob' },
          ],
        },
      ],
    };
    const txt = buildReadableFiltersText(q, {
      tier: 'Risk tier',
      status: 'Status',
      owner: 'Owner',
    });
    expect(txt).toBe(
      'Risk tier >= 3 OR (Status equals Open AND Owner contains Bob)'
    );
  });

  it('renders relative and absolute date values', () => {
    const q: FilterQuery = {
      tokens: [
        {
          propertyKey: 'due',
          operator: 'in',
          value: { type: 'relative', unit: 'day', amount: -7 },
        },
        {
          propertyKey: 'created',
          operator: 'between',
          value: {
            type: 'absolute',
            startDate: '2024-01-01',
            endDate: '2024-01-31',
          },
        },
      ],
    };
    const txt = buildReadableFiltersText(q, { due: 'Due', created: 'Created' });
    expect(txt).toBe(
      'Due in last 7 days AND Created between 2024-01-01 to 2024-01-31'
    );
  });

  it('returns undefined for empty queries', () => {
    const txt = buildReadableFiltersText({ tokens: [] });
    expect(txt).toBeUndefined();
  });

  it('builds chips text for applied filters', () => {
    const chips = buildAppliedFiltersText([
      { property: 'Owner', operator: 'is', value: 'Alice' },
      { property: 'Status', operator: 'equals', value: { key: 'Open' } },
    ]);
    expect(chips).toBe('Owner is Alice • Status equals Open');
  });

  it('returns undefined for empty applied filters', () => {
    const chips = buildAppliedFiltersText([]);
    expect(chips).toBeUndefined();
  });
});
