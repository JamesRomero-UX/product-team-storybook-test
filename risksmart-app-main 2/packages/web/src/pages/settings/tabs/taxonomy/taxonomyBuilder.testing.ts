import type { Taxonomy } from '@risksmart-app/web-graphql-client/derived-types';

export const defaultTaxonomy: Taxonomy = {
  Description: 'Some description',
  Id: 'b670bd9e-35a0-4115-813e-fea270b16465',
  Taxonomy: {
    test: '123',
  },
  Rating: { test: 'Rating' },
  Library: { test: 'Library' },
  Common: { test: 'Common' },
  InternalAuditRating: { test: 'Internal Audit Rating' },
  ModifiedAtTimestamp: '2021-01-01T00:00:00Z',
  organisations_aggregate: {
    aggregate: { count: 1 },
  },
};
