import { useGetRiskAssessmentResultConfigAuditById } from 'src/hooks/queries/risk-assessment-result-config-audit/useGetRiskAssessmentResultConfigAuditById';

import { getAuditItems } from './auditEntityFinder';
import AuditViewComponent from './AuditViewComponent';
import type { AuditEntityRetrieverInput } from './types';

const RiskAssessmentResultConfigAudit = (input: AuditEntityRetrieverInput) => {
  const { data: result } = useGetRiskAssessmentResultConfigAuditById({
    queryArgs: { id: input.id },
  });
  const { current, previous } = getAuditItems(
    result?.risk_assessment_result_config_audit,
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

export default RiskAssessmentResultConfigAudit;
