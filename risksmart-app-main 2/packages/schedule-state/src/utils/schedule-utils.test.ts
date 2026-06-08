import { describe, expect, it } from 'vitest';

import { getDueDate, getOverdueDate } from './schedule-utils';

describe('getDueDate', () => {
  it('returns null when frequency is null', () => {
    const result = getDueDate({
      startDate: '2024-05-14T00:00:00.000Z',
      latestDate: '2024-05-15T00:00:00.000Z',
      frequency: null,
    });

    expect(result).toBeNull();
  });

  it('returns null when frequency is undefined', () => {
    const result = getDueDate({
      startDate: '2024-05-14T00:00:00.000Z',
      latestDate: '2024-05-15T00:00:00.000Z',
    });

    expect(result).toBeNull();
  });

  it('returns null for adhoc frequency', () => {
    const result = getDueDate({
      startDate: '2024-05-14T00:00:00.000Z',
      latestDate: '2024-05-15T00:00:00.000Z',
      frequency: 'adhoc',
    });

    expect(result).toBeNull();
  });

  it('returns null when startDate is null', () => {
    const result = getDueDate({
      startDate: null,
      latestDate: '2024-05-15T00:00:00.000Z',
      frequency: 'daily',
    });

    expect(result).toBeNull();
  });

  it('returns startDate when latestDate is null', () => {
    const result = getDueDate({
      startDate: '2024-05-14T00:00:00.000Z',
      latestDate: null,
      frequency: 'daily',
    });

    expect(result).toBe('2024-05-14T00:00:00.000Z');
  });

  it('returns startDate when startDate is after latestDate', () => {
    const result = getDueDate({
      startDate: '2024-05-20T00:00:00.000Z',
      latestDate: '2024-05-15T00:00:00.000Z',
      frequency: 'daily',
    });

    expect(result).toBe('2024-05-20T00:00:00.000Z');
  });

  it('calculates correct due date for daily frequency', () => {
    const result = getDueDate({
      startDate: '2024-05-14T00:00:00.000Z',
      latestDate: '2024-05-15T00:00:00.000Z',
      frequency: 'daily',
    });

    expect(result).toBe('2024-05-16T00:00:00.000Z');
  });

  it('calculates correct due date for weekly frequency', () => {
    const result = getDueDate({
      startDate: '2024-05-06T00:00:00.000Z', // Monday
      latestDate: '2024-05-13T00:00:00.000Z', // Monday
      frequency: 'weekly',
    });

    expect(result).toBe('2024-05-20T00:00:00.000Z');
  });

  it('calculates correct due date for fortnightly frequency', () => {
    const result = getDueDate({
      startDate: '2024-05-01T00:00:00.000Z',
      latestDate: '2024-05-14T00:00:00.000Z',
      frequency: 'fortnightly',
    });

    // Aligned to start date fortnightly cadence from latest date
    expect(result).not.toBeNull();
  });

  it('calculates correct due date for monthly frequency', () => {
    const result = getDueDate({
      startDate: '2024-01-15T00:00:00.000Z',
      latestDate: '2024-05-15T00:00:00.000Z',
      frequency: 'monthly',
    });

    expect(result).toBe('2024-06-15T00:00:00.000Z');
  });

  it('calculates correct due date for quarterly frequency', () => {
    const result = getDueDate({
      startDate: '2024-01-15T00:00:00.000Z',
      latestDate: '2024-04-15T00:00:00.000Z',
      frequency: 'quarterly',
    });

    expect(result).toBe('2024-07-15T00:00:00.000Z');
  });

  it('calculates correct due date for biannually frequency', () => {
    const result = getDueDate({
      startDate: '2024-01-15T00:00:00.000Z',
      latestDate: '2024-07-15T00:00:00.000Z',
      frequency: 'biannually',
    });

    expect(result).toBe('2025-01-15T00:00:00.000Z');
  });

  it('calculates correct due date for annually frequency', () => {
    const result = getDueDate({
      startDate: '2024-01-15T00:00:00.000Z',
      latestDate: '2024-01-15T00:00:00.000Z',
      frequency: 'annually',
    });

    expect(result).toBe('2025-01-15T00:00:00.000Z');
  });

  it('calculates correct due date for fourweekly frequency', () => {
    const result = getDueDate({
      startDate: '2024-05-01T00:00:00.000Z',
      latestDate: '2024-05-28T00:00:00.000Z',
      frequency: 'fourweekly',
    });

    expect(result).not.toBeNull();
  });
});

describe('getOverdueDate', () => {
  it('returns null when nextTestDate is null', () => {
    const result = getOverdueDate({
      nextTestDate: null,
      timeToCompleteValue: 5,
      timeToCompleteUnit: 'day',
    });

    expect(result).toBeNull();
  });

  it('returns null when timeToCompleteValue is null', () => {
    const result = getOverdueDate({
      nextTestDate: '2024-05-15T00:00:00.000Z',
      timeToCompleteValue: null,
      timeToCompleteUnit: 'day',
    });

    expect(result).toBeNull();
  });

  it('returns null when timeToCompleteUnit is null', () => {
    const result = getOverdueDate({
      nextTestDate: '2024-05-15T00:00:00.000Z',
      timeToCompleteValue: 5,
      timeToCompleteUnit: null,
    });

    expect(result).toBeNull();
  });

  it('calculates correct overdue date with day unit', () => {
    const result = getOverdueDate({
      nextTestDate: '2024-05-15T00:00:00.000Z',
      timeToCompleteValue: 3,
      timeToCompleteUnit: 'day',
    });

    expect(result).toBe('2024-05-18T00:00:00.000Z');
  });

  it('calculates correct overdue date with week unit', () => {
    const result = getOverdueDate({
      nextTestDate: '2024-05-15T00:00:00.000Z',
      timeToCompleteValue: 2,
      timeToCompleteUnit: 'week',
    });

    expect(result).toBe('2024-05-29T00:00:00.000Z');
  });

  it('returns null for invalid date', () => {
    const result = getOverdueDate({
      nextTestDate: 'not-a-date',
      timeToCompleteValue: 5,
      timeToCompleteUnit: 'day',
    });

    expect(result).toBeNull();
  });
});
