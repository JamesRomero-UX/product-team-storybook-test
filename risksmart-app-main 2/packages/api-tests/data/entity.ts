import { randomUUID } from 'crypto';

import type { EntityInsertInput } from '../generated/graphql';

const defaultEntity: EntityInsertInput = {
  Description: 'An entity',
  ParentId: undefined,
  Name: 'Entity',
};

export const buildEntity = (
  overrides: Partial<EntityInsertInput> = {}
): EntityInsertInput => {
  return {
    ...defaultEntity,
    Id: randomUUID(),
    ...overrides,
  };
};
