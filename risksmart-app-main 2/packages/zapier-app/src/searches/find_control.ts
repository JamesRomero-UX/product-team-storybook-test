import type { ApiResponse } from '../types/api.js';
import { createFindSearch } from '../utils/create-find-search.js';

type ControlItem = ApiResponse<'/api/v1/controls/{id}', 'get'>;

export default createFindSearch({
  key: 'find_control',
  noun: 'Control',
  entity: 'controls',
  label: 'Find Control',
  description: 'Finds a control by its ID.',
  idLabel: 'Control ID',
  idHelpText: 'The UUID of the control to find.',
  // dynamic: 'list_controls.id._zapierLabel', // TODO: re-enable when polling triggers ship (Phase 2)
  sample: {
    id: 'd4e5f6a7-b8c9-0123-defa-234567890123',
    sequentialId: 1,
    title: 'Access Control Policy',
    description: 'Role-based access control enforcement',
    type: 'detective',
    createdAt: '2026-01-15T10:30:00Z',
    updatedAt: '2026-01-15T10:30:00Z',
    createdBy: 'auth0|abc123',
    updatedBy: 'auth0|abc123',
    owners: ['auth0|abc123'],
    contributors: ['auth0|def456'],
    tags: [],
  } satisfies Partial<ControlItem>,
});
