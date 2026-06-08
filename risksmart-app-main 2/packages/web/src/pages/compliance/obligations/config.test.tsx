import createWrapper from '@risk-smart/themed-cloudscape-components/test-utils/dom';
import Table from '@risksmart-app/components/src/table';
import type { Obligation_Assessment_Result } from '@risksmart-app/web-graphql-client/derived-types';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { render, waitFor } from '@testing-library/react';
import type { FC } from 'react';
import { mockedGetAggregationResponse } from 'src/testing/mock-data/mockedGetAggregationResponses';
import { mockedGetFormCustomisationResponse } from 'src/testing/mock-data/mockedGetFormCustomisationResponse';
import { mockedGetOrganisation } from 'src/testing/mock-data/mockedGetOrganisation';
import { mockedGetOrganisationModuleResponse } from 'src/testing/mock-data/mockedGetOrganisationModule';
import { mockedGetUserTablePreferences } from 'src/testing/mock-data/mockedGetUserTablePreferences';
import type { RecursivePartial } from 'src/testing/stub';
import {
  getCellText,
  getDisplayOptionsText,
  getHeadersText,
  openPreferencesModals,
  waitForTableHeaders,
} from 'src/testing/tableHelpers';
import type { Providers } from 'src/testing/wrapper';
import { getWrapper } from 'src/testing/wrapper';

import { defaultMocks } from '../../../testing/mock-data';
import { useGetCollectionTableProps } from './config';
import type { ObligationFields } from './types';

describe('obligation config', () => {
  const providers: Providers[] = [
    'permission',
    'graphql',
    'router',
    'features',
    'trpc',
  ];

  const TestHarness: FC<{
    records: ObligationFields[];
    latestAssessmentResults: Array<
      RecursivePartial<Obligation_Assessment_Result>
    >;
  }> = ({ records, latestAssessmentResults }) => {
    const tableProps = useGetCollectionTableProps(
      records,
      latestAssessmentResults
    );

    return <Table {...tableProps} />;
  };
  const defaultObligation: ObligationFields = {
    Adherence: 'mandatory',
    Description: 'General applications: who? what?',
    Id: 'bc02463e-ab36-4224-bad9-bda519df42b0',
    Interpretation: 'who and what',
    ParentId: 'cb030e81-9941-44e3-af98-4599e85201e0',
    Title: 'CASS 1.2',
    Type: 'rule',
    CustomAttributeData: null,
    SequentialId: 3,
    CreatedAtTimestamp: '2023-07-14T14:41:58.03502+00:00',
    CreatedByUser: 'auth0|644151efc3a961d2784456d9',
    ModifiedAtTimestamp: '2024-07-01T16:45:08.474526+00:00',
    ModifiedByUser: 'auth0|644152102c766a09dd585d2e',
    scheduleState: {
      DueDate: null,
      LatestDate: null,
    },
    schedule: {
      Id: 'bc02463e-ab36-4224-bad9-bda519df42b0',
      Frequency: null,
      TimeToCompleteUnit: null,
      TimeToCompleteValue: null,
    },
    CreatedBy: {
      FriendlyName: 'RiskManager1',
      __typename: 'user',
    },
    ModifiedBy: {
      FriendlyName: 'Standard1',
      __typename: 'user',
    },
    Parent: null,
    parentNode: {
      Id: 'cb030e81-9941-44e3-af98-4599e85201e0',
      ObjectType: 'obligation',
      SequentialId: 2,
      __typename: 'node',
    },
    owners: [],
    ownerGroups: [],
    contributors: [],
    contributorGroups: [],
    tags: [],
    departments: [],
    controls_aggregate: {
      aggregate: {
        count: 0,
        __typename: 'control_parent_aggregate_fields',
      },
      __typename: 'control_parent_aggregate',
    },
    BreachedIssues: [],
  };

  const buildObligation = (overrides: Partial<ObligationFields> = {}) => ({
    ...defaultObligation,
    ...overrides,
  });

  const testMocks = [
    ...defaultMocks,
    mockedGetFormCustomisationResponse([Parent_Type_Enum.Obligation]),
    mockedGetOrganisation(),
    mockedGetOrganisationModuleResponse(),
    mockedGetAggregationResponse(),
    mockedGetUserTablePreferences('obligationRegister'),
  ];

  describe('useGetCollectionTableProps', () => {
    it('should display 9 columns by default', async () => {
      const { container } = render(
        <TestHarness records={[]} latestAssessmentResults={[]} />,
        {
          wrapper: getWrapper(testMocks, ...providers),
        }
      );
      await waitForTableHeaders(container);
      const headers = createWrapper(container).findTable()?.findColumnHeaders();
      expect(headers?.length).toEqual(9);

      const headersText = getHeadersText(container);

      expect(headersText).toEqual([
        'Obligation title',
        'Parent',
        'Type',
        'Owners',
        'Rating',
        'Assessment status',
        'Controls',
        'Tags',
        'Departments',
      ]);
    });

    it('should have the option to display 22 fields', async () => {
      const { container } = render(
        <TestHarness records={[]} latestAssessmentResults={[]} />,
        {
          wrapper: getWrapper(testMocks, ...providers),
        }
      );
      await waitForTableHeaders(container);
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
      expect(options?.length).toEqual(23);

      const displayOptionLabels = getDisplayOptionsText(container);
      expect(displayOptionLabels).toEqual([
        'ID',
        'Obligation title',
        'Parent',
        'Type',
        'Owners',
        'Contributors',
        'Rating',
        'Assessment status',
        'Controls',
        'Breaches',
        'Tags',
        'Departments',
        'Created on',
        'Updated on',
        'Description',
        'Guid',
        'Created by',
        'Updated by',
        'Associated obligation ID',
        'Latest rating date',
        'Next test Date',
        'Assessment frequency',
        'Obligation rating trend',
      ]);
    });
  });

  it('should display the friendly id in the parent column if the user does not access access to the parent obligation', async () => {
    const { container } = render(
      <TestHarness
        records={[
          buildObligation({
            Parent: null,
            parentNode: {
              SequentialId: 33,
              Id: '123',
              ObjectType: Parent_Type_Enum.Obligation,
            },
          }),
        ]}
        latestAssessmentResults={[]}
      />,
      {
        wrapper: getWrapper(testMocks, ...providers),
      }
    );
    await waitForTableHeaders(container);
    expect(getCellText(container, 'Parent', 1)).toEqual('O-33');
  });

  it('should display "-" in parent column if obligation has no parent', async () => {
    const { container } = render(
      <TestHarness
        records={[
          buildObligation({
            Parent: null,
            parentNode: null,
          }),
        ]}
        latestAssessmentResults={[]}
      />,
      {
        wrapper: getWrapper(testMocks, ...providers),
      }
    );
    await waitFor(() => createWrapper(container).findTable());
    await waitFor(() =>
      createWrapper(container).findTable()?.findColumnHeaders()
    );
    expect(getCellText(container, 'Parent', 1)).toEqual('-');
  });
  it('should display "Unrated" in rating column if obligation has no assessment result', async () => {
    const { container } = render(
      <TestHarness
        records={[buildObligation()]}
        latestAssessmentResults={[]}
      />,
      {
        wrapper: getWrapper(testMocks, ...providers),
      }
    );
    await waitForTableHeaders(container);
    expect(getCellText(container, 'Rating', 1)).toEqual('Unrated');
  });
  it('should display the correct value in rating column', async () => {
    const testObligation = buildObligation();
    const { container } = render(
      <TestHarness
        records={[testObligation]}
        latestAssessmentResults={[
          {
            Rating: 3,
            parents: [{ ParentId: testObligation.Id }],
          },
        ]}
      />,
      {
        wrapper: getWrapper(testMocks, ...providers),
      }
    );
    await waitForTableHeaders(container);
    expect(getCellText(container, 'Rating', 1)).toEqual('Compliant');
  });
});
