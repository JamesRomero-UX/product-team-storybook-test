import useRisksmartUser from '@risksmart-app/components/src/hooks/useRisksmartUser';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { getAllByRole, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PageWrapper } from 'src/components/form/form/PageWrapper';
import {
  getAlertMessage,
  getFormField,
  getSaveButton,
  getValidationMessage,
} from 'src/testing/formHelpers';
import { mockedGetFormCustomisationResponse } from 'src/testing/mock-data/mockedGetFormCustomisationResponse';
import { mockedGetImpactListResponse } from 'src/testing/mock-data/mockedGetImpactListResponse';
import { mockedGetOrganisation } from 'src/testing/mock-data/mockedGetOrganisation';
import { mockedGetOrganisationModuleResponse } from 'src/testing/mock-data/mockedGetOrganisationModule';
import { mockedUserGroupResponse } from 'src/testing/mock-data/mockedUserGroupResponses';
import { mockedUsersResponse } from 'src/testing/mock-data/mockedUserResponses';
import { mockedUserSearchPreferencesResponses } from 'src/testing/mock-data/mockedUserSearchPreferencesResponses';
import { testAuth0User } from 'src/testing/testUser';
import type { Providers } from 'src/testing/wrapper';
import { getWrapper } from 'src/testing/wrapper';
import { vi } from 'vitest';

import type { UserOption } from '../../../../../schemas/global';
import type { Props } from './MultipleImpactRatingsForm';
import MultipleImpactRatingsForm from './MultipleImpactRatingsForm';
import { TestIds } from './MultipleImpactRatingsFormFieldsTestIds';

describe('MultipleImpactRatingsForm', () => {
  vi.mock('@risksmart-app/components/src/hooks/useRisksmartUser');
  const userMock = vi.mocked(useRisksmartUser);

  beforeEach(() => {
    userMock.mockReturnValue(testAuth0User);
  });

  const impactId0 = '306f5d45-a50b-4770-b285-2b2829e55f5a';
  const impactId1 = '306f5d45-a50b-4770-b285-2b2829e55f5b';
  const impactId2 = '306f5d45-a50b-4770-b285-2b2829e55f5c';
  const impactListResponse = {
    impact: [
      {
        Id: impactId0,
        Name: 'Impact 1',
        Rationale: 'Rationale 1',
        RatingGuidance: '',
        SequentialId: 1,
        ancestorContributors: [],
      },
      {
        Id: impactId1,
        Name: 'Impact 2',
        Rationale: 'Rationale 2',
        RatingGuidance: '',
        SequentialId: 2,
        ancestorContributors: [],
      },
      {
        Id: impactId2,
        Name: 'Impact 3',
        Rationale: 'Rationale 3',
        RatingGuidance: '',
        SequentialId: 3,
        ancestorContributors: [],
      },
    ],
  };

  const ratings = [
    {
      ImpactId: impactId0,
      Rating: -1,
    },
    {
      ImpactId: impactId1,
      Rating: -1,
    },
    {
      ImpactId: impactId2,
      Rating: -1,
    },
  ];

  const defaultProps: Props = {
    onSave: vi.fn(),
    onDismiss: vi.fn(),
    impactId: impactId0,
    renderTemplate: (renderProps) => <PageWrapper {...renderProps} />,
    defaultValues: {
      CompletedBy: null as unknown as UserOption,
      TestDate: null as unknown as string,
      Ratings: ratings,
    },
  };

  const providers: Providers[] = [
    'router',
    'graphql',
    'notification',
    'features',
    'trpc',
  ];

  const mocks = [
    mockedGetOrganisationModuleResponse(),
    mockedGetOrganisation(),
    mockedGetFormCustomisationResponse([Parent_Type_Enum.ImpactRating]),
    mockedUserGroupResponse(),
    mockedUsersResponse(),
    mockedGetImpactListResponse(impactListResponse),
    mockedGetImpactListResponse(impactListResponse),
    mockedUserSearchPreferencesResponses(),
  ];

  it('advices user at least 1 impact is required for rating when no impacts in system', async () => {
    const { container } = render(
      <MultipleImpactRatingsForm
        {...defaultProps}
        defaultValues={{ Ratings: [], TestDate: '2024-01-01' }}
        onSave={vi.fn()}
      />,
      {
        wrapper: getWrapper(
          [
            mockedGetOrganisationModuleResponse(),
            mockedGetOrganisation(),
            mockedGetFormCustomisationResponse([Parent_Type_Enum.ImpactRating]),
            mockedUserGroupResponse(),
            mockedUsersResponse(),
            mockedGetImpactListResponse(),
            mockedGetImpactListResponse(),
            mockedUserSearchPreferencesResponses(),
          ],
          ...providers
        ),
      }
    );
    await waitFor(() => getSaveButton());
    await userEvent.click(getSaveButton());

    expect(getAlertMessage(container)).toEqual(
      'At least 1 impact required for rating'
    );
  });

  it('renders correct form fields', async () => {
    const { container } = render(
      <MultipleImpactRatingsForm {...defaultProps} />,
      {
        wrapper: getWrapper(mocks, ...providers),
      }
    );

    await waitFor(() => {
      expect(getAllByRole(container, 'radiogroup').length).toBe(4);

      expect(
        getFormField(container, TestIds.CompletedBy)?.getElement()
      ).toBeInTheDocument();

      expect(
        getFormField(container, TestIds.TestDate)?.getElement()
      ).toBeInTheDocument();
    });
  });

  describe('form validation', () => {
    const saveMock = vi.fn();
    it('displays correct error messages on empty form', async () => {
      const { container } = render(
        <MultipleImpactRatingsForm {...defaultProps} onSave={saveMock} />,
        {
          wrapper: getWrapper(mocks, ...providers),
        }
      );

      await waitFor(() => {
        expect(getAllByRole(container, 'radiogroup').length).toBe(4);
      });

      await userEvent.click(getSaveButton());

      expect(getAlertMessage(container)).toEqual('This form has errors');
      expect(getValidationMessage(container, TestIds.TestDate)).toEqual(
        'Required'
      );
      expect(getValidationMessage(container, TestIds.CompletedBy)).toEqual(
        'Required'
      );
      expect(saveMock).not.toHaveBeenCalled();
    });

    it("displays correct alert message when all ratings haven't had an option selected", async () => {
      const overrideProps = {
        CompletedBy: { value: '123', type: 'user' } as UserOption,
        TestDate: '2022-01-01',
        Ratings: ratings,
      };
      const { container } = render(
        <MultipleImpactRatingsForm
          {...defaultProps}
          onSave={saveMock}
          defaultValues={overrideProps}
        />,
        {
          wrapper: getWrapper(mocks, ...providers),
        }
      );

      await waitFor(() => {
        expect(getAllByRole(container, 'radiogroup').length).toBe(4);
      });

      await userEvent.click(getSaveButton());
      expect(getAlertMessage(container)).toEqual(
        'A rating must be provided for each impact'
      );
    });
  });
});
