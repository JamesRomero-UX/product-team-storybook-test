import createWrapper from '@risk-smart/themed-cloudscape-components/test-utils/dom';
import type {
  GetRoleAccessQuery,
  GetUserGroupsWithApproversQuery,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { render, screen, waitFor } from '@testing-library/react';
import { waitUntilLoaded } from 'src/testing/formHelpers';
import { mockedDepartmentsResponse } from 'src/testing/mock-data/mockedDepartmentTypeResponses';
import { mockedGetOrganisation } from 'src/testing/mock-data/mockedGetOrganisation';
import { mockedGetOrganisationModuleResponse } from 'src/testing/mock-data/mockedGetOrganisationModule';
import { mockedRoleAccessResponse } from 'src/testing/mock-data/mockedGetRoleAccessResponse';
import { mockedGetUserGroupsWithApproversResponse } from 'src/testing/mock-data/mockedGetUserGroupsWithApproversResponse';
import { mockedGetUserTablePreferences } from 'src/testing/mock-data/mockedGetUserTablePreferences';
import { mockedUserGroupResponse } from 'src/testing/mock-data/mockedUserGroupResponses';
import { mockedUsersResponse } from 'src/testing/mock-data/mockedUserResponses';
import { waitForTableHeaders } from 'src/testing/tableHelpers';
import { getWrapper } from 'src/testing/wrapper';

import GroupsTab from './Tab';

const createRender = ({
  records,
  permissions,
}: {
  records: GetUserGroupsWithApproversQuery;
  permissions: GetRoleAccessQuery['role_access'];
}) => {
  return render(<GroupsTab />, {
    wrapper: getWrapper(
      [
        mockedGetOrganisationModuleResponse(),
        mockedDepartmentsResponse,
        mockedUsersResponse(),
        mockedUserGroupResponse(),
        mockedGetUserGroupsWithApproversResponse(records),
        mockedRoleAccessResponse({ role_access: permissions || [] }),
        mockedGetUserTablePreferences('userGroupRegister'),
        mockedGetOrganisation(),
        mockedGetOrganisationModuleResponse(),
      ],
      'permission',
      'graphql',
      'router',
      'features',
      'trpc'
    ),
  });
};

const buildUserGroup = (name: string, id: string, approver_count?: number) => ({
  Name: name,
  Id: id,
  approvers_aggregate: { aggregate: { count: approver_count ?? 0 } },
  OwnerContributor: false,
  CreatedAtTimestamp: '2021-01-01T00:00:00Z',
  ModifiedAtTimestamp: '2021-01-01T00:00:00Z',
  users_aggregate: { aggregate: { count: 1 } },
});

describe('User Group Tab', () => {
  it('renders title', async () => {
    createRender({ records: { user_group: [] }, permissions: [] });
    await waitUntilLoaded();

    expect(screen.getByText('Groups')).toBeInTheDocument();
  });

  it('renders items', async () => {
    createRender({
      records: {
        user_group: [
          buildUserGroup('Group 1', 'group-1', 0),
          buildUserGroup('Group 2', 'group-2', 1),
        ],
      },
      permissions: [],
    });

    await waitFor(() => {
      expect(screen.getByText('Group 1')).toBeInTheDocument();
      expect(screen.getByText('Group 2')).toBeInTheDocument();
    });
  });

  it('renders delete modal without warning when group with no approvals selected', async () => {
    const { container } = createRender({
      records: {
        user_group: [
          buildUserGroup('Group 1', 'group-1', 0),
          buildUserGroup('Group 2', 'group-2', 1),
        ],
      },
      permissions: [],
    });
    await waitForTableHeaders(container);

    const wrapper = createWrapper(container);
    const tableWrapper = wrapper.findTable();

    tableWrapper!.findRowSelectionArea(1)!.click();
    await waitFor(() => {
      expect(
        screen.queryByText('Are you sure you want to delete these groups?')
      ).toBeInTheDocument();
    });
  });

  it('renders delete modal with a warning when group with approvals selected', async () => {
    const { container } = createRender({
      records: {
        user_group: [
          buildUserGroup('Group 1', 'group-1', 0),
          buildUserGroup('Group 2', 'group-2', 1),
        ],
      },
      permissions: [],
    });
    await waitUntilLoaded();

    const wrapper = createWrapper(container);
    const tableWrapper = wrapper.findTable();
    await waitFor(() => expect(tableWrapper).toBeTruthy());

    tableWrapper!.findRowSelectionArea(2)!.click();

    expect(
      screen.queryByText(
        'The following groups cannot be deleted because they are linked to one or more approval workflows. Please remove them from the workflows first.'
      )
    ).toBeInTheDocument();
  });
});
