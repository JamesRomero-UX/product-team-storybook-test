import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { render } from '@testing-library/react';
import { PageWrapper } from 'src/components/form/form/PageWrapper';
import { useFeatures } from 'src/rbac/useFeatures';
import { findFormContext, getFormField } from 'src/testing/formHelpers';
import { mockedDepartmentsResponse } from 'src/testing/mock-data/mockedDepartmentTypeResponses';
import { mockedGetAggregationResponse } from 'src/testing/mock-data/mockedGetAggregationResponses';
import { mockedGetAppetitesGroupedByImpactResponse } from 'src/testing/mock-data/mockedGetAppetitesGroupedByImpact';
import { mockedGetFormCustomisationResponse } from 'src/testing/mock-data/mockedGetFormCustomisationResponse';
import { mockedGetLatestRiskAssessmentResultConfig } from 'src/testing/mock-data/mockedGetLatestRiskAssessmentResultConfig';
import { mockedGetOrganisationModuleResponse } from 'src/testing/mock-data/mockedGetOrganisationModule';
import { mockedGetRisksFlatResponse } from 'src/testing/mock-data/mockedGetRisksFlatResponse';
import { mockedRoleAccessResponse } from 'src/testing/mock-data/mockedGetRoleAccessResponse';
import { mockedTagsResponse } from 'src/testing/mock-data/mockedTagTypeResponses';
import { mockedUserGroupResponse } from 'src/testing/mock-data/mockedUserGroupResponses';
import { mockedUsersResponse } from 'src/testing/mock-data/mockedUserResponses';
import { getWrapper } from 'src/testing/wrapper';
import { vi } from 'vitest';

import { useRiskScores } from '@/hooks/useRiskScore';

import type { WidgetDataSource } from '../../gigawidget/types';
import getMyItemWidgets from '../../my-items/privateWidgets';
import { setWidgets as setMyItemWidgets } from '../../my-items/widgets';
import { dataSources } from '../../universal-widget/data-sources';
import { privateWidgets } from '../../widgetPrivate';
import { setWidgets } from '../../widgets';
import type { Props } from '../widget-settings-modal/WidgetSettingsForm';
import { WidgetSettingsForm } from '../widget-settings-modal/WidgetSettingsForm';
import { TestIds } from '../widget-settings-modal/WidgetSettingsFormFieldsTestIds';
setWidgets(privateWidgets);
setMyItemWidgets(getMyItemWidgets());

vi.mock('@/hooks/useRiskScore');
vi.mock('src/rbac/useFeatures');

const useRiskScoresMock = vi.mocked(useRiskScores);
const useFeaturesMock = vi.mocked(useFeatures);

describe('WidgetSettingsForm', () => {
  useRiskScoresMock.mockReturnValue({
    loading: false,
    showScore: false,
    scores: undefined,
  });
  useFeaturesMock.mockReturnValue([]);
  const defaultProps: Props<WidgetDataSource> = {
    renderTemplate: (renderProps) => <PageWrapper {...renderProps} />,
    settings: null,
    onSave: vi.fn(),
    onDismiss: vi.fn(),
    dataSource: dataSources.risk,
  };

  it('renders a property filter', async () => {
    const { container } = render(<WidgetSettingsForm {...defaultProps} />, {
      wrapper: getWrapper(
        [
          mockedGetFormCustomisationResponse([Parent_Type_Enum.Risk]),
          mockedGetFormCustomisationResponse([
            Parent_Type_Enum.UncontrolledRiskAssessmentResult,
            Parent_Type_Enum.ControlledRiskAssessmentResult,
          ]),
          mockedRoleAccessResponse(),
          mockedGetOrganisationModuleResponse(),
          mockedGetAggregationResponse(),
          mockedGetLatestRiskAssessmentResultConfig(),
          mockedDepartmentsResponse,
          mockedTagsResponse,
          mockedUsersResponse(),
          mockedUserGroupResponse(),
          mockedGetAppetitesGroupedByImpactResponse(),
          mockedGetRisksFlatResponse(
            {
              risk: [],
            },
            { where: {} }
          ),
        ],
        'router',
        'graphql',
        'dashboardFilter',
        'permission',
        'trpc'
      ),
    });
    await findFormContext();
    expect(
      getFormField(container, TestIds.Filtering)?.getElement()
    ).toBeDefined();
  });
});
