import {
  Access_Type_Enum,
  Contributor_Type_Enum,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { render, screen } from '@testing-library/react';
import { when } from 'jest-when';
import { useGetDetailParentPath } from 'src/routes/useGetDetailParentPath';
import { findFormContext } from 'src/testing/formHelpers';
import { mockedGetAcceptanceResponse } from 'src/testing/mock-data/mockedGetAcceptanceByIdResponse';
import { mockedGetAggregationResponse } from 'src/testing/mock-data/mockedGetAggregationResponses';
import { mockedGetChangeRequestByParentIdSubscription } from 'src/testing/mock-data/mockedGetChangeRequestByParentIdSubscription';
import { mockedGetFormCustomisationResponse } from 'src/testing/mock-data/mockedGetFormCustomisationResponse';
import { mockedGetOrganisation } from 'src/testing/mock-data/mockedGetOrganisation';
import { mockedGetOrganisationModuleResponse } from 'src/testing/mock-data/mockedGetOrganisationModule';
import { mockedGetPendingChangeRequests } from 'src/testing/mock-data/mockedGetPendingChangeRequestsResponse';
import { mockedRoleAccessResponse } from 'src/testing/mock-data/mockedGetRoleAccessResponse';
import type { Providers } from 'src/testing/wrapper';
import { getWrapper } from 'src/testing/wrapper';
import { vitest } from 'vitest';

import { useIsModuleEnabled } from '@/hooks/useIsModuleEnabled';

import Tab from './Tab';

vitest.mock('src/routes/useGetDetailParentPath');
vitest.mock('@/hooks/useIsModuleEnabled');

const useGetDetailParentPathMock = vitest.mocked(useGetDetailParentPath);
const useIsModuleEnabledMock = vitest.mocked(useIsModuleEnabled);

describe('Acceptances Tab', () => {
  const providers: Providers[] = [
    'trpc',
    'graphql',
    'permission',
    'notification',
    'router',
    'i18n',
    'features',
  ];
  const id = '0a5ab3c0-7fd2-49fd-b99b-2294fe488892';
  const mockedResponses = [
    mockedGetOrganisation(),
    mockedGetOrganisationModuleResponse(),
    mockedGetPendingChangeRequests({ ParentId: id }, { change_request: [] }),
    mockedGetChangeRequestByParentIdSubscription(id),
    mockedGetAcceptanceResponse(
      { _eq: id },
      {
        acceptance: [
          {
            DateAcceptedFrom: '',
            DateAcceptedTo: '',
            Details: '',
            Id: id,
            Status: 'awaitingclosure',
            ModifiedAtTimestamp: '',
            CreatedAtTimestamp: '',
            Title: '',
            ModifiedByUser: '',
            files: [],
            parents: [],
            ancestorContributors: [],
          },
        ],
      }
    ),
    mockedGetFormCustomisationResponse([Parent_Type_Enum.Acceptance]),
    mockedGetAggregationResponse(),
  ];

  beforeEach(() => {
    useGetDetailParentPathMock.mockReturnValue('');
    when(useIsModuleEnabledMock).calledWith('approval').mockReturnValue(true);
  });

  it('should NOT show a "Save" button when "update:acceptance" permission is false', async () => {
    render(<Tab Id={id} />, {
      wrapper: getWrapper(
        [
          ...mockedResponses,
          mockedRoleAccessResponse({
            role_access: [],
          }),
        ],
        ...providers
      ),
    });
    await findFormContext();
    expect(screen.queryByText('Save')).not.toBeInTheDocument();
  });

  it('should show a "Save" button when "update:acceptance" permission is true', async () => {
    render(<Tab Id={id} />, {
      wrapper: getWrapper(
        [
          ...mockedResponses,
          mockedRoleAccessResponse({
            role_access: [
              {
                AccessType: Access_Type_Enum.Update,
                ContributorType: Contributor_Type_Enum.Any,
                ObjectType: Parent_Type_Enum.Acceptance,
              },
            ],
          }),
        ],
        ...providers
      ),
    });
    await findFormContext();
    expect(screen.queryByText('Save')).toBeInTheDocument();
  });
});
