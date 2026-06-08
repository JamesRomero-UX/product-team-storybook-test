import type { TestFrequency } from '@risksmart-app/domain/src/types/consts/test-frequency';
import type { UnitOfTime } from '@risksmart-app/domain/src/types/consts/unit-of-time';
import type { DB } from '@risksmart-app/drizzle/src/db';
import {
  contributor,
  contributor_group,
  department,
  indicator,
  indicator_result,
  owner,
  owner_group,
  schedule,
  tag,
} from '@risksmart-app/drizzle/src/schema';
import { and, eq, inArray, notInArray, sql } from 'drizzle-orm';
import { NotFound } from 'http-errors';

import type { ServiceContext } from '../types';
import { getLogger } from '../utils/logger';

const logger = getLogger();

export type IndicatorRepository = ReturnType<typeof createIndicatorRepository>;

export interface IndicatorRelationships {
  ownerUserIds: string[];
  ownerGroupIds: string[];
  contributorUserIds: string[];
  contributorGroupIds: string[];
  tagTypeIds: string[];
  departmentTypeIds: string[];
  schedule?: {
    Frequency?: TestFrequency | null;
    ManualDueDate?: string | null;
    StartDate?: string | null;
    TimeToCompleteUnit?: UnitOfTime | null;
    TimeToCompleteValue?: number | null;
  } | null;
}

export const createIndicatorRepository = (db: DB['transaction']) => ({
  /**
   * Delete multiple indicators by IDs in a single transaction.
   * First deletes associated indicator_result rows (no CASCADE FK),
   * then deletes the indicator rows.
   * Returns the IDs that were actually deleted.
   */
  deleteMany: async (ids: string[]): Promise<string[]> => {
    try {
      logger.info('Deleting multiple indicators with cascade', {
        ids,
        count: ids.length,
      });

      const result = await db(async (tx) => {
        // First: delete indicator_result rows referencing these indicators
        await tx
          .delete(indicator_result)
          .where(inArray(indicator_result.IndicatorId, ids));

        // Then: delete the indicator rows
        return tx
          .delete(indicator)
          .where(inArray(indicator.Id, ids))
          .returning({ Id: indicator.Id });
      });

      const deletedIds = result.map((r) => r.Id);

      logger.info('Deleted indicators', {
        requestedIds: ids,
        deletedIds,
        affectedRows: result.length,
      });

      return deletedIds;
    } catch (error) {
      logger.error('Failed to delete indicators', {
        error,
        ids,
      });
      throw error;
    }
  },

  updateWithRelationships: async (
    id: string,
    values: Partial<typeof indicator.$inferInsert>,
    relationships: IndicatorRelationships,
    context: ServiceContext
  ) =>
    await db(async (tx) => {
      try {
        const { userId, orgKey } = context;
        const [updatedIndicator] = await tx
          .update(indicator)
          .set({
            ...values,
            ModifiedAtTimestamp: sql`statement_timestamp()`,
            ModifiedByUser: userId,
          })
          .where(and(eq(indicator.Id, id), eq(indicator.OrgKey, orgKey)))
          .returning();

        if (!updatedIndicator?.Id) {
          throw new NotFound('Indicator not found');
        }

        const relationBase = {
          ParentId: id,
          OrgKey: orgKey,
          CreatedByUser: userId,
          ModifiedByUser: userId,
          ModifiedAtTimestamp: sql`statement_timestamp()`,
        };

        // Sync relationships: only delete removed rows, only insert new rows.
        // This avoids spurious audit entries and preserves CreatedAtTimestamp
        // on unchanged relationships.
        await Promise.all([
          // Owners
          relationships.ownerUserIds.length > 0
            ? tx
                .delete(owner)
                .where(
                  and(
                    eq(owner.ParentId, id),
                    notInArray(owner.UserId, relationships.ownerUserIds)
                  )
                )
            : tx.delete(owner).where(eq(owner.ParentId, id)),
          // Owner groups
          relationships.ownerGroupIds.length > 0
            ? tx
                .delete(owner_group)
                .where(
                  and(
                    eq(owner_group.ParentId, id),
                    notInArray(
                      owner_group.UserGroupId,
                      relationships.ownerGroupIds
                    )
                  )
                )
            : tx.delete(owner_group).where(eq(owner_group.ParentId, id)),
          // Contributors
          relationships.contributorUserIds.length > 0
            ? tx
                .delete(contributor)
                .where(
                  and(
                    eq(contributor.ParentId, id),
                    notInArray(
                      contributor.UserId,
                      relationships.contributorUserIds
                    )
                  )
                )
            : tx.delete(contributor).where(eq(contributor.ParentId, id)),
          // Contributor groups
          relationships.contributorGroupIds.length > 0
            ? tx
                .delete(contributor_group)
                .where(
                  and(
                    eq(contributor_group.ParentId, id),
                    notInArray(
                      contributor_group.UserGroupId,
                      relationships.contributorGroupIds
                    )
                  )
                )
            : tx
                .delete(contributor_group)
                .where(eq(contributor_group.ParentId, id)),
          // Tags
          relationships.tagTypeIds.length > 0
            ? tx
                .delete(tag)
                .where(
                  and(
                    eq(tag.ParentId, id),
                    notInArray(tag.TagTypeId, relationships.tagTypeIds)
                  )
                )
            : tx.delete(tag).where(eq(tag.ParentId, id)),
          // Departments
          relationships.departmentTypeIds.length > 0
            ? tx
                .delete(department)
                .where(
                  and(
                    eq(department.ParentId, id),
                    notInArray(
                      department.DepartmentTypeId,
                      relationships.departmentTypeIds
                    )
                  )
                )
            : tx.delete(department).where(eq(department.ParentId, id)),
        ]);

        // Insert new relationships, skipping any that already exist
        await Promise.all([
          relationships.ownerUserIds.length > 0
            ? tx
                .insert(owner)
                .values(
                  relationships.ownerUserIds.map((userId) => ({
                    ...relationBase,
                    UserId: userId,
                  }))
                )
                .onConflictDoNothing()
            : Promise.resolve(),
          relationships.ownerGroupIds.length > 0
            ? tx
                .insert(owner_group)
                .values(
                  relationships.ownerGroupIds.map((userGroupId) => ({
                    ...relationBase,
                    UserGroupId: userGroupId,
                  }))
                )
                .onConflictDoNothing()
            : Promise.resolve(),
          relationships.contributorUserIds.length > 0
            ? tx
                .insert(contributor)
                .values(
                  relationships.contributorUserIds.map((userId) => ({
                    ...relationBase,
                    UserId: userId,
                  }))
                )
                .onConflictDoNothing()
            : Promise.resolve(),
          relationships.contributorGroupIds.length > 0
            ? tx
                .insert(contributor_group)
                .values(
                  relationships.contributorGroupIds.map((userGroupId) => ({
                    ...relationBase,
                    UserGroupId: userGroupId,
                  }))
                )
                .onConflictDoNothing()
            : Promise.resolve(),
          relationships.tagTypeIds.length > 0
            ? tx
                .insert(tag)
                .values(
                  relationships.tagTypeIds.map((tagTypeId) => ({
                    ...relationBase,
                    TagTypeId: tagTypeId,
                  }))
                )
                .onConflictDoNothing()
            : Promise.resolve(),
          relationships.departmentTypeIds.length > 0
            ? tx
                .insert(department)
                .values(
                  relationships.departmentTypeIds.map((departmentTypeId) => ({
                    ...relationBase,
                    DepartmentTypeId: departmentTypeId,
                  }))
                )
                .onConflictDoNothing()
            : Promise.resolve(),
        ]);

        // Upsert schedule
        if (relationships.schedule) {
          const s = relationships.schedule;
          const scheduleValues = {
            Frequency: s.Frequency ?? null,
            ManualDueDate: s.ManualDueDate ?? null,
            StartDate: s.StartDate ?? null,
            TimeToCompleteValue: s.TimeToCompleteValue ?? null,
            TimeToCompleteUnit: s.TimeToCompleteUnit ?? null,
          };
          await tx
            .insert(schedule)
            .values({
              Id: id,
              ...scheduleValues,
              OrgKey: orgKey,
              CreatedByUser: userId,
              ModifiedByUser: userId,
            })
            .onConflictDoUpdate({
              target: schedule.Id,
              set: {
                ...scheduleValues,
                ModifiedByUser: userId,
                ModifiedAtTimestamp: sql`statement_timestamp()`,
              },
            });
        }

        return updatedIndicator;
      } catch (error) {
        logger.error(
          'Failed to update indicator with relationships',
          error as Error
        );
        throw error;
      }
    }),
});
