import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { randomUUID } from 'crypto';

export const buildLinkedItem = ({
  orgKey,
  userId,
  sourceId,
  targetId,
  overrides,
}: {
  orgKey: string;
  userId: string;
  sourceId: string;
  targetId: string;
  overrides?: Partial<InferInsertModel<'linked_item'>>;
}): InferInsertModel<'linked_item'> => ({
  Id: randomUUID(),
  Source: sourceId,
  Target: targetId,
  RelationshipType: null,
  OrgKey: orgKey,
  CreatedByUser: userId,
  ModifiedByUser: userId,
  CreatedAtTimestamp: undefined,
  ModifiedAtTimestamp: undefined,
  ...overrides,
});
