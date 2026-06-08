import { useQuery } from '@apollo/client';
import { GetIndicatorResultAuditByIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

import { getAuditItems } from './auditEntityFinder';
import AuditViewComponent from './AuditViewComponent';
import type { AuditEntityRetrieverInput } from './types';

const IndicatorResultAudit = (input: AuditEntityRetrieverInput) => {
  const { data: result } = useQuery(GetIndicatorResultAuditByIdDocument, {
    variables: {
      id: input.id,
    },
  });
  const { current, previous } = getAuditItems(
    result?.indicator_result_audit,
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

export default IndicatorResultAudit;
