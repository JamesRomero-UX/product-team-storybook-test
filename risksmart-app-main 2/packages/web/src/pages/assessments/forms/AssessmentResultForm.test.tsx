import type {
  GetAssessmentsQuery,
  GetRiskListOnlyOptimizedQuery,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  findCustomisableFormContent,
  getFormField,
  getValidationMessage,
} from 'src/testing/formHelpers';
import { mockedDepartmentsResponse } from 'src/testing/mock-data/mockedDepartmentTypeResponses';
import { mockedGetAggregationResponse } from 'src/testing/mock-data/mockedGetAggregationResponses';
import { mockedGetAssessmentsResponse } from 'src/testing/mock-data/mockedGetAssessments';
import { mockedGetEntities } from 'src/testing/mock-data/mockedGetEntities';
import { mockedGetFormCustomisationResponse } from 'src/testing/mock-data/mockedGetFormCustomisationResponse';
import { mockedGetLatestRiskAssessmentResultConfig } from 'src/testing/mock-data/mockedGetLatestRiskAssessmentResultConfig';
import { mockedGetOrganisation } from 'src/testing/mock-data/mockedGetOrganisation';
import { mockedGetOrganisationModuleResponse } from 'src/testing/mock-data/mockedGetOrganisationModule';
import { mockedGetRiskListOnlyResponse } from 'src/testing/mock-data/mockedGetRiskListOnlyResponse';
import { mockedRoleAccessResponse } from 'src/testing/mock-data/mockedGetRoleAccessResponse';
import { mockedTagsResponse } from 'src/testing/mock-data/mockedTagTypeResponses';
import { stub } from 'src/testing/stub';
import type { Providers } from 'src/testing/wrapper';
import { getWrapper } from 'src/testing/wrapper';
import { vi } from 'vitest';

import type { Props } from './AssessmentResultForm';
import AssessmentResultForm from './AssessmentResultForm';
import { RiskAssessmentResultTestIds } from './RiskAssessmentResultTestIds';

vi.mock('@/utils/featureFlags');

describe('AssessmentResultForm', () => {
  const props: Props = {
    readonly: false,
    navigateToResults: true,
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

  const saveButton = () => screen.getByRole('button', { name: 'Save' });

  const riskId = '596fbe37-7c12-40d3-81b2-37e290c2bc0a';

  const risk: GetRiskListOnlyOptimizedQuery['risk'][number] = {
    Id: riskId,
    SequentialId: 1,
    Title: 'Risk 1',
  };
  const assessment: GetAssessmentsQuery['assessment'][number] = stub<
    GetAssessmentsQuery['assessment'][number]
  >({});

  const mockedResponses = [
    mockedGetEntities(),
    mockedGetOrganisation(),
    mockedRoleAccessResponse({ role_access: [] }),
    mockedGetOrganisationModuleResponse(),
    mockedGetFormCustomisationResponse([
      Parent_Type_Enum.ControlledRiskAssessmentResult,
      Parent_Type_Enum.UncontrolledRiskAssessmentResult,
      Parent_Type_Enum.RiskUncontrolledSecondLineResult,
      Parent_Type_Enum.RiskControlledSecondLineResult,
      Parent_Type_Enum.RiskControlledInternalAuditResult,
      Parent_Type_Enum.RiskUncontrolledInternalAuditResult,
    ]),
    mockedTagsResponse,
    mockedDepartmentsResponse,
    mockedGetRiskListOnlyResponse({
      risk: [risk],
    }),
    mockedGetAssessmentsResponse({
      assessment: [assessment],
    }),
    mockedGetAggregationResponse(),
    mockedGetLatestRiskAssessmentResultConfig(),
  ];

  it('should display a Type field', async () => {
    const { container } = render(<AssessmentResultForm {...props} />, {
      wrapper: getWrapper(mockedResponses, ...providers),
    });
    await findCustomisableFormContent();
    const type = getFormField(container, 'Type');
    expect(type?.getElement()).toBeDefined();
  });

  it('should NOT display a Type field if hideTypeSelector=true', async () => {
    const { container } = render(
      <AssessmentResultForm {...props} hideTypeSelector={true} />,
      {
        wrapper: getWrapper(mockedResponses, ...providers),
      }
    );
    await findCustomisableFormContent();
    const type = getFormField(container, 'Type');
    expect(type?.getElement()).toBeUndefined();
  });

  it('should not disable ControlType field when aggregation is turned off', async () => {
    const { container } = render(<AssessmentResultForm {...props} />, {
      wrapper: getWrapper(mockedResponses, ...providers),
    });
    await findCustomisableFormContent();
    const type = getFormField(
      container,
      RiskAssessmentResultTestIds.ControlType
    );
    expect(
      type?.findControl()?.findSelect()?.findTrigger().getElement()
    ).not.toBeDisabled();
  });

  it('should display an Assessment field by default', async () => {
    const { container } = render(<AssessmentResultForm {...props} />, {
      wrapper: getWrapper(mockedResponses, ...providers),
    });
    await findCustomisableFormContent();
    const risk = getFormField(
      container,
      RiskAssessmentResultTestIds.Assessment
    );
    expect(risk?.getElement()).toBeDefined();
  });

  it('should NOT display an Assessment field if a parentAssessment is specified', async () => {
    const { container } = render(
      <AssessmentResultForm
        {...props}
        parentAssessment={{ Id: '123', ancestorContributors: [] }}
      />,
      {
        wrapper: getWrapper(mockedResponses, ...providers),
      }
    );
    await findCustomisableFormContent();
    const risk = getFormField(
      container,
      RiskAssessmentResultTestIds.Assessment
    );
    expect(risk?.getElement()).toBeUndefined();
  });

  it('should display a Risk field with no risk selected by default', async () => {
    const { container } = render(<AssessmentResultForm {...props} />, {
      wrapper: getWrapper(mockedResponses, ...providers),
    });
    await findCustomisableFormContent();
    const risk = getFormField(container, RiskAssessmentResultTestIds.Risk);
    expect(risk?.getElement()).toBeDefined();

    const riskSelect = risk?.findControl()?.findMultiselect();
    riskSelect?.openDropdown();
    expect(riskSelect?.findDropdown().findSelectedOptions().length).toEqual(0);
  });

  it('should display a validation message when no risk selected and save clicked', async () => {
    const { container } = render(
      <AssessmentResultForm
        {...props}
        parentAssessment={{ Id: '123', ancestorContributors: [] }}
      />,
      {
        wrapper: getWrapper(mockedResponses, ...providers),
      }
    );
    await findCustomisableFormContent();

    await userEvent.click(saveButton());

    await waitFor(() => {
      getValidationMessage(container, RiskAssessmentResultTestIds.Risk);
    });

    expect(
      getValidationMessage(container, RiskAssessmentResultTestIds.Risk)
    ).toEqual('A rating must be linked to at least 1 risk');
  }, 10000);

  it('should display a Risk field with a risk selected when assessedItem is specified', async () => {
    const { container } = render(
      <AssessmentResultForm
        {...props}
        assessedItem={{
          Id: risk.Id,
          ancestorContributors: [],
        }}
      />,
      {
        wrapper: getWrapper(mockedResponses, ...providers),
      }
    );

    await findCustomisableFormContent();

    const riskField = getFormField(container, RiskAssessmentResultTestIds.Risk);
    expect(riskField?.getElement()).toBeDefined();

    const riskSelect = riskField?.findControl()?.findMultiselect();
    riskSelect?.openDropdown();
    expect(riskSelect?.findDropdown().findSelectedOptions().length).toEqual(1);
    expect(
      riskSelect
        ?.findDropdown()
        .findSelectedOptions()[0]
        .findLabel()
        .getElement().textContent
    ).toEqual(risk.Title);
  }, 10000);
});
