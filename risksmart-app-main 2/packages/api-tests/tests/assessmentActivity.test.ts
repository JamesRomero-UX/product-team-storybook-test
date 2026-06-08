import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from '../clients/apiClient';
import { insertAssessment } from '../clients/assessmentClient';
import { buildAssessment } from '../data/assessment';
import { buildAssessmentActivity } from '../data/assessmentActivity';
import { riskManagerUser1, setup, teardown } from '../initialData';

const mockedDefaults = vi.hoisted(() => {
  return {
    getDefaultOrgId: vi.fn(),
    getAnotherOrgId: vi.fn(),
    getDefaultUserId: vi.fn(),
  };
});

vi.mock('../clients/defaults', () => mockedDefaults);

describe('assessmentActivity', () => {
  beforeEach(async () => {
    await setup(mockedDefaults);
  });
  afterEach(async () => {
    await teardown();
  });

  describe('updateAssessmentActivityWithLinkedItems', () => {
    it('Does not update if activity timestamp does not match that of request', async () => {
      const assessment = buildAssessment();
      await insertAssessment(assessment);

      const assessmentActivity = buildAssessmentActivity({
        ParentId: assessment.Id!,
      });
      await apiClient.insertAssessmentActivity({
        objects: [assessmentActivity],
      });

      await expect(
        apiClient.updateAssessmentActivityWithLinkedItems(
          {
            OriginalTimestamp: '2024-01-01',
            LinkedItemIds: [],
            ActivityType: assessmentActivity.ActivityType!,
            Status: assessmentActivity.Status!,
            Summary: assessmentActivity.Summary!,
            Title: assessmentActivity.Title!,
            Id: assessmentActivity.Id!,
            ParentId: assessmentActivity.ParentId!,
            OwnerUserIds: [],
            OwnerGroupIds: [],
          },
          {
            user: riskManagerUser1,
          }
        )
      ).rejects.toThrowError(
        'Item has been modified since last viewed. Please refresh page and try again'
      );
    });

    it('Updates if activity timestamp does match that of request', async () => {
      const assessment = buildAssessment();
      await insertAssessment(assessment);

      const assessmentActivity = buildAssessmentActivity({
        ParentId: assessment.Id!,
      });
      await apiClient.insertAssessmentActivity({
        objects: [assessmentActivity],
      });

      const { assessment_activity } = await apiClient.getAssessmentActivities(
        {},
        { user: riskManagerUser1 }
      );

      const result = await apiClient.updateAssessmentActivityWithLinkedItems(
        {
          OriginalTimestamp: assessment_activity[0].ModifiedAtTimestamp,
          LinkedItemIds: [],
          ActivityType: assessmentActivity.ActivityType!,
          Status: assessmentActivity.Status!,
          Summary: assessmentActivity.Summary!,
          Title: assessmentActivity.Title!,
          Id: assessmentActivity.Id!,
          ParentId: assessmentActivity.ParentId!,
          OwnerUserIds: [],
          OwnerGroupIds: [],
        },
        {
          user: riskManagerUser1,
        }
      );
      expect(result.updateAssessmentActivityWithLinkedItems?.Id).toEqual(
        assessmentActivity.Id
      );
    });
  });
});
