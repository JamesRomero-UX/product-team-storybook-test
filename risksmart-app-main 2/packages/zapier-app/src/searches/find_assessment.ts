import type { ApiResponse } from '../types/api.js';
import { createFindSearch } from '../utils/create-find-search.js';

type AssessmentItem = ApiResponse<'/api/v1/assessments/{id}', 'get'>;

export default createFindSearch({
  key: 'find_assessment',
  noun: 'Assessment',
  entity: 'assessments',
  label: 'Find Assessment',
  description: 'Finds an assessment by its ID.',
  idLabel: 'Assessment ID',
  idHelpText: 'The UUID of the assessment to find.',
  // dynamic: 'list_assessments.id._zapierLabel', // TODO: re-enable when polling triggers ship (Phase 2)
  sample: {
    id: 'a7b8c9d0-e1f2-3456-abcd-567890123456',
    sequentialId: 1,
    title: 'Q1 Risk Assessment',
    description: 'Quarterly risk assessment for Q1 2026',
    status: 'in_progress',
    completionDate: null,
    startDate: '2026-01-01T00:00:00Z',
    endDate: '2026-03-31T23:59:59Z',
    createdAt: '2026-01-15T10:30:00Z',
    updatedAt: '2026-01-15T10:30:00Z',
    createdBy: 'auth0|abc123',
    updatedBy: 'auth0|abc123',
    owners: ['auth0|abc123'],
    contributors: ['auth0|def456'],
    tags: [],
  } satisfies Partial<AssessmentItem>,
});
