import { ActionStatus } from '@risksmart-app/domain/src/types/consts/action-status';
import { describe, expect, it } from 'vitest';

import type {
  CreateActionRequest,
  UpdateActionRequest,
} from '../../schemas/actions/action-mutate-request.schema';
import {
  toGraphqlCreateActionInput,
  toGraphqlUpdateActionInput,
} from './action-transforms';

const baseRequest = {
  title: 'Test Action',
  status: ActionStatus.Open,
  dateRaised: '2024-01-10T00:00:00Z',
  dateDue: '2024-03-10T00:00:00Z',
  priority: 2,
  owners: ['provider|user-1'],
};

const mockCreateRequest: CreateActionRequest = {
  ...baseRequest,
  description: 'Action description',
  closedDate: null,
  parentId: null,
};

const mockUpdateRequest: UpdateActionRequest = {
  ...baseRequest,
  description: 'Updated description',
  closedDate: null,
};

const expectedOwnershipFields = {
  OwnerUserIds: ['provider|user-1'],
  OwnerGroupIds: [],
  ContributorUserIds: [],
  ContributorGroupIds: [],
  TagTypeIds: [],
  DepartmentTypeIds: [],
};

describe('toGraphqlCreateActionInput', () => {
  it('should map all fields to graphql variables', () => {
    const result = toGraphqlCreateActionInput(mockCreateRequest);

    expect(result).toEqual({
      Title: 'Test Action',
      Status: ActionStatus.Open,
      DateRaised: '2024-01-10T00:00:00Z',
      DateDue: '2024-03-10T00:00:00Z',
      Description: 'Action description',
      Priority: 2,
      ClosedDate: null,
      ParentId: null,
      CustomAttributeData: null,
      ...expectedOwnershipFields,
    });
  });

  it('should map parentId when provided', () => {
    const withParent: CreateActionRequest = {
      ...mockCreateRequest,
      parentId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    };

    const result = toGraphqlCreateActionInput(withParent);

    expect(result.ParentId).toBe('3fa85f64-5717-4562-b3fc-2c963f66afa6');
  });

  it('should set Description to null when nullish', () => {
    const result = toGraphqlCreateActionInput({
      ...mockCreateRequest,
      description: undefined,
    });

    expect(result.Description).toBeNull();
  });

  it('should set ClosedDate to null when nullish', () => {
    const result = toGraphqlCreateActionInput({
      ...mockCreateRequest,
      closedDate: undefined,
    });

    expect(result.ClosedDate).toBeNull();
  });
});

describe('toGraphqlUpdateActionInput', () => {
  it('should map all fields to graphql variables (excluding Id and OriginalTimestamp)', () => {
    const result = toGraphqlUpdateActionInput(mockUpdateRequest);

    expect(result).toEqual({
      Title: 'Test Action',
      Status: ActionStatus.Open,
      DateRaised: '2024-01-10T00:00:00Z',
      DateDue: '2024-03-10T00:00:00Z',
      Description: 'Updated description',
      Priority: 2,
      ClosedDate: null,
      CustomAttributeData: null,
      ...expectedOwnershipFields,
    });
  });

  it('should not include Id or OriginalTimestamp', () => {
    const result = toGraphqlUpdateActionInput(mockUpdateRequest);

    expect(result).not.toHaveProperty('Id');
    expect(result).not.toHaveProperty('OriginalTimestamp');
  });

  it('should set Description to null when nullish', () => {
    const result = toGraphqlUpdateActionInput({
      ...mockUpdateRequest,
      description: undefined,
    });

    expect(result.Description).toBeNull();
  });

  it('should set ClosedDate to null when nullish', () => {
    const result = toGraphqlUpdateActionInput({
      ...mockUpdateRequest,
      closedDate: undefined,
    });

    expect(result.ClosedDate).toBeNull();
  });

  it('should preserve existing ownership arrays when existingOwnership is provided', () => {
    const result = toGraphqlUpdateActionInput(mockUpdateRequest, {
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

  it('should use empty arrays when no existingOwnership is provided', () => {
    const result = toGraphqlUpdateActionInput(mockUpdateRequest);

    expect(result.OwnerGroupIds).toEqual([]);
    expect(result.ContributorUserIds).toEqual([]);
    expect(result.ContributorGroupIds).toEqual([]);
    expect(result.TagTypeIds).toEqual([]);
    expect(result.DepartmentTypeIds).toEqual([]);
  });
});
