import type { TestFrequency } from '@risksmart-app/domain/src/types/consts/test-frequency';
import type { UnitOfTime } from '@risksmart-app/domain/src/types/consts/unit-of-time';
import type { DB } from '@risksmart-app/drizzle/src/db';
import {
  contributor,
  contributor_group,
  department,
  owner,
  owner_group,
  risk,
  schedule,
  schedule_state,
  tag,
} from '@risksmart-app/drizzle/src/schema';
import { and, eq, notInArray, sql } from 'drizzle-orm';

import type { ServiceContext } from '../types';
import { getLogger } from '../utils/logger';

const logger = getLogger();

export type RiskRepository = ReturnType<typeof createRiskRepository>;

export interface RiskRelationships {
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
  scheduleState?: {
    DueDate?: string | null;
    OverdueDate?: string | null;
    LatestDate?: string | null;
  } | null;
}

export function createRiskRepository(db: DB['transaction']) {
  return {
    insert: async (values: typeof risk.$inferInsert) =>
      await db(async (tx) => {
        try {
          return tx.insert(risk).values(values).returning();
        } catch (error) {
          logger.error('Failed to insert into risk table', error as Error);
          throw error;
        }
      }),

    insertWithRelationships: async (
      values: typeof risk.$inferInsert,
      relationships: RiskRelationships,
      context: ServiceContext
    ) =>
      await db(async (tx) => {
        try {
          const [insertedRisk] = await tx
            .insert(risk)
            .values(values)
            .returning();

          if (!insertedRisk?.Id) {
            throw new Error('Failed to retrieve inserted risk ID');
          }

          const parentId = insertedRisk.Id;
          const { userId, orgKey } = context;
          const relationBase = {
            ParentId: parentId,
            OrgKey: orgKey,
            CreatedByUser: userId,
            ModifiedByUser: userId,
          };

          await Promise.all([
            relationships.ownerUserIds.length > 0
              ? tx.insert(owner).values(
                  relationships.ownerUserIds.map((userId) => ({
                    ...relationBase,
                    UserId: userId,
                  }))
                )
              : Promise.resolve(),
            relationships.ownerGroupIds.length > 0
              ? tx.insert(owner_group).values(
                  relationships.ownerGroupIds.map((userGroupId) => ({
                    ...relationBase,
                    UserGroupId: userGroupId,
                  }))
                )
              : Promise.resolve(),
            relationships.contributorUserIds.length > 0
              ? tx.insert(contributor).values(
                  relationships.contributorUserIds.map((userId) => ({
                    ...relationBase,
                    UserId: userId,
                  }))
                )
              : Promise.resolve(),
            relationships.contributorGroupIds.length > 0
              ? tx.insert(contributor_group).values(
                  relationships.contributorGroupIds.map((userGroupId) => ({
                    ...relationBase,
                    UserGroupId: userGroupId,
                  }))
                )
              : Promise.resolve(),
            relationships.tagTypeIds.length > 0
              ? tx.insert(tag).values(
                  relationships.tagTypeIds.map((tagTypeId) => ({
                    ...relationBase,
                    TagTypeId: tagTypeId,
                  }))
                )
              : Promise.resolve(),
            relationships.departmentTypeIds.length > 0
              ? tx.insert(department).values(
                  relationships.departmentTypeIds.map((departmentTypeId) => ({
                    ...relationBase,
                    DepartmentTypeId: departmentTypeId,
                  }))
                )
              : Promise.resolve(),
          ]);

          // Schedule uses the same UUID as the risk (1-to-1 shared primary key).
          // Insert inside the same transaction so it rolls back with the risk on failure.
          if (relationships.schedule) {
            const s = relationships.schedule;
            await tx.insert(schedule).values({
              Id: parentId,
              Frequency: s.Frequency ?? null,
              ManualDueDate: s.ManualDueDate ?? null,
              StartDate: s.StartDate ?? null,
              TimeToCompleteValue: s.TimeToCompleteValue ?? null,
              TimeToCompleteUnit: s.TimeToCompleteUnit ?? null,
              OrgKey: orgKey,
              CreatedByUser: userId,
              ModifiedByUser: userId,
            });
          }

          // Insert pre-calculated schedule_state if provided by the caller.
          if (relationships.scheduleState) {
            const ss = relationships.scheduleState;
            await tx.insert(schedule_state).values({
              Id: parentId,
              LatestDate: ss.LatestDate ?? null,
              DueDate: ss.DueDate ?? null,
              OverdueDate: ss.OverdueDate ?? null,
              OrgKey: orgKey,
              CreatedByUser: userId,
              ModifiedByUser: 'SYSTEM',
            });
          }

          return insertedRisk;
        } catch (error) {
          logger.error(
            'Failed to insert risk with relationships',
            error as Error
          );
          throw error;
        }
      }),

    updateWithRelationships: async (
      id: string,
      values: Partial<typeof risk.$inferInsert>,
      relationships: RiskRelationships,
      context: ServiceContext
    ) =>
      await db(async (tx) => {
        try {
          const [updatedRisk] = await tx
            .update(risk)
            .set({
              ...values,
              ModifiedAtTimestamp: sql`statement_timestamp()`,
            })
            .where(and(eq(risk.Id, id), eq(risk.OrgKey, context.orgKey)))
            .returning();

          if (!updatedRisk?.Id) {
            throw new Error('Failed to retrieve updated risk');
          }

          const { userId, orgKey } = context;
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

          return updatedRisk;
        } catch (error) {
          logger.error(
            'Failed to update risk with relationships',
            error as Error
          );
          throw error;
        }
      }),

    /**
     * Delete a risk by ID
     * Returns the number of affected rows
     */
    delete: async (id: string): Promise<number> => {
      try {
        logger.info('Deleting risk', { id });

        const result = await db(async (tx) => {
          return tx
            .delete(risk)
            .where(eq(risk.Id, id))
            .returning({ Id: risk.Id });
        });

        if (result.length === 0) {
          logger.info('No risk deleted (not found or concurrency)', {
            id,
          });
        } else {
          logger.info('Risk deleted', { id });
        }

        return result.length;
      } catch (error) {
        logger.error('Failed to delete risk', {
          error,
          id,
        });
        throw error;
      }
    },
  };
}
