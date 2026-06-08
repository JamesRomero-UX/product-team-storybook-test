import type { QueryConfig } from '../../db';

export const impactRating = {
  columns: {
    CreatedAtTimestamp: true,
    CreatedByUser: true,
    Id: true,
    ModifiedAtTimestamp: true,
    ModifiedByUser: true,
    CustomAttributeData: true,
    SequentialId: true,
    Rating: true,
    RatedItemId: true,
    ImpactId: true,
    TestDate: true,
    CompletedBy: true,
    Likelihood: true,
  },
} as const satisfies QueryConfig<'impact_rating'>;

export const impactInternalAuditRating = {
  columns: {
    CreatedAtTimestamp: true,
    CreatedByUser: true,
    Id: true,
    ModifiedAtTimestamp: true,
    ModifiedByUser: true,
    CustomAttributeData: true,
    SequentialId: true,
    Rating: true,
    RatedItemId: true,
    ImpactId: true,
    TestDate: true,
    CompletedBy: true,
    Likelihood: true,
  },
} as const satisfies QueryConfig<'impact_internal_audit_rating'>;
