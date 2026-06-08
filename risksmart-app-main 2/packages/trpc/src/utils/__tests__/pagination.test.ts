import { describe, expect, it } from 'vitest';

import {
  computePageAndMeta,
  computePageAndMetaCompound,
  sequentialIdPaginationConfig,
  uuidDateTimePaginationConfig,
} from '../pagination';

interface Row {
  SequentialId: number;
  [k: string]: unknown;
}

const rows = (ids: number[]): Row[] => ids.map((n) => ({ SequentialId: n }));
const ids = (rs: Row[]) => rs.map((r) => r.SequentialId);

// --- Common input fixtures ---

const seqNoCursors = {
  limit: undefined,
  afterSequentialId: undefined,
  beforeSequentialId: undefined,
} as const;

const uuidNoCursors = {
  limit: undefined,
  afterId: undefined,
  afterDateTime: undefined,
  beforeId: undefined,
  beforeDateTime: undefined,
} as const;

const TEST_UUID = '123e4567-e89b-12d3-a456-426614174000';
const TEST_UUID_2 = '223e4567-e89b-12d3-a456-426614174000';
const TEST_DATETIME = '2024-01-15T10:00:00Z';
const TEST_DATETIME_2 = '2024-01-14T10:00:00Z';

describe('sequentialIdPaginationConfig', () => {
  describe('default direction (desc - newest first)', () => {
    it('returns forward config (no cursors): desc order, limit = default+1', () => {
      const cfg = sequentialIdPaginationConfig(seqNoCursors, 10);
      expect(cfg).toBeDefined();
      expect(cfg!.limit).toBe(10);
      expect(cfg!.queryConfig.orderBy).toEqual({ SequentialId: 'desc' });
      expect(cfg!.queryConfig.limit).toBe(11);
      expect(cfg!.queryConfig.where).toBeUndefined();
    });

    it('returns forward config with afterSequentialId (lt for desc)', () => {
      const cfg = sequentialIdPaginationConfig(
        { limit: 5, afterSequentialId: 7, beforeSequentialId: undefined },
        10
      );
      expect(cfg).toBeDefined();
      expect(cfg!.limit).toBe(5);
      expect(cfg!.queryConfig).toMatchObject({
        where: { SequentialId: { lt: 7 } },
        orderBy: { SequentialId: 'desc' },
        limit: 6,
      });
    });

    it('returns backward config with beforeSequentialId (gt for desc) and asc direction', () => {
      const cfg = sequentialIdPaginationConfig(
        { limit: 3, beforeSequentialId: 10, afterSequentialId: undefined },
        10
      );
      expect(cfg).toBeDefined();
      expect(cfg!.limit).toBe(3);
      expect(cfg!.queryConfig).toMatchObject({
        where: { SequentialId: { gt: 10 } },
        orderBy: { SequentialId: 'asc' },
        limit: 4,
      });
    });
  });

  describe('explicit asc direction (oldest first)', () => {
    it('returns forward config (no cursors): asc order', () => {
      const cfg = sequentialIdPaginationConfig(seqNoCursors, 10, 'asc');
      expect(cfg).toBeDefined();
      expect(cfg!.limit).toBe(10);
      expect(cfg!.queryConfig.orderBy).toEqual({ SequentialId: 'asc' });
      expect(cfg!.queryConfig.limit).toBe(11);
      expect(cfg!.queryConfig.where).toBeUndefined();
    });

    it('returns forward config with afterSequentialId (gt for asc)', () => {
      const cfg = sequentialIdPaginationConfig(
        { limit: 5, afterSequentialId: 7, beforeSequentialId: undefined },
        10,
        'asc'
      );
      expect(cfg).toBeDefined();
      expect(cfg!.limit).toBe(5);
      expect(cfg!.queryConfig).toMatchObject({
        where: { SequentialId: { gt: 7 } },
        orderBy: { SequentialId: 'asc' },
        limit: 6,
      });
    });

    it('returns backward config with beforeSequentialId (lt for asc) and desc direction', () => {
      const cfg = sequentialIdPaginationConfig(
        { limit: 3, beforeSequentialId: 10, afterSequentialId: undefined },
        10,
        'asc'
      );
      expect(cfg).toBeDefined();
      expect(cfg!.limit).toBe(3);
      expect(cfg!.queryConfig).toMatchObject({
        where: { SequentialId: { lt: 10 } },
        orderBy: { SequentialId: 'desc' },
        limit: 4,
      });
    });
  });

  describe('explicit desc direction matches default', () => {
    it('returns same config as default when desc is passed explicitly', () => {
      const defaultCfg = sequentialIdPaginationConfig(
        { limit: 5, afterSequentialId: 7, beforeSequentialId: undefined },
        10
      );
      const explicitCfg = sequentialIdPaginationConfig(
        { limit: 5, afterSequentialId: 7, beforeSequentialId: undefined },
        10,
        'desc'
      );
      expect(defaultCfg).toEqual(explicitCfg);
    });
  });

  describe('mutual exclusion and edge cases', () => {
    it('returns null when both cursors are provided (mutually exclusive)', () => {
      const cfg = sequentialIdPaginationConfig(
        { limit: 3, beforeSequentialId: 10, afterSequentialId: 5 },
        10
      );
      expect(cfg).toBeNull();
    });

    it('returns null when both cursors are provided regardless of direction', () => {
      const cfg = sequentialIdPaginationConfig(
        { limit: 3, beforeSequentialId: 10, afterSequentialId: 5 },
        10,
        'asc'
      );
      expect(cfg).toBeNull();
    });

    it('clamps limit to defaultLimit when over max', () => {
      const cfg = sequentialIdPaginationConfig(
        { ...seqNoCursors, limit: 999 },
        200
      );
      expect(cfg).toBeDefined();
      expect(cfg!.limit).toBe(200);
      expect(cfg!.queryConfig.limit).toBe(201);
    });

    it('uses defaultLimit when limit is 0 (falsy)', () => {
      const cfg = sequentialIdPaginationConfig(
        { ...seqNoCursors, limit: 0 },
        50
      );
      expect(cfg).toBeDefined();
      expect(cfg!.limit).toBe(50);
      expect(cfg!.queryConfig.limit).toBe(51);
    });

    it('clamps negative limit to 1', () => {
      const cfg = sequentialIdPaginationConfig(
        { ...seqNoCursors, limit: -10 },
        50
      );
      expect(cfg).toBeDefined();
      expect(cfg!.limit).toBe(1);
      expect(cfg!.queryConfig.limit).toBe(2);
    });

    it('uses global default (1000) when defaultLimit is not provided', () => {
      const cfg = sequentialIdPaginationConfig(seqNoCursors);
      expect(cfg).toBeDefined();
      expect(cfg!.limit).toBe(1000);
      expect(cfg!.queryConfig.limit).toBe(1001);
    });
  });
});

describe('uuidDateTimePaginationConfig', () => {
  describe('default direction (desc - newest first)', () => {
    it('returns forward config (no cursors): limit = default+1, direction desc', () => {
      const cfg = uuidDateTimePaginationConfig(uuidNoCursors, 10);
      expect(cfg).toBeDefined();
      expect(cfg.limit).toBe(10);
      expect(cfg.direction).toBe('desc');
      expect(cfg.queryConfig.limit).toBe(11);
      expect(cfg.queryConfig.where).toBeUndefined();
    });

    it('returns forward config with afterId and afterDateTime (lt for desc)', () => {
      const cfg = uuidDateTimePaginationConfig(
        {
          limit: 5,
          afterId: TEST_UUID,
          afterDateTime: TEST_DATETIME,
          beforeId: undefined,
          beforeDateTime: undefined,
        },
        10
      );
      expect(cfg).toBeDefined();
      expect(cfg.limit).toBe(5);
      expect(cfg.direction).toBe('desc');
      expect(cfg.queryConfig.limit).toBe(6);
      expect(cfg.queryConfig.where).toMatchObject({
        OR: [
          { CreatedAtTimestamp: { lt: TEST_DATETIME } },
          { CreatedAtTimestamp: TEST_DATETIME, Id: { lt: TEST_UUID } },
        ],
      });
    });

    it('returns backward config with beforeId and beforeDateTime (gt for desc) and asc direction', () => {
      const cfg = uuidDateTimePaginationConfig(
        {
          limit: 3,
          beforeId: TEST_UUID,
          beforeDateTime: TEST_DATETIME,
          afterId: undefined,
          afterDateTime: undefined,
        },
        10
      );
      expect(cfg).toBeDefined();
      expect(cfg.limit).toBe(3);
      expect(cfg.direction).toBe('asc');
      expect(cfg.queryConfig.limit).toBe(4);
      expect(cfg.queryConfig.where).toMatchObject({
        OR: [
          { CreatedAtTimestamp: { gt: TEST_DATETIME } },
          { CreatedAtTimestamp: TEST_DATETIME, Id: { gt: TEST_UUID } },
        ],
      });
    });
  });

  describe('explicit asc direction (oldest first)', () => {
    it('returns forward config (no cursors): direction asc', () => {
      const cfg = uuidDateTimePaginationConfig(uuidNoCursors, 10, 'asc');
      expect(cfg).toBeDefined();
      expect(cfg.limit).toBe(10);
      expect(cfg.direction).toBe('asc');
      expect(cfg.queryConfig.limit).toBe(11);
      expect(cfg.queryConfig.where).toBeUndefined();
    });

    it('returns forward config with afterId and afterDateTime (gt for asc)', () => {
      const cfg = uuidDateTimePaginationConfig(
        {
          limit: 5,
          afterId: TEST_UUID,
          afterDateTime: TEST_DATETIME,
          beforeId: undefined,
          beforeDateTime: undefined,
        },
        10,
        'asc'
      );
      expect(cfg).toBeDefined();
      expect(cfg.limit).toBe(5);
      expect(cfg.direction).toBe('asc');
      expect(cfg.queryConfig.limit).toBe(6);
      expect(cfg.queryConfig.where).toMatchObject({
        OR: [
          { CreatedAtTimestamp: { gt: TEST_DATETIME } },
          { CreatedAtTimestamp: TEST_DATETIME, Id: { gt: TEST_UUID } },
        ],
      });
    });

    it('returns backward config with beforeId and beforeDateTime (lt for asc) and desc direction', () => {
      const cfg = uuidDateTimePaginationConfig(
        {
          limit: 3,
          beforeId: TEST_UUID,
          beforeDateTime: TEST_DATETIME,
          afterId: undefined,
          afterDateTime: undefined,
        },
        10,
        'asc'
      );
      expect(cfg).toBeDefined();
      expect(cfg.limit).toBe(3);
      expect(cfg.direction).toBe('desc');
      expect(cfg.queryConfig.limit).toBe(4);
      expect(cfg.queryConfig.where).toMatchObject({
        OR: [
          { CreatedAtTimestamp: { lt: TEST_DATETIME } },
          { CreatedAtTimestamp: TEST_DATETIME, Id: { lt: TEST_UUID } },
        ],
      });
    });
  });

  describe('explicit desc direction matches default', () => {
    it('returns same config as default when desc is passed explicitly', () => {
      const defaultCfg = uuidDateTimePaginationConfig(
        {
          limit: 5,
          afterId: TEST_UUID,
          afterDateTime: TEST_DATETIME,
          beforeId: undefined,
          beforeDateTime: undefined,
        },
        10
      );
      const explicitCfg = uuidDateTimePaginationConfig(
        {
          limit: 5,
          afterId: TEST_UUID,
          afterDateTime: TEST_DATETIME,
          beforeId: undefined,
          beforeDateTime: undefined,
        },
        10,
        'desc'
      );
      expect(defaultCfg).toEqual(explicitCfg);
    });
  });

  describe('custom idField parameter', () => {
    const CUSTOM_ID_FIELD = 'CustomId';
    const CUSTOM_DT_FIELD = 'UpdatedAt';

    it('uses custom idField in forward where clause (after cursor, desc)', () => {
      const cfg = uuidDateTimePaginationConfig(
        {
          limit: 5,
          afterId: TEST_UUID,
          afterDateTime: TEST_DATETIME,
          beforeId: undefined,
          beforeDateTime: undefined,
        },
        10,
        'desc',
        'CreatedAtTimestamp',
        CUSTOM_ID_FIELD
      );
      expect(cfg.queryConfig.where).toMatchObject({
        OR: [
          { CreatedAtTimestamp: { lt: TEST_DATETIME } },
          {
            CreatedAtTimestamp: TEST_DATETIME,
            [CUSTOM_ID_FIELD]: { lt: TEST_UUID },
          },
        ],
      });
    });

    it('uses custom idField in backward where clause (before cursor, desc)', () => {
      const cfg = uuidDateTimePaginationConfig(
        {
          limit: 3,
          beforeId: TEST_UUID,
          beforeDateTime: TEST_DATETIME,
          afterId: undefined,
          afterDateTime: undefined,
        },
        10,
        'desc',
        'CreatedAtTimestamp',
        CUSTOM_ID_FIELD
      );
      expect(cfg.queryConfig.where).toMatchObject({
        OR: [
          { CreatedAtTimestamp: { gt: TEST_DATETIME } },
          {
            CreatedAtTimestamp: TEST_DATETIME,
            [CUSTOM_ID_FIELD]: { gt: TEST_UUID },
          },
        ],
      });
    });

    it('uses custom idField in forward where clause (after cursor, asc)', () => {
      const cfg = uuidDateTimePaginationConfig(
        {
          limit: 5,
          afterId: TEST_UUID,
          afterDateTime: TEST_DATETIME,
          beforeId: undefined,
          beforeDateTime: undefined,
        },
        10,
        'asc',
        'CreatedAtTimestamp',
        CUSTOM_ID_FIELD
      );
      expect(cfg.queryConfig.where).toMatchObject({
        OR: [
          { CreatedAtTimestamp: { gt: TEST_DATETIME } },
          {
            CreatedAtTimestamp: TEST_DATETIME,
            [CUSTOM_ID_FIELD]: { gt: TEST_UUID },
          },
        ],
      });
    });

    it('uses custom idField in backward where clause (before cursor, asc)', () => {
      const cfg = uuidDateTimePaginationConfig(
        {
          limit: 3,
          beforeId: TEST_UUID,
          beforeDateTime: TEST_DATETIME,
          afterId: undefined,
          afterDateTime: undefined,
        },
        10,
        'asc',
        'CreatedAtTimestamp',
        CUSTOM_ID_FIELD
      );
      expect(cfg.queryConfig.where).toMatchObject({
        OR: [
          { CreatedAtTimestamp: { lt: TEST_DATETIME } },
          {
            CreatedAtTimestamp: TEST_DATETIME,
            [CUSTOM_ID_FIELD]: { lt: TEST_UUID },
          },
        ],
      });
    });

    it('uses custom dateTimeField in forward where clause (after cursor)', () => {
      const cfg = uuidDateTimePaginationConfig(
        {
          limit: 5,
          afterId: TEST_UUID,
          afterDateTime: TEST_DATETIME,
          beforeId: undefined,
          beforeDateTime: undefined,
        },
        10,
        'desc',
        CUSTOM_DT_FIELD,
        'Id'
      );
      expect(cfg.queryConfig.where).toMatchObject({
        OR: [
          { [CUSTOM_DT_FIELD]: { lt: TEST_DATETIME } },
          { [CUSTOM_DT_FIELD]: TEST_DATETIME, Id: { lt: TEST_UUID } },
        ],
      });
    });

    it('uses custom dateTimeField in backward where clause (before cursor)', () => {
      const cfg = uuidDateTimePaginationConfig(
        {
          limit: 3,
          beforeId: TEST_UUID,
          beforeDateTime: TEST_DATETIME,
          afterId: undefined,
          afterDateTime: undefined,
        },
        10,
        'desc',
        CUSTOM_DT_FIELD,
        'Id'
      );
      expect(cfg.queryConfig.where).toMatchObject({
        OR: [
          { [CUSTOM_DT_FIELD]: { gt: TEST_DATETIME } },
          { [CUSTOM_DT_FIELD]: TEST_DATETIME, Id: { gt: TEST_UUID } },
        ],
      });
    });

    it('uses both custom idField and dateTimeField together', () => {
      const cfg = uuidDateTimePaginationConfig(
        {
          limit: 5,
          afterId: TEST_UUID,
          afterDateTime: TEST_DATETIME,
          beforeId: undefined,
          beforeDateTime: undefined,
        },
        10,
        'desc',
        CUSTOM_DT_FIELD,
        CUSTOM_ID_FIELD
      );
      expect(cfg.queryConfig.where).toMatchObject({
        OR: [
          { [CUSTOM_DT_FIELD]: { lt: TEST_DATETIME } },
          {
            [CUSTOM_DT_FIELD]: TEST_DATETIME,
            [CUSTOM_ID_FIELD]: { lt: TEST_UUID },
          },
        ],
      });
    });

    it('does not include default Id field when custom idField is used', () => {
      const cfg = uuidDateTimePaginationConfig(
        {
          limit: 5,
          afterId: TEST_UUID,
          afterDateTime: TEST_DATETIME,
          beforeId: undefined,
          beforeDateTime: undefined,
        },
        10,
        'desc',
        'CreatedAtTimestamp',
        CUSTOM_ID_FIELD
      );
      // where clause should NOT contain default 'Id' key
      const orClause = cfg.queryConfig.where?.OR ?? [];
      const secondCondition = orClause[1] as Record<string, unknown>;
      expect(secondCondition).not.toHaveProperty('Id');
      expect(secondCondition).toHaveProperty(CUSTOM_ID_FIELD);
    });

    it('returns no where clause when no cursors and custom fields are provided', () => {
      const cfg = uuidDateTimePaginationConfig(
        uuidNoCursors,
        10,
        'desc',
        CUSTOM_DT_FIELD,
        CUSTOM_ID_FIELD
      );
      expect(cfg.queryConfig.where).toBeUndefined();
      expect(cfg.limit).toBe(10);
      expect(cfg.direction).toBe('desc');
    });
  });

  describe('mutual exclusion and edge cases', () => {
    it('throws when both before and after cursors are provided', () => {
      expect(() => {
        uuidDateTimePaginationConfig(
          {
            limit: 3,
            beforeId: TEST_UUID,
            beforeDateTime: TEST_DATETIME,
            afterId: TEST_UUID_2,
            afterDateTime: TEST_DATETIME_2,
          },
          10
        );
      }).toThrow("Provide only one of 'after' or 'before' for pagination.");
    });

    it('throws when both cursors are provided regardless of direction', () => {
      expect(() => {
        uuidDateTimePaginationConfig(
          {
            limit: 3,
            beforeId: TEST_UUID,
            beforeDateTime: TEST_DATETIME,
            afterId: TEST_UUID_2,
            afterDateTime: TEST_DATETIME_2,
          },
          10,
          'asc'
        );
      }).toThrow("Provide only one of 'after' or 'before' for pagination.");
    });

    it('clamps limit to defaultLimit when over max', () => {
      const cfg = uuidDateTimePaginationConfig(
        { ...uuidNoCursors, limit: 999 },
        200
      );
      expect(cfg).toBeDefined();
      expect(cfg.limit).toBe(200);
      expect(cfg.queryConfig.limit).toBe(201);
    });

    it('uses defaultLimit when limit is 0 (falsy)', () => {
      const cfg = uuidDateTimePaginationConfig(
        { ...uuidNoCursors, limit: 0 },
        50
      );
      expect(cfg).toBeDefined();
      expect(cfg.limit).toBe(50);
      expect(cfg.queryConfig.limit).toBe(51);
    });

    it('clamps negative limit to 1', () => {
      const cfg = uuidDateTimePaginationConfig(
        { ...uuidNoCursors, limit: -5 },
        50
      );
      expect(cfg).toBeDefined();
      expect(cfg.limit).toBe(1);
      expect(cfg.queryConfig.limit).toBe(2);
    });

    it('allows afterId without afterDateTime (both null) - no where clause', () => {
      const cfg = uuidDateTimePaginationConfig(
        {
          limit: 5,
          afterId: null,
          afterDateTime: null,
          beforeId: undefined,
          beforeDateTime: undefined,
        },
        10
      );
      expect(cfg).toBeDefined();
      expect(cfg.direction).toBe('desc');
      expect(cfg.queryConfig.where).toBeUndefined();
    });

    it('allows beforeId without beforeDateTime (both null) - falls through to forward', () => {
      const cfg = uuidDateTimePaginationConfig(
        {
          limit: 5,
          afterId: undefined,
          afterDateTime: undefined,
          beforeId: null,
          beforeDateTime: null,
        },
        10
      );
      expect(cfg).toBeDefined();
      expect(cfg.direction).toBe('desc');
      expect(cfg.queryConfig.where).toBeUndefined();
    });

    it('uses global default (1000) when defaultLimit is not provided', () => {
      const cfg = uuidDateTimePaginationConfig(uuidNoCursors);
      expect(cfg).toBeDefined();
      expect(cfg.limit).toBe(1000);
      expect(cfg.queryConfig.limit).toBe(1001);
    });
  });
});

describe('computePageAndMeta', () => {
  const cursorKey = 'SequentialId' as const;

  describe('forward pages', () => {
    it('first forward page (no after): returns asc page, nextId present, prevId null', () => {
      // Simulate DB returning limit+1 rows: [1,2,3]
      const data = rows([1, 2, 3]);
      const { page, metadata } = computePageAndMeta(
        { afterId: null, beforeId: null },
        data,
        2,
        cursorKey
      );

      expect(ids(page)).toEqual([1, 2]);
      expect(metadata.count).toBe(2);
      expect(metadata.hasNext).toBe(true);
      expect(metadata.hasPrev).toBe(false);
      expect(metadata.nextId).toBe(2);
      expect(metadata.prevId).toBeNull();
    });

    it('forward page with afterId: prevId is first item, nextId is last if extra row exists', () => {
      // afterId=2, DB returns [3,4,5] (limit+1)
      const data = rows([3, 4, 5]);
      const { page, metadata } = computePageAndMeta(
        { afterId: 2, beforeId: null },
        data,
        2,
        cursorKey
      );

      expect(ids(page)).toEqual([3, 4]);
      expect(metadata.hasPrev).toBe(true);
      expect(metadata.prevId).toBe(3);
      expect(metadata.hasNext).toBe(true);
      expect(metadata.nextId).toBe(4);
    });

    it('forward page (no extra row): hasNext=false, prevId = first item', () => {
      // afterId=4, DB returns [5] (<= limit)
      const data = rows([5]);
      const { page, metadata } = computePageAndMeta(
        { afterId: 4, beforeId: null },
        data,
        2,
        cursorKey
      );

      expect(ids(page)).toEqual([5]);
      expect(metadata.hasNext).toBe(false);
      expect(metadata.nextId).toBeNull();
      expect(metadata.hasPrev).toBe(true);
      expect(metadata.prevId).toBe(5);
    });

    it('empty forward page: prevId falls back to afterId', () => {
      // afterId beyond max
      const data: Row[] = [];
      const { page, metadata } = computePageAndMeta(
        { afterId: 999, beforeId: null },
        data,
        2,
        cursorKey
      );

      expect(page).toHaveLength(0);
      expect(metadata.count).toBe(0);
      expect(metadata.hasNext).toBe(false);
      expect(metadata.hasPrev).toBe(true);
      expect(metadata.prevId).toBe(999);
      expect(metadata.nextId).toBeNull();
    });
  });

  describe('backward pages', () => {
    it('backward page (with extra row): returns asc page, prevId present, nextId is last', () => {
      // beforeId=4, DB returned DESC scan with limit+1 rows: [3,2,1]
      const data = rows([3, 2, 1]);
      const { page, metadata } = computePageAndMeta(
        { beforeId: 4, afterId: null },
        data,
        2,
        cursorKey
      );

      // slice(0,2) => [3,2]; reversed => [2,3]
      expect(ids(page)).toEqual([2, 3]);
      expect(metadata.count).toBe(2);
      expect(metadata.hasPrev).toBe(true);
      expect(metadata.prevId).toBe(2);
      expect(metadata.hasNext).toBe(true); // count > 0
      expect(metadata.nextId).toBe(3);
    });

    it('backward page (no extra row): prevId null, nextId is last', () => {
      // beforeId=3, DB returned exactly limit rows: [2,1]
      const data = rows([2, 1]);
      const { page, metadata } = computePageAndMeta(
        { beforeId: 3, afterId: null },
        data,
        2,
        cursorKey
      );

      expect(ids(page)).toEqual([1, 2]);
      expect(metadata.hasPrev).toBe(false);
      expect(metadata.prevId).toBeNull();
      expect(metadata.hasNext).toBe(true);
      expect(metadata.nextId).toBe(2);
    });

    it('empty backward page: both cursors null, no next/prev', () => {
      // beforeId at/below min
      const data: Row[] = [];
      const { page, metadata } = computePageAndMeta(
        { beforeId: 1, afterId: null },
        data,
        2,
        cursorKey
      );

      expect(page).toHaveLength(0);
      expect(metadata.count).toBe(0);
      expect(metadata.hasPrev).toBe(false);
      expect(metadata.hasNext).toBe(false);
      expect(metadata.prevId).toBeNull();
      expect(metadata.nextId).toBeNull();
    });
  });

  describe('navigation round-trip (simulated)', () => {
    it('forward then backward returns the original page', () => {
      // page1: first forward page (limit=2): raw [1,2,3]
      const p1 = computePageAndMeta(
        { afterId: null, beforeId: null },
        rows([1, 2, 3]),
        2,
        cursorKey
      );
      expect(ids(p1.page)).toEqual([1, 2]);

      // page2: forward after nextId=2 (limit=2): raw [3,4,5]
      const p2 = computePageAndMeta(
        { afterId: p1.metadata.nextId!, beforeId: null },
        rows([3, 4, 5]),
        2,
        cursorKey
      );
      expect(ids(p2.page)).toEqual([3, 4]);

      // back to page1: use before = p2.metadata.prevId (first id of page2) → raw DESC under 3: [2,1]
      const backRawDesc = rows([2, 1]);
      const back = computePageAndMeta(
        { beforeId: p2.metadata.prevId!, afterId: null },
        backRawDesc,
        2,
        cursorKey
      );

      expect(ids(back.page)).toEqual(ids(p1.page));
    });
  });
});

describe('computePageAndMetaCompound', () => {
  interface CompoundRow {
    Id: string;
    CreatedAtTimestamp: string;
    [k: string]: unknown;
  }

  const compoundRows = (
    items: Array<{ id: string; ts: string }>
  ): CompoundRow[] =>
    items.map((item) => ({
      Id: item.id,
      CreatedAtTimestamp: item.ts,
    }));

  const compoundIds = (rs: CompoundRow[]) =>
    rs.map((r) => ({ id: r.Id, ts: r.CreatedAtTimestamp }));

  describe('forward pages', () => {
    it('first forward page (no after): returns asc page, next cursors present, prev cursors null', () => {
      // Simulate DB returning limit+1 rows
      const data = compoundRows([
        { id: 'id1', ts: '2024-01-01T10:00:00Z' },
        { id: 'id2', ts: '2024-01-01T11:00:00Z' },
        { id: 'id3', ts: '2024-01-01T12:00:00Z' },
      ]);

      const { page, metadata } = computePageAndMetaCompound(
        {
          afterId: null,
          afterDateTime: null,
          beforeId: null,
          beforeDateTime: null,
        },
        data,
        2,
        'Id',
        'CreatedAtTimestamp'
      );

      expect(compoundIds(page)).toEqual([
        { id: 'id1', ts: '2024-01-01T10:00:00Z' },
        { id: 'id2', ts: '2024-01-01T11:00:00Z' },
      ]);
      expect(metadata.count).toBe(2);
      expect(metadata.hasNext).toBe(true);
      expect(metadata.hasPrev).toBe(false);
      expect(metadata.nextId).toBe('id2');
      expect(metadata.nextDateTime).toBe('2024-01-01T11:00:00Z');
      expect(metadata.prevId).toBeNull();
      expect(metadata.prevDateTime).toBeNull();
    });

    it('forward page with after cursors: prev cursors set to first item, next cursors set if extra row exists', () => {
      // afterId/afterDateTime set, DB returns limit+1
      const data = compoundRows([
        { id: 'id3', ts: '2024-01-01T12:00:00Z' },
        { id: 'id4', ts: '2024-01-01T13:00:00Z' },
        { id: 'id5', ts: '2024-01-01T14:00:00Z' },
      ]);

      const { page, metadata } = computePageAndMetaCompound(
        {
          afterId: 'id2',
          afterDateTime: '2024-01-01T11:00:00Z',
          beforeId: null,
          beforeDateTime: null,
        },
        data,
        2,
        'Id',
        'CreatedAtTimestamp'
      );

      expect(compoundIds(page)).toEqual([
        { id: 'id3', ts: '2024-01-01T12:00:00Z' },
        { id: 'id4', ts: '2024-01-01T13:00:00Z' },
      ]);
      expect(metadata.hasPrev).toBe(true);
      expect(metadata.prevId).toBe('id3');
      expect(metadata.prevDateTime).toBe('2024-01-01T12:00:00Z');
      expect(metadata.hasNext).toBe(true);
      expect(metadata.nextId).toBe('id4');
      expect(metadata.nextDateTime).toBe('2024-01-01T13:00:00Z');
    });

    it('forward page (no extra row): hasNext=false, prev cursors = first item', () => {
      // after cursors set, DB returns <= limit
      const data = compoundRows([{ id: 'id5', ts: '2024-01-01T14:00:00Z' }]);

      const { page, metadata } = computePageAndMetaCompound(
        {
          afterId: 'id4',
          afterDateTime: '2024-01-01T13:00:00Z',
          beforeId: null,
          beforeDateTime: null,
        },
        data,
        2,
        'Id',
        'CreatedAtTimestamp'
      );

      expect(compoundIds(page)).toEqual([
        { id: 'id5', ts: '2024-01-01T14:00:00Z' },
      ]);
      expect(metadata.hasNext).toBe(false);
      expect(metadata.nextId).toBeNull();
      expect(metadata.nextDateTime).toBeNull();
      expect(metadata.hasPrev).toBe(true);
      expect(metadata.prevId).toBe('id5');
      expect(metadata.prevDateTime).toBe('2024-01-01T14:00:00Z');
    });

    it('empty forward page: prev cursors fall back to after cursors', () => {
      // after cursors beyond max
      const data: CompoundRow[] = [];

      const { page, metadata } = computePageAndMetaCompound(
        {
          afterId: 'id999',
          afterDateTime: '2024-12-31T23:59:59Z',
          beforeId: null,
          beforeDateTime: null,
        },
        data,
        2,
        'Id',
        'CreatedAtTimestamp'
      );

      expect(page).toHaveLength(0);
      expect(metadata.count).toBe(0);
      expect(metadata.hasNext).toBe(false);
      expect(metadata.hasPrev).toBe(true);
      expect(metadata.prevId).toBe('id999');
      expect(metadata.prevDateTime).toBe('2024-12-31T23:59:59Z');
      expect(metadata.nextId).toBeNull();
      expect(metadata.nextDateTime).toBeNull();
    });
  });

  describe('backward pages', () => {
    it('backward page (with extra row): returns asc page, prev cursors present, next cursors are last', () => {
      // beforeId/beforeDateTime set, DB returned DESC scan with limit+1 rows
      const data = compoundRows([
        { id: 'id3', ts: '2024-01-01T12:00:00Z' },
        { id: 'id2', ts: '2024-01-01T11:00:00Z' },
        { id: 'id1', ts: '2024-01-01T10:00:00Z' },
      ]);

      const { page, metadata } = computePageAndMetaCompound(
        {
          beforeId: 'id4',
          beforeDateTime: '2024-01-01T13:00:00Z',
          afterId: null,
          afterDateTime: null,
        },
        data,
        2,
        'Id',
        'CreatedAtTimestamp'
      );

      // slice(0,2) => [id3, id2]; reversed => [id2, id3]
      expect(compoundIds(page)).toEqual([
        { id: 'id2', ts: '2024-01-01T11:00:00Z' },
        { id: 'id3', ts: '2024-01-01T12:00:00Z' },
      ]);
      expect(metadata.count).toBe(2);
      expect(metadata.hasPrev).toBe(true);
      expect(metadata.prevId).toBe('id2');
      expect(metadata.prevDateTime).toBe('2024-01-01T11:00:00Z');
      expect(metadata.hasNext).toBe(true); // count > 0
      expect(metadata.nextId).toBe('id3');
      expect(metadata.nextDateTime).toBe('2024-01-01T12:00:00Z');
    });

    it('backward page (no extra row): prev cursors null, next cursors are last', () => {
      // beforeId/beforeDateTime set, DB returned exactly limit rows
      const data = compoundRows([
        { id: 'id2', ts: '2024-01-01T11:00:00Z' },
        { id: 'id1', ts: '2024-01-01T10:00:00Z' },
      ]);

      const { page, metadata } = computePageAndMetaCompound(
        {
          beforeId: 'id3',
          beforeDateTime: '2024-01-01T12:00:00Z',
          afterId: null,
          afterDateTime: null,
        },
        data,
        2,
        'Id',
        'CreatedAtTimestamp'
      );

      expect(compoundIds(page)).toEqual([
        { id: 'id1', ts: '2024-01-01T10:00:00Z' },
        { id: 'id2', ts: '2024-01-01T11:00:00Z' },
      ]);
      expect(metadata.hasPrev).toBe(false);
      expect(metadata.prevId).toBeNull();
      expect(metadata.prevDateTime).toBeNull();
      expect(metadata.hasNext).toBe(true);
      expect(metadata.nextId).toBe('id2');
      expect(metadata.nextDateTime).toBe('2024-01-01T11:00:00Z');
    });

    it('empty backward page: all cursors null, no next/prev', () => {
      // beforeId/beforeDateTime at/below min
      const data: CompoundRow[] = [];

      const { page, metadata } = computePageAndMetaCompound(
        {
          beforeId: 'id1',
          beforeDateTime: '2024-01-01T10:00:00Z',
          afterId: null,
          afterDateTime: null,
        },
        data,
        2,
        'Id',
        'CreatedAtTimestamp'
      );

      expect(page).toHaveLength(0);
      expect(metadata.count).toBe(0);
      expect(metadata.hasPrev).toBe(false);
      expect(metadata.hasNext).toBe(false);
      expect(metadata.prevId).toBeNull();
      expect(metadata.prevDateTime).toBeNull();
      expect(metadata.nextId).toBeNull();
      expect(metadata.nextDateTime).toBeNull();
    });
  });

  describe('edge cases', () => {
    it('handles records with same timestamp, different IDs', () => {
      // Multiple records at same timestamp - ID acts as tie-breaker
      const data = compoundRows([
        { id: 'id1', ts: '2024-01-01T10:00:00Z' },
        { id: 'id2', ts: '2024-01-01T10:00:00Z' },
        { id: 'id3', ts: '2024-01-01T10:00:00Z' },
      ]);

      const { page, metadata } = computePageAndMetaCompound(
        {
          afterId: null,
          afterDateTime: null,
          beforeId: null,
          beforeDateTime: null,
        },
        data,
        2,
        'Id',
        'CreatedAtTimestamp'
      );

      expect(compoundIds(page)).toEqual([
        { id: 'id1', ts: '2024-01-01T10:00:00Z' },
        { id: 'id2', ts: '2024-01-01T10:00:00Z' },
      ]);
      expect(metadata.nextId).toBe('id2');
      expect(metadata.nextDateTime).toBe('2024-01-01T10:00:00Z');
    });

    it('handles single item result', () => {
      const data = compoundRows([{ id: 'id1', ts: '2024-01-01T10:00:00Z' }]);

      const { page, metadata } = computePageAndMetaCompound(
        {
          afterId: null,
          afterDateTime: null,
          beforeId: null,
          beforeDateTime: null,
        },
        data,
        2,
        'Id',
        'CreatedAtTimestamp'
      );

      expect(page).toHaveLength(1);
      expect(metadata.count).toBe(1);
      expect(metadata.hasNext).toBe(false);
      expect(metadata.hasPrev).toBe(false);
      expect(metadata.nextId).toBeNull();
      expect(metadata.prevId).toBeNull();
    });
  });

  describe('navigation round-trip (simulated)', () => {
    it('forward then backward returns the original page', () => {
      // page1: first forward page (limit=2): raw [id1, id2, id3]
      const p1 = computePageAndMetaCompound(
        {
          afterId: null,
          afterDateTime: null,
          beforeId: null,
          beforeDateTime: null,
        },
        compoundRows([
          { id: 'id1', ts: '2024-01-01T10:00:00Z' },
          { id: 'id2', ts: '2024-01-01T11:00:00Z' },
          { id: 'id3', ts: '2024-01-01T12:00:00Z' },
        ]),
        2,
        'Id',
        'CreatedAtTimestamp'
      );
      expect(compoundIds(p1.page)).toEqual([
        { id: 'id1', ts: '2024-01-01T10:00:00Z' },
        { id: 'id2', ts: '2024-01-01T11:00:00Z' },
      ]);

      // page2: forward after nextId/nextDateTime (limit=2): raw [id3, id4, id5]
      const p2 = computePageAndMetaCompound(
        {
          afterId: p1.metadata.nextId!,
          afterDateTime: p1.metadata.nextDateTime!,
          beforeId: null,
          beforeDateTime: null,
        },
        compoundRows([
          { id: 'id3', ts: '2024-01-01T12:00:00Z' },
          { id: 'id4', ts: '2024-01-01T13:00:00Z' },
          { id: 'id5', ts: '2024-01-01T14:00:00Z' },
        ]),
        2,
        'Id',
        'CreatedAtTimestamp'
      );
      expect(compoundIds(p2.page)).toEqual([
        { id: 'id3', ts: '2024-01-01T12:00:00Z' },
        { id: 'id4', ts: '2024-01-01T13:00:00Z' },
      ]);

      // back to page1: use before = p2.metadata.prevId/prevDateTime → raw DESC under id3: [id2, id1]
      const backRawDesc = compoundRows([
        { id: 'id2', ts: '2024-01-01T11:00:00Z' },
        { id: 'id1', ts: '2024-01-01T10:00:00Z' },
      ]);
      const back = computePageAndMetaCompound(
        {
          beforeId: p2.metadata.prevId!,
          beforeDateTime: p2.metadata.prevDateTime!,
          afterId: null,
          afterDateTime: null,
        },
        backRawDesc,
        2,
        'Id',
        'CreatedAtTimestamp'
      );

      expect(compoundIds(back.page)).toEqual(compoundIds(p1.page));
    });
  });
});
