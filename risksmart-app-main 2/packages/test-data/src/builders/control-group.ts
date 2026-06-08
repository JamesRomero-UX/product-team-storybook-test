import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';

export const buildControlGroup = ({
  orgKey,
  userId,
  overrides,
}: {
  orgKey: string;
  userId: string;
  overrides?: Partial<InferInsertModel<'control_group'>>;
}): InferInsertModel<'control_group'> => ({
  Title: 'Test Control Group',
  Description: 'Test control group description',
  Owner: userId,
  OrgKey: orgKey,
  ModifiedByUser: userId,
  ModifiedAtTimestamp: new Date().toISOString(),
  CreatedByUser: userId,
  CreatedAtTimestamp: new Date().toISOString(),
  Meta: {},
  CustomAttributeData: {},
  ...overrides,
});
