import type { InferQueryModel } from '@risksmart-app/drizzle/src/db';
import type {
  getContributorGroupsQueryConfig,
  getContributorsQueryConfig,
} from '@risksmart-app/drizzle/src/queries/contributor.query';

export type ContributorRow = InferQueryModel<
  'contributor',
  typeof getContributorsQueryConfig
>;

export type ContributorGroupRow = InferQueryModel<
  'contributor_group',
  typeof getContributorGroupsQueryConfig
>;
