import type { TestFrequency } from '@risksmart-app/domain/src/types/consts/test-frequency';
import type { UnitOfTime } from '@risksmart-app/domain/src/types/consts/unit-of-time';
import type { DB } from '@risksmart-app/drizzle/src/db';
import {
  contributor,
  contributor_group,
  control,
  control_parent,
  department,
  owner,
  owner_group,
  schedule,
  schedule_state,
  tag,
} from '@risksmart-app/drizzle/src/schema';

import type { ServiceContext } from '../types';
import { getLogger } from '../utils/logger';

const logger = getLogger();

export type ControlRepository = ReturnType<typeof createControlRepository>;

export interface ControlRelationships {
  parentId: string | null;
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

export function createControlRepository(db: DB['transaction']) {
  return {
    insertWithRelationships: async (
      values: typeof control.$inferInsert,
      relationships: ControlRelationships,
      context: ServiceContext
    ) =>
      await db(async (tx) => {
        try {
          const [insertedControl] = await tx
            .insert(control)
            .values(values)
            .returning();

          if (!insertedControl?.Id) {
            throw new Error('Failed to retrieve inserted control ID');
          }

          const controlId = insertedControl.Id;
          const { userId, orgKey } = context;
          const relationBase = {
            ParentId: controlId,
            OrgKey: orgKey,
            CreatedByUser: userId,
            ModifiedByUser: userId,
          };

          // Insert control_parent relationship (only if parentId is provided)
          if (relationships.parentId) {
            await tx.insert(control_parent).values({
              ControlId: controlId,
              ParentId: relationships.parentId,
              OrgKey: orgKey,
              CreatedByUser: userId,
              ModifiedByUser: userId,
            });
          }

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

          // Schedule uses the same UUID as the control (1-to-1 shared primary key).
          // Insert inside the same transaction so it rolls back with the control on failure.
          if (relationships.schedule) {
            const s = relationships.schedule;
            await tx.insert(schedule).values({
              Id: controlId,
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
              Id: controlId,
              LatestDate: ss.LatestDate ?? null,
              DueDate: ss.DueDate ?? null,
              OverdueDate: ss.OverdueDate ?? null,
              OrgKey: orgKey,
              CreatedByUser: userId,
              ModifiedByUser: 'SYSTEM',
            });
          }

          return insertedControl;
        } catch (error) {
          logger.error(
            'Failed to insert control with relationships',
            error as Error
          );
          throw error;
        }
      }),
  };
}
