import type { Bundle, Search, ZObject } from 'zapier-platform-core';

import { getEntityUrl } from './api.js';

interface FindSearchConfig {
  key: string;
  noun: string;
  entity: string;
  label: string;
  description: string;
  idLabel: string;
  idHelpText: string;
  dynamic?: string;
  sample: Record<string, unknown>;
}

export const createFindSearch = (config: FindSearchConfig): Search => ({
  key: config.key,
  noun: config.noun,
  display: {
    label: config.label,
    description: config.description,
  },
  operation: {
    inputFields: [
      {
        key: 'id',
        label: config.idLabel,
        type: 'string' as const,
        required: true,
        ...(config.dynamic ? { dynamic: config.dynamic } : {}),
        helpText: config.idHelpText,
      },
    ],
    perform: async (z: ZObject, bundle: Bundle) => {
      const response = await z.request({
        url: `${getEntityUrl(bundle, config.entity)}/${bundle.inputData.id}`,
        skipThrowForStatus: true,
      });

      if (response.status === 404) {
        return [];
      }
      response.throwForStatus();

      return [response.data];
    },
    sample: config.sample,
  },
});
