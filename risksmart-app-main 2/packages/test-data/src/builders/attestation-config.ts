import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';

export const buildAttestationConfig = ({
  orgkey,
  userId,
  parentId,
  overrides,
}: {
  orgkey: string;
  userId: string;
  parentId: string;
  overrides?: Partial<InferInsertModel<'attestation_config'>>;
}): InferInsertModel<'attestation_config'> => ({
  ParentId: parentId,
  RequireGlobalAttestation: false,
  AttestationTimeLimit: null,
  OrgKey: orgkey,
  CreatedByUser: userId,
  CreatedAtTimestamp: '2024-01-15T10:00:00Z',
  ModifiedByUser: userId,
  ModifiedAtTimestamp: '2024-01-15T10:00:00Z',
  PromptText: 'Please confirm you have reviewed this document',
  ...overrides,
});
