import { MockedProvider, type MockedResponse } from '@apollo/client/testing';
import {
  GetRisksWithAncestorContributorsAndEntitiesDocument,
  GetRisksWithAncestorContributorsDocument,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type React from 'react';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';
import { useGetEntities } from 'src/hooks/queries/entity/useGetEntities';
import { FeaturesProvider } from 'src/rbac/FeatureProvider';
import { mockedGetOrganisation } from 'src/testing/mock-data/mockedGetOrganisation';
import { mockedGetOrganisationModuleResponse } from 'src/testing/mock-data/mockedGetOrganisationModule';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useEntityLabelsFeature } from '@/hooks/useEntityLabelsFeature';

import { ControlledRiskWithAncestorsMultiSelect } from './ControlledRiskWithAncestorsMultiSelect';

// Mock dependencies
vi.mock('@/hooks/useEntityLabelsFeature');
vi.mock('src/hooks/queries/entity/useGetEntities');
const mockUseGetEntities = vi.mocked(useGetEntities);
vi.mock('@/hooks/useGetEntitiesTrpc');
vi.mock('@/components/link', () => ({
  default: (props: { children: React.ReactNode }) => <>{props.children}</>,
}));
vi.mock('@risksmart-app/components/src/notifications/useNotifications', () => ({
  useNotifications: () => ({
    addNotification: vi.fn(),
  }),
}));

// Mock GraphQL data
const mockBasicRisks = [
  {
    Id: 'risk-1',
    Title: 'Risk 1',
    SequentialId: 1,
    ancestorContributors: [
      {
        user: {
          FriendlyName: 'John Doe',
        },
        user_group: null,
      },
      {
        user: null,
        user_group: {
          Name: 'Risk Team',
        },
      },
    ],
  },
  {
    Id: 'risk-2',
    Title: 'Risk 2',
    SequentialId: 2,
    ancestorContributors: [
      {
        user: {
          FriendlyName: 'Jane Smith',
        },
        user_group: null,
      },
    ],
  },
  {
    Id: 'risk-3',
    Title: 'Risk 3',
    SequentialId: 3,
    ancestorContributors: [],
  },
];

const mockRisksWithEntities = [
  {
    Id: 'risk-1',
    Title: 'Risk 1',
    SequentialId: 1,
    ancestorContributors: [
      {
        user: {
          FriendlyName: 'John Doe',
        },
        user_group: null,
      },
    ],
    enterpriseRiskInstance: {
      EntityId: 'entity-1',
      entity: {
        Id: 'entity-1',
        Name: 'Entity 1',
        ParentId: 'parent-1',
        parent: {
          Id: 'parent-1',
          Name: 'Parent Entity',
          ParentId: null,
          parent: null,
        },
      },
    },
  },
  {
    Id: 'risk-2',
    Title: 'Risk 2',
    SequentialId: 2,
    ancestorContributors: [
      {
        user: null,
        user_group: {
          Name: 'Risk Team',
        },
      },
    ],
    enterpriseRiskInstance: {
      EntityId: 'entity-2',
      entity: {
        Id: 'entity-2',
        Name: 'Entity 2',
        ParentId: null,
        parent: null,
      },
    },
  },
  {
    Id: 'risk-3',
    Title: 'Risk 3',
    SequentialId: 3,
    ancestorContributors: [],
    enterpriseRiskInstance: null,
  },
];

const mockBasicQuery: MockedResponse = {
  request: {
    query: GetRisksWithAncestorContributorsDocument,
  },
  result: {
    data: {
      risk: mockBasicRisks,
    },
  },
};

const mockRisksWithAncestorContributorsAndEntitiesQuery: MockedResponse = {
  request: {
    query: GetRisksWithAncestorContributorsAndEntitiesDocument,
  },
  result: {
    data: {
      risk: mockRisksWithEntities,
    },
  },
};

const mockErrorQuery: MockedResponse = {
  request: {
    query: GetRisksWithAncestorContributorsDocument,
  },
  error: new Error('GraphQL Error'),
};

// Test wrapper component
interface TestWrapperProps {
  children: React.ReactNode;
  defaultValues?: { testField: (object | undefined)[] };
  mocks?: MockedResponse[];
}

const TestWrapper = ({
  children,
  defaultValues = { testField: [] },
  mocks = [
    mockedGetOrganisation(),
    mockedGetOrganisationModuleResponse(),
    mockBasicQuery,
    mockRisksWithAncestorContributorsAndEntitiesQuery,
  ],
}: TestWrapperProps) => {
  const methods = useForm({ defaultValues });

  return (
    <MockedProvider mocks={mocks} addTypename={false}>
      <FeaturesProvider>
        <FormProvider {...methods}>
          <form>{children}</form>
        </FormProvider>
      </FeaturesProvider>
    </MockedProvider>
  );
};

// Helper component that provides control from context
const TestControlledRiskWithAncestorsMultiSelect = (
  props: Omit<
    React.ComponentProps<typeof ControlledRiskWithAncestorsMultiSelect>,
    'control'
  >
) => {
  const { control } = useFormContext();

  return (
    <ControlledRiskWithAncestorsMultiSelect {...props} control={control} />
  );
};

describe('ControlledRiskWithAncestorsMultiSelect', () => {
  const mockUseEntityLabelsFeature = vi.mocked(useEntityLabelsFeature);

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseGetEntities.mockReturnValue({
      data: {
        entity: [
          {
            Id: 'entity-1',
            Name: 'Entity 1',
            ParentId: 'parent-1',
            Description: '',
            CreatedAtTimestamp: '2023-01-01T00:00:00Z',
            ModifiedAtTimestamp: '2023-01-01T00:00:00Z',
            Weight: 1.0,
            ownerGroups: [],
            children: [],
            parent: null,
            owners: [],
            createdByUser: null,
            modifiedByUser: null,
          },
          {
            Id: 'parent-1',
            Name: 'Parent Entity',
            ParentId: null,
            Description: '',
            CreatedAtTimestamp: '2023-01-01T00:00:00Z',
            ModifiedAtTimestamp: '2023-01-01T00:00:00Z',
            Weight: 1.0,
            ownerGroups: [],
            children: [],
            parent: null,
            owners: [],
            createdByUser: null,
            modifiedByUser: null,
          },
          {
            Id: 'entity-2',
            Name: 'Entity 2',
            ParentId: null,
            Description: '',
            CreatedAtTimestamp: '2023-01-01T00:00:00Z',
            ModifiedAtTimestamp: '2023-01-01T00:00:00Z',
            Weight: 1.0,
            ownerGroups: [],
            children: [],
            parent: null,
            owners: [],
            createdByUser: null,
            modifiedByUser: null,
          },
        ],
      },
      refetch: vi.fn(),
      loading: false,
      error: undefined,
    });
  });

  describe('Basic functionality', () => {
    it('should render with basic props', async () => {
      mockUseEntityLabelsFeature.mockReturnValue({
        shouldShowEntityLabels: false,
        entitiesEnabled: false,
        hasEntityFilter: false,
        isMultiEntityContext: false,
        entityFilterCount: 0,
      });

      render(
        <TestWrapper
          mocks={[
            mockedGetOrganisation(),
            mockedGetOrganisationModuleResponse(),

            mockBasicQuery,
            mockRisksWithAncestorContributorsAndEntitiesQuery,
          ]}
        >
          <TestControlledRiskWithAncestorsMultiSelect
            name={'testField'}
            label={'Test Risk Multi Select'}
            data-testid={'risk-multiselect'}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('risk-multiselect')).toBeInTheDocument();
        expect(
          screen.getByLabelText('Test Risk Multi Select')
        ).toBeInTheDocument();
      });
    });

    it('should show loading state while fetching data', async () => {
      mockUseEntityLabelsFeature.mockReturnValue({
        shouldShowEntityLabels: false,
        entitiesEnabled: false,
        hasEntityFilter: false,
        isMultiEntityContext: false,
        entityFilterCount: 0,
      });

      render(
        <TestWrapper
          mocks={[
            mockedGetOrganisation(),
            mockedGetOrganisationModuleResponse(),
            mockBasicQuery,
            mockRisksWithAncestorContributorsAndEntitiesQuery,
          ]}
        >
          <TestControlledRiskWithAncestorsMultiSelect
            name={'testField'}
            label={'Test Risk Multi Select'}
            data-testid={'risk-multiselect'}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        // Initial loading state
        expect(screen.getByRole('button')).toBeInTheDocument();
      });

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByRole('button')).not.toHaveAttribute('aria-busy');
      });
    });

    it('should be disabled when disabled prop is true', async () => {
      mockUseEntityLabelsFeature.mockReturnValue({
        shouldShowEntityLabels: false,
        entitiesEnabled: false,
        hasEntityFilter: false,
        isMultiEntityContext: false,
        entityFilterCount: 0,
      });

      render(
        <TestWrapper
          mocks={[
            mockedGetOrganisation(),
            mockedGetOrganisationModuleResponse(),
            mockBasicQuery,
            mockRisksWithAncestorContributorsAndEntitiesQuery,
          ]}
        >
          <TestControlledRiskWithAncestorsMultiSelect
            name={'testField'}
            label={'Test Risk Multi Select'}
            disabled
            data-testid={'risk-multiselect'}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByRole('button')).toBeDisabled();
      });
    });
  });

  describe('Entity labels feature', () => {
    it('should use basic query when entity labels are disabled', async () => {
      mockUseEntityLabelsFeature.mockReturnValue({
        shouldShowEntityLabels: false,
        entitiesEnabled: false,
        hasEntityFilter: false,
        isMultiEntityContext: false,
        entityFilterCount: 0,
      });

      render(
        <TestWrapper
          mocks={[
            mockedGetOrganisation(),
            mockedGetOrganisationModuleResponse(),
            mockBasicQuery,
          ]}
        >
          <TestControlledRiskWithAncestorsMultiSelect
            name={'testField'}
            label={'Test Risk Multi Select'}
            data-testid={'risk-multiselect'}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('risk-multiselect')).toBeInTheDocument();
      });

      // Should show ancestor contributors but not entity information
      const user = userEvent.setup();
      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument();
      });
      await user.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByText('Risk 1')).toBeInTheDocument();
        expect(screen.getByText('Risk 2')).toBeInTheDocument();
        expect(screen.getByText('Risk 3')).toBeInTheDocument();
      });
    });

    it('should use entities query when entity labels are enabled', async () => {
      mockUseEntityLabelsFeature.mockReturnValue({
        shouldShowEntityLabels: true,
        entitiesEnabled: true,
        hasEntityFilter: false,
        isMultiEntityContext: false,
        entityFilterCount: 0,
      });

      render(
        <TestWrapper
          mocks={[
            mockedGetOrganisation(),
            mockedGetOrganisationModuleResponse(),
            mockRisksWithAncestorContributorsAndEntitiesQuery,
          ]}
        >
          <TestControlledRiskWithAncestorsMultiSelect
            name={'testField'}
            label={'Test Risk Multi Select'}
            data-testid={'risk-multiselect'}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('risk-multiselect')).toBeInTheDocument();
      });

      // Should load with entity information
      const user = userEvent.setup();
      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument();
      });
      await user.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByText('Risk 1')).toBeInTheDocument();
      });
    });

    it('should override showEntityLabels prop with feature flag', async () => {
      // Feature disabled should override prop
      mockUseEntityLabelsFeature.mockReturnValue({
        shouldShowEntityLabels: false,
        entitiesEnabled: false,
        hasEntityFilter: false,
        isMultiEntityContext: false,
        entityFilterCount: 0,
      });

      render(
        <TestWrapper>
          <TestControlledRiskWithAncestorsMultiSelect
            name={'testField'}
            label={'Test Risk Multi Select'}
            showEntityLabels={true}
            data-testid={'risk-multiselect'}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('risk-multiselect')).toBeInTheDocument();
      });
    });
  });

  describe('Ancestor contributors handling', () => {
    it('should display contributor information in option descriptions', async () => {
      mockUseEntityLabelsFeature.mockReturnValue({
        shouldShowEntityLabels: false,
        entitiesEnabled: false,
        hasEntityFilter: false,
        isMultiEntityContext: false,
        entityFilterCount: 0,
      });

      render(
        <TestWrapper>
          <TestControlledRiskWithAncestorsMultiSelect
            name={'testField'}
            label={'Test Risk Multi Select'}
            data-testid={'risk-multiselect'}
          />
        </TestWrapper>
      );

      const user = userEvent.setup();
      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument();
      });
      await user.click(screen.getByRole('button'));

      await waitFor(() => {
        // Should show contributor information in descriptions
        expect(
          screen.getByText(/Contributors: John Doe, Risk Team/)
        ).toBeInTheDocument();
        expect(
          screen.getByText(/Contributors: Jane Smith/)
        ).toBeInTheDocument();
      });
    });

    it('should handle risks with no contributors', async () => {
      mockUseEntityLabelsFeature.mockReturnValue({
        shouldShowEntityLabels: false,
        entitiesEnabled: false,
        hasEntityFilter: false,
        isMultiEntityContext: false,
        entityFilterCount: 0,
      });

      render(
        <TestWrapper>
          <TestControlledRiskWithAncestorsMultiSelect
            name={'testField'}
            label={'Test Risk Multi Select'}
            data-testid={'risk-multiselect'}
          />
        </TestWrapper>
      );

      const user = userEvent.setup();
      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument();
      });
      await user.click(screen.getByRole('button'));

      await waitFor(() => {
        // Risk 3 has no contributors and should still be displayed
        expect(screen.getByText('Risk 3')).toBeInTheDocument();
      });
    });

    it('should combine entity and contributor information when both are available', async () => {
      mockUseEntityLabelsFeature.mockReturnValue({
        shouldShowEntityLabels: true,
        entitiesEnabled: true,
        hasEntityFilter: false,
        isMultiEntityContext: false,
        entityFilterCount: 0,
      });

      render(
        <TestWrapper
          mocks={[
            mockedGetOrganisation(),
            mockedGetOrganisationModuleResponse(),
            mockRisksWithAncestorContributorsAndEntitiesQuery,
          ]}
        >
          <TestControlledRiskWithAncestorsMultiSelect
            name={'testField'}
            label={'Test Risk Multi Select'}
            data-testid={'risk-multiselect'}
          />
        </TestWrapper>
      );

      const user = userEvent.setup();
      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument();
      });
      await user.click(screen.getByRole('button'));

      await waitFor(() => {
        // Should show both entity and contributor information
        expect(
          screen.getByText(
            /Entity: Parent Entity > Entity 1 \| Contributors: John Doe/
          )
        ).toBeInTheDocument();
        expect(
          screen.getByText(/Entity: Entity 2 \| Contributors: Risk Team/)
        ).toBeInTheDocument();
      });
    });
  });

  describe('Options filtering', () => {
    it('should exclude specified risk IDs', async () => {
      mockUseEntityLabelsFeature.mockReturnValue({
        shouldShowEntityLabels: false,
        entitiesEnabled: false,
        hasEntityFilter: false,
        isMultiEntityContext: false,
        entityFilterCount: 0,
      });

      render(
        <TestWrapper>
          <TestControlledRiskWithAncestorsMultiSelect
            name={'testField'}
            label={'Test Risk Multi Select'}
            excludedIds={['risk-1']}
            data-testid={'risk-multiselect'}
          />
        </TestWrapper>
      );

      const user = userEvent.setup();
      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument();
      });
      await user.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByText('Risk 2')).toBeInTheDocument();
        expect(screen.getByText('Risk 3')).toBeInTheDocument();
        expect(screen.queryByText('Risk 1')).not.toBeInTheDocument();
      });
    });

    it('should apply custom risk filter function', async () => {
      mockUseEntityLabelsFeature.mockReturnValue({
        shouldShowEntityLabels: false,
        entitiesEnabled: false,
        hasEntityFilter: false,
        isMultiEntityContext: false,
        entityFilterCount: 0,
      });

      const riskFilter = vi
        .fn()
        .mockImplementation((risk) => risk.Id === 'risk-2');

      render(
        <TestWrapper>
          <TestControlledRiskWithAncestorsMultiSelect
            name={'testField'}
            label={'Test Risk Multi Select'}
            riskFilter={riskFilter}
            data-testid={'risk-multiselect'}
          />
        </TestWrapper>
      );

      const user = userEvent.setup();
      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument();
      });
      await user.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByText('Risk 2')).toBeInTheDocument();
        expect(screen.queryByText('Risk 1')).not.toBeInTheDocument();
        expect(screen.queryByText('Risk 3')).not.toBeInTheDocument();
      });

      expect(riskFilter).toHaveBeenCalled();
    });

    it('should mark disabled options correctly', async () => {
      mockUseEntityLabelsFeature.mockReturnValue({
        shouldShowEntityLabels: false,
        entitiesEnabled: false,
        hasEntityFilter: false,
        isMultiEntityContext: false,
        entityFilterCount: 0,
      });

      const disabledOptions = [
        { riskId: 'risk-1', reason: 'Permission denied' },
      ];

      render(
        <TestWrapper>
          <TestControlledRiskWithAncestorsMultiSelect
            name={'testField'}
            label={'Test Risk Multi Select'}
            disabledOptions={disabledOptions}
            data-testid={'risk-multiselect'}
          />
        </TestWrapper>
      );

      const user = userEvent.setup();
      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument();
      });
      await user.click(screen.getByRole('button'));

      await waitFor(() => {
        const riskOption = screen.getByText('Risk 1');
        expect(riskOption.closest('[role="option"]')).toHaveAttribute(
          'aria-disabled',
          'true'
        );
      });
    });
  });

  describe('Token rendering', () => {
    it('should render basic tokens when entity labels disabled', async () => {
      mockUseEntityLabelsFeature.mockReturnValue({
        shouldShowEntityLabels: false,
        entitiesEnabled: false,
        hasEntityFilter: false,
        isMultiEntityContext: false,
        entityFilterCount: 0,
      });

      render(
        <TestWrapper
          defaultValues={{ testField: [mockBasicRisks[0], mockBasicRisks[1]] }}
        >
          <TestControlledRiskWithAncestorsMultiSelect
            name={'testField'}
            label={'Test Risk Multi Select'}
            data-testid={'risk-multiselect'}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        // Look for token elements or the multiselect button text content
        const tokenElements = screen.queryAllByRole('button', {
          name: /remove/i,
        });
        expect(tokenElements.length).toBeGreaterThan(0);
      });
    });

    it('should render enhanced tokens with entity info when enabled', async () => {
      mockUseEntityLabelsFeature.mockReturnValue({
        shouldShowEntityLabels: true,
        entitiesEnabled: true,
        hasEntityFilter: false,
        isMultiEntityContext: false,
        entityFilterCount: 0,
      });

      render(
        <TestWrapper
          defaultValues={{ testField: [mockRisksWithEntities[0]] }}
          mocks={[
            mockedGetOrganisation(),
            mockedGetOrganisationModuleResponse(),
            mockRisksWithAncestorContributorsAndEntitiesQuery,
          ]}
        >
          <TestControlledRiskWithAncestorsMultiSelect
            name={'testField'}
            label={'Test Risk Multi Select'}
            data-testid={'risk-multiselect'}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        // Look for tokens with entity information
        const tokenElements = screen.queryAllByRole('button', {
          name: /remove/i,
        });
        expect(tokenElements.length).toBeGreaterThan(0);
      });
    });

    it('should filter out tokens with invalid values', async () => {
      mockUseEntityLabelsFeature.mockReturnValue({
        shouldShowEntityLabels: false,
        entitiesEnabled: false,
        hasEntityFilter: false,
        isMultiEntityContext: false,
        entityFilterCount: 0,
      });

      render(
        <TestWrapper
          defaultValues={{
            testField: [mockBasicRisks[0], undefined, mockBasicRisks[1]],
          }}
        >
          <TestControlledRiskWithAncestorsMultiSelect
            name={'testField'}
            label={'Test Risk Multi Select'}
            data-testid={'risk-multiselect'}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        // Should not render tokens for null/undefined values
        expect(screen.getAllByRole('button', { name: /remove/i })).toHaveLength(
          2
        );
      });
    });

    it('should render tokens with entity subtitles when entities are enabled', async () => {
      mockUseEntityLabelsFeature.mockReturnValue({
        shouldShowEntityLabels: true,
        entitiesEnabled: true,
        hasEntityFilter: false,
        isMultiEntityContext: false,
        entityFilterCount: 0,
      });

      render(
        <TestWrapper
          defaultValues={{ testField: [mockRisksWithEntities[0]] }}
          mocks={[
            mockedGetOrganisation(),
            mockedGetOrganisationModuleResponse(),
            mockRisksWithAncestorContributorsAndEntitiesQuery,
          ]}
        >
          <TestControlledRiskWithAncestorsMultiSelect
            name={'testField'}
            label={'Test Risk Multi Select'}
            data-testid={'risk-multiselect'}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        // Token should be rendered with entity path as subtitle
        expect(
          screen.getByRole('button', { name: /remove/i })
        ).toBeInTheDocument();
      });
    });
  });

  describe('Error handling', () => {
    it('should handle GraphQL errors gracefully', async () => {
      vi.clearAllMocks();
      mockUseEntityLabelsFeature.mockReturnValue({
        shouldShowEntityLabels: false,
        entitiesEnabled: false,
        hasEntityFilter: false,
        isMultiEntityContext: false,
        entityFilterCount: 0,
      });
      mockUseGetEntities.mockRejectedValueOnce(new Error('GraphQL Error'));

      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation((): void => {
          // suppress error in test
        });

      render(
        <TestWrapper
          mocks={[
            mockedGetOrganisation(),
            mockedGetOrganisationModuleResponse(),
            mockErrorQuery,
          ]}
        >
          <TestControlledRiskWithAncestorsMultiSelect
            name={'testField'}
            label={'Test Risk Multi Select'}
            data-testid={'risk-multiselect'}
          />
        </TestWrapper>
      );

      // Component should still render despite error
      await waitFor(() =>
        expect(screen.getByTestId('risk-multiselect')).toBeInTheDocument()
      );

      consoleSpy.mockRestore();
    });

    it('should handle missing data gracefully', async () => {
      mockUseEntityLabelsFeature.mockReturnValue({
        shouldShowEntityLabels: false,
        entitiesEnabled: false,
        hasEntityFilter: false,
        isMultiEntityContext: false,
        entityFilterCount: 0,
      });

      const emptyQuery: MockedResponse = {
        request: {
          query: GetRisksWithAncestorContributorsDocument,
        },
        result: {
          data: {
            risk: [],
          },
        },
      };

      render(
        <TestWrapper
          mocks={[
            mockedGetOrganisation(),
            mockedGetOrganisationModuleResponse(),
            emptyQuery,
          ]}
        >
          <TestControlledRiskWithAncestorsMultiSelect
            name={'testField'}
            label={'Test Risk Multi Select'}
            data-testid={'risk-multiselect'}
          />
        </TestWrapper>
      );

      const user = userEvent.setup();
      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument();
      });
      await user.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByText(/no matches found/i)).toBeInTheDocument();
      });
    });

    it('should handle risks with missing titles gracefully', async () => {
      mockUseEntityLabelsFeature.mockReturnValue({
        shouldShowEntityLabels: false,
        entitiesEnabled: false,
        hasEntityFilter: false,
        isMultiEntityContext: false,
        entityFilterCount: 0,
      });

      const risksWithMissingTitles = [
        {
          Id: 'risk-1',
          Title: null,
          SequentialId: 1,
          ancestorContributors: [],
        },
      ];

      const queryWithMissingTitles: MockedResponse = {
        request: {
          query: GetRisksWithAncestorContributorsDocument,
        },
        result: {
          data: {
            risk: risksWithMissingTitles,
          },
        },
      };

      render(
        <TestWrapper
          mocks={[
            mockedGetOrganisation(),
            mockedGetOrganisationModuleResponse(),
            queryWithMissingTitles,
          ]}
        >
          <TestControlledRiskWithAncestorsMultiSelect
            name={'testField'}
            label={'Test Risk Multi Select'}
            data-testid={'risk-multiselect'}
          />
        </TestWrapper>
      );

      const user = userEvent.setup();
      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument();
      });
      await user.click(screen.getByRole('button'));

      await waitFor(() => {
        // Should show friendly ID when title is missing
        expect(screen.getAllByText('R-1')[0]).toBeInTheDocument();
      });
    });
  });

  describe('User interactions', () => {
    it('should allow selecting multiple options', async () => {
      mockUseEntityLabelsFeature.mockReturnValue({
        shouldShowEntityLabels: false,
        entitiesEnabled: false,
        hasEntityFilter: false,
        isMultiEntityContext: false,
        entityFilterCount: 0,
      });

      render(
        <TestWrapper>
          <TestControlledRiskWithAncestorsMultiSelect
            name={'testField'}
            label={'Test Risk Multi Select'}
            data-testid={'risk-multiselect'}
          />
        </TestWrapper>
      );

      const user = userEvent.setup();
      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument();
      });
      await user.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByText('Risk 1')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Risk 1'));
      await user.click(screen.getByText('Risk 2'));

      await waitFor(() => {
        expect(screen.getAllByRole('button', { name: /remove/i })).toHaveLength(
          2
        );
      });
    });

    it('should support filtering options by typing', async () => {
      mockUseEntityLabelsFeature.mockReturnValue({
        shouldShowEntityLabels: false,
        entitiesEnabled: false,
        hasEntityFilter: false,
        isMultiEntityContext: false,
        entityFilterCount: 0,
      });

      render(
        <TestWrapper>
          <TestControlledRiskWithAncestorsMultiSelect
            name={'testField'}
            label={'Test Risk Multi Select'}
            data-testid={'risk-multiselect'}
          />
        </TestWrapper>
      );

      const user = userEvent.setup();

      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument();
      });

      const button = screen.getByRole('button');
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText('Risk 1')).toBeInTheDocument();
      });

      // Find the filter input that appears after opening the dropdown
      const filterInput = screen.getByRole('combobox');
      await user.type(filterInput, 'Risk 2');

      await waitFor(() => {
        expect(screen.getByText('Risk 2')).toBeInTheDocument();
        expect(screen.queryByText('Risk 1')).not.toBeInTheDocument();
        expect(screen.queryByText('Risk 3')).not.toBeInTheDocument();
      });
    });

    it('should support searching by contributor names', async () => {
      mockUseEntityLabelsFeature.mockReturnValue({
        shouldShowEntityLabels: false,
        entitiesEnabled: false,
        hasEntityFilter: false,
        isMultiEntityContext: false,
        entityFilterCount: 0,
      });

      render(
        <TestWrapper>
          <TestControlledRiskWithAncestorsMultiSelect
            name={'testField'}
            label={'Test Risk Multi Select'}
            data-testid={'risk-multiselect'}
          />
        </TestWrapper>
      );

      const user = userEvent.setup();

      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument();
      });

      const button = screen.getByRole('button');
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText('Risk 1')).toBeInTheDocument();
      });

      // Find the filter input and search by contributor name
      const filterInput = screen.getByRole('combobox');
      await user.type(filterInput, 'John Doe');

      await waitFor(() => {
        // Should show risks that have John Doe as a contributor
        expect(screen.getByText('Risk 1')).toBeInTheDocument();
        expect(screen.queryByText('Risk 2')).not.toBeInTheDocument();
      });
    });
  });

  describe('Entity path handling', () => {
    it('should transform entity data correctly for entity paths', async () => {
      mockUseEntityLabelsFeature.mockReturnValue({
        shouldShowEntityLabels: true,
        entitiesEnabled: true,
        hasEntityFilter: false,
        isMultiEntityContext: false,
        entityFilterCount: 0,
      });

      render(
        <TestWrapper
          mocks={[
            mockedGetOrganisation(),
            mockedGetOrganisationModuleResponse(),
            mockRisksWithAncestorContributorsAndEntitiesQuery,
          ]}
        >
          <TestControlledRiskWithAncestorsMultiSelect
            name={'testField'}
            label={'Test Risk Multi Select'}
            data-testid={'risk-multiselect'}
          />
        </TestWrapper>
      );

      const user = userEvent.setup();
      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument();
      });
      await user.click(screen.getByRole('button'));

      await waitFor(() => {
        // Should show hierarchical entity path
        expect(
          screen.getByText(/Entity: Parent Entity > Entity 1/)
        ).toBeInTheDocument();
        expect(screen.getByText(/Entity: Entity 2/)).toBeInTheDocument();
      });
    });

    it('should handle risks without entity instances', async () => {
      mockUseEntityLabelsFeature.mockReturnValue({
        shouldShowEntityLabels: true,
        entitiesEnabled: true,
        hasEntityFilter: false,
        isMultiEntityContext: false,
        entityFilterCount: 0,
      });

      render(
        <TestWrapper
          mocks={[
            mockedGetOrganisation(),
            mockedGetOrganisationModuleResponse(),
            mockRisksWithAncestorContributorsAndEntitiesQuery,
          ]}
        >
          <TestControlledRiskWithAncestorsMultiSelect
            name={'testField'}
            label={'Test Risk Multi Select'}
            data-testid={'risk-multiselect'}
          />
        </TestWrapper>
      );

      const user = userEvent.setup();

      await waitFor(() => {
        // Initial loading state
        expect(screen.getByRole('button')).toBeInTheDocument();
      });
      await user.click(screen.getByRole('button'));

      await waitFor(() => {
        // Risk 3 has no entity instance
        expect(screen.getByText('Risk 3')).toBeInTheDocument();
      });
    });
  });
});
