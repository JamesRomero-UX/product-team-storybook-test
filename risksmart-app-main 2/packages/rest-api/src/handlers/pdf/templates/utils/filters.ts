// Reusable helpers for rendering filter queries and tokens into readable text

export type FilterLabelsMap = Record<string, string>;

export interface FilterToken {
  propertyKey?: string;
  operator: string;
  value: unknown;
}

export interface FilterGroup {
  operation: 'and' | 'or';
  tokens: FilterToken[];
}

export interface FilterQuery {
  operation?: 'and' | 'or';
  tokens?: FilterToken[];
  tokenGroups?: Array<FilterToken | FilterGroup>;
}

// Convert a value (string, numbers, relative/absolute date objects, key/value objects) to display text
const valueToString = (v: unknown): string => {
  if (v === null || v === undefined) {
    return '';
  }
  if (typeof v !== 'object') {
    return String(v);
  }

  const obj = v as Record<string, unknown> & { type?: string };

  // Relative date like { type: 'relative', unit: 'day', amount: -7 }
  if (obj.type === 'relative') {
    const unit = String(obj.unit ?? 'day');
    const amount = Number(obj.amount ?? 0);
    if (Number.isFinite(amount)) {
      if (amount === 0) {
        return `this ${unit}`;
      }
      const abs = Math.abs(amount);

      return amount < 0
        ? `last ${abs} ${unit}${abs === 1 ? '' : 's'}`
        : `next ${abs} ${unit}${abs === 1 ? '' : 's'}`;
    }
  }

  // Absolute date like { type: 'absolute', startDate: '2024-01-01', endDate: '2024-12-31' }
  if (obj.type === 'absolute') {
    const start = obj.startDate as string | null | undefined;
    const end = obj.endDate as string | null | undefined;
    if (start && end) {
      return `${start} to ${end}`;
    }
    if (start) {
      return `after ${start}`;
    }
    if (end) {
      return `before ${end}`;
    }
  }

  // Keyed value like { key: 'Open' }
  if ('key' in obj && typeof obj.key === 'string') {
    return String(obj.key);
  }

  try {
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
};

const tokenToString = (
  t: FilterToken,
  labels?: FilterLabelsMap,
  operatorMap?: Record<string, string>
): string => {
  const lhsKey = t.propertyKey ? t.propertyKey : 'value';
  const lhs = (labels && labels[lhsKey]) || lhsKey;
  const op = operatorMap?.[t.operator] ?? t.operator;
  const s = `${lhs} ${op} ${valueToString(t.value)}`.trim();

  return s;
};

const groupToString = (
  g: FilterGroup,
  labels?: FilterLabelsMap,
  operatorMap?: Record<string, string>
): string => {
  const op = (g.operation || 'and').toUpperCase();
  const parts = (g.tokens || []).map((t) =>
    tokenToString(t, labels, operatorMap)
  );
  if (parts.length) {
    return `(${parts.join(` ${op} `)})`;
  }

  return '';
};

/**
 * Build a human-readable filter expression (without a leading "Filters:" prefix).
 * Returns undefined if nothing meaningful is present.
 */
export const buildReadableFiltersText = (
  query: unknown,
  labels?: FilterLabelsMap,
  operatorMap?: Record<string, string>
): string | undefined => {
  if (!query || typeof query !== 'object') {
    return undefined;
  }

  const q = query as FilterQuery;
  const mainOp = (q.operation || 'and').toUpperCase();
  const topTokens = (q.tokens || []).map((t) =>
    tokenToString(t, labels, operatorMap)
  );
  const groupParts = (q.tokenGroups || []).map((tg) =>
    typeof (tg as FilterGroup).operation === 'string' &&
    Array.isArray((tg as FilterGroup).tokens)
      ? groupToString(tg as FilterGroup, labels, operatorMap)
      : tokenToString(tg as FilterToken, labels, operatorMap)
  );

  const allParts = [...topTokens, ...groupParts].filter((s) => s && s.length);
  if (!allParts.length) {
    return undefined;
  }

  return allParts.join(` ${mainOp} `);
};

/**
 * Build a single-line "chips" style text from applied filters.
 * Returns undefined if no filters provided.
 */
export const buildAppliedFiltersText = (
  appliedFilters?: Array<{ property: string; operator: string; value: unknown }>
): string | undefined => {
  if (!appliedFilters?.length) {
    return undefined;
  }
  const parts = appliedFilters.map(
    (f) => `${f.property} ${f.operator} ${valueToString(f.value)}`
  );

  return parts.join(' • ');
};
