import type { GetPolicyAttestationRecordsQuery } from '@risksmart-app/web-graphql-client/generated/graphql';

import type { CollectionData } from '@/utils/collectionUtils';

export type AttestationFlatField = CollectionData<
  GetPolicyAttestationRecordsQuery['attestation_record'][0]
>;

type AttestationUser = CollectionData<AttestationFlatField['user']>;
type AttestationDocument = AttestationFlatField['node']['documentFile'] & {
  parent: {
    Id: string;
    Title: string;
    owners: {
      UserId: string;
      user?: {
        FriendlyName?: string | null | undefined;
        Id?: string | null | undefined;
      };
    }[];
  };
};

type AttestationBuilder = (
  current: AttestationFlatField
) => AttestationFlatField;

export const buildUser = (user: Partial<AttestationUser>): AttestationUser => {
  return {
    Id: user.Id ?? 'auth0|' + crypto.randomUUID(),
    FirstName: null,
    LastName: null,
    FriendlyName: user.FriendlyName,
    Email: user.Email,
    Department: null,
  };
};

const getDefaultAttestation = (): AttestationFlatField => ({
  Id: crypto.randomUUID(),
  ExpiresAt: '2025-10-11T15:04:07.69+00:00',
  Active: true,
  CreatedAtTimestamp: '2025-09-11T15:04:07.691505+00:00',
  ModifiedAtTimestamp: '2025-09-11T15:04:39.826192+00:00',
  AttestationStatus: 'not_attested',
  attestationRecordStatus: {
    Status: 'not_attested',
  },
  AttestedAt: null,
  UserId: 'auth0|644151efc3a961d2784456d9',
  NodeId: crypto.randomUUID(),
  CycleId: null,
  carriedForwardFromRecord: null,
  user: buildUser({ FriendlyName: 'User1', Email: 'user1@example.com' }),
  node: {
    documentFile: null,
  },
});

export const buildAttestation = (
  ...builders: AttestationBuilder[]
): AttestationFlatField => {
  return builders.reduce(
    (acc, builder) => builder(acc),
    getDefaultAttestation()
  );
};

export const buildDocumentFile = (props: {
  Title: string;
  Version: string;
}): AttestationDocument => {
  return {
    Id: crypto.randomUUID(),
    Version: props.Version,
    parent: {
      Id: crypto.randomUUID(),
      Title: props.Title,
      owners: [],
      ownerGroups: [],
    },
  };
};

export const withInitialValues =
  (initialValue?: Partial<AttestationFlatField>): AttestationBuilder =>
  (current) => {
    {
      const result = {
        ...current,
        ...initialValue,
      };

      // Sync attestationRecordStatus.Status with AttestationStatus for test consistency
      // If attestationRecordStatus is explicitly provided, use it as-is
      // Otherwise, sync it from AttestationStatus
      if (
        initialValue?.AttestationStatus &&
        !initialValue?.attestationRecordStatus
      ) {
        result.attestationRecordStatus = {
          Status: initialValue.AttestationStatus,
        };
      }

      return result;
    }
  };

export const withUser =
  (user: AttestationUser): AttestationBuilder =>
  (current) => {
    return {
      ...current,
      user: user,
    };
  };

export const withDocument =
  (document: AttestationDocument): AttestationBuilder =>
  (current) => {
    return {
      ...current,
      NodeId: document.Id,
      node: {
        documentFile: document,
      },
    };
  };
