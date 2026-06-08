import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from '../clients/apiClient';
import { getDefaultOrgId } from '../clients/defaults';
import { buildOwner } from '../data/owner';
import { buildRisk } from '../data/risk';
import { buildScheduleInsertInput } from '../data/schedule';
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

describe('schedule', () => {
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
      '$RoleKey cannot query schedules directly (this is to ensure access is only based on parent item)',
      async ({ ...user }) => {
        await expect(
          apiClient.getAllSchedules(
            {},
            {
              user,
            }
          )
        ).rejects.toThrow("field 'schedule' not found in type: 'query_root'");
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
      '$RoleKey cannot insert schedules (backend only so access is based on parent item)',
      async ({ ...user }) => {
        const risk = buildRisk({
          owners: {
            data: [buildOwner({ UserId: user.Id })],
          },
        });
        await apiClient.insertRisk({ objects: risk });

        await expect(
          apiClient.insertSchedules(
            {
              objects: buildScheduleInsertInput({
                Id: risk.Id,
              }),
            },
            { user }
          )
        ).rejects.toThrow(
          "field 'insert_schedule' not found in type: 'mutation_root'"
        );
      }
    );
  });

  describe('update', () => {
    it.each([
      riskManagerUser1,
      standardUser1,
      readOnlyUser1,
      standardEnhancedUser1,
      internalAuditUser1,
    ])(
      '$RoleKey cannot update schedules (backend only so access is based on parent item)',
      async ({ ...user }) => {
        const risk = buildRisk({
          owners: {
            data: [buildOwner({ UserId: user.Id })],
          },
        });
        await apiClient.insertRisk({ objects: risk });
        await apiClient.insertSchedules({
          objects: buildScheduleInsertInput({
            Id: risk.Id,
            OrgKey: getDefaultOrgId(),
            CreatedByUser: user.Id,
            ModifiedByUser: user.Id,
          }),
        });

        await expect(
          apiClient.updateSchedule(
            {
              where: {
                Id: { _eq: risk.Id },
              },
              set: {
                StartDate: null,
              },
            },
            { user }
          )
        ).rejects.toThrow(
          "field 'update_schedule' not found in type: 'mutation_root'"
        );
      }
    );
  });
});
