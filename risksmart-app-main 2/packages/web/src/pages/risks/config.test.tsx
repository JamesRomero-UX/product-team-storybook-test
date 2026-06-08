import createWrapper from '@risk-smart/themed-cloudscape-components/test-utils/dom';
import Table from '@risksmart-app/components/src/table';
import type { GetAppetitesGroupedByImpactQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import {
  Appetite_Type_Enum,
  Parent_Type_Enum,
  Test_Frequency_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { render, waitFor } from '@testing-library/react';
import { when } from 'jest-when';
import type { FC } from 'react';
import { mockedGetAggregationResponse } from 'src/testing/mock-data/mockedGetAggregationResponses';
import { mockedGetFormCustomisationResponse } from 'src/testing/mock-data/mockedGetFormCustomisationResponse';
import { mockedGetOrganisation } from 'src/testing/mock-data/mockedGetOrganisation';
import { mockedGetOrganisationModuleResponse } from 'src/testing/mock-data/mockedGetOrganisationModule';
import { mockedGetUserTablePreferences } from 'src/testing/mock-data/mockedGetUserTablePreferences';
import {
  getCellText,
  getDisplayOptionsText,
  getHeadersText,
  openPreferencesModals,
  toggleColumnVisibilityFromTable,
} from 'src/testing/tableHelpers';
import type { Providers } from 'src/testing/wrapper';
import { getWrapper } from 'src/testing/wrapper';
import { vi } from 'vitest';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';
import { useIsModuleEnabled } from '@/hooks/useIsModuleEnabled';

import { defaultMocks } from '../../testing/mock-data';
import { buildRisk } from '../../testing/test-data/riskFields';
import { useGetCollectionTableProps } from './config';
import type { RiskFields } from './types';

vi.mock('@/hooks/useIsModuleEnabled');
vi.mock('@/hooks/useIsFeatureFlagEnabled');

const useIsModuleEnabledMock = vi.mocked(useIsModuleEnabled);
const useIsFeatureFlagEnabledMock = vi.mocked(useIsFeatureFlagEnabled);

describe('risk config', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.resetAllMocks();
  });

  const providers: Providers[] = [
    'graphql',
    'router',
    'permission',
    'features',
    'trpc',
  ];

  const TestHarness: FC<{
    records: RiskFields[];
    impactAppetites?: GetAppetitesGroupedByImpactQuery['impact'];
  }> = ({ records, impactAppetites }) => {
    const tableProps = useGetCollectionTableProps(
      records,
      [],
      impactAppetites ?? []
    );

    return <Table {...tableProps} />;
  };

  const testMocks = [
    ...defaultMocks,
    mockedGetFormCustomisationResponse([Parent_Type_Enum.Risk]),
    mockedGetOrganisation(),
    mockedGetOrganisationModuleResponse(),
    mockedGetAggregationResponse(),
    mockedGetUserTablePreferences('riskRegister'),
    mockedGetFormCustomisationResponse([Parent_Type_Enum.Risk]),
    mockedGetFormCustomisationResponse([
      Parent_Type_Enum.UncontrolledRiskAssessmentResult,
      Parent_Type_Enum.ControlledRiskAssessmentResult,
    ]),
    mockedGetFormCustomisationResponse([
      Parent_Type_Enum.UncontrolledRiskAssessmentResult,
      Parent_Type_Enum.ControlledRiskAssessmentResult,
    ]),
  ];

  describe('useGetCollectionTableProps', () => {
    it('should display 8 columns by default', async () => {
      const { container } = render(<TestHarness records={[]} />, {
        wrapper: getWrapper(testMocks, ...providers),
      });
      await waitFor(() => createWrapper(container).findTable());
      await waitFor(() =>
        createWrapper(container).findTable()?.findColumnHeaders()
      );
      const headers = createWrapper(container).findTable()?.findColumnHeaders();
      expect(headers?.length).toEqual(8);

      const headersText = getHeadersText(container);

      expect(headersText).toEqual([
        'Risk name',
        'Parent risk',
        'Risk tier',
        'Owners',
        'Inherent rating',
        'Residual rating',
        'Linked controls',
        'Tags',
      ]);
    });

    it('should display 6 columns by default when impacts is enabled', async () => {
      when(useIsModuleEnabledMock)
        .calledWith('risk.subModules.impact')
        .mockReturnValue(true);

      const { container } = render(<TestHarness records={[]} />, {
        wrapper: getWrapper(testMocks, ...providers),
      });

      await waitFor(() => createWrapper(container).findTable());
      await waitFor(() =>
        createWrapper(container).findTable()?.findColumnHeaders()
      );
      const headers = createWrapper(container).findTable()?.findColumnHeaders();
      expect(headers?.length).toEqual(6);

      const headersText = getHeadersText(container);

      expect(headersText).toEqual([
        'Risk name',
        'Parent risk',
        'Risk tier',
        'Owners',
        'Linked controls',
        'Tags',
      ]);
    });

    it('should have the option to display 41 fields', async () => {
      const { container } = render(<TestHarness records={[]} />, {
        wrapper: getWrapper(testMocks, ...providers),
      });
      await waitFor(() => createWrapper(container).findTable());
      await waitFor(() =>
        createWrapper(container).findTable()?.findCollectionPreferences()
      );
      const preferences = createWrapper(container)
        .findTable()
        ?.findCollectionPreferences();
      openPreferencesModals(container);

      const options = preferences
        ?.findModal()
        ?.findContentDisplayPreference()
        ?.findOptions();
      expect(options?.length).toEqual(44);

      const displayOptionLabels = getDisplayOptionsText(container);
      expect(displayOptionLabels).toEqual([
        'ID',
        'Risk name',
        'Parent risk',
        'Risk tier',
        'Risk treatment',
        'Risk status',
        'Owners',
        'Contributors',
        'Inherent risk rating trend',
        'Residual risk rating trend',
        'Inherent rating history',
        'Residual rating history',
        'Inherent rating',
        'Residual rating',
        'Inherent score',
        'Residual score',
        'Linked controls',
        'Linked actions',
        'Residual likelihood',
        'Residual likelihood score',
        'Residual impact',
        'Residual impact score',
        'Inherent impact',
        'Inherent impact score',
        'Inherent likelihood',
        'Inherent likelihood score',
        'Lower appetite',
        'Upper appetite',
        'Appetite performance',
        'Tags',
        'Departments',
        'Created on',
        'Updated on',
        'Risk description',
        'Guid',
        'Created by ID',
        'Associated risk ID',
        'Created by',
        'Latest rating date',
        'Next test date',
        'Next test overdue',
        'Test schedule status',
        'Assessment frequency',
        'Linked indicators',
      ]);
    });
  });

  it('should have the option to display 27 fields when impacts feature is enabled', async () => {
    when(useIsModuleEnabledMock)
      .calledWith('risk.subModules.impact')
      .mockReturnValue(true);

    const { container } = render(<TestHarness records={[]} />, {
      wrapper: getWrapper(
        testMocks,
        'graphql',
        'router',
        'permission',
        'features',
        'trpc'
      ),
    });
    await waitFor(() => createWrapper(container).findTable());
    await waitFor(() =>
      createWrapper(container).findTable()?.findCollectionPreferences()
    );
    const preferences = createWrapper(container)
      .findTable()
      ?.findCollectionPreferences();
    openPreferencesModals(container);

    const options = preferences
      ?.findModal()
      ?.findContentDisplayPreference()
      ?.findOptions();
    expect(options?.length).toEqual(30);

    const displayOptionLabels = getDisplayOptionsText(container);

    expect(displayOptionLabels).toEqual([
      'ID',
      'Risk name',
      'Parent risk',
      'Risk tier',
      'Risk treatment',
      'Risk status',
      'Owners',
      'Contributors',
      'Inherent risk rating trend',
      'Residual risk rating trend',
      'Linked controls',
      'Linked actions',
      'Impact performance',
      'Lower appetite',
      'Upper appetite',
      'Tags',
      'Departments',
      'Created on',
      'Updated on',
      'Risk description',
      'Guid',
      'Created by ID',
      'Associated risk ID',
      'Created by',
      'Latest rating date',
      'Next test date',
      'Next test overdue',
      'Test schedule status',
      'Assessment frequency',
      'Linked indicators',
    ]);
  });

  it('should not show Upper and Lower Appetite, and instead show Posture when the posture feature flag is set to true', async () => {
    when(useIsFeatureFlagEnabledMock)
      .calledWith('posture')
      .mockReturnValue(true);

    const { container } = render(<TestHarness records={[]} />, {
      wrapper: getWrapper(testMocks, ...providers),
    });
    await waitFor(() => createWrapper(container).findTable());
    await waitFor(() =>
      createWrapper(container).findTable()?.findCollectionPreferences()
    );
    const preferences = createWrapper(container)
      .findTable()
      ?.findCollectionPreferences();
    openPreferencesModals(container);

    const options = preferences
      ?.findModal()
      ?.findContentDisplayPreference()
      ?.findOptions();
    expect(options?.length).toEqual(43);

    const displayOptionLabels = getDisplayOptionsText(container);
    expect(displayOptionLabels).not.toContain('Lower appetite');
    expect(displayOptionLabels).not.toContain('Upper appetite');
    expect(displayOptionLabels).toContain('Posture');
  });

  it('should display the risk name in the parent risk column', async () => {
    const { container } = render(
      <TestHarness
        records={[
          buildRisk({
            parent: {
              Title: 'My parent risk',
            },
          }),
        ]}
      />,
      {
        wrapper: getWrapper(
          testMocks,
          'graphql',
          'router',
          'permission',
          'features',
          'trpc'
        ),
      }
    );
    await waitFor(() => createWrapper(container).findTable());
    await waitFor(() =>
      createWrapper(container).findTable()?.findColumnHeaders()
    );
    expect(getCellText(container, 'Parent risk', 1)).toEqual('My parent risk');
  });

  it('should show Entity and Enterprise Risk fields, when enterprise risk feature flag is set to true', async () => {
    when(useIsModuleEnabledMock)
      .calledWith('enterprise_risk')
      .mockReturnValue(true);

    const { container } = render(<TestHarness records={[]} />, {
      wrapper: getWrapper(testMocks, ...providers),
    });
    await waitFor(() => createWrapper(container).findTable());
    await waitFor(() =>
      createWrapper(container).findTable()?.findCollectionPreferences()
    );
    const preferences = createWrapper(container)
      .findTable()
      ?.findCollectionPreferences();
    openPreferencesModals(container);

    const options = preferences
      ?.findModal()
      ?.findContentDisplayPreference()
      ?.findOptions();
    expect(options?.length).toEqual(46);

    const displayOptionLabels = getDisplayOptionsText(container);
    expect(displayOptionLabels).toContain('Entity');
    expect(displayOptionLabels).toContain('Enterprise risk');
  });

  it('should display the friendly id in the parent risk column if the user does not access access to the parent risk', async () => {
    const { container } = render(
      <TestHarness
        records={[
          buildRisk({
            parent: null,
            parentNode: {
              SequentialId: 33,
              Id: '123',
              ObjectType: Parent_Type_Enum.Risk,
            },
          }),
        ]}
      />,
      {
        wrapper: getWrapper(testMocks, ...providers),
      }
    );
    await waitFor(() => createWrapper(container).findTable());
    await waitFor(() =>
      createWrapper(container).findTable()?.findColumnHeaders()
    );
    expect(getCellText(container, 'Parent risk', 1)).toEqual('R-33');
  });

  it('should display nothing in parent risk column if risk has no parent', async () => {
    const { container } = render(
      <TestHarness
        records={[
          buildRisk({
            parent: null,
            parentNode: null,
          }),
        ]}
      />,
      {
        wrapper: getWrapper(testMocks, ...providers),
      }
    );
    await waitFor(() => createWrapper(container).findTable());
    await waitFor(() =>
      createWrapper(container).findTable()?.findColumnHeaders()
    );
    expect(getCellText(container, 'Parent risk', 1)).toEqual('None');
  });

  it.each([
    {
      value: 'My Description',
      expected: 'My Description',
    },
    {
      value: null,
      expected: '-',
    },
  ])(
    'should display $expected in "Risk description" column when description is $value',
    async ({ value, expected }) => {
      const { container } = render(
        <TestHarness
          records={[
            buildRisk({
              Description: value,
            }),
          ]}
        />,
        {
          wrapper: getWrapper(testMocks, ...providers),
        }
      );
      await waitFor(() => createWrapper(container).findTable());
      await waitFor(() =>
        createWrapper(container).findTable()?.findColumnHeaders()
      );
      toggleColumnVisibilityFromTable(container, 'Risk description');
      expect(getCellText(container, 'Risk description', 1)).toEqual(expected);
    }
  );

  it.each([
    {
      value: Test_Frequency_Enum.Monthly,
      expected: 'Monthly',
    },
    {
      value: null,
      expected: '-',
    },
  ])(
    'should display $expected in "Assessment frequency" column when description is $value',
    async ({ value, expected }) => {
      const { container } = render(
        <TestHarness
          records={[
            buildRisk({
              schedule: {
                Id: '123',
                Frequency: value,
              },
            }),
          ]}
        />,
        {
          wrapper: getWrapper(testMocks, ...providers),
        }
      );
      await waitFor(() => createWrapper(container).findTable());
      await waitFor(() =>
        createWrapper(container).findTable()?.findColumnHeaders()
      );

      toggleColumnVisibilityFromTable(container, 'Assessment frequency');
      expect(getCellText(container, 'Assessment frequency', 1)).toEqual(
        expected
      );
    }
  );

  it('should display - in "Impact performance" column when there are no impact ratings', async () => {
    when(useIsModuleEnabledMock)
      .calledWith('risk.subModules.impact')
      .mockReturnValue(true);
    const { container } = render(
      <TestHarness
        records={[
          buildRisk({
            impactRatings: [],
          }),
        ]}
      />,
      {
        wrapper: getWrapper(testMocks, ...providers),
      }
    );
    await waitFor(() => createWrapper(container).findTable());
    await waitFor(() =>
      createWrapper(container).findTable()?.findColumnHeaders()
    );

    toggleColumnVisibilityFromTable(container, 'Impact performance');
    expect(getCellText(container, 'Impact performance', 1)).toEqual('-');
  });

  it('should display the (impact appetite - impact rating) in "Impact performance" column when there is a single impact rating for the risk', async () => {
    when(useIsModuleEnabledMock)
      .calledWith('risk.subModules.impact')
      .mockReturnValue(true);
    const impactId = '1234567j8';
    const riskId = '93535';
    const { container } = render(
      <TestHarness
        records={[
          buildRisk({
            Id: riskId,
            impactRatings: [
              {
                Rating: 4,
                ImpactId: impactId,
              },
            ],
          }),
        ]}
        impactAppetites={[
          {
            Id: impactId,
            appetites: [
              {
                SequentialId: 1,
                ImpactAppetite: 2,
                parents: [
                  {
                    risk: { Id: riskId },
                  },
                ],
                Id: '234',
                AppetiteType: Appetite_Type_Enum.Risk,
                CreatedAtTimestamp: '',
                ModifiedAtTimestamp: '',
                ModifiedByUser: '',
              },
            ],
          },
        ]}
      />,
      {
        wrapper: getWrapper(testMocks, ...providers),
      }
    );
    await waitFor(() => createWrapper(container).findTable());
    await waitFor(() =>
      createWrapper(container).findTable()?.findColumnHeaders()
    );

    toggleColumnVisibilityFromTable(container, 'Impact performance');
    expect(getCellText(container, 'Impact performance', 1)).toEqual('-2');
  });
});
