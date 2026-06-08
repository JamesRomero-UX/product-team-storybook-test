import dayjs from 'dayjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  getReviewStatus,
  getVersionStatusSortKey,
  REVIEW_DUE_WINDOW_DAYS,
} from './helpers';

describe('getReviewStatus', () => {
  const mockDate = new Date(Date.UTC(2025, 0, 15, 12, 0, 0)); // 2025-01-15

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(mockDate);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns not_set when nextReviewDate is null', () => {
    const result = getReviewStatus(null, false);
    expect(result).toEqual({ value: 'not_set', sortKey: 0 });
  });

  it('returns not_set when nextReviewDate is undefined', () => {
    const result = getReviewStatus(undefined, false);
    expect(result).toEqual({ value: 'not_set', sortKey: 0 });
  });

  it('returns not_set when isArchived is true regardless of date', () => {
    const futureDate = dayjs().add(60, 'days').toISOString();
    const result = getReviewStatus(futureDate, true);
    expect(result).toEqual({ value: 'not_set', sortKey: 0 });
  });

  it('returns not_set when isArchived is true and date is in past', () => {
    const pastDate = dayjs().subtract(30, 'days').toISOString();
    const result = getReviewStatus(pastDate, true);
    expect(result).toEqual({ value: 'not_set', sortKey: 0 });
  });

  it('returns overdue when nextReviewDate is yesterday', () => {
    const yesterday = dayjs().subtract(1, 'day').toISOString();
    const result = getReviewStatus(yesterday, false);
    expect(result).toEqual({ value: 'overdue', sortKey: 3 });
  });

  it('returns due when nextReviewDate is today', () => {
    const today = dayjs().toISOString();
    const result = getReviewStatus(today, false);
    expect(result).toEqual({ value: 'due', sortKey: 2 });
  });

  it(`returns due when nextReviewDate is today + ${REVIEW_DUE_WINDOW_DAYS} days`, () => {
    const atBoundary = dayjs()
      .add(REVIEW_DUE_WINDOW_DAYS, 'days')
      .toISOString();
    const result = getReviewStatus(atBoundary, false);
    expect(result).toEqual({ value: 'due', sortKey: 2 });
  });

  it(`returns not_due when nextReviewDate is today + ${REVIEW_DUE_WINDOW_DAYS + 1} days`, () => {
    const pastBoundary = dayjs()
      .add(REVIEW_DUE_WINDOW_DAYS + 1, 'days')
      .toISOString();
    const result = getReviewStatus(pastBoundary, false);
    expect(result).toEqual({ value: 'not_due', sortKey: 1 });
  });

  it('returns not_due when nextReviewDate is today + 60 days', () => {
    const in60Days = dayjs().add(60, 'days').toISOString();
    const result = getReviewStatus(in60Days, false);
    expect(result).toEqual({ value: 'not_due', sortKey: 1 });
  });

  it('returns overdue when nextReviewDate is 90 days ago', () => {
    const pastDate = dayjs().subtract(90, 'days').toISOString();
    const result = getReviewStatus(pastDate, false);
    expect(result).toEqual({ value: 'overdue', sortKey: 3 });
  });

  it('returns correct sort keys for ordering', () => {
    const notSet = getReviewStatus(null, false);
    const notDue = getReviewStatus(
      dayjs().add(60, 'days').toISOString(),
      false
    );
    const due = getReviewStatus(dayjs().toISOString(), false);
    const overdue = getReviewStatus(
      dayjs().subtract(1, 'day').toISOString(),
      false
    );

    expect(notSet.sortKey).toBeLessThan(notDue.sortKey);
    expect(notDue.sortKey).toBeLessThan(due.sortKey);
    expect(due.sortKey).toBeLessThan(overdue.sortKey);
  });
});

describe('getVersionStatusSortKey', () => {
  it('returns sort keys in order: Draft → Pending Approval → Published → Archived', () => {
    const draft = getVersionStatusSortKey('draft');
    const pendingApproval = getVersionStatusSortKey('pending_approval');
    const published = getVersionStatusSortKey('published');
    const archived = getVersionStatusSortKey('archived');

    expect(draft).toBeLessThan(pendingApproval);
    expect(pendingApproval).toBeLessThan(published);
    expect(published).toBeLessThan(archived);
  });

  it('returns -1 for null status', () => {
    expect(getVersionStatusSortKey(null)).toBe(-1);
  });

  it('returns -1 for undefined status', () => {
    expect(getVersionStatusSortKey(undefined)).toBe(-1);
  });

  it('returns -1 for unknown status value', () => {
    expect(getVersionStatusSortKey('unknown')).toBe(-1);
  });

  it('returns expected sort key values', () => {
    expect(getVersionStatusSortKey('draft')).toBe(0);
    expect(getVersionStatusSortKey('pending_approval')).toBe(1);
    expect(getVersionStatusSortKey('published')).toBe(2);
    expect(getVersionStatusSortKey('archived')).toBe(3);
  });
});
