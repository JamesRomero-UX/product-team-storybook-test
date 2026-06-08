import type { ParentType } from '@risksmart-app/domain/src/types/consts/index';
import { ParentTypes } from '@risksmart-app/domain/src/types/consts/parent-type';
import type { DB } from '@risksmart-app/drizzle/src/db';
import {
  contributor,
  contributor_group,
  department,
  issue,
  issue_parent,
  owner,
  owner_group,
  tag,
} from '@risksmart-app/drizzle/src/schema';
import { and, eq, inArray, notInArray, sql } from 'drizzle-orm';
import { BadRequest, Conflict } from 'http-errors';

import type { ServiceContext } from '../types';
import { getLogger } from '../utils/logger';

const ALLOWED_ISSUE_PARENT_TYPES: ParentType[] = [
  ParentTypes.Obligation,
  ParentTypes.Document,
  ParentTypes.Control,
  ParentTypes.Assessment,
  ParentTypes.ComplianceMonitoringAssessment,
  ParentTypes.InternalAuditReport,
  ParentTypes.InternalAuditEntity,
  ParentTypes.ThirdParty,
];

const logger = getLogger();

export interface IssueRelationships {
  parentId?: string | null;
  ownerUserIds: string[];
  ownerGroupIds: string[];
  contributorUserIds: string[];
  contributorGroupIds: string[];
  tagTypeIds: string[];
  departmentTypeIds: string[];
}

export function createIssueRepository(db: DB['transaction']) {
  return {
    deleteMany: async (ids: string[]) =>
      await db(async (tx) => {
        try {
          logger.info('Deleting one or more issues', {
            ids,
            count: ids.length,
          });

          const result = await tx
            .delete(issue)
            .where(inArray(issue.Id, ids))
            .returning({ Id: issue.Id });

          if (result.length !== ids.length) {
            logger.warn(
              'Mismatch in number of deleted issues, rolling back transaction',
              {
                expectedCount: ids.length,
                actualCount: result.length,
              }
            );

            tx.rollback();
          }

          return result.length;
        } catch (error) {
          logger.error('Failed to delete from issue table', error as Error);
          throw error;
        }
      }),

    insert: async (values: typeof issue.$inferInsert) =>
      await db(async (tx) => {
        try {
          return tx.insert(issue).values(values).returning();
        } catch (error) {
          logger.error('Failed to insert into issue table', error as Error);
          throw error;
        }
      }),

    /**
     * Insert an issue with all relationships in a single transaction
     * Handles issue_parent, owners, contributors, tags, departments
     */
    insertWithRelationships: async (
      values: typeof issue.$inferInsert,
      relationships: IssueRelationships,
      context: ServiceContext
    ) =>
      await db(async (tx) => {
        try {
          const [insertedIssue] = await tx
            .insert(issue)
            .values(values)
            .returning();

          if (!insertedIssue?.Id) {
            throw new Error('Failed to retrieve inserted issue ID');
          }

          const issueId = insertedIssue.Id;
          const { userId, orgKey } = context;
          const relationBase = {
            ParentId: issueId,
            OrgKey: orgKey,
            CreatedByUser: userId,
            ModifiedByUser: userId,
          };

          // Insert issue_parent relationship (only if parentId is provided)
          if (relationships.parentId) {
            // Look up the parent node's ObjectType for the ParentType field
            const parentNode = await tx.query.node.findFirst({
              where: { Id: relationships.parentId },
              columns: { ObjectType: true },
            });

            if (!parentNode) {
              throw new Error(
                `Parent node not found: ${relationships.parentId}`
              );
            }

            if (!ALLOWED_ISSUE_PARENT_TYPES.includes(parentNode.ObjectType)) {
              throw new BadRequest(
                `Invalid parent type: ${parentNode.ObjectType}. Issues can only be created under: ${ALLOWED_ISSUE_PARENT_TYPES.join(', ')}`
              );
            }

            await tx.insert(issue_parent).values({
              IssueId: issueId,
              ParentId: relationships.parentId,
              ParentType: parentNode.ObjectType,
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

          return insertedIssue;
        } catch (error) {
          logger.error(
            'Failed to insert issue with relationships',
            error as Error
          );
          throw error;
        }
      }),

    /**
     * Update an issue with all relationships in a single transaction
     * Uses optimistic locking via OriginalTimestamp to prevent concurrent overwrites
     * Uses diff-based sync: delete removed rows, insert new rows
     */
    updateWithRelationships: async (
      id: string,
      values: Partial<typeof issue.$inferInsert>,
      relationships: IssueRelationships,
      context: ServiceContext,
      originalTimestamp: string
    ) =>
      await db(async (tx) => {
        try {
          const { userId, orgKey } = context;

          // Fetch current record for optimistic locking
          const existing = await tx
            .select({ ModifiedAtTimestamp: issue.ModifiedAtTimestamp })
            .from(issue)
            .where(and(eq(issue.Id, id), eq(issue.OrgKey, orgKey)));

          if (existing.length === 0) {
            throw new BadRequest('Issue not found');
          }

          const currentTimestamp = new Date(
            String(existing[0]!.ModifiedAtTimestamp)
          ).toISOString();

          if (currentTimestamp !== originalTimestamp) {
            throw new Conflict(
              'Record has been modified by another user. Please refresh and try again.'
            );
          }

          const [updatedIssue] = await tx
            .update(issue)
            .set({
              ...values,
              ModifiedAtTimestamp: sql`statement_timestamp()`,
              ModifiedByUser: userId,
            })
            .where(and(eq(issue.Id, id), eq(issue.OrgKey, orgKey)))
            .returning();

          if (!updatedIssue?.Id) {
            throw new Error('Failed to retrieve updated issue');
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

          return updatedIssue;
        } catch (error) {
          logger.error(
            'Failed to update issue with relationships',
            error as Error
          );
          throw error;
        }
      }),
  };
}

export type IssueRepository = ReturnType<typeof createIssueRepository>;
