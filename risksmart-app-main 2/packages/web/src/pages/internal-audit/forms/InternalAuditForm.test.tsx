import useRisksmartUser from '@risksmart-app/components/src/hooks/useRisksmartUser';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { render, screen, waitFor } from '@testing-library/react';
import { buildUser } from 'src/components/form/controlled-group-and-user-select/userBuilder';
import { getFormField, getFormFieldTestId } from 'src/testing/formHelpers';
import { mockedDepartmentsResponse } from 'src/testing/mock-data/mockedDepartmentTypeResponses';
import { mockedGetAggregationResponse } from 'src/testing/mock-data/mockedGetAggregationResponses';
import { mockedGetFormCustomisationResponse } from 'src/testing/mock-data/mockedGetFormCustomisationResponse';
import { mockedGetOrganisation } from 'src/testing/mock-data/mockedGetOrganisation';
import { mockedGetRisksByTierResponse } from 'src/testing/mock-data/mockedGetRisksByTierResponse';
import { mockedRoleAccessResponse } from 'src/testing/mock-data/mockedGetRoleAccessResponse';
import { mockedTagsResponse } from 'src/testing/mock-data/mockedTagTypeResponses';
import { mockedUserGroupResponse } from 'src/testing/mock-data/mockedUserGroupResponses';
import { mockedUsersResponse } from 'src/testing/mock-data/mockedUserResponses';
import { mockedUserSearchPreferencesResponses } from 'src/testing/mock-data/mockedUserSearchPreferencesResponses';
import { testAuth0User, testUser } from 'src/testing/testUser';
import type { Providers } from 'src/testing/wrapper';
import { getWrapper } from 'src/testing/wrapper';
import { vi, vitest } from 'vitest';

import { mockedBusinessAreasResponse } from '../../../testing/mock-data/mockedBusinessAreaResponses';
import type { Props } from './InternalAuditForm';
import InternalAuditForm from './InternalAuditForm';
import { TestIds } from './InternalAuditFormFieldsTestIds';

vitest.mock('@risksmart-app/components/src/hooks/useRisksmartUser');
vi.mock('@/utils/featureFlags');

const useRisksmartUserMock = vitest.mocked(useRisksmartUser);

describe('InternalAuditForm', () => {
  const providers: Providers[] = [
    'trpc',
    'graphql',
    'permission',
    'notification',
    'router',
    'i18n',
    'features',
  ];

  beforeEach(() => {
    useRisksmartUserMock.mockReturnValue(testAuth0User);
  });
  const defaultProps: Props = {
    onSave: vi.fn(),
  };

  const mocks = [
    mockedGetOrganisation(),
    mockedGetFormCustomisationResponse([Parent_Type_Enum.InternalAuditEntity]),
    mockedUserGroupResponse(),
    mockedBusinessAreasResponse(),
    mockedUsersResponse({
      user: [
        buildUser({
          Id: 'TestUser2',
          FriendlyName: 'Test User2',
          RoleKey: '',
          Status: 'active',
        }),
        buildUser({ ...testUser, RoleKey: 'RiskManager' }),
      ],
    }),
    mockedDepartmentsResponse,
    mockedTagsResponse,
    mockedUserSearchPreferencesResponses(),
    mockedGetAggregationResponse(),
  ];

  it('should set the logged in user as the owner by default', async () => {
    const { container } = render(<InternalAuditForm {...defaultProps} />, {
      wrapper: getWrapper(
        [
          ...mocks,
          mockedGetRisksByTierResponse({ where: { Tier: { _eq: 1 } } }),
          mockedRoleAccessResponse({
            role_access: [],
          }),
        ],
        ...providers
      ),
    });
    await waitFor(
      () => screen.findByTestId(getFormFieldTestId(TestIds.Owners)),
      {
        timeout: 5000,
      }
    );

    const ownerSelect = getFormField(container, TestIds.Owners)
      ?.findControl()
      ?.findMultiselect();

    ownerSelect?.openDropdown();
    const selectedOwners = ownerSelect?.findDropdown().findSelectedOptions();

    expect(selectedOwners?.length).toEqual(1);
    expect(selectedOwners?.[0]?.findLabel().getElement().textContent).toEqual(
      testUser.FriendlyName
    );
  });
});
