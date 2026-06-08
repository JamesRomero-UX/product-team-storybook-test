import { Approval_Rule_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { act, render, screen } from '@testing-library/react';
import { getFormField } from 'src/testing/formHelpers';
import { mockedGetAggregationResponse } from 'src/testing/mock-data/mockedGetAggregationResponses';
import { mockedGetChangeRequestByApprovalResponse } from 'src/testing/mock-data/mockedGetChangeRequestByApprovalResponse';
import { mockedGetGlobalApprovalsEmptyResponse } from 'src/testing/mock-data/mockedGetGlobalApprovalsResponse';
import { mockedGetObjectTypeByIdResponse } from 'src/testing/mock-data/mockedGetObjectTypeByIdResponse';
import { mockedGetOwnersAndContributorsResponse } from 'src/testing/mock-data/mockedGetOwnersAndContributorsResponse';
import { mockedUserSearchPreferencesResponses } from 'src/testing/mock-data/mockedUserSearchPreferencesResponses';
import { TestFormProvider } from 'src/testing/TestFormProvider';
import { defaultFormProviders, getWrapper } from 'src/testing/wrapper';

import { defaultMocks } from '../../../../../testing/mock-data';
import ApprovalFormFields from './ApprovalFormFields';
import type { ApprovalFormValues } from './approvalFormSchema';
import { defaultValues } from './approvalFormSchema';

describe('ApprovalFormFields', () => {
  const testMocks = [
    ...defaultMocks,
    mockedGetAggregationResponse(),
    mockedGetChangeRequestByApprovalResponse,
    mockedGetGlobalApprovalsEmptyResponse(),
    mockedGetObjectTypeByIdResponse,
    mockedUserSearchPreferencesResponses(),
    mockedGetOwnersAndContributorsResponse,
  ];
  const renderForm = async (formValues: Partial<ApprovalFormValues>) => {
    const { container } = render(
      <TestFormProvider values={{ ...defaultValues, ...formValues }}>
        <ApprovalFormFields />
      </TestFormProvider>,
      {
        wrapper: getWrapper(testMocks, ...defaultFormProviders),
      }
    );

    await screen.findByTestId('approval-form-fields');

    return container;
  };

  it('renders all the fields', async () => {
    const container = await renderForm({
      Workflow: 'publish-document-version',
      InFlightEditRule: 'approvers',
      levels: [
        {
          Id: '1',
          ApprovalRuleType: Approval_Rule_Type_Enum.AllApprove,
          approvers: [
            {
              Id: 'approver-id-1',
              user: {
                FriendlyName: 'User 1',
              },
            },
          ],
        },
      ],
    });

    expect(container.querySelectorAll('label').length).toEqual(5);
    container.querySelectorAll('label').forEach((label) => {
      // Note the annoying whitespace
      expect(
        [
          'Workflow ',
          'Level 1 ',
          'Approval Levels ',
          'Who can amend an in-flight request? ',
          ' ', // Approval Level Rule (ControlledApprovalLevels.tsx line 225)
        ].indexOf(label.textContent!)
      ).toBeGreaterThan(-1);
    });
  });

  it('renders the workflow options', async () => {
    const container = await renderForm({
      Workflow: 'publish-document-version',
      InFlightEditRule: 'approvers',
      levels: [
        {
          Id: '1',
          ApprovalRuleType: Approval_Rule_Type_Enum.AllApprove,
          approvers: [
            {
              Id: 'approver-id-1',
              user: {
                FriendlyName: 'User 1',
              },
            },
          ],
        },
      ],
    });

    const select = getFormField(container, 'workflow')
      ?.findControl()
      ?.findSelect();

    act(() => select?.openDropdown());

    expect(select?.findDropdown().findOptions().length).toEqual(14);
    select
      ?.findDropdown()
      .findOptions()
      .forEach((option) => {
        expect(
          [
            'Publish Version',
            'Open Acceptance',
            'Delete Risk',
            'Delete Control',
            'Delete Issue',
            'Delete Acceptance',
            'Action closure',
            'Delete Action',
            'Close Issue',
            'Update Risk details',
            'Update Action details',
            'Update Control details',
            'Update Action target close date',
            'Update Issue assessment target close date',
          ].indexOf(option.findLabel().getElement().textContent!)
        ).toBeGreaterThan(-1);
      });
  });
});
