import type { InferQueryModel } from '@risksmart-app/drizzle/src/db';
import type {
  getLinkedItemRisksQueryConfig,
  getLinkedItemsQueryConfig,
  getLinkedRisksByInternalAuditIdQueryConfig,
} from '@risksmart-app/drizzle/src/queries/linked-item.query';

export type GetLinkedItemsResponseRow = InferQueryModel<
  'linked_item',
  typeof getLinkedItemsQueryConfig
>;

export type GetLinkedRisksByInternalAuditIdResponseRow = InferQueryModel<
  'linked_item',
  typeof getLinkedRisksByInternalAuditIdQueryConfig
>;

export type GetLinkedRisksByInternalAuditIdResponse =
  GetLinkedRisksByInternalAuditIdResponseRow & {
    target_risk?: {
      controls_aggregate: {
        aggregate: {
          count: number;
        };
      };
      indicators_aggregate: {
        aggregate: {
          count: number;
        };
      };
      actions_aggregate: {
        aggregate: {
          count: number;
        };
      };
      impactRatings: {
        Rating: number;
        ImpactId: string;
      }[];
      impactRatingsForTrend: {
        ImpactId: string;
        Rating: number;
        TestDate: string;
      }[];
    };
  };

export type GetLinkedItemRisksResponseRow = InferQueryModel<
  'linked_item',
  typeof getLinkedItemRisksQueryConfig
>;
