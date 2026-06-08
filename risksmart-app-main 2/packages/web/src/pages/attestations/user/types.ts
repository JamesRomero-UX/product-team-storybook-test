import type { User } from '@risksmart-app/web-graphql-client/derived-types';
import type { Attestation_Record_Status_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { LabelledIdArray } from 'src/rbac/types';

export type AttestationCardFields = {
  Id: string;
  AttestationStatus: Attestation_Record_Status_Enum;
  ParentDocumentId: string;
  FileId: string;
  Title: string;
  ModifiedAtTimestamp: string;
  Version: string;
  allOwners: LabelledIdArray;
  User: Pick<User, 'FirstName' | 'LastName'>;
};
