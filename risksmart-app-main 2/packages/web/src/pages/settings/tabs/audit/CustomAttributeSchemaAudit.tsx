import { useQuery } from '@apollo/client';
import { GetCustomAttributeSchemaAuditByIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

import { getAuditItems } from './auditEntityFinder';
import AuditViewComponent from './AuditViewComponent';
import type { AuditEntityRetrieverInput } from './types';

const CustomAttributeSchemaAudit = (input: AuditEntityRetrieverInput) => {
  const { data: result } = useQuery(GetCustomAttributeSchemaAuditByIdDocument, {
    variables: {
      Id: input.id,
    },
  });
  const { current, previous } = getAuditItems(
    result?.custom_attribute_schema_audit,
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

export default CustomAttributeSchemaAudit;
