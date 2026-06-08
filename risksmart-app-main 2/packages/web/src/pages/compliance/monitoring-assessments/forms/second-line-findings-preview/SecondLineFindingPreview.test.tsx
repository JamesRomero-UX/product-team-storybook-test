import createWrapper from '@risk-smart/themed-cloudscape-components/test-utils/dom';
import type { GetSecondLineResultsByParentIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { render, screen } from '@testing-library/react';
import {
  waitUntilLoaded,
  waitUntilLoadedDoesNotExist,
} from 'src/testing/formHelpers';
import { mockedGetAggregationResponse } from 'src/testing/mock-data/mockedGetAggregationResponses';
import { defaultFormProviders, getWrapper } from 'src/testing/wrapper';

import { mockedRoleAccessResponse } from '../../../../../testing/mock-data/mockedGetRoleAccessResponse';
import { mockedGetSecondLineResultsByParentIdResponse } from '../../../../../testing/mock-data/mockedGetSecondLineResultsByParentIdResponse';
import SecondLineFindingPreview from './SecondLineFindingPreview';

describe('SecondLineFindingPreview', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  type Action = GetSecondLineResultsByParentIdQuery['action'][number];
  type Impact = GetSecondLineResultsByParentIdQuery['impact'][number];
  type Issue = GetSecondLineResultsByParentIdQuery['issue'][number];
  type TestResult =
    GetSecondLineResultsByParentIdQuery['control_test_second_line_result'][number];

  type TestResultParent = TestResult['parent'];

  type ImpactRating =
    GetSecondLineResultsByParentIdQuery['impact_second_line_rating'][number];

  const defaultAction: Action = {
    DateDue: '2024-07-03T00:00:00+00:00',
    DateRaised: '2024-07-02T00:00:00+00:00',
    Description: 'few',
    Id: '68cfb25d-0f59-49c1-ade2-501804d9ed58',
    Priority: 3,
    Status: 'open',
    ModifiedAtTimestamp: '2024-07-02T07:36:06.18636+00:00',
    CreatedAtTimestamp: '2024-07-02T07:36:06.18636+00:00',
    Title: 'Test action',
    CreatedByUser: 'auth0|644151efc3a961d2784456d9',
    ModifiedByUser: 'auth0|644151efc3a961d2784456d9',
    ClosedDate: null,
    CustomAttributeData: null,
    SequentialId: 4,
    __typename: 'action',
    parents: [],
    updates: [],
    updates_aggregate: {
      aggregate: {
        count: 0,
        __typename: 'action_update_aggregate_fields',
      },
      __typename: 'action_update_aggregate',
    },
    owners: [],
    ownerGroups: [],
    contributors: [],
    contributorGroups: [],
    ancestorContributors: [],
    modifiedByUser: {
      FriendlyName: 'RiskManager1',
      __typename: 'user',
    },
    createdByUser: {
      FriendlyName: 'RiskManager1',
      __typename: 'user',
    },
    tags: [],
    departments: [],
  };

  const defaultImpact: Impact = {
    CreatedAtTimestamp: '2024-07-02T09:07:39.655768+00:00',
    CreatedByUser: 'auth0|644151efc3a961d2784456d9',
    Rationale: '',
    RatingGuidance: '',
    Id: 'b7210f8f-1f04-47e7-bd9b-7bbb1e28acc5',
    ModifiedAtTimestamp: '2024-07-02T09:07:39.655768+00:00',
    ModifiedByUser: 'auth0|644151efc3a961d2784456d9',
    Name: 'Impact 1',
    CustomAttributeData: null,
    SequentialId: 2,
    LikelihoodAppetite: null,
    __typename: 'impact',
    createdByUser: {
      FriendlyName: 'RiskManager1',
      __typename: 'user',
    },
    owners: [],
    ownerGroups: [],
    ratings: [],
    appetites: [],
  };

  const defaultIssue: Issue = {
    DateIdentified: '2024-07-02T00:00:00+00:00',
    RaisedAtTimestamp: '2024-07-02T09:08:37.255185+00:00',
    DateOccurred: '2024-07-02T00:00:00+00:00',
    Details: 'qwdfqwd',
    Id: '5dedfd6a-da71-45f2-9d10-6dd497225161',
    ImpactsCustomer: false,
    IsExternalIssue: true,
    CreatedAtTimestamp: '2024-07-02T09:08:37.255185+00:00',
    ModifiedAtTimestamp: '2024-07-02T09:08:37.255185+00:00',
    Title: 'feqwfeqwf',
    CreatedByUser: 'auth0|644151efc3a961d2784456d9',
    ModifiedByUser: 'auth0|644151efc3a961d2784456d9',
    SequentialId: 4,
    CustomAttributeData: null,
    Meta: null,
    Type: 'issue',
    __typename: 'issue',
    consequences: [],
    owners: [],
    ownerGroups: [],
    contributors: [],
    contributorGroups: [],
    ancestorContributors: [],
    assessment: null,
    actions_aggregate: {
      aggregate: {
        count: 0,
        __typename: 'action_parent_aggregate_fields',
      },
      __typename: 'action_parent_aggregate',
    },
    modifiedByUser: {
      FriendlyName: 'RiskManager1',
      __typename: 'user',
    },
    createdByUser: {
      FriendlyName: 'RiskManager1',
      __typename: 'user',
    },
    departments: [],
    tags: [],
    parents: [],
  };

  const defaultImpactRating: ImpactRating = {
    CreatedAtTimestamp: '2024-07-02T09:08:03.355801+00:00',
    CreatedByUser: 'auth0|644151efc3a961d2784456d9',
    Id: 'c7d2ad71-cba8-40c6-95fb-6e1f732a3fa4',
    ModifiedAtTimestamp: '2024-07-02T09:08:03.355801+00:00',
    ModifiedByUser: 'auth0|644151efc3a961d2784456d9',
    CustomAttributeData: null,
    SequentialId: 2,
    Rating: 4,
    RatedItemId: 'a1d30192-8100-46b1-a584-6db81b22f935',
    ImpactId: 'b7210f8f-1f04-47e7-bd9b-7bbb1e28acc5',
    TestDate: '2024-07-04T00:00:00+00:00',
    Likelihood: 2,
    CompletedBy: 'auth0|644152102c766a09dd585d2e',
    __typename: 'impact_second_line_rating',
    createdByUser: {
      FriendlyName: 'RiskManager1',
      __typename: 'user',
    },
    completedBy: {
      FriendlyName: 'Standard1',
      __typename: 'user',
    },
    impact: {
      Id: 'b7210f8f-1f04-47e7-bd9b-7bbb1e28acc5',
      Name: 'Impact 1',
      __typename: 'impact',
    },
    ratedItem: {
      risk: {
        Title: 'Scope Creep',
        __typename: 'risk',
      },
      ObjectType: 'risk',
      __typename: 'node',
    },
  };

  const defaultTestResultParent: TestResultParent = {
    schedule: {
      Id: 'ff33de3f-3f3c-485e-a8d7-af16d1a72e94',
      StartDate: null,
      TimeToCompleteUnit: 'day',
      TimeToCompleteValue: 1,
      Frequency: null,
      ManualDueDate: null,
    },

    CreatedByUser: 'auth0|644151efc3a961d2784456d9',
    ModifiedByUser: 'SYSTEM',
    Description: 'Control Description B',
    Id: 'ff33de3f-3f3c-485e-a8d7-af16d1a72e94',
    CreatedAtTimestamp: '2024-07-01T11:19:31.950845+00:00',
    ModifiedAtTimestamp: '2024-07-02T09:17:45.385+00:00',
    Title: 'Control Title B',
    Type: 'Corrective',

    CustomAttributeData: null,
    SequentialId: 2,

    __typename: 'control',
  };

  it('does not display findings when no findings exist"', async () => {
    const { container } = render(
      <SecondLineFindingPreview
        complianceMonitoringAssessmentId={
          '70b8ef93-8118-49aa-8f06-c029ff2c3285'
        }
        outcome={1}
      />,
      {
        wrapper: getWrapper(
          [
            mockedRoleAccessResponse(),
            mockedGetAggregationResponse(),
            mockedGetSecondLineResultsByParentIdResponse(
              {
                ParentId: '70b8ef93-8118-49aa-8f06-c029ff2c3285',
              },
              {
                action: [],
                issue: [],
                impact: [],
                risk_controlled_second_line_result: [],
                risk_uncontrolled_second_line_result: [],
                document_second_line_result: [],
                obligation_second_line_result: [],
                control_test_second_line_result: [],
                impact_second_line_rating: [],
              }
            ),
          ],
          ...defaultFormProviders
        ),
      }
    );
    await waitUntilLoaded();
    const element = createWrapper(container).getElement();
    expect(element).toBeInTheDocument();
    expect(screen.queryByText('Outcome')).not.toBeInTheDocument();
    expect(screen.queryByText('Action')).not.toBeInTheDocument();
    expect(screen.queryByText('Issue')).not.toBeInTheDocument();
    expect(screen.queryByText('Impact')).not.toBeInTheDocument();
    expect(screen.queryByText('Document')).not.toBeInTheDocument();
    expect(screen.queryByText('Obligation')).not.toBeInTheDocument();
    expect(screen.queryByText('Control')).not.toBeInTheDocument();
    expect(screen.queryByText('Risk')).not.toBeInTheDocument();
  });

  it('does display findings when actions findings exist"', async () => {
    const { container } = render(
      <SecondLineFindingPreview
        complianceMonitoringAssessmentId={
          '70b8ef93-8118-49aa-8f06-c029ff2c3285'
        }
        outcome={1}
      />,
      {
        wrapper: getWrapper(
          [
            mockedRoleAccessResponse(),
            mockedGetAggregationResponse(),
            mockedGetSecondLineResultsByParentIdResponse(
              {
                ParentId: '70b8ef93-8118-49aa-8f06-c029ff2c3285',
              },
              {
                action: [defaultAction],
                issue: [],
                impact: [],
                risk_controlled_second_line_result: [],
                risk_uncontrolled_second_line_result: [],
                document_second_line_result: [],
                obligation_second_line_result: [],
                control_test_second_line_result: [],
                impact_second_line_rating: [],
              }
            ),
          ],
          ...defaultFormProviders
        ),
      }
    );
    await waitUntilLoadedDoesNotExist();
    const element = createWrapper(container).getElement();

    expect(element).toBeInTheDocument();
    expect(screen.getByText('Outcome')).toBeInTheDocument();
    expect(screen.getByText('1 Action')).toBeInTheDocument();
    expect(screen.queryByText('Issue')).not.toBeInTheDocument();
    expect(screen.queryByText('Impact')).not.toBeInTheDocument();
    expect(screen.queryByText('Document')).not.toBeInTheDocument();
    expect(screen.queryByText('Obligation')).not.toBeInTheDocument();
    expect(screen.queryByText('Control')).not.toBeInTheDocument();
    expect(screen.queryByText('Risk')).not.toBeInTheDocument();
    expect(screen.queryByText('Impact rating')).not.toBeInTheDocument();
  });

  it('Increment count with multiple actions"', async () => {
    const { container } = render(
      <SecondLineFindingPreview
        complianceMonitoringAssessmentId={
          '70b8ef93-8118-49aa-8f06-c029ff2c3285'
        }
        outcome={1}
      />,
      {
        wrapper: getWrapper(
          [
            mockedRoleAccessResponse(),
            mockedGetAggregationResponse(),
            mockedGetSecondLineResultsByParentIdResponse(
              {
                ParentId: '70b8ef93-8118-49aa-8f06-c029ff2c3285',
              },
              {
                action: [
                  {
                    ...defaultAction,
                    Id: '68cfb25d-0f59-49c1-ade2-501804d9ed58',
                  },
                  {
                    ...defaultAction,
                    Id: '68cfb25d-0f59-49c1-ade2-501804d9ed59',
                  },
                ],
                issue: [],
                impact: [],
                risk_controlled_second_line_result: [],
                risk_uncontrolled_second_line_result: [],
                document_second_line_result: [],
                obligation_second_line_result: [],
                control_test_second_line_result: [],
                impact_second_line_rating: [],
              }
            ),
          ],
          ...defaultFormProviders
        ),
      }
    );
    await waitUntilLoadedDoesNotExist();
    const element = createWrapper(container).getElement();
    expect(element).toBeInTheDocument();
    expect(screen.getByText('Outcome')).toBeInTheDocument();
    expect(screen.getByText('2 Actions')).toBeInTheDocument();
  });

  it('does display findings when issue findings exist"', async () => {
    const { container } = render(
      <SecondLineFindingPreview
        complianceMonitoringAssessmentId={
          '70b8ef93-8118-49aa-8f06-c029ff2c3285'
        }
        outcome={1}
      />,
      {
        wrapper: getWrapper(
          [
            mockedRoleAccessResponse(),
            mockedGetAggregationResponse(),
            mockedGetSecondLineResultsByParentIdResponse(
              {
                ParentId: '70b8ef93-8118-49aa-8f06-c029ff2c3285',
              },
              {
                action: [],
                issue: [defaultIssue],
                impact: [],
                risk_controlled_second_line_result: [],
                risk_uncontrolled_second_line_result: [],
                document_second_line_result: [],
                obligation_second_line_result: [],
                control_test_second_line_result: [],
                impact_second_line_rating: [],
              }
            ),
          ],
          ...defaultFormProviders
        ),
      }
    );
    await waitUntilLoadedDoesNotExist();
    const element = createWrapper(container).getElement();
    expect(element).toBeInTheDocument();
    expect(screen.getByText('Outcome')).toBeInTheDocument();
    expect(screen.getByText('1 Issue')).toBeInTheDocument();
    expect(screen.queryByText('Action')).not.toBeInTheDocument();
    expect(screen.queryByText('Impact')).not.toBeInTheDocument();
    expect(screen.queryByText('Document')).not.toBeInTheDocument();
    expect(screen.queryByText('Obligation')).not.toBeInTheDocument();
    expect(screen.queryByText('Control')).not.toBeInTheDocument();
    expect(screen.queryByText('Risk')).not.toBeInTheDocument();
    expect(screen.queryByText('Impact rating')).not.toBeInTheDocument();
  });

  it('Increment count with multiple issues"', async () => {
    const { container } = render(
      <SecondLineFindingPreview
        complianceMonitoringAssessmentId={
          '70b8ef93-8118-49aa-8f06-c029ff2c3285'
        }
        outcome={1}
      />,
      {
        wrapper: getWrapper(
          [
            mockedRoleAccessResponse(),
            mockedGetAggregationResponse(),
            mockedGetSecondLineResultsByParentIdResponse(
              {
                ParentId: '70b8ef93-8118-49aa-8f06-c029ff2c3285',
              },
              {
                action: [],
                issue: [
                  {
                    ...defaultIssue,
                    Id: '5dedfd6a-da71-45f2-9d10-6dd497225161',
                  },
                  {
                    ...defaultIssue,
                    Id: '5dedfd6a-da71-45f2-9d10-6dd497225161',
                  },
                ],
                impact: [],
                risk_controlled_second_line_result: [],
                risk_uncontrolled_second_line_result: [],
                document_second_line_result: [],
                obligation_second_line_result: [],
                control_test_second_line_result: [],
                impact_second_line_rating: [],
              }
            ),
          ],
          ...defaultFormProviders
        ),
      }
    );
    await waitUntilLoadedDoesNotExist();
    const element = createWrapper(container).getElement();
    expect(element).toBeInTheDocument();
    expect(screen.getByText('Outcome')).toBeInTheDocument();
    expect(screen.getByText('2 Issues')).toBeInTheDocument();
  });

  it('does display findings when impact findings exist"', async () => {
    const { container } = render(
      <SecondLineFindingPreview
        complianceMonitoringAssessmentId={
          '70b8ef93-8118-49aa-8f06-c029ff2c3285'
        }
        outcome={1}
      />,
      {
        wrapper: getWrapper(
          [
            mockedRoleAccessResponse(),
            mockedGetAggregationResponse(),
            mockedGetSecondLineResultsByParentIdResponse(
              {
                ParentId: '70b8ef93-8118-49aa-8f06-c029ff2c3285',
              },
              {
                action: [],
                issue: [],
                impact: [defaultImpact],
                risk_controlled_second_line_result: [],
                risk_uncontrolled_second_line_result: [],
                document_second_line_result: [],
                obligation_second_line_result: [],
                control_test_second_line_result: [],
                impact_second_line_rating: [],
              }
            ),
          ],
          ...defaultFormProviders
        ),
      }
    );
    await waitUntilLoadedDoesNotExist();
    const element = createWrapper(container).getElement();
    expect(element).toBeInTheDocument();
    expect(screen.getByText('Outcome')).toBeInTheDocument();
    expect(screen.getByText('1 Impact')).toBeInTheDocument();
    expect(screen.queryByText('Action')).not.toBeInTheDocument();
    expect(screen.queryByText('Issue')).not.toBeInTheDocument();
    expect(screen.queryByText('Document')).not.toBeInTheDocument();
    expect(screen.queryByText('Obligation')).not.toBeInTheDocument();
    expect(screen.queryByText('Control')).not.toBeInTheDocument();
    expect(screen.queryByText('Risk')).not.toBeInTheDocument();
    expect(screen.queryByText('Impact rating')).not.toBeInTheDocument();
  });

  it('Increment count with multiple impacts"', async () => {
    const { container } = render(
      <SecondLineFindingPreview
        complianceMonitoringAssessmentId={
          '70b8ef93-8118-49aa-8f06-c029ff2c3285'
        }
        outcome={1}
      />,
      {
        wrapper: getWrapper(
          [
            mockedRoleAccessResponse(),
            mockedGetAggregationResponse(),
            mockedGetSecondLineResultsByParentIdResponse(
              {
                ParentId: '70b8ef93-8118-49aa-8f06-c029ff2c3285',
              },
              {
                action: [],
                issue: [],
                impact: [
                  {
                    ...defaultImpact,
                    Id: 'b7210f8f-1f04-47e7-bd9b-7bbb1e28acc5',
                  },
                  {
                    ...defaultImpact,
                    Id: 'b7210f8f-1f04-47e7-bd9b-7bbb1e28acc5',
                  },
                ],
                risk_controlled_second_line_result: [],
                risk_uncontrolled_second_line_result: [],
                document_second_line_result: [],
                obligation_second_line_result: [],
                control_test_second_line_result: [],
                impact_second_line_rating: [],
              }
            ),
          ],
          ...defaultFormProviders
        ),
      }
    );
    await waitUntilLoadedDoesNotExist();
    const element = createWrapper(container).getElement();
    expect(element).toBeInTheDocument();
    expect(screen.getByText('Outcome')).toBeInTheDocument();
    expect(screen.getByText('2 Impacts')).toBeInTheDocument();
  });

  it('does display findings when document findings exist"', async () => {
    const { container } = render(
      <SecondLineFindingPreview
        complianceMonitoringAssessmentId={
          '70b8ef93-8118-49aa-8f06-c029ff2c3285'
        }
        outcome={1}
      />,
      {
        wrapper: getWrapper(
          [
            mockedRoleAccessResponse(),
            mockedGetAggregationResponse(),
            mockedGetSecondLineResultsByParentIdResponse(
              {
                ParentId: '70b8ef93-8118-49aa-8f06-c029ff2c3285',
              },
              {
                action: [],
                issue: [],
                impact: [],
                risk_controlled_second_line_result: [],
                risk_uncontrolled_second_line_result: [],
                document_second_line_result: [
                  {
                    Id: '73bbbd32-824e-4209-9851-66a126eae39d',
                    Rating: 3,
                    CustomAttributeData: null,
                    Rationale: null,
                    TestDate: null,
                    __typename: 'document_second_line_result',
                    parents: [],
                    files: [],
                    ancestorContributors: [],
                  },
                ],
                obligation_second_line_result: [],
                control_test_second_line_result: [],
                impact_second_line_rating: [],
              }
            ),
          ],
          ...defaultFormProviders
        ),
      }
    );
    await waitUntilLoadedDoesNotExist();
    const element = createWrapper(container).getElement();
    expect(element).toBeInTheDocument();
    expect(screen.getByText('Outcome')).toBeInTheDocument();
    expect(screen.getByText('1 Document')).toBeInTheDocument();
    expect(screen.queryByText('Action')).not.toBeInTheDocument();
    expect(screen.queryByText('Issue')).not.toBeInTheDocument();
    expect(screen.queryByText('Impact')).not.toBeInTheDocument();
    expect(screen.queryByText('Obligation')).not.toBeInTheDocument();
    expect(screen.queryByText('Control')).not.toBeInTheDocument();
    expect(screen.queryByText('Risk')).not.toBeInTheDocument();
    expect(screen.queryByText('Impact rating')).not.toBeInTheDocument();
  });

  it('Increment count with multiple documents"', async () => {
    const { container } = render(
      <SecondLineFindingPreview
        complianceMonitoringAssessmentId={
          '70b8ef93-8118-49aa-8f06-c029ff2c3285'
        }
        outcome={1}
      />,
      {
        wrapper: getWrapper(
          [
            mockedRoleAccessResponse(),
            mockedGetAggregationResponse(),
            mockedGetSecondLineResultsByParentIdResponse(
              {
                ParentId: '70b8ef93-8118-49aa-8f06-c029ff2c3285',
              },
              {
                action: [],
                issue: [],
                impact: [],
                risk_controlled_second_line_result: [],
                risk_uncontrolled_second_line_result: [],
                document_second_line_result: [
                  {
                    Id: '73bbbd32-824e-4209-9851-66a126eae39d',
                    Rating: 3,
                    CustomAttributeData: null,
                    Rationale: null,
                    TestDate: null,
                    __typename: 'document_second_line_result',
                    parents: [],
                    files: [],
                    ancestorContributors: [],
                  },
                  {
                    Id: '73bbbd32-824e-4209-9851-66a126eae39d',
                    Rating: 3,
                    CustomAttributeData: null,
                    Rationale: null,
                    TestDate: null,
                    __typename: 'document_second_line_result',
                    parents: [],
                    files: [],
                    ancestorContributors: [],
                  },
                ],
                obligation_second_line_result: [],
                control_test_second_line_result: [],
                impact_second_line_rating: [],
              }
            ),
          ],
          ...defaultFormProviders
        ),
      }
    );
    await waitUntilLoadedDoesNotExist();
    const element = createWrapper(container).getElement();
    expect(element).toBeInTheDocument();
    expect(screen.getByText('Outcome')).toBeInTheDocument();
    expect(screen.getByText('2 Documents')).toBeInTheDocument();
  });

  it('does display findings when obligation findings exist"', async () => {
    const { container } = render(
      <SecondLineFindingPreview
        complianceMonitoringAssessmentId={
          '70b8ef93-8118-49aa-8f06-c029ff2c3285'
        }
        outcome={1}
      />,
      {
        wrapper: getWrapper(
          [
            mockedRoleAccessResponse(),
            mockedGetAggregationResponse(),
            mockedGetSecondLineResultsByParentIdResponse(
              {
                ParentId: '70b8ef93-8118-49aa-8f06-c029ff2c3285',
              },
              {
                action: [],
                issue: [],
                impact: [],
                risk_controlled_second_line_result: [],
                risk_uncontrolled_second_line_result: [],
                document_second_line_result: [],
                obligation_second_line_result: [
                  {
                    Id: '54da4ab4-4dbe-40b2-9b1a-5ddc0d9cc39f',
                    Rating: 5,
                    CustomAttributeData: null,
                    Rationale: null,
                    TestDate: null,
                    __typename: 'obligation_second_line_result',
                    parents: [],
                    files: [],
                    ancestorContributors: [],
                  },
                ],
                control_test_second_line_result: [],
                impact_second_line_rating: [],
              }
            ),
          ],
          ...defaultFormProviders
        ),
      }
    );
    await waitUntilLoadedDoesNotExist();
    const element = createWrapper(container).getElement();
    expect(element).toBeInTheDocument();
    expect(screen.getByText('Outcome')).toBeInTheDocument();
    expect(screen.getByText('1 Obligation')).toBeInTheDocument();
    expect(screen.queryByText('Action')).not.toBeInTheDocument();
    expect(screen.queryByText('Issue')).not.toBeInTheDocument();
    expect(screen.queryByText('Impact')).not.toBeInTheDocument();
    expect(screen.queryByText('Document')).not.toBeInTheDocument();
    expect(screen.queryByText('Control')).not.toBeInTheDocument();
    expect(screen.queryByText('Risk')).not.toBeInTheDocument();
    expect(screen.queryByText('Impact rating')).not.toBeInTheDocument();
  });

  it('Increment count with multiple obligations"', async () => {
    const { container } = render(
      <SecondLineFindingPreview
        complianceMonitoringAssessmentId={
          '70b8ef93-8118-49aa-8f06-c029ff2c3285'
        }
        outcome={1}
      />,
      {
        wrapper: getWrapper(
          [
            mockedRoleAccessResponse(),
            mockedGetAggregationResponse(),
            mockedGetSecondLineResultsByParentIdResponse(
              {
                ParentId: '70b8ef93-8118-49aa-8f06-c029ff2c3285',
              },
              {
                action: [],
                issue: [],
                impact: [],
                risk_controlled_second_line_result: [],
                risk_uncontrolled_second_line_result: [],
                document_second_line_result: [],
                obligation_second_line_result: [
                  {
                    Id: '54da4ab4-4dbe-40b2-9b1a-5ddc0d9cc39f',
                    Rating: 5,
                    CustomAttributeData: null,
                    Rationale: null,
                    TestDate: null,
                    __typename: 'obligation_second_line_result',
                    parents: [],
                    files: [],
                    ancestorContributors: [],
                  },
                  {
                    Id: '54da4ab4-4dbe-40b2-9b1a-5ddc0d9cc39f',
                    Rating: 5,
                    CustomAttributeData: null,
                    Rationale: null,
                    TestDate: null,
                    __typename: 'obligation_second_line_result',
                    parents: [],
                    files: [],
                    ancestorContributors: [],
                  },
                ],
                control_test_second_line_result: [],
                impact_second_line_rating: [],
              }
            ),
          ],
          ...defaultFormProviders
        ),
      }
    );
    await waitUntilLoadedDoesNotExist();
    const element = createWrapper(container).getElement();
    expect(element).toBeInTheDocument();
    expect(screen.getByText('Outcome')).toBeInTheDocument();
    expect(screen.getByText('2 Obligations')).toBeInTheDocument();
  });

  it('does display findings when uncontrolled risk findings exist"', async () => {
    const { container } = render(
      <SecondLineFindingPreview
        complianceMonitoringAssessmentId={
          '70b8ef93-8118-49aa-8f06-c029ff2c3285'
        }
        outcome={1}
      />,
      {
        wrapper: getWrapper(
          [
            mockedRoleAccessResponse(),
            mockedGetAggregationResponse(),
            mockedGetSecondLineResultsByParentIdResponse(
              {
                ParentId: '70b8ef93-8118-49aa-8f06-c029ff2c3285',
              },
              {
                action: [],
                issue: [],
                impact: [],
                risk_controlled_second_line_result: [],
                risk_uncontrolled_second_line_result: [
                  {
                    Id: '1ba6e4e3-7942-4dab-ba51-a2434069813a',
                    Likelihood: 1,
                    Impact: 1,
                    Rating: 1,
                    CustomAttributeData: null,
                    Rationale: '',
                    TestDate: '2024-07-18T00:00:00+00:00',
                    __typename: 'risk_uncontrolled_second_line_result',
                    parents: [],
                    files: [],
                    ancestorContributors: [],
                  },
                ],
                document_second_line_result: [],
                obligation_second_line_result: [],
                control_test_second_line_result: [],
                impact_second_line_rating: [],
              }
            ),
          ],
          ...defaultFormProviders
        ),
      }
    );
    await waitUntilLoadedDoesNotExist();
    const element = createWrapper(container).getElement();
    expect(element).toBeInTheDocument();
    expect(screen.getByText('Outcome')).toBeInTheDocument();
    expect(screen.getByText('1 Risk')).toBeInTheDocument();
    expect(screen.queryByText('Action')).not.toBeInTheDocument();
    expect(screen.queryByText('Issue')).not.toBeInTheDocument();
    expect(screen.queryByText('Impact')).not.toBeInTheDocument();
    expect(screen.queryByText('Document')).not.toBeInTheDocument();
    expect(screen.queryByText('Obligation')).not.toBeInTheDocument();
    expect(screen.queryByText('Control')).not.toBeInTheDocument();
    expect(screen.queryByText('Impact rating')).not.toBeInTheDocument();
  });

  it('does display findings when controlled risk findings exist"', async () => {
    const { container } = render(
      <SecondLineFindingPreview
        complianceMonitoringAssessmentId={
          '70b8ef93-8118-49aa-8f06-c029ff2c3285'
        }
        outcome={1}
      />,
      {
        wrapper: getWrapper(
          [
            mockedRoleAccessResponse(),
            mockedGetAggregationResponse(),
            mockedGetSecondLineResultsByParentIdResponse(
              {
                ParentId: '70b8ef93-8118-49aa-8f06-c029ff2c3285',
              },
              {
                action: [],
                issue: [],
                impact: [],
                risk_controlled_second_line_result: [
                  {
                    Id: '1ba6e4e3-7942-4dab-ba51-a2434069813a',
                    Likelihood: 1,
                    Impact: 1,
                    Rating: 1,
                    CustomAttributeData: null,
                    Rationale: '',
                    TestDate: '2024-07-18T00:00:00+00:00',
                    __typename: 'risk_controlled_second_line_result',
                    parents: [],
                    files: [],
                    ancestorContributors: [],
                  },
                ],
                risk_uncontrolled_second_line_result: [],
                document_second_line_result: [],
                obligation_second_line_result: [],
                control_test_second_line_result: [],
                impact_second_line_rating: [],
              }
            ),
          ],
          ...defaultFormProviders
        ),
      }
    );
    await waitUntilLoadedDoesNotExist();
    const element = createWrapper(container).getElement();
    expect(element).toBeInTheDocument();
    expect(screen.getByText('Outcome')).toBeInTheDocument();
    expect(screen.getByText('1 Risk')).toBeInTheDocument();
    expect(screen.queryByText('Action')).not.toBeInTheDocument();
    expect(screen.queryByText('Issue')).not.toBeInTheDocument();
    expect(screen.queryByText('Impact')).not.toBeInTheDocument();
    expect(screen.queryByText('Document')).not.toBeInTheDocument();
    expect(screen.queryByText('Obligation')).not.toBeInTheDocument();
    expect(screen.queryByText('Control')).not.toBeInTheDocument();
    expect(screen.queryByText('Impact rating')).not.toBeInTheDocument();
  });

  it('Increment count with multiple risks"', async () => {
    const { container } = render(
      <SecondLineFindingPreview
        complianceMonitoringAssessmentId={
          '70b8ef93-8118-49aa-8f06-c029ff2c3285'
        }
        outcome={1}
      />,
      {
        wrapper: getWrapper(
          [
            mockedRoleAccessResponse(),
            mockedGetAggregationResponse(),
            mockedGetSecondLineResultsByParentIdResponse(
              {
                ParentId: '70b8ef93-8118-49aa-8f06-c029ff2c3285',
              },
              {
                action: [],
                issue: [],
                impact: [],
                risk_uncontrolled_second_line_result: [],
                risk_controlled_second_line_result: [
                  {
                    Id: '1ba6e4e3-7942-4dab-ba51-a2434069813a',
                    Likelihood: 1,
                    Impact: 1,
                    Rating: 1,

                    CustomAttributeData: null,
                    Rationale: '',
                    TestDate: '2024-07-18T00:00:00+00:00',
                    __typename: 'risk_controlled_second_line_result',
                    parents: [],
                    files: [],
                    ancestorContributors: [],
                  },
                  {
                    Id: '1ba6e4e3-7942-4dab-ba51-a2434069813a',
                    Likelihood: 1,
                    Impact: 1,
                    Rating: 1,

                    CustomAttributeData: null,
                    Rationale: '',
                    TestDate: '2024-07-18T00:00:00+00:00',
                    __typename: 'risk_controlled_second_line_result',
                    parents: [],
                    files: [],
                    ancestorContributors: [],
                  },
                ],
                document_second_line_result: [],
                obligation_second_line_result: [],
                control_test_second_line_result: [],
                impact_second_line_rating: [],
              }
            ),
          ],
          ...defaultFormProviders
        ),
      }
    );
    await waitUntilLoadedDoesNotExist();
    const element = createWrapper(container).getElement();
    expect(element).toBeInTheDocument();
    expect(screen.getByText('Outcome')).toBeInTheDocument();
    expect(screen.getByText('2 Risks')).toBeInTheDocument();
  });

  it('does display findings when control findings exist"', async () => {
    const { container } = render(
      <SecondLineFindingPreview
        complianceMonitoringAssessmentId={
          '70b8ef93-8118-49aa-8f06-c029ff2c3285'
        }
        outcome={1}
      />,
      {
        wrapper: getWrapper(
          [
            mockedRoleAccessResponse(),
            mockedGetAggregationResponse(),
            mockedGetSecondLineResultsByParentIdResponse(
              {
                ParentId: '70b8ef93-8118-49aa-8f06-c029ff2c3285',
              },
              {
                action: [],
                issue: [],
                impact: [],
                risk_controlled_second_line_result: [],
                risk_uncontrolled_second_line_result: [],
                document_second_line_result: [],
                obligation_second_line_result: [],
                control_test_second_line_result: [
                  {
                    Description: 'DFHGERGH',
                    DesignEffectiveness: 1,
                    Id: 'a96bd69f-df62-4f65-8495-297176137739',
                    OverallEffectiveness: 1,
                    ParentControlId: 'ff33de3f-3f3c-485e-a8d7-af16d1a72e94',
                    PerformanceEffectiveness: 3,
                    Submitter: 'auth0|644151efc3a961d2784456d9',
                    TestDate: '2024-07-01T00:00:00+00:00',
                    TestType: '2ndLine',
                    CreatedAtTimestamp: '2024-07-02T09:17:40.889052+00:00',
                    ModifiedAtTimestamp: '2024-07-02T09:17:40.889052+00:00',
                    Title: 'wreTWRET',
                    CreatedByUser: 'auth0|644151efc3a961d2784456d9',
                    ModifiedByUser: 'auth0|644151efc3a961d2784456d9',
                    CustomAttributeData: null,
                    __typename: 'control_test_second_line_result',
                    parent: {
                      ...defaultTestResultParent,
                    },
                    SequentialId: 1,
                    files: [],
                  },
                ],
                impact_second_line_rating: [],
              }
            ),
          ],
          ...defaultFormProviders
        ),
      }
    );
    await waitUntilLoadedDoesNotExist();
    const element = createWrapper(container).getElement();
    expect(element).toBeInTheDocument();
    expect(screen.getByText('Outcome')).toBeInTheDocument();
    expect(screen.getByText('1 Control')).toBeInTheDocument();
    expect(screen.queryByText('Action')).not.toBeInTheDocument();
    expect(screen.queryByText('Issue')).not.toBeInTheDocument();
    expect(screen.queryByText('Impact')).not.toBeInTheDocument();
    expect(screen.queryByText('Document')).not.toBeInTheDocument();
    expect(screen.queryByText('Obligation')).not.toBeInTheDocument();
    expect(screen.queryByText('Risk')).not.toBeInTheDocument();
    expect(screen.queryByText('Impact rating')).not.toBeInTheDocument();
  });

  it('Increment count with multiple controls"', async () => {
    const { container } = render(
      <SecondLineFindingPreview
        complianceMonitoringAssessmentId={
          '70b8ef93-8118-49aa-8f06-c029ff2c3285'
        }
        outcome={1}
      />,
      {
        wrapper: getWrapper(
          [
            mockedRoleAccessResponse(),
            mockedGetAggregationResponse(),
            mockedGetSecondLineResultsByParentIdResponse(
              {
                ParentId: '70b8ef93-8118-49aa-8f06-c029ff2c3285',
              },
              {
                action: [],
                issue: [],
                impact: [],
                risk_controlled_second_line_result: [],
                risk_uncontrolled_second_line_result: [],
                document_second_line_result: [],
                obligation_second_line_result: [],
                control_test_second_line_result: [
                  {
                    SequentialId: 1,
                    Description: 'DFHGERGH',
                    DesignEffectiveness: 1,
                    Id: 'a96bd69f-df62-4f65-8495-297176137739',
                    OverallEffectiveness: 1,
                    ParentControlId: 'ff33de3f-3f3c-485e-a8d7-af16d1a72e94',
                    PerformanceEffectiveness: 3,
                    Submitter: 'auth0|644151efc3a961d2784456d9',
                    TestDate: '2024-07-01T00:00:00+00:00',
                    TestType: '2ndLine',
                    CreatedAtTimestamp: '2024-07-02T09:17:40.889052+00:00',
                    ModifiedAtTimestamp: '2024-07-02T09:17:40.889052+00:00',
                    Title: 'wreTWRET',
                    CreatedByUser: 'auth0|644151efc3a961d2784456d9',
                    ModifiedByUser: 'auth0|644151efc3a961d2784456d9',
                    CustomAttributeData: null,
                    __typename: 'control_test_second_line_result',
                    parent: {
                      ...defaultTestResultParent,
                    },
                    files: [],
                  },
                  {
                    SequentialId: 1,
                    Description: 'DFHGERGH',
                    DesignEffectiveness: 1,
                    Id: 'a96bd69f-df62-4f65-8495-297176137739',
                    OverallEffectiveness: 1,
                    ParentControlId: 'ff33de3f-3f3c-485e-a8d7-af16d1a72e94',
                    PerformanceEffectiveness: 3,
                    Submitter: 'auth0|644151efc3a961d2784456d9',
                    TestDate: '2024-07-01T00:00:00+00:00',
                    TestType: '2ndLine',
                    CreatedAtTimestamp: '2024-07-02T09:17:40.889052+00:00',
                    ModifiedAtTimestamp: '2024-07-02T09:17:40.889052+00:00',
                    Title: 'wreTWRET',
                    CreatedByUser: 'auth0|644151efc3a961d2784456d9',
                    ModifiedByUser: 'auth0|644151efc3a961d2784456d9',
                    CustomAttributeData: null,
                    __typename: 'control_test_second_line_result',
                    parent: {
                      ...defaultTestResultParent,
                      Id: 'ff33de3f-3f3c-485e-a8d7-af16d1a72e94',
                    },
                    files: [],
                  },
                ],
                impact_second_line_rating: [],
              }
            ),
          ],
          ...defaultFormProviders
        ),
      }
    );
    await waitUntilLoadedDoesNotExist();
    const element = createWrapper(container).getElement();
    expect(element).toBeInTheDocument();
    expect(screen.getByText('Outcome')).toBeInTheDocument();
    expect(screen.getByText('2 Controls')).toBeInTheDocument();
  });

  it('does display findings when impact ratings findings exist"', async () => {
    const { container } = render(
      <SecondLineFindingPreview
        complianceMonitoringAssessmentId={
          '70b8ef93-8118-49aa-8f06-c029ff2c3285'
        }
        outcome={1}
      />,
      {
        wrapper: getWrapper(
          [
            mockedRoleAccessResponse(),
            mockedGetAggregationResponse(),
            mockedGetSecondLineResultsByParentIdResponse(
              {
                ParentId: '70b8ef93-8118-49aa-8f06-c029ff2c3285',
              },
              {
                action: [],
                issue: [],
                impact: [],
                risk_controlled_second_line_result: [],
                risk_uncontrolled_second_line_result: [],
                document_second_line_result: [],
                obligation_second_line_result: [],
                control_test_second_line_result: [],
                impact_second_line_rating: [defaultImpactRating],
              }
            ),
          ],
          ...defaultFormProviders
        ),
      }
    );
    await waitUntilLoadedDoesNotExist();
    const element = createWrapper(container).getElement();
    expect(element).toBeInTheDocument();
    expect(screen.getByText('Outcome')).toBeInTheDocument();
    expect(screen.getByText('1 Impact rating')).toBeInTheDocument();
    expect(screen.queryByText('Action')).not.toBeInTheDocument();
    expect(screen.queryByText('Issue')).not.toBeInTheDocument();
    expect(screen.queryByText('Impact')).not.toBeInTheDocument();
    expect(screen.queryByText('Document')).not.toBeInTheDocument();
    expect(screen.queryByText('Obligation')).not.toBeInTheDocument();
    expect(screen.queryByText('Control')).not.toBeInTheDocument();
    expect(screen.queryByText('Risk')).not.toBeInTheDocument();
    expect(screen.queryByText('Impact rating')).not.toBeInTheDocument();
  });

  it('Increment count with multiple impact ratings"', async () => {
    const { container } = render(
      <SecondLineFindingPreview
        complianceMonitoringAssessmentId={
          '70b8ef93-8118-49aa-8f06-c029ff2c3285'
        }
        outcome={1}
      />,
      {
        wrapper: getWrapper(
          [
            mockedRoleAccessResponse(),
            mockedGetAggregationResponse(),
            mockedGetSecondLineResultsByParentIdResponse(
              {
                ParentId: '70b8ef93-8118-49aa-8f06-c029ff2c3285',
              },
              {
                action: [],
                issue: [],
                impact: [],
                risk_controlled_second_line_result: [],
                risk_uncontrolled_second_line_result: [],
                document_second_line_result: [],
                obligation_second_line_result: [],
                control_test_second_line_result: [],
                impact_second_line_rating: [
                  {
                    ...defaultImpactRating,
                    Id: 'c7d2ad71-cba8-40c6-95fb-6e1f732a3fa4',
                  },
                  {
                    ...defaultImpactRating,
                    Id: 'c7d2ad71-cba8-40c6-95fb-6e1f732a3fa4',
                  },
                ],
              }
            ),
          ],
          ...defaultFormProviders
        ),
      }
    );
    await waitUntilLoadedDoesNotExist();
    const element = createWrapper(container).getElement();
    expect(element).toBeInTheDocument();
    expect(screen.getByText('Outcome')).toBeInTheDocument();
    expect(screen.getByText('2 Impact ratings')).toBeInTheDocument();
  });

  it('displays all findings when all findings exist"', async () => {
    const { container } = render(
      <SecondLineFindingPreview
        complianceMonitoringAssessmentId={
          '70b8ef93-8118-49aa-8f06-c029ff2c3285'
        }
        outcome={1}
      />,
      {
        wrapper: getWrapper(
          [
            mockedRoleAccessResponse(),
            mockedGetAggregationResponse(),
            mockedGetSecondLineResultsByParentIdResponse(
              {
                ParentId: '70b8ef93-8118-49aa-8f06-c029ff2c3285',
              },
              {
                document_second_line_result: [
                  {
                    Id: '73bbbd32-824e-4209-9851-66a126eae39d',
                    Rating: 3,
                    CustomAttributeData: null,
                    Rationale: null,
                    TestDate: null,
                    __typename: 'document_second_line_result',
                    parents: [],
                    files: [],
                    ancestorContributors: [],
                  },
                ],
                obligation_second_line_result: [
                  {
                    Id: '54da4ab4-4dbe-40b2-9b1a-5ddc0d9cc39f',
                    Rating: 5,
                    CustomAttributeData: null,
                    Rationale: null,
                    TestDate: null,
                    __typename: 'obligation_second_line_result',
                    parents: [],
                    files: [],
                    ancestorContributors: [],
                  },
                ],
                risk_controlled_second_line_result: [
                  {
                    Id: '1ba6e4e3-7942-4dab-ba51-a2434069813a',
                    Likelihood: 1,
                    Impact: 1,
                    Rating: 1,

                    CustomAttributeData: null,
                    Rationale: '',
                    TestDate: '2024-07-18T00:00:00+00:00',
                    __typename: 'risk_controlled_second_line_result',
                    parents: [],
                    files: [],
                    ancestorContributors: [],
                  },
                ],
                risk_uncontrolled_second_line_result: [
                  {
                    Id: '1ba6e4e3-7942-4dab-ba51-a2434069813a',
                    Likelihood: 1,
                    Impact: 1,
                    Rating: 1,

                    CustomAttributeData: null,
                    Rationale: '',
                    TestDate: '2024-07-18T00:00:00+00:00',
                    __typename: 'risk_uncontrolled_second_line_result',
                    parents: [],
                    files: [],
                    ancestorContributors: [],
                  },
                ],
                control_test_second_line_result: [
                  {
                    SequentialId: 1,
                    Description: 'DFHGERGH',
                    DesignEffectiveness: 1,
                    Id: 'a96bd69f-df62-4f65-8495-297176137739',
                    OverallEffectiveness: 1,
                    ParentControlId: 'ff33de3f-3f3c-485e-a8d7-af16d1a72e94',
                    PerformanceEffectiveness: 3,
                    Submitter: 'auth0|644151efc3a961d2784456d9',
                    TestDate: '2024-07-01T00:00:00+00:00',
                    TestType: '2ndLine',
                    CreatedAtTimestamp: '2024-07-02T09:17:40.889052+00:00',
                    ModifiedAtTimestamp: '2024-07-02T09:17:40.889052+00:00',
                    Title: 'wreTWRET',
                    CreatedByUser: 'auth0|644151efc3a961d2784456d9',
                    ModifiedByUser: 'auth0|644151efc3a961d2784456d9',
                    CustomAttributeData: null,
                    __typename: 'control_test_second_line_result',
                    parent: {
                      ...defaultTestResultParent,
                    },
                    files: [],
                  },
                ],
                impact_second_line_rating: [defaultImpactRating],
                issue: [defaultIssue],
                impact: [defaultImpact],
                action: [defaultAction],
              }
            ),
          ],
          ...defaultFormProviders
        ),
      }
    );
    await waitUntilLoaded();
    const element = createWrapper(container).getElement();
    expect(element).toBeInTheDocument();
    expect(screen.queryByText('Outcome')).toBeInTheDocument();
    expect(screen.queryByText('1 Action')).toBeInTheDocument();
    expect(screen.queryByText('1 Issue')).toBeInTheDocument();
    expect(screen.queryByText('1 Impact')).toBeInTheDocument();
    expect(screen.queryByText('1 Document')).toBeInTheDocument();
    expect(screen.queryByText('1 Obligation')).toBeInTheDocument();
    expect(screen.queryByText('1 Control')).toBeInTheDocument();
    expect(screen.queryByText('2 Risks')).toBeInTheDocument();
    expect(screen.queryByText('1 Impact rating')).toBeInTheDocument();
  });
});
