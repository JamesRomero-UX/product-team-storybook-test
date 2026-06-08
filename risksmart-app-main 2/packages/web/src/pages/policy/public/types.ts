import type {
  Attestation_Record_Status_Enum,
  DepartmentPartsFragment,
  Document_File_Type_Enum,
  GetPublicDocumentFilesQuery,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { LabelledIdArray } from 'src/rbac/types';

export type DocumentFile = GetPublicDocumentFilesQuery['document_file'][number];

export type DocumentFileTableFields = {
  Id: string;
  Title: string;
  Version: string;
  TypeLabel: string;
  Type: Document_File_Type_Enum;
  Link?: null | string;
  Status: string;
  FileId?: null | string;
  StatusLabelled?: null | string;
  Summary: string;
  ReviewDate: string;
  ReviewDue: string;
  allOwners: LabelledIdArray;
  ParentDocumentId: string;
  AttestationStatusLabel: string;
  AttestationStatus: Attestation_Record_Status_Enum | undefined;
  ModifiedAtTimestamp: string;
  departments: DepartmentPartsFragment[];
  LastPublishedDate: string;
};
