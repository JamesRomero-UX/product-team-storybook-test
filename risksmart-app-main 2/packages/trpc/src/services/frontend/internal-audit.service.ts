import { createDrizzleClient } from '@risksmart-app/drizzle/src/db';
import { getActionsByInternalAuditReportIdQueryConfig } from '@risksmart-app/drizzle/src/queries/action.query';
import { getImpactsByInternalAuditReportIdQueryConfig } from '@risksmart-app/drizzle/src/queries/impact.query';
import { getImpactInternalAuditRatingByInternalAuditReportIdQueryConfig } from '@risksmart-app/drizzle/src/queries/impact-rating.query';
import {
  getInternalAuditByIdQueryConfig,
  getInternalAuditEntityRegisterQueryConfig,
} from '@risksmart-app/drizzle/src/queries/internal-audit-entity.query';
import {
  getInternalAuditReportByIdQueryConfig,
  getInternalAuditReportByOriginatingItemIdQueryConfig,
  getInternalAuditReportRegisterQueryConfig,
} from '@risksmart-app/drizzle/src/queries/internal-audit-report.query';
import {
  getControlTestInternalAuditResultsQueryConfig,
  getDocumentInternalAuditResultsQueryConfig,
  getInternalAuditResultByIdQueryConfig,
  getLatestDocumentInternalAuditResultByDocumentIdQueryConfig,
  getObligationInternalAuditResultsQueryConfig,
  getRiskControlledInternalAuditResultsQueryConfig,
  getRiskUncontrolledInternalAuditResultsQueryConfig,
} from '@risksmart-app/drizzle/src/queries/internal-audit-result.query';
import { getInternalAuditTestResultByIdQueryConfig } from '@risksmart-app/drizzle/src/queries/internal-audit-test-result.query';
import { getIssueByInternalAuditReportIdQueryConfig } from '@risksmart-app/drizzle/src/queries/issue.query';
import { impact_rating, node, risk } from '@risksmart-app/drizzle/src/schema';
import { filter } from '@risksmart-app/permitio/src/permit';
import { desc, eq, inArray } from 'drizzle-orm';

import type {
  GetActionsByInternalAuditReportIdResponseRow,
  GetControlTestInternalAuditResultsResponseRow,
  GetDocumentInternalAuditResultsResponseRow,
  GetImpactInternalAuditRatingByInternalAuditReportIdResponseRow,
  GetImpactsByInternalAuditReportIdResponseRow,
  GetIssuesByInternalAuditReportIdResponseRow,
  GetLatestDocumentInternalAuditResultByDocumentIdResponseRow,
  GetObligationInternalAuditResultsResponseRow,
  GetRiskControlledInternalAuditResultsResponseRow,
  GetRiskUncontrolledInternalAuditResultsResponseRow,
  InternalAuditByIdResponseRow,
  InternalAuditReportByIdResponseRow,
  InternalAuditReportsByOriginatingItemIdResponseRow,
  InternalAuditResultByIdResponseRow,
  InternalAuditTestResultByIdResponse,
} from '../../types/index';
import type { InternalAuditService, ServiceContext } from '../service.types';

export class InternalAuditServiceImpl implements InternalAuditService {
  async getInternalAuditEntitiesRegister(ctx: ServiceContext) {
    const db = await createDrizzleClient(ctx);

    // Query internal audit entities with comprehensive relationships
    const data = await db.org((tx) => {
      return tx.query.internal_audit_entity.findMany({
        ...getInternalAuditEntityRegisterQueryConfig,
      });
    });

    const filteredInternalAuditEntities = await filter<(typeof data)[0]>(
      data,
      'rs_node',
      (entity: (typeof data)[0]) => entity.Id,
      ctx.userId,
      ctx.orgId
    );

    return {
      internal_audit_entity: filteredInternalAuditEntities,
    };
  }

  async getInternalAuditReportsRegister(ctx: ServiceContext) {
    const db = await createDrizzleClient(ctx);

    // Query internal audit reports with comprehensive relationships
    const data = await db.org((tx) => {
      return tx.query.internal_audit_report.findMany({
        ...getInternalAuditReportRegisterQueryConfig,
      });
    });

    const filteredInternalAuditReports = await filter<(typeof data)[0]>(
      data,
      'rs_node',
      (entity: (typeof data)[0]) => entity.Id,
      ctx.userId,
      ctx.orgId
    );

    return {
      internal_audit_report: filteredInternalAuditReports,
    };
  }

  async getInternalAuditReportsByOriginatingItemId(
    ctx: ServiceContext,
    originatingItemId: string
  ) {
    const db = await createDrizzleClient(ctx);

    const data = await db.org((tx) => {
      return tx.query.internal_audit_report.findMany({
        where: {
          OriginatingItemId: originatingItemId,
        },
        ...getInternalAuditReportByOriginatingItemIdQueryConfig,
      });
    });

    const filteredInternalAuditReports =
      await filter<InternalAuditReportsByOriginatingItemIdResponseRow>(
        data,
        'rs_node',
        (entity) => entity.Id,
        ctx.userId,
        ctx.orgId
      );

    return {
      internal_audit_report: filteredInternalAuditReports,
    };
  }

  async getInternalAuditById(ctx: ServiceContext, internalAuditId: string) {
    const db = await createDrizzleClient(ctx);

    const data = await db.org((tx) => {
      return tx.query.internal_audit_entity.findMany({
        where: {
          Id: internalAuditId,
        },
        ...getInternalAuditByIdQueryConfig,
      });
    });

    const filteredInternalAuditEntities =
      await filter<InternalAuditByIdResponseRow>(
        data,
        'rs_node',
        (entity) => entity.Id,
        ctx.userId,
        ctx.orgId
      );

    return {
      internal_audit_entity: filteredInternalAuditEntities,
    };
  }

  async getInternalAuditReportById(ctx: ServiceContext, reportId: string) {
    const db = await createDrizzleClient(ctx);

    const data = await db.org((tx) => {
      return tx.query.internal_audit_report.findMany({
        where: {
          Id: reportId,
        },
        ...getInternalAuditReportByIdQueryConfig,
      });
    });

    const filteredInternalAuditReports =
      await filter<InternalAuditReportByIdResponseRow>(
        data,
        'rs_node',
        (entity) => entity.Id,
        ctx.userId,
        ctx.orgId
      );

    return filteredInternalAuditReports;
  }

  async getInternalAuditResultById(
    ctx: ServiceContext,
    internalAuditResultId: string
  ) {
    const db = await createDrizzleClient(ctx);

    const data = await db.org((tx) => {
      return tx.query.internal_audit_result_parent.findMany({
        where: {
          Id: internalAuditResultId,
        },
        ...getInternalAuditResultByIdQueryConfig,
      });
    });

    const filteredInternalAuditResultEntities =
      await filter<InternalAuditResultByIdResponseRow>(
        data,
        'rs_node',
        (entity) => entity.Id,
        ctx.userId,
        ctx.orgId
      );

    return filteredInternalAuditResultEntities;
  }

  async getInternalAuditResultsByParentId(
    ctx: ServiceContext,
    parentId: string
  ) {
    const db = await createDrizzleClient(ctx);

    const [
      documentInternalAuditResults,
      obligationInternalAuditResults,
      riskControlledInternalAuditResults,
      riskUncontrolledInternalAuditResults,
      controlTestInternalAuditResults,
      impactInternalAuditRatings,
      issues,
      impacts,
      actions,
    ] = await Promise.all([
      db.org((tx) =>
        tx.query.document_internal_audit_result.findMany({
          where: {
            parents: {
              ParentId: parentId,
            },
          },
          orderBy: { TestDate: 'desc', CreatedAtTimestamp: 'desc' },
          ...getDocumentInternalAuditResultsQueryConfig,
        })
      ),
      db.org((tx) =>
        tx.query.obligation_internal_audit_result.findMany({
          where: {
            parents: {
              ParentId: parentId,
            },
          },
          orderBy: { TestDate: 'desc', CreatedAtTimestamp: 'desc' },
          ...getObligationInternalAuditResultsQueryConfig,
        })
      ),
      db.org((tx) =>
        tx.query.risk_controlled_internal_audit_result.findMany({
          where: {
            parents: {
              ParentId: parentId,
            },
          },
          orderBy: { TestDate: 'desc', CreatedAtTimestamp: 'desc' },
          ...getRiskControlledInternalAuditResultsQueryConfig,
        })
      ),
      db.org((tx) =>
        tx.query.risk_uncontrolled_internal_audit_result.findMany({
          where: {
            parents: {
              ParentId: parentId,
            },
          },
          orderBy: { TestDate: 'desc', CreatedAtTimestamp: 'desc' },
          ...getRiskUncontrolledInternalAuditResultsQueryConfig,
        })
      ),
      db.org((tx) =>
        tx.query.control_test_internal_audit_result.findMany({
          where: {
            parents: {
              ParentId: parentId,
            },
          },
          orderBy: { TestDate: 'desc', CreatedAtTimestamp: 'desc' },
          ...getControlTestInternalAuditResultsQueryConfig,
        })
      ),
      db.org((tx) =>
        tx.query.impact_internal_audit_rating.findMany({
          where: {
            parents: {
              ParentId: parentId,
            },
          },
          ...getImpactInternalAuditRatingByInternalAuditReportIdQueryConfig,
        })
      ),
      db.org((tx) =>
        tx.query.issue.findMany({
          where: {
            parents: {
              ParentId: parentId,
            },
          },
          ...getIssueByInternalAuditReportIdQueryConfig,
        })
      ),
      db.org((tx) =>
        tx.query.impact.findMany({
          where: {
            parents: {
              ParentId: parentId,
            },
          },
          ...getImpactsByInternalAuditReportIdQueryConfig,
        })
      ),
      db.org((tx) =>
        tx.query.action.findMany({
          where: {
            parents: {
              ParentId: parentId,
            },
          },
          ...getActionsByInternalAuditReportIdQueryConfig,
        })
      ),
    ]);

    const impactInternalAuditRatingsWithImpacts = impactInternalAuditRatings
      .filter((impactInternalAuditRating) => !!impactInternalAuditRating.impact)
      .map((impactInternalAuditRating) => ({
        ...impactInternalAuditRating,
        impact: impactInternalAuditRating.impact!,
      }));

    const [
      filteredDocumentInternalAuditResults,
      filteredObligationInternalAuditResults,
      filteredRiskControlledInternalAuditResults,
      filteredRiskUncontrolledInternalAuditResults,
      filteredControlTestInternalAuditResults,
      filteredImpactInternalAuditRatings,
      filteredIssues,
      filteredImpacts,
      filteredActions,
    ] = await Promise.all([
      filter<GetDocumentInternalAuditResultsResponseRow>(
        documentInternalAuditResults,
        'rs_node',
        (entity) => entity.Id,
        ctx.userId,
        ctx.orgId
      ),
      filter<GetObligationInternalAuditResultsResponseRow>(
        obligationInternalAuditResults,
        'rs_node',
        (entity) => entity.Id,
        ctx.userId,
        ctx.orgId
      ),
      filter<GetRiskControlledInternalAuditResultsResponseRow>(
        riskControlledInternalAuditResults,
        'rs_node',
        (entity) => entity.Id,
        ctx.userId,
        ctx.orgId
      ),
      filter<GetRiskUncontrolledInternalAuditResultsResponseRow>(
        riskUncontrolledInternalAuditResults,
        'rs_node',
        (entity) => entity.Id,
        ctx.userId,
        ctx.orgId
      ),
      filter<GetControlTestInternalAuditResultsResponseRow>(
        controlTestInternalAuditResults,
        'rs_node',
        (entity) => entity.Id,
        ctx.userId,
        ctx.orgId
      ),
      filter<GetImpactInternalAuditRatingByInternalAuditReportIdResponseRow>(
        impactInternalAuditRatingsWithImpacts,
        'rs_node',
        (entity) => entity.Id,
        ctx.userId,
        ctx.orgId
      ),
      filter<GetIssuesByInternalAuditReportIdResponseRow>(
        issues,
        'rs_node',
        (entity) => entity.Id,
        ctx.userId,
        ctx.orgId
      ),
      filter<GetImpactsByInternalAuditReportIdResponseRow>(
        impacts,
        'rs_node',
        (entity) => entity.Id,
        ctx.userId,
        ctx.orgId
      ),
      filter<GetActionsByInternalAuditReportIdResponseRow>(
        actions,
        'rs_node',
        (entity) => entity.Id,
        ctx.userId,
        ctx.orgId
      ),
    ]);

    const impactsWithRatings =
      filteredImpacts.length > 0
        ? await db.org((tx) => {
            return tx
              .selectDistinctOn([impact_rating.RatedItemId])
              .from(impact_rating)
              .where(
                inArray(
                  impact_rating.RatedItemId,
                  filteredImpacts.map((impact) => impact.Id)
                )
              )
              .orderBy(
                desc(impact_rating.ImpactId),
                desc(impact_rating.TestDate)
              )
              .innerJoin(node, eq(node.Id, impact_rating.RatedItemId))
              .innerJoin(risk, eq(risk.Id, node.Id));
          })
        : [];

    const impactsByRatedItemId = new Map<string, typeof impactsWithRatings>();
    for (const impactRating of impactsWithRatings) {
      if (!impactsByRatedItemId.has(impactRating.impact_rating.RatedItemId)) {
        impactsByRatedItemId.set(impactRating.impact_rating.RatedItemId, []);
      }
      impactsByRatedItemId
        .get(impactRating.impact_rating.RatedItemId)!
        .push(impactRating);
    }

    return {
      document_internal_audit_result: filteredDocumentInternalAuditResults,
      obligation_internal_audit_result: filteredObligationInternalAuditResults,
      risk_controlled_internal_audit_result:
        filteredRiskControlledInternalAuditResults,
      risk_uncontrolled_internal_audit_result:
        filteredRiskUncontrolledInternalAuditResults,
      control_test_internal_audit_result:
        filteredControlTestInternalAuditResults,
      impact_internal_audit_rating: filteredImpactInternalAuditRatings,
      issue: filteredIssues.map((issue) => ({
        ...issue,
        actions_aggregate: { aggregate: { count: issue.actions.length } },
      })),
      impact: filteredImpacts.map((impact) => ({
        ...impact,
        ratings: (impactsByRatedItemId.get(impact.Id) || []).map((impact) => ({
          Rating: impact.impact_rating.Rating,
          RatedItemId: impact.impact_rating.RatedItemId,
          ratedItem: {
            risk: {
              Id: impact.risk.Id,
              Title: impact.risk.Title,
            },
          },
        })),
      })),
      action: filteredActions.map((action) => ({
        ...action,
        updates_aggregate: { aggregate: { count: action.updates.length } },
      })),
    };
  }

  async getInternalAuditTestResultById(ctx: ServiceContext, id: string) {
    const db = await createDrizzleClient(ctx);

    const data = await db.org((tx) => {
      return tx.query.control_test_internal_audit_result.findMany({
        where: {
          Id: id,
        },
        ...getInternalAuditTestResultByIdQueryConfig,
      });
    });

    const filteredInternalTestResults =
      await filter<InternalAuditTestResultByIdResponse>(
        data,
        'rs_node',
        (entity) => entity.Id,
        ctx.userId,
        ctx.orgId
      );

    return filteredInternalTestResults;
  }

  async getLatestDocumentInternalAuditResultByDocumentId(
    ctx: ServiceContext,
    documentId: string
  ) {
    const db = await createDrizzleClient(ctx);

    const data = await db.org((tx) => {
      return tx.query.document_internal_audit_result.findMany({
        where: {
          parents: {
            ParentId: documentId,
          },
        },
        orderBy: { TestDate: 'desc', CreatedAtTimestamp: 'desc' },
        limit: 1,
        ...getLatestDocumentInternalAuditResultByDocumentIdQueryConfig,
      });
    });

    const filteredDocumentInternalAuditResults =
      await filter<GetLatestDocumentInternalAuditResultByDocumentIdResponseRow>(
        data,
        'rs_node',
        (entity) => entity.Id,
        ctx.userId,
        ctx.orgId
      );

    return filteredDocumentInternalAuditResults;
  }
}
