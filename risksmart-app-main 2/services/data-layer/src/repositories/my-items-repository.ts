import {
  ActionStatus,
  AssessmentActivityStatus,
  AssessmentStatus,
  AttestationRecordStatus,
  IssueAssessmentStatus,
} from '@risksmart-app/domain/src/types/consts';
import type { DB } from '@risksmart-app/drizzle/src/db';
import { getMyDueItemsActionsQueryConfig } from '@risksmart-app/drizzle/src/queries/action.query';
import { getMyDueItemsAssessmentsQueryConfig } from '@risksmart-app/drizzle/src/queries/assessment.query';
import { getMyDueItemsAssessmentActivitiesConfig } from '@risksmart-app/drizzle/src/queries/assessment-activity.query';
import { getMyDueItemsAttestationRecordsQueryConfig } from '@risksmart-app/drizzle/src/queries/attestation-record.query';
import { getMyDueItemsChangeRequestsQueryConfig } from '@risksmart-app/drizzle/src/queries/change-request.query';
import { getMyDueItemsControlsQueryConfig } from '@risksmart-app/drizzle/src/queries/control.query';
import { getMyDueItemsDocumentQueryConfig } from '@risksmart-app/drizzle/src/queries/document.query';
import { getMyDueItemsIndicatorsQueryConfig } from '@risksmart-app/drizzle/src/queries/indicator.query';
import { getMyDueItemsIssuesQueryConfig } from '@risksmart-app/drizzle/src/queries/issue.query';
import { getMyDueItemsObligationsQueryConfig } from '@risksmart-app/drizzle/src/queries/obligation.query';
import { getMyDueItemsRisksQueryConfig } from '@risksmart-app/drizzle/src/queries/risk.query';
import { ancestor_contributor_view } from '@risksmart-app/drizzle/src/schema';
import { and, eq, inArray } from 'drizzle-orm';
import type {
  GetMyDueItemsActionsResponseRow,
  GetMyDueItemsAssessmentActivitiesResponseRow,
  getMyDueItemsAssessmentsResponseRow,
  GetMyDueItemsAttestationRecordsResponseRow,
  GetMyDueItemsChangeRequestsResponseRow,
  GetMyDueItemsControlsResponseRow,
  GetMyDueItemsDocumentsResponseRow,
  GetMyDueItemsIndicatorsResponseRow,
  GetMyDueItemsIssuesResponseRow,
  GetMyDueItemsObligationsResponseRow,
  GetMyDueItemsRisksResponseRow,
} from 'src/types';

import type { OwnershipFilter } from '../handlers/http/client/processors/my-items/ownership-filter-schema';
import { getLogger } from '../utils/logger';

const logger = getLogger();

const buildOwnershipConditions = (filter: OwnershipFilter) => {
  const conditions: Record<string, unknown>[] = [];

  const getAncestorContributorsConditions = (
    contributorType: 'contributor' | 'owner',
    isNull: boolean
  ) => ({
    AND: [
      { UserId: { eq: filter.userId } },
      { ContributorType: { eq: contributorType } },
      { UserGroupId: { isNull: isNull } },
    ],
  });

  if (filter.owner) {
    conditions.push({ owners: { UserId: { eq: filter.userId } } });
  }

  if (filter.contributor) {
    conditions.push({ contributors: { UserId: { eq: filter.userId } } });
  }

  if (filter.groupOwner) {
    conditions.push({
      ownerGroups: { group: { users: { UserId: { eq: filter.userId } } } },
    });
  }

  if (filter.groupContributor) {
    conditions.push({
      contributorGroups: {
        group: { users: { UserId: { eq: filter.userId } } },
      },
    });
  }

  if (filter.inheritedOwner) {
    conditions.push({
      AND: [
        { NOT: { owners: { UserId: { eq: filter.userId } } } },
        {
          ancestorContributors: getAncestorContributorsConditions(
            'owner',
            true
          ),
        },
      ],
    });
  }

  if (filter.inheritedGroupOwner) {
    conditions.push({
      AND: [
        {
          NOT: {
            ownerGroups: {
              group: { users: { UserId: { eq: filter.userId } } },
            },
          },
        },
        {
          ancestorContributors: getAncestorContributorsConditions(
            'owner',
            false
          ),
        },
      ],
    });
  }

  if (filter.inheritedContributor) {
    conditions.push({
      AND: [
        {
          NOT: { contributors: { UserId: { eq: filter.userId } } },
        },
        {
          ancestorContributors: getAncestorContributorsConditions(
            'contributor',
            true
          ),
        },
      ],
    });
  }

  if (filter.inheritedGroupContributor) {
    conditions.push({
      AND: [
        {
          NOT: {
            contributorGroups: {
              group: { users: { UserId: { eq: filter.userId } } },
            },
          },
        },
        {
          ancestorContributors: getAncestorContributorsConditions(
            'contributor',
            false
          ),
        },
      ],
    });
  }

  return conditions;
};

const NEVER_MATCH = { Id: { isNull: true } };

const buildWhereWithOwnership = <T extends Record<string, unknown>>(
  baseConditions: T,
  ownershipConditions: Record<string, unknown>[],
  isOwnershipFilterProvided: boolean
): Record<string, unknown> => {
  if (ownershipConditions.length === 0) {
    // If an ownership filter was explicitly provided but produced no conditions
    // (all values are false), return a never-matching filter
    if (isOwnershipFilterProvided) {
      return { ...baseConditions, AND: [NEVER_MATCH] };
    }

    return baseConditions;
  }

  return {
    ...baseConditions,
    OR: ownershipConditions,
  };
};

export function createMyItemsRepository(db: DB['transaction']) {
  return {
    getDueActions: async (
      date: string,
      ownershipFilter?: OwnershipFilter
    ): Promise<GetMyDueItemsActionsResponseRow[]> => {
      try {
        logger.info('Getting my due items actions', { date });

        const baseConditions = {
          Status: { ne: ActionStatus.Closed },
          DateDue: { lte: date },
        };

        const ownershipConditions = ownershipFilter
          ? buildOwnershipConditions(ownershipFilter)
          : [];

        return await db((tx) => {
          return tx.query.action.findMany({
            ...getMyDueItemsActionsQueryConfig,
            where: buildWhereWithOwnership(
              baseConditions,
              ownershipConditions,
              !!ownershipFilter
            ),
          });
        });
      } catch (error) {
        logger.error('Failed to query my due items actions', { error, date });
        throw error;
      }
    },
    getDueAssessments: async (
      date: string,
      ownershipFilter?: OwnershipFilter
    ): Promise<getMyDueItemsAssessmentsResponseRow[]> => {
      try {
        logger.info('Getting my due items assessments', { date });

        const baseConditions = {
          Status: { ne: AssessmentStatus.Complete },
          TargetCompletionDate: { lte: date },
        };

        const ownershipConditions = ownershipFilter
          ? buildOwnershipConditions(ownershipFilter)
          : [];

        return await db((tx) => {
          return tx.query.assessment.findMany({
            ...getMyDueItemsAssessmentsQueryConfig,
            where: buildWhereWithOwnership(
              baseConditions,
              ownershipConditions,
              !!ownershipFilter
            ),
          });
        });
      } catch (error) {
        logger.error('Failed to query my due items assessments', {
          error,
          date,
        });
        throw error;
      }
    },
    getDueAssessmentActivities: async (
      date: string,
      ownershipFilter?: OwnershipFilter
    ): Promise<GetMyDueItemsAssessmentActivitiesResponseRow[]> => {
      try {
        logger.info('Getting my due items assessment activities', { date });

        const baseConditions = {
          IsRCSA: { eq: true },
          Status: { ne: AssessmentActivityStatus.Complete },
          parentRisk: { scheduleState: { DueDate: { lte: date } } },
        };

        const ownershipConditions = ownershipFilter
          ? buildOwnershipConditions(ownershipFilter)
          : [];

        const assessmentActivityOwnershipConditions =
          ownershipConditions.filter((condition) => {
            return 'owners' in condition || 'ownerGroups' in condition;
          });

        return await db((tx) => {
          return tx.query.assessment_activity.findMany({
            ...getMyDueItemsAssessmentActivitiesConfig,
            where: buildWhereWithOwnership(
              baseConditions,
              assessmentActivityOwnershipConditions,
              !!ownershipFilter
            ),
          });
        });
      } catch (error) {
        logger.error('Failed to query my due items assessment activities', {
          error,
          date,
        });
        throw error;
      }
    },
    getDueAttestationRecords: async (
      userId: string,
      date: string
    ): Promise<GetMyDueItemsAttestationRecordsResponseRow[]> => {
      try {
        logger.info('Getting my due items attestation records', {
          userId,
          date,
        });

        return await db((tx) => {
          return tx.query.attestation_record.findMany({
            ...getMyDueItemsAttestationRecordsQueryConfig,
            where: {
              UserId: { eq: userId },
              AttestationStatus: { eq: AttestationRecordStatus.Pending },
              ExpiresAt: { lte: date },
            },
          });
        });
      } catch (error) {
        logger.error('Failed to query my due items attestation records', {
          error,
          userId,
          date,
        });
        throw error;
      }
    },
    getDueControls: async (
      date: string,
      ownershipFilter?: OwnershipFilter
    ): Promise<GetMyDueItemsControlsResponseRow[]> => {
      try {
        logger.info('Getting my due items controls', { date });

        const baseConditions = {
          scheduleState: { DueDate: { lte: date } },
        };

        const ownershipConditions = ownershipFilter
          ? buildOwnershipConditions(ownershipFilter)
          : [];

        return await db((tx) => {
          return tx.query.control.findMany({
            ...getMyDueItemsControlsQueryConfig,
            where: buildWhereWithOwnership(
              baseConditions,
              ownershipConditions,
              !!ownershipFilter
            ),
          });
        });
      } catch (error) {
        logger.error('Failed to query my due items controls', {
          error,
          date,
        });
        throw error;
      }
    },
    getDueDocuments: async (
      date: string,
      ownershipFilter?: OwnershipFilter
    ): Promise<GetMyDueItemsDocumentsResponseRow[]> => {
      try {
        logger.info('Getting my due items documents', { date });

        const baseConditions = {
          scheduleState: { DueDate: { lte: date } },
        };

        const ownershipConditions = ownershipFilter
          ? buildOwnershipConditions(ownershipFilter)
          : [];

        return await db((tx) => {
          return tx.query.document.findMany({
            ...getMyDueItemsDocumentQueryConfig,
            where: buildWhereWithOwnership(
              baseConditions,
              ownershipConditions,
              !!ownershipFilter
            ),
          });
        });
      } catch (error) {
        logger.error('Failed to query my due items documents', {
          error,
          date,
        });
        throw error;
      }
    },
    getDueIndicators: async (
      date: string,
      ownershipFilter?: OwnershipFilter
    ): Promise<GetMyDueItemsIndicatorsResponseRow[]> => {
      try {
        logger.info('Getting my due items indicators', { date });

        const baseConditions = {
          scheduleState: { DueDate: { lte: date } },
        };

        const ownershipConditions = ownershipFilter
          ? buildOwnershipConditions(ownershipFilter)
          : [];

        return await db((tx) => {
          return tx.query.indicator.findMany({
            ...getMyDueItemsIndicatorsQueryConfig,
            where: buildWhereWithOwnership(
              baseConditions,
              ownershipConditions,
              !!ownershipFilter
            ),
          });
        });
      } catch (error) {
        logger.error('Failed to query my due items indicators', {
          error,
          date,
        });
        throw error;
      }
    },
    getDueIssues: async (
      date: string,
      ownershipFilter?: OwnershipFilter
    ): Promise<GetMyDueItemsIssuesResponseRow[]> => {
      try {
        logger.info('Getting my due items issues', { date });

        const baseConditions = {
          assessment: {
            Status: { ne: IssueAssessmentStatus.Closed },
            TargetCloseDate: { lte: date },
          },
        };

        const ownershipConditions = ownershipFilter
          ? buildOwnershipConditions(ownershipFilter)
          : [];

        return await db((tx) => {
          return tx.query.issue.findMany({
            ...getMyDueItemsIssuesQueryConfig,
            where: buildWhereWithOwnership(
              baseConditions,
              ownershipConditions,
              !!ownershipFilter
            ),
          });
        });
      } catch (error) {
        logger.error('Failed to query my due items issues', { error, date });
        throw error;
      }
    },
    getDueObligations: async (
      date: string,
      ownershipFilter?: OwnershipFilter
    ): Promise<GetMyDueItemsObligationsResponseRow[]> => {
      try {
        logger.info('Getting my due items obligations', { date });

        const baseConditions = {
          scheduleState: { DueDate: { lte: date } },
        };

        const ownershipConditions = ownershipFilter
          ? buildOwnershipConditions(ownershipFilter)
          : [];

        return await db((tx) => {
          return tx.query.obligation.findMany({
            ...getMyDueItemsObligationsQueryConfig,
            where: buildWhereWithOwnership(
              baseConditions,
              ownershipConditions,
              !!ownershipFilter
            ),
          });
        });
      } catch (error) {
        logger.error('Failed to query my due items obligations', {
          error,
          date,
        });
        throw error;
      }
    },
    getDueRisks: async (
      date: string,
      ownershipFilter?: OwnershipFilter
    ): Promise<GetMyDueItemsRisksResponseRow[]> => {
      try {
        logger.info('Getting my due items risks', { date });

        const baseConditions = {
          scheduleState: { DueDate: { lte: date } },
        };

        const ownershipConditions = ownershipFilter
          ? buildOwnershipConditions(ownershipFilter)
          : [];

        return await db((tx) => {
          return tx.query.risk.findMany({
            ...getMyDueItemsRisksQueryConfig,
            where: buildWhereWithOwnership(
              baseConditions,
              ownershipConditions,
              !!ownershipFilter
            ),
          });
        });
      } catch (error) {
        logger.error('Failed to query my due items risks', { error, date });
        throw error;
      }
    },
    getDueChangeRequests: async (
      date: string,
      userId: string
    ): Promise<GetMyDueItemsChangeRequestsResponseRow[]> => {
      try {
        logger.info('Getting my due items change requests', { date, userId });

        const changeRequests = await db((tx) => {
          return tx.query.change_request.findMany({
            ...getMyDueItemsChangeRequestsQueryConfig,
          });
        });

        const parentOwnerAndContributors =
          changeRequests.length > 0
            ? await db((tx) => {
                return tx
                  .selectDistinctOn([ancestor_contributor_view.UserId], {
                    Id: ancestor_contributor_view.Id,
                    UserId: ancestor_contributor_view.UserId,
                  })
                  .from(ancestor_contributor_view)
                  .where(
                    and(
                      inArray(
                        ancestor_contributor_view.Id,
                        changeRequests.map((cr) => cr.ParentId)
                      ),
                      eq(ancestor_contributor_view.ContributorType, 'owner'),
                      eq(ancestor_contributor_view.UserId, userId)
                    )
                  );
              })
            : [];

        const ownersByParentId = new Map<
          string,
          typeof parentOwnerAndContributors
        >();

        for (const owner of parentOwnerAndContributors) {
          if (owner.Id) {
            if (!ownersByParentId.has(owner.Id)) {
              ownersByParentId.set(owner.Id, []);
            }
            ownersByParentId.get(owner.Id)!.push(owner);
          }
        }

        return changeRequests.map((changeRequest) => ({
          ...changeRequest,
          currentUserOwnerList:
            (changeRequest.parent?.Id
              ? ownersByParentId.get(changeRequest.parent.Id)
              : []) || [],
        }));
      } catch (error) {
        logger.error('Failed to query my due items change requests', {
          error,
          date,
        });
        throw error;
      }
    },
  };
}
