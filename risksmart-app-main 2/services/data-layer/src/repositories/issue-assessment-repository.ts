import type { ParentType } from '@risksmart-app/domain/src/types/consts/index';
import {
  isParentIssueType,
  issueAssessmentTypeMapping,
} from '@risksmart-app/domain/src/types/consts/parent-issue-type';
import { ParentTypes } from '@risksmart-app/domain/src/types/consts/parent-type';
import type { DB } from '@risksmart-app/drizzle/src/db';
import {
  department,
  issue_assessment,
  issue_parent,
  tag,
} from '@risksmart-app/drizzle/src/schema';
import { BadRequest, NotFound } from 'http-errors';

import type { ServiceContext } from '../types';
import { getLogger } from '../utils/logger';

const logger = getLogger();

export interface IssueAssessmentRelationships {
  parentIssueId: string;
  tagTypeIds: string[];
  departmentTypeIds: string[];
  regulationsBreachedIds: string[];
  associatedControlIds: string[];
  policiesBreachedIds: string[];
}

export function createIssueAssessmentRepository(db: DB['transaction']) {
  return {
    /**
     * Insert an issue assessment with all relationships in a single transaction.
     *
     * Business logic:
     * 1. Look up parent issue to derive assessment Type from issue Type
     * 2. Insert issue_assessment record
     * 3. Insert tags with ParentId = parentIssueId (tags go on parent issue)
     * 4. Insert departments with ParentId = issueAssessmentId (departments go on assessment)
     * 5. Insert issue_parent records for regulations breached, associated controls, policies breached
     */
    insertWithRelationships: async (
      values: Omit<typeof issue_assessment.$inferInsert, 'Type'>,
      relationships: IssueAssessmentRelationships,
      context: ServiceContext
    ) =>
      await db(async (tx) => {
        try {
          const { userId, orgKey } = context;

          // Step 1: Look up parent issue's Type
          const parentIssue = await tx.query.issue.findFirst({
            where: { Id: relationships.parentIssueId },
            columns: { Type: true },
          });

          if (!parentIssue) {
            throw new NotFound(
              `Parent issue not found: ${relationships.parentIssueId}`
            );
          }

          if (!isParentIssueType(parentIssue.Type)) {
            throw new BadRequest(
              `Invalid parent issue type: ${parentIssue.Type}`
            );
          }

          const assessmentType = issueAssessmentTypeMapping[
            parentIssue.Type
          ] as ParentType;

          // Step 2: Insert issue_assessment with derived Type
          const [inserted] = await tx
            .insert(issue_assessment)
            .values({
              ...values,
              Type: assessmentType,
            })
            .returning();

          if (!inserted?.Id) {
            throw new Error('Failed to retrieve inserted issue assessment ID');
          }

          const issueAssessmentId = inserted.Id;

          // Step 3: Insert tags with ParentId = parentIssueId (tags go on the PARENT ISSUE)
          // Step 4: Insert departments with ParentId = issueAssessmentId (departments go on the ASSESSMENT)
          // Step 5: Insert issue_parent records (linking the parent issue to regulations/controls/policies)
          const issueParentRecords = [
            ...relationships.regulationsBreachedIds.map((id) => ({
              IssueId: relationships.parentIssueId,
              ParentId: id,
              ParentType: ParentTypes.Obligation,
              OrgKey: orgKey,
              CreatedByUser: userId,
              ModifiedByUser: userId,
            })),
            ...relationships.associatedControlIds.map((id) => ({
              IssueId: relationships.parentIssueId,
              ParentId: id,
              ParentType: ParentTypes.Control,
              OrgKey: orgKey,
              CreatedByUser: userId,
              ModifiedByUser: userId,
            })),
            ...relationships.policiesBreachedIds.map((id) => ({
              IssueId: relationships.parentIssueId,
              ParentId: id,
              ParentType: ParentTypes.Document,
              OrgKey: orgKey,
              CreatedByUser: userId,
              ModifiedByUser: userId,
            })),
          ];

          await Promise.all([
            relationships.tagTypeIds.length > 0
              ? tx.insert(tag).values(
                  relationships.tagTypeIds.map((tagTypeId) => ({
                    ParentId: relationships.parentIssueId,
                    TagTypeId: tagTypeId,
                    OrgKey: orgKey,
                    CreatedByUser: userId,
                    ModifiedByUser: userId,
                  }))
                )
              : Promise.resolve(),
            relationships.departmentTypeIds.length > 0
              ? tx.insert(department).values(
                  relationships.departmentTypeIds.map((departmentTypeId) => ({
                    ParentId: issueAssessmentId,
                    DepartmentTypeId: departmentTypeId,
                    OrgKey: orgKey,
                    CreatedByUser: userId,
                    ModifiedByUser: userId,
                  }))
                )
              : Promise.resolve(),
            issueParentRecords.length > 0
              ? tx.insert(issue_parent).values(issueParentRecords)
              : Promise.resolve(),
          ]);

          return inserted;
        } catch (error) {
          logger.error(
            'Failed to insert issue assessment with relationships',
            error as Error
          );
          throw error;
        }
      }),
  };
}

export type IssueAssessmentRepository = ReturnType<
  typeof createIssueAssessmentRepository
>;
