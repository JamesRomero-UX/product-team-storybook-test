import createWrapper from '@risk-smart/themed-cloudscape-components/test-utils/dom';
import Table from '@risksmart-app/components/src/table';
import {
  Approval_Status_Enum,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { render } from '@testing-library/react';
import type { FC } from 'react';
import { mockedGetFormCustomisationResponse } from 'src/testing/mock-data/mockedGetFormCustomisationResponse';
import { mockedGetUserTablePreferences } from 'src/testing/mock-data/mockedGetUserTablePreferences';
import {
  getCellText,
  getDisplayOptionsText,
  getHeadersText,
  openPreferencesModals,
  toggleColumnVisibilityFromTable,
  waitForTableHeaders,
} from 'src/testing/tableHelpers';
import type { Providers } from 'src/testing/wrapper';
import { getWrapper } from 'src/testing/wrapper';
import { vi } from 'vitest';

import { defaultMocks } from '../../testing/mock-data';
import { useGetCollectionTableProps } from './config';
import type { DocumentFields } from './types';

describe('Policy config', () => {
  const mockDate = new Date(Date.UTC(2021, 0, 3, 0, 0, 0));

  beforeEach(() => {
    window.localStorage.clear();
    // mock time date.
    vi.setSystemTime(mockDate);
  });

  const defaultChangeRequest: DocumentFields['documentFiles'][number]['changeRequests'][number] =
    {
      ModifiedAtTimestamp: '2024-06-25T16:01:33.666141+00:00',
      ChangeRequestStatus: Approval_Status_Enum.Approved,
    };

  const defaultDocument: DocumentFields = {
    Id: '0d3a9abc-dd17-4036-ab52-47d13db75128',
    Title: 'Anti-Discrimination',
    DocumentType: 'policy',
    Purpose: 'Anti-Discrimination details',
    ParentDocument: null,
    CreatedByUser: 'auth0|644151efc3a961d2784456d9',
    ModifiedByUser: 'auth0|644151efc3a961d2784456d9',
    CreatedAtTimestamp: '2023-05-14T22:41:58.03502+00:00',
    ModifiedAtTimestamp: '2024-06-25T15:58:20.524706+00:00',
    CustomAttributeData: null,
    SequentialId: 1,
    parent: null,
    owners: [],
    ownerGroups: [],
    contributors: [],
    contributorGroups: [],
    modifiedByUser: {
      FriendlyName: 'RiskManager1',
      __typename: 'user',
    },
    createdByUser: {
      FriendlyName: 'RiskManager1',
      __typename: 'user',
    },
    tags: [],
    departments: [],
    documentFiles: [
      {
        Status: 'published',
        ReviewDate: null,
        NextReviewDate: null,
        changeRequests: [defaultChangeRequest],
        __typename: 'document_file',
      },
    ],
    latestPublishedVersion: [
      {
        PublishedDate: '2024-06-20T12:00:00+00:00',
        __typename: 'document_file',
      },
    ],
  };
  const providers: Providers[] = [
    'permission',
    'graphql',
    'router',
    'features',
    'trpc',
  ];

  const mocks = [
    ...defaultMocks,
    mockedGetFormCustomisationResponse([Parent_Type_Enum.Document]),
    mockedGetUserTablePreferences('policyRegister'),
  ];

  describe('useGetRegisterTableProps', () => {
    const TestHarness: FC<{ records: DocumentFields[] }> = ({ records }) => {
      const tableProps = useGetCollectionTableProps(records, []);

      return <Table {...tableProps} />;
    };

    it('should display 10 columns by default', async () => {
      const { container } = render(
        <TestHarness records={[defaultDocument]} />,
        {
          wrapper: getWrapper(mocks, ...providers),
        }
      );
      await waitForTableHeaders(container);
      const headers = createWrapper(container).findTable()?.findColumnHeaders();

      expect(headers?.length).toEqual(10);

      const headersText = getHeadersText(container);

      expect(headersText).toEqual([
        'Title',
        'Parent',
        'Type',
        'Owners',
        'Rating',
        'Version status',
        'Review status',
        'Tags',
        'Departments',
        'View Latest',
      ]);
    });

    it('should have the option to display 28 fields', async () => {
      const { container } = render(
        <TestHarness records={[defaultDocument]} />,
        {
          wrapper: getWrapper(mocks, ...providers),
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
      expect(options?.length).toEqual(28);

      const displayOptionLabels = getDisplayOptionsText(container);

      expect(displayOptionLabels).toEqual([
        'ID',
        'Title',
        'Parent',
        'Type',
        'Owners',
        'Contributors',
        'Rating',
        'Policy rating trend',
        'Version status',
        'Review status',
        'Last reviewed date',
        'Next review due',
        'Tags',
        'Departments',
        'Guid',
        'Created by',
        'Updated by',
        'Created on',
        'Updated on',
        'Created by ID',
        'Updated by ID',
        'View Latest',
        'Latest rating date',
        'Next test date',
        'Next test overdue',
        'Assessment frequency',
        'Last approved date',
        'Last published date',
      ]);
    });

    it('should show dash in "Review status" when no NextReviewDate', async () => {
      const { container } = render(
        <TestHarness records={[defaultDocument]} />,
        {
          wrapper: getWrapper(mocks, ...providers),
        }
      );
      await waitForTableHeaders(container);
      expect(getCellText(container, 'Review status', 1)).toEqual('–');
    });

    it('should show "Overdue" in "Review status" when NextReviewDate is in the past', async () => {
      const { container } = render(
        <TestHarness
          records={[
            {
              ...defaultDocument,
              documentFiles: [
                {
                  ...defaultDocument.documentFiles[0],
                  NextReviewDate: '2020-01-01T00:00:00+00:00',
                },
              ],
            },
          ]}
        />,
        {
          wrapper: getWrapper(mocks, ...providers),
        }
      );
      await waitForTableHeaders(container);
      expect(getCellText(container, 'Review status', 1)).toEqual('Overdue');
    });

    it('should show dash in "Review status" for archived policy regardless of review date', async () => {
      const { container } = render(
        <TestHarness
          records={[
            {
              ...defaultDocument,
              documentFiles: [
                {
                  ...defaultDocument.documentFiles[0],
                  Status: 'archived',
                  NextReviewDate: '2020-01-01T00:00:00+00:00',
                },
              ],
            },
          ]}
        />,
        {
          wrapper: getWrapper(mocks, ...providers),
        }
      );
      await waitForTableHeaders(container);
      expect(getCellText(container, 'Review status', 1)).toEqual('–');
    });

    it('should show "Due" in "Review status" when NextReviewDate is within 30 days', async () => {
      const { container } = render(
        <TestHarness
          records={[
            {
              ...defaultDocument,
              documentFiles: [
                {
                  ...defaultDocument.documentFiles[0],
                  NextReviewDate: '2021-01-10T00:00:00+00:00',
                },
              ],
            },
          ]}
        />,
        {
          wrapper: getWrapper(mocks, ...providers),
        }
      );
      await waitForTableHeaders(container);
      expect(getCellText(container, 'Review status', 1)).toEqual('Due');
    });

    it('should show "Not due" in "Review status" when NextReviewDate is more than 30 days away', async () => {
      const { container } = render(
        <TestHarness
          records={[
            {
              ...defaultDocument,
              documentFiles: [
                {
                  ...defaultDocument.documentFiles[0],
                  NextReviewDate: '2021-06-01T00:00:00+00:00',
                },
              ],
            },
          ]}
        />,
        {
          wrapper: getWrapper(mocks, ...providers),
        }
      );
      await waitForTableHeaders(container);
      expect(getCellText(container, 'Review status', 1)).toEqual('Not due');
    });

    // RSP-4701: Validate existing policies display correctly after status split
    // Tests the full matrix of version status × review status combinations
    describe('status split validation (RSP-4701)', () => {
      it.each([
        {
          scenario: 'Published + future review date',
          status: 'published',
          nextReviewDate: '2021-06-01T00:00:00+00:00',
          changeRequests: [],
          expectedVersionStatus: 'Published',
          expectedReviewStatus: 'Not due',
        },
        {
          scenario: 'Published + past review date',
          status: 'published',
          nextReviewDate: '2020-06-01T00:00:00+00:00',
          changeRequests: [],
          expectedVersionStatus: 'Published',
          expectedReviewStatus: 'Overdue',
        },
        {
          scenario: 'Published + review date within 30 days',
          status: 'published',
          nextReviewDate: '2021-01-20T00:00:00+00:00',
          changeRequests: [],
          expectedVersionStatus: 'Published',
          expectedReviewStatus: 'Due',
        },
        {
          scenario: 'Draft + no review date',
          status: 'draft',
          nextReviewDate: null,
          changeRequests: [],
          expectedVersionStatus: 'Draft',
          expectedReviewStatus: '–',
        },
        {
          scenario: 'Draft + future review date',
          status: 'draft',
          nextReviewDate: '2021-06-01T00:00:00+00:00',
          changeRequests: [],
          expectedVersionStatus: 'Draft',
          expectedReviewStatus: 'Not due',
        },
        {
          scenario: 'Draft + past review date',
          status: 'draft',
          nextReviewDate: '2020-06-01T00:00:00+00:00',
          changeRequests: [],
          expectedVersionStatus: 'Draft',
          expectedReviewStatus: 'Overdue',
        },
        {
          scenario: 'Archived + past review date',
          status: 'archived',
          nextReviewDate: '2020-06-01T00:00:00+00:00',
          changeRequests: [],
          expectedVersionStatus: 'Archived',
          expectedReviewStatus: '–',
        },
        {
          scenario: 'Archived + no review date',
          status: 'archived',
          nextReviewDate: null,
          changeRequests: [],
          expectedVersionStatus: 'Archived',
          expectedReviewStatus: '–',
        },
        {
          scenario: 'Pending approval + no review date',
          status: 'published',
          nextReviewDate: null,
          changeRequests: [
            {
              ModifiedAtTimestamp: '2024-06-25T16:01:33.666141+00:00',
              ChangeRequestStatus: Approval_Status_Enum.Pending,
            },
          ],
          expectedVersionStatus: 'Pending approval',
          expectedReviewStatus: '–',
        },
        {
          scenario: 'Pending approval + overdue review',
          status: 'published',
          nextReviewDate: '2020-06-01T00:00:00+00:00',
          changeRequests: [
            {
              ModifiedAtTimestamp: '2024-06-25T16:01:33.666141+00:00',
              ChangeRequestStatus: Approval_Status_Enum.Pending,
            },
          ],
          expectedVersionStatus: 'Pending approval',
          expectedReviewStatus: 'Overdue',
        },
        {
          scenario: 'Published + no review date',
          status: 'published',
          nextReviewDate: null,
          changeRequests: [],
          expectedVersionStatus: 'Published',
          expectedReviewStatus: '–',
        },
      ])(
        '$scenario → Version status "$expectedVersionStatus", Review status "$expectedReviewStatus"',
        async ({
          status,
          nextReviewDate,
          changeRequests,
          expectedVersionStatus,
          expectedReviewStatus,
        }) => {
          const { container } = render(
            <TestHarness
              records={[
                {
                  ...defaultDocument,
                  documentFiles: [
                    {
                      ...defaultDocument.documentFiles[0],
                      Status:
                        status as (typeof defaultDocument.documentFiles)[0]['Status'],
                      NextReviewDate: nextReviewDate,
                      changeRequests,
                    },
                  ],
                },
              ]}
            />,
            {
              wrapper: getWrapper(mocks, ...providers),
            }
          );
          await waitForTableHeaders(container);
          expect(getCellText(container, 'Version status', 1)).toEqual(
            expectedVersionStatus
          );
          expect(getCellText(container, 'Review status', 1)).toEqual(
            expectedReviewStatus
          );
        }
      );

      it('should show empty cells when policy has no versions', async () => {
        const { container } = render(
          <TestHarness
            records={[
              {
                ...defaultDocument,
                documentFiles: [],
              },
            ]}
          />,
          {
            wrapper: getWrapper(mocks, ...providers),
          }
        );
        await waitForTableHeaders(container);
        expect(getCellText(container, 'Version status', 1)).toEqual('–');
        expect(getCellText(container, 'Review status', 1)).toEqual('–');
      });
    });

    it('should "-" in the "Last approved date" when toggled on in preferences and no change requests', async () => {
      const lastApprovedDateColumn = 'Last approved date';
      const { container } = render(
        <TestHarness
          records={[
            {
              ...defaultDocument,
              documentFiles: [
                {
                  ...defaultDocument.documentFiles[0],
                  changeRequests: [],
                },
              ],
            },
          ]}
        />,
        {
          wrapper: getWrapper(mocks, ...providers),
        }
      );
      await waitForTableHeaders(container);
      toggleColumnVisibilityFromTable(container, lastApprovedDateColumn);
      expect(getCellText(container, lastApprovedDateColumn, 1)).toEqual('-');
    });

    it('should show "-" in the "Last approved date" when toggled on in preferences and only rejected changed requests', async () => {
      const lastApprovedDateColumn = 'Last approved date';
      const { container } = render(
        <TestHarness
          records={[
            {
              ...defaultDocument,
              documentFiles: [
                {
                  ...defaultDocument.documentFiles[0],
                  changeRequests: [
                    {
                      ...defaultChangeRequest,
                      ChangeRequestStatus: 'rejected',
                    },
                  ],
                },
              ],
            },
          ]}
        />,
        {
          wrapper: getWrapper(mocks, ...providers),
        }
      );
      await waitForTableHeaders(container);
      toggleColumnVisibilityFromTable(container, lastApprovedDateColumn);
      expect(getCellText(container, lastApprovedDateColumn, 1)).toEqual('-');
    });

    it('should displayed modified date of change request in the "Last approved date" when toggled on in preferences', async () => {
      const lastApprovedDateColumn = 'Last approved date';
      const { container } = render(
        <TestHarness records={[{ ...defaultDocument }]} />,
        {
          wrapper: getWrapper(mocks, ...providers),
        }
      );
      await waitForTableHeaders(container);
      toggleColumnVisibilityFromTable(container, lastApprovedDateColumn);
      expect(getCellText(container, lastApprovedDateColumn, 1)).toEqual(
        '25 Jun 2024'
      );
    });

    it('should show latest approved date in "Last approved date" when toggled on in preferences', async () => {
      const lastApprovedDateColumn = 'Last approved date';
      const { container } = render(
        <TestHarness
          records={[
            {
              ...defaultDocument,
              documentFiles: [
                {
                  ...defaultDocument.documentFiles[0],
                  changeRequests: [
                    {
                      ChangeRequestStatus: 'approved',
                      ModifiedAtTimestamp: '2024-06-01T15:58:20.524706+00:00',
                    },
                    {
                      ChangeRequestStatus: 'approved',
                      ModifiedAtTimestamp: '2024-06-06T15:58:20.524706+00:00',
                    },
                    {
                      ChangeRequestStatus: 'approved',
                      ModifiedAtTimestamp: '2024-06-03T15:58:20.524706+00:00',
                    },
                  ],
                },
              ],
            },
          ]}
        />,
        {
          wrapper: getWrapper(mocks, ...providers),
        }
      );
      await waitForTableHeaders(container);
      toggleColumnVisibilityFromTable(container, lastApprovedDateColumn);
      expect(getCellText(container, lastApprovedDateColumn, 1)).toEqual(
        '6 Jun 2024'
      );
    });
  });
});
