import {
  defaultSchema as storeDefaultSchema,
  defaultUISchema as storeDefaultUISchema,
  useFormBuilderStore,
} from '@risksmart-app/components/src/form-builder/store/useFormBuilderStore';
import type {
  CustomSchema,
  CustomUISchema,
} from '@risksmart-app/components/src/form-builder/types';
import type { GetRoleAccessQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import {
  Parent_Type_Enum,
  Questionnaire_Template_Version_Status_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { act, render, screen, waitFor } from '@testing-library/react';
import { clearPromises } from 'src/testing/clearPromises';
import { findFormContext } from 'src/testing/formHelpers';
import { mockedGetAggregationResponse } from 'src/testing/mock-data/mockedGetAggregationResponses';
import { mockedGetFormCustomisationResponse } from 'src/testing/mock-data/mockedGetFormCustomisationResponse';
import { mockedGetOrganisation } from 'src/testing/mock-data/mockedGetOrganisation';
import { mockedGetOrganisationModuleResponse } from 'src/testing/mock-data/mockedGetOrganisationModule';
import { mockedRoleAccessResponse } from 'src/testing/mock-data/mockedGetRoleAccessResponse';
import { mockedUsersResponse } from 'src/testing/mock-data/mockedUserResponses';
import { mockedUserSearchPreferencesResponses } from 'src/testing/mock-data/mockedUserSearchPreferencesResponses';
import type { Providers } from 'src/testing/wrapper';
import { getWrapper } from 'src/testing/wrapper';
import { vi } from 'vitest';

import QuestionnaireTemplateVersionForm from './QuestionnaireTemplateVersionForm';
import type { QuestionnaireTemplateVersionFormFieldData } from './questionnaireTemplateVersionSchema';
import { defaultValues as baseDefaultValues } from './questionnaireTemplateVersionSchema';

vi.mock('@risksmart-app/components/src/utils/environment');
vi.mock('@/utils/featureFlags');

describe('QuestionnaireTemplateVersionForm', () => {
  const publishButton = () => screen.queryByRole('button', { name: 'Publish' });
  const archiveButton = () => screen.queryByRole('button', { name: 'Archive' });
  const providers: Providers[] = [
    'trpc',
    'graphql',
    'permission',
    'notification',
    'router',
    'i18n',
    'features',
  ];
  const renderQuestionnaireTemplateVersionForm = async (
    formValues: Partial<QuestionnaireTemplateVersionFormFieldData>,
    saveStatus: Questionnaire_Template_Version_Status_Enum,
    roleAccess?: GetRoleAccessQuery,
    isCreatingNewEntity = true
  ) => {
    const result = render(
      <QuestionnaireTemplateVersionForm
        disableStatus={true}
        isCreatingNewEntity={isCreatingNewEntity}
        savedStatus={saveStatus}
        parentId={'123'}
        defaultValues={baseDefaultValues}
        values={
          {
            ...baseDefaultValues,
            ...formValues,
          } as QuestionnaireTemplateVersionFormFieldData
        }
        onSave={vi.fn()}
        onPublish={vi.fn()}
      />,

      {
        wrapper: getWrapper(
          [
            mockedGetOrganisation(),
            mockedRoleAccessResponse(roleAccess),
            mockedUsersResponse(),
            mockedGetFormCustomisationResponse([
              Parent_Type_Enum.QuestionnaireTemplateVersion,
            ]),
            mockedUserSearchPreferencesResponses(),
            mockedGetAggregationResponse(),
            mockedGetOrganisationModuleResponse(),
          ],
          ...providers
        ),
      }
    );

    await findFormContext();

    await act(async () => {
      await clearPromises();
    });

    return result;
  };

  it('Publish button visible when saved status is draft', async () => {
    await renderQuestionnaireTemplateVersionForm(
      {},
      Questionnaire_Template_Version_Status_Enum.Draft
    );

    expect(publishButton()).toBeInTheDocument();
  });

  it.each([
    { status: Questionnaire_Template_Version_Status_Enum.Archived },
    { status: Questionnaire_Template_Version_Status_Enum.Published },
  ])(
    'Publish button not visible when saved status is $status',
    async ({ status }) => {
      await renderQuestionnaireTemplateVersionForm({}, status);

      expect(publishButton()).not.toBeInTheDocument();
    }
  );

  it('Archive button visible when saved status is published', async () => {
    await renderQuestionnaireTemplateVersionForm(
      {},
      Questionnaire_Template_Version_Status_Enum.Published
    );

    expect(archiveButton()).toBeInTheDocument();
  });

  it.each([
    { status: Questionnaire_Template_Version_Status_Enum.Archived },
    { status: Questionnaire_Template_Version_Status_Enum.Draft },
  ])(
    'Archive button not visible when saved status is $status',
    async ({ status }) => {
      await renderQuestionnaireTemplateVersionForm({}, status);

      expect(archiveButton()).not.toBeInTheDocument();
    }
  );

  it('should initialize store with defaultValues.Schema and defaultValues.UISchema when values is undefined', async () => {
    const testSpecificDefaultSchema: CustomSchema = {
      type: 'object',
      properties: {
        testProp: {
          type: 'string',
          parentId: 'parentId1',
          isCustomisable: true,
          isPropertyRequired: true,
          allowAttachments: false,
        },
      },
    };
    const testSpecificDefaultUISchema: CustomUISchema = {
      type: 'VerticalLayout',
      elements: [
        { type: 'Control', scope: '#/properties/testProp', id: 'parentId1' },
      ],
    };

    const testDefaultValues: QuestionnaireTemplateVersionFormFieldData = {
      ...baseDefaultValues,
      Schema: testSpecificDefaultSchema,
      UISchema: testSpecificDefaultUISchema,
      Version: '1.0.0',
      Status: Questionnaire_Template_Version_Status_Enum.Draft,
    };

    act(() => {
      useFormBuilderStore.setState({
        schema: storeDefaultSchema,
        uiSchema: storeDefaultUISchema,
      });
    });

    render(
      <QuestionnaireTemplateVersionForm
        disableStatus={true}
        isCreatingNewEntity={true}
        savedStatus={Questionnaire_Template_Version_Status_Enum.Draft}
        parentId={'123'}
        defaultValues={testDefaultValues}
        onSave={vi.fn()}
        onPublish={vi.fn()}
      />,
      {
        wrapper: getWrapper(
          [
            mockedGetOrganisation(),
            mockedRoleAccessResponse(),
            mockedUsersResponse(),
            mockedGetFormCustomisationResponse([
              Parent_Type_Enum.QuestionnaireTemplateVersion,
            ]),
            mockedUserSearchPreferencesResponses(),
            mockedGetAggregationResponse(),
            mockedGetOrganisationModuleResponse(),
          ],
          ...providers
        ),
      }
    );

    await waitFor(() => {
      const state = useFormBuilderStore.getState();
      expect(state.schema).toEqual(testSpecificDefaultSchema);
      expect(state.uiSchema).toEqual(testSpecificDefaultUISchema);
    });
  });

  // TODO: Re-implement this once auto archiving is implemented (see file history)
  // See packages/web/src/pages/policy/update/tabs/files/forms/DocumentVersionForm.test.tsx for examples
});
