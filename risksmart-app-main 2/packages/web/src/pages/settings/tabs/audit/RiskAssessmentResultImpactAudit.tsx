import { useGetRiskAssessmentResultImpactAuditById } from 'src/hooks/queries/risk-assessment-result-impact-audit/useGetRiskAssessmentResultImpactAuditById';

import { getAuditItems } from './auditEntityFinder';
import AuditViewComponent from './AuditViewComponent';
import type { AuditEntityRetrieverInput } from './types';

const RiskAssessmentResultImpactAudit = (input: AuditEntityRetrieverInput) => {
  const { data: result } = useGetRiskAssessmentResultImpactAuditById({
    queryArgs: { id: input.id },
  });
  const { current, previous } = getAuditItems(
    result?.risk_assessment_result_impact_audit,
    input.operationDate
  );

  return (
    <AuditViewComponent
      operation={input.operation}
      current={JSON.stringify(current, null, 2)}
      previous={JSON.stringify(previous, null, 2)}
    />
  );
};

export default RiskAssessmentResultImpactAudit;
