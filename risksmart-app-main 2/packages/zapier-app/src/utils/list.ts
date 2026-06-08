import type { Bundle, ZObject } from 'zapier-platform-core';

import { getEntityUrl } from './api.js';

export interface ListResponse {
  data: Record<string, unknown>[];
  pageInfo?: {
    hasMore: boolean;
    afterCursor: string | null;
    beforeCursor: string | null;
    nextPage: string | null;
    prevPage: string | null;
    count: number;
  };
}

export const entityPrefixes: Record<string, string> = {
  risks: 'R',
  indicators: 'IN',
  controls: 'C',
  actions: 'A',
  issues: 'I',
  policies: 'D',
  assessments: 'ASMT',
  'compliance/obligations': 'O',
  'third-parties': 'TP',
  'enterprise-risks': 'ER',
  impacts: 'IM',
};

const addDisplayLabel = (
  item: Record<string, unknown>,
  entity: string
): Record<string, unknown> => {
  const title = item.title ?? item.friendlyName ?? '';
  const seqId = item.sequentialId;
  const prefix = entityPrefixes[entity];

  if (prefix && seqId != null) {
    return {
      ...item,
      _zapierLabel: `${String(title)} (${prefix}-${String(seqId)})`,
    };
  }

  return { ...item, _zapierLabel: String(title) };
};

export const performList = async (
  z: ZObject,
  bundle: Bundle,
  entity: string
) => {
  const params: Record<string, string> = {
    page_size: String(bundle.inputData.page_size ?? 20),
  };

  if (bundle.inputData.cursor) {
    params.start_after = String(bundle.inputData.cursor);
  }

  const response = await z.request({
    url: getEntityUrl(bundle, entity),
    params,
  });

  // Zapier platform types response.data as `{}`; actual shape is the list API contract.
  const body = response.data as ListResponse;

  return {
    results: body.data.map((item) => addDisplayLabel(item, entity)),
    paging_token: body.pageInfo?.hasMore ? body.pageInfo.afterCursor : null,
  };
};

export const listInputFields = [
  {
    key: 'page_size',
    label: 'Page Size',
    type: 'integer' as const,
    required: false,
    default: '20',
    helpText: 'Number of results to return (1-100). Defaults to 20.',
  },
  {
    key: 'cursor',
    label: 'Cursor',
    type: 'string' as const,
    required: false,
    helpText:
      'Pagination cursor from a previous response. Leave empty for the first page.',
  },
];
