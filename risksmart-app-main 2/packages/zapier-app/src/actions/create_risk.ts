import type { Bundle, Create, ZObject } from 'zapier-platform-core';

import type { ApiResponse } from '../types/api.js';
import { getEntityUrl } from '../utils/api.js';

type RiskItem = ApiResponse<'/api/v1/risks/{id}', 'get'>;

const perform = async (z: ZObject, bundle: Bundle) => {
  const body: Record<string, unknown> = {
    title: bundle.inputData.title,
    owners: bundle.inputData.owners,
  };

  if (bundle.inputData.description) {
    body.description = bundle.inputData.description;
  }
  if (bundle.inputData.treatment) {
    body.treatment = bundle.inputData.treatment;
  }
  if (bundle.inputData.status) {
    body.status = bundle.inputData.status;
  }
  if (bundle.inputData.parentRiskId) {
    body.parentRiskId = bundle.inputData.parentRiskId;
  }

  const response = await z.request({
    url: getEntityUrl(bundle, 'risks'),
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  return response.data;
};

export default {
  key: 'create_risk',
  noun: 'Risk',
  display: {
    label: 'Create Risk',
    description: 'Creates a new risk in RiskSmart.',
  },
  operation: {
    inputFields: [
      {
        key: 'title',
        label: 'Title',
        type: 'string' as const,
        required: true,
        helpText: 'The title of the risk.',
      },
      {
        key: 'owners',
        label: 'Owners',
        type: 'string' as const,
        required: true,
        list: true,
        helpText: 'User IDs of the risk owners (at least one required).',
      },
      {
        key: 'description',
        label: 'Description',
        type: 'text' as const,
        required: false,
        helpText: 'A description of the risk.',
      },
      {
        key: 'treatment',
        label: 'Treatment',
        type: 'string' as const,
        required: false,
        choices: ['terminate', 'tolerate', 'transfer', 'treat'],
        helpText: 'The risk treatment strategy.',
      },
      {
        key: 'status',
        label: 'Status',
        type: 'string' as const,
        required: false,
        choices: ['active', 'emerging', 'monitored', 'retired'],
        helpText: 'The risk status.',
      },
      {
        key: 'parentRiskId',
        label: 'Parent Risk ID',
        type: 'string' as const,
        required: false,
        // dynamic: 'list_risks.id._zapierLabel', // TODO: re-enable when polling triggers ship (Phase 2)
        helpText:
          'The UUID of the parent risk. If not provided, the risk is assumed to be tier 1.',
      },
    ],
    perform,
    sample: {
      id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      sequentialId: 1,
      title: 'Data Breach Risk',
      description: 'Risk of unauthorised access to sensitive data',
      tier: 1,
      status: 'active',
      treatment: 'treat',
      owners: ['auth0|abc123'],
      contributors: ['auth0|def456'],
      createdBy: 'auth0|abc123',
      updatedBy: 'auth0|abc123',
      tags: [],
      createdAt: '2026-01-15T10:30:00Z',
      updatedAt: '2026-01-15T10:30:00Z',
    } satisfies Partial<RiskItem>,
  },
} satisfies Create;
