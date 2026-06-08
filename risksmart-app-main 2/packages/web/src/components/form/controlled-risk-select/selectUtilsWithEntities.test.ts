import type { GetRiskListWithEntitiesQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { describe, expect, it } from 'vitest';

import { getOptionsWithEntities } from './selectUtilsWithEntities';

// Mock data types
type MockRisk = NonNullable<GetRiskListWithEntitiesQuery['risk'][number]>;
type MockEntity = NonNullable<MockRisk['enterpriseRiskInstance']>['entity'];

const createMockEntity = (overrides: Partial<MockEntity> = {}): MockEntity => ({
  Id: 'entity-1',
  Name: 'Test Entity',
  ParentId: null,
  ...overrides,
});

const createMockRisk = (overrides: Partial<MockRisk> = {}): MockRisk => ({
  Id: 'risk-1',
  Title: 'Test Risk',
  SequentialId: 1,
  enterpriseRiskInstance: {
    EntityId: 'entity-1',
    entity: createMockEntity(),
  },
  ...overrides,
});

const createMockData = (
  risks: MockRisk[] = []
): GetRiskListWithEntitiesQuery => ({
  risk: risks,
  node: risks.map((risk) => ({
    __typename: 'node' as const,
    Id: risk.Id,
    SequentialId: risk.SequentialId,
  })),
  __typename: 'query_root' as const,
});

describe('selectUtilsWithEntities', () => {
  describe('getOptionsWithEntities', () => {
    it('includes entityId when entity present and showEntityLabels=true', () => {
      const data = createMockData([
        createMockRisk({
          enterpriseRiskInstance: {
            EntityId: 'entity-123',
            entity: createMockEntity({ Id: 'entity-123', Name: 'Entity 123' }),
          },
        }),
      ]);

      const result = getOptionsWithEntities(data, undefined, true);

      expect(result[0].value).toBe('risk-1');
      expect(result[0].label).toBe('Test Risk');
      expect(result[0].entityInfo?.entityId).toBe('entity-123');
    });

    it('omits entityInfo when showEntityLabels=false', () => {
      const data = createMockData([createMockRisk()]);
      const result = getOptionsWithEntities(data, undefined, false);
      expect(result[0].entityInfo).toBeUndefined();
    });

    it('omits entityInfo when enterpriseRiskInstance is null', () => {
      const data = createMockData([
        createMockRisk({ enterpriseRiskInstance: null }),
      ]);
      const result = getOptionsWithEntities(data, undefined, true);
      expect(result[0].entityInfo).toBeUndefined();
    });

    it('omits entityInfo when entity is null', () => {
      const data = createMockData([
        createMockRisk({
          enterpriseRiskInstance: { EntityId: 'entity-1', entity: null },
        }),
      ]);
      const result = getOptionsWithEntities(data, undefined, true);
      expect(result[0].entityInfo).toBeUndefined();
    });

    it('returns empty array for undefined data', () => {
      const result = getOptionsWithEntities(undefined, undefined, true);
      expect(result).toEqual([]);
    });

    it('returns empty array for empty risk array', () => {
      const data = createMockData([]);
      const result = getOptionsWithEntities(data, undefined, true);
      expect(result).toEqual([]);
    });

    it('falls back to friendly id when title missing', () => {
      const data = createMockData([
        {
          ...createMockRisk({ SequentialId: 42 }),
          Title: undefined as unknown as string,
        },
      ]);
      const result = getOptionsWithEntities(data, undefined, true);
      expect(result[0].label).toBe('risk-42');
    });

    it('includes missing selected risk from node data', () => {
      const risk = createMockRisk({ Id: 'risk-1', Title: 'Available Risk' });
      const data: GetRiskListWithEntitiesQuery = {
        ...createMockData([risk]),
        risk: [],
      };

      const result = getOptionsWithEntities(data, 'risk-1', true);
      expect(result.some((o) => o.value === 'risk-1')).toBe(true);
    });

    it('handles mixed risks with and without entities', () => {
      const data = createMockData([
        createMockRisk({
          Id: 'risk-with-entity',
          enterpriseRiskInstance: {
            EntityId: 'child-1',
            entity: createMockEntity({ Id: 'child-1', Name: 'Child Entity' }),
          },
        }),
        createMockRisk({
          Id: 'risk-without-entity',
          enterpriseRiskInstance: null,
        }),
      ]);

      const options = getOptionsWithEntities(data, undefined, true);

      expect(
        options.find((o) => o.value === 'risk-with-entity')?.entityInfo
          ?.entityId
      ).toBe('child-1');
      expect(
        options.find((o) => o.value === 'risk-without-entity')?.entityInfo
      ).toBeUndefined();
    });
  });
});
