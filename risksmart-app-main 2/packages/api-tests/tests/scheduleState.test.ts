import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from '../clients/apiClient';
import { getDefaultOrgId } from '../clients/defaults';
import { buildEntity } from '../data/entity';
import { buildOwner } from '../data/owner';
import { buildRisk } from '../data/risk';
import { buildScheduleInsertInput } from '../data/schedule';
import { buildScheduleStateInsertInput } from '../data/scheduleState';
import { TestFrequencyEnum, UnitOfTimeEnum } from '../generated/graphql';
import {
  customerSupportUser1,
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

describe('scheduleState', () => {
  beforeEach(async () => {
    await setup(mockedDefaults);
  }, 10000);

  afterEach(async () => {
    await teardown();
  });

  describe('query', () => {
    it.each([
      riskManagerUser1,
      standardUser1,
      readOnlyUser1,
      standardEnhancedUser1,
      internalAuditUser1,
    ])(
      '$RoleKey cannot query schedule states directly (this is to ensure access is only based on parent item)',
      async ({ ...user }) => {
        await expect(
          apiClient.getAllScheduleStates(
            {},
            {
              user,
            }
          )
        ).rejects.toThrow(
          "field 'schedule_state' not found in type: 'query_root'"
        );
      }
    );
  });

  describe('insert', () => {
    it.each([
      riskManagerUser1,
      standardUser1,
      readOnlyUser1,
      standardEnhancedUser1,
      internalAuditUser1,
    ])(
      '$RoleKey cannot insert schedule states (backend only so access is based on parent item)',
      async ({ ...user }) => {
        const risk = buildRisk({
          owners: {
            data: [buildOwner({ UserId: user.Id })],
          },
        });
        await apiClient.insertRisk({ objects: risk });

        await expect(
          apiClient.insertScheduleStates(
            {
              objects: buildScheduleStateInsertInput({
                Id: risk.Id,
                OrgKey: getDefaultOrgId(),
                CreatedByUser: user.Id,
                ModifiedByUser: user.Id,
              }),
            },
            { user }
          )
        ).rejects.toThrow(
          "field 'insert_schedule_state' not found in type: 'mutation_root'"
        );
      }
    );
  });

  describe('refreshScheduleState', () => {
    it.each([
      riskManagerUser1,
      standardUser1,
      readOnlyUser1,
      standardEnhancedUser1,
      internalAuditUser1,
    ])('$RoleKey cannot access refreshScheduleState', async ({ ...user }) => {
      const risk = buildRisk({
        owners: {
          data: [buildOwner({ UserId: user.Id })],
        },
      });
      await apiClient.insertRisk({ objects: risk });

      await expect(
        apiClient.refreshScheduleState(
          {
            ids: [risk.Id!],
          },
          { user }
        )
      ).rejects.toThrow(
        "field 'refreshScheduleState' not found in type: 'mutation_root'"
      );
    });

    it.each([customerSupportUser1])(
      '$RoleKey can access refreshScheduleState, and it refreshes the schedule state',
      async ({ ...user }) => {
        const risk = buildRisk({
          owners: {
            data: [buildOwner({ UserId: user.Id })],
          },
        });
        await apiClient.insertRisk({ objects: risk });
        await apiClient.insertSchedules({
          objects: buildScheduleInsertInput({
            StartDate: '2023-01-01T00:00:00Z',
            Frequency: TestFrequencyEnum.Quarterly,
            TimeToCompleteUnit: UnitOfTimeEnum.Day,
            TimeToCompleteValue: 7,
            OrgKey: getDefaultOrgId(),
            CreatedByUser: user.Id,
            ModifiedByUser: user.Id,
            Id: risk.Id,
          }),
        });
        await apiClient.insertScheduleStates({
          objects: buildScheduleStateInsertInput({
            Id: risk.Id,
            DueDate: '2000-01-01T00:00:00+00:00',
            OrgKey: getDefaultOrgId(),
            CreatedByUser: user.Id,
            ModifiedByUser: user.Id,
          }),
        });

        const { refreshScheduleState } = await apiClient.refreshScheduleState(
          {
            ids: [risk.Id!],
          },
          { user }
        );
        expect(refreshScheduleState).toEqual({
          __typename: 'RefreshScheduleStateOutput',
          unsupportedNodeIds: [],
          missingNodeIds: [],
        });

        const { schedule_state } = await apiClient.getAllScheduleStates({
          where: { Id: { _eq: risk.Id } },
        });
        expect(schedule_state[0]).toEqual({
          DueDate: '2023-01-01T00:00:00+00:00',
          Id: risk.Id,
          LatestDate: null,
          OverdueDate: '2023-01-08T00:00:00+00:00',
          __typename: 'schedule_state',
        });
      }
    );

    it('Returns missingNodeIds for ids that do not exist', async () => {
      const risk = buildRisk({});

      const { refreshScheduleState } = await apiClient.refreshScheduleState(
        {
          ids: [risk.Id!],
        },
        { user: customerSupportUser1 }
      );
      expect(refreshScheduleState).toEqual({
        __typename: 'RefreshScheduleStateOutput',
        unsupportedNodeIds: [],
        missingNodeIds: [risk.Id!],
      });
    });

    it('Returns unsupportedNodeIds for ids that are not supported', async () => {
      const entity = buildEntity({
        OrgKey: getDefaultOrgId(),
        CreatedByUser: customerSupportUser1.Id,
        ModifiedByUser: customerSupportUser1.Id,
      });
      await apiClient.insertEntity({
        object: entity,
      });

      const { refreshScheduleState } = await apiClient.refreshScheduleState(
        {
          ids: [entity.Id!],
        },
        { user: customerSupportUser1 }
      );
      expect(refreshScheduleState).toEqual({
        __typename: 'RefreshScheduleStateOutput',
        unsupportedNodeIds: [entity.Id!],
        missingNodeIds: [],
      });
    });
  });

  describe('update', () => {
    it.each([
      riskManagerUser1,
      standardUser1,
      readOnlyUser1,
      standardEnhancedUser1,
      internalAuditUser1,
    ])(
      '$RoleKey cannot update schedule state (backend only so access is based on parent item)',
      async ({ ...user }) => {
        const risk = buildRisk({
          owners: {
            data: [buildOwner({ UserId: user.Id })],
          },
        });
        await apiClient.insertRisk({ objects: risk });
        await apiClient.insertScheduleStates({
          objects: buildScheduleStateInsertInput({
            Id: risk.Id,
            OrgKey: getDefaultOrgId(),
            CreatedByUser: user.Id,
            ModifiedByUser: user.Id,
          }),
        });

        await expect(
          apiClient.updateScheduleState(
            {
              where: {
                Id: { _eq: risk.Id },
              },
              set: {
                LatestDate: null,
              },
            },
            { user }
          )
        ).rejects.toThrow(
          "field 'update_schedule_state' not found in type: 'mutation_root'"
        );
      }
    );
  });
});
