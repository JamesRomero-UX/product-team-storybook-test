import type { InferQueryModel } from '@risksmart-app/drizzle/src/db';
import type { getBusinessAreasQueryConfig } from '@risksmart-app/drizzle/src/queries/business-area.query';

export type BusinessAreasResponseRow = InferQueryModel<
  'business_area',
  typeof getBusinessAreasQueryConfig
>;
