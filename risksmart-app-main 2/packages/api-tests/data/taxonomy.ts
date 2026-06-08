import { randomUUID } from 'crypto';

import { getDefaultUserId } from '../clients/defaults';
import type { TaxonomyInsertInput } from '../generated/graphql';

const defaultTaxonomy: TaxonomyInsertInput = {
  Description: 'Taxonomy 1',
  Rating: { ratingKey: 'rating val' },
  Common: { commonKey: 'common val' },
  Library: { libraryKey: 'library val' },
  Taxonomy: { taxonomyKey: 'taxonomy val' },
  InternalAuditRating: { internalAuditRatingKey: 'internal audit rating val' },
  ModifiedAtTimestamp: undefined,
  CreatedAtTimestamp: undefined,
};

export const buildTaxonomy = (
  overrides: Partial<TaxonomyInsertInput> = {}
): TaxonomyInsertInput => {
  return {
    ...defaultTaxonomy,
    Id: randomUUID(),
    ModifiedByUser: getDefaultUserId(),
    CreatedByUser: getDefaultUserId(),
    ...overrides,
  };
};
