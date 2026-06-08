import { randomUUID } from 'crypto';

import { getDefaultOrgId, getDefaultUserId } from '../clients/defaults';
import type {
  DocumentInsertInput,
  InsertChildDocumentInput,
  UpdateChildDocumentInput,
} from '../generated/graphql';

const defaultDocument: DocumentInsertInput = {
  Meta: undefined,
  CreatedAtTimestamp: undefined,
  ModifiedAtTimestamp: undefined,
  Title: 'Document 1',
  DocumentType: 'policy',
};

export const buildDocument = (
  overrides: Partial<DocumentInsertInput> = {}
): DocumentInsertInput => {
  return {
    ...defaultDocument,
    Id: randomUUID(),
    CreatedByUser: getDefaultUserId(),
    ModifiedByUser: getDefaultUserId(),
    OrgKey: getDefaultOrgId(),
    ...overrides,
  };
};

export const defaultInsertChildDocument: InsertChildDocumentInput = {
  Title: 'Document 1',
  DocumentType: 'policy',
  ContributorGroupIds: [],
  ContributorUserIds: [],
  DepartmentTypeIds: [],
  LinkedDocumentIds: [],
  OwnerGroupIds: [],
  OwnerUserIds: [],
  TagTypeIds: [],
  schedule: {
    Frequency: undefined,
    ManualDueDate: undefined,
    StartDate: undefined,
    TimeToCompleteUnit: undefined,
    TimeToCompleteValue: undefined,
  },
  attestation: undefined,
};

export const buildInertChildDocument = (
  overrides: Partial<InsertChildDocumentInput> = {}
): InsertChildDocumentInput => {
  return {
    ...defaultInsertChildDocument,
    ...overrides,
  };
};
export const defaultUpdateChildDocument: UpdateChildDocumentInput = {
  Title: 'Document 1',
  DocumentType: 'policy',
  ContributorGroupIds: [],
  ContributorUserIds: [],
  DepartmentTypeIds: [],
  LinkedDocumentIds: [],
  OwnerGroupIds: [],
  OwnerUserIds: [],
  TagTypeIds: [],
  schedule: {
    Frequency: undefined,
    ManualDueDate: undefined,
    StartDate: undefined,
    TimeToCompleteUnit: undefined,
    TimeToCompleteValue: undefined,
  },
  attestation: undefined,
  Id: '',
  OriginalTimestamp: '2024-05-28T10:30:32.139+00:00',
};

export const buildUpdateChildDocument = (
  overrides: Partial<UpdateChildDocumentInput> = {}
): UpdateChildDocumentInput => {
  return {
    ...defaultUpdateChildDocument,
    ...overrides,
  };
};
