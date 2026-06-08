import type {
  InsertDocumentVersionMutationVariables,
  UpdateDocumentVersionMutationVariables,
} from '../generated/graphql';
import { DocumentFileTypeEnum, VersionStatusEnum } from '../generated/graphql';

const defaultInsertDocumentVersion: InsertDocumentVersionMutationVariables = {
  Version: '1',
  ParentDocumentId: '',
  Type: DocumentFileTypeEnum.Html,
  Content: 'Hello world',
};

export const buildInsertDocumentVersion = (
  overrides: Partial<InsertDocumentVersionMutationVariables> = {}
): InsertDocumentVersionMutationVariables => {
  return {
    ...defaultInsertDocumentVersion,
    ...overrides,
  };
};

const defaultUpdateDocumentVersion: UpdateDocumentVersionMutationVariables = {
  Status: VersionStatusEnum.Published,
  Version: '1',
  Id: '',
  LatestModifiedAtTimestamp: '',
  Content: 'hello world',
  Type: DocumentFileTypeEnum.Html,
};

export const buildUpdateDocumentVersion = (
  overrides: Partial<UpdateDocumentVersionMutationVariables> = {}
): UpdateDocumentVersionMutationVariables => {
  return {
    ...defaultUpdateDocumentVersion,
    ...overrides,
  };
};
