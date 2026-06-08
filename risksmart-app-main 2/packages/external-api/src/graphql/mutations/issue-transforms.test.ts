import { describe, expect, it } from 'vitest';

import type {
  CreateIssueRequest,
  UpdateIssueRequest,
} from '../../schemas/issues/issue-mutate-request.schema';
import {
  toGraphqlCreateIssueInput,
  toGraphqlUpdateIssueInput,
} from './issue-transforms';

const baseCreateRequest: CreateIssueRequest = {
  title: 'Test Issue',
  description: 'A test issue',
  dateIdentified: '2024-01-15T00:00:00Z',
  dateOccurred: '2024-01-10T00:00:00Z',
  impactsCustomer: true,
  isExternalIssue: false,
  owners: ['provider|user-1'],
};

describe('toGraphqlCreateIssueInput', () => {
  it('should map a create request with all fields', () => {
    const result = toGraphqlCreateIssueInput({
      ...baseCreateRequest,
      type: 'issue',
    });

    expect(result).toEqual({
      Title: 'Test Issue',
      Details: 'A test issue',
      DateIdentified: '2024-01-15T00:00:00Z',
      DateOccurred: '2024-01-10T00:00:00Z',
      ImpactsCustomer: true,
      IsExternalIssue: false,
      Type: 'issue',
      OwnerUserIds: ['provider|user-1'],
      OwnerGroupIds: [],
      ContributorUserIds: [],
      ContributorGroupIds: [],
      TagTypeIds: [],
      DepartmentTypeIds: [],
      CustomAttributeData: null,
    });
  });

  it('should set description to null when undefined', () => {
    const result = toGraphqlCreateIssueInput({
      ...baseCreateRequest,
      description: undefined,
      type: 'issue',
    });

    expect(result.Details).toBeNull();
  });

  it('should set optional boolean fields to null when undefined', () => {
    const result = toGraphqlCreateIssueInput({
      ...baseCreateRequest,
      impactsCustomer: undefined,
      isExternalIssue: undefined,
      type: 'issue',
    });

    expect(result.ImpactsCustomer).toBeNull();
    expect(result.IsExternalIssue).toBeNull();
  });

  it('should include ownership fields from defaultGraphqlOwnershipFields', () => {
    const result = toGraphqlCreateIssueInput({
      ...baseCreateRequest,
      owners: ['user-1', 'user-2'],
      type: 'issue',
    });

    expect(result.OwnerUserIds).toEqual(['user-1', 'user-2']);
    expect(result.OwnerGroupIds).toEqual([]);
    expect(result.ContributorUserIds).toEqual([]);
    expect(result.ContributorGroupIds).toEqual([]);
    expect(result.TagTypeIds).toEqual([]);
    expect(result.DepartmentTypeIds).toEqual([]);
  });

  it('should pass through the type field', () => {
    const result = toGraphqlCreateIssueInput({
      ...baseCreateRequest,
      type: 'issue',
    });

    expect(result.Type).toBe('issue');
  });
});

describe('toGraphqlUpdateIssueInput', () => {
  const baseUpdateRequest: UpdateIssueRequest = {
    title: 'Updated Issue',
    description: 'Updated description',
    dateIdentified: '2024-02-15T00:00:00Z',
    dateOccurred: '2024-02-10T00:00:00Z',
    impactsCustomer: false,
    isExternalIssue: true,
    owners: ['provider|user-2'],
  };

  it('should NOT include Type field', () => {
    const result = toGraphqlUpdateIssueInput(baseUpdateRequest);

    expect(result).not.toHaveProperty('Type');
  });

  it('should NOT include Id or OriginalTimestamp', () => {
    const result = toGraphqlUpdateIssueInput(baseUpdateRequest);

    expect(result).not.toHaveProperty('Id');
    expect(result).not.toHaveProperty('OriginalTimestamp');
  });

  it('should map all base fields correctly', () => {
    const result = toGraphqlUpdateIssueInput(baseUpdateRequest);

    expect(result.Title).toBe('Updated Issue');
    expect(result.Details).toBe('Updated description');
    expect(result.DateIdentified).toBe('2024-02-15T00:00:00Z');
    expect(result.DateOccurred).toBe('2024-02-10T00:00:00Z');
    expect(result.ImpactsCustomer).toBe(false);
    expect(result.IsExternalIssue).toBe(true);
  });

  it('should include ownership fields', () => {
    const result = toGraphqlUpdateIssueInput(baseUpdateRequest);

    expect(result.OwnerUserIds).toEqual(['provider|user-2']);
    expect(result.OwnerGroupIds).toEqual([]);
  });

  it('should preserve existing ownership arrays when existingOwnership is provided', () => {
    const result = toGraphqlUpdateIssueInput(baseUpdateRequest, {
      ownerGroupIds: ['group-1'],
      contributorUserIds: ['contrib-1'],
      contributorGroupIds: ['cgroup-1'],
      tagTypeIds: ['tag-1'],
      departmentTypeIds: ['dept-1'],
    });

    expect(result.OwnerGroupIds).toEqual(['group-1']);
    expect(result.ContributorUserIds).toEqual(['contrib-1']);
    expect(result.ContributorGroupIds).toEqual(['cgroup-1']);
    expect(result.TagTypeIds).toEqual(['tag-1']);
    expect(result.DepartmentTypeIds).toEqual(['dept-1']);
  });
});
