import type { StoredWidgetPlacement } from './types';

export const defaultOverallDashboardLayout: StoredWidgetPlacement[] = [
  {
    id: '508e4c08-ed22-4fd3-aa1e-8656bfb4aaaf',
    widgetType: 'overdueActions',
    rowSpan: 2,
    columnSpan: 1,
  },
  {
    id: '8f19cfb5-4163-4717-a3e2-f4f4343bac10',
    widgetType: 'openIssues',
    rowSpan: 2,
    columnSpan: 1,
  },
  {
    id: '008618da-d2a8-4118-aa05-c2989184b48d',
    widgetType: 'oldestOpenIssue',
    rowSpan: 2,
    columnSpan: 1,
  },
  {
    id: '2255ca2e-d840-44dd-b9d1-8f28ac72b0aa',
    widgetType: 'averageTimeToResolve',
    rowSpan: 2,
    columnSpan: 1,
  },
  {
    id: '574f7ba5-9f6d-4a1a-8045-d1dcb5806b5e',
    widgetType: 'openIssuesOverTime',
    rowSpan: 4,
    columnSpan: 2,
  },
  {
    id: '2d73997a-5a9f-47b8-a5ff-29cb4bf08a1d',
    widgetType: 'controlEffectiveness',
    rowSpan: 4,
    columnSpan: 2,
  },
  {
    id: '7c9472df-90b4-4a9c-9629-a2e3953f8545',
    widgetType: 'openIssueSeverity',
    rowSpan: 4,
    columnSpan: 2,
  },
  {
    id: 'ea7214d8-a5bb-42a5-9bb5-eb4d43dcc1d4',
    widgetType: 'controlledRiskHeatMap',
    rowSpan: 4,
    columnSpan: 2,
  },
];

export const defaultMyItemsDashboardLayout: StoredWidgetPlacement[] = [
  {
    id: '5ba1e00b-7987-4f86-a824-7c9dfbba2fc1',
    widgetType: 'myOverdueItems7Days',
    rowSpan: 4,
    columnSpan: 2,
  },
  {
    id: '1a968590-e8cb-42db-9895-4d7e00a93636',
    widgetType: 'myOverdueItems30Days',
    rowSpan: 4,
    columnSpan: 2,
  },
];
