import { describe, expect, it } from 'vitest';

import { sortByDateDesc } from '../sorting';

interface Item {
  date?: string;
  timestamp?: string;
  [k: string]: unknown;
}

const item = (date?: string, timestamp?: string): Item => ({ date, timestamp });

describe('sortByDateDesc', () => {
  describe('null/undefined items', () => {
    it('returns 0 when both items are null', () => {
      expect(sortByDateDesc(null, null, 'date', 'timestamp')).toBe(0);
    });

    it('returns 0 when both items are undefined', () => {
      expect(sortByDateDesc(undefined, undefined, 'date', 'timestamp')).toBe(0);
    });

    it('returns 0 when a is null and b is undefined', () => {
      expect(sortByDateDesc(null, undefined, 'date', 'timestamp')).toBe(0);
    });
  });

  describe('single-sided date presence', () => {
    it.each([
      [
        'a has date, b does not — a sorts first (returns -1)',
        item('2024-01-01'),
        item(),
        -1,
      ],
      [
        'b has date, a does not — b sorts first (returns 1)',
        item(),
        item('2024-01-01'),
        1,
      ],
    ])('%s', (_label, a, b, expected) => {
      expect(sortByDateDesc(a, b, 'date', 'timestamp')).toBe(expected);
    });
  });

  describe('both dates present', () => {
    it('returns positive when b date is later than a date (b sorts first)', () => {
      const result = sortByDateDesc(
        item('2024-01-01'),
        item('2024-01-02'),
        'date',
        'timestamp'
      );
      expect(result).toBeGreaterThan(0);
    });

    it('returns negative when a date is later than b date (a sorts first)', () => {
      const result = sortByDateDesc(
        item('2024-01-02'),
        item('2024-01-01'),
        'date',
        'timestamp'
      );
      expect(result).toBeLessThan(0);
    });

    it('falls through to timestamp comparison when dates are equal', () => {
      const a = item('2024-01-01', '2024-01-01T10:00:00Z');
      const b = item('2024-01-01', '2024-01-01T11:00:00Z');
      // b timestamp is later → positive (b sorts first)
      expect(sortByDateDesc(a, b, 'date', 'timestamp')).toBeGreaterThan(0);
    });

    it('returns 0 when dates are equal and no timestamps', () => {
      expect(
        sortByDateDesc(
          item('2024-01-01'),
          item('2024-01-01'),
          'date',
          'timestamp'
        )
      ).toBe(0);
    });
  });

  describe('single-sided timestamp presence (no dates)', () => {
    it.each([
      [
        'a has timestamp, b does not — a sorts first (returns -1)',
        item(undefined, '2024-01-01T10:00:00Z'),
        item(),
        -1,
      ],
      [
        'b has timestamp, a does not — b sorts first (returns 1)',
        item(),
        item(undefined, '2024-01-01T10:00:00Z'),
        1,
      ],
    ])('%s', (_label, a, b, expected) => {
      expect(sortByDateDesc(a, b, 'date', 'timestamp')).toBe(expected);
    });
  });

  describe('both timestamps present, no dates', () => {
    it('returns positive when b timestamp is later than a (b sorts first)', () => {
      const result = sortByDateDesc(
        item(undefined, '2024-01-01T09:00:00Z'),
        item(undefined, '2024-01-01T11:00:00Z'),
        'date',
        'timestamp'
      );
      expect(result).toBeGreaterThan(0);
    });

    it('returns negative when a timestamp is later than b (a sorts first)', () => {
      const result = sortByDateDesc(
        item(undefined, '2024-01-01T11:00:00Z'),
        item(undefined, '2024-01-01T09:00:00Z'),
        'date',
        'timestamp'
      );
      expect(result).toBeLessThan(0);
    });

    it('returns 0 when both timestamps are equal', () => {
      expect(
        sortByDateDesc(
          item(undefined, '2024-01-01T10:00:00Z'),
          item(undefined, '2024-01-01T10:00:00Z'),
          'date',
          'timestamp'
        )
      ).toBe(0);
    });
  });

  describe('both dates and timestamps absent', () => {
    it('returns 0 when neither item has date or timestamp', () => {
      expect(sortByDateDesc(item(), item(), 'date', 'timestamp')).toBe(0);
    });
  });

  describe('invalid date strings treated as absent', () => {
    it('invalid a date vs valid b date — b sorts first (returns > 0)', () => {
      expect(
        sortByDateDesc(
          item('not-a-date'),
          item('2024-01-01'),
          'date',
          'timestamp'
        )
      ).toBeGreaterThan(0);
    });

    it('valid a date vs invalid b date — a sorts first (returns < 0)', () => {
      expect(
        sortByDateDesc(
          item('2024-01-01'),
          item('not-a-date'),
          'date',
          'timestamp'
        )
      ).toBeLessThan(0);
    });

    it('both invalid dates — returns 0', () => {
      expect(
        sortByDateDesc(
          item('not-a-date'),
          item('also-invalid'),
          'date',
          'timestamp'
        )
      ).toBe(0);
    });

    it('invalid date falls through to timestamp comparison', () => {
      const a = item('not-a-date', '2024-01-01T09:00:00Z');
      const b = item('not-a-date', '2024-01-01T11:00:00Z');
      // b timestamp is later → positive (b sorts first)
      expect(sortByDateDesc(a, b, 'date', 'timestamp')).toBeGreaterThan(0);
    });
  });
});
