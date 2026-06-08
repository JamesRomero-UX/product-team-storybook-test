import { fireEvent, render, screen } from '@testing-library/react';
import { waitUntilLoaded } from 'src/testing/formHelpers';
import { mockedRoleAccessResponse } from 'src/testing/mock-data/mockedGetRoleAccessResponse';
import { mockedUserGroupResponse } from 'src/testing/mock-data/mockedUserGroupResponses';
import { defaultFormProviders, getWrapper } from 'src/testing/wrapper';

import { UserPreview } from './UserPreview';

describe('UserPreview', () => {
  it('renders a container with the users initials when the required approver is a user', () => {
    render(<UserPreview user={{ FriendlyName: 'Test User' }} />);

    expect(screen.getByTestId('user-preview-icon')).toHaveTextContent('T');
  });

  it('renders <Users01> when required approver is a group', () => {
    render(<UserPreview group={{ users: [] }} />);

    expect(screen.getByTestId('group-icon')).toBeInTheDocument();
    expect(
      screen.getByText('Any user from this group must approve')
    ).toBeInTheDocument();
  });

  it('renders <User01> when required approver is owner', async () => {
    render(<UserPreview owner={true} />);

    expect(screen.getByTestId('owner-icon')).toBeInTheDocument();
    expect(screen.getByText('Owner approval required')).toBeInTheDocument();
  });

  it('does not render comments when there are any if not clicked', () => {
    render(
      <UserPreview
        user={{ FriendlyName: 'Test User' }}
        comment={'Test comment'}
      />
    );

    expect(screen.queryByText('Test comment')).not.toBeInTheDocument();
  });

  it('renders comments when there are any if clicked', () => {
    render(
      <UserPreview
        user={{ FriendlyName: 'Test User' }}
        comment={'Test comment'}
      />
    );
    fireEvent.click(screen.getByText('Test User'));
    expect(screen.queryByText('Test comment')).toBeInTheDocument();
  });

  it('renders approval controls when active approver is the required approver', async () => {
    render(<UserPreview showApproveReject={true} comment={'Test comment'} />, {
      wrapper: getWrapper(
        [mockedUserGroupResponse(), mockedRoleAccessResponse()],
        ...defaultFormProviders
      ),
    });

    await waitUntilLoaded();

    expect(screen.getByLabelText('Comment')).toBeInTheDocument();
    expect(screen.getByText('Approve')).toBeInTheDocument();
    expect(screen.getByText('Reject')).toBeInTheDocument();
  });
});
