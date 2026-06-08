import type { Bundle, Create, ZObject } from 'zapier-platform-core';

import type { ApiSchema } from '../types/api.js';
import { getEntityUrl } from '../utils/api.js';

type MutationResponse = ApiSchema<'MutationResponse'>;

const perform = async (z: ZObject, bundle: Bundle) => {
  const response = await z.request({
    url: `${getEntityUrl(bundle, 'risks')}/${bundle.inputData.id}`,
    method: 'DELETE',
  });

  return response.data;
};

export default {
  key: 'delete_risk',
  noun: 'Risk',
  display: {
    label: 'Delete Risk',
    description: 'Deletes a risk in RiskSmart.',
  },
  operation: {
    inputFields: [
      {
        key: 'id',
        label: 'Risk ID',
        type: 'string' as const,
        required: true,
        // dynamic: 'list_risks.id._zapierLabel', // TODO: re-enable when polling triggers ship (Phase 2)
        helpText: 'The UUID of the risk to delete.',
      },
    ],
    perform,
    sample: {
      id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    } satisfies MutationResponse,
  },
} satisfies Create;
