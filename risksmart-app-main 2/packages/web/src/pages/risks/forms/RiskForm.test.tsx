import useRisksmartUser from '@risksmart-app/components/src/hooks/useRisksmartUser';
import {
  Access_Type_Enum,
  Contributor_Type_Enum,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { render, screen, waitFor } from '@testing-library/react';
import { useGetEnterpriseRiskByTier } from 'src/hooks/queries/enterprise-risk/useGetEnterpriseRisksByTier';
import {
  getFormField,
  getFormFieldTestId,
  getRadioButtonInputElement,
  getRadioButtonLabel,
} from 'src/testing/formHelpers';
import { mockedDepartmentsResponse } from 'src/testing/mock-data/mockedDepartmentTypeResponses';
import { mockedGetAggregationResponse } from 'src/testing/mock-data/mockedGetAggregationResponses';
import { mockedGetChangeRequestByParentIdSubscription } from 'src/testing/mock-data/mockedGetChangeRequestByParentIdSubscription';
import { mockedGetFormCustomisationResponse } from 'src/testing/mock-data/mockedGetFormCustomisationResponse';
import { mockedGetLinkedItemRisksResponse } from 'src/testing/mock-data/mockedGetLinkedItemRisksResponse';
import { mockedGetOrganisation } from 'src/testing/mock-data/mockedGetOrganisation';
import { mockedGetOrganisationModuleResponse } from 'src/testing/mock-data/mockedGetOrganisationModule';
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

import { buildUser } from '../../../components/form/controlled-group-and-user-select/userBuilder';
import { mockedGetPendingChangeRequests } from '../../../testing/mock-data/mockedGetPendingChangeRequestsResponse';
import type { Props } from './RiskForm';
import RiskForm from './RiskForm';
import { TestIds } from './RiskFormFieldsTestIds';
import type { RiskFormDataFields } from './riskSchema';

vitest.mock('@risksmart-app/components/src/hooks/useRisksmartUser');
vi.mock('@/utils/featureFlags');
vi.mock('src/hooks/queries/enterprise-risk/useGetEnterpriseRisksByTier');

const useGetEnterpriseRiskByTierMock = vitest.mocked(
  useGetEnterpriseRiskByTier
);
const useRisksmartUserMock = vitest.mocked(useRisksmartUser);

describe('RiskForm', () => {
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
    useGetEnterpriseRiskByTierMock.mockReturnValue({
      data: { enterprise_risk: [] },
      loading: false,
      refetch: vi.fn(),
      error: undefined,
    });
  });
  const defaultProps: Props = {
    onSave: vi.fn(),
  };

  const risk: RiskFormDataFields = {
    Title: 'Risk 1',
    Description: 'Risk description',
    Tier: 1,
    Treatment: null,
    Status: null,
    ParentRiskId: null,
    tags: [],
    departments: [],
    CustomAttributeData: null,
    Contributors: [],
    Owners: [],
    ancestorContributors: [],
    schedule: {
      Frequency: null,
    },
  };
  const buildRisk = (overrides: Partial<RiskFormDataFields> = {}) => {
    return { ...risk, ...overrides };
  };

  const id = '123';

  const mocks = [
    mockedGetOrganisation(),
    mockedGetPendingChangeRequests({ ParentId: id }, { change_request: [] }),
    mockedGetChangeRequestByParentIdSubscription(id),
    mockedGetFormCustomisationResponse([Parent_Type_Enum.Risk]),
    mockedUserGroupResponse(),
    mockedUsersResponse({
      user: [
        buildUser({
          Id: 'TestUser2',
          FriendlyName: 'Test User2',
          RoleKey: '',
          Status: 'active',
        }),
        buildUser({ ...testUser }),
      ],
    }),
    mockedDepartmentsResponse,
    mockedTagsResponse,
    mockedUserSearchPreferencesResponses(),
    mockedGetAggregationResponse(),
    mockedGetOrganisationModuleResponse(),
    mockedGetLinkedItemRisksResponse({ Id: id }),
  ];

  it('should set the logged in user as the owner by default', async () => {
    const { container } = render(<RiskForm {...defaultProps} />, {
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

  it('should display Tier 1, 2 and 3 options on an insert (no riskId) to users with insert:risk_tier_1 (any) permission (RiskManagers can create Risks without a parent)', async () => {
    const { container } = render(<RiskForm {...defaultProps} />, {
      wrapper: getWrapper(
        [
          ...mocks,
          mockedRoleAccessResponse({
            role_access: [
              {
                AccessType: Access_Type_Enum.Insert,
                ObjectType: Parent_Type_Enum.RiskTier_1,
                ContributorType: Contributor_Type_Enum.Any,
              },
            ],
          }),
        ],
        ...providers
      ),
    });
    await waitFor(() => screen.findByTestId(getFormFieldTestId(TestIds.Tier)), {
      timeout: 5000,
    });

    const radioButtons = getFormField(container, TestIds.Tier)
      ?.findControl()
      ?.findRadioGroup()
      ?.findButtons();

    expect(radioButtons?.length).toEqual(3);
    expect(getRadioButtonLabel(container, TestIds.Tier, 0)).toEqual('Tier 1');
    expect(getRadioButtonLabel(container, TestIds.Tier, 1)).toEqual('Tier 2');
    expect(getRadioButtonLabel(container, TestIds.Tier, 2)).toEqual('Tier 3');
    expect(
      getRadioButtonInputElement(container, TestIds.Tier, 0).checked
    ).toEqual(true);
  });

  it('should only give Tier and 2 and 3 options on a insert (no riskId) to users without insert:risk (any) permission (Standard users can only create child risks of an owned risk)', async () => {
    const { container } = render(<RiskForm {...defaultProps} />, {
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
    await waitFor(() => screen.findByTestId(getFormFieldTestId(TestIds.Tier)), {
      timeout: 5000,
    });

    const radioButtons = getFormField(container, TestIds.Tier)
      ?.findControl()
      ?.findRadioGroup()
      ?.findButtons();

    expect(radioButtons?.length).toEqual(2);
    expect(getRadioButtonLabel(container, TestIds.Tier, 0)).toEqual('Tier 2');
    expect(getRadioButtonLabel(container, TestIds.Tier, 1)).toEqual('Tier 3');

    expect(
      getRadioButtonInputElement(container, TestIds.Tier, 0).checked
    ).toEqual(true);
  });

  it('should display readonly Tier 1, 2 and 3 options for an update to users without update:risk (any) permission (Standard users can cannot change risk parent', async () => {
    const { container } = render(<RiskForm {...defaultProps} riskId={id} />, {
      wrapper: getWrapper(
        [
          ...mocks,
          mockedRoleAccessResponse({
            role_access: [],
          }),
        ],
        ...providers
      ),
    });
    await waitFor(() => screen.findByTestId(getFormFieldTestId(TestIds.Tier)), {
      timeout: 5000,
    });

    const radioButtons = getFormField(container, TestIds.Tier)
      ?.findControl()
      ?.findRadioGroup()
      ?.findButtons();

    expect(radioButtons?.length).toEqual(3);
    expect(
      getRadioButtonInputElement(container, TestIds.Tier, 0)?.hasAttribute(
        'disabled'
      )
    ).toEqual(true);
    expect(getRadioButtonLabel(container, TestIds.Tier, 0)).toEqual('Tier 1');
    expect(
      getRadioButtonInputElement(container, TestIds.Tier, 1)?.hasAttribute(
        'disabled'
      )
    ).toEqual(true);
    expect(getRadioButtonLabel(container, TestIds.Tier, 1)).toEqual('Tier 2');
    expect(
      getRadioButtonInputElement(container, TestIds.Tier, 2)?.hasAttribute(
        'disabled'
      )
    ).toEqual(true);
    expect(getRadioButtonLabel(container, TestIds.Tier, 2)).toEqual('Tier 3');
    expect(
      getRadioButtonInputElement(container, TestIds.Tier, 0).checked
    ).toEqual(true);
  });

  it('should display parent risk friendly id when user does not have access to parent risk', async () => {
    const { container } = render(
      <RiskForm
        {...defaultProps}
        riskId={id}
        values={buildRisk({
          Tier: 2,
          ParentRiskId: 'NoAccessToThisRisk',
        })}
        parentRiskNode={{
          Id: 'NoAccessToThisRisk',
          SequentialId: 99,
          ObjectType: Parent_Type_Enum.Risk,
        }}
      />,
      {
        wrapper: getWrapper(
          [
            ...mocks,
            mockedRoleAccessResponse({
              role_access: [],
            }),
            mockedGetRisksByTierResponse(
              { where: { Tier: { _eq: 1 } } },
              { risk: [] }
            ),
          ],
          ...providers
        ),
      }
    );
    await waitFor(
      () => {
        const parentRiskSelect = getFormField(container, TestIds.ParentRiskId)!
          .findControl()!
          .findSelect()!;
        const parentRiskText = parentRiskSelect.getElement().textContent;
        expect(parentRiskText).toEqual('R-99');
      },
      {
        timeout: 5000,
      }
    );
  });

  it('should display parent risk name when user has access to parent risk', async () => {
    const { container } = render(
      <RiskForm
        {...defaultProps}
        riskId={id}
        values={buildRisk({
          Tier: 2,
          ParentRiskId: 'AccessToRisk',
        })}
        parentRiskNode={{
          Id: 'AccessToRisk',
          SequentialId: 99,
          ObjectType: Parent_Type_Enum.Risk,
        }}
      />,
      {
        wrapper: getWrapper(
          [
            ...mocks,
            mockedRoleAccessResponse({
              role_access: [],
            }),
            mockedGetRisksByTierResponse(
              { where: { Tier: { _eq: 1 } } },
              {
                risk: [
                  {
                    Id: 'AccessToRisk',
                    SequentialId: 99,
                    Title: 'I have access to risk',
                    enterpriseRiskInstance: null,
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
        const parentRiskSelect = getFormField(container, TestIds.ParentRiskId)!
          .findControl()!
          .findSelect();
        const parentRiskText = parentRiskSelect!.getElement().textContent;
        expect(parentRiskText).toEqual('I have access to risk');
      },
      {
        timeout: 5000,
      }
    );
  });

  it('should hide certain fields when risk is an enterprise risk', async () => {
    render(
      <RiskForm
        {...defaultProps}
        enterpriseRisk
        riskId={id}
        values={buildRisk({
          Tier: 2,
          ParentRiskId: 'AccessToRisk',
        })}
        parentRiskNode={{
          Id: 'AccessToRisk',
          SequentialId: 99,
          ObjectType: Parent_Type_Enum.Risk,
        }}
      />,
      {
        wrapper: getWrapper(
          [
            ...mocks,
            mockedRoleAccessResponse({
              role_access: [],
            }),
          ],
          ...providers
        ),
      }
    );
    await waitFor(
      () => {
        expect(
          screen.queryByTestId(getFormFieldTestId(TestIds.Owners))
        ).not.toBeInTheDocument();

        expect(
          screen.queryByTestId(getFormFieldTestId(TestIds.Contributors))
        ).not.toBeInTheDocument();

        expect(
          screen.queryByTestId(getFormFieldTestId(TestIds.Departments))
        ).not.toBeInTheDocument();

        expect(
          screen.queryByTestId(getFormFieldTestId(TestIds.Tags))
        ).not.toBeInTheDocument();

        expect(
          screen.queryByTestId(getFormFieldTestId(TestIds.NextTestDate))
        ).not.toBeInTheDocument();

        expect(
          screen.queryByTestId(getFormFieldTestId(TestIds.Status))
        ).not.toBeInTheDocument();

        expect(
          screen.queryByTestId(getFormFieldTestId(TestIds.Tier))
        ).toBeInTheDocument();

        expect(
          screen.queryByTestId(getFormFieldTestId(TestIds.ParentRiskId))
        ).toBeInTheDocument();
      },
      {
        timeout: 5000,
      }
    );
  });
});
