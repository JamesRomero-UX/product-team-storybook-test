/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import {
  deleteAppetiteParent,
  getLatestAppetitesForRisk,
  insertAppetiteParents,
} from 'src/services/appetite/appetiteService';
import { getChildRiskIds, getRisk } from 'src/services/risk/riskService';
import { vi } from 'vitest';
import { mock } from 'vitest-mock-extended';

import {
  cascade,
  inheritAppetite,
  unlinkChildRiskAppetites,
} from './appetiteCascading';

vi.mock('src/services/risk/riskService');
vi.mock('src/services/appetite/appetiteService');

const hasuraMock = mock<ApolloClient<NormalizedCacheObject>>();
const getRiskMock = vi.mocked(getRisk);
const getChildRiskIdsMock = vi.mocked(getChildRiskIds);
const insertAppetiteParentsMock = vi.mocked(insertAppetiteParents);
const getLatestAppetitesForRisMock = vi.mocked(getLatestAppetitesForRisk);
const deleteAppetiteParentMock = vi.mocked(deleteAppetiteParent);

describe('appetiteCascading', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('cascade', () => {
    beforeEach(() => {
      vi.resetAllMocks();
    });

    it('does nothing when parent is not tier 1', async () => {
      const appetiteParent = { ParentId: 'risk-1' } as any;
      const config = { enableTierTwoCascading: false };
      getRiskMock.mockResolvedValue([{ Id: '1', Title: 'Risk 3', Tier: 2 }]);

      await cascade(hasuraMock, appetiteParent, config);

      expect(getChildRiskIdsMock).not.toHaveBeenCalled();
    });

    it('does nothing when parent has no children', async () => {
      const appetiteParent = { ParentId: 'risk-1' } as any;
      const config = { enableTierTwoCascading: false };
      getRiskMock.mockResolvedValue([{ Id: '1', Title: 'Risk 1', Tier: 1 }]);
      getChildRiskIdsMock.mockResolvedValue([]);

      await cascade(hasuraMock, appetiteParent, config);

      expect(insertAppetiteParentsMock).not.toHaveBeenCalled();
    });

    it('inserts appetite parents for each child for a tier 1 risk', async () => {
      const appetiteParent = {
        ParentId: 'risk-1',
        Id: 'appetite-1',
        OrgKey: 'org',
      } as any;
      const config = { enableTierTwoCascading: false };
      getRiskMock.mockResolvedValue([{ Id: '1', Title: 'Risk 1', Tier: 1 }]);
      getChildRiskIdsMock.mockResolvedValue([
        { Id: 'risk-2' },
        { Id: 'risk-3' },
      ]);

      await cascade(hasuraMock, appetiteParent, config);

      expect(insertAppetiteParentsMock).toHaveBeenCalledWith(hasuraMock, {
        objects: [
          {
            Id: 'appetite-1',
            ParentId: 'risk-2',
            OrgKey: 'org',
            CreatedAtTimestamp: expect.any(String),
            CreatedByUser: undefined,
            ModifiedAtTimestamp: expect.any(String),
            ModifiedByUser: undefined,
          },
          {
            Id: 'appetite-1',
            ParentId: 'risk-3',
            OrgKey: 'org',
            CreatedAtTimestamp: expect.any(String),
            CreatedByUser: undefined,
            ModifiedAtTimestamp: expect.any(String),
            ModifiedByUser: undefined,
          },
        ],
      });
    });

    it('inserts appetite parents for each child for a tier 2 risk when tier 2 cascading is enabled', async () => {
      const appetiteParent = {
        ParentId: 'risk-1',
        Id: 'appetite-1',
        OrgKey: 'org',
      } as any;
      const config = { enableTierTwoCascading: true };
      getRiskMock.mockResolvedValue([{ Id: '1', Title: 'Risk 1', Tier: 2 }]);
      getChildRiskIdsMock.mockResolvedValue([{ Id: 'risk-3' }]);

      await cascade(hasuraMock, appetiteParent, config);

      expect(insertAppetiteParentsMock).toHaveBeenCalledWith(hasuraMock, {
        objects: [
          {
            Id: 'appetite-1',
            ParentId: 'risk-3',
            OrgKey: 'org',
            CreatedAtTimestamp: expect.any(String),
            CreatedByUser: undefined,
            ModifiedAtTimestamp: expect.any(String),
            ModifiedByUser: undefined,
          },
        ],
      });
    });
  });

  describe('unlinkChildRiskAppetites', () => {
    beforeEach(() => {
      vi.resetAllMocks();
    });

    it('does nothing when parent is not tier 1 or tier 2', async () => {
      const appetiteParent = { ParentId: 'risk-1' } as any;
      getRiskMock.mockResolvedValue([{ Id: '1', Title: 'Risk 3', Tier: 3 }]);

      await unlinkChildRiskAppetites(hasuraMock, appetiteParent);

      expect(getChildRiskIdsMock).not.toHaveBeenCalled();
    });

    it('does nothing when parent has no children', async () => {
      const appetiteParent = { ParentId: 'risk-1' } as any;
      getRiskMock.mockResolvedValue([{ Id: '1', Title: 'Risk 1', Tier: 1 }]);
      getChildRiskIdsMock.mockResolvedValue([]);

      await unlinkChildRiskAppetites(hasuraMock, appetiteParent);

      expect(deleteAppetiteParentMock).not.toHaveBeenCalled();
    });

    it('deletes appetite parents for each child', async () => {
      const appetiteParent = {
        ParentId: 'risk-1',
        Id: 'appetite-1',
        OrgKey: 'org',
      } as any;
      getRiskMock.mockResolvedValue([{ Id: '1', Title: 'Risk 1', Tier: 1 }]);
      getChildRiskIdsMock.mockResolvedValue([
        { Id: 'risk-2' },
        { Id: 'risk-3' },
      ]);

      await unlinkChildRiskAppetites(hasuraMock, appetiteParent);

      expect(deleteAppetiteParentMock).toBeCalledTimes(2);
      expect(deleteAppetiteParentMock).toHaveBeenNthCalledWith(1, hasuraMock, {
        AppetiteId: 'appetite-1',
        ParentId: 'risk-2',
      });
      expect(deleteAppetiteParentMock).toHaveBeenNthCalledWith(2, hasuraMock, {
        AppetiteId: 'appetite-1',
        ParentId: 'risk-3',
      });
    });
  });

  describe('inheritAppetite', () => {
    beforeEach(() => {
      vi.resetAllMocks();
    });

    it('does nothing when risk is tier 1', async () => {
      const risk = { Id: 'risk-1', Tier: 1 } as any;

      await inheritAppetite(hasuraMock, risk);

      expect(insertAppetiteParentsMock).not.toHaveBeenCalled();
    });

    it('does nothing when risk has no parent', async () => {
      const risk = { Id: 'risk-1', Tier: 2 } as any;

      await inheritAppetite(hasuraMock, risk);

      expect(insertAppetiteParentsMock).not.toHaveBeenCalled();
    });

    it('does nothing when no parent appetites found', async () => {
      const risk = {
        Id: 'risk-2',
        Tier: 2,
        ParentRiskId: 'risk-1',
      } as any;
      getLatestAppetitesForRisMock.mockResolvedValue([]);

      await inheritAppetite(hasuraMock, risk);

      expect(insertAppetiteParentsMock).not.toHaveBeenCalled();
    });

    it('inserts appetite parent for parent risk', async () => {
      const risk = {
        Id: 'risk-2',
        Tier: 2,
        ParentRiskId: 'risk-1',
        OrgKey: 'org',
      } as any;
      getLatestAppetitesForRisMock.mockResolvedValue([
        {
          Id: 'appetite-1',
          parents: [{ ParentId: 'risk-1' }],
        },
        {
          Id: 'appetite-2',
          parents: [{ ParentId: 'risk-1' }, { ParentId: 'impact-1' }],
        },
        {
          Id: 'appetite-3',
          parents: [{ ParentId: 'risk-1' }, { ParentId: 'impact-2' }],
        },
        {
          Id: 'appetite-4',
          parents: [{ ParentId: 'risk-1' }, { ParentId: 'impact-3' }],
        },
      ]);

      await inheritAppetite(hasuraMock, risk);

      expect(insertAppetiteParentsMock).toHaveBeenCalledWith(hasuraMock, {
        objects: [
          {
            Id: 'appetite-1',
            ParentId: 'risk-2',
            OrgKey: 'org',
            CreatedAtTimestamp: expect.any(String),
            CreatedByUser: undefined,
            ModifiedAtTimestamp: expect.any(String),
            ModifiedByUser: undefined,
          },
          {
            Id: 'appetite-2',
            ParentId: 'risk-2',
            OrgKey: 'org',
            CreatedAtTimestamp: expect.any(String),
            CreatedByUser: undefined,
            ModifiedAtTimestamp: expect.any(String),
            ModifiedByUser: undefined,
          },
          {
            Id: 'appetite-3',
            ParentId: 'risk-2',
            OrgKey: 'org',
            CreatedAtTimestamp: expect.any(String),
            CreatedByUser: undefined,
            ModifiedAtTimestamp: expect.any(String),
            ModifiedByUser: undefined,
          },
          {
            Id: 'appetite-4',
            ParentId: 'risk-2',
            OrgKey: 'org',
            CreatedAtTimestamp: expect.any(String),
            CreatedByUser: undefined,
            ModifiedAtTimestamp: expect.any(String),
            ModifiedByUser: undefined,
          },
        ],
      });
    });
  });
});
