import type { InferQueryModel } from '@risksmart-app/drizzle/src/db';
import type {
  getImpactRatingByIdConfig,
  getImpactRatingListQueryConfig,
} from '@risksmart-app/drizzle/src/queries/impact-rating.query';

import type { GetFormConfigurationResponseRow } from '../../form-configuration.types';

export type ImpactRatingResponseRow = InferQueryModel<
  'impact_rating',
  typeof getImpactRatingListQueryConfig
>;

export interface ImpactRatingByIdResponse {
  impactRating: InferQueryModel<
    'impact_rating',
    typeof getImpactRatingByIdConfig
  >;
  form_configuration?: GetFormConfigurationResponseRow | null;
}
