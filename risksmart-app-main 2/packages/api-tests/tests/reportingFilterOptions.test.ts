import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from '../clients/apiClient';
import { getAnotherOrgId, getDefaultOrgId } from '../clients/defaults';
import { buildRisk } from '../data/risk';
import {
  customerSupportUser1,
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

describe('reportingFilterOptions', () => {
  beforeEach(async () => {
    await setup(mockedDefaults);
  });
  afterEach(async () => {
    await teardown();
  });

  it.each([standardUser1, standardEnhancedUser1])(
    '$RoleKey cannot get filter options',
    async (user) => {
      await expect(
        apiClient.getReportingFilterOptions(
          {
            Input: {
              dataSourceType: 'risks',
              fieldId: 'title',
              filteringText: '',
              limit: 10,
              offset: 0,
            },
          },
          { user }
        )
      ).rejects.toThrow(
        "field 'reportingFilterOptions' not found in type: 'query_root'"
      );
    }
  );

  it.each([riskManagerUser1, customerSupportUser1])(
    'only returns risk titles for the current organisation',
    async (user) => {
      const ownOrgRisk = buildRisk({
        Title: 'Risk 1',
        OrgKey: getDefaultOrgId(),
      });
      const otherOrgRisk = buildRisk({
        Title: 'Risk 2',
        OrgKey: getAnotherOrgId(),
      });
      await apiClient.insertRisk({
        objects: [ownOrgRisk, otherOrgRisk],
      });

      const { reportingFilterOptions } =
        await apiClient.getReportingFilterOptions(
          {
            Input: {
              dataSourceType: 'risks',
              fieldId: 'title',
              filteringText: '',
              limit: 10,
              offset: 0,
            },
          },

          { user }
        );
      expect(reportingFilterOptions?.length).toEqual(1);
      expect(reportingFilterOptions?.[0].value).toEqual(ownOrgRisk.Title);
    }
  );

  it('does not return duplicate values', async () => {
    const risk1 = buildRisk({
      Title: 'Risk 1',
      OrgKey: getDefaultOrgId(),
    });
    const risk2 = buildRisk({
      Title: 'Risk 1',
      OrgKey: getDefaultOrgId(),
    });
    await apiClient.insertRisk({
      objects: [risk1, risk2],
    });

    const { reportingFilterOptions } =
      await apiClient.getReportingFilterOptions(
        {
          Input: {
            dataSourceType: 'risks',
            fieldId: 'title',
            filteringText: '',
            limit: 10,
            offset: 0,
          },
        },

        { user: riskManagerUser1 }
      );
    expect(reportingFilterOptions?.length).toEqual(1);
    expect(reportingFilterOptions?.[0].value).toEqual(risk1.Title);
  });

  it('filters values by the filteringText (case insensitive)', async () => {
    const risk1 = buildRisk({
      Title: 'Risk 1',
      OrgKey: getDefaultOrgId(),
    });
    const risk2 = buildRisk({
      Title: 'Risk 2',
      OrgKey: getDefaultOrgId(),
    });
    const risk3 = buildRisk({
      Title: 'Something else',
      OrgKey: getDefaultOrgId(),
    });
    await apiClient.insertRisk({
      objects: [risk1, risk2, risk3],
    });

    const { reportingFilterOptions } =
      await apiClient.getReportingFilterOptions(
        {
          Input: {
            dataSourceType: 'risks',
            fieldId: 'title',
            filteringText: 'IsK',
            limit: 10,
            offset: 0,
          },
        },

        { user: riskManagerUser1 }
      );
    expect(reportingFilterOptions?.length).toEqual(2);
    expect(reportingFilterOptions?.[0].value).toEqual(risk1.Title);
    expect(reportingFilterOptions?.[1].value).toEqual(risk2.Title);
  });

  it('can filter on guid columns', async () => {
    const risk1 = buildRisk({
      Title: 'Risk 1',
      OrgKey: getDefaultOrgId(),
    });
    const risk2 = buildRisk({
      Title: 'Risk 2',
      OrgKey: getDefaultOrgId(),
    });

    await apiClient.insertRisk({
      objects: [risk1, risk2],
    });

    const { reportingFilterOptions } =
      await apiClient.getReportingFilterOptions(
        {
          Input: {
            dataSourceType: 'risks',
            fieldId: 'id',
            filteringText: risk1.Id!.substring(0, 4),
            limit: 10,
            offset: 0,
          },
        },

        { user: riskManagerUser1 }
      );
    expect(reportingFilterOptions?.length).toEqual(1);
    expect(reportingFilterOptions?.[0].value).toEqual(risk1.Id);
  });
});
