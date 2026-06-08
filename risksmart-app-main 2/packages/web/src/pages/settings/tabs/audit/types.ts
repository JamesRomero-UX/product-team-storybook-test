export type AuditEntityRetrieverInput = {
  entityType: string;
  id: string;
  operation: 'Added' | 'Deleted' | 'Updated';
  operationDate: string;
};
