import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from '../clients/apiClient';
import { getDefaultOrgId } from '../clients/defaults';
import {
  insertRiskAssessmentResultConfig,
  updateRiskAssessmentResultConfig,
} from '../clients/riskAssessmentResultConfigClient';
import type { RiskAssessmentResultConfigInput } from '../data/riskAssessmentResultConfig';
import { buildRiskAssessmentResultConfig } from '../data/riskAssessmentResultConfig';
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

describe('riskAssessmentResultConfig', () => {
  beforeEach(async () => {
    await setup(mockedDefaults);
  });

  afterEach(async () => {
    await teardown();
  });

  describe('insertRiskAssessmentResultConfig', () => {
    it.each([customerSupportUser1, riskManagerUser1])(
      '$RoleKey should insert risk assessment result configuration',
      async (user) => {
        const config = buildRiskAssessmentResultConfig();

        const result = await insertRiskAssessmentResultConfig(
          { Config: config },
          {
            user,
            orgId: getDefaultOrgId(),
          }
        );

        expect(result.data?.insertRiskAssessmentResultConfigApi).toBeDefined();
        expect(
          result.data?.insertRiskAssessmentResultConfigApi?.Id
        ).toBeDefined();
        expect(result.data?.insertRiskAssessmentResultConfigApi?.Version).toBe(
          1
        );
        expect(result.data?.insertRiskAssessmentResultConfigApi?.IsLatest).toBe(
          true
        );
      }
    );

    it.each([
      standardUser1,
      standardEnhancedUser1,
      internalAuditUser1,
      readOnlyUser1,
    ])(
      '$RoleKey should NOT insert risk assessment result configuration',
      async (user) => {
        const config = buildRiskAssessmentResultConfig();

        await expect(
          insertRiskAssessmentResultConfig(
            { Config: config },
            {
              user,
              orgId: getDefaultOrgId(),
            }
          )
        ).rejects.toThrowError(
          "field 'insertRiskAssessmentResultConfigApi' not found in type: 'mutation_root'"
        );
      }
    );

    it('should increment version when creating new configuration', async () => {
      const config1 = buildRiskAssessmentResultConfig();
      const config2 = buildRiskAssessmentResultConfig();
      config2.likelihood.ratings[0].title = 'Very Rare';

      const result1 = await insertRiskAssessmentResultConfig(
        { Config: config1 },
        {
          user: riskManagerUser1,
          orgId: getDefaultOrgId(),
        }
      );

      const result2 = await insertRiskAssessmentResultConfig(
        { Config: config2 },
        {
          user: riskManagerUser1,
          orgId: getDefaultOrgId(),
        }
      );

      expect(result1.data?.insertRiskAssessmentResultConfigApi?.Version).toBe(
        1
      );
      expect(result2.data?.insertRiskAssessmentResultConfigApi?.Version).toBe(
        2
      );
      expect(result2.data?.insertRiskAssessmentResultConfigApi?.IsLatest).toBe(
        true
      );
    });

    it('should return error when configuration is invalid', async () => {
      const config = buildRiskAssessmentResultConfig();
      config.likelihood.ratings = [];

      await expect(
        insertRiskAssessmentResultConfig(
          { Config: config },
          {
            user: riskManagerUser1,
            orgId: getDefaultOrgId(),
          }
        )
      ).rejects.toThrowError('At least one likelihood rating is required');
    });
  });

  describe('updateRiskAssessmentResultConfig', () => {
    it.each([customerSupportUser1, riskManagerUser1])(
      '$RoleKey should update risk assessment result configuration',
      async (user) => {
        const insertResult = await insertRiskAssessmentResultConfig(
          { Config: buildRiskAssessmentResultConfig() },
          {
            user,
            orgId: getDefaultOrgId(),
          }
        );

        const currentConfigId =
          insertResult.data?.insertRiskAssessmentResultConfigApi?.Id;

        const currentConfig = await apiClient.getRiskAssessmentResultConfigById(
          { Id: currentConfigId! },
          { user, orgId: getDefaultOrgId() }
        );

        const originalTimestamp =
          currentConfig.risk_assessment_result_config_by_pk
            ?.ModifiedAtTimestamp;

        // Change titles and colors
        const updatedConfig = buildRiskAssessmentResultConfig({
          likelihood: {
            ratings: [
              { title: 'Very Rare', value: 1, color: 'green' },
              { title: 'Seldom', value: 2, color: 'lime' },
              { title: 'Possible', value: 3, color: 'yellow' },
              { title: 'Likely', value: 4, color: 'red' },
              { title: 'Certain', value: 5, color: 'crimson' },
            ],
          },
        });

        const updateResult = await updateRiskAssessmentResultConfig(
          {
            Id: currentConfigId!,
            Config: updatedConfig,
            OriginalTimestamp: new Date(
              originalTimestamp as string
            ).toISOString(),
          },
          {
            user,
            orgId: getDefaultOrgId(),
          }
        );

        expect(
          updateResult.data?.updateRiskAssessmentResultConfigApi
        ).toBeDefined();
        expect(updateResult.data?.updateRiskAssessmentResultConfigApi?.Id).toBe(
          currentConfigId
        );
        expect(
          updateResult.data?.updateRiskAssessmentResultConfigApi?.Version
        ).toBe(1);
        expect(
          updateResult.data?.updateRiskAssessmentResultConfigApi?.IsLatest
        ).toBe(true);
      }
    );

    it.each([
      standardUser1,
      standardEnhancedUser1,
      internalAuditUser1,
      readOnlyUser1,
    ])(
      '$RoleKey should NOT update risk assessment result configuration',
      async (user) => {
        const insertResult = await insertRiskAssessmentResultConfig(
          { Config: buildRiskAssessmentResultConfig() },
          {
            user: riskManagerUser1,
            orgId: getDefaultOrgId(),
          }
        );

        const currentConfigId =
          insertResult.data?.insertRiskAssessmentResultConfigApi?.Id;

        const currentConfig = await apiClient.getRiskAssessmentResultConfigById(
          { Id: currentConfigId! },
          { user: riskManagerUser1, orgId: getDefaultOrgId() }
        );

        const originalTimestamp =
          currentConfig.risk_assessment_result_config_by_pk
            ?.ModifiedAtTimestamp;

        const updatedConfig = buildRiskAssessmentResultConfig();
        updatedConfig.likelihood.ratings[0].title = 'Updated Title';

        await expect(
          updateRiskAssessmentResultConfig(
            {
              Id: currentConfigId!,
              Config: updatedConfig,
              OriginalTimestamp: new Date(
                originalTimestamp as string
              ).toISOString(),
            },
            {
              user,
              orgId: getDefaultOrgId(),
            }
          )
        ).rejects.toThrowError(
          "field 'updateRiskAssessmentResultConfigApi' not found in type: 'mutation_root'"
        );
      }
    );

    it('should reject configuration changes that require a new version', async () => {
      const insertResult = await insertRiskAssessmentResultConfig(
        { Config: buildRiskAssessmentResultConfig() },
        {
          user: riskManagerUser1,
          orgId: getDefaultOrgId(),
        }
      );

      const currentConfigId =
        insertResult.data?.insertRiskAssessmentResultConfigApi?.Id;

      const currentConfig = await apiClient.getRiskAssessmentResultConfigById(
        { Id: currentConfigId! },
        { user: riskManagerUser1, orgId: getDefaultOrgId() }
      );

      const originalTimestamp =
        currentConfig.risk_assessment_result_config_by_pk?.ModifiedAtTimestamp;

      // Change values
      const updatedConfig: RiskAssessmentResultConfigInput = {
        likelihood: {
          ratings: [
            { title: 'Rare', value: 10, color: 'dark-green' },
            { title: 'Unlikely', value: 20, color: 'light-green' },
            { title: 'Possible', value: 30, color: 'orange' },
            { title: 'Likely', value: 40, color: 'light-red' },
            { title: 'Almost Certain', value: 50, color: 'dark-red' },
          ],
        },
        impact: {
          categories: [
            { name: 'Financial', color: 'blue' },
            { name: 'Operational', color: 'purple' },
            { name: 'Reputational', color: 'teal' },
          ],
          ratings: [
            { title: 'Insignificant', value: 1, color: 'dark-green' },
            { title: 'Minor', value: 2, color: 'light-green' },
            { title: 'Moderate', value: 3, color: 'orange' },
            { title: 'Major', value: 4, color: 'light-red' },
            { title: 'Severe', value: 5, color: 'dark-red' },
          ],
          aggregation: 'average',
        },
        matrix: [
          {
            title: 'Low',
            value: 1,
            color: 'dark-green',
            likelihood: 10,
            impact: 1,
          },
          {
            title: 'Low',
            value: 1,
            color: 'dark-green',
            likelihood: 10,
            impact: 2,
          },
          {
            title: 'Low',
            value: 1,
            color: 'dark-green',
            likelihood: 20,
            impact: 1,
          },
          {
            title: 'Medium',
            value: 2,
            color: 'orange',
            likelihood: 10,
            impact: 3,
          },
          {
            title: 'Medium',
            value: 2,
            color: 'orange',
            likelihood: 20,
            impact: 2,
          },
          {
            title: 'Medium',
            value: 2,
            color: 'orange',
            likelihood: 20,
            impact: 3,
          },
          {
            title: 'Medium',
            value: 2,
            color: 'orange',
            likelihood: 30,
            impact: 1,
          },
          {
            title: 'Medium',
            value: 2,
            color: 'orange',
            likelihood: 30,
            impact: 2,
          },
          {
            title: 'High',
            value: 3,
            color: 'light-red',
            likelihood: 10,
            impact: 4,
          },
          {
            title: 'High',
            value: 3,
            color: 'light-red',
            likelihood: 10,
            impact: 5,
          },
          {
            title: 'High',
            value: 3,
            color: 'light-red',
            likelihood: 20,
            impact: 4,
          },
          {
            title: 'High',
            value: 3,
            color: 'light-red',
            likelihood: 20,
            impact: 5,
          },
          {
            title: 'High',
            value: 3,
            color: 'light-red',
            likelihood: 30,
            impact: 3,
          },
          {
            title: 'High',
            value: 3,
            color: 'light-red',
            likelihood: 30,
            impact: 4,
          },
          {
            title: 'High',
            value: 3,
            color: 'light-red',
            likelihood: 30,
            impact: 5,
          },
          {
            title: 'High',
            value: 3,
            color: 'light-red',
            likelihood: 40,
            impact: 1,
          },
          {
            title: 'High',
            value: 3,
            color: 'light-red',
            likelihood: 40,
            impact: 2,
          },
          {
            title: 'High',
            value: 3,
            color: 'light-red',
            likelihood: 40,
            impact: 3,
          },
          {
            title: 'High',
            value: 3,
            color: 'light-red',
            likelihood: 50,
            impact: 1,
          },
          {
            title: 'High',
            value: 3,
            color: 'light-red',
            likelihood: 50,
            impact: 2,
          },
          {
            title: 'Critical',
            value: 4,
            color: 'dark-red',
            likelihood: 40,
            impact: 4,
          },
          {
            title: 'Critical',
            value: 4,
            color: 'dark-red',
            likelihood: 40,
            impact: 5,
          },
          {
            title: 'Critical',
            value: 4,
            color: 'dark-red',
            likelihood: 50,
            impact: 3,
          },
          {
            title: 'Critical',
            value: 4,
            color: 'dark-red',
            likelihood: 50,
            impact: 4,
          },
          {
            title: 'Critical',
            value: 4,
            color: 'dark-red',
            likelihood: 50,
            impact: 5,
          },
        ],
      };

      await expect(
        updateRiskAssessmentResultConfig(
          {
            Id: currentConfigId!,
            Config: updatedConfig,
            OriginalTimestamp: new Date(
              originalTimestamp as string
            ).toISOString(),
          },
          {
            user: riskManagerUser1,
            orgId: getDefaultOrgId(),
          }
        )
      ).rejects.toThrowError(
        'Likelihood values cannot be changed. Create a new version instead.'
      );
    });
  });
});
