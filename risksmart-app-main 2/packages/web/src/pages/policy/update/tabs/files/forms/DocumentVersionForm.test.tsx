import type { GetRoleAccessQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import {
  Parent_Type_Enum,
  Version_Status_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { RenderResult } from '@testing-library/react';
import { act, render, screen, waitFor } from '@testing-library/react';
import { clearPromises } from 'src/testing/clearPromises';
import {
  findCustomisableFormContent,
  getFormField,
} from 'src/testing/formHelpers';
import { mockedGetAggregationResponse } from 'src/testing/mock-data/mockedGetAggregationResponses';
import { mockedGetFormCustomisationResponse } from 'src/testing/mock-data/mockedGetFormCustomisationResponse';
import {
  mockedGetGlobalApprovalsEmptyResponse,
  mockedGetGlobalApprovalsResponse,
} from 'src/testing/mock-data/mockedGetGlobalApprovalsResponse';
import { mockedGetOrganisation } from 'src/testing/mock-data/mockedGetOrganisation';
import { mockedGetOrganisationModuleResponse } from 'src/testing/mock-data/mockedGetOrganisationModule';
import { mockedRoleAccessResponse } from 'src/testing/mock-data/mockedGetRoleAccessResponse';
import { mockedUsersResponse } from 'src/testing/mock-data/mockedUserResponses';
import { mockedUserSearchPreferencesResponses } from 'src/testing/mock-data/mockedUserSearchPreferencesResponses';
import type { Providers } from 'src/testing/wrapper';
import { getWrapper } from 'src/testing/wrapper';
import { vi } from 'vitest';

import type { DocumentVersionFormFieldData } from './documentFileSchema';
import { defaultValues } from './documentFileSchema';
import DocumentVersionForm from './DocumentVersionForm';

vi.mock('@risksmart-app/components/src/utils/environment');
vi.mock('@/utils/featureFlags');

describe('DocumentVersionForm', () => {
  const providers: Providers[] = [
    'trpc',
    'graphql',
    'permission',
    'notification',
    'router',
    'i18n',
    'features',
  ];
  const publishButton = () => screen.queryByRole('button', { name: 'Publish' });
  const submitForApprovalButton = () =>
    screen.queryByRole('button', { name: 'Submit for Approval' });
  const archiveButton = () => screen.queryByRole('button', { name: 'Archive' });
  const version = (renderResult: RenderResult) =>
    getFormField(renderResult.container, 'version')?.findControl()?.findInput();
  const summary = (renderResult: RenderResult) =>
    getFormField(renderResult.container, 'summary')
      ?.findControl()
      ?.findTextarea()
      ?.getElement().children[0];
  const status = (renderResult: RenderResult) =>
    getFormField(renderResult.container, 'status')?.findControl()?.findSelect();

  const reasonForReview = (renderResult: RenderResult) =>
    getFormField(renderResult.container, 'reasonForReview')
      ?.findControl()
      ?.findAutosuggest();
  const reviewedBy = (renderResult: RenderResult) =>
    getFormField(renderResult.container, 'reviewedBy')
      ?.findControl()
      ?.findSelect();
  const reviewDate = (renderResult: RenderResult) =>
    getFormField(renderResult.container, 'reviewDate')
      ?.findControl()
      ?.findDatePicker();
  const nextReviewDate = (renderResult: RenderResult) =>
    getFormField(renderResult.container, 'nextReviewDate')
      ?.findControl()
      ?.findDatePicker();

  const renderDocumentFileForm = async (
    formValues: Partial<DocumentVersionFormFieldData>,
    saveStatus: Version_Status_Enum,
    roleAccess?: GetRoleAccessQuery,
    withApproval?: boolean
  ) => {
    const result = render(
      <DocumentVersionForm
        disableStatus={true}
        isCreatingNewEntity={true}
        editorRef={{ current: null }}
        savedStatus={saveStatus}
        parentId={'123'}
        defaultValues={defaultValues}
        values={
          { ...defaultValues, ...formValues } as DocumentVersionFormFieldData
        }
        onSave={vi.fn()}
        hasPendingChangeRequests={false}
      />,

      {
        wrapper: getWrapper(
          [
            mockedGetOrganisation(),
            mockedRoleAccessResponse(roleAccess),
            mockedUsersResponse(),
            mockedGetFormCustomisationResponse([Parent_Type_Enum.DocumentFile]),
            mockedUserSearchPreferencesResponses(),
            mockedGetOrganisationModuleResponse(),
            mockedGetAggregationResponse(),
            withApproval
              ? mockedGetGlobalApprovalsResponse('123')
              : mockedGetGlobalApprovalsEmptyResponse('123'),
            mockedGetOrganisation(),
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

  it('Publish button visible when saved status is draft and there are no approval workflows', async () => {
    await renderDocumentFileForm({}, Version_Status_Enum.Draft);
    expect(publishButton()).toBeInTheDocument();
  });

  it('Submit for approval button visible when saved status is draft and there is an approval workflow', async () => {
    await renderDocumentFileForm(
      {},
      Version_Status_Enum.Draft,
      undefined,
      true
    );
    expect(submitForApprovalButton()).toBeInTheDocument();
  });

  it.each([
    { status: Version_Status_Enum.Archived },
    { status: Version_Status_Enum.Published },
  ])(
    'Publish button not visible when saved status is $status',
    async ({ status }) => {
      await renderDocumentFileForm({}, status);
      expect(publishButton()).not.toBeInTheDocument();
    }
  );

  it('Archive button visible when saved status is published', async () => {
    await renderDocumentFileForm({}, Version_Status_Enum.Published);
    expect(archiveButton()).toBeInTheDocument();
  });

  it.each([
    { status: Version_Status_Enum.Archived },
    { status: Version_Status_Enum.Draft },
  ])(
    'Archive button not visible when saved status is $status',
    async ({ status }) => {
      await renderDocumentFileForm({}, status);
      expect(archiveButton()).not.toBeInTheDocument();
    }
  );

  it('Review fields visible when status is Published', async () => {
    const renderResult = await renderDocumentFileForm(
      {
        Status: Version_Status_Enum.Published,
      },
      Version_Status_Enum.Published
    );

    await waitFor(() => {
      expect(reasonForReview(renderResult)?.getElement()).toBeInTheDocument();
      expect(reviewedBy(renderResult)?.getElement()).toBeInTheDocument();
      expect(reviewDate(renderResult)?.getElement()).toBeInTheDocument();
      expect(nextReviewDate(renderResult)?.getElement()).toBeInTheDocument();
    });
  });

  it('Review fields visible when form was saved as Archived', async () => {
    const renderResult = await renderDocumentFileForm(
      {},
      Version_Status_Enum.Archived
    );

    await waitFor(() => {
      expect(reasonForReview(renderResult)?.getElement()).toBeInTheDocument();
      expect(reviewedBy(renderResult)?.getElement()).toBeInTheDocument();
      expect(reviewDate(renderResult)?.getElement()).toBeInTheDocument();
      expect(nextReviewDate(renderResult)?.getElement()).toBeInTheDocument();
    });
  });

  it('Review fields hidden for Draft status', async () => {
    const renderResult = await renderDocumentFileForm(
      {
        Status: Version_Status_Enum.Draft,
      },
      Version_Status_Enum.Draft
    );

    await waitFor(() => {
      expect(reasonForReview(renderResult)).toBeUndefined();
      expect(reviewedBy(renderResult)).toBeUndefined();
      expect(reviewDate(renderResult)).toBeUndefined();
      expect(nextReviewDate(renderResult)).toBeUndefined();
    });
  });

  it('Form is disabled when previously saved as archived and user does not have update:document-file permission any item (e.g. Standard user)', async () => {
    const renderResult = await renderDocumentFileForm(
      {},
      Version_Status_Enum.Archived
    );

    await waitFor(() => {
      expect(version(renderResult)?.isDisabled()).toBeTruthy();
      expect(summary(renderResult)?.hasAttribute('disabled')).toBeTruthy();
      expect(status(renderResult)?.isDisabled()).toBeTruthy();
      expect(reasonForReview(renderResult)?.isDisabled()).toBeTruthy();
      expect(reviewedBy(renderResult)?.isDisabled()).toBeTruthy();
      expect(reviewDate(renderResult)?.isDisabled()).toBeTruthy();
      expect(nextReviewDate(renderResult)?.isDisabled()).toBeTruthy();
    });
  });

  it('Form is disabled (except for review and summary fields) when previously saved as archived and user does have update:document-file permission any item (e.g. Risk Manager)', async () => {
    const renderResult = await renderDocumentFileForm(
      {},
      Version_Status_Enum.Archived,
      {
        role_access: [
          {
            ObjectType: 'document_file',
            AccessType: 'update',
            ContributorType: 'any',
          },
        ],
      }
    );
    await waitFor(() => {
      expect(version(renderResult)?.isDisabled()).toBeTruthy();
      expect(summary(renderResult)?.hasAttribute('disabled')).toBeFalsy();
      expect(status(renderResult)?.isDisabled()).toBeTruthy();
      expect(reasonForReview(renderResult)?.isDisabled()).toBeFalsy();
      expect(reviewedBy(renderResult)?.isDisabled()).toBeFalsy();
      expect(reviewDate(renderResult)?.isDisabled()).toBeFalsy();
      expect(nextReviewDate(renderResult)?.isDisabled()).toBeFalsy();
    });
  });
});
