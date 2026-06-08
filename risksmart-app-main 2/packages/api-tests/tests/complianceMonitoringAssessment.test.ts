import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from '../clients/apiClient';
import {
  deleteComplianceMonitoringAssessment,
  getComplianceMonitoringAssessmentIds,
  getComplianceMonitoringAssessments,
  insertComplianceMonitoringAssessment,
} from '../clients/complianceMonitoringAssessmentClient';
import {
  buildInsertAssessmentApi,
  buildUpdateAssessmentApi,
} from '../data/assessment';
import { buildComplianceMonitoringAssessment } from '../data/complianceMonitoringAssessment';
import { buildContributor } from '../data/contributor';
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

describe('complianceMonitoringAssessment', () => {
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
      '$RoleKey should see $expectedRecords internal audit assessments where they are the owner',
      async ({ expectedRecords, ...user }) => {
        await insertComplianceMonitoringAssessment(
          buildComplianceMonitoringAssessment({
            owners: {
              data: [buildOwner({ UserId: user.Id })],
            },
          })
        );

        const data = await getComplianceMonitoringAssessmentIds({
          user,
        });

        expect(data.data.compliance_monitoring_assessment.length).toEqual(
          expectedRecords
        );
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
      '$RoleKey should see $expectedRecords compliance monitoring assessments where they are a contributor',
      async ({ expectedRecords, ...user }) => {
        await insertComplianceMonitoringAssessment(
          buildComplianceMonitoringAssessment({
            contributors: {
              data: [buildContributor({ UserId: user.Id })],
            },
          })
        );

        const data = await getComplianceMonitoringAssessmentIds({
          user,
        });
        expect(data.data.compliance_monitoring_assessment.length).toEqual(
          expectedRecords
        );
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should see $expectedRecords internal audit assessments with all properties where they are the owner',
      async ({ expectedRecords, ...user }) => {
        await insertComplianceMonitoringAssessment(
          buildComplianceMonitoringAssessment({
            owners: {
              data: [buildOwner({ UserId: user.Id })],
            },
          })
        );

        const data = await getComplianceMonitoringAssessments({
          user,
        });

        expect(data.data.compliance_monitoring_assessment.length).toEqual(
          expectedRecords
        );
      }
    );
  });

  describe('insert', () => {
    it.each([
      standardUser1,
      standardEnhancedUser1,
      internalAuditUser1,
      riskManagerUser1,
    ])(
      '$RoleKey cannot directly insert compliance monitoring assessments',
      async (user) => {
        const risk = buildRisk({
          owners: {
            data: [buildOwner({ UserId: user.Id })],
          },
        });
        await apiClient.insertRisk({ objects: risk });

        await expect(
          apiClient.insertComplianceMonitoringAssessment(
            {
              objects: buildComplianceMonitoringAssessment({
                OriginatingItemId: risk.Id,
                CreatedByUser: undefined,
                ModifiedByUser: undefined,
                OrgKey: undefined,
              }),
            },
            { user }
          )
        ).rejects.toThrow(
          `field 'insert_compliance_monitoring_assessment' not found in type: 'mutation_root'`
        );
      }
    );
  });

  describe('insertComplianceMonitoringAssessmentApi', () => {
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
        ...internalAuditUser1,
        expectedRecords: 0,
      },
      { ...riskManagerUser1, expectedRecords: 1, exception: null },
    ])(
      '$RoleKey should be able to insert $expectedRecords compliance monitoring reports',
      async ({ expectedRecords, ...user }) => {
        const risk = buildRisk({
          owners: {
            data: [buildOwner({ UserId: user.Id })],
          },
        });
        await apiClient.insertRisk({ objects: risk });

        if (expectedRecords === 0) {
          await expect(
            apiClient.insertComplianceMonitoringAssessmentApi(
              {
                object: buildInsertAssessmentApi({
                  OriginatingItemId: risk.Id,
                }),
              },
              { user }
            )
          ).rejects.toThrow('Access denied');
        } else {
          await apiClient.insertComplianceMonitoringAssessmentApi(
            {
              object: buildInsertAssessmentApi({
                OriginatingItemId: risk.Id,
              }),
            },
            { user }
          );
          const data = await getComplianceMonitoringAssessmentIds({
            user,
          });
          expect(data.data.compliance_monitoring_assessment.length).toEqual(
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
      internalAuditUser1,
      readOnlyUser1,
      riskManagerUser1,
    ])(
      '$RoleKey should not be able to update compliance monitoring assessments directly',
      async (user) => {
        const complianceMonitoringAssessment =
          buildComplianceMonitoringAssessment({
            owners: {
              data: [buildOwner({ UserId: user.Id })],
            },
          });
        await insertComplianceMonitoringAssessment(
          complianceMonitoringAssessment
        );

        const payload = {
          Id: complianceMonitoringAssessment.Id!,
          Summary: 'updated',
        };

        await expect(
          apiClient.updateComplianceMonitoringAssessment(payload, {
            user,
          })
        ).rejects.toThrow(
          "field 'update_compliance_monitoring_assessment' not found in type: 'mutation_root'"
        );
      }
    );
  });

  describe('updateComplianceMonitoringAssessmentApi', () => {
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
        ...internalAuditUser1,
        expectedRecords: 0,
      },
      {
        ...readOnlyUser1,
        expectedRecords: 0,
      },
      { ...riskManagerUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should update $expectedRecords compliance monitoring assessments where they are the owner',
      async ({ expectedRecords, ...user }) => {
        const complianceMonitoringAssessment =
          buildComplianceMonitoringAssessment({
            owners: {
              data: [buildOwner({ UserId: user.Id })],
            },
          });
        await insertComplianceMonitoringAssessment(
          complianceMonitoringAssessment
        );

        const payload = {
          Id: complianceMonitoringAssessment.Id!,
          Summary: 'updated',
        };

        if (expectedRecords === 0) {
          await expect(
            apiClient.updateComplianceMonitoringAssessmentApi(
              { object: buildUpdateAssessmentApi(payload) },
              {
                user,
              }
            )
          ).rejects.toThrow(
            'You do not have permission to perform this action'
          );
        } else {
          const { updateComplianceMonitoringAssessmentApi } =
            await apiClient.updateComplianceMonitoringAssessmentApi(
              { object: buildUpdateAssessmentApi(payload) },
              {
                user,
              }
            );
          expect(
            updateComplianceMonitoringAssessmentApi?.affected_rows
          ).toEqual(expectedRecords);
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
        ...internalAuditUser1,
        expectedRecords: 0,
      },
      {
        ...readOnlyUser1,
        expectedRecords: 0,
      },
      { ...riskManagerUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should update $expectedRecords compliance monitoring assessments where they are a contributor',
      async ({ expectedRecords, ...user }) => {
        const complianceMonitoringAssessment =
          buildComplianceMonitoringAssessment({
            contributors: {
              data: [buildOwner({ UserId: user.Id })],
            },
          });
        await insertComplianceMonitoringAssessment(
          complianceMonitoringAssessment
        );

        const payload = {
          Id: complianceMonitoringAssessment.Id!,
          Summary: 'updated',
        };

        if (expectedRecords === 0) {
          await expect(
            apiClient.updateComplianceMonitoringAssessmentApi(
              { object: buildUpdateAssessmentApi(payload) },
              {
                user,
              }
            )
          ).rejects.toThrow(
            'You do not have permission to perform this action'
          );
        } else {
          const { updateComplianceMonitoringAssessmentApi } =
            await apiClient.updateComplianceMonitoringAssessmentApi(
              { object: buildUpdateAssessmentApi(payload) },
              {
                user,
              }
            );
          expect(
            updateComplianceMonitoringAssessmentApi?.affected_rows
          ).toEqual(expectedRecords);
        }
      }
    );
  });

  describe('delete', () => {
    it.each([
      { ...riskManagerUser1, expectedRecords: 1, exception: null },
      {
        ...standardUser1,
        expectedRecords: 0,
        exception:
          "field 'delete_compliance_monitoring_assessment' not found in type: 'mutation_root'",
      },
      {
        ...internalAuditUser1,
        expectedRecords: 0,
        exception:
          "field 'delete_compliance_monitoring_assessment' not found in type: 'mutation_root'",
      },
      {
        ...standardEnhancedUser1,
        expectedRecords: 0,
        exception:
          "field 'delete_compliance_monitoring_assessment' not found in type: 'mutation_root'",
      },
      {
        ...readOnlyUser1,
        expectedRecords: 0,
        exception:
          "field 'delete_compliance_monitoring_assessment' not found in type: 'mutation_root'",
      },
    ])(
      '$RoleKey should delete $expectedRecords compliance assessments where they are the owner',
      async ({ expectedRecords, exception, ...user }) => {
        const complianceMonitoringAssessment =
          buildComplianceMonitoringAssessment({
            owners: {
              data: [buildOwner({ UserId: user.Id })],
            },
          });
        await insertComplianceMonitoringAssessment(
          buildComplianceMonitoringAssessment(complianceMonitoringAssessment)
        );

        const payload = {
          Id: complianceMonitoringAssessment.Id!,
        };

        if (exception) {
          await expect(
            deleteComplianceMonitoringAssessment(payload, {
              user,
            })
          ).rejects.toThrow(exception);
        } else {
          const result = await deleteComplianceMonitoringAssessment(payload, {
            user,
          });
          expect(
            result.data?.delete_compliance_monitoring_assessment?.affected_rows
          ).toEqual(expectedRecords);
        }
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1, exception: null },
      {
        ...internalAuditUser1,
        expectedRecords: 0,
        exception:
          "field 'delete_compliance_monitoring_assessment' not found in type: 'mutation_root'",
      },
      {
        ...standardUser1,
        expectedRecords: 0,
        exception:
          "field 'delete_compliance_monitoring_assessment' not found in type: 'mutation_root'",
      },
      {
        ...standardEnhancedUser1,
        expectedRecords: 0,
        exception:
          "field 'delete_compliance_monitoring_assessment' not found in type: 'mutation_root'",
      },
      {
        ...readOnlyUser1,
        expectedRecords: 0,
        exception:
          "field 'delete_compliance_monitoring_assessment' not found in type: 'mutation_root'",
      },
    ])(
      '$RoleKey should delete $expectedRecords compliance audit assessments where they are a contributor',
      async ({ expectedRecords, exception, ...user }) => {
        const complianceMonitoringAssessment =
          buildComplianceMonitoringAssessment({
            contributors: {
              data: [buildOwner({ UserId: user.Id })],
            },
          });
        await insertComplianceMonitoringAssessment(
          complianceMonitoringAssessment
        );

        const payload = {
          Id: complianceMonitoringAssessment.Id!,
        };

        if (exception) {
          await expect(
            deleteComplianceMonitoringAssessment(payload, {
              user,
            })
          ).rejects.toThrow(exception);
        } else {
          const result = await deleteComplianceMonitoringAssessment(payload, {
            user,
          });
          expect(
            result.data?.delete_compliance_monitoring_assessment?.affected_rows
          ).toEqual(expectedRecords);
        }
      }
    );
  });
});
