import useRisksmartUser from '@risksmart-app/components/src/hooks/useRisksmartUser';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { render, waitFor } from '@testing-library/react';
import { buildUser } from 'src/components/form/controlled-group-and-user-select/userBuilder';
import { getFormField } from 'src/testing/formHelpers';
import { mockedDepartmentsResponse } from 'src/testing/mock-data/mockedDepartmentTypeResponses';
import { mockedGetAggregationResponse } from 'src/testing/mock-data/mockedGetAggregationResponses';
import { mockedGetFormCustomisationResponse } from 'src/testing/mock-data/mockedGetFormCustomisationResponse';
import { mockedGetObligationsByTypeResponse } from 'src/testing/mock-data/mockedGetObligationsByType';
import { mockedGetOrganisation } from 'src/testing/mock-data/mockedGetOrganisation';
import { mockedGetOrganisationModuleResponse } from 'src/testing/mock-data/mockedGetOrganisationModule';
import { mockedGetPendingChangeRequests } from 'src/testing/mock-data/mockedGetPendingChangeRequestsResponse';
import { mockedRoleAccessResponse } from 'src/testing/mock-data/mockedGetRoleAccessResponse';
import { mockedTagsResponse } from 'src/testing/mock-data/mockedTagTypeResponses';
import { mockedUserGroupResponse } from 'src/testing/mock-data/mockedUserGroupResponses';
import { mockedUsersResponse } from 'src/testing/mock-data/mockedUserResponses';
import { mockedUserSearchPreferencesResponses } from 'src/testing/mock-data/mockedUserSearchPreferencesResponses';
import { testAuth0User } from 'src/testing/testUser';
import type { Providers } from 'src/testing/wrapper';
import { getWrapper } from 'src/testing/wrapper';
import { vi } from 'vitest';

import type { Props } from './ObligationDetailsForm';
import ObligationDetailsForm from './ObligationDetailsForm';
import { TestIds } from './ObligationDetailsFormFieldsTestIds';
import type { ObligationFormFieldData } from './obligationSchema';
import { defaultValues } from './obligationSchema';

vi.mock('@/utils/featureFlags');
vi.mock('@risksmart-app/components/src/hooks/useRisksmartUser');

const useRisksmartUserMock = vi.mocked(useRisksmartUser);

describe('ObligationDetailsForm', () => {
  beforeEach(() => {
    useRisksmartUserMock.mockReturnValue(testAuth0User);
  });
  const providers: Providers[] = [
    'trpc',
    'graphql',
    'permission',
    'notification',
    'router',
    'i18n',
    'features',
  ];

  const id = '123';
  const mocks = [
    mockedGetOrganisation(),
    mockedGetPendingChangeRequests({ ParentId: id }, { change_request: [] }),
    mockedGetFormCustomisationResponse([Parent_Type_Enum.Obligation]),
    mockedUserGroupResponse(),
    mockedUsersResponse({
      user: [buildUser()],
    }),
    mockedDepartmentsResponse,
    mockedTagsResponse,
    mockedUserSearchPreferencesResponses(),
    mockedGetAggregationResponse(),
    mockedGetOrganisationModuleResponse(),
  ];

  const defaultProps: Props = {
    onSave: vi.fn(),
    defaultValues,
  };

  const obligation: ObligationFormFieldData = {
    Title: 'Obligation 1',
    Description: 'Obligation description',
    Type: 'rule',
    Adherence: '',
    ParentId: null,
    tags: [],
    TagTypeIds: [],
    departments: [],
    DepartmentTypeIds: [],
    CustomAttributeData: null,
    Contributors: [],
    Owners: [],
    ancestorContributors: [],
    schedule: {
      StartDate: null,
      ManualDueDate: null,
      Frequency: null,
      TimeToCompleteValue: null,
      TimeToCompleteUnit: null,
    },
  };
  const buildObligation = (
    overrides: Partial<ObligationFormFieldData> = {}
  ) => {
    return { ...obligation, ...overrides };
  };

  it('should display parent obligation friendly id when user does not have access to parent obligation', async () => {
    const { container } = render(
      <ObligationDetailsForm
        {...defaultProps}
        obligationId={id}
        values={buildObligation({
          Type: 'rule',
          ParentId: 'NoAccessToThisObligation',
        })}
        parentObligationNode={{
          Id: 'NoAccessToThisObligation',
          SequentialId: 99,
          ObjectType: Parent_Type_Enum.Obligation,
        }}
      />,
      {
        wrapper: getWrapper(
          [
            ...mocks,
            mockedRoleAccessResponse({
              role_access: [],
            }),
            mockedGetObligationsByTypeResponse(
              { type: 'chapter' },
              { obligation: [] }
            ),
          ],
          ...providers
        ),
      }
    );
    await waitFor(
      () => {
        const parentSelect = getFormField(container, TestIds.ParentId)!
          .findControl()!
          .findSelect();

        const parentText = parentSelect!.getElement().textContent;

        expect(parentText).toEqual('O-99');
      },
      {
        timeout: 5000,
      }
    );
  });

  it('should display parent obligation name when user has access to parent obligation', async () => {
    const { container } = render(
      <ObligationDetailsForm
        {...defaultProps}
        obligationId={id}
        values={buildObligation({
          Type: 'rule',
          ParentId: 'AccessToObligation',
        })}
        parentObligationNode={{
          Id: 'AccessToObligation',
          SequentialId: 99,
          ObjectType: Parent_Type_Enum.Obligation,
        }}
      />,
      {
        wrapper: getWrapper(
          [
            ...mocks,
            mockedRoleAccessResponse({
              role_access: [],
            }),

            mockedGetObligationsByTypeResponse(
              { type: 'chapter' },
              {
                obligation: [
                  {
                    Id: 'AccessToObligation',
                    SequentialId: 99,
                    Title: 'I have access to obligation',
                  },
                ],
              }
            ),
          ],
          ...providers
        ),
      }
    );
    await waitFor(
      () => {
        const parentSelect = getFormField(container, TestIds.ParentId)!
          .findControl()!
          .findSelect();

        const parentText = parentSelect!.getElement().textContent;

        expect(parentText).toEqual('I have access to obligation');
      },
      {
        timeout: 5000,
      }
    );
  });
});
