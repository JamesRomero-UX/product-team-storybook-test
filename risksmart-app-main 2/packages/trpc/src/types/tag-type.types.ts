import type { InferQueryModel } from '@risksmart-app/drizzle/src/db';
import type { getTagTypesQueryConfig } from '@risksmart-app/drizzle/src/queries/tag-type.query';

export type TagTypeResponseRow = InferQueryModel<
  'tag_type',
  typeof getTagTypesQueryConfig
>;
