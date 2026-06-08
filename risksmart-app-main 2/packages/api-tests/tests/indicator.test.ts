import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from '../clients/apiClient';
import {
  buildChildIndicatorInsert,
  buildChildIndicatorUpdate,
} from '../data/childIndicator';
import { buildContributor } from '../data/contributor';
import { buildControl } from '../data/control';
import { buildIndicator } from '../data/indicator';
import { buildIndicatorParent } from '../data/indicatorParent';
import { buildOwner } from '../data/owner';
import { buildRisk } from '../data/risk';
import { buildScheduleInput } from '../data/schedule';
import { TestFrequencyEnum } from '../generated/graphql2';
import {
  anotherUser,
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

describe('indicator', () => {
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
      '$RoleKey should see $expectedRecords indicators where they are not the Owner or contributor',
      async ({ expectedRecords, ...user }) => {
        const indicator = buildIndicator({});
        await apiClient.insertIndicator({ objects: indicator });

        const indicators = await apiClient.getAllIndicators(
          {},
          {
            user,
          }
        );
        expect(indicators.indicator.length).toEqual(expectedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...readOnlyUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should see $expectedRecords indicators where they are the owner',
      async ({ expectedRecords, ...user }) => {
        const indicator = buildIndicator({
          owners: {
            data: [buildOwner({ UserId: user.Id })],
          },
        });
        await apiClient.insertIndicator({ objects: indicator });

        const indicators = await apiClient.getAllIndicators(
          {},
          {
            user,
          }
        );
        expect(indicators.indicator.length).toEqual(expectedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...readOnlyUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should see $expectedRecords indicators where they are a contributor',
      async ({ expectedRecords, ...user }) => {
        const indicator = buildIndicator({
          contributors: {
            data: [buildContributor({ UserId: standardUser1.Id })],
          },
        });
        await apiClient.insertIndicator({ objects: indicator });

        const indicators = await apiClient.getAllIndicators(
          {},
          {
            user,
          }
        );
        expect(indicators.indicator.length).toEqual(expectedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...readOnlyUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should see $expectedRecords indicators where they are a contributor of the parent control',
      async ({ expectedRecords, ...user }) => {
        const parentRisk = buildRisk({});
        await apiClient.insertRisk({ objects: parentRisk });
        await apiClient.insertControl({
          objects: buildControl({
            contributors: {
              data: [buildContributor({ UserId: standardUser1.Id })],
            },
            indicators: {
              data: [
                buildIndicatorParent({
                  indicator: {
                    data: buildIndicator(),
                  },
                }),
              ],
            },
          }),
        });

        const indicators = await apiClient.getAllIndicators(
          {},
          {
            user,
          }
        );
        expect(indicators.indicator.length).toEqual(expectedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...readOnlyUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should see $expectedRecords indicators where they are a contributor of the parent risk',
      async ({ expectedRecords, ...user }) => {
        await apiClient.insertRisk({
          objects: buildRisk({
            contributors: {
              data: [buildContributor({ UserId: standardUser1.Id })],
            },
            indicators: {
              data: [
                buildIndicatorParent({
                  indicator: {
                    data: buildIndicator(),
                  },
                }),
              ],
            },
          }),
        });

        const indicators = await apiClient.getAllIndicators(
          {},
          {
            user,
          }
        );
        expect(indicators.indicator.length).toEqual(expectedRecords);
      }
    );
  });

  describe('delete', () => {
    it.each([
      { ...riskManagerUser1, deletedRecords: 1 },
      { ...standardUser1, deletedRecords: 0 },
      { ...standardEnhancedUser1, deletedRecords: 0 },
      { ...internalAuditUser1, deletedRecords: 0 },
      // TODO: enable when we have a single hasura role
      //  { ...readOnlyUser1, deletedRecords: 0 },
    ])(
      'When $RoleKey deletes an indicator, it should delete $deletedRecords records',
      async ({ deletedRecords, ...user }) => {
        const indicator = buildIndicator({});
        await apiClient.insertIndicator({ objects: indicator });

        const data = await apiClient.deleteIndicator(
          {
            Id: indicator.Id!,
          },
          {
            user,
          }
        );
        expect(data?.delete_indicator?.affected_rows).toEqual(deletedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1, deletedRecords: 1 },
      { ...standardUser1, deletedRecords: 1 },
      { ...standardEnhancedUser1, deletedRecords: 1 },
      { ...internalAuditUser1, deletedRecords: 1 },
      // TODO: enable when we have a single hasura role
      // { ...readOnlyUser1, deletedRecords: 0 },
    ])(
      'When $RoleKey deletes an indicator where they are the owner, it should delete $deletedRecords records',
      async ({ deletedRecords, ...user }) => {
        const indicator = buildIndicator({
          owners: {
            data: [buildOwner({ UserId: user.Id })],
          },
        });
        await apiClient.insertIndicator({ objects: indicator });

        const data = await apiClient.deleteIndicator(
          {
            Id: indicator.Id!,
          },
          {
            user,
          }
        );
        expect(data?.delete_indicator?.affected_rows).toEqual(deletedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1, deletedRecords: 1 },
      { ...standardUser1, deletedRecords: 1 },
      { ...standardEnhancedUser1, deletedRecords: 1 },
      { ...internalAuditUser1, deletedRecords: 1 },
      // TODO: enable when we have a single hasura role
      // { ...readOnlyUser1, deletedRecords: 0 },
    ])(
      'When $RoleKey deletes an indicator where they are a contributor, it should delete $deletedRecords records',
      async ({ deletedRecords, ...user }) => {
        const indicator = buildIndicator({
          contributors: {
            data: [buildContributor({ UserId: user.Id })],
          },
        });
        await apiClient.insertIndicator({ objects: indicator });

        const data = await apiClient.deleteIndicator(
          {
            Id: indicator.Id!,
          },
          {
            user,
          }
        );
        expect(data?.delete_indicator?.affected_rows).toEqual(deletedRecords);
      }
    );
  });

  describe('insertChildIndicator', () => {
    it.each([riskManagerUser1])(
      '$RoleKey can insert indicator when they are NOT the owner/contributor of the parent risk',
      async (user) => {
        const risk = buildRisk({});
        await apiClient.insertRisk({ objects: risk });

        const data = await apiClient.insertChildIndicator(
          {
            object: buildChildIndicatorInsert({
              ParentId: risk.Id!,
              OwnerUserIds: [anotherUser.Id!],
            }),
          },
          {
            user,
          }
        );
        expect(data?.insertChildIndicator?.Id).toBeDefined();
      }
    );

    it.each([
      riskManagerUser1,
      standardUser1,
      standardEnhancedUser1,
      internalAuditUser1,
    ])(
      '$RoleKey can insert indicator when they ARE an owner of the parent risk',
      async (user) => {
        const risk = buildRisk({
          owners: {
            data: [buildOwner({ UserId: user.Id })],
          },
        });
        await apiClient.insertRisk({ objects: risk });

        const data = await apiClient.insertChildIndicator(
          {
            object: buildChildIndicatorInsert({
              ParentId: risk.Id!,
              OwnerUserIds: [anotherUser.Id!],
            }),
          },
          {
            user,
          }
        );
        expect(data?.insertChildIndicator?.Id).toBeDefined();
      }
    );

    it.each([
      riskManagerUser1,
      standardUser1,
      standardEnhancedUser1,
      internalAuditUser1,
    ])(
      '$RoleKey can insert indicator when they ARE a contributor of the parent risk',
      async (user) => {
        const risk = buildRisk({
          contributors: {
            data: [buildContributor({ UserId: user.Id })],
          },
        });
        await apiClient.insertRisk({ objects: risk });

        const data = await apiClient.insertChildIndicator(
          {
            object: buildChildIndicatorInsert({
              ParentId: risk.Id!,
              OwnerUserIds: [anotherUser.Id!],
            }),
          },
          {
            user,
          }
        );
        expect(data?.insertChildIndicator?.Id).toBeDefined();
      }
    );

    it.each([standardUser1, standardEnhancedUser1, internalAuditUser1])(
      '$RoleKey cannot insert indicators',
      async (user) => {
        const risk = buildRisk({});
        await apiClient.insertRisk({ objects: risk });
        await expect(
          apiClient.insertChildIndicator(
            {
              object: buildChildIndicatorInsert({
                ParentId: risk.Id!,
                OwnerUserIds: [anotherUser.Id!],
              }),
            },
            {
              user,
            }
          )
        ).rejects.toThrow('Access denied');
      }
    );

    it.each([readOnlyUser1])(
      '$RoleKey cannot insert indicators',
      async (user) => {
        const risk = buildRisk({});
        await apiClient.insertRisk({ objects: risk });
        await expect(
          apiClient.insertChildIndicator(
            {
              object: buildChildIndicatorInsert({
                ParentId: risk.Id!,
                OwnerUserIds: [anotherUser.Id!],
              }),
            },
            {
              user,
            }
          )
        ).rejects.toThrow(
          "field 'insertChildIndicator' not found in type: 'mutation_root'"
        );
      }
    );
  });

  describe('updateChildIndicator', () => {
    it.each([riskManagerUser1])(
      '$RoleKey can update indicators when NOT owner or contributor',
      async (user) => {
        const indicator = buildIndicator({});
        await apiClient.insertIndicator({ objects: indicator });
        const updatedTitle = 'updated title';
        const { updateChildIndicator } = await apiClient.updateChildIndicator(
          {
            object: buildChildIndicatorUpdate({
              Title: updatedTitle,
              Id: indicator.Id!,
            }),
          },
          {
            user,
          }
        );
        expect(updateChildIndicator?.Id).toBeDefined();
      }
    );

    it.each([standardUser1, standardEnhancedUser1, internalAuditUser1])(
      '$RoleKey cannot update indicators when NOT owner or contributor',
      async (user) => {
        const indicator = buildIndicator({});
        await apiClient.insertIndicator({ objects: indicator });
        const updatedTitle = 'updated title';
        await expect(
          apiClient.updateChildIndicator(
            {
              object: buildChildIndicatorUpdate({
                Title: updatedTitle,
                Id: indicator.Id!,
              }),
            },
            {
              user,
            }
          )
        ).rejects.toThrow('You do not have permission to perform this action');
      }
    );

    it.each([
      riskManagerUser1,
      standardUser1,
      standardEnhancedUser1,
      internalAuditUser1,
    ])('$RoleKey can update indicator if they are the owner', async (user) => {
      const indicator = buildIndicator({
        owners: {
          data: [buildOwner({ UserId: user.Id })],
        },
      });
      await apiClient.insertIndicator({ objects: indicator });
      const updatedTitle = 'updated title';
      const { updateChildIndicator } = await apiClient.updateChildIndicator(
        {
          object: buildChildIndicatorUpdate({
            Title: updatedTitle,
            Id: indicator.Id!,
          }),
        },
        {
          user,
        }
      );
      expect(updateChildIndicator?.Id).toBeDefined();
    });

    it.each([
      { ...riskManagerUser1 },
      { ...standardUser1 },
      { ...standardEnhancedUser1 },
      { ...internalAuditUser1 },
    ])('$RoleKey can update all fields', async ({ ...user }) => {
      const indicator = buildIndicator({
        owners: {
          data: [buildOwner({ UserId: user.Id })],
        },
      });
      await apiClient.insertIndicator({ objects: indicator });

      await apiClient.updateChildIndicator(
        {
          object: buildChildIndicatorUpdate({
            Title: 'Updated title',
            Description: 'Updated description',
            schedule: buildScheduleInput({
              Frequency: TestFrequencyEnum.Weekly,
            }),
            TargetValueTxt: 'new target value',
            OwnerUserIds: [user.Id!],
            Id: indicator.Id!,
            Unit: 'Updated unit',
          }),
        },
        {
          user,
        }
      );

      const { indicator: updatedIndicators } = await apiClient.getAllIndicators(
        {},
        { user }
      );
      expect(updatedIndicators[0]).toEqual(
        expect.objectContaining({
          CustomAttributeData: null,
          Description: 'Updated description',
          Id: indicator.Id,
          LowerToleranceNum: null,
          ModifiedByUser: user.Id,
          TargetValueTxt: 'new target value',
          Title: 'Updated title',
          Type: 'text',
          Unit: 'Updated unit',
          UpperToleranceNum: null,
        })
      );
    });

    it.each([
      riskManagerUser1,
      standardUser1,
      standardEnhancedUser1,
      internalAuditUser1,
    ])(
      '$RoleKey can update indicator if they are the contributor',
      async (user) => {
        const indicator = buildIndicator({
          contributors: {
            data: [buildContributor({ UserId: user.Id })],
          },
        });
        await apiClient.insertIndicator({ objects: indicator });
        const updatedTitle = 'updated title';
        const { updateChildIndicator } = await apiClient.updateChildIndicator(
          {
            object: buildChildIndicatorUpdate({
              Title: updatedTitle,
              Id: indicator.Id!,
            }),
          },
          {
            user,
          }
        );
        expect(updateChildIndicator?.Id).toBeDefined();
      }
    );
  });

  describe('update', () => {
    it.each([
      { ...riskManagerUser1 },
      { ...standardUser1 },
      { ...standardEnhancedUser1 },
      { ...internalAuditUser1 },
      { ...readOnlyUser1 },
    ])(
      '$RoleKey cannot update records directly via hasura',
      async ({ ...user }) => {
        const indicator = buildIndicator({});
        await apiClient.insertIndicator({ objects: indicator });
        const updatedTitle = 'updated title';
        await expect(
          apiClient.updateIndicator(
            {
              Title: updatedTitle,
              Id: indicator.Id!,
            },
            {
              user,
            }
          )
        ).rejects.toThrowError(
          "field 'update_indicator' not found in type: 'mutation_root'"
        );
      }
    );
  });
});
