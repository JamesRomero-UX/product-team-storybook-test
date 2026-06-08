import type { Bundle, Search, ZObject } from 'zapier-platform-core';

import type { ApiResponse } from '../types/api.js';
import { getEntityUrl } from '../utils/api.js';

type AssessmentResponse = ApiResponse<
  '/api/v1/issues/{issueId}/assessment',
  'get'
>;

const perform = async (z: ZObject, bundle: Bundle) => {
  const parentId = bundle.inputData.parent_id;
  const response = await z.request({
    url: `${getEntityUrl(bundle, 'issues')}/${parentId}/assessment`,
    skipThrowForStatus: true,
  });

  if (response.status === 404) {
    return [];
  }
  response.throwForStatus();

  return [response.data];
};

export default {
  key: 'get_issue_assessment',
  noun: 'Issue Assessment',
  display: {
    label: 'Get Issue Assessment',
    description: 'Gets the assessment for an issue.',
  },
  operation: {
    inputFields: [
      {
        key: 'parent_id',
        label: 'Issue ID',
        type: 'string' as const,
        required: true,
        helpText: 'The UUID of the issue to retrieve the assessment for.',
      },
    ],
    perform,
    sample: {
      id: 'asmt-a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      parentIssueId: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
      issueType: 'operational',
      severity: 3,
      status: 'open',
      createdAt: '2026-01-15T10:30:00Z',
      updatedAt: '2026-01-15T10:30:00Z',
      createdBy: 'auth0|abc123',
      updatedBy: 'auth0|abc123',
    } satisfies Partial<AssessmentResponse>,
  },
} satisfies Search;
