import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PageWrapper } from 'src/components/form/form/PageWrapper';
import {
  findCustomisableFormContent,
  getAlertMessage,
  getFormField,
  getSaveButton,
} from 'src/testing/formHelpers';
import { mockedGetFormCustomisationResponse } from 'src/testing/mock-data/mockedGetFormCustomisationResponse';
import { mockedGetOrganisation } from 'src/testing/mock-data/mockedGetOrganisation';
import { mockedUserGroupResponse } from 'src/testing/mock-data/mockedUserGroupResponses';
import { mockedUsersResponse } from 'src/testing/mock-data/mockedUserResponses';
import { mockedUserSearchPreferencesResponses } from 'src/testing/mock-data/mockedUserSearchPreferencesResponses';
import type { Providers } from 'src/testing/wrapper';
import { getWrapper } from 'src/testing/wrapper';
import { vi } from 'vitest';

import type { Props } from './ImpactForm';
import ImpactForm from './ImpactForm';

vi.mock('@/components/Form/Editor/Editor', () => ({
  __esModule: true,
  default: () => <div>{'Editor'}</div>,
}));

vi.mock('@/utils/featureFlags');

describe('ImpactForm', () => {
  const defaultProps: Props = {
    onSave: vi.fn(),
    renderTemplate: (renderProps) => <PageWrapper {...renderProps} />,
  };

  const providers: Providers[] = [
    'router',
    'graphql',
    'features',
    'notification',
    'trpc',
  ];

  const getNameField = () => screen.getByLabelText('Name');
  const getRationaleField = () => screen.getByLabelText('Rationale (optional)');
  const getLikelihoodAppetiteField = () =>
    screen.getByLabelText('Likelihood appetite (optional)');

  const getOwnerField = () => screen.getByLabelText('Owner (optional)');

  const mocks = [
    mockedGetOrganisation(),
    mockedGetFormCustomisationResponse([Parent_Type_Enum.Impact]),
    mockedUserGroupResponse(),
    mockedUsersResponse(),
    mockedUserSearchPreferencesResponses(),
  ];

  it('renders a Name field', async () => {
    render(<ImpactForm {...defaultProps} />, {
      wrapper: getWrapper(mocks, ...providers),
    });
    await findCustomisableFormContent();
    expect(getNameField()).toBeInTheDocument();
  });

  it('renders a Rationale field', async () => {
    render(<ImpactForm {...defaultProps} />, {
      wrapper: getWrapper(mocks, ...providers),
    });
    await findCustomisableFormContent();
    expect(getRationaleField()).toBeInTheDocument();
  });

  it('renders an Owner field', async () => {
    render(<ImpactForm {...defaultProps} />, {
      wrapper: getWrapper(mocks, ...providers),
    });
    await findCustomisableFormContent();
    expect(getOwnerField()).toBeInTheDocument();
  });

  it('renders a Likelihood appetite field', async () => {
    render(<ImpactForm {...defaultProps} />, {
      wrapper: getWrapper(mocks, ...providers),
    });
    await findCustomisableFormContent();
    expect(getLikelihoodAppetiteField()).toBeInTheDocument();
  });

  it('Name field is required', async () => {
    const saveMock = vi.fn();
    const { container } = render(
      <ImpactForm {...defaultProps} onSave={saveMock} />,
      {
        wrapper: getWrapper(mocks, ...providers),
      }
    );
    await findCustomisableFormContent();
    await userEvent.click(getSaveButton());
    expect(getAlertMessage(container)).toEqual('This form has errors');
    expect(
      getFormField(container, 'name')?.findError()?.getElement().innerText
    ).toEqual('Required');
    expect(saveMock).not.toHaveBeenCalled();
  });

  it('Submits form if Name is set and Save clicked', async () => {
    const saveMock = vi.fn();
    const { container } = render(
      <ImpactForm {...defaultProps} onSave={saveMock} />,
      {
        wrapper: getWrapper(mocks, ...providers),
      }
    );
    await findCustomisableFormContent();
    await userEvent.type(getNameField(), 'My Impact Name');
    await userEvent.click(getSaveButton());
    expect(getAlertMessage(container)).toBeUndefined();
    expect(
      getFormField(container, 'Name')?.findError()?.getElement().innerText
    ).toBeUndefined();
    expect(saveMock).toHaveBeenCalled();
  });
});
