import type { DB } from '@risksmart-app/drizzle/src/db';
import {
  assessment,
  contributor,
  contributor_group,
  department,
  owner,
  owner_group,
  tag,
} from '@risksmart-app/drizzle/src/schema';
import { and, eq, notInArray, sql } from 'drizzle-orm';

import type { ServiceContext } from '../types';
import { getLogger } from '../utils/logger';

const logger = getLogger();

export type AssessmentRepository = ReturnType<
  typeof createAssessmentRepository
>;

export interface AssessmentRelationships {
  ownerUserIds: string[];
  ownerGroupIds: string[];
  contributorUserIds: string[];
  contributorGroupIds: string[];
  tagTypeIds: string[];
  departmentTypeIds: string[];
}

export function createAssessmentRepository(db: DB['transaction']) {
  return {
    insertWithRelationships: async (
      values: typeof assessment.$inferInsert,
      relationships: AssessmentRelationships,
      context: ServiceContext
    ) =>
      await db(async (tx) => {
        try {
          const [insertedAssessment] = await tx
            .insert(assessment)
            .values(values)
            .returning();

          if (!insertedAssessment?.Id) {
            throw new Error('Failed to retrieve inserted assessment ID');
          }

          const parentId = insertedAssessment.Id;
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

          return insertedAssessment;
        } catch (error) {
          logger.error(
            'Failed to insert assessment with relationships',
            error as Error
          );
          throw error;
        }
      }),

    updateWithRelationships: async (
      id: string,
      values: Partial<typeof assessment.$inferInsert>,
      relationships: AssessmentRelationships,
      context: ServiceContext
    ) =>
      await db(async (tx) => {
        try {
          const [updatedAssessment] = await tx
            .update(assessment)
            .set({
              ...values,
              ModifiedAtTimestamp: sql`statement_timestamp()`,
            })
            .where(
              and(eq(assessment.Id, id), eq(assessment.OrgKey, context.orgKey))
            )
            .returning();

          if (!updatedAssessment?.Id) {
            throw new Error('Failed to retrieve updated assessment');
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

          return updatedAssessment;
        } catch (error) {
          logger.error(
            'Failed to update assessment with relationships',
            error as Error
          );
          throw error;
        }
      }),

    /**
     * Delete an assessment by ID
     * Returns the number of affected rows
     */
    delete: async (id: string): Promise<number> => {
      try {
        logger.info('Deleting assessment', { id });

        const result = await db(async (tx) => {
          return tx
            .delete(assessment)
            .where(eq(assessment.Id, id))
            .returning({ Id: assessment.Id });
        });

        if (result.length === 0) {
          logger.info('No assessment deleted (not found or concurrency)', {
            id,
          });
        } else {
          logger.info('Assessment deleted', { id });
        }

        return result.length;
      } catch (error) {
        logger.error('Failed to delete assessment', {
          error,
          id,
        });
        throw error;
      }
    },
  };
}
