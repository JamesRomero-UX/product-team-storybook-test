import { AssessmentStatus } from '@risksmart-app/domain/src/types/consts/assessment-status';
import {
  buildDepartmentType,
  buildTagType,
  buildUserGroup,
  insertDepartmentType,
  insertTagType,
  insertUserGroup,
} from '@risksmart-app/test-data';
import { createTestContext } from 'src/utils/test-context';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

describe('assessment', () => {
  let context: Awaited<ReturnType<typeof createTestContext>>;
  const contexts: Awaited<ReturnType<typeof createTestContext>>[] = [];

  beforeEach(async () => {
    context = await createTestContext();
    contexts.push(context);
  });

  afterAll(async () => {
    await Promise.all(contexts.map((c) => c.cleanup()));
  });

  describe('insert', () => {
    it('should insert an assessment with required fields only', async () => {
      const { trpcClient } = context;

      const response = await trpcClient.frontend.assessment.insert.mutate({
        Title: 'Test Assessment',
        Status: AssessmentStatus.NotStarted,
      });

      expect(response.Id).toBeDefined();
      expect(typeof response.Id).toBe('string');
    });

    it('should insert an assessment with all optional fields', async () => {
      const { trpcClient, userId } = context;

      const response = await trpcClient.frontend.assessment.insert.mutate({
        Title: 'Full Assessment',
        Status: AssessmentStatus.InProgress,
        Summary: 'A detailed summary',
        ActualCompletionDate: '2026-01-15',
        NextTestDate: '2026-06-01',
        StartDate: '2026-01-01',
        TargetCompletionDate: '2026-03-31',
        CompletedByUser: userId,
        Outcome: 5,
        CustomAttributeData: { customField: 'value', score: 42 },
      });

      expect(response.Id).toBeDefined();
    });

    it('should insert an assessment with null optional fields', async () => {
      const { trpcClient } = context;

      const response = await trpcClient.frontend.assessment.insert.mutate({
        Title: 'Assessment with nulls',
        Status: AssessmentStatus.Complete,
        OriginatingItemId: null,
        Summary: null,
        ActualCompletionDate: null,
        NextTestDate: null,
        StartDate: null,
        TargetCompletionDate: null,
        CompletedByUser: null,
        Outcome: null,
        CustomAttributeData: null,
      });

      expect(response.Id).toBeDefined();
    });

    it('should reject insert with an empty title', async () => {
      const { trpcClient } = context;

      await expect(
        trpcClient.frontend.assessment.insert.mutate({
          Title: '',
          Status: AssessmentStatus.NotStarted,
        })
      ).rejects.toThrow();
    });

    it('should reject insert with an invalid UUID for OriginatingItemId', async () => {
      const { trpcClient } = context;

      await expect(
        trpcClient.frontend.assessment.insert.mutate({
          Title: 'Assessment with bad UUID',
          Status: AssessmentStatus.NotStarted,
          OriginatingItemId:
            'not-a-uuid' as `${string}-${string}-${string}-${string}-${string}`,
        })
      ).rejects.toThrow();
    });

    it('should persist owner when OwnerUserIds is provided', async () => {
      const { userId, trpcClient } = context;

      const response = await trpcClient.frontend.assessment.insert.mutate({
        Title: 'Assessment with Owner',
        Status: AssessmentStatus.NotStarted,
        OwnerUserIds: [userId],
      });

      expect(response.Id).toBeDefined();

      const assessments = await trpcClient.frontend.assessment.getById.query({
        id: response.Id,
      });
      expect(assessments).toHaveLength(1);
      expect(assessments[0]?.owners).toHaveLength(1);
      expect(assessments[0]?.owners[0]?.UserId).toBe(userId);
    });

    it('should persist owner group when OwnerGroupIds is provided', async () => {
      const { orgKey, userId, trpcClient } = context;

      const userGroup = await insertUserGroup(
        buildUserGroup({ orgKey, userId, overrides: { Name: 'Owner Group' } })
      );

      if (!userGroup) {
        throw new Error('Failed to insert user group');
      }

      const response = await trpcClient.frontend.assessment.insert.mutate({
        Title: 'Assessment with Owner Group',
        Status: AssessmentStatus.NotStarted,
        OwnerGroupIds: [userGroup.Id],
      });

      expect(response.Id).toBeDefined();

      const assessments = await trpcClient.frontend.assessment.getById.query({
        id: response.Id,
      });
      expect(assessments).toHaveLength(1);
      expect(assessments[0]?.ownerGroups).toHaveLength(1);
      expect(assessments[0]?.ownerGroups[0]?.UserGroupId).toBe(userGroup.Id);
    });

    it('should persist contributor when ContributorUserIds is provided', async () => {
      const { userId, trpcClient } = context;

      const response = await trpcClient.frontend.assessment.insert.mutate({
        Title: 'Assessment with Contributor',
        Status: AssessmentStatus.NotStarted,
        ContributorUserIds: [userId],
      });

      expect(response.Id).toBeDefined();

      const assessments = await trpcClient.frontend.assessment.getById.query({
        id: response.Id,
      });
      expect(assessments).toHaveLength(1);
      expect(assessments[0]?.contributors).toHaveLength(1);
      expect(assessments[0]?.contributors[0]?.UserId).toBe(userId);
    });

    it('should persist contributor group when ContributorGroupIds is provided', async () => {
      const { orgKey, userId, trpcClient } = context;

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

      const response = await trpcClient.frontend.assessment.insert.mutate({
        Title: 'Assessment with Contributor Group',
        Status: AssessmentStatus.NotStarted,
        ContributorGroupIds: [userGroup.Id],
      });

      expect(response.Id).toBeDefined();

      const assessments = await trpcClient.frontend.assessment.getById.query({
        id: response.Id,
      });
      expect(assessments).toHaveLength(1);
      expect(assessments[0]?.contributorGroups).toHaveLength(1);
      expect(assessments[0]?.contributorGroups[0]?.UserGroupId).toBe(
        userGroup.Id
      );
    });

    it('should persist tags when TagTypeIds is provided', async () => {
      const { orgKey, userId, trpcClient } = context;

      const tagType = await insertTagType(
        buildTagType(orgKey, userId, { Name: 'Assessment Tag' })
      );

      const response = await trpcClient.frontend.assessment.insert.mutate({
        Title: 'Assessment with Tag',
        Status: AssessmentStatus.NotStarted,
        TagTypeIds: [tagType!.TagTypeId],
      });

      expect(response.Id).toBeDefined();

      const assessments = await trpcClient.frontend.assessment.getById.query({
        id: response.Id,
      });
      expect(assessments).toHaveLength(1);
      expect(assessments[0]?.tags).toHaveLength(1);
      expect(assessments[0]?.tags[0]?.TagTypeId).toBe(tagType!.TagTypeId);
    });

    it('should persist departments when DepartmentTypeIds is provided', async () => {
      const { orgKey, userId, trpcClient } = context;

      const departmentType = await insertDepartmentType(
        buildDepartmentType(orgKey, userId, { Name: 'Assessment Department' })
      );

      const response = await trpcClient.frontend.assessment.insert.mutate({
        Title: 'Assessment with Department',
        Status: AssessmentStatus.NotStarted,
        DepartmentTypeIds: [departmentType!.DepartmentTypeId],
      });

      expect(response.Id).toBeDefined();

      const assessments = await trpcClient.frontend.assessment.getById.query({
        id: response.Id,
      });
      expect(assessments).toHaveLength(1);
      expect(assessments[0]?.departments).toHaveLength(1);
      expect(assessments[0]?.departments[0]?.DepartmentTypeId).toBe(
        departmentType!.DepartmentTypeId
      );
    });

    it('should persist multiple owners and contributors', async () => {
      const { userId, trpcClient } = context;

      const response = await trpcClient.frontend.assessment.insert.mutate({
        Title: 'Assessment with Owners and Contributors',
        Status: AssessmentStatus.NotStarted,
        OwnerUserIds: [userId],
        ContributorUserIds: [userId],
      });

      expect(response.Id).toBeDefined();

      const assessments = await trpcClient.frontend.assessment.getById.query({
        id: response.Id,
      });
      expect(assessments).toHaveLength(1);
      expect(assessments[0]?.owners).toHaveLength(1);
      expect(assessments[0]?.contributors).toHaveLength(1);
    });

    it('should insert an assessment with empty relationship arrays', async () => {
      const { trpcClient } = context;

      const response = await trpcClient.frontend.assessment.insert.mutate({
        Title: 'Assessment with no relationships',
        Status: AssessmentStatus.NotStarted,
        OwnerUserIds: [],
        OwnerGroupIds: [],
        ContributorUserIds: [],
        ContributorGroupIds: [],
        TagTypeIds: [],
        DepartmentTypeIds: [],
      });

      expect(response.Id).toBeDefined();

      const assessments = await trpcClient.frontend.assessment.getById.query({
        id: response.Id,
      });
      expect(assessments[0]?.owners).toHaveLength(0);
      expect(assessments[0]?.contributors).toHaveLength(0);
      expect(assessments[0]?.ownerGroups).toHaveLength(0);
      expect(assessments[0]?.contributorGroups).toHaveLength(0);
      expect(assessments[0]?.tags).toHaveLength(0);
      expect(assessments[0]?.departments).toHaveLength(0);
    });
  });

  describe('update', () => {
    it('should update an assessment with required fields', async () => {
      const { trpcClient } = context;

      const insertResponse = await trpcClient.frontend.assessment.insert.mutate(
        {
          Title: 'Assessment to update',
          Status: AssessmentStatus.NotStarted,
        }
      );

      const response = await trpcClient.frontend.assessment.update.mutate({
        Id: insertResponse.Id,
        Title: 'Updated Assessment Title',
        Status: AssessmentStatus.InProgress,
      });

      expect(response.Id).toBeDefined();
      expect(typeof response.Id).toBe('string');
    });

    it('should update with all optional fields', async () => {
      const { trpcClient, userId } = context;

      const insertResponse = await trpcClient.frontend.assessment.insert.mutate(
        {
          Title: 'Assessment to fully update',
          Status: AssessmentStatus.NotStarted,
        }
      );

      const response = await trpcClient.frontend.assessment.update.mutate({
        Id: insertResponse.Id,
        Title: 'Fully Updated Assessment',
        Status: AssessmentStatus.Complete,
        Summary: 'Updated summary',
        ActualCompletionDate: '2026-02-15',
        NextTestDate: '2026-07-01',
        StartDate: '2026-02-01',
        TargetCompletionDate: '2026-04-30',
        CompletedByUser: userId,
        Outcome: 8,
        CustomAttributeData: { updatedField: 'updatedValue' },
      });

      expect(response.Id).toBeDefined();
    });

    it('should update with null optional fields', async () => {
      const { trpcClient, userId } = context;

      const insertResponse = await trpcClient.frontend.assessment.insert.mutate(
        {
          Title: 'Assessment with values',
          Status: AssessmentStatus.InProgress,
          Summary: 'Some summary',
          CompletedByUser: userId,
          Outcome: 5,
        }
      );

      const response = await trpcClient.frontend.assessment.update.mutate({
        Id: insertResponse.Id,
        Title: 'Assessment with nulls',
        Status: AssessmentStatus.NotStarted,
        Summary: null,
        ActualCompletionDate: null,
        NextTestDate: null,
        StartDate: null,
        TargetCompletionDate: null,
        CompletedByUser: null,
        Outcome: null,
        CustomAttributeData: null,
      });

      expect(response.Id).toBeDefined();
    });

    it('should reject update with empty title', async () => {
      const { trpcClient } = context;

      const insertResponse = await trpcClient.frontend.assessment.insert.mutate(
        {
          Title: 'Assessment for empty title test',
          Status: AssessmentStatus.NotStarted,
        }
      );

      await expect(
        trpcClient.frontend.assessment.update.mutate({
          Id: insertResponse.Id,
          Title: '',
          Status: AssessmentStatus.NotStarted,
        })
      ).rejects.toThrow();
    });

    it('should reject update with invalid UUID for Id', async () => {
      const { trpcClient } = context;

      await expect(
        trpcClient.frontend.assessment.update.mutate({
          Id: 'not-a-uuid' as `${string}-${string}-${string}-${string}-${string}`,
          Title: 'Some Title',
          Status: AssessmentStatus.NotStarted,
        })
      ).rejects.toThrow();
    });

    it('should persist owner relationships on update', async () => {
      const { trpcClient, userId } = context;

      const insertResponse = await trpcClient.frontend.assessment.insert.mutate(
        {
          Title: 'Assessment for owner update',
          Status: AssessmentStatus.NotStarted,
        }
      );

      await trpcClient.frontend.assessment.update.mutate({
        Id: insertResponse.Id,
        Title: 'Assessment with owners',
        Status: AssessmentStatus.NotStarted,
        OwnerUserIds: [userId],
      });

      const assessments = await trpcClient.frontend.assessment.getById.query({
        id: insertResponse.Id,
      });
      expect(assessments).toHaveLength(1);
      expect(assessments[0]?.owners).toHaveLength(1);
      expect(assessments[0]?.owners[0]?.UserId).toBe(userId);
    });

    it('should persist tag relationships on update', async () => {
      const { trpcClient, orgKey, userId } = context;

      const tagType = await insertTagType(
        buildTagType(orgKey, userId, { Name: 'Update Assessment Tag' })
      );

      const insertResponse = await trpcClient.frontend.assessment.insert.mutate(
        {
          Title: 'Assessment for tag update',
          Status: AssessmentStatus.NotStarted,
        }
      );

      await trpcClient.frontend.assessment.update.mutate({
        Id: insertResponse.Id,
        Title: 'Assessment with tags',
        Status: AssessmentStatus.NotStarted,
        TagTypeIds: [tagType!.TagTypeId],
      });

      const assessments = await trpcClient.frontend.assessment.getById.query({
        id: insertResponse.Id,
      });
      expect(assessments).toHaveLength(1);
      expect(assessments[0]?.tags).toHaveLength(1);
      expect(assessments[0]?.tags[0]?.TagTypeId).toBe(tagType!.TagTypeId);
    });

    it('should persist department relationships on update', async () => {
      const { trpcClient, orgKey, userId } = context;

      const departmentType = await insertDepartmentType(
        buildDepartmentType(orgKey, userId, {
          Name: 'Update Assessment Department',
        })
      );

      const insertResponse = await trpcClient.frontend.assessment.insert.mutate(
        {
          Title: 'Assessment for department update',
          Status: AssessmentStatus.NotStarted,
        }
      );

      await trpcClient.frontend.assessment.update.mutate({
        Id: insertResponse.Id,
        Title: 'Assessment with departments',
        Status: AssessmentStatus.NotStarted,
        DepartmentTypeIds: [departmentType!.DepartmentTypeId],
      });

      const assessments = await trpcClient.frontend.assessment.getById.query({
        id: insertResponse.Id,
      });
      expect(assessments).toHaveLength(1);
      expect(assessments[0]?.departments).toHaveLength(1);
      expect(assessments[0]?.departments[0]?.DepartmentTypeId).toBe(
        departmentType!.DepartmentTypeId
      );
    });

    it('should handle empty relationship arrays on update', async () => {
      const { trpcClient, userId } = context;

      const insertResponse = await trpcClient.frontend.assessment.insert.mutate(
        {
          Title: 'Assessment with initial owners',
          Status: AssessmentStatus.NotStarted,
          OwnerUserIds: [userId],
        }
      );

      await trpcClient.frontend.assessment.update.mutate({
        Id: insertResponse.Id,
        Title: 'Assessment with cleared relationships',
        Status: AssessmentStatus.NotStarted,
        OwnerUserIds: [],
        OwnerGroupIds: [],
        ContributorUserIds: [],
        ContributorGroupIds: [],
        TagTypeIds: [],
        DepartmentTypeIds: [],
      });

      const assessments = await trpcClient.frontend.assessment.getById.query({
        id: insertResponse.Id,
      });
      expect(assessments).toHaveLength(1);
      expect(assessments[0]?.owners).toHaveLength(0);
      expect(assessments[0]?.ownerGroups).toHaveLength(0);
      expect(assessments[0]?.contributors).toHaveLength(0);
      expect(assessments[0]?.contributorGroups).toHaveLength(0);
      expect(assessments[0]?.tags).toHaveLength(0);
      expect(assessments[0]?.departments).toHaveLength(0);
    });
  });

  describe('delete', () => {
    it('should delete an assessment', async () => {
      const { trpcClient } = context;

      const insertResponse = await trpcClient.frontend.assessment.insert.mutate(
        {
          Title: 'Assessment to delete',
          Status: AssessmentStatus.NotStarted,
        }
      );

      expect(insertResponse.Id).toBeDefined();

      await expect(
        trpcClient.frontend.assessment.delete.mutate({
          id: insertResponse.Id,
        })
      ).resolves.not.toThrow();
    });

    it('should reject delete with invalid UUID', async () => {
      const { trpcClient } = context;

      await expect(
        trpcClient.frontend.assessment.delete.mutate({
          id: 'not-a-uuid' as `${string}-${string}-${string}-${string}-${string}`,
        })
      ).rejects.toThrow();
    });
  });
});
