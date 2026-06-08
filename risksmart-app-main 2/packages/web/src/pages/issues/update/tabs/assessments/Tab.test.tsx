import type { Auth0ContextInterface } from '@auth0/auth0-react';
import type { RisksmartUser } from '@risksmart-app/components/src/hooks/useRisksmartUser';
import useRisksmartUser from '@risksmart-app/components/src/hooks/useRisksmartUser';
import { useGetGuidParam } from '@risksmart-app/components/src/routes/routes.utils';
import {
  Approval_Status_Enum,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { render, screen, waitFor } from '@testing-library/react';
import { when } from 'jest-when';
import { act } from 'react';
import { useHasPermissionQuery } from 'src/rbac/useHasPermission';
import { mockedDepartmentsResponse } from 'src/testing/mock-data/mockedDepartmentTypeResponses';
import { mockedGetChangeRequestByParentIdSubscription } from 'src/testing/mock-data/mockedGetChangeRequestByParentIdSubscription';
import { mockedGetControlsBasicResponse } from 'src/testing/mock-data/mockedGetControlsBasicResponse';
import { mockedGetDocumentListResponse } from 'src/testing/mock-data/mockedGetDocumentsListResponse';
import { mockedGetFormCustomisationResponse } from 'src/testing/mock-data/mockedGetFormCustomisationResponse';
import { mockedGetIssueAssessmentByIdResponse } from 'src/testing/mock-data/mockedGetIssueAssessmentByParentIdResponse';
import { mockedGetLivePendingChangeRequestsSubscription } from 'src/testing/mock-data/mockedGetLivePendingChangeRequestsSubscription';
import { mockedGetObligationListResponse } from 'src/testing/mock-data/mockedGetObligationListResponse';
import { mockedGetOrganisation } from 'src/testing/mock-data/mockedGetOrganisation';
import { mockedGetOrganisationModuleResponse } from 'src/testing/mock-data/mockedGetOrganisationModule';
import { mockedGetPendingChangeRequests } from 'src/testing/mock-data/mockedGetPendingChangeRequestsResponse';
import { mockedRoleAccessResponse } from 'src/testing/mock-data/mockedGetRoleAccessResponse';
import { mockedTagsResponse } from 'src/testing/mock-data/mockedTagTypeResponses';
import { mockedUserGroupResponse } from 'src/testing/mock-data/mockedUserGroupResponses';
import { mockedUsersResponse } from 'src/testing/mock-data/mockedUserResponses';
import { mockedUserSearchPreferencesResponses } from 'src/testing/mock-data/mockedUserSearchPreferencesResponses';
import { stub } from 'src/testing/stub';
import { buildIssueAssessmentRequestedChanges } from 'src/testing/test-data/issueAssessmentRequestedChanges';
import { buildIssueFlatField } from 'src/testing/test-data/issueFlatField';
import { getWrapper } from 'src/testing/wrapper';
import { vi } from 'vitest';

import { useIsModuleEnabled } from '@/hooks/useIsModuleEnabled';

import Tab from './Tab';

vi.mock('@risksmart-app/components/src/routes/routes.utils');
vi.mock('@risksmart-app/components/src/hooks/useRisksmartUser');
vi.mock('src/rbac/useHasPermission');
vi.mock('@/hooks/useIsModuleEnabled');

const useIsModuleEnabledMock = vi.mocked(useIsModuleEnabled);
const mockedUseGetGuidParam = vi.mocked(useGetGuidParam);
const userMock = vi.mocked(useRisksmartUser);
const mockedUseHasPermission = vi.mocked(useHasPermissionQuery);

describe('Issue Assessment Tab', () => {
  const ISSUE_ID = 'a803ea8d-fa58-4757-b6c8-d5e40855251c';
  const issue = {
    ...buildIssueFlatField(),
    files: [],
    ancestorContributors: [],
  };

  const mockedResponses = [
    mockedGetObligationListResponse({}),
    mockedGetDocumentListResponse({}),
    mockedGetIssueAssessmentByIdResponse({ parentIssueId: ISSUE_ID }),
    mockedGetOrganisationModuleResponse(),
    mockedGetControlsBasicResponse,
    mockedGetOrganisation(),
    mockedRoleAccessResponse(),
    mockedUserGroupResponse(),
    mockedUsersResponse(),
    mockedUserSearchPreferencesResponses(),
    mockedDepartmentsResponse,
    mockedTagsResponse,
    mockedGetChangeRequestByParentIdSubscription(ISSUE_ID),
    mockedGetPendingChangeRequests(
      { ParentId: ISSUE_ID },
      {
        change_request: [
          {
            Id: 'change-request-id-1',
            SequentialId: 1,
            Type: 'Change Request',
            CreatedAtTimestamp: '2021-08-02T14:00:00Z',
            ModifiedAtTimestamp: '2021-08-02T14:00:00Z',
            ParentId: ISSUE_ID,
            Comment: '',
            contributors: [],
            requestedFileChanges: [],
            responses: [],
            ChangeRequestStatus: Approval_Status_Enum.Pending,
          },
        ],
      }
    ),
    mockedGetFormCustomisationResponse([Parent_Type_Enum.IssueAssessment]),
  ];

  beforeEach(() => {
    when(mockedUseGetGuidParam).calledWith('issueId').mockReturnValue(ISSUE_ID);
    userMock.mockReturnValue(
      stub<Auth0ContextInterface<RisksmartUser>>({
        user: { userId: '1' } as RisksmartUser,
        isLoading: false,
      })
    );
    when(mockedUseHasPermission)
      .calledWith('update:issue_assessment', issue)
      .mockReturnValue({ hasPermission: true, loading: false });
    when(mockedUseHasPermission)
      .calledWith('insert:issue_assessment', issue)
      .mockReturnValue({ hasPermission: true, loading: false });
    when(mockedUseHasPermission)
      .calledWith('update:custom_attribute_schema')
      .mockReturnValue({ hasPermission: true, loading: false });
    when(useIsModuleEnabledMock).calledWith('obligation').mockReturnValue(true);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('Renders the Tab component', async () => {
    const issue = {
      ...buildIssueFlatField(),
      files: [],
      ancestorContributors: [],
    };
    render(<Tab issue={issue} type={'issue'} />, {
      wrapper: getWrapper(
        [
          ...mockedResponses,
          mockedGetLivePendingChangeRequestsSubscription('update', ISSUE_ID),
        ],
        'graphql',
        'i18n',
        'router',
        'permission',
        'help',
        'features',
        'trpc'
      ),
    });

    await waitFor(
      () => expect(screen.queryByText('Assessment')).toBeInTheDocument(),
      {
        timeout: 10000,
      }
    );
  });
  it.each([
    {
      requestedChanges: {
        ...buildIssueAssessmentRequestedChanges({
          ActualCloseDate: 'Not 2023-05-14T22:41:58.03502+00:00',
          CertifiedIndividual: 'Not auth0|644151efc3a961d2784456d9',
          IssueCausedBySystemIssue: true,
          IssueCausedByThirdParty: true,
          IssueType: 'material-impact',
          PoliciesBreached: 'Not Policies breached',
          PolicyBreach: true,
          PolicyOwner: 'Not auth0|644151efc3a961d2784456d9',
          PolicyOwnerCommentary: 'Not Policy owner commentary',
          Rationale: 'false',
          RegulatoryBreach: true,
          RegulationsBreached: null,
          Reportable: true,
          Severity: 4,
          Status: 'pending',
          SystemResponsible: 'NotSystem responsible',
          TargetCloseDate: '2024-04-24T22:41:58.03502+00:00',
          ThirdPartyResponsible: 'Not Third party responsible',
          parents: [],
          departments: [
            {
              ParentId: '7e34148d-c579-4799-baed-830c1c82f599',
              DepartmentTypeId: 'a2781d16-4827-4d81-a9ba-9402e0c56f71',
            },
          ],
          tags: [
            {
              ParentId: '75b0ddea-e6da-41a3-b3b4-f6f0d6fddb90',
              TagTypeId: 'b2781d16-4827-4d81-a9ba-9402e0c56f71',
            },
          ],
        }),
      },
      expectedPopovers: 20,
    },
    {
      requestedChanges: { ...buildIssueAssessmentRequestedChanges() },
      expectedPopovers: 0,
    },
  ])(
    'Correct number of popovers rendered for fields that have pending changes',
    async ({ requestedChanges, expectedPopovers }) => {
      const issue = {
        ...buildIssueFlatField(),
        files: [],
        ancestorContributors: [],
      };
      const { container } = render(<Tab issue={issue} type={'issue'} />, {
        wrapper: getWrapper(
          [
            ...mockedResponses,
            mockedGetLivePendingChangeRequestsSubscription('update', ISSUE_ID, {
              change_request: [
                {
                  Id: 'change-request-id',
                  SequentialId: 1,
                  Type: 'update',
                  CreatedAtTimestamp: '2021-08-02T14:00:00Z',
                  ModifiedAtTimestamp: '2021-08-02T14:00:00Z',
                  ParentId: ISSUE_ID,
                  Comment: '',
                  RequestedChanges: requestedChanges,
                  contributors: [],
                  requestedFileChanges: [],
                  responses: [],
                  ChangeRequestStatus: Approval_Status_Enum.Pending,
                  createdBy: {
                    FriendlyName: 'User1',
                    Email: 'user1@user.com',
                  },
                },
              ],
            }),
          ],
          'graphql',
          'i18n',
          'router',
          'permission',
          'help',
          'features',
          'trpc'
        ),
      });

      await waitFor(
        () =>
          expect(
            screen.queryByText('Show Pending Changes')
          ).toBeInTheDocument(),
        {
          timeout: 10000,
        }
      );

      act(() => {
        screen.queryByText('Show Pending Changes')?.click();
      });

      await waitFor(
        () => expect(screen.queryByText('View Current')).toBeInTheDocument(),
        {
          timeout: 10000,
        }
      );

      expect(
        container.querySelectorAll('[data-testid="field-changes-popover"]')
      ).toHaveLength(expectedPopovers);
    }
  );
});
