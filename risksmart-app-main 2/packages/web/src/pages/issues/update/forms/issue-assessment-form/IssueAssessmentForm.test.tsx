import i18n from '@risksmart-app/i18n/src/i18n';
import {
  Issue_Assessment_Status_Enum,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { render, screen } from '@testing-library/react';
import type { IssueAssessmentFields } from 'src/pages/issues/update/forms/issue-assessment-form/issueAssessmentSchema';
import { defaultValues } from 'src/pages/issues/update/forms/issue-assessment-form/issueAssessmentSchema';
import { findCustomisableFormContent } from 'src/testing/formHelpers';
import { mockedGetAggregationResponse } from 'src/testing/mock-data/mockedGetAggregationResponses';
import { mockedGetControlsBasicResponse } from 'src/testing/mock-data/mockedGetControlsBasicResponse';
import { mockedGetControlsResponse } from 'src/testing/mock-data/mockedGetControlsResponses';
import { mockedGetFormCustomisationResponse } from 'src/testing/mock-data/mockedGetFormCustomisationResponse';
import { mockedUserSearchPreferencesResponses } from 'src/testing/mock-data/mockedUserSearchPreferencesResponses';
import { TestFormProvider } from 'src/testing/TestFormProvider';
import { getWrapper } from 'src/testing/wrapper';
import { vi } from 'vitest';

import { defaultMocks } from '../../../../../testing/mock-data';
import IssueAssessmentForm from './IssueAssessmentForm';

vi.mock('@risksmart-app/components/src/utils/environment');
vi.mock('@/utils/featureFlags');

describe('IssueAssessmentForm', () => {
  const renderIssueForm = async (
    formValues: Partial<IssueAssessmentFields>
  ) => {
    render(
      <TestFormProvider
        values={{ ...defaultValues, ...formValues }}
        parentType={Parent_Type_Enum.IssueAssessment}
        includeCustomisableFormData={true}
      >
        <IssueAssessmentForm type={Parent_Type_Enum.Issue} />
      </TestFormProvider>,

      {
        wrapper: getWrapper(
          [
            ...defaultMocks,
            mockedGetControlsBasicResponse,
            mockedGetControlsResponse(),
            mockedGetFormCustomisationResponse([
              Parent_Type_Enum.IssueAssessment,
            ]),
            mockedUserSearchPreferencesResponses(),
            mockedGetAggregationResponse(),
          ],
          'graphql',
          'router',
          'features',
          'trpc'
        ),
      }
    );
    await findCustomisableFormContent();
  };

  it('does NOT show actual closed date when status is open', async () => {
    await renderIssueForm({
      Status: Issue_Assessment_Status_Enum.Open,
    });
    const closedDate = screen.queryAllByLabelText(
      i18n.t('issueAssessment.fields.ActualCloseDate') + ' (optional)'
    );

    expect(closedDate[0]).not.toBeDefined();
  });

  it('shows closed date when status is closed', async () => {
    await renderIssueForm({
      Status: Issue_Assessment_Status_Enum.Closed,
    });
    const closedDate = screen.queryAllByLabelText(
      i18n.t('issueAssessment.fields.ActualCloseDate') + ' (optional)'
    );

    expect(closedDate[0]).toBeDefined();
  });
});
