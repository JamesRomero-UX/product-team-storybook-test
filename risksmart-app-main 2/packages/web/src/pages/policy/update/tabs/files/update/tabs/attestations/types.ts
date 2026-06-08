import type {
  Attestation_Record_Status_Enum,
  GetPolicyAttestationRecordsForDocumentQuery,
} from '@risksmart-app/web-graphql-client/generated/graphql';

import type { CollectionData } from '@/utils/collectionUtils';

export type AttestationFlatField = CollectionData<
  GetPolicyAttestationRecordsForDocumentQuery['attestation_record'][0]
>;

export type AttestationRegisterFields = Omit<
  AttestationFlatField,
  'AttestationStatus'
> & {
  User: string;
  Document: string;
  AttestationStatusLabel: string;
  ActiveLabel: string;
  AttestationStatus: Attestation_Record_Status_Enum;
  TransferredFrom: string;
};
