import type {
  PropertyFilterOption,
  PropertyFilterQuery,
} from '@cloudscape-design/collection-hooks';
import createWrapper from '@risk-smart/themed-cloudscape-components/test-utils/dom';
import {
  Access_Type_Enum,
  Contributor_Type_Enum,
  Issue_Assessment_Status_Enum,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { FC } from 'react';
import { useGetRegisterTableProps } from 'src/pages/issues/config';
import type {
  IssueFlatField,
  IssueRegisterFields,
} from 'src/pages/issues/types';
import { useGetDefaultRibbonFilters } from 'src/pages/issues/useGetDefaultRibbonFilters';
import { mockedDepartmentsResponse } from 'src/testing/mock-data/mockedDepartmentTypeResponses';
import { mockedGetFormCustomisationResponse } from 'src/testing/mock-data/mockedGetFormCustomisationResponse';
import { mockedGetOrganisation } from 'src/testing/mock-data/mockedGetOrganisation';
import { mockedGetOrganisationModuleResponse } from 'src/testing/mock-data/mockedGetOrganisationModule';
import { mockedGetRibbonItemsByParentTypeResponse } from 'src/testing/mock-data/mockedGetRibbonItemsByParentTypeResponse';
import { mockedRoleAccessResponse } from 'src/testing/mock-data/mockedGetRoleAccessResponse';
import { mockedGetUserTablePreferences } from 'src/testing/mock-data/mockedGetUserTablePreferences';
import { mockedInsertRibbonItemsByParentTypeMutationResponse } from 'src/testing/mock-data/mockedInsertRibbonItemsByParentTypeMutationResponse';
import { mockedTagsResponse } from 'src/testing/mock-data/mockedTagTypeResponses';
import { mockedUpdateRibbonItemsByParentTypeMutationResponse } from 'src/testing/mock-data/mockedUpdateRibbonItemsByParentTypeMutationResponse';
import { mockedUserGroupResponse } from 'src/testing/mock-data/mockedUserGroupResponses';
import { mockedUsersResponse } from 'src/testing/mock-data/mockedUserResponses';
import { buildIssueFlatField } from 'src/testing/test-data/issueFlatField';
import {
  defaultFormProvidersWithFeatures,
  getWrapper,
} from 'src/testing/wrapper';
import { vi } from 'vitest';

import type { Props } from '@/components/customisable-ribbon/CustomisableRibbon';
import CustomisableRibbon from '@/components/customisable-ribbon/CustomisableRibbon';
import { emptyFilterQuery } from '@/utils/collectionUtils';

type DefaultTestProps = Omit<
  Props<IssueRegisterFields>,
  'filteringOptions' | 'filteringProperties'
>;

const defaultProps: DefaultTestProps = {
  items: [],
  propertyFilterQuery: emptyFilterQuery,
  onFilterQueryChanged: vi.fn(),
  parentType: Parent_Type_Enum.Issue,
  defaultFilters: [],
};

interface OverrideProps {
  items?: readonly IssueRegisterFields[];
  propertyFilterQuery?: PropertyFilterQuery;
  onFilterQueryChanged?: (query: PropertyFilterQuery) => void;
  filteringOptions?: readonly PropertyFilterOption[];
  parentType?: Parent_Type_Enum;
}

type RoleAccessResponse = {
  AccessType: Access_Type_Enum;
  ContributorType: Contributor_Type_Enum;
  ObjectType: Parent_Type_Enum;
};

interface CreateRenderProps {
  overrideProps?: OverrideProps;
  permissions?: RoleAccessResponse[];
  records?: IssueFlatField[];
}

const TestHarness: FC<{
  records: IssueFlatField[];
  props: DefaultTestProps;
}> = ({ records, props }) => {
  const { filteringProperties, allItems, propertyFilterProps } =
    useGetRegisterTableProps(Parent_Type_Enum.Issue, records);

  return (
    <CustomisableRibbon
      {...props}
      items={allItems}
      filteringProperties={filteringProperties}
      filteringOptions={propertyFilterProps.filteringOptions}
      defaultFilters={useGetDefaultRibbonFilters('issues')()}
    />
  );
};

const createRender = ({
  overrideProps,
  permissions,
  records,
}: CreateRenderProps) => {
  const props = { ...defaultProps, ...overrideProps };

  return render(<TestHarness records={records || []} props={props} />, {
    wrapper: getWrapper(
      [
        mockedGetFormCustomisationResponse([
          Parent_Type_Enum.Issue,
          Parent_Type_Enum.IssueAssessment,
        ]),
        mockedGetOrganisation(),
        mockedGetOrganisationModuleResponse(),
        mockedDepartmentsResponse,
        mockedTagsResponse,
        mockedUsersResponse(),
        mockedUserGroupResponse(),
        mockedRoleAccessResponse({ role_access: permissions || [] }),
        mockedGetRibbonItemsByParentTypeResponse(Parent_Type_Enum.Issue, {
          custom_ribbon: [],
        }),
        mockedInsertRibbonItemsByParentTypeMutationResponse(
          Parent_Type_Enum.Issue,
          ''
        ),
        mockedUpdateRibbonItemsByParentTypeMutationResponse(
          'random-cool-uuid',
          Parent_Type_Enum.Issue,
          '',
          new Date().toISOString()
        ),
        mockedGetUserTablePreferences('issueRegister'),
      ],
      ...defaultFormProvidersWithFeatures
    ),
  });
};

describe('CustomisableRibbon', () => {
  const defaultFilters = [
    () => screen.queryByText('Open issues'),
    () => screen.queryByText('Overdue'),
    () => screen.queryByText('Without open action'),
    () => screen.queryByText('All issues'),
  ];

  const dashboardItems = () => screen.getAllByTestId('dashboard-item');
  const optionsButton = () => screen.queryByTestId('edit-ribbon-button');
  const deleteRibbonFilterButton = (index: number) =>
    screen.queryByTestId(`delete-ribbon-filter-button-${index}`);
  const addAnotherFilterButton = () => screen.queryByText('Add another filter');
  const previewHeadings = () => screen.getAllByText('Preview:');

  const defaultIssue = buildIssueFlatField();

  const records: IssueFlatField[] = [
    {
      ...defaultIssue,
      assessment: {
        ...defaultIssue.assessment!,
        Status: Issue_Assessment_Status_Enum.Closed,
        TargetCloseDate: '2023-04-21T22:41:58.03502+00:00',
      },
    },
    {
      ...defaultIssue,
      assessment: {
        ...defaultIssue.assessment!,
        Status: Issue_Assessment_Status_Enum.Open,
        TargetCloseDate: '2023-04-24T22:41:58.03502+00:00',
      },
    },
    {
      ...defaultIssue,
      actions_aggregate: {
        aggregate: {
          count: 0,
        },
      },
      assessment: {
        ...defaultIssue.assessment!,
        Status: Issue_Assessment_Status_Enum.Pending,
        TargetCloseDate: '2034-10-03T00:00:00+00:00',
      },
    },
    {
      ...defaultIssue,
      actions_aggregate: {
        aggregate: {
          count: 0,
        },
      },
      assessment: {
        ...defaultIssue.assessment!,
        Status: Issue_Assessment_Status_Enum.Pending,
        TargetCloseDate: '2034-10-03T00:00:00+00:00',
      },
    },
    {
      ...defaultIssue,
      actions_aggregate: {
        aggregate: {
          count: 0,
        },
      },
      assessment: {
        ...defaultIssue.assessment!,
        Status: Issue_Assessment_Status_Enum.Pending,
        TargetCloseDate: '2034-10-03T00:00:00+00:00',
      },
    },
  ];

  describe('Default Filters: when there are no saved custom ribbon settings', () => {
    describe('when there are no issues to filter and no edit permissions are granted', () => {
      beforeEach(async () => {
        createRender({});
        // await waitUntilLoaded();
        await waitFor(() => {
          defaultFilters.forEach((defaultFilter) => {
            expect(defaultFilter()).toBeInTheDocument();
          });
        });
      });

      it('should render the default ribbon with 4 dashboard items each with a 0 count for issues', () => {
        expect(dashboardItems()).toHaveLength(4);

        defaultFilters.forEach((defaultFilter) => {
          expect(defaultFilter()).toBeInTheDocument();
        });

        dashboardItems().forEach((item) => {
          const itemCount = item.querySelector('h1')?.textContent;
          expect(itemCount).toEqual('0');
        });
      });

      it('should not render an edit filter button', () => {
        expect(optionsButton()).not.toBeInTheDocument();
      });
    });

    describe('when there are some issues to filter and no edit permissions are granted', () => {
      beforeEach(async () => {
        createRender({ records });
        await waitFor(() => {
          defaultFilters.forEach((defaultFilter) => {
            expect(defaultFilter()).toBeInTheDocument();
          });
        });
      });

      it('should render the default ribbon with 4 items and correct issue count for each filter', () => {
        const dashboardItems = screen.getAllByTestId('dashboard-item');
        expect(dashboardItems).toHaveLength(4);
        defaultFilters.forEach((defaultFilter) => {
          expect(defaultFilter()).toBeInTheDocument();
        });

        expect(dashboardItems[0].querySelector('h1')?.textContent).toEqual('4');
        expect(dashboardItems[1].querySelector('h1')?.textContent).toEqual('1');
        expect(dashboardItems[2].querySelector('h1')?.textContent).toEqual('3');
        expect(dashboardItems[3].querySelector('h1')?.textContent).toEqual('5');
      });

      it('should not render an edit filter button', () => {
        expect(optionsButton()).not.toBeInTheDocument();
      });
    });
  });

  describe('when there are some issues to filter and edit permissions are granted', () => {
    beforeEach(async () => {
      createRender({
        records,
        permissions: [
          {
            AccessType: Access_Type_Enum.Update,
            ContributorType: Contributor_Type_Enum.Any,
            ObjectType: Parent_Type_Enum.CustomRibbon,
          },
          {
            AccessType: Access_Type_Enum.Insert,
            ContributorType: Contributor_Type_Enum.Any,
            ObjectType: Parent_Type_Enum.CustomRibbon,
          },
        ],
      });

      await waitFor(() => expect(optionsButton()).toBeInTheDocument());
    });

    it('should render an edit filter button', () => {
      expect(optionsButton()).toBeInTheDocument();
    });

    it("should render the Edit Filter Modal when the 'Edit Filter' button is clicked", async () => {
      createWrapper(optionsButton()!).click();
      await waitFor(() => expect(addAnotherFilterButton()).toBeInTheDocument());
    });

    it('should allow the user to create a new filter', async () => {
      createWrapper(optionsButton()!).click();
      await waitFor(() => expect(addAnotherFilterButton()).toBeInTheDocument());
      await userEvent.click(addAnotherFilterButton()!);
      expect(previewHeadings()).toHaveLength(5);
    });

    it('should allow the user to remove a filter', async () => {
      createWrapper(optionsButton()!).click();
      await waitFor(() => expect(addAnotherFilterButton()).toBeInTheDocument());

      const removeFilterDropdownButtons =
        screen.getAllByLabelText('Remove Filter');
      expect(removeFilterDropdownButtons).toHaveLength(4);

      createWrapper(deleteRibbonFilterButton(0)!)?.click();

      expect(previewHeadings()).toHaveLength(3);
    });
  });
});
