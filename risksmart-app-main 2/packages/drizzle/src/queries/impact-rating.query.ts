import type { QueryConfig } from '../db';
import {
  impact,
  impactInternalAuditRating,
  impactRating,
} from './fragments/index';

export const getImpactInternalAuditRatingByInternalAuditReportIdQueryConfig = {
  ...impactInternalAuditRating,
  with: {
    createdByUser: { columns: { FriendlyName: true } },
    completedBy: { columns: { FriendlyName: true } },
    impact: { columns: { Id: true, Name: true } },
    ratedItem: {
      columns: { ObjectType: true },
      with: { risk: { columns: { Title: true } } },
    },
  },
} as const satisfies QueryConfig<'impact_internal_audit_rating'>;

export const getImpactRatingListQueryConfig = {
  ...impactRating,
  with: {
    impact: {
      ...impact,
    },
    assessmentParents: {
      columns: { Id: true, ParentId: true, ParentType: true },
    },
  },
} as const satisfies QueryConfig<'impact_rating'>;

export const getImpactRatingByIdConfig = {
  ...impactRating,
  with: {
    impact: {
      ...impact,
    },
    ratedItem: {
      columns: {
        Id: true,
        ObjectType: true,
        SequentialId: true,
      },
    },
  },
} as const satisfies QueryConfig<'impact_rating'>;
