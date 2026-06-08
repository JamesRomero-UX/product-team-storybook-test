import type { AttestationCyclePartsFragment } from '@risksmart-app/web-graphql-client/generated/graphql';

type AttestationCycleBuilder = (
  current: AttestationCyclePartsFragment
) => AttestationCyclePartsFragment;

type DocumentFile = Omit<AttestationCyclePartsFragment['parent'], 'parent'> & {
  parent: {
    Id: string;
    Title: string;
  };
};

export const buildDocumentFile = (props: {
  Title: string;
  Version: string;
}): DocumentFile => {
  return {
    Id: crypto.randomUUID(),
    Version: props.Version,
    parent: {
      Id: crypto.randomUUID(),
      Title: props.Title,
    },
  };
};

const getDefault = (): AttestationCyclePartsFragment => ({
  CreatedAtTimestamp: '2025-09-11T15:04:07.691505+00:00',
  ModifiedAtTimestamp: '2025-09-11T15:04:39.826192+00:00',
  AllowCarryForward: false,
  CreatedByUser: '',
  Id: crypto.randomUUID(),
  ModifiedByUser: '',
  ParentId: '',
  Status: 'active',
  records: [],
  parent: {
    __typename: undefined,
    Version: '',
    Id: '',
    parent: undefined,
  },
});

export const buildAttestationCycle = (
  ...builders: AttestationCycleBuilder[]
): AttestationCyclePartsFragment => {
  return builders.reduce((acc, builder) => builder(acc), getDefault());
};

export const withInitialValues =
  (
    initialValue?: Partial<AttestationCyclePartsFragment>
  ): AttestationCycleBuilder =>
  (current) => {
    {
      return {
        ...current,
        ...initialValue,
      };
    }
  };

export const withDocument =
  (
    document: AttestationCyclePartsFragment['parent']
  ): AttestationCycleBuilder =>
  (current) => {
    return {
      ...current,
      parent: document,
    };
  };

export const withRecords =
  (
    records: AttestationCyclePartsFragment['records']
  ): AttestationCycleBuilder =>
  (current) => {
    return {
      ...current,
      records,
    };
  };
