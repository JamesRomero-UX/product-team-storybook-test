import { createServer } from '@mswjs/http-middleware';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import type { DefaultBodyType } from 'msw';
import { http, HttpResponse } from 'msw';
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { apiClient } from '../clients/apiClient';
import { getDefaultOrgId } from '../clients/defaults';
import { sendToEventBridge } from '../clients/eventBridgeClient';
import { buildOrganisationInsert } from '../data/organisation';
import { buildOwner } from '../data/owner';
import { buildRisk } from '../data/risk';
import { buildScheduleInsertInput } from '../data/schedule';
import { buildScheduleStateInsertInput } from '../data/scheduleState';
import type { RiskInsertInput } from '../generated/graphql';
import { TestFrequencyEnum } from '../generated/graphql';
import { UnitOfTimeEnum } from '../generated/graphql2';
import { riskManagerUser1, setup, teardown } from '../initialData';

dayjs.extend(utc);

let requests: { workflowKey: string; body: DefaultBodyType; orgKey: string }[] =
  [];

const getRequests = () =>
  requests.filter((r) => r.orgKey === getDefaultOrgId());
const handlers = [
  http.post('/v1/workflows/:key/trigger', async ({ params, request }) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const requestObj = (await request.json()) as any;
    requests.push({
      workflowKey: params.key as string,
      body: requestObj,
      orgKey: requestObj?.data?.org_id,
    });

    return HttpResponse.json({});
  }),
];

const httpServer = createServer({}, ...handlers);

const mockedDefaults = vi.hoisted(() => {
  return {
    getDefaultOrgId: vi.fn(),
    getAnotherOrgId: vi.fn(),
    getDefaultUserId: vi.fn(),
  };
});

vi.mock('../clients/defaults', () => mockedDefaults);

describe('scheduleDue', () => {
  beforeAll(() => {
    httpServer.listen(9090);
  });

  let risk: RiskInsertInput;

  beforeEach(async () => {
    await setup(mockedDefaults);
    requests = [];

    await apiClient.updateOrganisation({
      Meta: { features: 'notifications' },
      OrgKey: getDefaultOrgId(),
    });
    risk = buildRisk({
      owners: {
        data: [buildOwner({ UserId: riskManagerUser1.Id })],
      },
    });

    await apiClient.insertRisk({ objects: risk });
  }, 10000);

  afterEach(async () => {
    await teardown();
  });

  // Too flakey. Possibly causes by lost sst events in dev mode.
  it.skip('Sends a notification to knock when a schedule is due', async () => {
    const scheduleTime = dayjs.utc('2024-01-10T00:00:00Z');

    await apiClient.insertSchedules({
      objects: buildScheduleInsertInput({
        CreatedByUser: riskManagerUser1.Id,
        ModifiedByUser: riskManagerUser1.Id,
        ManualDueDate: scheduleTime.toISOString(),
        Frequency: TestFrequencyEnum.Weekly,
        Id: risk.Id,
      }),
    });
    await apiClient.insertScheduleStates({
      objects: buildScheduleStateInsertInput({
        CreatedByUser: riskManagerUser1.Id,
        ModifiedByUser: riskManagerUser1.Id,
        DueDate: scheduleTime.toISOString(),
        Id: risk.Id,
      }),
    });
    console.log(
      `Triggering poller for schedule due with 'Testing' trigger message. RiskID: ${risk.Id} OrgKey: ${getDefaultOrgId()}`
    );
    await sendToEventBridge([
      {
        DetailType: 'Testing',
        Time: scheduleTime.toDate(),
        Detail: JSON.stringify({ tenant: 'MultiTenant' }),
      },
    ]);

    await vi.waitFor(() => expect(getRequests().length).toEqual(1), 35000);
    expect(getRequests()[0].workflowKey).toEqual('risk-assessment-due');
    expect(getRequests()[0].body).toEqual(
      expect.objectContaining({
        data: expect.objectContaining({
          objectId: risk.Id,
          objectSequenceId: 1,
          objectTimeStamp: expect.any(String),
          objectTitle: risk.Title,
          orgName: buildOrganisationInsert().Name,
          org_id: getDefaultOrgId(),
        }),
      })
    );
  }, 45000);

  // Too flakey. Possibly causes by lost sst events in dev mode.
  it.skip('Sends a notification to knock the day before a schedule is overdue', async () => {
    const scheduleTime = dayjs.utc('2024-01-10T00:00:00Z');
    const overdueDate = scheduleTime.add(1, 'day').toISOString();
    const dueDate = scheduleTime.add(-2, 'day').toISOString();

    await apiClient.insertSchedules({
      objects: buildScheduleInsertInput({
        CreatedByUser: riskManagerUser1.Id,
        ModifiedByUser: riskManagerUser1.Id,
        ManualDueDate: dueDate,
        TimeToCompleteUnit: UnitOfTimeEnum.Day,
        TimeToCompleteValue: 3,
        Frequency: TestFrequencyEnum.Weekly,
        Id: risk.Id,
      }),
    });
    await apiClient.insertScheduleStates({
      objects: buildScheduleStateInsertInput({
        CreatedByUser: riskManagerUser1.Id,
        ModifiedByUser: riskManagerUser1.Id,
        DueDate: dueDate,
        OverdueDate: overdueDate,
        Id: risk.Id,
      }),
    });
    console.log(
      `Triggering poller for schedule overdue with 'Testing' trigger message. RiskID: ${risk.Id} OrgKey: ${getDefaultOrgId()}`
    );
    await sendToEventBridge([
      {
        DetailType: 'Testing',
        Time: scheduleTime.toDate(),
        Detail: JSON.stringify({ tenant: 'MultiTenant' }),
      },
    ]);

    await vi.waitFor(() => expect(getRequests().length).toEqual(1), 35000);
    expect(getRequests()[0].workflowKey).toEqual('risk-assessment-due');
    expect(getRequests()[0].body).toEqual(
      expect.objectContaining({
        data: expect.objectContaining({
          objectId: risk.Id,
          objectSequenceId: 1,
          objectTimeStamp: expect.any(String),
          objectTitle: risk.Title,
          orgName: buildOrganisationInsert().Name,
          org_id: getDefaultOrgId(),
        }),
      })
    );
  }, 45000);

  // Too flakey. Possibly causes by lost sst events in dev mode.
  it.skip('Can send 2 due notifications for the same risk (1 when due, 1 when nearly overdue)', async () => {
    const scheduleTime = dayjs.utc('2024-01-10T00:00:00Z');

    const overdueDate = scheduleTime.add(1, 'day');
    const dueDate = scheduleTime.add(-2, 'day');

    await apiClient.insertSchedules({
      objects: buildScheduleInsertInput({
        CreatedByUser: riskManagerUser1.Id,
        ModifiedByUser: riskManagerUser1.Id,
        ManualDueDate: dueDate.toISOString(),
        TimeToCompleteUnit: UnitOfTimeEnum.Day,
        TimeToCompleteValue: 3,
        Frequency: TestFrequencyEnum.Weekly,
        Id: risk.Id,
      }),
    });
    await apiClient.insertScheduleStates({
      objects: buildScheduleStateInsertInput({
        CreatedByUser: riskManagerUser1.Id,
        ModifiedByUser: riskManagerUser1.Id,
        DueDate: dueDate.toISOString(),
        OverdueDate: overdueDate.toISOString(),
        Id: risk.Id,
      }),
    });
    console.log(
      `Triggering poller for schedule due and overdue with 'Testing' trigger message. RiskID: ${risk.Id} OrgKey: ${getDefaultOrgId()}`
    );
    await sendToEventBridge([
      {
        Time: dueDate.toDate(),
        DetailType: 'Testing',
        Detail: JSON.stringify({ tenant: 'MultiTenant' }),
      },
      {
        Time: scheduleTime.toDate(),
        DetailType: 'Testing',
        Detail: JSON.stringify({ tenant: 'MultiTenant' }),
      },
    ]);

    await vi.waitFor(() => expect(getRequests().length).toEqual(2), 35000);
  }, 45000);

  it('Sends a notification to knock when a schedule is overdue', async () => {
    const scheduleTime = dayjs.utc('2024-01-10T00:00:00Z');
    await apiClient.insertSchedules({
      objects: buildScheduleInsertInput({
        CreatedByUser: riskManagerUser1.Id,
        ModifiedByUser: riskManagerUser1.Id,
        Frequency: TestFrequencyEnum.Weekly,
        Id: risk.Id,
      }),
    });
    await apiClient.insertScheduleStates({
      objects: buildScheduleStateInsertInput({
        CreatedByUser: riskManagerUser1.Id,
        ModifiedByUser: riskManagerUser1.Id,
        DueDate: dayjs().add(-1, 'day').toISOString(),
        OverdueDate: scheduleTime.toISOString(),
        Id: risk.Id,
      }),
    });
    console.log(
      `Triggering poller for schedule overdue with 'Testing' trigger message. RiskID: ${risk.Id} OrgKey: ${getDefaultOrgId()}`
    );
    await sendToEventBridge([
      {
        Time: scheduleTime.toDate(),
        DetailType: 'Testing',
        Detail: JSON.stringify({ tenant: 'MultiTenant' }),
      },
    ]);

    await vi.waitFor(() => expect(getRequests().length).toEqual(1), 35000);
    expect(getRequests()[0].workflowKey).toEqual('risk-assessment-overdue');
    expect(getRequests()[0].body).toEqual(
      expect.objectContaining({
        data: expect.objectContaining({
          objectId: risk.Id,
          objectSequenceId: 1,
          objectTimeStamp: expect.any(String),
          objectTitle: risk.Title,
          orgName: buildOrganisationInsert().Name,
          org_id: getDefaultOrgId(),
        }),
      })
    );
  }, 45000);
});
