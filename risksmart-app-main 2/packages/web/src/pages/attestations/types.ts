import type {
  Attestation_Record_Status_Enum,
  GetPolicyAttestationRecordsQuery,
} from '@risksmart-app/web-graphql-client/generated/graphql';

import type { CollectionData } from '@/utils/collectionUtils';
export type AttestationFlatField = CollectionData<
  GetPolicyAttestationRecordsQuery['attestation_record'][0]
>;

export type AttestationCycleStatus = 'active' | 'overdue' | 'concluded';

export type AttestationRegisterAllFields = {
  AttestationStatus: Attestation_Record_Status_Enum;
  AttestationStatusLabelled: string | undefined;
  CycleEndDate: string;
  CycleStartDate: string;
  Document: string;
  DocumentId?: string;
  FileId?: string;
  Name: string;
  TransferredFrom: string;
  UserAttestedAt?: string;
  UserDueDate: string;
  UserId: string;
  Version: string;
};

export type AttestationRegisterByUserFields = {
  UserId: string;
  User: string;
  Email: string;
  AttestationsCompleted: string;
};

export type AttestationRegisterCycleFields = {
  AttestationProgress: number;
  CycleStartDate: string;
  CycleStatus: AttestationCycleStatus;
  CycleStatusLabelled: string;
  Document: string;
  DocumentId?: string;
  FileId?: string;
  Version: string;
};
