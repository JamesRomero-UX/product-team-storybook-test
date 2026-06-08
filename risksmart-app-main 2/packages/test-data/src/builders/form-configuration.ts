import { ParentTypes } from '@risksmart-app/domain/src/types/consts';
import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';

export const buildFormConfiguration = (
  orgKey: string,
  userId: string,
  overrides?: Partial<InferInsertModel<'form_configuration'>>
): InferInsertModel<'form_configuration'> => ({
  ParentType: ParentTypes.Risk,
  OrgKey: orgKey,
  CreatedByUser: userId,
  ModifiedByUser: userId,
  ModifiedAtTimestamp: new Date().toISOString(),
  CreatedAtTimestamp: new Date().toISOString(),
  ...overrides,
});
