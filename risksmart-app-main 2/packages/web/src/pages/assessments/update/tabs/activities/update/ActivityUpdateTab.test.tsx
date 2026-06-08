import { vi, vitest } from 'vitest';
vi.mock('@/utils/featureFlags');
import createWrapper from '@risk-smart/themed-cloudscape-components/test-utils/dom';
import { useGetGuidParam } from '@risksmart-app/components/src/routes/routes.utils';
import type { GetAssessmentActivityByIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import {
  Access_Type_Enum,
  Contributor_Type_Enum,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { render, screen, waitFor } from '@testing-library/react';
import { when } from 'jest-when';
import { waitUntilLoaded } from 'src/testing/formHelpers';
import { mockedFormConfigurationByParentTypeResponse } from 'src/testing/mock-data/mockedFormConfigurationByParentTypeResponses';
import { mockedGetAggregationResponse } from 'src/testing/mock-data/mockedGetAggregationResponses';
import { mockedGetAssessmentActivityByIdResponse } from 'src/testing/mock-data/mockedGetAssessmentActivityByIdResponse';
import { mockedGetFormCustomisationResponse } from 'src/testing/mock-data/mockedGetFormCustomisationResponse';
import { mockedGetOrganisation } from 'src/testing/mock-data/mockedGetOrganisation';
import { mockedGetOrganisationModuleResponse } from 'src/testing/mock-data/mockedGetOrganisationModule';
import { mockedRoleAccessResponse } from 'src/testing/mock-data/mockedGetRoleAccessResponse';
import { mockedUsersResponse } from 'src/testing/mock-data/mockedUserResponses';
import { mockedUserSearchPreferencesResponses } from 'src/testing/mock-data/mockedUserSearchPreferencesResponses';
import {
  defaultFormProvidersWithFeatures,
  getWrapper,
} from 'src/testing/wrapper';

import { isFeatureEnabled } from '@/utils/featureFlags';

import ActivityUpdateTab from './ActivityUpdateTab';
vi.mock('@risksmart-app/components/src/routes/routes.utils');
const mockedUseGetGuidParam = vi.mocked(useGetGuidParam);

const isFeatureEnabledMock = vi.mocked(isFeatureEnabled);

vitest.mock('@risksmart-app/components/src/utils/environment');

const createRender = (
  linkedItems: GetAssessmentActivityByIdQuery['linked_item']
) => {
  return render(<ActivityUpdateTab assessmentMode={'rating'} />, {
    wrapper: getWrapper(
      [
        mockedGetOrganisation(),
        mockedRoleAccessResponse({
          role_access: [
            {
              AccessType: Access_Type_Enum.Update,
              ContributorType: Contributor_Type_Enum.Any,
              ObjectType: Parent_Type_Enum.AssessmentActivity,
            },
          ],
        }),
        mockedGetOrganisationModuleResponse(),
        mockedGetFormCustomisationResponse([
          Parent_Type_Enum.AssessmentActivity,
        ]),
        mockedGetAssessmentActivityByIdResponse(
          {
            AssessmentActivityId: 'assessment-activity-1',
          },
          {
            __typename: 'query_root',
            assessment_activity: [
              {
                ActivityType: 'meeting',
                CompletionDate: '',
                CreatedAtTimestamp: '',
                CreatedByUser: '',
                CustomAttributeData: undefined,
                Id: '',
                ModifiedAtTimestamp: '',
                ModifiedByUser: '',
                ParentId: '',
                Status: 'complete',
                Summary: 'undefined',
                Title: 'undefined',
                __typename: 'assessment_activity',
                files: [],
                IsRCSA: false,
                owners: [],
                ownerGroups: [],
                ancestorContributors: [],
              },
            ],
            linked_item: [...linkedItems],
          }
        ),
        mockedFormConfigurationByParentTypeResponse([
          Parent_Type_Enum.AssessmentActivity,
        ]),
        mockedUsersResponse(),
        mockedUserSearchPreferencesResponses(),
        mockedGetAggregationResponse(),
      ],
      ...defaultFormProvidersWithFeatures
    ),
  });
};

describe('Activity Update Tab', () => {
  const originalError = console.error;

  beforeEach(() => {
    isFeatureEnabledMock.mockImplementation(() => false);

    // Suppress tRPC permission check errors in tests
    console.error = (...args: unknown[]) => {
      const message = args[0];
      if (
        typeof message === 'string' &&
        message.includes('TRPC permission check error')
      ) {
        return;
      }
      originalError(...args);
    };
  });

  afterAll(() => {
    console.error = originalError;
  });

  const saveButton = () =>
    screen.queryByRole<HTMLButtonElement>('button', { name: 'Save' });

  const cancelButton = () =>
    screen.queryByRole<HTMLButtonElement>('button', { name: 'Cancel' });

  const titleInput = () => screen.queryByLabelText('Activity title');

  const activityTypeDropdown = () => screen.queryByLabelText('Activity type');

  const activitySummaryInput = () =>
    screen.queryByLabelText('Activity summary');

  const statusInput = () => screen.queryByLabelText('Status');

  const activityUserInput = () =>
    screen.queryByLabelText('Activity user (optional)');

  const completionDateInput = () =>
    screen.queryAllByLabelText('Completion date (optional)');

  const attachFilesInput = () =>
    screen.queryByLabelText('Attach files (optional)');

  const createRiskFindingSingleAside = () =>
    screen.queryByText('Create risk finding');
  const createRiskFindingMultipleAside = () =>
    screen.queryByText('Create risk findings');

  const createDocumentFindingSingleAside = () =>
    screen.queryByText('Create document finding');
  const createDocumentFindingMultipleAside = () =>
    screen.queryByText('Create document findings');

  const createControlFindingSingleAside = () =>
    screen.queryByText('Create control finding');
  const createControlFindingMultipleAside = () =>
    screen.queryByText('Create control findings');

  const createObligationFindingSingleAside = () =>
    screen.queryByText('Create obligation finding');
  const createObligationFindingMultipleAside = () =>
    screen.queryByText('Create obligation findings');

  describe('when loaded - no linked items', () => {
    let container: HTMLElement;
    beforeEach(async () => {
      when(mockedUseGetGuidParam)
        .calledWith('assessmentId')
        .mockReturnValue('assessment-1');
      when(mockedUseGetGuidParam)
        .calledWith('activityId')
        .mockReturnValue('assessment-activity-1');
      const result = createRender([]);

      await waitUntilLoaded();
      container = result.container;
      await waitFor(() => {
        const select = createWrapper(container).findSelect();
        expect(select?.getElement()).toBeDefined();
      });
    });

    it('Save button is shown', async () => {
      expect(saveButton()).toBeInTheDocument();
    });

    it('Cancel button is shown', async () => {
      expect(cancelButton()).toBeInTheDocument();
    });

    it('Title input is shown', async () => {
      expect(titleInput()).toBeInTheDocument();
    });

    it('Activity type input is shown', async () => {
      expect(activityTypeDropdown()).toBeInTheDocument();
    });

    it('Activity summary input is shown', async () => {
      expect(activitySummaryInput()).toBeInTheDocument();
    });

    it('Status input is shown', async () => {
      expect(statusInput()).toBeInTheDocument();
    });

    it('Activity user input is shown', async () => {
      expect(activityUserInput()).toBeInTheDocument();
    });

    it('Completion date input is shown', async () => {
      const inputs = completionDateInput();
      expect(inputs.length).toBeGreaterThan(0);
      expect(inputs[0]).toBeInTheDocument();
    });

    it('Files input is shown', async () => {
      expect(attachFilesInput()).toBeInTheDocument();
    });

    it('No finding shortcuts should be shown', async () => {
      await waitFor(() => {
        expect(createRiskFindingSingleAside()).not.toBeInTheDocument();
        expect(createRiskFindingMultipleAside()).not.toBeInTheDocument();
        expect(createDocumentFindingSingleAside()).not.toBeInTheDocument();
        expect(createDocumentFindingMultipleAside()).not.toBeInTheDocument();
        expect(createControlFindingSingleAside()).not.toBeInTheDocument();
        expect(createControlFindingMultipleAside()).not.toBeInTheDocument();
        expect(createObligationFindingSingleAside()).not.toBeInTheDocument();
        expect(createObligationFindingMultipleAside()).not.toBeInTheDocument();
      });
    });
  });

  // Risks Finding Creation
  describe('when loaded - 1 linked risk', () => {
    let container: HTMLElement;
    beforeEach(async () => {
      when(mockedUseGetGuidParam)
        .calledWith('assessmentId')
        .mockReturnValue('assessment-1');
      when(mockedUseGetGuidParam)
        .calledWith('activityId')
        .mockReturnValue('assessment-activity-1');
      const result = createRender([
        {
          Id: 'linked-item-1',
          Source: 'assessment-activity-1',
          Target: 'risk-1',
          target_risk: {
            Id: 'risk-1',
            Title: 'Risk1',
            Tier: 1,
            ModifiedByUser: '',
            CreatedByUser: '',
            CreatedAtTimestamp: '',
            ModifiedAtTimestamp: '',
            schedule: { Id: 'linked-item-1' },
          },
        },
      ]);

      await waitUntilLoaded();
      container = result.container;
      await waitFor(() => {
        const select = createWrapper(container).findSelect();
        expect(select?.getElement()).toBeDefined();
      });
    });

    it('Only risk finding shortcut should be shown - singular', async () => {
      await waitFor(() => {
        expect(createRiskFindingSingleAside()).toBeInTheDocument();
        expect(createRiskFindingMultipleAside()).not.toBeInTheDocument();
        expect(createDocumentFindingSingleAside()).not.toBeInTheDocument();
        expect(createDocumentFindingMultipleAside()).not.toBeInTheDocument();
        expect(createControlFindingSingleAside()).not.toBeInTheDocument();
        expect(createControlFindingMultipleAside()).not.toBeInTheDocument();
        expect(createObligationFindingSingleAside()).not.toBeInTheDocument();
        expect(createObligationFindingMultipleAside()).not.toBeInTheDocument();
      });
    });
  });

  describe('when loaded - 2 linked risks', () => {
    let container: HTMLElement;
    beforeEach(async () => {
      when(mockedUseGetGuidParam)
        .calledWith('assessmentId')
        .mockReturnValue('assessment-1');
      when(mockedUseGetGuidParam)
        .calledWith('activityId')
        .mockReturnValue('assessment-activity-1');
      const result = createRender([
        {
          Id: 'linked-item-1',
          Source: 'assessment-activity-1',
          Target: 'risk-1',
          target_risk: {
            Id: 'risk-1',
            Title: 'Risk1',
            Tier: 1,
            ModifiedByUser: '',
            CreatedByUser: '',
            CreatedAtTimestamp: '',
            ModifiedAtTimestamp: '',
            schedule: { Id: 'linked-item-1' },
          },
        },
        {
          Id: 'linked-item-2',
          Source: 'assessment-activity-1',
          Target: 'risk-2',
          target_risk: {
            Id: 'risk-2',
            Title: 'Risk2',
            Tier: 1,
            ModifiedByUser: '',
            CreatedByUser: '',
            CreatedAtTimestamp: '',
            ModifiedAtTimestamp: '',
            schedule: { Id: 'risk-2' },
          },
        },
      ]);

      await waitUntilLoaded();
      container = result.container;
      await waitFor(() => {
        const select = createWrapper(container).findSelect();
        expect(select?.getElement()).toBeDefined();
      });
    });

    it('Only risk finding shortcut should be shown - multiple', async () => {
      await waitFor(() => {
        expect(createRiskFindingSingleAside()).not.toBeInTheDocument();
        expect(createRiskFindingMultipleAside()).toBeInTheDocument();
        expect(createDocumentFindingSingleAside()).not.toBeInTheDocument();
        expect(createDocumentFindingMultipleAside()).not.toBeInTheDocument();
        expect(createControlFindingSingleAside()).not.toBeInTheDocument();
        expect(createControlFindingMultipleAside()).not.toBeInTheDocument();
        expect(createObligationFindingSingleAside()).not.toBeInTheDocument();
        expect(createObligationFindingMultipleAside()).not.toBeInTheDocument();
      });
    });
  });

  // Control Finding Creation
  describe('when loaded - 1 linked control', () => {
    let container: HTMLElement;
    beforeEach(async () => {
      when(mockedUseGetGuidParam)
        .calledWith('assessmentId')
        .mockReturnValue('assessment-1');
      when(mockedUseGetGuidParam)
        .calledWith('activityId')
        .mockReturnValue('assessment-activity-1');
      const result = createRender([
        {
          Id: 'linked-item-1',
          Source: 'assessment-activity-1',
          Target: 'control-1',
          target_control: {
            schedule: { Id: 'control-1' },
            CreatedAtTimestamp: '',
            CustomAttributeData: undefined,
            Description: '',
            Id: 'control-1',
            ModifiedAtTimestamp: '',
            ModifiedByUser: '',
            SequentialId: 1,
            Title: 'Control 1',
            Type: 'Detective',
            __typename: 'control',
          },
        },
      ]);

      await waitUntilLoaded();
      container = result.container;
      await waitFor(() => {
        const select = createWrapper(container).findSelect();
        expect(select?.getElement()).toBeDefined();
      });
    });

    it('Only control finding shortcut should be shown - singular', async () => {
      await waitFor(() => {
        expect(createRiskFindingSingleAside()).not.toBeInTheDocument();
        expect(createRiskFindingMultipleAside()).not.toBeInTheDocument();
        expect(createDocumentFindingSingleAside()).not.toBeInTheDocument();
        expect(createDocumentFindingMultipleAside()).not.toBeInTheDocument();
        expect(createControlFindingSingleAside()).toBeInTheDocument();
        expect(createControlFindingMultipleAside()).not.toBeInTheDocument();
        expect(createObligationFindingSingleAside()).not.toBeInTheDocument();
        expect(createObligationFindingMultipleAside()).not.toBeInTheDocument();
      });
    });
  });

  describe('when loaded - 2 linked controls', () => {
    let container: HTMLElement;
    beforeEach(async () => {
      when(mockedUseGetGuidParam)
        .calledWith('assessmentId')
        .mockReturnValue('assessment-1');
      when(mockedUseGetGuidParam)
        .calledWith('activityId')
        .mockReturnValue('assessment-activity-1');
      const result = createRender([
        {
          Id: 'linked-item-1',
          Source: 'assessment-activity-1',
          Target: 'control-1',
          target_control: {
            schedule: { Id: 'control-1' },
            CreatedAtTimestamp: '',
            CustomAttributeData: undefined,
            Description: '',
            Id: 'control-1',
            ModifiedAtTimestamp: '',
            ModifiedByUser: '',
            SequentialId: 1,
            Title: 'Control 1',
            Type: 'Detective',
            __typename: 'control',
          },
        },
        {
          Id: 'linked-item-2',
          Source: 'assessment-activity-1',
          Target: 'control-2',
          target_control: {
            schedule: { Id: 'control-2' },
            CreatedAtTimestamp: '',
            CustomAttributeData: undefined,
            Description: '',
            Id: 'control-2',
            ModifiedAtTimestamp: '',
            ModifiedByUser: '',
            SequentialId: 1,
            Title: 'Control 2',
            Type: 'Detective',
            __typename: 'control',
          },
        },
      ]);

      await waitUntilLoaded();
      container = result.container;
      await waitFor(() => {
        const select = createWrapper(container).findSelect();
        expect(select?.getElement()).toBeDefined();
      });
    });

    it('Only control finding shortcut should be shown - multiple', async () => {
      await waitFor(() => {
        expect(createRiskFindingSingleAside()).not.toBeInTheDocument();
        expect(createRiskFindingMultipleAside()).not.toBeInTheDocument();
        expect(createDocumentFindingSingleAside()).not.toBeInTheDocument();
        expect(createDocumentFindingMultipleAside()).not.toBeInTheDocument();
        expect(createControlFindingSingleAside()).not.toBeInTheDocument();
        expect(createControlFindingMultipleAside()).toBeInTheDocument();
        expect(createObligationFindingSingleAside()).not.toBeInTheDocument();
        expect(createObligationFindingMultipleAside()).not.toBeInTheDocument();
      });
    });
  });

  // Obligation Finding Creation
  describe('when loaded - 1 linked obligations', () => {
    let container: HTMLElement;
    beforeEach(async () => {
      when(mockedUseGetGuidParam)
        .calledWith('assessmentId')
        .mockReturnValue('assessment-1');
      when(mockedUseGetGuidParam)
        .calledWith('activityId')
        .mockReturnValue('assessment-activity-1');
      const result = createRender([
        {
          Id: 'linked-item-1',
          Source: 'assessment-activity-1',
          Target: 'obligation-1',
          target_obligation: {
            Adherence: '',
            CreatedAtTimestamp: '',
            CreatedByUser: '',
            Description: '',
            Id: 'obligation-1',
            ModifiedAtTimestamp: '',
            ModifiedByUser: '',
            Title: 'Obligation 1',
            Type: 'rule',
            __typename: 'obligation',
          },
        },
      ]);

      container = result.container;
      await waitFor(() => {
        const select = createWrapper(container).findSelect();
        expect(select?.getElement()).toBeDefined();
      });
    });

    it('Only obligation finding shortcut should be shown - singular', async () => {
      await waitFor(() => {
        expect(createRiskFindingSingleAside()).not.toBeInTheDocument();
        expect(createRiskFindingMultipleAside()).not.toBeInTheDocument();
        expect(createDocumentFindingSingleAside()).not.toBeInTheDocument();
        expect(createDocumentFindingMultipleAside()).not.toBeInTheDocument();
        expect(createControlFindingSingleAside()).not.toBeInTheDocument();
        expect(createControlFindingMultipleAside()).not.toBeInTheDocument();
        expect(createObligationFindingSingleAside()).toBeInTheDocument();
        expect(createObligationFindingMultipleAside()).not.toBeInTheDocument();
      });
    });
  });

  describe('when loaded - 2 linked obligations', () => {
    let container: HTMLElement;
    beforeEach(async () => {
      when(mockedUseGetGuidParam)
        .calledWith('assessmentId')
        .mockReturnValue('assessment-1');
      when(mockedUseGetGuidParam)
        .calledWith('activityId')
        .mockReturnValue('assessment-activity-1');
      const result = createRender([
        {
          Id: 'linked-item-1',
          Source: 'assessment-activity-1',
          Target: 'obligation-1',
          target_obligation: {
            Adherence: '',
            CreatedAtTimestamp: '',
            CreatedByUser: '',
            Description: '',
            Id: 'obligation-1',
            ModifiedAtTimestamp: '',
            ModifiedByUser: '',
            Title: 'Obligation 1',
            Type: 'rule',
            __typename: 'obligation',
          },
        },
        {
          Id: 'linked-item-2',
          Source: 'assessment-activity-1',
          Target: 'obligation-2',
          target_obligation: {
            Adherence: '',
            CreatedAtTimestamp: '',
            CreatedByUser: '',
            Description: '',
            Id: 'obligation-2',
            ModifiedAtTimestamp: '',
            ModifiedByUser: '',
            Title: 'Obligation 2',
            Type: 'rule',
            __typename: 'obligation',
          },
        },
      ]);

      await waitUntilLoaded();
      container = result.container;
      await waitFor(() => {
        const select = createWrapper(container).findSelect();
        expect(select?.getElement()).toBeDefined();
      });
    });

    it('Only obligation finding shortcut should be shown - multiple', async () => {
      await waitFor(() => {
        expect(createRiskFindingSingleAside()).not.toBeInTheDocument();
        expect(createRiskFindingMultipleAside()).not.toBeInTheDocument();
        expect(createDocumentFindingSingleAside()).not.toBeInTheDocument();
        expect(createDocumentFindingMultipleAside()).not.toBeInTheDocument();
        expect(createControlFindingSingleAside()).not.toBeInTheDocument();
        expect(createControlFindingMultipleAside()).not.toBeInTheDocument();
        expect(createObligationFindingSingleAside()).not.toBeInTheDocument();
        expect(createObligationFindingMultipleAside()).toBeInTheDocument();
      });
    });
  });

  // Document Finding Creation
  describe('when loaded - 1 linked document', () => {
    let container: HTMLElement;
    beforeEach(async () => {
      when(mockedUseGetGuidParam)
        .calledWith('assessmentId')
        .mockReturnValue('assessment-1');
      when(mockedUseGetGuidParam)
        .calledWith('activityId')
        .mockReturnValue('assessment-activity-1');
      const result = createRender([
        {
          Id: 'linked-item-1',
          Source: 'assessment-activity-1',
          Target: 'document-1',
          target_document: {
            CreatedAtTimestamp: '',
            CreatedByUser: '',
            DocumentType: '',
            Id: 'document-1',
            ModifiedAtTimestamp: '',
            ModifiedByUser: '',
            Title: 'Document 1',
            __typename: 'document',
          },
        },
      ]);

      await waitUntilLoaded();
      container = result.container;
      await waitFor(() => {
        const select = createWrapper(container).findSelect();
        expect(select?.getElement()).toBeDefined();
      });
    });

    it('Only document finding shortcut should be shown - singular', async () => {
      await waitFor(() => {
        expect(createRiskFindingSingleAside()).not.toBeInTheDocument();
        expect(createRiskFindingMultipleAside()).not.toBeInTheDocument();
        expect(createDocumentFindingSingleAside()).toBeInTheDocument();
        expect(createDocumentFindingMultipleAside()).not.toBeInTheDocument();
        expect(createControlFindingSingleAside()).not.toBeInTheDocument();
        expect(createControlFindingMultipleAside()).not.toBeInTheDocument();
        expect(createObligationFindingSingleAside()).not.toBeInTheDocument();
        expect(createObligationFindingMultipleAside()).not.toBeInTheDocument();
      });
    });
  });

  describe('when loaded - 2 linked documents', () => {
    let container: HTMLElement;
    beforeEach(async () => {
      when(mockedUseGetGuidParam)
        .calledWith('assessmentId')
        .mockReturnValue('assessment-1');
      when(mockedUseGetGuidParam)
        .calledWith('activityId')
        .mockReturnValue('assessment-activity-1');
      const result = createRender([
        {
          Id: 'linked-item-1',
          Source: 'assessment-activity-1',
          Target: 'document-1',
          target_document: {
            CreatedAtTimestamp: '',
            CreatedByUser: '',
            DocumentType: '',
            Id: 'document-1',
            ModifiedAtTimestamp: '',
            ModifiedByUser: '',
            Title: 'Document 1',
            __typename: 'document',
          },
        },
        {
          Id: 'linked-item-2',
          Source: 'assessment-activity-1',
          Target: 'document-2',
          target_document: {
            CreatedAtTimestamp: '',
            CreatedByUser: '',
            DocumentType: '',
            Id: 'document-2',
            ModifiedAtTimestamp: '',
            ModifiedByUser: '',
            Title: 'Document 2',
            __typename: 'document',
          },
        },
      ]);

      await waitUntilLoaded();
      container = result.container;
      await waitFor(() => {
        const select = createWrapper(container).findSelect();
        expect(select?.getElement()).toBeDefined();
      });
    });

    it('Only document finding shortcut should be shown - multiple', async () => {
      await waitFor(() => {
        expect(createRiskFindingSingleAside()).not.toBeInTheDocument();
        expect(createRiskFindingMultipleAside()).not.toBeInTheDocument();
        expect(createDocumentFindingSingleAside()).not.toBeInTheDocument();
        expect(createDocumentFindingMultipleAside()).toBeInTheDocument();
        expect(createControlFindingSingleAside()).not.toBeInTheDocument();
        expect(createControlFindingMultipleAside()).not.toBeInTheDocument();
        expect(createObligationFindingSingleAside()).not.toBeInTheDocument();
        expect(createObligationFindingMultipleAside()).not.toBeInTheDocument();
      });
    });
  });

  // Combined
  describe('when loaded - All linked types', () => {
    let container: HTMLElement;
    beforeEach(async () => {
      when(mockedUseGetGuidParam)
        .calledWith('assessmentId')
        .mockReturnValue('assessment-1');
      when(mockedUseGetGuidParam)
        .calledWith('activityId')
        .mockReturnValue('assessment-activity-1');
      const result = createRender([
        // Document Links
        {
          Id: 'linked-item-1',
          Source: 'assessment-activity-1',
          Target: 'document-1',
          target_document: {
            CreatedAtTimestamp: '',
            CreatedByUser: '',
            DocumentType: '',
            Id: 'document-1',
            ModifiedAtTimestamp: '',
            ModifiedByUser: '',
            Title: 'Document 1',
            __typename: 'document',
          },
        },
        {
          Id: 'linked-item-2',
          Source: 'assessment-activity-1',
          Target: 'document-2',
          target_document: {
            CreatedAtTimestamp: '',
            CreatedByUser: '',
            DocumentType: '',
            Id: 'document-2',
            ModifiedAtTimestamp: '',
            ModifiedByUser: '',
            Title: 'Document 2',
            __typename: 'document',
          },
        },
        // Risk Links
        {
          Id: 'linked-item-3',
          Source: 'assessment-activity-1',
          Target: 'risk-1',
          target_risk: {
            Id: 'risk-1',
            Title: 'Risk1',
            Tier: 1,
            ModifiedByUser: '',
            CreatedByUser: '',
            CreatedAtTimestamp: '',
            ModifiedAtTimestamp: '',
            schedule: { Id: 'risk-1' },
          },
        },
        {
          Id: 'linked-item-3',
          Source: 'assessment-activity-1',
          Target: 'risk-2',
          target_risk: {
            Id: 'risk-2',
            Title: 'Risk2',
            Tier: 1,
            ModifiedByUser: '',
            CreatedByUser: '',
            CreatedAtTimestamp: '',
            ModifiedAtTimestamp: '',
            schedule: { Id: 'risk-2' },
          },
        },
        // Control Links
        {
          Id: 'linked-item-5',
          Source: 'assessment-activity-1',
          Target: 'control-1',
          target_control: {
            schedule: { Id: 'control-1' },
            CreatedAtTimestamp: '',
            CustomAttributeData: undefined,
            Description: '',
            Id: 'control-1',
            ModifiedAtTimestamp: '',
            ModifiedByUser: '',
            SequentialId: 1,
            Title: 'Control 1',
            Type: 'Detective',
            __typename: 'control',
          },
        },
        {
          Id: 'linked-item-6',
          Source: 'assessment-activity-1',
          Target: 'control-2',
          target_control: {
            schedule: { Id: 'control-2' },
            CreatedAtTimestamp: '',
            CustomAttributeData: undefined,
            Description: '',
            Id: 'control-2',
            ModifiedAtTimestamp: '',
            ModifiedByUser: '',
            SequentialId: 1,
            Title: 'Control 2',
            Type: 'Detective',
            __typename: 'control',
          },
        },
        // Obligation Links
        {
          Id: 'linked-item-7',
          Source: 'assessment-activity-1',
          Target: 'obligation-1',
          target_obligation: {
            Adherence: '',
            CreatedAtTimestamp: '',
            CreatedByUser: '',
            Description: '',
            Id: 'obligation-1',
            ModifiedAtTimestamp: '',
            ModifiedByUser: '',
            Title: 'Obligation 1',
            Type: 'rule',
            __typename: 'obligation',
          },
        },
        {
          Id: 'linked-item-8',
          Source: 'assessment-activity-1',
          Target: 'obligation-2',
          target_obligation: {
            Adherence: '',
            CreatedAtTimestamp: '',
            CreatedByUser: '',
            Description: '',
            Id: 'obligation-2',
            ModifiedAtTimestamp: '',
            ModifiedByUser: '',
            Title: 'Obligation 2',
            Type: 'rule',
            __typename: 'obligation',
          },
        },
      ]);

      await waitUntilLoaded();
      container = result.container;
      await waitFor(() => {
        const select = createWrapper(container).findSelect();
        expect(select?.getElement()).toBeDefined();
      });
    });

    it('All finding shortcuts should be shown - multiple', async () => {
      await waitFor(() => {
        const riskFindingTitleElement = createRiskFindingMultipleAside();
        expect(riskFindingTitleElement).toBeInTheDocument();
        expect(createDocumentFindingMultipleAside()).toBeInTheDocument();
        expect(createControlFindingMultipleAside()).toBeInTheDocument();
        expect(createObligationFindingMultipleAside()).toBeInTheDocument();
      });
    });
  });
});
