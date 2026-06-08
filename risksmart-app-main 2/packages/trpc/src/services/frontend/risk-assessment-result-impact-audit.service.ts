import { createDrizzleClient } from '@risksmart-app/drizzle/src/db';
import { getRiskAssessmentResultImpactAuditByIdQueryConfig } from '@risksmart-app/drizzle/src/queries/risk-assessment-result-impact-audit.query';
import { filter } from '@risksmart-app/permitio/src/permit';

import type { GetRiskAssessmentResultImpactAuditByIdResponseRow } from '../../types/index';
import type {
  RiskAssessmentResultImpactAuditService,
  ServiceContext,
} from '../service.types';

export class RiskAssessmentResultImpactAuditServiceImpl implements RiskAssessmentResultImpactAuditService {
  async getRiskAssessmentResultImpactAuditById(
    ctx: ServiceContext,
    id: string
  ) {
    const db = await createDrizzleClient(ctx);
    const data = await db.org((tx) => {
      return tx.query.risk_assessment_result_impact_audit.findMany({
        where: {
          Id: id,
        },
        ...getRiskAssessmentResultImpactAuditByIdQueryConfig,
      });
    });

    const filteredResults =
      await filter<GetRiskAssessmentResultImpactAuditByIdResponseRow>(
        data,
        'rs_node',
        (entity: GetRiskAssessmentResultImpactAuditByIdResponseRow) =>
          entity.Id,
        ctx.userId,
        ctx.orgId
      );

    return filteredResults;
  }
}
