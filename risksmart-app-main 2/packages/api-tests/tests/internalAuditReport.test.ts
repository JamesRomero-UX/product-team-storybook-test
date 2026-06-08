import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from '../clients/apiClient';
import {
  deleteInternalAuditReport,
  getInternalAuditReportIds,
  getInternalAuditReports,
  insertInternalAuditReport,
} from '../clients/internalAuditReportClient';
import {
  buildInsertAssessmentApi,
  buildUpdateAssessmentApi,
} from '../data/assessment';
import { buildContributor } from '../data/contributor';
import { buildInternalAuditReport } from '../data/internalAuditReport';
import { buildOwner } from '../data/owner';
import { buildRisk } from '../data/risk';
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

describe('internalAuditReport', () => {
  beforeEach(async () => {
    await setup(mockedDefaults);
  });
  afterEach(async () => {
    await teardown();
  });

  describe('query', () => {
    it.each([
      {
        ...standardUser1,
        expectedRecords: 0,
      },
      {
        ...readOnlyUser1,
        expectedRecords: 0,
      },
      {
        ...standardEnhancedUser1,
        expectedRecords: 0,
      },
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should see $expectedRecords internal audit reports where they are the owner',
      async ({ expectedRecords, ...user }) => {
        await insertInternalAuditReport(
          buildInternalAuditReport({
            owners: {
              data: [buildOwner({ UserId: user.Id })],
            },
          })
        );

        const data = await getInternalAuditReportIds({
          user,
        });
        expect(data.data.internal_audit_report.length).toEqual(expectedRecords);
      }
    );

    it.each([
      {
        ...standardUser1,
        expectedRecords: 0,
      },
      {
        ...readOnlyUser1,
        expectedRecords: 0,
      },
      {
        ...standardEnhancedUser1,
        expectedRecords: 0,
      },
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should see $expectedRecords internal audit reports where they are a contributor',
      async ({ expectedRecords, ...user }) => {
        await insertInternalAuditReport(
          buildInternalAuditReport({
            contributors: {
              data: [buildContributor({ UserId: user.Id })],
            },
          })
        );

        const data = await getInternalAuditReportIds({
          user,
        });
        expect(data.data.internal_audit_report.length).toEqual(expectedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should see $expectedRecords internal audit reports with all fields where they are a contributor',
      async ({ expectedRecords, ...user }) => {
        await insertInternalAuditReport(
          buildInternalAuditReport({
            contributors: {
              data: [buildContributor({ UserId: user.Id })],
            },
          })
        );

        const data = await getInternalAuditReports({
          user,
        });
        expect(data.data.internal_audit_report.length).toEqual(expectedRecords);
      }
    );
  });

  describe('insert', () => {
    it.each([
      standardUser1,
      standardEnhancedUser1,
      riskManagerUser1,
      internalAuditUser1,
    ])(
      '$RoleKey should not be able to insert internal audit reports directly',
      async (user) => {
        const risk = buildRisk({
          owners: {
            data: [buildOwner({ UserId: user.Id })],
          },
        });
        await apiClient.insertRisk({ objects: risk });

        await expect(
          apiClient.insertInternalAuditReport(
            {
              objects: buildInternalAuditReport({
                OriginatingItemId: risk.Id,
                CreatedByUser: undefined,
                ModifiedByUser: undefined,
                OrgKey: undefined,
              }),
            },
            { user }
          )
        ).rejects.toThrow(
          "field 'insert_internal_audit_report' not found in type: 'mutation_root'"
        );
      }
    );
  });

  describe('insertInternalAuditReportApi', () => {
    it.each([
      {
        ...standardUser1,
        expectedRecords: 0,
      },
      {
        ...standardEnhancedUser1,
        expectedRecords: 0,
      },
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should be able to insert $expectedRecords internal audit reports',
      async ({ expectedRecords, ...user }) => {
        const risk = buildRisk({
          owners: {
            data: [buildOwner({ UserId: user.Id })],
          },
        });
        await apiClient.insertRisk({ objects: risk });

        if (expectedRecords === 0) {
          await expect(
            apiClient.insertInternalAuditReportApi(
              {
                object: buildInsertAssessmentApi({
                  OriginatingItemId: risk.Id,
                }),
              },
              { user }
            )
          ).rejects.toThrow(
            'You do not have permission to perform this action'
          );
        } else {
          await apiClient.insertInternalAuditReportApi(
            {
              object: buildInsertAssessmentApi({
                OriginatingItemId: risk.Id,
              }),
            },
            { user }
          );
          const data = await getInternalAuditReports({
            user,
          });
          expect(data.data.internal_audit_report.length).toEqual(
            expectedRecords
          );
        }
      }
    );
  });

  describe('update', () => {
    it.each([
      standardUser1,
      standardEnhancedUser1,
      readOnlyUser1,
      riskManagerUser1,
      internalAuditUser1,
    ])(
      '$RoleKey should update $expectedRecords internal audit reports where they are the owner',
      async (user) => {
        const internalAuditReport = buildInternalAuditReport({
          owners: {
            data: [buildOwner({ UserId: user.Id })],
          },
        });
        await insertInternalAuditReport(internalAuditReport);

        const payload = {
          Id: internalAuditReport.Id!,
          Summary: 'updated',
        };

        await expect(
          apiClient.updateInternalAuditReport(payload, {
            user,
          })
        ).rejects.toThrow(
          "field 'update_internal_audit_report' not found in type: 'mutation_root'"
        );
      }
    );
  });

  describe('updateInternalAuditReportApi', () => {
    it.each([
      {
        ...standardUser1,
        expectedRecords: 0,
      },
      {
        ...standardEnhancedUser1,
        expectedRecords: 0,
      },
      {
        ...readOnlyUser1,
        expectedRecords: 0,
      },
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should update $expectedRecords internal audit reports where they are the owner',
      async ({ expectedRecords, ...user }) => {
        const internalAuditReport = buildInternalAuditReport({
          owners: {
            data: [buildOwner({ UserId: user.Id })],
          },
        });
        await insertInternalAuditReport(internalAuditReport);

        const payload = {
          Id: internalAuditReport.Id!,
          Summary: 'updated',
        };

        if (expectedRecords === 0) {
          await expect(
            apiClient.updateInternalAuditReportApi(
              { object: buildUpdateAssessmentApi(payload) },
              {
                user,
              }
            )
          ).rejects.toThrow(
            'You do not have permission to perform this action'
          );
        } else {
          const { updateInternalAuditReportApi } =
            await apiClient.updateInternalAuditReportApi(
              { object: buildUpdateAssessmentApi(payload) },
              {
                user,
              }
            );
          expect(updateInternalAuditReportApi?.affected_rows).toEqual(
            expectedRecords
          );
        }
      }
    );

    it.each([
      {
        ...standardUser1,
        expectedRecords: 0,
      },
      {
        ...standardEnhancedUser1,
        expectedRecords: 0,
      },
      {
        ...readOnlyUser1,
        expectedRecords: 0,
      },
      { ...riskManagerUser1, expectedRecords: 1, exception: null },
      { ...internalAuditUser1, expectedRecords: 1, exception: null },
    ])(
      '$RoleKey should update $expectedRecords internal audit reports where they are a contributor',
      async ({ expectedRecords, ...user }) => {
        const internalAuditReport = buildInternalAuditReport({
          contributors: {
            data: [buildOwner({ UserId: user.Id })],
          },
        });
        await insertInternalAuditReport(internalAuditReport);

        const payload = {
          Id: internalAuditReport.Id!,
          Summary: 'updated',
        };

        if (expectedRecords === 0) {
          await expect(
            apiClient.updateInternalAuditReportApi(
              { object: buildUpdateAssessmentApi(payload) },
              {
                user,
              }
            )
          ).rejects.toThrow(
            'You do not have permission to perform this action'
          );
        } else {
          const { updateInternalAuditReportApi } =
            await apiClient.updateInternalAuditReportApi(
              { object: buildUpdateAssessmentApi(payload) },
              {
                user,
              }
            );
          expect(updateInternalAuditReportApi?.affected_rows).toEqual(
            expectedRecords
          );
        }
      }
    );
  });

  describe('delete', () => {
    it.each([
      { ...riskManagerUser1, expectedRecords: 1, exception: null },
      { ...internalAuditUser1, expectedRecords: 1, exception: null },
      {
        ...standardUser1,
        expectedRecords: 0,
        exception:
          "field 'delete_internal_audit_report' not found in type: 'mutation_root'",
      },
      {
        ...standardEnhancedUser1,
        expectedRecords: 0,
        exception:
          "field 'delete_internal_audit_report' not found in type: 'mutation_root'",
      },
      {
        ...readOnlyUser1,
        expectedRecords: 0,
        exception:
          "field 'delete_internal_audit_report' not found in type: 'mutation_root'",
      },
    ])(
      '$RoleKey should delete $expectedRecords internal audit reports where they are the owner',
      async ({ expectedRecords, exception, ...user }) => {
        const internalAuditReport = buildInternalAuditReport({
          owners: {
            data: [buildOwner({ UserId: user.Id })],
          },
        });
        await insertInternalAuditReport(
          buildInternalAuditReport(internalAuditReport)
        );

        const payload = {
          Id: internalAuditReport.Id!,
        };

        if (exception) {
          await expect(
            deleteInternalAuditReport(payload, {
              user,
            })
          ).rejects.toThrow(exception);
        } else {
          const result = await deleteInternalAuditReport(payload, {
            user,
          });
          expect(
            result.data?.delete_internal_audit_report?.affected_rows
          ).toEqual(expectedRecords);
        }
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1, exception: null },
      { ...internalAuditUser1, expectedRecords: 1, exception: null },
      {
        ...standardUser1,
        expectedRecords: 0,
        exception:
          "field 'delete_internal_audit_report' not found in type: 'mutation_root'",
      },
      {
        ...standardEnhancedUser1,
        expectedRecords: 0,
        exception:
          "field 'delete_internal_audit_report' not found in type: 'mutation_root'",
      },
      {
        ...readOnlyUser1,
        expectedRecords: 0,
        exception:
          "field 'delete_internal_audit_report' not found in type: 'mutation_root'",
      },
    ])(
      '$RoleKey should delete $expectedRecords internal audit reports where they are a contributor',
      async ({ expectedRecords, exception, ...user }) => {
        const internalAuditReport = buildInternalAuditReport({
          contributors: {
            data: [buildOwner({ UserId: user.Id })],
          },
        });
        await insertInternalAuditReport(internalAuditReport);

        const payload = {
          Id: internalAuditReport.Id!,
        };

        if (exception) {
          await expect(
            deleteInternalAuditReport(payload, {
              user,
            })
          ).rejects.toThrow(exception);
        } else {
          const result = await deleteInternalAuditReport(payload, {
            user,
          });
          expect(
            result.data?.delete_internal_audit_report?.affected_rows
          ).toEqual(expectedRecords);
        }
      }
    );
  });
});
