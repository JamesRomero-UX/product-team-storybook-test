import type { Auth0ContextInterface } from '@auth0/auth0-react';
import type { RisksmartUser } from '@risksmart-app/components/src/hooks/useRisksmartUser';
import useRisksmartUser from '@risksmart-app/components/src/hooks/useRisksmartUser';
import { useGetGuidParam } from '@risksmart-app/components/src/routes/routes.utils';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { render, screen, waitFor } from '@testing-library/react';
import { useHasPermissionQuery } from 'src/rbac/useHasPermission';
import { mockedDepartmentsResponse } from 'src/testing/mock-data/mockedDepartmentTypeResponses';
import { mockedGetEnterpriseRiskById } from 'src/testing/mock-data/mockedGetEnterpriseRiskById';
import { mockedGetEnterpriseRisks } from 'src/testing/mock-data/mockedGetEnterpriseRisks';
import { mockedGetFormConfiguration } from 'src/testing/mock-data/mockedGetFormConfiguration';
import { mockedGetFormCustomisationResponse } from 'src/testing/mock-data/mockedGetFormCustomisationResponse';
import { mockedGetLinkedItemRisksResponse } from 'src/testing/mock-data/mockedGetLinkedItemRisksResponse';
import { mockedGetOrganisation } from 'src/testing/mock-data/mockedGetOrganisation';
import { mockedGetOrganisationModuleResponse } from 'src/testing/mock-data/mockedGetOrganisationModule';
import { mockedGetPendingChangeRequests } from 'src/testing/mock-data/mockedGetPendingChangeRequestsResponse';
import { mockedRoleAccessResponse } from 'src/testing/mock-data/mockedGetRoleAccessResponse';
import { mockedTagsResponse } from 'src/testing/mock-data/mockedTagTypeResponses';
import { mockedUserGroupResponse } from 'src/testing/mock-data/mockedUserGroupResponses';
import { mockedUsersResponse } from 'src/testing/mock-data/mockedUserResponses';
import { mockedUserSearchPreferencesResponses } from 'src/testing/mock-data/mockedUserSearchPreferencesResponses';
import { stub } from 'src/testing/stub';
import { getWrapper } from 'src/testing/wrapper';
import { vi } from 'vitest';

import DetailsTab from './DetailsTab';

vi.mock('@risksmart-app/components/src/hooks/useRisksmartUser');
vi.mock('@risksmart-app/components/src/routes/routes.utils');
vi.mock('src/rbac/useHasPermission');

const userMock = vi.mocked(useRisksmartUser);
const guidMock = vi.mocked(useGetGuidParam);
const hasPermissionMock = vi.mocked(useHasPermissionQuery);

describe('Enterprise Risk Details Tab Component', () => {
  const mockedResponses = [
    mockedUserGroupResponse(),
    mockedUsersResponse(),
    mockedUserSearchPreferencesResponses(),
    mockedDepartmentsResponse,
    mockedTagsResponse,
    mockedGetEnterpriseRisks,
    mockedGetEnterpriseRiskById('1'),
    mockedRoleAccessResponse(),
    mockedGetFormConfiguration({
      where: {
        ParentType: {
          _in: [Parent_Type_Enum.Risk],
        },
      },
    }),
    mockedGetPendingChangeRequests({ ParentId: '1' }, { change_request: [] }),
    mockedGetFormCustomisationResponse([Parent_Type_Enum.Risk], {
      form_field_configuration: [],
      form_configuration: [],
      form_field_ordering: [],
    }),
    mockedGetOrganisation(),
    mockedGetOrganisationModuleResponse(),
    mockedGetLinkedItemRisksResponse({ Id: '1' }),
  ];
  beforeEach(() => {
    vi.resetAllMocks();

    userMock.mockReturnValue(
      stub<Auth0ContextInterface<RisksmartUser>>({
        user: { userId: '1' } as RisksmartUser,
        isLoading: false,
      })
    );

    guidMock.mockReturnValue('1');
    hasPermissionMock.mockReturnValue({ hasPermission: true, loading: false });
  });

  it('renders tab and title', async () => {
    render(<DetailsTab />, {
      wrapper: getWrapper(
        mockedResponses,
        'graphql',
        'i18n',
        'router',
        'permission',
        'help',
        'features',
        'trpc'
      ),
    });

    await waitFor(() => screen.getByText('Details'), {
      timeout: 5000,
    });

    expect(screen.getByText('Details')).toBeInTheDocument();
  });
});
