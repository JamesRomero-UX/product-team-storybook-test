import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from '../clients/apiClient';
import { getAnotherOrgId, getDefaultOrgId } from '../clients/defaults';
import { buildAction } from '../data/action';
import { buildControl } from '../data/control';
import { buildControlParent } from '../data/controlParent';
import { buildIssue } from '../data/issue';
import { buildRisk } from '../data/risk';
import {
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

describe('reporting', () => {
  beforeEach(async () => {
    await setup(mockedDefaults);
  });
  afterEach(async () => {
    await teardown();
  });

  it.each([standardUser1, standardEnhancedUser1])(
    '$RoleKey cannot get report data',
    async (user) => {
      await expect(
        apiClient.getReportingData(
          {
            Input: {
              dataSources: [{ type: 'risks' }],
              fields: [{ fieldId: 'title', dataSourceIndex: 0 }],
              filters: {
                operation: 'and',
                filters: [],
              },
              limit: 10,
              offset: 0,
            },
          },
          { user }
        )
      ).rejects.toThrow(
        "field 'reportingData' not found in type: 'query_root'"
      );
    }
  );

  it('only returns risks for the current organisation', async () => {
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

    const { reportingData } = await apiClient.getReportingData(
      {
        Input: {
          dataSources: [{ type: 'risks' }],
          fields: [{ fieldId: 'title', dataSourceIndex: 0 }],
          filters: {
            operation: 'and',
            filters: [],
          },
          limit: 10,
          offset: 0,
        },
      },
      { user: riskManagerUser1 }
    );
    expect(reportingData?.length).toEqual(1);
    expect(reportingData?.[0][0].value).toEqual(ownOrgRisk.Title);
  });

  it('only returns controls for the current organisation', async () => {
    const ownOrgControl = buildControl({
      Title: 'Control 1',
      OrgKey: getDefaultOrgId(),
    });
    const otherOrgControl = buildControl({
      Title: 'Control 2',
      OrgKey: getAnotherOrgId(),
    });
    await apiClient.insertControl({
      objects: [ownOrgControl, otherOrgControl],
    });

    const { reportingData } = await apiClient.getReportingData(
      {
        Input: {
          dataSources: [{ type: 'controls' }],
          fields: [{ fieldId: 'title', dataSourceIndex: 0 }],
          filters: {
            operation: 'and',
            filters: [],
          },
          limit: 10,
          offset: 0,
        },
      },
      { user: riskManagerUser1 }
    );
    expect(reportingData?.length).toEqual(1);
    expect(reportingData?.[0][0].value).toEqual(ownOrgControl.Title);
  });

  it('only returns actions for the current organisation', async () => {
    const ownOrgAction = buildAction({
      Title: 'Action 1',
      OrgKey: getDefaultOrgId(),
    });
    const otherOrgAction = buildAction({
      Title: 'Action 2',
      OrgKey: getAnotherOrgId(),
    });
    await apiClient.insertActions({
      objects: [ownOrgAction, otherOrgAction],
    });

    const { reportingData } = await apiClient.getReportingData(
      {
        Input: {
          dataSources: [{ type: 'actions' }],
          fields: [{ fieldId: 'title', dataSourceIndex: 0 }],
          filters: {
            operation: 'and',
            filters: [],
          },
          limit: 10,
          offset: 0,
        },
      },
      { user: riskManagerUser1 }
    );
    expect(reportingData?.length).toEqual(1);
    expect(reportingData?.[0][0].value).toEqual(ownOrgAction.Title);
  });

  it('only returns issues for the current organisation', async () => {
    const ownOrgIssue = buildIssue({
      Title: 'Issue 1',
      OrgKey: getDefaultOrgId(),
    });
    const otherOrgIssue = buildIssue({
      Title: 'Issue 2',
      OrgKey: getAnotherOrgId(),
    });
    await apiClient.insertIssues({
      objects: [ownOrgIssue, otherOrgIssue],
    });

    const { reportingData } = await apiClient.getReportingData(
      {
        Input: {
          dataSources: [{ type: 'issues' }],
          fields: [{ fieldId: 'title', dataSourceIndex: 0 }],
          filters: {
            operation: 'and',
            filters: [],
          },
          limit: 10,
          offset: 0,
        },
      },
      { user: riskManagerUser1 }
    );
    expect(reportingData?.length).toEqual(1);
    expect(reportingData?.[0][0].value).toEqual(ownOrgIssue.Title);
  });

  it('can return a risk and control', async () => {
    const risk = buildRisk({
      Title: 'Risk 1',
      OrgKey: getDefaultOrgId(),
    });

    const control = buildControl({
      Title: 'Control 1',
      OrgKey: getDefaultOrgId(),
    });
    const controlParent = buildControlParent({
      ParentId: risk.Id,
      ControlId: control.Id,
    });

    await apiClient.insertRisk({
      objects: [risk],
    });

    await apiClient.insertControl({
      objects: [control],
    });

    await apiClient.insertControlParents({
      objects: [controlParent],
    });

    const { reportingData } = await apiClient.getReportingData(
      {
        Input: {
          dataSources: [
            { type: 'risks' },
            { type: 'controls', parentIndex: 0 },
          ],
          fields: [
            { fieldId: 'title', dataSourceIndex: 0 },
            { fieldId: 'title', dataSourceIndex: 1 },
          ],
          filters: {
            operation: 'and',
            filters: [],
          },
          limit: 10,
          offset: 0,
        },
      },
      { user: riskManagerUser1 }
    );
    expect(reportingData?.length).toEqual(1);
    expect(reportingData?.[0][0].value).toEqual(risk.Title);
    expect(reportingData?.[0][1].value).toEqual(control.Title);
  });
});
