import {
  buildControl,
  buildDepartmentType,
  buildIssue,
  buildIssueAssessment,
  buildIssueParent,
  buildTagType,
  buildUserGroup,
  insertControl,
  insertDepartmentType,
  insertIssue,
  insertIssueAssessment,
  insertIssueParent,
  insertTagType,
  insertUserGroup,
} from '@risksmart-app/test-data';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

import { createTestContext } from '../../utils/test-context';

describe('Issue', () => {
  const contexts: Awaited<ReturnType<typeof createTestContext>>[] = [];

  afterAll(async () => {
    await Promise.all(contexts.map((c) => c.cleanup()));
  });

  it('issueById query should return correct data', async () => {
    const ctx = await createTestContext();
    contexts.push(ctx);
    const { orgKey, userId, trpcClient } = ctx;

    const { Meta, OrgKey, ...insertedIssueProps } = buildIssue(orgKey, userId);
    await insertIssue({ Meta, OrgKey, ...insertedIssueProps });

    const response = await trpcClient.frontend.issue.issueById.query({
      id: insertedIssueProps.Id!,
    });

    expect(response.length).toEqual(1);
    expect(response[0]).toEqual(
      expect.objectContaining({
        ...insertedIssueProps,
        ancestorContributors: [],
        contributorGroups: [],
        contributors: [],
        departments: [],
        files: [],
        ownerGroups: [],
        owners: [],
        tags: [],
      })
    );
  });

  it('register query should return correct data', async () => {
    const ctx = await createTestContext();
    contexts.push(ctx);
    const { orgKey, userId, trpcClient } = ctx;

    const { Meta, OrgKey, ...insertedIssueProps } = buildIssue(orgKey, userId);
    await insertIssue({ Meta, OrgKey, ...insertedIssueProps });
    await insertIssue(buildIssue(orgKey, userId));

    const response = await trpcClient.frontend.issue.register.query({
      issueType: 'issue',
    });

    expect(response.issue.length).toEqual(2);
    expect(response.issue).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          ...insertedIssueProps,
          contributorGroups: [],
          contributors: [],
          departments: [],
          ownerGroups: [],
          owners: [],
          tags: [],
        }),
      ])
    );
  });

  it('issuesByParentId query should return correct data', async () => {
    const ctx = await createTestContext();
    contexts.push(ctx);
    const { orgKey, userId, trpcClient } = ctx;

    // Create a parent issue
    const parentIssue = buildIssue(orgKey, userId);
    await insertIssue(parentIssue);

    // Create two child issues linked to the parent
    const { Meta, OrgKey, ...childIssue1Props } = buildIssue(orgKey, userId);
    await insertIssue({ Meta, OrgKey, ...childIssue1Props });
    await insertIssueParent(
      buildIssueParent({
        orgkey: orgKey,
        userId,
        issueId: childIssue1Props.Id!,
        parentId: parentIssue.Id!,
      })
    );

    const childIssue2 = buildIssue(orgKey, userId);
    await insertIssue(childIssue2);
    await insertIssueParent(
      buildIssueParent({
        orgkey: orgKey,
        userId,
        issueId: childIssue2.Id!,
        parentId: parentIssue.Id!,
      })
    );

    const response = await trpcClient.frontend.issue.issuesByParentId.query({
      parentId: parentIssue.Id!,
      type: 'issue',
    });

    expect(response.length).toEqual(2);
    expect(response).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          ...childIssue1Props,
          assessment: null,
          contributorGroups: [],
          contributors: [],
          departments: [],
          ownerGroups: [],
          owners: [],
          tags: [],
        }),
      ])
    );
  });

  it('issueAssessmentByParentId query should return correct data', async () => {
    const ctx = await createTestContext();
    contexts.push(ctx);
    const { orgKey, userId, trpcClient } = ctx;

    // Create a parent issue
    const parentIssue = buildIssue(orgKey, userId);
    await insertIssue(parentIssue);

    // Create issue assessment for the parent issue
    const {
      Meta: assessmentMeta,
      OrgKey: assessmentOrgKey,
      ...assessmentProps
    } = buildIssueAssessment({
      orgkey: orgKey,
      userId,
      parentIssueId: parentIssue.Id!,
    });
    await insertIssueAssessment({
      Meta: assessmentMeta,
      OrgKey: assessmentOrgKey,
      ...assessmentProps,
    });

    // Create a parent relationship for the issue
    const grandParentIssue = buildIssue(orgKey, userId);
    await insertIssue(grandParentIssue);
    await insertIssueParent(
      buildIssueParent({
        orgkey: orgKey,
        userId,
        issueId: parentIssue.Id!,
        parentId: grandParentIssue.Id!,
      })
    );

    const response =
      await trpcClient.frontend.issue.issueAssessmentByParentId.query({
        parentIssueId: parentIssue.Id!,
      });

    // Verify issue_assessment data
    expect(response.issue_assessment.length).toEqual(1);
    expect(response.issue_assessment[0]).toEqual(
      expect.objectContaining({
        ...assessmentProps,
        certifiedIndividual: null,
        departments: [],
        policyOwner: null,
      })
    );

    // Verify issue data (owners and tags)
    expect(response.issue.length).toEqual(1);
    expect(response.issue[0]).toEqual(
      expect.objectContaining({
        Id: parentIssue.Id,
        owners: [],
        tags: [],
      })
    );

    // Verify issue_parent data
    expect(response.issue_parent.length).toEqual(1);
    expect(response.issue_parent[0]).toEqual(
      expect.objectContaining({
        IssueId: parentIssue.Id,
        ParentId: grandParentIssue.Id,
      })
    );
  });

  describe('insert', () => {
    let context: Awaited<ReturnType<typeof createTestContext>>;

    beforeEach(async () => {
      context = await createTestContext();
      contexts.push(context);
    });

    it('should insert an issue with required fields only', async () => {
      const { trpcClient } = context;

      const response = await trpcClient.frontend.issue.insert.mutate({
        Title: 'Required fields only',
        DateOccurred: '2025-01-15T10:00:00.000Z',
        DateIdentified: '2025-01-15T10:00:00.000Z',
        Type: 'issue',
      });

      expect(response.Id).toBeDefined();
    });

    it('should insert an issue with all optional fields', async () => {
      const { trpcClient } = context;

      const response = await trpcClient.frontend.issue.insert.mutate({
        Title: 'All optional fields',
        DateOccurred: '2025-01-10T08:00:00.000Z',
        DateIdentified: '2025-01-15T10:00:00.000Z',
        Type: 'issue',
        Details: 'A detailed description of the issue',
        ImpactsCustomer: true,
        IsExternalIssue: false,
        CustomAttributeData: { customField: 'value', number: 42 },
        Meta: { source: 'test' },
      });

      expect(response.Id).toBeDefined();
    });

    it('should insert an issue with null optional fields', async () => {
      const { trpcClient } = context;

      const response = await trpcClient.frontend.issue.insert.mutate({
        Title: 'Null optional fields',
        DateOccurred: '2025-01-15T10:00:00.000Z',
        DateIdentified: '2025-01-15T10:00:00.000Z',
        Type: 'issue',
        ParentId: null,
        Details: null,
        ImpactsCustomer: null,
        IsExternalIssue: null,
        CustomAttributeData: null,
        Meta: null,
      });

      expect(response.Id).toBeDefined();
    });

    it('should insert an issue with a valid parent', async () => {
      const { orgKey, userId, trpcClient } = context;

      const parentControl = buildControl(orgKey, userId);
      await insertControl(parentControl);

      const response = await trpcClient.frontend.issue.insert.mutate({
        Title: 'Child issue with control parent',
        DateOccurred: '2025-01-15T10:00:00.000Z',
        DateIdentified: '2025-01-15T10:00:00.000Z',
        Type: 'issue',
        ParentId: parentControl.Id!,
      });

      expect(response.Id).toBeDefined();
    });

    it('should insert an issue with relationship arrays', async () => {
      const { userId, trpcClient } = context;

      const response = await trpcClient.frontend.issue.insert.mutate({
        Title: 'Issue with relationships',
        DateOccurred: '2025-01-15T10:00:00.000Z',
        DateIdentified: '2025-01-15T10:00:00.000Z',
        Type: 'issue',
        OwnerUserIds: [userId],
        ContributorUserIds: [userId],
        OwnerGroupIds: [],
        ContributorGroupIds: [],
        TagTypeIds: [],
        DepartmentTypeIds: [],
      });

      expect(response.Id).toBeDefined();
    });

    it('should persist tags and departments when TagTypeIds and DepartmentTypeIds are provided', async () => {
      const { orgKey, userId, trpcClient } = context;

      const tagType = await insertTagType(
        buildTagType(orgKey, userId, { Name: 'Issue Tag' })
      );
      const departmentType = await insertDepartmentType(
        buildDepartmentType(orgKey, userId, { Name: 'Issue Department' })
      );

      const response = await trpcClient.frontend.issue.insert.mutate({
        Title: 'Issue with tags and departments',
        DateOccurred: '2025-01-15T10:00:00.000Z',
        DateIdentified: '2025-01-15T10:00:00.000Z',
        Type: 'issue',
        TagTypeIds: [tagType!.TagTypeId],
        DepartmentTypeIds: [departmentType!.DepartmentTypeId],
      });

      expect(response.Id).toBeDefined();

      const issues = await trpcClient.frontend.issue.issueById.query({
        id: response.Id,
      });
      expect(issues).toHaveLength(1);
      expect(issues[0]?.tags).toHaveLength(1);
      expect(issues[0]?.tags[0]?.TagTypeId).toBe(tagType!.TagTypeId);
      expect(issues[0]?.departments).toHaveLength(1);
      expect(issues[0]?.departments[0]?.DepartmentTypeId).toBe(
        departmentType!.DepartmentTypeId
      );
    });

    it('should reject insert with an empty title', async () => {
      const { trpcClient } = context;

      await expect(
        trpcClient.frontend.issue.insert.mutate({
          Title: '',
          DateOccurred: '2025-01-15T10:00:00.000Z',
          DateIdentified: '2025-01-15T10:00:00.000Z',
          Type: 'issue',
        })
      ).rejects.toThrow();
    });

    it('should reject insert with an invalid ParentId UUID', async () => {
      const { trpcClient } = context;

      await expect(
        trpcClient.frontend.issue.insert.mutate({
          Title: 'Valid title',
          DateOccurred: '2025-01-15T10:00:00.000Z',
          DateIdentified: '2025-01-15T10:00:00.000Z',
          Type: 'issue',
          ParentId:
            'not-a-uuid' as `${string}-${string}-${string}-${string}-${string}`,
        })
      ).rejects.toThrow();
    });
  });

  describe('update', () => {
    let context: Awaited<ReturnType<typeof createTestContext>>;

    beforeEach(async () => {
      context = await createTestContext();
    });

    const insertAndGetTimestamp = async (
      trpcClient: Awaited<ReturnType<typeof createTestContext>>['trpcClient'],
      overrides?: Record<string, unknown>
    ) => {
      const insertResponse = await trpcClient.frontend.issue.insert.mutate({
        Title: 'Original Title',
        DateOccurred: '2025-01-10T08:00:00.000Z',
        DateIdentified: '2025-01-15T10:00:00.000Z',
        Type: 'issue' as const,
        ...overrides,
      });
      const issues = await trpcClient.frontend.issue.issueById.query({
        id: insertResponse.Id,
      });

      return {
        id: insertResponse.Id,
        originalTimestamp: new Date(
          String(issues[0]!.ModifiedAtTimestamp)
        ).toISOString(),
      };
    };

    it('should update an issue with required fields only', async () => {
      const { trpcClient } = context;

      const { id, originalTimestamp } = await insertAndGetTimestamp(trpcClient);

      const response = await trpcClient.frontend.issue.update.mutate({
        Id: id,
        Title: 'Updated Title',
        DateOccurred: '2025-02-01T09:00:00.000Z',
        DateIdentified: '2025-02-05T10:00:00.000Z',
        Type: 'issue',
        OriginalTimestamp: originalTimestamp,
      });

      expect(response.Id).toBeDefined();
      expect(typeof response.Id).toBe('string');
    });

    it('should update an issue with all optional fields', async () => {
      const { trpcClient } = context;
      const { id, originalTimestamp } = await insertAndGetTimestamp(trpcClient);

      const response = await trpcClient.frontend.issue.update.mutate({
        Id: id,
        Title: 'Fully Updated Issue',
        DateOccurred: '2025-02-01T09:00:00.000Z',
        DateIdentified: '2025-02-05T10:00:00.000Z',
        Type: 'issue',
        OriginalTimestamp: originalTimestamp,
        Details: 'Updated description',
        ImpactsCustomer: true,
        IsExternalIssue: false,
        CustomAttributeData: { customField: 'updatedValue' },
      });

      expect(response.Id).toBeDefined();

      const issues = await trpcClient.frontend.issue.issueById.query({
        id: response.Id,
      });
      expect(issues).toHaveLength(1);
      expect(issues[0]?.Title).toBe('Fully Updated Issue');
      expect(issues[0]?.Details).toBe('Updated description');
      expect(issues[0]?.ImpactsCustomer).toBe(true);
      expect(issues[0]?.IsExternalIssue).toBe(false);
    });

    it('should verify updated fields persist via read-back', async () => {
      const { trpcClient } = context;
      const { id, originalTimestamp } = await insertAndGetTimestamp(trpcClient);

      await trpcClient.frontend.issue.update.mutate({
        Id: id,
        Title: 'Verified Updated Title',
        DateOccurred: '2025-03-01T00:00:00.000Z',
        DateIdentified: '2025-03-05T00:00:00.000Z',
        Type: 'issue',
        OriginalTimestamp: originalTimestamp,
      });

      const issues = await trpcClient.frontend.issue.issueById.query({
        id,
      });
      expect(issues).toHaveLength(1);
      expect(issues[0]?.Title).toBe('Verified Updated Title');
    });

    it('should persist owner when OwnerUserIds is provided', async () => {
      const { userId, trpcClient } = context;
      const { id, originalTimestamp } = await insertAndGetTimestamp(trpcClient);

      const response = await trpcClient.frontend.issue.update.mutate({
        Id: id,
        Title: 'Issue with Owner',
        DateOccurred: '2025-01-15T10:00:00.000Z',
        DateIdentified: '2025-01-15T10:00:00.000Z',
        Type: 'issue',
        OriginalTimestamp: originalTimestamp,
        OwnerUserIds: [userId],
      });

      expect(response.Id).toBeDefined();

      const issues = await trpcClient.frontend.issue.issueById.query({
        id: response.Id,
      });
      expect(issues).toHaveLength(1);
      expect(issues[0]?.owners).toHaveLength(1);
      expect(issues[0]?.owners[0]?.UserId).toBe(userId);
    });

    it('should persist owner group when OwnerGroupIds is provided', async () => {
      const { orgKey, userId, trpcClient } = context;
      const { id, originalTimestamp } = await insertAndGetTimestamp(trpcClient);

      const userGroup = await insertUserGroup(
        buildUserGroup({ orgKey, userId, overrides: { Name: 'Owner Group' } })
      );
      if (!userGroup) {
        throw new Error('Failed to insert user group');
      }

      const response = await trpcClient.frontend.issue.update.mutate({
        Id: id,
        Title: 'Issue with Owner Group',
        DateOccurred: '2025-01-15T10:00:00.000Z',
        DateIdentified: '2025-01-15T10:00:00.000Z',
        Type: 'issue',
        OriginalTimestamp: originalTimestamp,
        OwnerGroupIds: [userGroup.Id],
      });

      expect(response.Id).toBeDefined();

      const issues = await trpcClient.frontend.issue.issueById.query({
        id: response.Id,
      });
      expect(issues).toHaveLength(1);
      expect(issues[0]?.ownerGroups).toHaveLength(1);
      expect(issues[0]?.ownerGroups[0]?.UserGroupId).toBe(userGroup.Id);
    });

    it('should persist contributor when ContributorUserIds is provided', async () => {
      const { userId, trpcClient } = context;
      const { id, originalTimestamp } = await insertAndGetTimestamp(trpcClient);

      const response = await trpcClient.frontend.issue.update.mutate({
        Id: id,
        Title: 'Issue with Contributor',
        DateOccurred: '2025-01-15T10:00:00.000Z',
        DateIdentified: '2025-01-15T10:00:00.000Z',
        Type: 'issue',
        OriginalTimestamp: originalTimestamp,
        ContributorUserIds: [userId],
      });

      expect(response.Id).toBeDefined();

      const issues = await trpcClient.frontend.issue.issueById.query({
        id: response.Id,
      });
      expect(issues).toHaveLength(1);
      expect(issues[0]?.contributors).toHaveLength(1);
      expect(issues[0]?.contributors[0]?.UserId).toBe(userId);
    });

    it('should persist contributor group when ContributorGroupIds is provided', async () => {
      const { orgKey, userId, trpcClient } = context;
      const { id, originalTimestamp } = await insertAndGetTimestamp(trpcClient);

      const userGroup = await insertUserGroup(
        buildUserGroup({
          orgKey,
          userId,
          overrides: { Name: 'Contributor Group' },
        })
      );
      if (!userGroup) {
        throw new Error('Failed to insert user group');
      }

      const response = await trpcClient.frontend.issue.update.mutate({
        Id: id,
        Title: 'Issue with Contributor Group',
        DateOccurred: '2025-01-15T10:00:00.000Z',
        DateIdentified: '2025-01-15T10:00:00.000Z',
        Type: 'issue',
        OriginalTimestamp: originalTimestamp,
        ContributorGroupIds: [userGroup.Id],
      });

      expect(response.Id).toBeDefined();

      const issues = await trpcClient.frontend.issue.issueById.query({
        id: response.Id,
      });
      expect(issues).toHaveLength(1);
      expect(issues[0]?.contributorGroups).toHaveLength(1);
      expect(issues[0]?.contributorGroups[0]?.UserGroupId).toBe(userGroup.Id);
    });

    it('should persist tag when TagTypeIds is provided', async () => {
      const { orgKey, userId, trpcClient } = context;
      const { id, originalTimestamp } = await insertAndGetTimestamp(trpcClient);

      const tagType = await insertTagType(
        buildTagType(orgKey, userId, { Name: 'Update Tag' })
      );
      if (!tagType) {
        throw new Error('Failed to insert tag type');
      }

      const response = await trpcClient.frontend.issue.update.mutate({
        Id: id,
        Title: 'Issue with Tag',
        DateOccurred: '2025-01-15T10:00:00.000Z',
        DateIdentified: '2025-01-15T10:00:00.000Z',
        Type: 'issue',
        OriginalTimestamp: originalTimestamp,
        TagTypeIds: [tagType.TagTypeId],
      });

      expect(response.Id).toBeDefined();

      const issues = await trpcClient.frontend.issue.issueById.query({
        id: response.Id,
      });
      expect(issues).toHaveLength(1);
      expect(issues[0]?.tags).toHaveLength(1);
      expect(issues[0]?.tags[0]?.TagTypeId).toBe(tagType.TagTypeId);
    });

    it('should persist department when DepartmentTypeIds is provided', async () => {
      const { orgKey, userId, trpcClient } = context;
      const { id, originalTimestamp } = await insertAndGetTimestamp(trpcClient);

      const departmentType = await insertDepartmentType(
        buildDepartmentType(orgKey, userId, { Name: 'Update Department' })
      );
      if (!departmentType) {
        throw new Error('Failed to insert department type');
      }

      const response = await trpcClient.frontend.issue.update.mutate({
        Id: id,
        Title: 'Issue with Department',
        DateOccurred: '2025-01-15T10:00:00.000Z',
        DateIdentified: '2025-01-15T10:00:00.000Z',
        Type: 'issue',
        OriginalTimestamp: originalTimestamp,
        DepartmentTypeIds: [departmentType.DepartmentTypeId],
      });

      expect(response.Id).toBeDefined();

      const issues = await trpcClient.frontend.issue.issueById.query({
        id: response.Id,
      });
      expect(issues).toHaveLength(1);
      expect(issues[0]?.departments).toHaveLength(1);
      expect(issues[0]?.departments[0]?.DepartmentTypeId).toBe(
        departmentType.DepartmentTypeId
      );
    });

    it('should persist multiple owners and contributors together', async () => {
      const { userId, trpcClient } = context;
      const { id, originalTimestamp } = await insertAndGetTimestamp(trpcClient);

      const response = await trpcClient.frontend.issue.update.mutate({
        Id: id,
        Title: 'Issue with Owners and Contributors',
        DateOccurred: '2025-01-15T10:00:00.000Z',
        DateIdentified: '2025-01-15T10:00:00.000Z',
        Type: 'issue',
        OriginalTimestamp: originalTimestamp,
        OwnerUserIds: [userId],
        ContributorUserIds: [userId],
      });

      expect(response.Id).toBeDefined();

      const issues = await trpcClient.frontend.issue.issueById.query({
        id: response.Id,
      });
      expect(issues).toHaveLength(1);
      expect(issues[0]?.owners).toHaveLength(1);
      expect(issues[0]?.contributors).toHaveLength(1);
    });

    it('should clear all relationships when empty arrays are provided', async () => {
      const { userId, trpcClient } = context;
      const { id, originalTimestamp } = await insertAndGetTimestamp(
        trpcClient,
        {
          OwnerUserIds: [userId],
          ContributorUserIds: [userId],
        }
      );

      const response = await trpcClient.frontend.issue.update.mutate({
        Id: id,
        Title: 'Issue with no relationships',
        DateOccurred: '2025-01-15T10:00:00.000Z',
        DateIdentified: '2025-01-15T10:00:00.000Z',
        Type: 'issue',
        OriginalTimestamp: originalTimestamp,
        OwnerUserIds: [],
        OwnerGroupIds: [],
        ContributorUserIds: [],
        ContributorGroupIds: [],
        TagTypeIds: [],
        DepartmentTypeIds: [],
      });

      expect(response.Id).toBeDefined();

      const issues = await trpcClient.frontend.issue.issueById.query({
        id: response.Id,
      });
      expect(issues[0]?.owners).toHaveLength(0);
      expect(issues[0]?.ownerGroups).toHaveLength(0);
      expect(issues[0]?.contributors).toHaveLength(0);
      expect(issues[0]?.contributorGroups).toHaveLength(0);
      expect(issues[0]?.tags).toHaveLength(0);
      expect(issues[0]?.departments).toHaveLength(0);
    });

    it('should reject update with a non-existent ID', async () => {
      const { trpcClient } = context;

      await expect(
        trpcClient.frontend.issue.update.mutate({
          Id: '00000000-0000-0000-0000-000000000000',
          Title: 'Non-existent Issue',
          DateOccurred: '2025-01-15T10:00:00.000Z',
          DateIdentified: '2025-01-15T10:00:00.000Z',
          Type: 'issue',
          OriginalTimestamp: '2025-01-01T00:00:00.000Z',
        })
      ).rejects.toThrow();
    });

    it('should reject update with an empty title', async () => {
      const { trpcClient } = context;
      const { id, originalTimestamp } = await insertAndGetTimestamp(trpcClient);

      await expect(
        trpcClient.frontend.issue.update.mutate({
          Id: id,
          Title: '',
          DateOccurred: '2025-01-15T10:00:00.000Z',
          DateIdentified: '2025-01-15T10:00:00.000Z',
          Type: 'issue',
          OriginalTimestamp: originalTimestamp,
        })
      ).rejects.toThrow();
    });
  });

  describe('delete', () => {
    let context: Awaited<ReturnType<typeof createTestContext>>;

    beforeEach(async () => {
      context = await createTestContext();
    });

    it('should delete a single issue', async () => {
      const { trpcClient } = context;

      const insertResponse = await trpcClient.frontend.issue.insert.mutate({
        Title: 'Issue to delete',
        DateOccurred: '2025-01-15T10:00:00.000Z',
        DateIdentified: '2025-01-15T10:00:00.000Z',
        Type: 'issue',
      });

      expect(insertResponse.Id).toBeDefined();

      await expect(
        trpcClient.frontend.issue.delete.mutate({ Ids: [insertResponse.Id] })
      ).resolves.not.toThrow();
    });

    it('should delete multiple issues at once', async () => {
      const { trpcClient } = context;

      const issue1 = await trpcClient.frontend.issue.insert.mutate({
        Title: 'Issue 1 to delete',
        DateOccurred: '2025-01-15T10:00:00.000Z',
        DateIdentified: '2025-01-15T10:00:00.000Z',
        Type: 'issue',
      });
      const issue2 = await trpcClient.frontend.issue.insert.mutate({
        Title: 'Issue 2 to delete',
        DateOccurred: '2025-01-15T10:00:00.000Z',
        DateIdentified: '2025-01-15T10:00:00.000Z',
        Type: 'issue',
      });

      await expect(
        trpcClient.frontend.issue.delete.mutate({
          Ids: [issue1.Id, issue2.Id],
        })
      ).resolves.not.toThrow();
    });

    it('should return empty result when querying a deleted issue', async () => {
      const { trpcClient } = context;

      const insertResponse = await trpcClient.frontend.issue.insert.mutate({
        Title: 'Issue to be deleted and verified gone',
        DateOccurred: '2025-01-15T10:00:00.000Z',
        DateIdentified: '2025-01-15T10:00:00.000Z',
        Type: 'issue',
      });

      await trpcClient.frontend.issue.delete.mutate({
        Ids: [insertResponse.Id],
      });

      const issues = await trpcClient.frontend.issue.issueById.query({
        id: insertResponse.Id,
      });

      expect(issues).toHaveLength(0);
    });

    it('should reject delete with a non-existent ID', async () => {
      const { trpcClient } = context;

      await expect(
        trpcClient.frontend.issue.delete.mutate({
          Ids: ['00000000-0000-0000-0000-000000000000'],
        })
      ).rejects.toThrow();
    });

    it('should reject delete with an empty Ids array', async () => {
      const { trpcClient } = context;

      const invalidInput = JSON.parse(
        JSON.stringify({ Ids: [] })
      ) as Parameters<typeof trpcClient.frontend.issue.delete.mutate>[0];

      await expect(
        trpcClient.frontend.issue.delete.mutate(invalidInput)
      ).rejects.toThrow();
    });
  });
});
