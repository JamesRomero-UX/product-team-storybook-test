import { getFormConfigRegistry } from '@risksmart-app/shared/forms/formConfigRegistry';
import { describe, expect, it } from 'vitest';

import type { TableFields } from '../types';
import { recordsToExportArray } from './tableExport';

type Rec = {
  id: string;
  ControlledRatingHistory: { date: string; label: string }[];
  UncontrolledScore: number | null;
  ControlledScore: number | null;
};

const getEntityInfo = () => ({ singular: 'risk' });

describe('tableExport.recordsToExportArray (array + zero preservation)', () => {
  const formRegistry = getFormConfigRegistry([]);
  it('uses exportVal for arrays and preserves numeric zero values', () => {
    const items: Rec[] = [
      {
        id: 'r-1',
        ControlledRatingHistory: [
          { date: '2025-01-01', label: 'High' },
          { date: '2025-02-01', label: 'Medium' },
        ],
        UncontrolledScore: 0, // ensure 0 is retained
        ControlledScore: 3,
      },
    ];

    const fields: TableFields<Rec> = {
      id: { header: 'ID' },
      ControlledRatingHistory: {
        header: 'controlled_rating_history',
        exportVal: (item: Rec) =>
          item.ControlledRatingHistory.map((c) => `${c.date} ${c.label}`).join(
            ','
          ),
      },
      UncontrolledScore: { header: 'inherent_score' },
      ControlledScore: { header: 'residual_score' },
    };

    const out = recordsToExportArray(
      items,
      fields,
      ['id', 'ControlledRatingHistory', 'UncontrolledScore', 'ControlledScore'],
      {
        formConfigurations: null,
        formRegistry,
        getEntityInfo,
      }
    );

    expect(out[0]).toEqual([
      'ID',
      'controlled_rating_history',
      'inherent_score',
      'residual_score',
    ]);
    // Rows: array should be joined by comma, 0 must be kept as 0
    expect(out[1]).toEqual(['r-1', '2025-01-01 High,2025-02-01 Medium', 0, 3]);
  });
});
