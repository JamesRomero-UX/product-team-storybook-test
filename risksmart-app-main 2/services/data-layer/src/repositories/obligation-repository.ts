import type { TestFrequency } from '@risksmart-app/domain/src/types/consts/test-frequency';
import type { UnitOfTime } from '@risksmart-app/domain/src/types/consts/unit-of-time';
import type { ObligationId } from '@risksmart-app/domain/src/types/obligation';
import { obligationIdSchema } from '@risksmart-app/domain/src/types/obligation';
import type { RegulatorySourceId } from '@risksmart-app/domain/src/types/regulatory-source';
import { type DB } from '@risksmart-app/drizzle/src/db';
import {
  contributor,
  contributor_group,
  department,
  obligation,
  owner,
  owner_group,
  schedule,
  schedule_state,
  tag,
} from '@risksmart-app/drizzle/src/schema';
import { and, eq, inArray, sql } from 'drizzle-orm';

import type { ServiceContext } from '../types';
import { getLogger } from '../utils/logger';

const logger = getLogger();

export type ObligationRepository = ReturnType<
  typeof createObligationRepository
>;

export interface ObligationRelationships {
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

export function createObligationRepository(db: DB['transaction']) {
  const getIdsByExternalIds = async (
    externalIds: string[],
    orgKey: string,
    regulatorySourceId: RegulatorySourceId
  ): Promise<
    Map<string, { obligationId: ObligationId; parentId: ObligationId | null }>
  > => {
    if (externalIds.length === 0) {
      return new Map();
    }

    return await db(async (tx) => {
      const results = await tx
        .select({
          Id: obligation.Id,
          ExternalId: obligation.ExternalId,
          ParentId: obligation.ParentId,
        })
        .from(obligation)
        .where(
          and(
            inArray(obligation.ExternalId, externalIds),
            eq(obligation.OrgKey, orgKey),
            eq(obligation.RegulatorySourceId, regulatorySourceId)
          )
        );

      return new Map(
        results
          .filter((r) => r.ExternalId !== null)
          .map((r) => [
            r.ExternalId!,
            {
              obligationId: obligationIdSchema.parse(r.Id),
              parentId: r.ParentId
                ? obligationIdSchema.parse(r.ParentId)
                : null,
            },
          ])
      );
    });
  };

  const upsertExternalObligations = async (
    values: (typeof obligation.$inferInsert)[]
  ): Promise<(typeof obligation.$inferInsert)[]> =>
    await db(async (tx) => {
      // Batching these to avoid call stack size error. https://github.com/drizzle-team/drizzle-orm/issues/1740
      const batchSize = 100;

      const results: (typeof obligation.$inferInsert)[] = [];

      for (let i = 0; i < values.length; i += batchSize) {
        const batch = values.slice(i, i + batchSize);
        try {
          const inserted = await tx
            .insert(obligation)
            .values(batch)
            .onConflictDoUpdate({
              target: [
                obligation.OrgKey,
                obligation.RegulatorySourceId,
                obligation.ExternalId,
              ],
              set: {
                Title: sql`EXCLUDED."Title"`,
                Description: sql`EXCLUDED."Description"`,
                Interpretation: sql`EXCLUDED."Interpretation"`,
                Adherence: sql`EXCLUDED."Adherence"`,
                ContentHash: sql`EXCLUDED."ContentHash"`,
                ModifiedByUser: sql`EXCLUDED."ModifiedByUser"`,
                ModifiedAtTimestamp: sql`statement_timestamp()`,
                ExternalSyncedAt: sql`EXCLUDED."ExternalSyncedAt"`,
                ParentId: sql`EXCLUDED."ParentId"`,
              },
              where: sql`obligation."ContentHash" IS DISTINCT FROM EXCLUDED."ContentHash"`,
            })
            .returning();
          results.push(...inserted);
        } catch (error) {
          logger.error(
            'Failed to upsert batch into obligation table',
            error as Error
          );
          throw error;
        }
      }

      return results;
    });

  const insertWithRelationships = async (
    values: typeof obligation.$inferInsert,
    relationships: ObligationRelationships,
    context: ServiceContext
  ) =>
    await db(async (tx) => {
      try {
        const [insertedObligation] = await tx
          .insert(obligation)
          .values(values)
          .returning();

        if (!insertedObligation?.Id) {
          throw new Error('Failed to retrieve inserted obligation ID');
        }

        const parentId = insertedObligation.Id;
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

        // Schedule uses the same UUID as the obligation (1-to-1 shared primary key).
        // Insert inside the same transaction so it rolls back with the obligation on failure.
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

        return insertedObligation;
      } catch (error) {
        logger.error(
          'Failed to insert obligation with relationships',
          error as Error
        );
        throw error;
      }
    });

  return {
    upsertExternalObligations,
    getIdsByExternalIds,
    insertWithRelationships,
  };
}
