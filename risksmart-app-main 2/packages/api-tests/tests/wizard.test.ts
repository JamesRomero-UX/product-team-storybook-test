import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from '../clients/apiClient';
import { buildAssessment } from '../data/assessment';
import { buildAssessmentActivity } from '../data/assessmentActivity';
import { buildOwner } from '../data/owner';
import { buildRisk } from '../data/risk';
import { WizardStatusEnum } from '../generated/graphql2';
import {
  customerSupportUser1,
  publicUser1,
  readOnlyUser1,
  riskManagerUser1,
  setup,
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

describe('wizard', () => {
  beforeEach(async () => {
    await setup(mockedDefaults);
  });
  afterEach(async () => {
    await teardown();
  });

  describe('insert', () => {
    it.each([
      { ...riskManagerUser1, expectedRecords: 1, isOwner: false },
      { ...customerSupportUser1, expectedRecords: 1, isOwner: false },
      { ...standardUser1, expectedRecords: 0, isOwner: false },
      { ...standardUser1, expectedRecords: 1, isOwner: true },
      { ...readOnlyUser1, expectedRecords: 0, isOwner: false },
      { ...readOnlyUser1, expectedRecords: 0, isOwner: true },
      { ...publicUser1, expectedRecords: 0, isOwner: true },
      { ...publicUser1, expectedRecords: 0, isOwner: false },
    ])(
      '$RoleKey should be able to insert $expectedRecords wizard',
      async ({ expectedRecords, isOwner, ...user }) => {
        const risk = buildRisk(
          isOwner
            ? {
                owners: { data: [buildOwner({ UserId: user.Id })] },
              }
            : {}
        );
        const assessment = buildAssessment();
        const activity = buildAssessmentActivity({
          ParentId: assessment.Id!,
        });

        await apiClient.insertAssessment({ objects: assessment });
        await apiClient.insertAssessmentActivity({
          objects: activity,
        });
        await apiClient.insertRisk({ objects: risk });

        if (expectedRecords === 0) {
          await expect(
            apiClient.insertWizard(
              {
                object: {
                  RiskId: risk.Id ?? '',
                  AssessmentId: assessment.Id,
                  Status: WizardStatusEnum.InProgress,
                  ActivityId: activity.Id,
                },
              },
              { user }
            )
          ).rejects.toThrowError(
            'You do not have permission to perform this action'
          );
        } else {
          const data = await apiClient.insertWizard(
            {
              object: {
                RiskId: risk.Id ?? '',
                AssessmentId: assessment.Id,
                Status: WizardStatusEnum.InProgress,
                ActivityId: activity.Id,
              },
            },
            {
              user,
            }
          );
          expect(data.insertChildWizard?.RiskId).toBeDefined();
        }
      }
    );
  });
  describe('update', () => {
    it.each([
      { ...riskManagerUser1, expectedRecords: 1, isOwner: false },
      { ...customerSupportUser1, expectedRecords: 1, isOwner: false },
      { ...standardUser1, expectedRecords: 0, isOwner: false },
      { ...standardUser1, expectedRecords: 1, isOwner: true },
      { ...readOnlyUser1, expectedRecords: 0, isOwner: false },
      { ...readOnlyUser1, expectedRecords: 0, isOwner: true },
      { ...publicUser1, expectedRecords: 0, isOwner: true },
      { ...publicUser1, expectedRecords: 0, isOwner: false },
    ])(
      '$RoleKey should be able to update $expectedRecords wizard',
      async ({ expectedRecords, isOwner, ...user }) => {
        const risk = buildRisk(
          isOwner
            ? {
                owners: { data: [buildOwner({ UserId: user.Id })] },
              }
            : {}
        );
        const assessment = buildAssessment();
        const activity = buildAssessmentActivity({
          ParentId: assessment.Id!,
        });

        await apiClient.insertAssessment({ objects: assessment });
        await apiClient.insertAssessmentActivity({
          objects: activity,
        });
        await apiClient.insertRisk({ objects: risk });
        await apiClient.insertWizard(
          {
            object: {
              RiskId: risk.Id ?? '',
              AssessmentId: assessment.Id,
              Status: WizardStatusEnum.InProgress,
              ActivityId: activity.Id,
            },
          },
          { user: riskManagerUser1 }
        );

        if (expectedRecords === 0) {
          await expect(
            apiClient.updateWizard(
              {
                object: {
                  CurrentStep: 1,
                  RiskId: risk.Id ?? '',
                  Status: WizardStatusEnum.InProgress,
                },
              },
              { user }
            )
          ).rejects.toThrowError(
            'You do not have permission to perform this action'
          );
        } else {
          const data = await apiClient.updateWizard(
            {
              object: {
                CurrentStep: 1,
                RiskId: risk.Id ?? '',
                Status: WizardStatusEnum.InProgress,
              },
            },
            { user }
          );
          expect(data.updateWizardById?.affected_rows).toEqual(1);
        }
      }
    );
  });
  describe('delete', () => {
    it.each([
      { ...riskManagerUser1, expectedRecords: 1, isOwner: false },
      { ...customerSupportUser1, expectedRecords: 1, isOwner: false },
      { ...standardUser1, expectedRecords: 0, isOwner: false },
      { ...standardUser1, expectedRecords: 1, isOwner: true },
      { ...readOnlyUser1, expectedRecords: 0, isOwner: false },
      { ...readOnlyUser1, expectedRecords: 0, isOwner: true },
      { ...publicUser1, expectedRecords: 0, isOwner: true },
      { ...publicUser1, expectedRecords: 0, isOwner: false },
    ])(
      '$RoleKey should be able to delete $expectedRecords wizard',
      async ({ expectedRecords, isOwner, ...user }) => {
        const risk = buildRisk(
          isOwner
            ? {
                owners: { data: [buildOwner({ UserId: user.Id })] },
              }
            : {}
        );
        const assessment = buildAssessment();
        const activity = buildAssessmentActivity({
          ParentId: assessment.Id!,
        });

        await apiClient.insertAssessment({ objects: assessment });
        await apiClient.insertAssessmentActivity({
          objects: activity,
        });
        await apiClient.insertRisk({ objects: risk });
        await apiClient.insertWizard(
          {
            object: {
              RiskId: risk.Id ?? '',
              AssessmentId: assessment.Id,
              Status: WizardStatusEnum.InProgress,
              ActivityId: activity.Id,
            },
          },
          { user: riskManagerUser1 }
        );

        if (expectedRecords === 0) {
          await expect(
            apiClient.deleteWizard({ RiskId: risk.Id ?? '' }, { user })
          ).rejects.toThrowError(
            'You do not have permission to perform this action'
          );
        } else {
          const data = await apiClient.deleteWizard(
            { RiskId: risk.Id ?? '' },
            { user }
          );
          expect(data.deleteWizardById?.affected_rows).toEqual(1);
        }
      }
    );
  });
  describe('query', () => {
    it.each([
      { ...riskManagerUser1, expectedRecords: 1, isOwner: false },
      { ...customerSupportUser1, expectedRecords: 1, isOwner: false },
      { ...standardUser1, expectedRecords: 0, isOwner: false },
      { ...standardUser1, expectedRecords: 1, isOwner: true },
    ])(
      '$RoleKey should be able to get $expectedRecords wizard',
      async ({ expectedRecords, isOwner, ...user }) => {
        const risk = buildRisk(
          isOwner
            ? {
                owners: { data: [buildOwner({ UserId: user.Id })] },
              }
            : {}
        );
        const assessment = buildAssessment();
        const activity = buildAssessmentActivity({
          ParentId: assessment.Id!,
        });

        await apiClient.insertAssessment({ objects: assessment });
        await apiClient.insertAssessmentActivity({
          objects: activity,
        });
        await apiClient.insertRisk({ objects: risk });
        await apiClient.insertWizard(
          {
            object: {
              RiskId: risk.Id ?? '',
              AssessmentId: assessment.Id,
              Status: WizardStatusEnum.InProgress,
              ActivityId: activity.Id,
            },
          },
          { user: riskManagerUser1 }
        );

        const data = await apiClient.getWizardById(
          { RiskId: risk.Id ?? '' },
          { user }
        );
        expect(data.wizard).toHaveLength(expectedRecords);
      }
    );
    it.each([
      { ...readOnlyUser1, isOwner: false },
      { ...readOnlyUser1, isOwner: true },
      { ...publicUser1, isOwner: true },
      { ...publicUser1, isOwner: false },
    ])(
      '$RoleKey should not be able to query wizard',
      async ({ isOwner, ...user }) => {
        const risk = buildRisk(
          isOwner
            ? {
                owners: { data: [buildOwner({ UserId: user.Id })] },
              }
            : {}
        );
        const assessment = buildAssessment();
        const activity = buildAssessmentActivity({
          ParentId: assessment.Id!,
        });

        await apiClient.insertAssessment({ objects: assessment });
        await apiClient.insertAssessmentActivity({
          objects: activity,
        });
        await apiClient.insertRisk({ objects: risk });
        await apiClient.insertWizard(
          {
            object: {
              RiskId: risk.Id ?? '',
              AssessmentId: assessment.Id,
              Status: WizardStatusEnum.InProgress,
              ActivityId: activity.Id,
            },
          },
          { user: riskManagerUser1 }
        );

        await expect(
          apiClient.getWizardById({ RiskId: risk.Id ?? '' }, { user })
        ).rejects.toThrowError(
          "field 'wizard' not found in type: 'query_root'"
        );
      }
    );
  });
});
