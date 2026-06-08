import type { InferQueryModel } from '@risksmart-app/drizzle/src/db';
import type {
  getAppetitesGroupedByImpactQueryConfig,
  getImpactsByInternalAuditReportIdQueryConfig,
  getLatestImpactRatingsForRatedImpactsByRatedItemIdQueryConfig,
} from '@risksmart-app/drizzle/src/queries/impact.query';

export type GetAppetitesGroupedByImpactResponseRow = InferQueryModel<
  'impact',
  typeof getAppetitesGroupedByImpactQueryConfig
>;

export type GetImpactsByInternalAuditReportIdResponseRow = InferQueryModel<
  'impact',
  typeof getImpactsByInternalAuditReportIdQueryConfig
>;

export type GetImpactByInternalAuditReportIdResponse =
  GetImpactsByInternalAuditReportIdResponseRow & {
    ratings: {
      Rating: number;
      RatedItemId: string;
      ratedItem: {
        risk: {
          Id: string;
          Title: string;
        };
      };
    }[];
  };

export type GetLatestImpactRatingsForRatedImpactsByRatedItemIdResponseRow =
  InferQueryModel<
    'impact',
    typeof getLatestImpactRatingsForRatedImpactsByRatedItemIdQueryConfig
  >;
