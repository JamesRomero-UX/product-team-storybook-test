import type { ApprovalStatus } from '@risksmart-app/domain/src/types/consts/approval-status';
import type { AttestationRecordStatus } from '@risksmart-app/domain/src/types/consts/index';
import type { InferQueryModel } from '@risksmart-app/drizzle/src/db';
import type {
  getDocumentFileByIdQueryConfig,
  getDocumentFileQueryConfig,
  getDocumentFilesByDocumentIdQueryConfig,
  getLatestDocumentFileQueryConfig,
  getPublicDocumentFilesQueryConfig,
} from '@risksmart-app/drizzle/src/queries/document-file.query';

export type DocumentFileResponseRow = InferQueryModel<
  'document_file',
  typeof getDocumentFileQueryConfig
>;

export type DocumentFileEntityRow = InferQueryModel<'document_file'>;

// Base type from query config (without changeRequests)
type DocumentFileByIdBase = InferQueryModel<
  'document_file',
  typeof getDocumentFileByIdQueryConfig
>;

// changeRequests are fetched separately using selectDistinctOn and merged in the service
export type DocumentFileByIdResponseRow = DocumentFileByIdBase & {
  changeRequests: {
    ChangeRequestStatus: ApprovalStatus;
    ModifiedAtTimestamp: string;
  }[];
};

// Base type from query config (without changeRequests)
type DocumentFilesByDocumentIdBase = InferQueryModel<
  'document_file',
  typeof getDocumentFilesByDocumentIdQueryConfig
>;

// changeRequests are fetched separately using selectDistinctOn and merged in the service
export type DocumentFilesByDocumentIdResponseRow =
  DocumentFilesByDocumentIdBase & {
    changeRequests: {
      ChangeRequestStatus: ApprovalStatus;
      ModifiedAtTimestamp: string;
    }[];
  };

// Base type from query config (without attestations)
type PublicDocumentFilesBase = InferQueryModel<
  'document_file',
  typeof getPublicDocumentFilesQueryConfig
>;

// attestations are fetched separately with userId filtering and merged in the service
export type PublicDocumentFilesResponseRow = PublicDocumentFilesBase & {
  attestations: {
    AttestationStatus: AttestationRecordStatus;
    ExpiresAt: string | null;
    Active: boolean;
  }[];
};

export type LatestDocumentFileResponseRow = InferQueryModel<
  'document_file',
  typeof getLatestDocumentFileQueryConfig
>;
