import type { InferQueryModel } from '@risksmart-app/drizzle/src/db';
import type { getImpactInternalAuditRatingByInternalAuditReportIdQueryConfig } from '@risksmart-app/drizzle/src/queries/impact-rating.query';

export type GetImpactInternalAuditRatingByInternalAuditReportIdResponseRow =
  InferQueryModel<
    'impact_rating',
    typeof getImpactInternalAuditRatingByInternalAuditReportIdQueryConfig
  >;
