import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('@risksmart-app/components/src/hooks/useRating', () => ({
  useRating: vi.fn(),
}));

vi.mock('src/pages/requests/config', () => ({
  useGetChangeRequestParentUrl: () => vi.fn(() => '/mock-url'),
}));

vi.mock('@/hooks/useChangeRequests', () => ({
  useChangeRequests: () => ({
    isActiveApprover: vi.fn(() => false),
  }),
}));

vi.mock('../useDashboardStore', () => ({
  useDashboardStore: vi.fn(),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      format: (_value: string, _format: string) => _value,
    },
  }),
}));

import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import type { GetMyDueItemsQuery } from '@risksmart-app/web-graphql-client/generated/graphql';

import { useDashboardStore } from '../useDashboardStore';
import { useGetMyOverdueItemsTableProps } from './config';

const mockUseRating = vi.mocked(useRating);
const mockUseDashboardStore = vi.mocked(useDashboardStore);

const NOW = new Date('2024-06-15T00:00:01.000Z');

const query = (): GetMyDueItemsQuery =>
  ({
    change_request: [],
    risk: [],
    action: [],
    assessment: [],
    control: [],
    indicator: [],
    issue: [],
    assessment_activity: [],
    attestation_record: [],
    document: [],
    obligation: [],
  }) as GetMyDueItemsQuery;

describe('My Items config', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
    vi.clearAllMocks();

    mockUseDashboardStore.mockReturnValue({
      myItemsFilters: {
        owner: true,
        contributor: false,
        groupOwner: false,
        groupContributor: false,
        inheritedOwner: false,
        inheritedContributor: false,
        inheritedGroupOwner: false,
        inheritedGroupContributor: false,
      },
      filters: {
        departments: [],
        tags: [],
        dateRange: null,
      },
      widgets: [],
      myItemsWidgets: [],
      selectedDashboard: 'my-items',
      setFilters: vi.fn(),
      setWidgets: vi.fn(),
      setMyItemsFilters: vi.fn(),
      setMyItemsWidgets: vi.fn(),
      setId: vi.fn(),
      setDashboardPreferences: vi.fn(),
      setSelectedDashboard: vi.fn(),
    });

    mockUseRating.mockReturnValue({
      options: [],
      getIndexByValue: vi.fn(),
      getOptionsByRatingKey: vi.fn(),
      getByValue: vi.fn((value) => ({
        value,
        label: value === 'overdue' ? 'Overdue' : 'Pending',
        color: value === 'overdue' ? 'red' : 'orange',
      })),
      getByValueAndRatingKey: vi.fn(),
      getByLabel: vi.fn(),
      getLabel: vi.fn(),
      getColorClass: vi.fn(),
      getByRange: vi.fn(),
      getLabelByIndex: vi.fn(),
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('risks', () => {
    it('should set status to pending when OverdueDate is not reached', () => {
      const data: GetMyDueItemsQuery = {
        ...query(),
        risk: [
          {
            __typename: 'risk',
            Id: 'risk-2',
            Title: 'Pending Risk',
            scheduleState: {
              __typename: 'schedule_state',
              DueDate: '2024-06-15T00:00:00.000Z',
              OverdueDate: '2024-06-16T00:00:00.000Z',
            },
            ownerGroups: [],
            contributorGroups: [],
          },
        ],
      };

      const { result } = renderHook(() => useGetMyOverdueItemsTableProps(data));

      const riskItem = result.current.data?.find(
        (item) => item.Id === 'risk-2'
      );
      expect(riskItem?.Status).toBe('pending');
    });

    it('should set status to overdue when OverdueDate is reached', () => {
      const data: GetMyDueItemsQuery = {
        ...query(),
        risk: [
          {
            __typename: 'risk',
            Id: 'risk-1',
            Title: 'Overdue Risk',
            scheduleState: {
              __typename: 'schedule_state',
              DueDate: '2024-06-14T00:00:00.000Z',
              OverdueDate: '2024-06-15T00:00:00.000Z',
            },
            ownerGroups: [],
            contributorGroups: [],
          },
        ],
      };

      const { result } = renderHook(() => useGetMyOverdueItemsTableProps(data));

      const riskItem = result.current.data?.find(
        (item) => item.Id === 'risk-1'
      );
      expect(riskItem?.Status).toBe('overdue');
    });
  });

  describe('controls', () => {
    it('should set status to pending when OverdueDate is not reached', () => {
      const data: GetMyDueItemsQuery = {
        ...query(),
        control: [
          {
            __typename: 'control',
            Id: 'control-2',
            Title: 'Pending Control',
            scheduleState: {
              __typename: 'schedule_state',
              DueDate: '2024-06-15T00:00:00.000Z',
              OverdueDate: '2024-06-16T00:00:00.000Z',
            },
            ownerGroups: [],
            contributorGroups: [],
          },
        ],
      };

      const { result } = renderHook(() => useGetMyOverdueItemsTableProps(data));

      const controlItem = result.current.data?.find(
        (item) => item.Id === 'control-2'
      );
      expect(controlItem?.Status).toBe('pending');
    });

    it('should set status to overdue when OverdueDate is reached', () => {
      const data: GetMyDueItemsQuery = {
        ...query(),
        control: [
          {
            __typename: 'control',
            Id: 'control-1',
            Title: 'Overdue Control',
            scheduleState: {
              __typename: 'schedule_state',
              DueDate: '2024-06-14T00:00:00.000Z',
              OverdueDate: '2024-06-15T00:00:00.000Z',
            },
            ownerGroups: [],
            contributorGroups: [],
          },
        ],
      };

      const { result } = renderHook(() => useGetMyOverdueItemsTableProps(data));

      const controlItem = result.current.data?.find(
        (item) => item.Id === 'control-1'
      );
      expect(controlItem?.Status).toBe('overdue');
    });
  });

  describe('issues', () => {
    it('should set status to pending when TargetCloseDate + 1 day is not reached', () => {
      const data: GetMyDueItemsQuery = {
        ...query(),
        issue: [
          {
            __typename: 'issue',
            Id: 'issue-2',
            Title: 'Pending Issue',
            assessment: {
              __typename: 'issue_assessment',
              TargetCloseDate: '2024-06-15T00:00:00.000Z',
              Status: null,
            },
            ownerGroups: [],
            contributorGroups: [],
          },
        ],
      };

      const { result } = renderHook(() => useGetMyOverdueItemsTableProps(data));

      const issueItem = result.current.data?.find(
        (item) => item.Id === 'issue-2'
      );
      expect(issueItem?.Status).toBe('pending');
    });

    it('should set status to overdue when TargetCloseDate + 1 day is reached', () => {
      const data: GetMyDueItemsQuery = {
        ...query(),
        issue: [
          {
            __typename: 'issue',
            Id: 'issue-1',
            Title: 'Overdue Issue',
            assessment: {
              __typename: 'issue_assessment',
              TargetCloseDate: '2024-06-14T00:00:00.000Z',
              Status: null,
            },
            ownerGroups: [],
            contributorGroups: [],
          },
        ],
      };

      const { result } = renderHook(() => useGetMyOverdueItemsTableProps(data));

      const issueItem = result.current.data?.find(
        (item) => item.Id === 'issue-1'
      );
      expect(issueItem?.Status).toBe('overdue');
    });
  });

  describe('obligations', () => {
    it('should set status to pending when OverdueDate is not reached', () => {
      const data: GetMyDueItemsQuery = {
        ...query(),
        obligation: [
          {
            __typename: 'obligation',
            Id: 'obligation-2',
            Title: 'Pending Obligation',
            scheduleState: {
              __typename: 'schedule_state',
              DueDate: '2024-06-15T00:00:00.000Z',
              OverdueDate: '2024-06-16T00:00:00.000Z',
            },
            ownerGroups: [],
            contributorGroups: [],
          },
        ],
      };

      const { result } = renderHook(() => useGetMyOverdueItemsTableProps(data));

      const obligationItem = result.current.data?.find(
        (item) => item.Id === 'obligation-2'
      );
      expect(obligationItem?.Status).toBe('pending');
    });

    it('should set status to overdue when OverdueDate is reached', () => {
      const data: GetMyDueItemsQuery = {
        ...query(),
        obligation: [
          {
            __typename: 'obligation',
            Id: 'obligation-1',
            Title: 'Overdue Obligation',
            scheduleState: {
              __typename: 'schedule_state',
              DueDate: '2024-06-14T00:00:00.000Z',
              OverdueDate: '2024-06-15T00:00:00.000Z',
            },
            ownerGroups: [],
            contributorGroups: [],
          },
        ],
      };

      const { result } = renderHook(() => useGetMyOverdueItemsTableProps(data));

      const obligationItem = result.current.data?.find(
        (item) => item.Id === 'obligation-1'
      );
      expect(obligationItem?.Status).toBe('overdue');
    });
  });
});
