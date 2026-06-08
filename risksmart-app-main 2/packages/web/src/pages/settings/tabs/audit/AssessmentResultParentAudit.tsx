import { useQuery } from '@apollo/client';
import { GetAssessmentResultParentAuditByIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

import { getAuditItems } from './auditEntityFinder';
import AuditViewComponent from './AuditViewComponent';
import type { AuditEntityRetrieverInput } from './types';

const AssessmentResultParentAudit = (input: AuditEntityRetrieverInput) => {
  const { data: result } = useQuery(
    GetAssessmentResultParentAuditByIdDocument,
    {
      variables: {
        Id: input.id,
      },
    }
  );
  const { current, previous } = getAuditItems(
    result?.assessment_result_parent_audit,
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

export default AssessmentResultParentAudit;
