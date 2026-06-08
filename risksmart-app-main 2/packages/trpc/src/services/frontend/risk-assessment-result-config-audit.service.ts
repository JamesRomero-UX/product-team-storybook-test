import { createDrizzleClient } from '@risksmart-app/drizzle/src/db';
import { getRiskAssessmentResultConfigAuditByIdQueryConfig } from '@risksmart-app/drizzle/src/queries/risk-assessment-result-config-audit.query';
import { filter } from '@risksmart-app/permitio/src/permit';

import type { GetRiskAssessmentResultConfigAuditByIdResponseRow } from '../../types/index';
import type {
  RiskAssessmentResultConfigAuditService,
  ServiceContext,
} from '../service.types';

export class RiskAssessmentResultConfigAuditServiceImpl implements RiskAssessmentResultConfigAuditService {
  async getRiskAssessmentResultConfigAuditById(
    ctx: ServiceContext,
    id: string
  ) {
    const db = await createDrizzleClient(ctx);
    const data = await db.org((tx) => {
      return tx.query.risk_assessment_result_config_audit.findMany({
        where: {
          Id: id,
        },
        ...getRiskAssessmentResultConfigAuditByIdQueryConfig,
      });
    });

    const filteredResults =
      await filter<GetRiskAssessmentResultConfigAuditByIdResponseRow>(
        data,
        'rs_node',
        (entity: GetRiskAssessmentResultConfigAuditByIdResponseRow) =>
          entity.Id,
        ctx.userId,
        ctx.orgId
      );

    return filteredResults;
  }
}
