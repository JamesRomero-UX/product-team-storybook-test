import { useGetActionAuditById } from 'src/hooks/queries/action/useGetActionAuditById';

import { getAuditItems } from './auditEntityFinder';
import AuditViewComponent from './AuditViewComponent';
import type { AuditEntityRetrieverInput } from './types';

const ActionAudit = (input: AuditEntityRetrieverInput) => {
  const { data: result } = useGetActionAuditById({
    queryArgs: { id: input.id },
  });

  const { current, previous } = getAuditItems(
    result?.action_audit,
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

export default ActionAudit;
