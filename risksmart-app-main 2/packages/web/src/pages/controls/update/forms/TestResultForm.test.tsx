import type { GetRoleAccessQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { when } from 'jest-when';
import { PageWrapper } from 'src/components/form/form/PageWrapper';
import { clearPromises } from 'src/testing/clearPromises';
import {
  findCustomisableFormContent,
  getFormField,
} from 'src/testing/formHelpers';
import { mockedGetAggregationResponse } from 'src/testing/mock-data/mockedGetAggregationResponses';
import { mockedGetControlsBasicResponse } from 'src/testing/mock-data/mockedGetControlsBasicResponse';
import { mockedGetFormCustomisationResponse } from 'src/testing/mock-data/mockedGetFormCustomisationResponse';
import { mockedGetOrganisation } from 'src/testing/mock-data/mockedGetOrganisation';
import { mockedRoleAccessResponse } from 'src/testing/mock-data/mockedGetRoleAccessResponse';
import { mockedUsersResponse } from 'src/testing/mock-data/mockedUserResponses';
import { mockedUserSearchPreferencesResponses } from 'src/testing/mock-data/mockedUserSearchPreferencesResponses';
import type { Providers } from 'src/testing/wrapper';
import { getWrapper } from 'src/testing/wrapper';
import { vi } from 'vitest';

import { useIsModuleEnabled } from '@/hooks/useIsModuleEnabled';

import TestResultForm from './TestResultForm';
import { TestIds } from './TestResultFormFieldsTestIds';
import type { TestResultFormFieldsData } from './testResultSchema';
import { defaultValues } from './testResultSchema';

vi.mock('@risksmart-app/components/src/utils/environment');
vi.mock('@/hooks/useIsModuleEnabled');
const useIsModuleEnabledMock = vi.mocked(useIsModuleEnabled);

describe('TestResultForm', () => {
  const providers: Providers[] = [
    'trpc',
    'graphql',
    'permission',
    'notification',
    'router',
    'i18n',
    'features',
  ];
  const saveButton = () => screen.getByRole('button', { name: 'Save' });

  const renderTestResultForm = async (
    formValues: Partial<TestResultFormFieldsData>,
    roleAccess?: GetRoleAccessQuery
  ) => {
    const result = render(
      <TestResultForm
        renderTemplate={(renderProps) => <PageWrapper {...renderProps} />}
        defaultValues={defaultValues}
        values={{ ...defaultValues, ...formValues } as TestResultFormFieldsData}
        onSave={vi.fn()}
        assessmentMode={'rating'}
      />,

      {
        wrapper: getWrapper(
          [
            mockedGetOrganisation(),
            mockedRoleAccessResponse(roleAccess),
            mockedUsersResponse(),
            mockedGetControlsBasicResponse,
            mockedGetFormCustomisationResponse([Parent_Type_Enum.TestResult]),
            mockedUserSearchPreferencesResponses(),
            mockedGetAggregationResponse(),
          ],
          ...providers
        ),
      }
    );
    await findCustomisableFormContent();
    await act(async () => {
      await clearPromises();
    });

    return result;
  };

  it('Control test result is required by default', async () => {
    const { container } = await renderTestResultForm({});
    fireEvent.click(saveButton());
    expect(await screen.findByText('This form has errors')).toBeInTheDocument();
    expect(
      getFormField(container, TestIds.OverallEffectiveness)
        ?.findError()
        ?.getElement().textContent
    ).toEqual('Required');
  });

  it('Control Test type shown', async () => {
    const { container } = await renderTestResultForm({});
    expect(getFormField(container, TestIds.TestType)).not.toBeNull();
  });

  it('Control Test type hidden if internal_audit feature enabled', async () => {
    when(useIsModuleEnabledMock)
      .calledWith('internal_audit_entity')
      .mockReturnValue(true);
    const { container } = await renderTestResultForm({});
    expect(getFormField(container, TestIds.TestType)).toBeNull();
  });

  it('Control Test type hidden if compliance_monitoring feature enabled', async () => {
    when(useIsModuleEnabledMock)
      .calledWith('obligation.subModules.compliance_monitoring_assessment')
      .mockReturnValue(true);
    const { container } = await renderTestResultForm({});
    expect(getFormField(container, TestIds.TestType)).toBeNull();
  });
});
