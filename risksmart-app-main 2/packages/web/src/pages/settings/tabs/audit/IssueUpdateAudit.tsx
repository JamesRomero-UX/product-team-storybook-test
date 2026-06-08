import { useGetIssueUpdateAuditById } from 'src/hooks/queries/issue-update-audit/useGetIssueUpdateAuditById';

import { getAuditItems } from './auditEntityFinder';
import AuditViewComponent from './AuditViewComponent';
import type { AuditEntityRetrieverInput } from './types';

const IssueUpdateAudit = (input: AuditEntityRetrieverInput) => {
  const { data: result } = useGetIssueUpdateAuditById({
    queryArgs: { id: input.id },
  });
  const { current, previous } = getAuditItems(
    result?.issue_update_audit,
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

export default IssueUpdateAudit;
