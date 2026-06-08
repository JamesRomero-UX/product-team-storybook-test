import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from '../clients/apiClient';
import {
  deleteIndicatorResult,
  getIndicatorResults,
  insertIndicatorResult,
  updateIndicatorResult,
} from '../clients/indicatorResultClient';
import { buildContributor } from '../data/contributor';
import { buildIndicator } from '../data/indicator';
import { buildIndicatorResult } from '../data/indicatorResult';
import { buildOwner } from '../data/owner';
import {
  internalAuditUser1,
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

describe('indicatorResults', () => {
  beforeEach(async () => {
    await setup(mockedDefaults);
  });
  afterEach(async () => {
    await teardown();
  });

  describe('query', () => {
    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 0 },
      { ...readOnlyUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should see $expectedRecords indicator results where they are not the Owner or contributor of the indicator',
      async ({ expectedRecords, ...user }) => {
        await apiClient.insertIndicator({
          objects: buildIndicator({
            results: {
              data: [buildIndicatorResult()],
            },
          }),
        });

        const indicatorResults = await getIndicatorResults({
          user,
        });
        expect(indicatorResults.length).toEqual(expectedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...readOnlyUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should see $expectedRecords indicator results where they are the owner of the indicator',
      async ({ expectedRecords, ...user }) => {
        await apiClient.insertIndicator({
          objects: buildIndicator({
            owners: {
              data: [buildOwner({ UserId: user.Id })],
            },
            results: {
              data: [buildIndicatorResult()],
            },
          }),
        });

        const indicatorResults = await getIndicatorResults({
          user,
        });
        expect(indicatorResults.length).toEqual(expectedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...readOnlyUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should see $expectedRecords indicator results where they are a contributor of the indicator',
      async ({ expectedRecords, ...user }) => {
        await apiClient.insertIndicator({
          objects: buildIndicator({
            contributors: {
              data: [buildContributor({ UserId: standardUser1.Id })],
            },
            results: {
              data: [buildIndicatorResult()],
            },
          }),
        });

        const indicatorResults = await getIndicatorResults({
          user,
        });
        expect(indicatorResults.length).toEqual(expectedRecords);
      }
    );
  });

  describe('update', () => {
    it.each([
      { ...riskManagerUser1, updatedRecords: 1 },
      { ...standardUser1, updatedRecords: 0 },
      { ...standardEnhancedUser1, updatedRecords: 0 },
      { ...internalAuditUser1, updatedRecords: 0 },
      // TODO: reintroduce when we have a single hasura role
      // { ...readOnlyUser1, deletedRecords: 0 },
    ])(
      'When $RoleKey updates an indicator result where they are NOT the owner or parent, it should update $updatedRecords records',
      async ({ updatedRecords, ...user }) => {
        const indicatorResult = buildIndicatorResult();
        const indicator = buildIndicator({
          results: {
            data: [indicatorResult],
          },
        });
        await apiClient.insertIndicator({ objects: indicator });

        const result = await updateIndicatorResult(
          indicatorResult.Id!,
          'Updated',
          {
            user,
          }
        );
        expect(result?.affected_rows).toEqual(updatedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1, updatedRecords: 1 },
      { ...standardUser1, updatedRecords: 1 },
      { ...standardEnhancedUser1, updatedRecords: 1 },
      { ...internalAuditUser1, updatedRecords: 1 },
      // TODO: reintroduce when we have a single hasura role
      //{ ...readOnlyUser1, deletedRecords: 0 },
    ])(
      'When $RoleKey updates an indicator result where they are the owner of the parent indicator, it should update $updatedRecords records',
      async ({ updatedRecords, ...user }) => {
        const indicatorResult = buildIndicatorResult();
        const indicator = buildIndicator({
          owners: {
            data: [buildOwner({ UserId: user.Id })],
          },
          results: {
            data: [indicatorResult],
          },
        });
        await apiClient.insertIndicator({ objects: indicator });

        const result = await updateIndicatorResult(
          indicatorResult.Id!,
          'Updated',
          {
            user,
          }
        );
        expect(result?.affected_rows).toEqual(updatedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1, updatedRecords: 1 },
      { ...standardUser1, updatedRecords: 1 },
      { ...standardEnhancedUser1, updatedRecords: 1 },
      { ...internalAuditUser1, updatedRecords: 1 },
      // TODO: reintroduce when we have a single hasura role
      // { ...readOnlyUser1, updatedRecords: 0 },
    ])(
      'When $RoleKey updates an indicator result where they are a contributor of the parent indicator, it should update $updatedRecords records',
      async ({ updatedRecords, ...user }) => {
        const indicatorResult = buildIndicatorResult();
        const indicator = buildIndicator({
          contributors: {
            data: [buildContributor({ UserId: user.Id })],
          },
          results: {
            data: [indicatorResult],
          },
        });
        await apiClient.insertIndicator({ objects: indicator });

        const result = await updateIndicatorResult(
          indicatorResult.Id!,
          'Updated',
          {
            user,
          }
        );
        expect(result?.affected_rows).toEqual(updatedRecords);
      }
    );
  });

  describe('delete', () => {
    it.each([
      { ...riskManagerUser1, deletedRecords: 1 },
      { ...standardUser1, deletedRecords: 0 },
      // TODO: reintroduce when we have a single hasura role
      // { ...readOnlyUser1, deletedRecords: 0 },
    ])(
      'When $RoleKey deletes an indicator result where they are NOT the owner or parent, it should delete $deletedRecords records',
      async ({ deletedRecords, ...user }) => {
        const indicatorResult = buildIndicatorResult();
        const indicator = buildIndicator({
          results: {
            data: [indicatorResult],
          },
        });
        await apiClient.insertIndicator({ objects: indicator });

        const result = await deleteIndicatorResult(indicatorResult.Id!, {
          user,
        });
        expect(result?.affected_rows).toEqual(deletedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1, deletedRecords: 1 },
      { ...standardUser1, deletedRecords: 1 },
      // TODO: reintroduce when we have a single hasura role
      //{ ...readOnlyUser1, deletedRecords: 0 },
    ])(
      'When $RoleKey deletes an indicator result where they are the owner of the parent indicator, it should delete $deletedRecords records',
      async ({ deletedRecords, ...user }) => {
        const indicatorResult = buildIndicatorResult();
        const indicator = buildIndicator({
          owners: {
            data: [buildOwner({ UserId: user.Id })],
          },
          results: {
            data: [indicatorResult],
          },
        });
        await apiClient.insertIndicator({ objects: indicator });

        const result = await deleteIndicatorResult(indicatorResult.Id!, {
          user,
        });
        expect(result?.affected_rows).toEqual(deletedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1, deletedRecords: 1 },
      { ...standardUser1, deletedRecords: 1 },
      // TODO: reintroduce when we have a single hasura role
      // { ...readOnlyUser1, deletedRecords: 0 },
    ])(
      'When $RoleKey deletes an indicator result where they are a contributor of the parent indicator, it should delete $deletedRecords records',
      async ({ deletedRecords, ...user }) => {
        const indicatorResult = buildIndicatorResult();
        const indicator = buildIndicator({
          contributors: {
            data: [buildContributor({ UserId: user.Id })],
          },
          results: {
            data: [indicatorResult],
          },
        });
        await apiClient.insertIndicator({ objects: indicator });

        const result = await deleteIndicatorResult(indicatorResult.Id!, {
          user,
        });
        expect(result?.affected_rows).toEqual(deletedRecords);
      }
    );
  });

  describe('insert', () => {
    it.each([{ ...riskManagerUser1, expectedRecords: 1 }])(
      '$RoleKey can insert $expectedRecords indicator results when not the owner or contributor of the parent indicator',
      async ({ expectedRecords, ...user }) => {
        const indicator = buildIndicator({});
        await apiClient.insertIndicator({ objects: indicator });
        const result = await insertIndicatorResult(
          buildIndicatorResult({
            IndicatorId: indicator.Id!,
            OrgKey: undefined,
            Id: undefined,
            CreatedByUser: undefined,
            ModifiedByUser: undefined,
          }),
          {
            user,
          }
        );
        expect(result?.affected_rows).toEqual(expectedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey can insert $expectedRecords indicator results when the owner of the parent indicator',
      async ({ expectedRecords, ...user }) => {
        const indicator = buildIndicator({
          owners: {
            data: [
              buildOwner({
                UserId: user.Id,
              }),
            ],
          },
        });
        await apiClient.insertIndicator({ objects: indicator });
        const result = await insertIndicatorResult(
          buildIndicatorResult({
            IndicatorId: indicator.Id!,
            OrgKey: undefined,
            Id: undefined,
            CreatedByUser: undefined,
            ModifiedByUser: undefined,
          }),
          {
            user,
          }
        );
        expect(result?.affected_rows).toEqual(expectedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey can insert $expectedRecords indicator results when the contributor of the parent indicator',
      async ({ expectedRecords, ...user }) => {
        const indicator = buildIndicator({
          contributors: {
            data: [
              buildContributor({
                UserId: user.Id,
              }),
            ],
          },
        });
        await apiClient.insertIndicator({ objects: indicator });
        const result = await insertIndicatorResult(
          buildIndicatorResult({
            IndicatorId: indicator.Id!,
            OrgKey: undefined,
            Id: undefined,
            CreatedByUser: undefined,
            ModifiedByUser: undefined,
          }),
          {
            user,
          }
        );
        expect(result?.affected_rows).toEqual(expectedRecords);
      }
    );

    it.each([readOnlyUser1])(
      '$RoleKey cannot insert indicator results when not the owner or parent of the parent indicator',
      async (user) => {
        const indicator = buildIndicator({});
        await apiClient.insertIndicator({ objects: indicator });
        await expect(
          insertIndicatorResult(
            buildIndicatorResult({
              IndicatorId: indicator.Id!,
              OrgKey: undefined,
              Id: undefined,
              CreatedByUser: undefined,
              ModifiedByUser: undefined,
            }),
            {
              user,
            }
          )
        ).rejects.toThrow(
          "field 'insert_indicator_result' not found in type: 'mutation_root'"
        );
      }
    );

    it.each([standardUser1, standardEnhancedUser1, internalAuditUser1])(
      '$RoleKey cannot insert indicator results when not the owner or parent of the parent indicator',
      async (user) => {
        const indicator = buildIndicator({});
        await apiClient.insertIndicator({ objects: indicator });
        await expect(
          insertIndicatorResult(
            buildIndicatorResult({
              IndicatorId: indicator.Id!,
              OrgKey: undefined,
              Id: undefined,
              CreatedByUser: undefined,
              ModifiedByUser: undefined,
            }),
            {
              user,
            }
          )
        ).rejects.toThrow(
          'check constraint of an insert/update permission has failed'
        );
      }
    );
  });
});
