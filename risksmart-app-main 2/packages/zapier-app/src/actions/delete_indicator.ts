import type { Bundle, Create, ZObject } from 'zapier-platform-core';

import type { ApiSchema } from '../types/api.js';
import { getEntityUrl } from '../utils/api.js';

type MutationResponse = ApiSchema<'MutationResponse'>;

const perform = async (z: ZObject, bundle: Bundle) => {
  const response = await z.request({
    url: `${getEntityUrl(bundle, 'indicators')}/${bundle.inputData.id}`,
    method: 'DELETE',
  });

  return response.data;
};

export default {
  key: 'delete_indicator',
  noun: 'Indicator',
  display: {
    label: 'Delete Indicator',
    description: 'Deletes an indicator in RiskSmart.',
  },
  operation: {
    inputFields: [
      {
        key: 'id',
        label: 'Indicator ID',
        type: 'string' as const,
        required: true,
        // dynamic: 'list_indicators.id._zapierLabel', // TODO: re-enable when polling triggers ship (Phase 2)
        helpText: 'The UUID of the indicator to delete.',
      },
    ],
    perform,
    sample: {
      id: 'e5f6a7b8-c9d0-1234-efab-345678901234',
    } satisfies MutationResponse,
  },
} satisfies Create;
