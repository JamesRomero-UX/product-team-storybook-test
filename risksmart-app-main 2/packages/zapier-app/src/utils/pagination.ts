import type { Bundle, ZObject } from 'zapier-platform-core';

import { getEntityUrl } from './api.js';
import type { ListResponse } from './list.js';

const MAX_PAGES = 50;
const PAGE_SIZE = 100;

interface FetchAllPagesOptions {
  z: ZObject;
  bundle: Bundle;
  entity: string;
  params?: Record<string, string>;
}

export interface FetchAllPagesResult {
  items: Record<string, unknown>[];
  isTruncated: boolean;
}

export const fetchAllPages = async (
  options: FetchAllPagesOptions
): Promise<FetchAllPagesResult> => {
  const { z, bundle, entity, params } = options;
  const allItems: Record<string, unknown>[] = [];
  let cursor: string | null = null;
  let page = 0;
  let isTruncated = false;

  do {
    const requestParams: Record<string, string> = {
      page_size: String(PAGE_SIZE),
      ...params,
    };

    if (cursor) {
      requestParams.start_after = cursor;
    }

    const response = await z.request({
      url: getEntityUrl(bundle, entity),
      params: requestParams,
    });

    // Zapier platform types response.data as `{}`; actual shape is the list API contract.
    const body = response.data as ListResponse;
    allItems.push(...body.data);
    page++;

    cursor = body.pageInfo?.hasMore
      ? (body.pageInfo.afterCursor ?? null)
      : null;

    if (page >= MAX_PAGES && cursor) {
      z.console.log(
        `fetchAllPages: reached MAX_PAGES limit (${MAX_PAGES}) for ${entity}. Results are truncated at ${String(allItems.length)} items.`
      );
      isTruncated = true;
      break;
    }
  } while (cursor);

  return { items: allItems, isTruncated };
};

export const filterByOwner = (
  items: Record<string, unknown>[],
  ownerId: string
): Record<string, unknown>[] =>
  items.filter((item) => {
    const owners = item.owners;

    return Array.isArray(owners) && owners.includes(ownerId);
  });
