import type { DashboardState, TierCard } from './findRisksInTier';
import { createFindRisksInTier } from './findRisksInTier';

interface TestCard extends TierCard {
  ParentId?: string | null;
}

const findRisksInTier = createFindRisksInTier<TestCard>(
  (risk) => risk.ParentId
);

const makeCard = (overrides: Partial<TestCard> & { Id: string }): TestCard => ({
  Title: '',
  Tier: 1,
  unlinked: false,
  ...overrides,
});

describe('findRisksInTier', () => {
  describe('sorting', () => {
    it('should sort risks alphabetically A→Z by title', () => {
      const risks: TestCard[] = [
        makeCard({ Id: '1', Title: 'Zeta Risk', Tier: 1 }),
        makeCard({ Id: '2', Title: 'Alpha Risk', Tier: 1 }),
        makeCard({ Id: '3', Title: 'Mike Risk', Tier: 1 }),
      ];
      const state: DashboardState = new Map();

      const result = findRisksInTier(1, risks, state);

      expect(result.map((r) => r.Title)).toEqual([
        'Alpha Risk',
        'Mike Risk',
        'Zeta Risk',
      ]);
    });

    it('should sort case-insensitively', () => {
      const risks: TestCard[] = [
        makeCard({ Id: '1', Title: 'banana', Tier: 1 }),
        makeCard({ Id: '2', Title: 'Apple', Tier: 1 }),
        makeCard({ Id: '3', Title: 'cherry', Tier: 1 }),
      ];
      const state: DashboardState = new Map();

      const result = findRisksInTier(1, risks, state);

      expect(result.map((r) => r.Title)).toEqual(['Apple', 'banana', 'cherry']);
    });

    it('should keep "Unlinked Risks" pinned at the bottom', () => {
      const unlinkedCard: TestCard = {
        Id: 'unlinked',
        Title: 'Unlinked Risks',
        Tier: 1,
        unlinked: true,
      };
      const risks: TestCard[] = [
        makeCard({ Id: '1', Title: 'Zeta Risk', Tier: 1 }),
        unlinkedCard,
        makeCard({ Id: '2', Title: 'Alpha Risk', Tier: 1 }),
        makeCard({
          Id: '3',
          Title: 'Orphan Child',
          Tier: 2,
          ParentId: 'nonexistent',
        }),
      ];
      const state: DashboardState = new Map();

      const result = findRisksInTier(1, risks, state);

      expect(result.map((r) => r.Title)).toEqual([
        'Alpha Risk',
        'Zeta Risk',
        'Unlinked Risks',
      ]);
    });
  });

  describe('filtering', () => {
    it('should show all tier 1 risks', () => {
      const risks: TestCard[] = [
        makeCard({ Id: '1', Title: 'Risk A', Tier: 1 }),
        makeCard({ Id: '2', Title: 'Risk B', Tier: 1 }),
        makeCard({ Id: '3', Title: 'Risk C', Tier: 2, ParentId: '1' }),
      ];
      const state: DashboardState = new Map();

      const result = findRisksInTier(1, risks, state);

      expect(result.map((r) => r.Id)).toEqual(['1', '2']);
    });

    it('should return empty for non-top tier when no risk is selected', () => {
      const risks: TestCard[] = [
        makeCard({ Id: '1', Title: 'Risk A', Tier: 2, ParentId: 'p1' }),
      ];
      const state: DashboardState = new Map([[1, '']]);

      const result = findRisksInTier(2, risks, state);

      expect(result).toEqual([]);
    });

    it('should show child risks matching the selected parent', () => {
      const risks: TestCard[] = [
        makeCard({ Id: 'c1', Title: 'Child A', Tier: 2, ParentId: 'p1' }),
        makeCard({ Id: 'c2', Title: 'Child B', Tier: 2, ParentId: 'p2' }),
      ];
      const state: DashboardState = new Map([[1, 'p1']]);

      const result = findRisksInTier(2, risks, state, 'p1');

      expect(result.map((r) => r.Id)).toEqual(['c1']);
    });
  });
});
