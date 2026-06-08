import { IndicatorType } from '@risksmart-app/domain/src/types/consts/indicator-type';
import {
  buildDepartmentType,
  buildIndicator,
  buildTagType,
  buildUserGroup,
  insertDepartmentType,
  insertIndicator,
  insertIndicators,
  insertTagType,
  insertUserGroup,
} from '@risksmart-app/test-data';
import { randomUUID } from 'crypto';
import { createTestContext } from 'src/utils/test-context';
import { beforeEach, describe, expect, it } from 'vitest';

describe('indicator', () => {
  let context: Awaited<ReturnType<typeof createTestContext>>;

  beforeEach(async () => {
    context = await createTestContext();
  });

  describe('update', () => {
    it('should update an indicator with required fields only', async () => {
      const { orgKey, userId, trpcClient } = context;

      const insertedIndicator = await insertIndicator(
        buildIndicator({ orgKey, userId })
      );
      if (!insertedIndicator) {
        throw new Error('Failed to insert indicator');
      }

      const response = await trpcClient.frontend.indicator.update.mutate({
        Id: insertedIndicator.Id,
        Title: 'Updated Indicator Title',
        Type: IndicatorType.Number,
      });

      expect(response.Id).toBeDefined();
      expect(typeof response.Id).toBe('string');
    });

    it('should update an indicator with all optional fields', async () => {
      const { orgKey, userId, trpcClient } = context;

      const insertedIndicator = await insertIndicator(
        buildIndicator({ orgKey, userId })
      );
      if (!insertedIndicator) {
        throw new Error('Failed to insert indicator');
      }

      const response = await trpcClient.frontend.indicator.update.mutate({
        Id: insertedIndicator.Id,
        Title: 'Fully Updated Indicator',
        Type: IndicatorType.Text,
        Description: 'Updated description',
        Unit: 'percent',
        UpperToleranceNum: 95,
        LowerToleranceNum: 5,
        TargetValueTxt: 'Above threshold',
        UpperAppetiteNum: 90,
        LowerAppetiteNum: 10,
        CustomAttributeData: { customField: 'updatedValue' },
      });

      expect(response.Id).toBeDefined();

      const indicators =
        await trpcClient.frontend.indicator.indicatorById.query({
          id: response.Id,
        });
      expect(indicators).toHaveLength(1);
      expect(indicators[0]?.Title).toBe('Fully Updated Indicator');
      expect(indicators[0]?.Type).toBe(IndicatorType.Text);
      expect(indicators[0]?.Description).toBe('Updated description');
      expect(indicators[0]?.Unit).toBe('percent');
      expect(indicators[0]?.UpperToleranceNum).toBe(95);
      expect(indicators[0]?.LowerToleranceNum).toBe(5);
    });

    it('should accept null for all optional fields', async () => {
      const { orgKey, userId, trpcClient } = context;

      const insertedIndicator = await insertIndicator(
        buildIndicator({ orgKey, userId })
      );
      if (!insertedIndicator) {
        throw new Error('Failed to insert indicator');
      }

      const response = await trpcClient.frontend.indicator.update.mutate({
        Id: insertedIndicator.Id,
        Title: 'Indicator with null optionals',
        Type: IndicatorType.Boolean,
        Description: null,
        Unit: null,
        UpperToleranceNum: null,
        LowerToleranceNum: null,
        TargetValueTxt: null,
        UpperAppetiteNum: null,
        LowerAppetiteNum: null,
        CustomAttributeData: null,
      });

      expect(response.Id).toBeDefined();
    });

    it('should reject update with an empty title', async () => {
      const { orgKey, userId, trpcClient } = context;

      const insertedIndicator = await insertIndicator(
        buildIndicator({ orgKey, userId })
      );
      if (!insertedIndicator) {
        throw new Error('Failed to insert indicator');
      }

      await expect(
        trpcClient.frontend.indicator.update.mutate({
          Id: insertedIndicator.Id,
          Title: '',
          Type: IndicatorType.Number,
        })
      ).rejects.toThrow();
    });

    it('should reject update with an invalid UUID for Id', async () => {
      const { trpcClient } = context;

      await expect(
        trpcClient.frontend.indicator.update.mutate({
          Id: 'not-a-uuid' as `${string}-${string}-${string}-${string}-${string}`,
          Title: 'Some Title',
          Type: IndicatorType.Number,
        })
      ).rejects.toThrow();
    });

    it('should persist owner when OwnerUserIds is provided', async () => {
      const { orgKey, userId, trpcClient } = context;

      const insertedIndicator = await insertIndicator(
        buildIndicator({ orgKey, userId })
      );
      if (!insertedIndicator) {
        throw new Error('Failed to insert indicator');
      }

      const response = await trpcClient.frontend.indicator.update.mutate({
        Id: insertedIndicator.Id,
        Title: 'Indicator with Owner',
        Type: IndicatorType.Number,
        OwnerUserIds: [userId],
      });

      expect(response.Id).toBeDefined();

      const indicators =
        await trpcClient.frontend.indicator.indicatorById.query({
          id: response.Id,
        });
      expect(indicators).toHaveLength(1);
      expect(indicators[0]?.owners).toHaveLength(1);
      expect(indicators[0]?.owners[0]?.UserId).toBe(userId);
    });

    it('should persist owner group when OwnerGroupIds is provided', async () => {
      const { orgKey, userId, trpcClient } = context;

      const insertedIndicator = await insertIndicator(
        buildIndicator({ orgKey, userId })
      );
      if (!insertedIndicator) {
        throw new Error('Failed to insert indicator');
      }

      const userGroup = await insertUserGroup(
        buildUserGroup({ orgKey, userId, overrides: { Name: 'Owner Group' } })
      );
      if (!userGroup) {
        throw new Error('Failed to insert user group');
      }

      const response = await trpcClient.frontend.indicator.update.mutate({
        Id: insertedIndicator.Id,
        Title: 'Indicator with Owner Group',
        Type: IndicatorType.Number,
        OwnerGroupIds: [userGroup.Id],
      });

      expect(response.Id).toBeDefined();

      const indicators =
        await trpcClient.frontend.indicator.indicatorById.query({
          id: response.Id,
        });
      expect(indicators).toHaveLength(1);
      expect(indicators[0]?.ownerGroups).toHaveLength(1);
      expect(indicators[0]?.ownerGroups[0]?.UserGroupId).toBe(userGroup.Id);
    });

    it('should persist contributor when ContributorUserIds is provided', async () => {
      const { orgKey, userId, trpcClient } = context;

      const insertedIndicator = await insertIndicator(
        buildIndicator({ orgKey, userId })
      );
      if (!insertedIndicator) {
        throw new Error('Failed to insert indicator');
      }

      const response = await trpcClient.frontend.indicator.update.mutate({
        Id: insertedIndicator.Id,
        Title: 'Indicator with Contributor',
        Type: IndicatorType.Number,
        ContributorUserIds: [userId],
      });

      expect(response.Id).toBeDefined();

      const indicators =
        await trpcClient.frontend.indicator.indicatorById.query({
          id: response.Id,
        });
      expect(indicators).toHaveLength(1);
      expect(indicators[0]?.contributors).toHaveLength(1);
      expect(indicators[0]?.contributors[0]?.UserId).toBe(userId);
    });

    it('should persist contributor group when ContributorGroupIds is provided', async () => {
      const { orgKey, userId, trpcClient } = context;

      const insertedIndicator = await insertIndicator(
        buildIndicator({ orgKey, userId })
      );
      if (!insertedIndicator) {
        throw new Error('Failed to insert indicator');
      }

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

      const response = await trpcClient.frontend.indicator.update.mutate({
        Id: insertedIndicator.Id,
        Title: 'Indicator with Contributor Group',
        Type: IndicatorType.Number,
        ContributorGroupIds: [userGroup.Id],
      });

      expect(response.Id).toBeDefined();

      const indicators =
        await trpcClient.frontend.indicator.indicatorById.query({
          id: response.Id,
        });
      expect(indicators).toHaveLength(1);
      expect(indicators[0]?.contributorGroups).toHaveLength(1);
      expect(indicators[0]?.contributorGroups[0]?.UserGroupId).toBe(
        userGroup.Id
      );
    });

    it('should persist tag when TagTypeIds is provided', async () => {
      const { orgKey, userId, trpcClient } = context;

      const insertedIndicator = await insertIndicator(
        buildIndicator({ orgKey, userId })
      );
      if (!insertedIndicator) {
        throw new Error('Failed to insert indicator');
      }

      const tagType = await insertTagType(
        buildTagType(orgKey, userId, { Name: 'Update Tag' })
      );
      if (!tagType) {
        throw new Error('Failed to insert tag type');
      }

      const response = await trpcClient.frontend.indicator.update.mutate({
        Id: insertedIndicator.Id,
        Title: 'Indicator with Tag',
        Type: IndicatorType.Number,
        TagTypeIds: [tagType.TagTypeId],
      });

      expect(response.Id).toBeDefined();

      const indicators =
        await trpcClient.frontend.indicator.indicatorById.query({
          id: response.Id,
        });
      expect(indicators).toHaveLength(1);
      expect(indicators[0]?.tags).toHaveLength(1);
      expect(indicators[0]?.tags[0]?.TagTypeId).toBe(tagType.TagTypeId);
    });

    it('should persist department when DepartmentTypeIds is provided', async () => {
      const { orgKey, userId, trpcClient } = context;

      const insertedIndicator = await insertIndicator(
        buildIndicator({ orgKey, userId })
      );
      if (!insertedIndicator) {
        throw new Error('Failed to insert indicator');
      }

      const departmentType = await insertDepartmentType(
        buildDepartmentType(orgKey, userId, { Name: 'Update Department' })
      );
      if (!departmentType) {
        throw new Error('Failed to insert department type');
      }

      const response = await trpcClient.frontend.indicator.update.mutate({
        Id: insertedIndicator.Id,
        Title: 'Indicator with Department',
        Type: IndicatorType.Number,
        DepartmentTypeIds: [departmentType.DepartmentTypeId],
      });

      expect(response.Id).toBeDefined();

      const indicators =
        await trpcClient.frontend.indicator.indicatorById.query({
          id: response.Id,
        });
      expect(indicators).toHaveLength(1);
      expect(indicators[0]?.departments).toHaveLength(1);
      expect(indicators[0]?.departments[0]?.DepartmentTypeId).toBe(
        departmentType.DepartmentTypeId
      );
    });

    it('should persist multiple owners and contributors together', async () => {
      const { orgKey, userId, trpcClient } = context;

      const insertedIndicator = await insertIndicator(
        buildIndicator({ orgKey, userId })
      );
      if (!insertedIndicator) {
        throw new Error('Failed to insert indicator');
      }

      const response = await trpcClient.frontend.indicator.update.mutate({
        Id: insertedIndicator.Id,
        Title: 'Indicator with Owners and Contributors',
        Type: IndicatorType.Number,
        OwnerUserIds: [userId],
        ContributorUserIds: [userId],
      });

      expect(response.Id).toBeDefined();

      const indicators =
        await trpcClient.frontend.indicator.indicatorById.query({
          id: response.Id,
        });
      expect(indicators).toHaveLength(1);
      expect(indicators[0]?.owners).toHaveLength(1);
      expect(indicators[0]?.contributors).toHaveLength(1);
    });

    it('should clear all relationships when empty arrays are provided', async () => {
      const { orgKey, userId, trpcClient } = context;

      const insertedIndicator = await insertIndicator(
        buildIndicator({ orgKey, userId })
      );
      if (!insertedIndicator) {
        throw new Error('Failed to insert indicator');
      }

      // First update with relationships
      await trpcClient.frontend.indicator.update.mutate({
        Id: insertedIndicator.Id,
        Title: 'Indicator before clearing',
        Type: IndicatorType.Number,
        OwnerUserIds: [userId],
        ContributorUserIds: [userId],
      });

      // Then update with empty arrays to clear relationships
      const response = await trpcClient.frontend.indicator.update.mutate({
        Id: insertedIndicator.Id,
        Title: 'Indicator with no relationships',
        Type: IndicatorType.Number,
        OwnerUserIds: [],
        OwnerGroupIds: [],
        ContributorUserIds: [],
        ContributorGroupIds: [],
        TagTypeIds: [],
        DepartmentTypeIds: [],
      });

      expect(response.Id).toBeDefined();

      const indicators =
        await trpcClient.frontend.indicator.indicatorById.query({
          id: response.Id,
        });
      expect(indicators).toHaveLength(1);
      expect(indicators[0]?.owners).toHaveLength(0);
      expect(indicators[0]?.ownerGroups).toHaveLength(0);
      expect(indicators[0]?.contributors).toHaveLength(0);
      expect(indicators[0]?.contributorGroups).toHaveLength(0);
      expect(indicators[0]?.tags).toHaveLength(0);
      expect(indicators[0]?.departments).toHaveLength(0);
    });
  });

  describe('delete', () => {
    it('should delete a single indicator', async () => {
      const { orgKey, userId, trpcClient } = context;

      const insertedIndicator = await insertIndicator(
        buildIndicator({ orgKey, userId })
      );
      if (!insertedIndicator) {
        throw new Error('Failed to insert indicator');
      }

      const deleteResponse = await trpcClient.frontend.indicator.delete.mutate({
        ids: [insertedIndicator.Id],
      });

      expect(deleteResponse).toBe('');
    });

    it('should delete multiple indicators in a single call', async () => {
      const { orgKey, userId, trpcClient } = context;

      const [insertedIndicator1, insertedIndicator2] = await insertIndicators([
        buildIndicator({ orgKey, userId }),
        buildIndicator({ orgKey, userId }),
      ]);

      if (!insertedIndicator1 || !insertedIndicator2) {
        throw new Error('Failed to insert indicators');
      }

      const deleteResponse = await trpcClient.frontend.indicator.delete.mutate({
        ids: [insertedIndicator1.Id, insertedIndicator2.Id],
      });

      expect(deleteResponse).toBe('');
    });

    it('should throw when deleting a non-existent indicator', async () => {
      const { trpcClient } = context;

      await expect(
        trpcClient.frontend.indicator.delete.mutate({
          ids: [randomUUID()],
        })
      ).rejects.toThrow();
    });

    it('should reject delete with an invalid UUID', async () => {
      const { trpcClient } = context;

      const invalidInput = JSON.parse(
        JSON.stringify({ ids: ['not-a-uuid'] })
      ) as Parameters<typeof trpcClient.frontend.indicator.delete.mutate>[0];

      await expect(
        trpcClient.frontend.indicator.delete.mutate(invalidInput)
      ).rejects.toThrow();
    });

    it('should reject delete with an empty ids array', async () => {
      const { trpcClient } = context;

      const invalidInput = JSON.parse(
        JSON.stringify({ ids: [] })
      ) as Parameters<typeof trpcClient.frontend.indicator.delete.mutate>[0];

      await expect(
        trpcClient.frontend.indicator.delete.mutate(invalidInput)
      ).rejects.toThrow();
    });
  });
});
