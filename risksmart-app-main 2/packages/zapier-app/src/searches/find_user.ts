import type { Bundle, Search, ZObject } from 'zapier-platform-core';

import type { ApiResponse } from '../types/api.js';
import { getEntityUrl } from '../utils/api.js';

type UserItem = ApiResponse<'/api/v1/users/{id}', 'get'>;

const perform = async (z: ZObject, bundle: Bundle) => {
  const response = await z.request({
    url: `${getEntityUrl(bundle, 'users')}/${bundle.inputData.id}`,
    skipThrowForStatus: true,
  });

  if (response.status === 404) {
    return [];
  }
  response.throwForStatus();

  return [response.data];
};

export default {
  key: 'find_user',
  noun: 'User',
  display: {
    label: 'Find User',
    description: 'Finds a user by their ID.',
  },
  operation: {
    inputFields: [
      {
        key: 'id',
        label: 'User ID',
        type: 'string' as const,
        required: true,
        helpText: 'The ID of the user to find.',
      },
    ],
    perform,
    sample: {
      id: 'auth0|507f1f77bcf86cd799439011',
      firstName: 'Jane',
      lastName: 'Smith',
      friendlyName: 'Jane Smith',
      status: 'active',
      jobTitle: 'Risk Manager',
      department: 'Engineering',
      officeLocation: 'London',
      lastSeen: '2026-01-15T10:30:00Z',
    } satisfies Partial<UserItem>,
  },
} satisfies Search;
