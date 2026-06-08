import { DocumentFileType } from '@risksmart-app/domain/src/types/consts/document-file-type';
import { VersionStatus } from '@risksmart-app/domain/src/types/consts/version-status';
import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { randomUUID } from 'crypto';

export const buildDocumentFile = ({
  orgkey,
  userId,
  parentDocumentId,
  overrides,
}: {
  orgkey: string;
  userId: string;
  parentDocumentId: string;
  overrides?: Partial<InferInsertModel<'document_file'>>;
}): InferInsertModel<'document_file'> => ({
  Id: randomUUID(),
  Version: '1.0',
  Status: VersionStatus.Draft,
  Type: DocumentFileType.File,
  ParentDocumentId: parentDocumentId,
  OrgKey: orgkey,
  CreatedByUser: userId,
  CreatedAtTimestamp: '2024-01-15T10:00:00Z',
  ModifiedByUser: userId,
  ModifiedAtTimestamp: '2024-01-15T10:00:00Z',
  Meta: {},
  CustomAttributeData: {},
  Content: 'Test document content',
  Link: null,
  ...overrides,
});
