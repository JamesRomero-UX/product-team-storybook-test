import { useQuery } from '@apollo/client';
import { GetDocumentFileAuditByIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

import AuditViewComponent from './AuditViewComponent';
import type { AuditEntityRetrieverInput } from './types';

const DocumentFileAudit = (input: AuditEntityRetrieverInput) => {
  const { data: result } = useQuery(GetDocumentFileAuditByIdDocument, {
    variables: {
      id: input.id,
    },
  });
  const current = result?.document_file_audit.filter(
    (c) => c.ModifiedAtTimestamp === input.operationDate
  )[0];
  const previous = result?.document_file_audit.filter(
    (c) => c.ModifiedAtTimestamp < input.operationDate
  )[0];

  return (
    <AuditViewComponent
      operation={input.operation}
      current={JSON.stringify(current, null, 2)}
      previous={JSON.stringify(previous, null, 2)}
    />
  );
};

export default DocumentFileAudit;
