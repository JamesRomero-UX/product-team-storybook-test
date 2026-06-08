import { randomUUID } from 'node:crypto';

import type { TypesafeTransform } from 'src/adaptors/types';
import { createContentHash } from 'src/domain/create-content-hash';
import { type Obligation, obligationSchema } from 'src/domain/types';

export type ObligationBuilder = (item: Obligation) => Obligation;

const getDefaultValue = (): Obligation => {
  const externalId = randomUUID();
  const json = { id: externalId, test: 'data1' };

  return obligationSchema.parse({
    contentHash: createContentHash(JSON.stringify(json)),
    externalId,
    description:
      'Organizations must implement appropriate technical and organizational measures to ensure data security',
    effectiveDate: '2023-01-01',
    expiryDate: '2025-12-31',
    externalParentId: randomUUID(),
    externalRegulatorId: randomUUID(),
    provider: 'ascent',
    publishedDate: '2022-12-01',
    referenceCode: 'REG-2023-001',
    regulatorName: 'Test Data Protection Authority',
    sourceUrl: 'https://example.com/regulations/reg-2023-001',
    tags: [],
    title: 'Data Security Requirements',
    type: 'rule',
  } satisfies TypesafeTransform<typeof obligationSchema>);
};

export const buildObligation = (
  ...builders: ObligationBuilder[]
): Obligation => {
  const item = builders.reduce(
    (acc, builder) => builder(acc),
    getDefaultValue()
  );

  return item;
};

export const withContentHash =
  (contentHash: string): ObligationBuilder =>
  (item) => ({
    ...item,
    contentHash,
  });

export const withExternalId =
  (externalId: string): ObligationBuilder =>
  (item) => ({
    ...item,
    externalId,
  });
