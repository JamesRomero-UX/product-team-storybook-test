import { render, screen } from '@testing-library/react';
import { mockedGetOrganisation } from 'src/testing/mock-data/mockedGetOrganisation';
import { mockedGetOrganisationModuleResponse } from 'src/testing/mock-data/mockedGetOrganisationModule';
import { mockedRoleAccessResponse } from 'src/testing/mock-data/mockedGetRoleAccessResponse';
import type { Providers } from 'src/testing/wrapper';
import { getWrapper } from 'src/testing/wrapper';
import { vi } from 'vitest';

import type { Props } from './UserSearchPreferencesForm';
import UserSearchPreferencesForm from './UserSearchPreferencesForm';

describe('UserSearchPreferencesForm', () => {
  const mocks = [
    mockedGetOrganisationModuleResponse(),
    mockedGetOrganisation(),
    mockedRoleAccessResponse(),
  ];

  const defaultProps: Props = {
    onSave: vi.fn(),
    showJobTitleToggle: true,
    showDirectoryDepartmentsToggle: true,
    showUserLocationToggle: true,
    showInheritedContributorsToggle: false,
  };
  const providers: Providers[] = [
    'trpc',
    'graphql',
    'permission',
    'notification',
    'router',
    'i18n',
    'features',
  ];

  it('shows Job Title toggle when showJobTitleToggle=true', async () => {
    render(
      <UserSearchPreferencesForm {...defaultProps} showJobTitleToggle={true} />,
      {
        wrapper: getWrapper(mocks, ...providers),
      }
    );
    await screen.findByText('Attributes');
    const control = screen.queryByLabelText('Show user job title');
    expect(control).toBeInTheDocument();
  });

  it('hides Job Title toggle when showJobTitleToggle=false', async () => {
    render(
      <UserSearchPreferencesForm
        {...defaultProps}
        showJobTitleToggle={false}
      />,
      {
        wrapper: getWrapper(mocks, ...providers),
      }
    );
    await screen.findByText('Attributes');
    const control = screen.queryByLabelText('Show user job title');
    expect(control).not.toBeInTheDocument();
  });

  it('hides user location toggle when showUserLocationToggle=false', async () => {
    render(
      <UserSearchPreferencesForm
        {...defaultProps}
        showUserLocationToggle={false}
      />,
      {
        wrapper: getWrapper(mocks, ...providers),
      }
    );
    await screen.findByText('Attributes');
    const control = screen.queryByLabelText('Show user location');
    expect(control).not.toBeInTheDocument();
  });

  it('shows user location toggle when showUserLocationToggle=true', async () => {
    render(
      <UserSearchPreferencesForm
        {...defaultProps}
        showUserLocationToggle={true}
      />,
      {
        wrapper: getWrapper(mocks, ...providers),
      }
    );
    await screen.findByText('Attributes');
    const control = screen.queryByLabelText('Show user location');
    expect(control).toBeInTheDocument();
  });

  it('hides user department toggle when showDirectoryDepartmentsToggle=false', async () => {
    render(
      <UserSearchPreferencesForm
        {...defaultProps}
        showDirectoryDepartmentsToggle={false}
      />,
      {
        wrapper: getWrapper(mocks, ...providers),
      }
    );
    await screen.findByText('Attributes');
    const control = screen.queryByLabelText('Show directory departments');
    expect(control).not.toBeInTheDocument();
  });

  it('shows user department toggle when showDirectoryDepartmentsToggle=true', async () => {
    render(
      <UserSearchPreferencesForm
        {...defaultProps}
        showDirectoryDepartmentsToggle={true}
      />,
      {
        wrapper: getWrapper(mocks, ...providers),
      }
    );
    await screen.findByText('Attributes');
    const control = screen.queryByLabelText('Show directory departments');
    expect(control).toBeInTheDocument();
  });

  it('hides inherited contributors toggle when showInheritedContributorsToggle=false', async () => {
    render(
      <UserSearchPreferencesForm
        {...defaultProps}
        showInheritedContributorsToggle={false}
      />,
      {
        wrapper: getWrapper(mocks, ...providers),
      }
    );
    await screen.findByText('Attributes');
    const control = screen.queryByLabelText('Show inherited owners');
    expect(control).not.toBeInTheDocument();
  });

  it('shows inherited contributors toggle when showInheritedContributorsToggle=true', async () => {
    render(
      <UserSearchPreferencesForm
        {...defaultProps}
        showInheritedContributorsToggle={true}
      />,
      {
        wrapper: getWrapper(mocks, ...providers),
      }
    );
    await screen.findByText('Attributes');
    const control = screen.queryByLabelText('Show inherited owners');
    expect(control).toBeInTheDocument();
  });
});
