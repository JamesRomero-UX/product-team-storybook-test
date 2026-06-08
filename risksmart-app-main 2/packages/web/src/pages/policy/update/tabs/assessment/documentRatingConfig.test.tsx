import createWrapper from '@risk-smart/themed-cloudscape-components/test-utils/dom';
import Table from '@risksmart-app/components/src/table';
import {
  Assessment_Status_Enum,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { render } from '@testing-library/react';
import type { FC } from 'react';
import { mockedDepartmentsResponse } from 'src/testing/mock-data/mockedDepartmentTypeResponses';
import { mockedGetAggregationResponse } from 'src/testing/mock-data/mockedGetAggregationResponses';
import { mockedGetFormCustomisationResponse } from 'src/testing/mock-data/mockedGetFormCustomisationResponse';
import { mockedGetOrganisation } from 'src/testing/mock-data/mockedGetOrganisation';
import { mockedGetOrganisationModuleResponse } from 'src/testing/mock-data/mockedGetOrganisationModule';
import { mockedRoleAccessResponse } from 'src/testing/mock-data/mockedGetRoleAccessResponse';
import { mockedTagsResponse } from 'src/testing/mock-data/mockedTagTypeResponses';
import { mockedUserGroupResponse } from 'src/testing/mock-data/mockedUserGroupResponses';
import { mockedUsersResponse } from 'src/testing/mock-data/mockedUserResponses';
import {
  getDisplayOptionsText,
  getHeadersText,
  openPreferencesModals,
  waitForTableHeaders,
} from 'src/testing/tableHelpers';

import type { Providers } from '../../../../../testing/wrapper';
import { getWrapper } from '../../../../../testing/wrapper';
import { useGetCollectionTableProps } from './documentRatingConfig';
import type { DocumentAssessmentResultFlatFields } from './types';

describe('rating result config', () => {
  const TestHarness: FC<{
    records: DocumentAssessmentResultFlatFields[];
  }> = ({ records }) => {
    const tableProps = useGetCollectionTableProps(
      {
        Id: '',
        ancestorContributors: [],
      },
      records,
      () => ({}),
      () => ({})
    );

    return <Table {...tableProps} />;
  };
  const providers: Providers[] = [
    'permission',
    'graphql',
    'router',
    'features',
    'trpc',
  ];

  const defaultMocks = [
    mockedGetOrganisation(),
    mockedUserGroupResponse(),
    mockedUsersResponse(),
    mockedDepartmentsResponse,
    mockedTagsResponse,
    mockedRoleAccessResponse(),
    mockedGetAggregationResponse(),
    mockedGetOrganisationModuleResponse(),
    mockedGetFormCustomisationResponse([
      Parent_Type_Enum.DocumentAssessmentResult,
      Parent_Type_Enum.Assessment,
    ]),
  ];

  describe('useGetCollectionTableProps', () => {
    it('should display 6 columns by default', async () => {
      const { container } = render(
        <TestHarness
          records={[
            {
              Id: '1',
              parents: [],
              files: [],
            },
            {
              Id: '1',
              parents: [
                {
                  assessment: {
                    CreatedAtTimestamp: '',
                    CreatedByUser: '',
                    Id: '',
                    ModifiedAtTimestamp: '',
                    ModifiedByUser: '',
                    Summary: '',
                    Title: '',
                    Status: Assessment_Status_Enum.Complete,
                  },
                },
              ],
              files: [],
            },
          ]}
        />,
        {
          wrapper: getWrapper(defaultMocks, ...providers),
        }
      );
      await waitForTableHeaders(container);
      const headers = createWrapper(container).findTable()?.findColumnHeaders();
      expect(headers?.length).toEqual(6);

      const headersText = getHeadersText(container);
      expect(headersText).toEqual([
        'Result date',
        'Title (assessment)',
        'Rating',
        'Status',
        'Completion date (assessment)',
        'Next assessment date (assessment)',
      ]);
    });

    it('should have the option to display 6 fields', async () => {
      const { container } = render(
        <TestHarness
          records={[
            {
              Id: '1',
              parents: [],
              files: [],
            },
          ]}
        />,
        {
          wrapper: getWrapper(defaultMocks, ...providers),
        }
      );
      await waitForTableHeaders(container);
      const preferences = createWrapper(container)
        .findTable()
        ?.findCollectionPreferences();
      openPreferencesModals(container);

      const options = preferences
        ?.findModal()
        ?.findContentDisplayPreference()
        ?.findOptions();
      expect(options?.length).toEqual(6);

      const displayOptionLabels = getDisplayOptionsText(container);
      expect(displayOptionLabels).toEqual([
        'Result date',
        'Title (assessment)',
        'Rating',
        'Status',
        'Completion date (assessment)',
        'Next assessment date (assessment)',
      ]);
    });
  });
});
