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
          Name: 'UK',
          Description: 'Risk 1 Description',
          Weight: 1.0,
          createdByUser: { FriendlyName: 'John Doe' },
          modifiedByUser: { FriendlyName: 'Jane Doe' },
          CreatedAtTimestamp: '2021-01-01T00:00:00Z',
          ModifiedAtTimestamp: '2021-01-01T00:00:00Z',
          parent: { Name: 'EMEA', Id: '2' },
          owners: [{ UserId: '3', user: { FriendlyName: 'John Doe' } }],
          ownerGroups: [],
          children: [],
        },
      ])
    );
    expect(current[0]).toEqual(
      expect.objectContaining({
        ParentTitle: 'EMEA',
        CreatedByUser: 'John Doe',
        ModifiedByUser: 'Jane Doe',
        allOwners: [expect.objectContaining({ label: 'John Doe' })],
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
          Name: 'UK',
          Description: '',
          Weight: 1.0,
          createdByUser: { FriendlyName: '' },
          modifiedByUser: { FriendlyName: '' },
          CreatedAtTimestamp: '2021-01-01T00:00:00Z',
          ModifiedAtTimestamp: '2021-01-01T00:00:00Z',
          owners: [],
          ownerGroups: [],
          children: [],
        },
      ])
    );
    expect(current[0]).toEqual(
      expect.objectContaining({
        ParentTitle: '-',
        allOwners: [],
      })
    );
  });
});
