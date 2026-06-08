import { ApprovalStatus } from '@risksmart-app/domain/src/types/consts/approval-status';
import { describe, expect, it } from 'vitest';

import {
  groupChangeRequestsByParentId,
  mergeChangeRequestsIntoEntities,
} from '../change-requests';

interface TestEntity {
  Id: string;
  Name: string;
}

interface TestChangeRequest {
  ParentId: string;
  ChangeRequestStatus: string | null;
  ModifiedAtTimestamp: Date | null;
}

describe('groupChangeRequestsByParentId', () => {
  it('groups change requests by ParentId', () => {
    const changeRequests: TestChangeRequest[] = [
      {
        ParentId: 'parent-1',
        ChangeRequestStatus: 'Pending',
        ModifiedAtTimestamp: new Date('2024-01-01T10:00:00Z'),
      },
      {
        ParentId: 'parent-1',
        ChangeRequestStatus: 'Approved',
        ModifiedAtTimestamp: new Date('2024-01-02T10:00:00Z'),
      },
      {
        ParentId: 'parent-2',
        ChangeRequestStatus: 'Pending',
        ModifiedAtTimestamp: new Date('2024-01-03T10:00:00Z'),
      },
    ];

    const result = groupChangeRequestsByParentId(changeRequests);

    expect(result.size).toBe(2);
    expect(result.get('parent-1')).toHaveLength(2);
    expect(result.get('parent-2')).toHaveLength(1);
    expect(result.get('parent-1')).toEqual([
      {
        ChangeRequestStatus: 'Pending',
        ModifiedAtTimestamp: new Date('2024-01-01T10:00:00Z'),
      },
      {
        ChangeRequestStatus: 'Approved',
        ModifiedAtTimestamp: new Date('2024-01-02T10:00:00Z'),
      },
    ]);
  });

  it('returns empty map for empty input', () => {
    const result = groupChangeRequestsByParentId([]);
    expect(result.size).toBe(0);
  });

  it('handles null values for status and timestamp', () => {
    const changeRequests: TestChangeRequest[] = [
      {
        ParentId: 'parent-1',
        ChangeRequestStatus: null,
        ModifiedAtTimestamp: null,
      },
    ];

    const result = groupChangeRequestsByParentId(changeRequests);

    expect(result.get('parent-1')).toEqual([
      {
        ChangeRequestStatus: null,
        ModifiedAtTimestamp: null,
      },
    ]);
  });
});

// Type for raw change request data used in mergeChangeRequestsIntoEntities
interface RawChangeRequestResult {
  ChangeRequestStatus: string | null;
  ModifiedAtTimestamp: Date | null;
}

describe('mergeChangeRequestsIntoEntities', () => {
  it('merges change requests into entities by Id', () => {
    const entities: TestEntity[] = [
      { Id: 'entity-1', Name: 'First' },
      { Id: 'entity-2', Name: 'Second' },
    ];

    const changeRequestMap = new Map<string, RawChangeRequestResult[]>([
      [
        'entity-1',
        [
          {
            ChangeRequestStatus: ApprovalStatus.Pending,
            ModifiedAtTimestamp: new Date('2024-01-01T10:00:00.000Z'),
          },
        ],
      ],
      [
        'entity-2',
        [
          {
            ChangeRequestStatus: ApprovalStatus.Approved,
            ModifiedAtTimestamp: new Date('2024-01-02T10:00:00.000Z'),
          },
          {
            ChangeRequestStatus: ApprovalStatus.Rejected,
            ModifiedAtTimestamp: new Date('2024-01-03T10:00:00.000Z'),
          },
        ],
      ],
    ]);

    const result = mergeChangeRequestsIntoEntities(entities, changeRequestMap);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      Id: 'entity-1',
      Name: 'First',
      changeRequests: [
        {
          ChangeRequestStatus: ApprovalStatus.Pending,
          ModifiedAtTimestamp: '2024-01-01T10:00:00.000Z',
        },
      ],
    });
    expect(result[1]).toEqual({
      Id: 'entity-2',
      Name: 'Second',
      changeRequests: [
        {
          ChangeRequestStatus: ApprovalStatus.Approved,
          ModifiedAtTimestamp: '2024-01-02T10:00:00.000Z',
        },
        {
          ChangeRequestStatus: ApprovalStatus.Rejected,
          ModifiedAtTimestamp: '2024-01-03T10:00:00.000Z',
        },
      ],
    });
  });

  it('assigns empty array to entities with no matching change requests', () => {
    const entities: TestEntity[] = [
      { Id: 'entity-1', Name: 'First' },
      { Id: 'entity-2', Name: 'Second' },
    ];

    const changeRequestMap = new Map<string, RawChangeRequestResult[]>([
      [
        'entity-1',
        [
          {
            ChangeRequestStatus: ApprovalStatus.Pending,
            ModifiedAtTimestamp: new Date('2024-01-01T10:00:00.000Z'),
          },
        ],
      ],
    ]);

    const result = mergeChangeRequestsIntoEntities(entities, changeRequestMap);

    expect(result[0]!.changeRequests).toHaveLength(1);
    expect(result[1]!.changeRequests).toEqual([]);
  });

  it('returns empty array for empty entities', () => {
    const changeRequestMap = new Map<string, RawChangeRequestResult[]>();
    const result = mergeChangeRequestsIntoEntities([], changeRequestMap);
    expect(result).toEqual([]);
  });

  it('preserves all original entity properties', () => {
    interface ExtendedEntity extends TestEntity {
      Extra: number;
      Nested: { value: string };
    }

    const entities: ExtendedEntity[] = [
      { Id: 'entity-1', Name: 'First', Extra: 42, Nested: { value: 'test' } },
    ];

    const changeRequestMap = new Map<string, RawChangeRequestResult[]>();

    const result = mergeChangeRequestsIntoEntities(entities, changeRequestMap);

    expect(result[0]).toEqual({
      Id: 'entity-1',
      Name: 'First',
      Extra: 42,
      Nested: { value: 'test' },
      changeRequests: [],
    });
  });

  it('filters out change requests with null status', () => {
    const entities: TestEntity[] = [{ Id: 'entity-1', Name: 'First' }];

    const changeRequestMap = new Map<string, RawChangeRequestResult[]>([
      [
        'entity-1',
        [
          {
            ChangeRequestStatus: null,
            ModifiedAtTimestamp: new Date('2024-01-01T10:00:00.000Z'),
          },
          {
            ChangeRequestStatus: ApprovalStatus.Pending,
            ModifiedAtTimestamp: new Date('2024-01-02T10:00:00.000Z'),
          },
        ],
      ],
    ]);

    const result = mergeChangeRequestsIntoEntities(entities, changeRequestMap);

    expect(result[0]!.changeRequests).toHaveLength(1);
    expect(result[0]!.changeRequests[0]!.ChangeRequestStatus).toBe(
      ApprovalStatus.Pending
    );
  });

  it('handles null timestamp by returning empty string', () => {
    const entities: TestEntity[] = [{ Id: 'entity-1', Name: 'First' }];

    const changeRequestMap = new Map<string, RawChangeRequestResult[]>([
      [
        'entity-1',
        [
          {
            ChangeRequestStatus: ApprovalStatus.Pending,
            ModifiedAtTimestamp: null,
          },
        ],
      ],
    ]);

    const result = mergeChangeRequestsIntoEntities(entities, changeRequestMap);

    expect(result[0]!.changeRequests[0]!.ModifiedAtTimestamp).toBe('');
  });
});

describe('integration: groupChangeRequestsByParentId + mergeChangeRequestsIntoEntities', () => {
  it('works together to attach change requests to entities', () => {
    const entities: TestEntity[] = [
      { Id: 'doc-file-1', Name: 'Document 1' },
      { Id: 'doc-file-2', Name: 'Document 2' },
      { Id: 'doc-file-3', Name: 'Document 3' },
    ];

    const changeRequests: TestChangeRequest[] = [
      {
        ParentId: 'doc-file-1',
        ChangeRequestStatus: ApprovalStatus.Pending,
        ModifiedAtTimestamp: new Date('2024-01-01T10:00:00.000Z'),
      },
      {
        ParentId: 'doc-file-1',
        ChangeRequestStatus: ApprovalStatus.Approved,
        ModifiedAtTimestamp: new Date('2024-01-02T10:00:00.000Z'),
      },
      {
        ParentId: 'doc-file-3',
        ChangeRequestStatus: ApprovalStatus.Rejected,
        ModifiedAtTimestamp: new Date('2024-01-03T10:00:00.000Z'),
      },
    ];

    const changeRequestMap = groupChangeRequestsByParentId(changeRequests);
    const result = mergeChangeRequestsIntoEntities(entities, changeRequestMap);

    expect(result).toHaveLength(3);

    // doc-file-1 has 2 change requests
    expect(result[0]!.changeRequests).toHaveLength(2);

    // doc-file-2 has no change requests
    expect(result[1]!.changeRequests).toEqual([]);

    // doc-file-3 has 1 change request
    expect(result[2]!.changeRequests).toHaveLength(1);
    expect(result[2]!.changeRequests[0]!.ChangeRequestStatus).toBe(
      ApprovalStatus.Rejected
    );
  });
});
