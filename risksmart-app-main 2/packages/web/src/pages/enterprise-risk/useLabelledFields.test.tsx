import { Risk_Treatment_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { renderHook } from '@testing-library/react';

import { useLabelledFields } from './useLabelledFields';

describe('useLabelledFields', () => {
  it('should return an empty array if data is empty', () => {
    const {
      result: { current },
    } = renderHook(() => useLabelledFields([]));
    expect(current).toEqual([]);
  });

  it('should map fields', () => {
    const {
      result: { current },
    } = renderHook(() =>
      useLabelledFields([
        {
          Id: '1',
          Tier: 1,
          SequentialId: 1,
          Title: 'Risk 1',
          Description: 'Risk 1 Description',
          Treatment: Risk_Treatment_Type_Enum.Terminate,
          createdByUser: { FriendlyName: 'John Doe' },
          modifiedByUser: { FriendlyName: 'Jane Doe' },
          CreatedAtTimestamp: '2021-01-01T00:00:00Z',
          ModifiedAtTimestamp: '2021-01-01T00:00:00Z',
          parent: { Title: 'I am your father', Id: '2' },
        },
      ])
    );
    expect(current[0]).toEqual(
      expect.objectContaining({
        TierLabelled: 'Tier 1',
        TreatmentLabelled: 'Terminate',
        SequentialIdLabelled: 'ER-1',
        ParentTitle: 'I am your father',
        CreatedByUser: 'John Doe',
        ModifiedByUser: 'Jane Doe',
      })
    );
  });

  it('should map empty fields', () => {
    const {
      result: { current },
    } = renderHook(() =>
      useLabelledFields([
        {
          Id: '1',
          Tier: 1,
          SequentialId: 0,
          Title: 'Risk 1',
          Description: '',
          Treatment: Risk_Treatment_Type_Enum.Terminate,
          createdByUser: { FriendlyName: '' },
          modifiedByUser: { FriendlyName: '' },
          CreatedAtTimestamp: '2021-01-01T00:00:00Z',
          ModifiedAtTimestamp: '2021-01-01T00:00:00Z',
        },
      ])
    );
    expect(current[0]).toEqual(
      expect.objectContaining({
        SequentialIdLabelled: '-',
        ParentTitle: '-',
        InherentMeanLabelled: '-',
        InherentWorstCaseLabelled: '-',
        ResidualMeanLabelled: '-',
        ResidualWorstCaseLabelled: '-',
      })
    );
  });
});
