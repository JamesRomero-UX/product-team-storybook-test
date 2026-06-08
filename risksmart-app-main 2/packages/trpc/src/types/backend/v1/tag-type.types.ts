import type { InferQueryModel } from '@risksmart-app/drizzle/src/db';
import type { getTagTypesQueryConfig } from '@risksmart-app/drizzle/src/queries/tag-type.query';

export type TagTypeListResponseRow = InferQueryModel<
  'tag_type',
  typeof getTagTypesQueryConfig
>;

export interface TagTypeByIdResponse {
  tagType: TagTypeListResponseRow;
}
