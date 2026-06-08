import { getDefaultOrgId, getDefaultUserId } from '../clients/defaults';
import type { DocumentLinkedDocumentInsertInput } from '../generated/graphql';

const defaultDocumentLinkedDocument: DocumentLinkedDocumentInsertInput = {
  Meta: undefined,
  CreatedAtTimestamp: undefined,
  ModifiedAtTimestamp: undefined,
};

export const buildDocumentLinkedDocument = (
  overrides: Partial<DocumentLinkedDocumentInsertInput> = {}
): DocumentLinkedDocumentInsertInput => {
  return {
    ...defaultDocumentLinkedDocument,
    OrgKey: getDefaultOrgId(),
    CreatedByUser: getDefaultUserId(),
    ModifiedByUser: getDefaultUserId(),
    ...overrides,
  };
};
