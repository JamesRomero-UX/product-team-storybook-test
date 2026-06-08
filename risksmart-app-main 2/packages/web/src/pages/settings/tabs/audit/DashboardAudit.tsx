import { useQuery } from '@apollo/client';
import { GetDashboardAuditByIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

import { getAuditItems } from './auditEntityFinder';
import AuditViewComponent from './AuditViewComponent';
import type { AuditEntityRetrieverInput } from './types';

const DashboardAudit = (input: AuditEntityRetrieverInput) => {
  const { data: result } = useQuery(GetDashboardAuditByIdDocument, {
    variables: {
      Id: input.id,
    },
  });
  const { current, previous } = getAuditItems(
    result?.dashboard_audit,
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

export default DashboardAudit;
