import type { TagPartsFragment } from '@risksmart-app/web-graphql-client/generated/graphql';

export const getTagsValue = (item: { tags: TagPartsFragment[] }) =>
  item.tags.length > 0 ? item.tags.map((t) => t.type?.Name).join(', ') : '-';
