import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from '../clients/apiClient';
import { insertComplianceMonitoringAssessments } from '../clients/complianceMonitoringAssessmentClient';
import { buildComplianceMonitoringAssessment } from '../data/complianceMonitoringAssessment';
import { buildContributor } from '../data/contributor';
import { buildControl } from '../data/control';
import { buildControlTestResult } from '../data/controlTestSecondLineResult';
import { buildOwner } from '../data/owner';
import { buildRisk } from '../data/risk';
import type { RiskInsertInput } from '../generated/graphql2';
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

describe('controlTestSecondLineResult', () => {
  let parentRisk: RiskInsertInput;
  beforeEach(async () => {
    await setup(mockedDefaults);
    parentRisk = buildRisk({});
    await apiClient.insertRisk({ objects: parentRisk });
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
      '$RoleKey should see $expectedRecords test results where they are not the Owner or contributor of the itnernal audit report',
      async ({ expectedRecords, ...user }) => {
        const control = buildControl({});
        await apiClient.insertControl({
          objects: [control],
        });
        const complianceAssessment = buildComplianceMonitoringAssessment({});
        await insertComplianceMonitoringAssessments({
          objects: [complianceAssessment],
        });

        await apiClient.insertControlTestSecondLineResult(
          buildControlTestResult({
            ControlIds: [control.Id!],
            ComplianceMonitoringAssessmentId: complianceAssessment.Id!,
          }),
          {
            user: riskManagerUser1,
          }
        );

        const { control_test_second_line_result } =
          await apiClient.getControlTestSecondLineResults(
            {},
            {
              user,
            }
          );
        expect(control_test_second_line_result.length).toEqual(expectedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 0 },
      { ...readOnlyUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should see $expectedRecords test results where they are the owner of the control',
      async ({ expectedRecords, ...user }) => {
        const control = buildControl({
          owners: {
            data: [buildOwner({ UserId: user.Id })],
          },
        });
        await apiClient.insertControl({
          objects: [control],
        });
        const complianceAssessment = buildComplianceMonitoringAssessment({
          owners: {
            data: [buildOwner({ UserId: user.Id })],
          },
        });
        await insertComplianceMonitoringAssessments({
          objects: [complianceAssessment],
        });

        await apiClient.insertControlTestSecondLineResult(
          buildControlTestResult({
            ControlIds: [control.Id!],
            ComplianceMonitoringAssessmentId: complianceAssessment.Id!,
          }),
          {
            user: riskManagerUser1,
          }
        );

        const { control_test_second_line_result } =
          await apiClient.getControlTestSecondLineResults(
            {},
            {
              user,
            }
          );
        expect(control_test_second_line_result.length).toEqual(expectedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 0 },
      { ...readOnlyUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should see $expectedRecords test results where they are a contributor  of the control',
      async ({ expectedRecords, ...user }) => {
        const control = buildControl({
          contributors: {
            data: [buildContributor({ UserId: user.Id })],
          },
        });
        await apiClient.insertControl({
          objects: [control],
        });
        const complianceAssessment = buildComplianceMonitoringAssessment({
          contributors: {
            data: [buildContributor({ UserId: user.Id })],
          },
        });
        await insertComplianceMonitoringAssessments({
          objects: [complianceAssessment],
        });
        await apiClient.insertControlTestSecondLineResult(
          buildControlTestResult({
            ControlIds: [control.Id!],
            ComplianceMonitoringAssessmentId: complianceAssessment.Id!,
          }),
          {
            user: riskManagerUser1,
          }
        );

        const { control_test_second_line_result } =
          await apiClient.getControlTestSecondLineResults(
            {},
            {
              user,
            }
          );
        expect(control_test_second_line_result.length).toEqual(expectedRecords);
      }
    );
  });
});
