import {
  GetRiskListOptimizedDocument,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PageWrapper } from 'src/components/form/form/PageWrapper';
import {
  findCustomisableFormContent,
  getAlertMessage,
  getFormField,
  getSaveButton,
  getValidationMessage,
} from 'src/testing/formHelpers';
import { mockedGetEntities } from 'src/testing/mock-data/mockedGetEntities';
import { mockedGetFormCustomisationResponse } from 'src/testing/mock-data/mockedGetFormCustomisationResponse';
import { mockedGetImpactListResponse } from 'src/testing/mock-data/mockedGetImpactListResponse';
import { mockedGetOrganisation } from 'src/testing/mock-data/mockedGetOrganisation';
import { mockedGetOrganisationModuleResponse } from 'src/testing/mock-data/mockedGetOrganisationModule';
import { mockedGetRiskListOnlyResponse } from 'src/testing/mock-data/mockedGetRiskListOnlyResponse';
import { mockedUserGroupResponse } from 'src/testing/mock-data/mockedUserGroupResponses';
import { mockedUsersResponse } from 'src/testing/mock-data/mockedUserResponses';
import { mockedUserSearchPreferencesResponses } from 'src/testing/mock-data/mockedUserSearchPreferencesResponses';
import type { Providers } from 'src/testing/wrapper';
import { getWrapper } from 'src/testing/wrapper';
import { vi } from 'vitest';

import type { Props } from './ImpactRatingForm';
import ImpactRatingForm from './ImpactRatingForm';
import { TestIds } from './ImpactRatingFormFieldsTestIds';

// Mock the hooks used by ControlledRiskSelect
vi.mock('@/hooks/useEntityLabelsFeature', () => ({
  useEntityLabelsFeature: vi.fn(() => ({
    shouldShowEntityLabels: false,
    entitiesEnabled: false,
    hasEntityFilter: false,
    isMultiEntityContext: false,
    entityFilterCount: 0,
  })),
}));

describe('ImpactRatingForm', () => {
  const impactId = '306f5d45-a50b-4770-b285-2b2829e55f5a';
  const defaultProps: Props = {
    onSave: vi.fn(),
    impactId,
    renderTemplate: (renderProps) => <PageWrapper {...renderProps} />,
  };

  const providers: Providers[] = [
    'router',
    'graphql',
    'features',
    'notification',
    'trpc',
  ];

  const getTestDate = (container: HTMLElement) =>
    getFormField(container, 'TestDate');

  const mocks = [
    mockedGetEntities(),
    mockedGetOrganisationModuleResponse(),
    mockedGetOrganisation(),
    mockedGetFormCustomisationResponse([Parent_Type_Enum.ImpactRating]),
    mockedUserGroupResponse(),
    mockedUsersResponse(),
    mockedGetRiskListOnlyResponse(),
    // Mock for ControlledRiskSelect basic query
    {
      request: {
        query: GetRiskListOptimizedDocument,
      },
      result: {
        data: {
          risk: [],
          node: [],
        },
      },
    },
    mockedGetImpactListResponse({
      impact: [
        {
          Id: impactId,
          Name: 'Impact 1123',
          Rationale: 'Rationale 123',
          RatingGuidance: '',
          SequentialId: 1,
        },
      ],
    }),
    mockedGetImpactListResponse({
      impact: [
        {
          Id: impactId,
          Name: 'Impact 1123',
          Rationale: 'Rationale 123',
          RatingGuidance: '',
          SequentialId: 1,
        },
      ],
    }),
    mockedUserSearchPreferencesResponses(),
  ];

  it('renders a Completed By field', async () => {
    const { container } = render(<ImpactRatingForm {...defaultProps} />, {
      wrapper: getWrapper(mocks, ...providers),
    });
    await findCustomisableFormContent();
    expect(
      getFormField(container, TestIds.CompletedBy)?.getElement()
    ).toBeInTheDocument();
  });

  it('renders a Test date field', async () => {
    const { container } = render(<ImpactRatingForm {...defaultProps} />, {
      wrapper: getWrapper(mocks, ...providers),
    });
    await findCustomisableFormContent();
    const control = await getTestDate(container);
    expect(control?.getElement()).toBeInTheDocument();
  });

  it('renders a Rating field', async () => {
    const { container } = render(<ImpactRatingForm {...defaultProps} />, {
      wrapper: getWrapper(mocks, ...providers),
    });
    await findCustomisableFormContent();
    expect(
      getFormField(container, TestIds.Rating)?.getElement()
    ).toBeInTheDocument();
  });

  it('renders an Impact field when impactId not set', async () => {
    const { container } = render(
      <ImpactRatingForm {...defaultProps} impactId={undefined} />,
      {
        wrapper: getWrapper(mocks, ...providers),
      }
    );
    await findCustomisableFormContent();
    expect(
      getFormField(container, TestIds.ImpactId)?.getElement()
    ).toBeInTheDocument();
  });

  it('does NOT render Impact field when impactId set', async () => {
    const { container } = render(
      <ImpactRatingForm
        {...defaultProps}
        impactId={'impact123'}
        ratedItemId={undefined}
      />,
      {
        wrapper: getWrapper(mocks, ...providers),
      }
    );
    await findCustomisableFormContent();
    expect(
      getFormField(container, TestIds.ImpactId)?.getElement()
    ).toBeUndefined();
  });

  it('does NOT render RatedItemId field when ratedItemId is set', async () => {
    const { container } = render(
      <ImpactRatingForm
        {...defaultProps}
        impactId={undefined}
        ratedItemId={'ratedItem123'}
      />,
      {
        wrapper: getWrapper(mocks, ...providers),
      }
    );
    await findCustomisableFormContent();
    expect(
      getFormField(container, TestIds.RatedItemId)?.getElement()
    ).toBeUndefined();
  });

  it('All fields are required', async () => {
    const saveMock = vi.fn();
    const { container } = render(
      <ImpactRatingForm {...defaultProps} onSave={saveMock} />,
      {
        wrapper: getWrapper(mocks, ...providers),
      }
    );
    await findCustomisableFormContent();
    await userEvent.click(getSaveButton());
    expect(getAlertMessage(container)).toEqual('This form has errors');
    expect(getValidationMessage(container, TestIds.TestDate)).toEqual(
      'Required'
    );
    expect(getValidationMessage(container, TestIds.Rating)).toEqual('Required');
    expect(getValidationMessage(container, TestIds.RatedItemId)).toEqual(
      'Required'
    );
    expect(getValidationMessage(container, TestIds.CompletedBy)).toEqual(
      'Required'
    );
    expect(saveMock).not.toHaveBeenCalled();
  });

  describe('when impactId not set', () => {
    const defaultProps: Props = {
      onSave: vi.fn(),
      ratedItemId: '306f5d45-a50b-4770-b285-2b2829e55f5a',
      renderTemplate: (renderProps) => <PageWrapper {...renderProps} />,
    };

    it('Only Impact is initially displayed', async () => {
      const saveMock = vi.fn();
      const { container } = render(
        <ImpactRatingForm {...defaultProps} onSave={saveMock} />,
        {
          wrapper: getWrapper(mocks, ...providers),
        }
      );
      await findCustomisableFormContent();
      await userEvent.click(getSaveButton());
      expect(
        getFormField(container, TestIds.ImpactId)?.getElement()
      ).toBeInTheDocument();
      expect(
        getFormField(container, TestIds.TestDate)?.getElement()
      ).toBeUndefined();
      expect(
        getFormField(container, TestIds.Rating)?.getElement()
      ).toBeUndefined();
      expect(
        getFormField(container, TestIds.RatedItemId)?.getElement()
      ).toBeUndefined();
      expect(
        getFormField(container, TestIds.CompletedBy)?.getElement()
      ).toBeUndefined();
      expect(saveMock).not.toHaveBeenCalled();
    });

    it('when an impact is selected, the remaining fields are displayed', async () => {
      const saveMock = vi.fn();
      const { container } = render(
        <ImpactRatingForm {...defaultProps} onSave={saveMock} />,
        {
          wrapper: getWrapper(mocks, ...providers),
        }
      );
      await findCustomisableFormContent();
      await userEvent.click(getSaveButton());

      getFormField(container, TestIds.ImpactId)!
        .findControl()!
        .findSelect()!
        .openDropdown();

      getFormField(container, TestIds.ImpactId)
        ?.findControl()
        ?.findSelect()
        ?.selectOption(1);

      getFormField(container, TestIds.ImpactId)
        ?.findControl()
        ?.findSelect()
        ?.closeDropdown();

      await waitFor(() =>
        getFormField(container, TestIds.TestDate)?.getElement()
      );

      expect(
        getFormField(container, TestIds.TestDate)?.getElement()
      ).toBeInTheDocument();

      expect(
        getFormField(container, TestIds.Rating)?.getElement()
      ).toBeInTheDocument();

      expect(
        getFormField(container, TestIds.CompletedBy)?.getElement()
      ).toBeInTheDocument();
    });
  });
});
