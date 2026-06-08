import { describe, expect, it } from 'vitest';

import {
  createIssueRequestSchema,
  updateIssueRequestSchema,
} from './issue-mutate-request.schema';

const validCreateRequest = {
  title: 'Test Issue',
  description: 'A test issue',
  dateIdentified: '2024-01-15T00:00:00Z',
  dateOccurred: '2024-01-10T00:00:00Z',
  impactsCustomer: true,
  isExternalIssue: false,
  owners: ['provider|user-1'],
};

describe('createIssueRequestSchema', () => {
  it('should accept a valid create request with all fields', () => {
    const result = createIssueRequestSchema.safeParse(validCreateRequest);
    expect(result.success).toBe(true);
  });

  it('should accept a request with only required fields', () => {
    const result = createIssueRequestSchema.safeParse({
      title: 'Test Issue',
      dateIdentified: '2024-01-15T00:00:00Z',
      dateOccurred: '2024-01-10T00:00:00Z',
      owners: ['provider|user-1'],
    });
    expect(result.success).toBe(true);
  });

  it('should reject when title is missing', () => {
    const { title: _, ...noTitle } = validCreateRequest;
    const result = createIssueRequestSchema.safeParse(noTitle);
    expect(result.success).toBe(false);
  });

  it('should reject when title is empty', () => {
    const result = createIssueRequestSchema.safeParse({
      ...validCreateRequest,
      title: '',
    });
    expect(result.success).toBe(false);
  });

  it('should reject when dateIdentified is missing', () => {
    const { dateIdentified: _, ...noDate } = validCreateRequest;
    const result = createIssueRequestSchema.safeParse(noDate);
    expect(result.success).toBe(false);
  });

  it('should reject when dateOccurred is missing', () => {
    const { dateOccurred: _, ...noDate } = validCreateRequest;
    const result = createIssueRequestSchema.safeParse(noDate);
    expect(result.success).toBe(false);
  });

  it('should reject when owners is missing', () => {
    const { owners: _, ...noOwners } = validCreateRequest;
    const result = createIssueRequestSchema.safeParse(noOwners);
    expect(result.success).toBe(false);
  });

  it('should reject when owners is empty', () => {
    const result = createIssueRequestSchema.safeParse({
      ...validCreateRequest,
      owners: [],
    });
    expect(result.success).toBe(false);
  });

  it('should accept optional description as null', () => {
    const result = createIssueRequestSchema.safeParse({
      ...validCreateRequest,
      description: null,
    });
    expect(result.success).toBe(true);
  });

  it('should accept optional impactsCustomer', () => {
    const result = createIssueRequestSchema.safeParse({
      ...validCreateRequest,
      impactsCustomer: true,
    });
    expect(result.success).toBe(true);
  });

  it('should accept optional isExternalIssue', () => {
    const result = createIssueRequestSchema.safeParse({
      ...validCreateRequest,
      isExternalIssue: false,
    });
    expect(result.success).toBe(true);
  });

  it('should reject invalid datetime format for dateIdentified', () => {
    const result = createIssueRequestSchema.safeParse({
      ...validCreateRequest,
      dateIdentified: 'not-a-date',
    });
    expect(result.success).toBe(false);
  });

  it('should reject invalid datetime format for dateOccurred', () => {
    const result = createIssueRequestSchema.safeParse({
      ...validCreateRequest,
      dateOccurred: '2024-13-01',
    });
    expect(result.success).toBe(false);
  });

  it('should accept datetime with offset', () => {
    const result = createIssueRequestSchema.safeParse({
      ...validCreateRequest,
      dateIdentified: '2024-01-15T10:30:00+05:00',
      dateOccurred: '2024-01-10T10:30:00-03:00',
    });
    expect(result.success).toBe(true);
  });
});

describe('updateIssueRequestSchema', () => {
  it('should accept a valid update request', () => {
    const result = updateIssueRequestSchema.safeParse(validCreateRequest);
    expect(result.success).toBe(true);
  });

  it('should reject when title is missing', () => {
    const { title: _, ...noTitle } = validCreateRequest;
    const result = updateIssueRequestSchema.safeParse(noTitle);
    expect(result.success).toBe(false);
  });

  it('should reject when owners is empty', () => {
    const result = updateIssueRequestSchema.safeParse({
      ...validCreateRequest,
      owners: [],
    });
    expect(result.success).toBe(false);
  });
});
