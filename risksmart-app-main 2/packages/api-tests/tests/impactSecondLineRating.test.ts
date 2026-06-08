import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from '../clients/apiClient';
import { getAnotherOrgId } from '../clients/defaults';
import { insertImpactBackend } from '../clients/impactClient';
import {
  deleteImpactRating,
  getAllImpactRatings,
  insertChildImpactRating,
  insertImpactRating,
  updateImpactRating,
} from '../clients/impactRatingClient';
import { buildContributor } from '../data/contributor';
import { buildImpactBackend } from '../data/impact';
import {
  buildChildImpactRating,
  buildImpactRating,
} from '../data/impactRating';
import { buildOwner } from '../data/owner';
import { buildRisk } from '../data/risk';
import {
  internalAuditUser1,
  publicUser1,
  readOnlyUser1,
  riskManagerUser1,
  setup,
  standardEnhancedUser1,
  standardUser1,
  teardown,
} from '../initialData';

const mockedDefaults = vi.hoisted(() => {
  return {
    getDefaultOrgId: vi.fn(),
    getAnotherOrgId: vi.fn(),
    getDefaultUserId: vi.fn(),
  };
});

vi.mock('../clients/defaults', () => mockedDefaults);

describe('impactSecondLineRating', () => {
  beforeEach(async () => {
    await setup(mockedDefaults);
  });
  afterEach(async () => {
    await teardown();
  });

  describe('query', () => {
    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...readOnlyUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 0 },
      { ...publicUser1, expectedRecords: 0 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should see $expectedRecords impact ratings',
      async ({ expectedRecords, ...user }) => {
        const risk = buildRisk();
        await apiClient.insertRisk({ objects: risk });

        const impactRating = buildImpactRating({
          impact: {
            data: buildImpactBackend(),
          },
          RatedItemId: risk.Id,
        });

        await insertImpactRating(impactRating);

        const { data } = await getAllImpactRatings({
          user,
        });
        expect(data.impact_rating.length).toEqual(expectedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...readOnlyUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...publicUser1, expectedRecords: 0 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should see $expectedRecords impact ratings when the owner of the rated item',
      async ({ expectedRecords, ...user }) => {
        const risk = buildRisk({
          owners: {
            data: [buildOwner({ UserId: user.Id })],
          },
        });
        await apiClient.insertRisk({ objects: risk });

        const impactRating = buildImpactRating({
          impact: {
            data: buildImpactBackend(),
          },
          RatedItemId: risk.Id,
        });

        await insertImpactRating(impactRating);

        const { data } = await getAllImpactRatings({
          user,
        });
        expect(data.impact_rating.length).toEqual(expectedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...readOnlyUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...publicUser1, expectedRecords: 0 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should see $expectedRecords impact ratings when the contributor of the rated item',
      async ({ expectedRecords, ...user }) => {
        const risk = buildRisk({
          contributors: {
            data: [buildContributor({ UserId: user.Id })],
          },
        });
        await apiClient.insertRisk({ objects: risk });

        const impactRating = buildImpactRating({
          impact: {
            data: buildImpactBackend(),
          },
          RatedItemId: risk.Id,
        });

        await insertImpactRating(impactRating);

        const { data } = await getAllImpactRatings({
          user,
        });
        expect(data.impact_rating.length).toEqual(expectedRecords);
      }
    );
  });

  describe('delete', () => {
    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...readOnlyUser1, expectedRecords: 0 },
      { ...standardUser1, expectedRecords: 0 },
      { ...publicUser1, expectedRecords: 0 },
      { ...standardEnhancedUser1, expectedRecords: 0 },
      { ...internalAuditUser1, expectedRecords: 0 },
    ])(
      '$RoleKey should be able to delete $expectedRecords impact ratings when not the owner/contributor of the rated item',
      async ({ expectedRecords, ...user }) => {
        const risk = buildRisk();
        await apiClient.insertRisk({ objects: risk });
        const impactRating = buildImpactRating({
          impact: {
            data: buildImpactBackend(),
          },
          RatedItemId: risk.Id,
        });
        await insertImpactRating(impactRating);

        const result = await deleteImpactRating(
          {
            Id: impactRating.Id!,
          },
          { user }
        );
        expect(result?.data?.delete_impact_rating?.affected_rows).toEqual(
          expectedRecords
        );
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...readOnlyUser1, expectedRecords: 0 },
      { ...standardUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...publicUser1, expectedRecords: 0 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should be able to delete $expectedRecords impact ratings when  the owner of the rated item',
      async ({ expectedRecords, ...user }) => {
        const risk = buildRisk({
          owners: { data: [buildOwner({ UserId: user.Id })] },
        });
        await apiClient.insertRisk({ objects: risk });
        const impactRating = buildImpactRating({
          impact: {
            data: buildImpactBackend(),
          },
          RatedItemId: risk.Id,
        });
        await insertImpactRating(impactRating);

        const result = await deleteImpactRating(
          {
            Id: impactRating.Id!,
          },
          { user }
        );
        expect(result?.data?.delete_impact_rating?.affected_rows).toEqual(
          expectedRecords
        );
      }
    );
  });

  describe('update', () => {
    it.each([
      riskManagerUser1,
      readOnlyUser1,
      standardUser1,
      publicUser1,
      standardEnhancedUser1,
      internalAuditUser1,
    ])(
      '$RoleKey should NOT be able to update  impact ratings (note: UI only allows deletion)',
      async (user) => {
        const risk = buildRisk();
        await apiClient.insertRisk({ objects: risk });
        const impactRating = buildImpactRating({
          impact: {
            data: buildImpactBackend(),
          },
          RatedItemId: risk.Id,
        });
        await insertImpactRating(impactRating);

        await expect(
          updateImpactRating(
            {
              Id: impactRating.Id!,
              Rating: 2,
            },
            { user }
          )
        ).rejects.toThrow(
          "field 'update_impact_rating' not found in type: 'mutation_root'"
        );
      }
    );
  });

  describe('insert', () => {
    it.each([riskManagerUser1])(
      '$RoleKey can insert an impact rating when not the owner/contributor of the rated item',
      async (user) => {
        const risk = buildRisk();
        await apiClient.insertRisk({ objects: risk });
        const impact = buildImpactBackend();
        await insertImpactBackend({ objects: [impact] });
        const { data } = await insertChildImpactRating(
          buildChildImpactRating({
            Ratings: [
              {
                ImpactId: impact.Id!,
                Rating: 3,
              },
            ],
            RatedItemId: risk.Id!,
          }),
          {
            user,
          }
        );
        expect(data?.insertChildImpactRating?.Ids.length).toEqual(1);
      }
    );

    it.each([
      riskManagerUser1,
      standardUser1,
      standardEnhancedUser1,
      internalAuditUser1,
    ])(
      '$RoleKey can insert an impact rating when the owner of the rated item',
      async (user) => {
        const risk = buildRisk({
          owners: {
            data: [buildOwner({ UserId: user.Id })],
          },
        });
        await apiClient.insertRisk({ objects: risk });
        const impact = buildImpactBackend();
        await insertImpactBackend({ objects: [impact] });
        const { data } = await insertChildImpactRating(
          buildChildImpactRating({
            Ratings: [
              {
                ImpactId: impact.Id!,
                Rating: 3,
              },
            ],
            RatedItemId: risk.Id!,
          }),
          {
            user,
          }
        );
        expect(data?.insertChildImpactRating?.Ids.length).toEqual(1);
      }
    );

    it.each([
      riskManagerUser1,
      standardUser1,
      standardEnhancedUser1,
      internalAuditUser1,
    ])(
      '$RoleKey cannot insert an impact rating for another orgs impact',
      async (user) => {
        const risk = buildRisk({
          owners: {
            data: [buildOwner({ UserId: user.Id })],
          },
        });
        await apiClient.insertRisk({ objects: risk });
        const impact = buildImpactBackend({
          OrgKey: getAnotherOrgId(),
        });
        await insertImpactBackend({ objects: [impact] });
        await expect(
          insertChildImpactRating(
            buildChildImpactRating({
              Ratings: [
                {
                  ImpactId: impact.Id!,
                  Rating: 3,
                },
              ],
              RatedItemId: risk.Id!,
            }),
            {
              user,
            }
          )
        ).rejects.toThrowError('Object ID(s) not found');
      }
    );

    it.each([
      riskManagerUser1,
      standardUser1,
      standardEnhancedUser1,
      internalAuditUser1,
    ])(
      '$RoleKey cannot insert an impact rating for another orgs risk',
      async (user) => {
        const risk = buildRisk({
          OrgKey: getAnotherOrgId(),
          owners: {
            data: [buildOwner({ UserId: user.Id })],
          },
        });
        await apiClient.insertRisk({ objects: risk });
        const impact = buildImpactBackend({});
        await insertImpactBackend({ objects: [impact] });
        await expect(
          insertChildImpactRating(
            buildChildImpactRating({
              RatedItemId: risk.Id!,
              Ratings: [
                {
                  ImpactId: impact.Id!,
                  Rating: 3,
                },
              ],
            }),
            {
              user,
            }
          )
        ).rejects.toThrowError('Object ID(s) not found');
      }
    );

    it.each([
      { user: standardUser1, expectedError: 'Access denied' },
      { user: publicUser1, expectedError: 'Access denied' },
      { user: readOnlyUser1, expectedError: 'Access denied' },
      { user: standardEnhancedUser1, expectedError: 'Access denied' },
      { user: internalAuditUser1, expectedError: 'Access denied' },
    ])(
      '$user.RoleKey cannot insert an impact rating when not the owner/contributor of the rated item',
      async ({ user, expectedError }) => {
        const risk = buildRisk();
        await apiClient.insertRisk({ objects: risk });
        const impact = buildImpactBackend();
        await insertImpactBackend({ objects: [impact] });
        await expect(
          insertChildImpactRating(
            buildChildImpactRating({
              Ratings: [
                {
                  ImpactId: impact.Id!,
                  Rating: 3,
                },
              ],
              RatedItemId: risk.Id!,
            }),
            {
              user,
            }
          )
        ).rejects.toThrow(expectedError);
      }
    );
  });
});
