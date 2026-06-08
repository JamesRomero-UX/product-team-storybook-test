import { ObligationType } from '@risksmart-app/domain/src/types/consts/obligation-type';
import {
  buildDepartmentType,
  buildObligation,
  buildTagType,
  insertDepartmentType,
  insertObligation,
  insertTagType,
} from '@risksmart-app/test-data';
import { createTestContext } from 'src/utils/test-context';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

describe('obligation', () => {
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
    it('should insert an obligation with required fields only', async () => {
      const { trpcClient } = context;

      const response = await trpcClient.frontend.obligation.insert.mutate({
        Title: 'Test Obligation',
        Adherence: 'full',
        Type: ObligationType.Standard,
      });

      expect(response.Id).toBeDefined();
      expect(typeof response.Id).toBe('string');
    });

    it('should insert an obligation with all optional fields', async () => {
      const { orgKey, userId, trpcClient } = context;

      // Seed a parent obligation for ParentId
      const parentObligation = await insertObligation(
        buildObligation({ orgKey, userId })
      );
      if (!parentObligation) {
        throw new Error('Failed to insert parent obligation');
      }

      const response = await trpcClient.frontend.obligation.insert.mutate({
        Title: 'Full Obligation',
        Adherence: 'partial',
        Type: ObligationType.Rule,
        ParentId: parentObligation.Id,
        Description: 'A detailed description',
        Interpretation: 'An interpretation note',
        CustomAttributeData: { customField: 'value' },
        Schedule: {
          Frequency: null,
          ManualDueDate: null,
          StartDate: null,
          TimeToCompleteUnit: null,
          TimeToCompleteValue: null,
        },
      });

      expect(response.Id).toBeDefined();
    });

    it('should insert an obligation with null optional fields', async () => {
      const { trpcClient } = context;

      const response = await trpcClient.frontend.obligation.insert.mutate({
        Title: 'Obligation with null fields',
        Adherence: 'none',
        Type: ObligationType.Chapter,
        ParentId: null,
        Description: null,
        Interpretation: null,
        CustomAttributeData: null,
        Schedule: null,
      });

      expect(response.Id).toBeDefined();
    });

    it('should reject insert with an empty title', async () => {
      const { trpcClient } = context;

      await expect(
        trpcClient.frontend.obligation.insert.mutate({
          Title: '',
          Adherence: 'full',
          Type: ObligationType.Standard,
        })
      ).rejects.toThrow();
    });

    it('should reject insert with empty adherence', async () => {
      const { trpcClient } = context;

      await expect(
        trpcClient.frontend.obligation.insert.mutate({
          Title: 'Test Obligation',
          Adherence: '',
          Type: ObligationType.Standard,
        })
      ).rejects.toThrow();
    });

    it('should reject insert with an invalid ParentId UUID', async () => {
      const { trpcClient } = context;

      await expect(
        trpcClient.frontend.obligation.insert.mutate({
          Title: 'Test Obligation',
          Adherence: 'full',
          Type: ObligationType.Standard,
          ParentId: 'not-a-valid-uuid',
        })
      ).rejects.toThrow();
    });

    it('should persist owner when OwnerUserIds is provided', async () => {
      const { userId, trpcClient } = context;

      const response = await trpcClient.frontend.obligation.insert.mutate({
        Title: 'Obligation with Owner',
        Adherence: 'full',
        Type: ObligationType.Standard,
        OwnerUserIds: [userId],
      });

      expect(response.Id).toBeDefined();

      const obligations = await trpcClient.frontend.obligation.getById.query({
        id: response.Id,
      });
      expect(obligations).toHaveLength(1);
      expect(obligations[0]?.owners).toHaveLength(1);
      expect(obligations[0]?.owners[0]?.UserId).toBe(userId);
    });

    it('should persist contributor when ContributorUserIds is provided', async () => {
      const { userId, trpcClient } = context;

      const response = await trpcClient.frontend.obligation.insert.mutate({
        Title: 'Obligation with Contributor',
        Adherence: 'full',
        Type: ObligationType.Standard,
        ContributorUserIds: [userId],
      });

      expect(response.Id).toBeDefined();

      const obligations = await trpcClient.frontend.obligation.getById.query({
        id: response.Id,
      });
      expect(obligations).toHaveLength(1);
      expect(obligations[0]?.contributors).toHaveLength(1);
      expect(obligations[0]?.contributors[0]?.UserId).toBe(userId);
    });

    it('should insert an obligation with empty relationship arrays', async () => {
      const { trpcClient } = context;

      const response = await trpcClient.frontend.obligation.insert.mutate({
        Title: 'Obligation with no relationships',
        Adherence: 'full',
        Type: ObligationType.Task,
        OwnerUserIds: [],
        OwnerGroupIds: [],
        ContributorUserIds: [],
        ContributorGroupIds: [],
        TagTypeIds: [],
        DepartmentTypeIds: [],
      });

      expect(response.Id).toBeDefined();

      const obligations = await trpcClient.frontend.obligation.getById.query({
        id: response.Id,
      });
      expect(obligations[0]?.owners).toHaveLength(0);
      expect(obligations[0]?.contributors).toHaveLength(0);
    });

    it('should persist tags and departments when TagTypeIds and DepartmentTypeIds are provided', async () => {
      const { orgKey, userId, trpcClient } = context;

      const tagType = await insertTagType(
        buildTagType(orgKey, userId, { Name: 'Obligation Tag' })
      );
      const departmentType = await insertDepartmentType(
        buildDepartmentType(orgKey, userId, { Name: 'Obligation Department' })
      );

      const response = await trpcClient.frontend.obligation.insert.mutate({
        Title: 'Obligation with tags and departments',
        Adherence: 'full',
        Type: ObligationType.Standard,
        TagTypeIds: [tagType!.TagTypeId],
        DepartmentTypeIds: [departmentType!.DepartmentTypeId],
      });

      expect(response.Id).toBeDefined();

      const obligations = await trpcClient.frontend.obligation.getById.query({
        id: response.Id,
      });
      expect(obligations).toHaveLength(1);
      expect(obligations[0]?.tags).toHaveLength(1);
      expect(obligations[0]?.tags[0]?.TagTypeId).toBe(tagType!.TagTypeId);
      expect(obligations[0]?.departments).toHaveLength(1);
      expect(obligations[0]?.departments[0]?.DepartmentTypeId).toBe(
        departmentType!.DepartmentTypeId
      );
    });
  });
});
