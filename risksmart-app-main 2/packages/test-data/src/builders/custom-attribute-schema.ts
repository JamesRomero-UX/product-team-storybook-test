import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { randomUUID } from 'crypto';

export const buildCustomAttributeSchema = (
  orgKey: string,
  userId: string,
  overrides?: Partial<InferInsertModel<'custom_attribute_schema'>>
): InferInsertModel<'custom_attribute_schema'> => ({
  Id: randomUUID(),
  OrgKey: orgKey,
  CreatedByUser: userId,
  ModifiedByUser: userId,
  Schema: {
    type: 'object',
    properties: {},
    required: [],
  },
  UiSchema: {
    type: 'VerticalLayout',
    elements: [],
  },
  ...overrides,
});
