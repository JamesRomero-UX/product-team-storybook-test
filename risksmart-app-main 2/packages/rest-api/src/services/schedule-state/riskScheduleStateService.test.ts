import type { ApolloClient } from '@apollo/client';
import {
  ParentTypeEnum,
  RiskAssessmentResultControlTypeEnum,
  RiskScoringModelEnum,
  TestFrequencyEnum,
} from 'generated/graphql';
import type { Sdk } from 'generated/graphql2';
import { getRisksmartApiClient } from 'src/repositories/getRisksmartApiClient';
import { stub } from 'src/testing/stub';
import { buildSchedule } from 'src/testing/test-data/scheduleBuilder';
import { buildScheduleState } from 'src/testing/test-data/scheduleStateBuilder';
import { vi } from 'vitest';

import { isOrgModuleEnabled } from '../orgUtilities';
import { refreshRiskRatingScheduleState } from './riskRatingScheduleStateService';

vi.mock('src/services/aggregation/aggregationService');
vi.mock('src/backendGraphqlClient');
vi.mock('src/adminGraphqlClient');
vi.mock('src/services/risk/riskService');
vi.mock('src/services/assessment-result/assessmentResultService');
vi.mock('../orgUtilities');

vi.mock('src/repositories/getRisksmartApiClient', async () => {
  const sdk: Sdk = {
    ...(await vi.importActual('src/repositories/getRisksmartApiClient')),
    getLatestRiskAssessmentResultByParentId: vi.fn(),
    getScheduleState: vi.fn(),
    getSchedule: vi.fn(),
    upsertScheduleState: vi.fn(),
    getAggregationSettingsForOrg: vi.fn(),
    getNode: vi.fn(),
  };

  return { getRisksmartApiClient: () => sdk };
});
const riskId = 'risk-1';
const apiClient = getRisksmartApiClient(stub<ApolloClient<unknown>>({}));

const getLatestRiskAssessmentResultByParentIdMock = vi.mocked(
  apiClient.getLatestRiskAssessmentResultByParentId
);

const getScheduleMock = vi.mocked(apiClient.getSchedule);
const getScheduleStateMock = vi.mocked(apiClient.getScheduleState);
const upsertScheduleStateMock = vi.mocked(apiClient.upsertScheduleState);
const getAggregationSettingsForOrgMock = vi.mocked(
  apiClient.getAggregationSettingsForOrg
);
const isOrgModuleEnabledMock = vi.mocked(isOrgModuleEnabled);
const getNodeMock = vi.mocked(apiClient.getNode);

describe('riskScheduleStateService', () => {
  const mockDate = new Date(Date.UTC(2024, 4, 4, 13, 14, 16));
  beforeEach(() => {
    vi.resetAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(mockDate);
    getScheduleStateMock.mockResolvedValue({ schedule_state_by_pk: undefined });
    isOrgModuleEnabledMock.mockResolvedValue(false);
    getNodeMock.mockResolvedValue({
      node_by_pk: {
        ObjectType: ParentTypeEnum.Risk,
        Id: riskId,
        ancestorContributors: [],
      },
    });
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('does not update schedule when impacts enabled', async () => {
    isOrgModuleEnabledMock.mockResolvedValue(true);
    getAggregationSettingsForOrgMock.mockResolvedValueOnce({
      aggregation_org: [
        {
          OrgKey: '',
          RiskScoringModel: RiskScoringModelEnum.ControlEffectivenessAverages,
        },
      ],
    });
    getScheduleMock.mockResolvedValue({
      schedule_by_pk: buildSchedule({
        Frequency: TestFrequencyEnum.Daily,
        StartDate: '2024-05-14T00:00:00.000Z',
      }),
    });

    getLatestRiskAssessmentResultByParentIdMock.mockResolvedValue({
      risk_assessment_result: [
        {
          TestDate: '2024-05-15T00:00:00.000Z',
          Id: 'risk-res-1',
          ControlType: RiskAssessmentResultControlTypeEnum.Uncontrolled,
        },
      ],
    });

    await refreshRiskRatingScheduleState({
      riskId,
      session: { orgKey: 'Org1', userId: '', userRole: '', tenant: '' },
    });

    expect(upsertScheduleStateMock).not.toHaveBeenCalled();
  });

  it('updates the risk, calculates the next date when frequency defined', async () => {
    getAggregationSettingsForOrgMock.mockResolvedValueOnce({
      aggregation_org: [
        {
          OrgKey: '',
          RiskScoringModel: RiskScoringModelEnum.ControlEffectivenessAverages,
        },
      ],
    });
    getScheduleMock.mockResolvedValue({
      schedule_by_pk: buildSchedule({
        Frequency: TestFrequencyEnum.Daily,
        StartDate: '2024-05-14T00:00:00.000Z',
      }),
    });

    getLatestRiskAssessmentResultByParentIdMock.mockResolvedValue({
      risk_assessment_result: [
        {
          TestDate: '2024-05-15T00:00:00.000Z',
          Id: 'risk-res-1',
          ControlType: RiskAssessmentResultControlTypeEnum.Uncontrolled,
        },
      ],
    });

    await refreshRiskRatingScheduleState({
      riskId,
      session: { orgKey: 'Org1', userId: '', userRole: '', tenant: '' },
    });

    expect(upsertScheduleStateMock).toHaveBeenCalledWith<
      Parameters<typeof upsertScheduleStateMock>
    >({
      Id: riskId,
      DueDate: '2024-05-16T00:00:00.000Z',
      LatestDate: '2024-05-15T00:00:00.000Z',
      OverdueDate: null,
      ModifiedByUser: 'SYSTEM',
      ModifiedAtTimestamp: '2024-05-04T13:14:16.000Z',
      OrgKey: 'Org1',
    });

    expect(getLatestRiskAssessmentResultByParentIdMock).toHaveBeenCalledWith({
      Id: riskId,
    });
    expect(getAggregationSettingsForOrgMock).toHaveBeenCalledWith({
      OrgKey: 'Org1',
    });
  });

  it('updates the risk, calculates the next date when frequency defined and last test is prior to latest', async () => {
    getAggregationSettingsForOrgMock.mockResolvedValueOnce({
      aggregation_org: [
        {
          OrgKey: '',
          RiskScoringModel: RiskScoringModelEnum.ControlEffectivenessAverages,
        },
      ],
    });
    getScheduleMock.mockResolvedValue({
      schedule_by_pk: buildSchedule({
        Frequency: TestFrequencyEnum.Daily,
        StartDate: '2024-05-10T00:00:00.000Z',
      }),
    });

    getScheduleStateMock.mockResolvedValue({
      schedule_state_by_pk: buildScheduleState({
        LatestDate: '2024-05-11T00:00:00.000Z',
      }),
    });

    getLatestRiskAssessmentResultByParentIdMock.mockResolvedValue({
      risk_assessment_result: [
        {
          TestDate: '2024-05-15T00:00:00.000Z',
          Id: 'risk-res-1',
          ControlType: RiskAssessmentResultControlTypeEnum.Uncontrolled,
        },
      ],
    });

    await refreshRiskRatingScheduleState({
      riskId: riskId,
      session: { orgKey: 'Org1', userId: '', userRole: '', tenant: '' },
    });

    expect(upsertScheduleStateMock).toHaveBeenCalledWith<
      Parameters<typeof upsertScheduleStateMock>
    >({
      Id: riskId,
      DueDate: '2024-05-16T00:00:00.000Z',
      LatestDate: '2024-05-15T00:00:00.000Z',
      ModifiedByUser: 'SYSTEM',
      ModifiedAtTimestamp: '2024-05-04T13:14:16.000Z',
      OverdueDate: null,
      OrgKey: 'Org1',
    });

    expect(getLatestRiskAssessmentResultByParentIdMock).toHaveBeenCalledWith({
      Id: riskId,
    });
  });

  it('does not update schedule state when aggregation set to ControlEffectivenessAverages and rating is controlled', async () => {
    getAggregationSettingsForOrgMock.mockResolvedValueOnce({
      aggregation_org: [
        {
          OrgKey: 'Org1',
          RiskScoringModel: RiskScoringModelEnum.ControlEffectivenessAverages,
        },
      ],
    });
    getScheduleMock.mockResolvedValue({
      schedule_by_pk: buildSchedule({
        Frequency: TestFrequencyEnum.Daily,
        StartDate: '2024-05-13T00:00:00.000Z',
      }),
    });

    getScheduleStateMock.mockResolvedValue({
      schedule_state_by_pk: buildScheduleState({
        Id: riskId,
        LatestDate: '2024-05-14T00:00:00.000Z',
        DueDate: '2024-05-10T00:00:00.000Z',
        OverdueDate: '2024-05-11T00:00:00.000Z',
      }),
    });

    getLatestRiskAssessmentResultByParentIdMock.mockResolvedValue({
      risk_assessment_result: [
        {
          TestDate: '2024-05-15T00:00:00.000Z',
          Id: 'risk-res-1',
          ControlType: RiskAssessmentResultControlTypeEnum.Controlled,
        },
      ],
    });

    await refreshRiskRatingScheduleState({
      riskId,
      session: { orgKey: 'Org1', userId: '', userRole: '', tenant: '' },
    });

    expect(upsertScheduleStateMock).not.toHaveBeenCalled();

    expect(getLatestRiskAssessmentResultByParentIdMock).toHaveBeenCalledWith({
      Id: riskId,
    });
  });

  it('updates the risk, calculates the next date when frequency and schedule start date defined, last test is prior to latest with aggregation and uncontrolled risk', async () => {
    getAggregationSettingsForOrgMock.mockResolvedValueOnce({
      aggregation_org: [
        {
          OrgKey: 'Org1',
          RiskScoringModel: RiskScoringModelEnum.ControlEffectivenessAverages,
        },
      ],
    });
    getScheduleMock.mockResolvedValue({
      schedule_by_pk: buildSchedule({
        Frequency: TestFrequencyEnum.Daily,
        StartDate: '2024-05-14T00:00:00.000Z',
      }),
    });

    getLatestRiskAssessmentResultByParentIdMock.mockResolvedValue({
      risk_assessment_result: [
        {
          TestDate: '2024-05-15T00:00:00.000Z',
          Id: 'risk-res-1',
          ControlType: RiskAssessmentResultControlTypeEnum.Uncontrolled,
        },
      ],
    });

    await refreshRiskRatingScheduleState({
      riskId,
      session: { orgKey: 'Org1', userId: '', userRole: '', tenant: '' },
    });

    expect(upsertScheduleStateMock).toHaveBeenCalledWith<
      Parameters<typeof upsertScheduleStateMock>
    >({
      Id: riskId,
      DueDate: '2024-05-16T00:00:00.000Z',
      LatestDate: '2024-05-15T00:00:00.000Z',
      OverdueDate: null,
      ModifiedByUser: 'SYSTEM',
      ModifiedAtTimestamp: '2024-05-04T13:14:16.000Z',
      OrgKey: 'Org1',
    });

    expect(getLatestRiskAssessmentResultByParentIdMock).toHaveBeenCalledWith({
      Id: riskId,
    });
  });

  it('updates the schedule state, if current next test date greater than updated test date', async () => {
    getAggregationSettingsForOrgMock.mockResolvedValueOnce({
      aggregation_org: [{ OrgKey: '' }],
    });
    getScheduleMock.mockResolvedValue({
      schedule_by_pk: buildSchedule({
        Frequency: TestFrequencyEnum.Daily,
        StartDate: '2024-05-14T00:00:00.000Z',
      }),
    });

    getScheduleStateMock.mockResolvedValue({
      schedule_state_by_pk: buildScheduleState({
        LatestDate: '2024-05-17T00:00:00.000Z',
        DueDate: '2025-05-17T00:00:00.000Z',
      }),
    });

    getLatestRiskAssessmentResultByParentIdMock.mockResolvedValue({
      risk_assessment_result: [
        {
          TestDate: '2024-05-15T00:00:00.000Z',
          Id: 'risk-res-1',
          ControlType: RiskAssessmentResultControlTypeEnum.Uncontrolled,
        },
      ],
    });

    await refreshRiskRatingScheduleState({
      riskId,
      session: { orgKey: 'Org1', userId: '', userRole: '', tenant: '' },
    });

    expect(upsertScheduleStateMock).toHaveBeenCalledWith<
      Parameters<typeof upsertScheduleStateMock>
    >({
      Id: 'risk-1',
      LatestDate: '2024-05-15T00:00:00.000Z',
      ModifiedAtTimestamp: '2024-05-04T13:14:16.000Z',
      ModifiedByUser: 'SYSTEM',
      DueDate: '2024-05-16T00:00:00.000Z',
      OverdueDate: null,
      OrgKey: 'Org1',
    });

    expect(getLatestRiskAssessmentResultByParentIdMock).toHaveBeenCalledWith({
      Id: riskId,
    });
  });

  it('updates schedule, when there are no tests', async () => {
    getAggregationSettingsForOrgMock.mockResolvedValueOnce({
      aggregation_org: [{ OrgKey: '' }],
    });
    getScheduleMock.mockResolvedValue({
      schedule_by_pk: buildSchedule({
        Frequency: TestFrequencyEnum.Daily,
        StartDate: '2024-05-14T00:00:00.000Z',
      }),
    });

    getLatestRiskAssessmentResultByParentIdMock.mockResolvedValue({
      risk_assessment_result: [],
    });

    await refreshRiskRatingScheduleState({
      riskId: 'risk-1',
      session: { orgKey: 'Org1', userId: '', userRole: '', tenant: '' },
    });

    expect(upsertScheduleStateMock).toHaveBeenCalledWith(
      expect.objectContaining<
        Partial<Parameters<typeof upsertScheduleStateMock>[0]>
      >({
        LatestDate: null,
        DueDate: '2024-05-14T00:00:00.000Z',
        OverdueDate: null,
      })
    );

    expect(getLatestRiskAssessmentResultByParentIdMock).toHaveBeenCalledWith({
      Id: riskId,
    });
  });

  it('updates the schedule, if the latest test date is null and scheduled start date set', async () => {
    getAggregationSettingsForOrgMock.mockResolvedValueOnce({
      aggregation_org: [{ OrgKey: '' }],
    });

    getScheduleMock.mockResolvedValue({
      schedule_by_pk: buildSchedule({
        Frequency: TestFrequencyEnum.Daily,
        StartDate: '2024-05-15T00:00:00.000Z',
      }),
    });

    getLatestRiskAssessmentResultByParentIdMock.mockResolvedValue({
      risk_assessment_result: [
        {
          Id: 'risk-res-1',
          ControlType: RiskAssessmentResultControlTypeEnum.Uncontrolled,
          TestDate: null,
        },
      ],
    });

    await refreshRiskRatingScheduleState({
      riskId: riskId,
      session: { orgKey: 'Org1', userId: '', userRole: '', tenant: '' },
    });

    expect(upsertScheduleStateMock).toHaveBeenCalledWith<
      Partial<Parameters<typeof upsertScheduleStateMock>>
    >({
      Id: riskId,
      LatestDate: null,
      ModifiedAtTimestamp: '2024-05-04T13:14:16.000Z',
      ModifiedByUser: 'SYSTEM',
      DueDate: '2024-05-15T00:00:00.000Z',
      OverdueDate: null,
      OrgKey: 'Org1',
    });

    expect(getLatestRiskAssessmentResultByParentIdMock).toHaveBeenCalledWith({
      Id: riskId,
    });
  });

  it('updates the risk, only sets the latest rating date if no frequency selected', async () => {
    getAggregationSettingsForOrgMock.mockResolvedValueOnce({
      aggregation_org: [{ OrgKey: '' }],
    });
    getScheduleMock.mockResolvedValue({
      schedule_by_pk: buildSchedule({
        Frequency: null,
        StartDate: '2024-05-15T00:00:00.000Z',
      }),
    });

    getLatestRiskAssessmentResultByParentIdMock.mockResolvedValue({
      risk_assessment_result: [
        {
          TestDate: '2024-05-15T00:00:00.000Z',
          Id: 'risk-res-1',
          ControlType: RiskAssessmentResultControlTypeEnum.Uncontrolled,
        },
      ],
    });

    await refreshRiskRatingScheduleState({
      riskId,
      session: { orgKey: 'Org1', userId: '', userRole: '', tenant: '' },
    });

    expect(upsertScheduleStateMock).toHaveBeenCalledWith<
      Partial<Parameters<typeof upsertScheduleStateMock>>
    >({
      Id: riskId,
      DueDate: undefined,
      LatestDate: '2024-05-15T00:00:00.000Z',
      OverdueDate: null,
      ModifiedByUser: 'SYSTEM',
      ModifiedAtTimestamp: '2024-05-04T13:14:16.000Z',
      OrgKey: 'Org1',
    });

    expect(getLatestRiskAssessmentResultByParentIdMock).toHaveBeenCalledWith({
      Id: riskId,
    });
  });

  it('updates the risk, only sets the latest rating date if frequency is adhoc', async () => {
    getAggregationSettingsForOrgMock.mockResolvedValueOnce({
      aggregation_org: [{ OrgKey: '' }],
    });
    getScheduleMock.mockResolvedValue({
      schedule_by_pk: buildSchedule({
        Frequency: TestFrequencyEnum.Adhoc,
        StartDate: '2024-05-15T00:00:00.000Z',
      }),
    });

    getLatestRiskAssessmentResultByParentIdMock.mockResolvedValue({
      risk_assessment_result: [
        {
          TestDate: '2024-05-15T00:00:00.000Z',
          Id: 'risk-res-1',
          ControlType: RiskAssessmentResultControlTypeEnum.Uncontrolled,
        },
      ],
    });

    await refreshRiskRatingScheduleState({
      riskId,
      session: { orgKey: 'Org1', userId: '', userRole: '', tenant: '' },
    });

    expect(upsertScheduleStateMock).toHaveBeenCalledWith<
      Partial<Parameters<typeof upsertScheduleStateMock>>
    >({
      Id: riskId,
      DueDate: undefined,
      OverdueDate: null,
      LatestDate: '2024-05-15T00:00:00.000Z',
      ModifiedByUser: 'SYSTEM',
      ModifiedAtTimestamp: '2024-05-04T13:14:16.000Z',
      OrgKey: 'Org1',
    });

    expect(getLatestRiskAssessmentResultByParentIdMock).toHaveBeenCalledWith({
      Id: riskId,
    });
  });
});
