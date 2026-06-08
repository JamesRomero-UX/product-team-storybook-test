import { useGetAcceptanceAuditById } from '@/hooks/queries';

import { getAuditItems } from './auditEntityFinder';
import AuditViewComponent from './AuditViewComponent';
import type { AuditEntityRetrieverInput } from './types';

const AcceptanceAudit = (input: AuditEntityRetrieverInput) => {
  const { data: result } = useGetAcceptanceAuditById({
    queryArgs: { id: input.id },
  });

  const { current, previous } = getAuditItems(
    result?.acceptance_audit,
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

export default AcceptanceAudit;
