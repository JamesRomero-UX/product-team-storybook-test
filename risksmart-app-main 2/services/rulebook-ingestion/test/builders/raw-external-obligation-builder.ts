import { randomUUID } from 'node:crypto';

import type { TypesafeTransform } from 'src/adaptors/types';
import { createContentHash } from 'src/domain/create-content-hash';
import {
  type NewRawExternalObligation,
  newRawExternalObligationSchema,
  regulatorIdSchema,
} from 'src/domain/types';

export type RawExternalObligationBuilder = (
  item: NewRawExternalObligation
) => NewRawExternalObligation;

const getDefaultValue = (): NewRawExternalObligation => {
  return newRawExternalObligationSchema.parse({
    externalId: randomUUID(),
    externalParentId: randomUUID(),
    json: '',
    type: 'rule',
    regulatorId: 'test-regulator',
  } satisfies TypesafeTransform<typeof newRawExternalObligationSchema>);
};

export const buildRawExternalObligation = (
  ...builders: RawExternalObligationBuilder[]
): NewRawExternalObligation => {
  const item = builders.reduce(
    (acc, builder) => builder(acc),
    getDefaultValue()
  );

  const json =
    item.json ?? JSON.stringify({ id: item.externalId, test: 'data1' });

  return {
    ...item,
    contentHash: createContentHash(json),
  };
};

export const withExternalId =
  (externalId: string): RawExternalObligationBuilder =>
  (item) => ({
    ...item,
    externalId,
  });

export const withExternalParentId =
  (externalParentId: string): RawExternalObligationBuilder =>
  (item) => ({
    ...item,
    externalParentId,
  });

export const withJson =
  (json: string): RawExternalObligationBuilder =>
  (item) => ({
    ...item,
    json,
  });

export const withRegulatorId =
  (regulatorId: string): RawExternalObligationBuilder =>
  (item) => ({
    ...item,
    regulatorId: regulatorIdSchema.parse(regulatorId),
  });
