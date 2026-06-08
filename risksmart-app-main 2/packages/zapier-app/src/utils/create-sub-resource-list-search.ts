import type { Bundle, Search, ZObject } from 'zapier-platform-core';

import { getEntityUrl } from './api.js';
import type { ListResponse } from './list.js';
import { listInputFields } from './list.js';

type LabelFn = (item: Record<string, unknown>) => string;

interface SubResourceListSearchConfig {
  key: string;
  parentEntity: string;
  subResource: string;
  noun: string;
  label: string;
  description: string;
  parentIdLabel: string;
  parentIdHelpText: string;
  sample: Record<string, unknown>;
  labelFn?: LabelFn;
}

const defaultLabelFn: LabelFn = (item) =>
  String(item.title ?? item.friendlyName ?? item.id ?? '');

export const linkedItemLabelFn: LabelFn = (item) => {
  const title = item.linkedItemTitle ?? '';
  const type = item.linkedItemType ?? '';

  return `${String(title)} (${String(type)})`;
};

export const indicatorResultLabelFn: LabelFn = (item) => {
  const description = item.description ?? '';
  const resultDate = item.resultDate ?? '';

  return `${String(description)} (${String(resultDate)})`;
};

export const createSubResourceListSearch = (
  config: SubResourceListSearchConfig
): Search => {
  const labelFn = config.labelFn ?? defaultLabelFn;

  const perform = async (z: ZObject, bundle: Bundle) => {
    const parentId = bundle.inputData.parent_id;
    const entity = `${config.parentEntity}/${parentId}/${config.subResource}`;

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
      results: body.data.map((item) => ({
        ...item,
        _zapierLabel: labelFn(item),
      })),
      paging_token: body.pageInfo?.hasMore ? body.pageInfo.afterCursor : null,
    };
  };

  return {
    key: config.key,
    noun: config.noun,
    display: {
      label: config.label,
      description: config.description,
    },
    operation: {
      inputFields: [
        {
          key: 'parent_id',
          label: config.parentIdLabel,
          type: 'string' as const,
          required: true,
          helpText: config.parentIdHelpText,
        },
        ...listInputFields,
      ],
      perform,
      canPaginate: true,
      sample: config.sample,
    },
  };
};
