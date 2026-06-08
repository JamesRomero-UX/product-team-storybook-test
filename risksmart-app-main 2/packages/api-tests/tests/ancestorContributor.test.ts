import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getAncestorContributors } from '../clients/ancestorContributorClient';
import { apiClient } from '../clients/apiClient';
import { buildInsertChildControl } from '../data/childControl';
import { buildInsertChildRisk } from '../data/risk';
import { riskManagerUser1, setup, teardown } from '../initialData';

const mockedDefaults = vi.hoisted(() => {
  return {
    getDefaultOrgId: vi.fn(),
    getAnotherOrgId: vi.fn(),
    getDefaultUserId: vi.fn(),
  };
});

vi.mock('../clients/defaults', () => mockedDefaults);

describe('ancestorContributor', () => {
  beforeEach(async () => {
    await setup(mockedDefaults);
  });
  afterEach(async () => {
    await teardown();
  });

  describe('query', () => {
    it('should return user as an owner if they are an owner of the parent and the parent and child are the same object type', async () => {
      const parent = await apiClient.insertChildRisk(
        {
          object: buildInsertChildRisk({
            Tier: 1,
            OwnerUserIds: [riskManagerUser1.Id!],
          }),
        },
        { user: riskManagerUser1 }
      );
      const { insertChildRisk: child } = await apiClient.insertChildRisk(
        {
          object: buildInsertChildRisk({
            ParentRiskId: parent?.insertChildRisk?.Id,
            Tier: 2,
          }),
        },
        { user: riskManagerUser1 }
      );
      const childId = child?.Id;

      const ancestorContributors = await getAncestorContributors({
        user: riskManagerUser1,
      });
      expect(
        ancestorContributors
          .filter(
            (ac) => ac.Id === childId && ac.UserId === riskManagerUser1.Id
          )
          .map((ac) => ac.ContributorType)
      ).toEqual(['owner']);
    });

    it('should return user as a contributor if they are an owner of the parent and the parent and child are have different object types', async () => {
      const { insertChildRisk: parent } = await apiClient.insertChildRisk(
        {
          object: buildInsertChildRisk({
            Tier: 1,
            OwnerUserIds: [riskManagerUser1.Id!],
          }),
        },
        { user: riskManagerUser1 }
      );
      const child = await apiClient.insertChildControl(
        {
          object: buildInsertChildControl({
            ParentId: parent?.Id,
          }),
        },
        {
          user: riskManagerUser1,
        }
      );
      const childId = child?.insertChildControl?.Id;

      const ancestorContributors = await getAncestorContributors({
        user: riskManagerUser1,
      });
      expect(
        ancestorContributors
          .filter(
            (ac) => ac.Id === childId && ac.UserId === riskManagerUser1.Id
          )
          .map((ac) => ac.ContributorType)
      ).toEqual(['contributor']);
    });
  });
});
