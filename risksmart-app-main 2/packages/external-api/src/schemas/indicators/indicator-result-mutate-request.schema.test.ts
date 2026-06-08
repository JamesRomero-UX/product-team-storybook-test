import { describe, expect, it } from 'vitest';

import {
  createIndicatorResultRequestSchema,
  updateIndicatorResultRequestSchema,
} from './indicator-result-mutate-request.schema';

const validNumInput = {
  resultDate: '2024-01-15T10:30:00.000Z',
  description: 'Q1 result',
  targetValueNum: 42.5,
};

const validTxtInput = {
  resultDate: '2024-01-15T10:30:00.000Z',
  description: 'Q1 result',
  targetValueTxt: 'On track',
};

describe('createIndicatorResultRequestSchema', () => {
  it('should accept valid input with targetValueNum only', () => {
    const result = createIndicatorResultRequestSchema.safeParse(validNumInput);
    expect(result.success).toBe(true);
  });

  it('should accept valid input with targetValueTxt only', () => {
    const result = createIndicatorResultRequestSchema.safeParse(validTxtInput);
    expect(result.success).toBe(true);
  });

  it('should accept valid input with only required fields', () => {
    const result = createIndicatorResultRequestSchema.safeParse({
      resultDate: '2024-01-15T10:30:00+00:00',
    });
    expect(result.success).toBe(true);
  });

  it('should accept null optional fields', () => {
    const result = createIndicatorResultRequestSchema.safeParse({
      resultDate: '2024-01-15T10:30:00.000Z',
      description: null,
      targetValueNum: null,
      targetValueTxt: null,
    });
    expect(result.success).toBe(true);
  });

  it('should reject when both targetValueNum and targetValueTxt are set', () => {
    const result = createIndicatorResultRequestSchema.safeParse({
      resultDate: '2024-01-15T10:30:00.000Z',
      targetValueNum: 42.5,
      targetValueTxt: 'On track',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain(
        'Cannot set both targetValueNum and targetValueTxt'
      );
    }
  });

  it('should reject missing resultDate', () => {
    const result = createIndicatorResultRequestSchema.safeParse({
      description: 'Missing date',
    });
    expect(result.success).toBe(false);
  });

  it('should reject invalid resultDate format', () => {
    const result = createIndicatorResultRequestSchema.safeParse({
      resultDate: 'not-a-date',
    });
    expect(result.success).toBe(false);
  });

  it('should reject non-number targetValueNum', () => {
    const result = createIndicatorResultRequestSchema.safeParse({
      resultDate: '2024-01-15T10:30:00.000Z',
      targetValueNum: 'not-a-number',
    });
    expect(result.success).toBe(false);
  });
});

describe('updateIndicatorResultRequestSchema', () => {
  it('should accept valid input with targetValueNum only', () => {
    const result = updateIndicatorResultRequestSchema.safeParse(validNumInput);
    expect(result.success).toBe(true);
  });

  it('should accept valid input with targetValueTxt only', () => {
    const result = updateIndicatorResultRequestSchema.safeParse(validTxtInput);
    expect(result.success).toBe(true);
  });

  it('should accept valid input with only required fields', () => {
    const result = updateIndicatorResultRequestSchema.safeParse({
      resultDate: '2024-01-15T10:30:00.000Z',
    });
    expect(result.success).toBe(true);
  });

  it('should reject when both targetValueNum and targetValueTxt are set', () => {
    const result = updateIndicatorResultRequestSchema.safeParse({
      resultDate: '2024-01-15T10:30:00.000Z',
      targetValueNum: 42.5,
      targetValueTxt: 'On track',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain(
        'Cannot set both targetValueNum and targetValueTxt'
      );
    }
  });

  it('should reject missing resultDate', () => {
    const result = updateIndicatorResultRequestSchema.safeParse({
      description: 'Missing date',
    });
    expect(result.success).toBe(false);
  });
});
