import type { Bundle, Create, ZObject } from 'zapier-platform-core';

import type { ApiResponse } from '../types/api.js';
import { getEntityUrl } from '../utils/api.js';

type IndicatorItem = ApiResponse<'/api/v1/indicators/{id}', 'get'>;

const perform = async (z: ZObject, bundle: Bundle) => {
  const body: Record<string, unknown> = {};

  if (bundle.inputData.title) {
    body.title = bundle.inputData.title;
  }
  if (bundle.inputData.type) {
    body.type = bundle.inputData.type;
  }
  if (bundle.inputData.owners) {
    body.owners = bundle.inputData.owners;
  }
  if (bundle.inputData.description !== undefined) {
    body.description = bundle.inputData.description;
  }

  // Number-type fields
  if (bundle.inputData.unit !== undefined) {
    body.unit = bundle.inputData.unit;
  }
  if (bundle.inputData.upperTolerance != null) {
    body.upperTolerance = bundle.inputData.upperTolerance;
  }
  if (bundle.inputData.lowerTolerance != null) {
    body.lowerTolerance = bundle.inputData.lowerTolerance;
  }
  if (bundle.inputData.upperAppetite != null) {
    body.upperAppetite = bundle.inputData.upperAppetite;
  }
  if (bundle.inputData.lowerAppetite != null) {
    body.lowerAppetite = bundle.inputData.lowerAppetite;
  }

  // Text-type fields
  if (bundle.inputData.targetValue) {
    body.targetValue = bundle.inputData.targetValue;
  }

  const response = await z.request({
    url: `${getEntityUrl(bundle, 'indicators')}/${bundle.inputData.id}`,
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  return response.data;
};

export default {
  key: 'update_indicator',
  noun: 'Indicator',
  display: {
    label: 'Update Indicator',
    description: 'Updates an existing indicator in RiskSmart.',
  },
  operation: {
    inputFields: [
      {
        key: 'id',
        label: 'Indicator ID',
        type: 'string' as const,
        required: true,
        // dynamic: 'list_indicators.id._zapierLabel', // TODO: re-enable when polling triggers ship (Phase 2)
        helpText: 'The UUID of the indicator to update.',
      },
      {
        key: 'title',
        label: 'Title',
        type: 'string' as const,
        required: true,
        helpText: 'The title of the indicator.',
      },
      {
        key: 'type',
        label: 'Type',
        type: 'string' as const,
        required: false,
        choices: ['number', 'text'],
        helpText: 'The indicator type.',
      },
      {
        key: 'owners',
        label: 'Owners',
        type: 'string' as const,
        required: true,
        list: true,
        helpText: 'User IDs of the indicator owners.',
      },
      {
        key: 'description',
        label: 'Description',
        type: 'text' as const,
        required: false,
        helpText: 'A description of the indicator.',
      },
      {
        key: 'unit',
        label: 'Unit',
        type: 'string' as const,
        required: false,
        helpText: 'The unit of measurement (for number-type indicators).',
      },
      {
        key: 'targetValue',
        label: 'Target Value',
        type: 'string' as const,
        required: false,
        helpText: 'The target value (for text-type indicators).',
      },
      {
        key: 'lowerTolerance',
        label: 'Lower Tolerance',
        type: 'number' as const,
        required: false,
        helpText: 'Lower tolerance threshold (for number-type indicators).',
      },
      {
        key: 'lowerAppetite',
        label: 'Lower Appetite',
        type: 'number' as const,
        required: false,
        helpText: 'Lower appetite threshold (for number-type indicators).',
      },
      {
        key: 'upperAppetite',
        label: 'Upper Appetite',
        type: 'number' as const,
        required: false,
        helpText: 'Upper appetite threshold (for number-type indicators).',
      },
      {
        key: 'upperTolerance',
        label: 'Upper Tolerance',
        type: 'number' as const,
        required: false,
        helpText: 'Upper tolerance threshold (for number-type indicators).',
      },
    ],
    perform,
    sample: {
      id: 'e5f6a7b8-c9d0-1234-efab-345678901234',
      sequentialId: 1,
      title: 'System Uptime',
      description: 'Monthly system uptime percentage',
      type: 'number',
      unit: '%',
      owners: ['auth0|abc123'],
      contributors: ['auth0|def456'],
      createdBy: 'auth0|abc123',
      updatedBy: 'auth0|abc123',
      tags: [],
      createdAt: '2026-01-15T10:30:00Z',
      updatedAt: '2026-01-15T10:30:00Z',
    } satisfies Partial<IndicatorItem>,
  },
} satisfies Create;
