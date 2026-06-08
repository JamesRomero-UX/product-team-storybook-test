import { useQuery } from '@apollo/client';
import { GetCommentAuditByIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

import { getAuditItems } from './auditEntityFinder';
import AuditViewComponent from './AuditViewComponent';
import type { AuditEntityRetrieverInput } from './types';

const CommentAudit = (input: AuditEntityRetrieverInput) => {
  const { data: result } = useQuery(GetCommentAuditByIdDocument, {
    variables: {
      Id: input.id,
    },
  });
  const { current, previous } = getAuditItems(
    result?.comment_audit,
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

export default CommentAudit;
