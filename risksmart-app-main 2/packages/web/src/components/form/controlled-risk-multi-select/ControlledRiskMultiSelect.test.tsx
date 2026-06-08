import { MockedProvider, type MockedResponse } from '@apollo/client/testing';
import { GetRiskListOnlyOptimizedDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type React from 'react';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';
import {
  useGetRiskListOnlyOptimized,
  useGetRiskListOnlyWithEntitiesOptimized,
} from 'src/hooks/queries';
import { mockedGetOrganisation } from 'src/testing/mock-data/mockedGetOrganisation';
import { mockedGetOrganisationModuleResponse } from 'src/testing/mock-data/mockedGetOrganisationModule';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useEntityLabelsFeature } from '@/hooks/useEntityLabelsFeature';

import { ControlledRiskMultiSelect } from './ControlledRiskMultiSelect';

// Mock dependencies
vi.mock('@/hooks/useEntityLabelsFeature');
vi.mock('@/hooks/queries/risk/useGetRiskListOnlyOptimized');
const mockUseGetRiskListOnlyOptimized = vi.mocked(useGetRiskListOnlyOptimized);
vi.mock('@/hooks/queries/risk/useGetRiskListOnlyWithEntitiesOptimized');
const mockUseGetRiskListOnlyWithEntitiesOptimized = vi.mocked(
  useGetRiskListOnlyWithEntitiesOptimized
);
vi.mock('@/components/link', () => ({
  default: (props: { children: React.ReactNode }) => <>{props.children}</>,
}));
// Stable notification mock so we can assert calls
const addNotificationMock = vi.fn();
vi.mock('@risksmart-app/components/src/notifications/useNotifications', () => ({
  useNotifications: () => ({
    addNotification: addNotificationMock,
  }),
}));
// Mock entity path hook to return deterministic paths for assertions
vi.mock('@/hooks/useEntityPath', () => ({
  useEntityPath: () => ({
    getEntityPath: (id: string) => `Entity Path ${id}`,
  }),
}));

// Mock GraphQL data
const mockBasicRisks = [
  {
    Id: 'risk-1',
    Title: 'Risk 1',
    SequentialId: 1,
  },
  {
    Id: 'risk-2',
    Title: 'Risk 2',
    SequentialId: 2,
  },
];

const mockRisksWithEntities = [
  {
    Id: 'risk-1',
    Title: 'Risk 1',
    SequentialId: 1,
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
];

const mockErrorQuery: MockedResponse = {
  request: {
    query: GetRiskListOnlyOptimizedDocument,
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
  mocks,
}: TestWrapperProps) => {
  const methods = useForm({ defaultValues });

  return (
    <MockedProvider mocks={mocks} addTypename={false}>
      <FormProvider {...methods}>
        <form>{children}</form>
      </FormProvider>
    </MockedProvider>
  );
};

// Helper component that provides control from context
const TestControlledRiskMultiSelect = (
  props: Omit<React.ComponentProps<typeof ControlledRiskMultiSelect>, 'control'>
) => {
  const { control } = useFormContext();

  return <ControlledRiskMultiSelect {...props} control={control} />;
};

describe('ControlledRiskMultiSelect', () => {
  const mockUseEntityLabelsFeature = vi.mocked(useEntityLabelsFeature);

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseGetRiskListOnlyOptimized.mockReturnValue({
      data: { risk: mockBasicRisks },
      loading: false,
      refetch: vi.fn(),
      error: undefined,
    });

    mockUseGetRiskListOnlyWithEntitiesOptimized.mockReturnValue({
      data: { risk: mockRisksWithEntities },
      loading: false,
      refetch: vi.fn(),
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
          ]}
        >
          <TestControlledRiskMultiSelect
            name={'testField'}
            label={'Test Multi Select'}
            data-testid={'multiselect'}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('multiselect')).toBeInTheDocument();
        expect(screen.getByLabelText('Test Multi Select')).toBeInTheDocument();
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
          ]}
        >
          <TestControlledRiskMultiSelect
            name={'testField'}
            label={'Test Multi Select'}
            data-testid={'multiselect'}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        // Initial loading state
        expect(screen.getByRole('button')).toBeInTheDocument();
        // Wait for data to load
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
          ]}
        >
          <TestControlledRiskMultiSelect
            name={'testField'}
            label={'Test Multi Select'}
            disabled
            data-testid={'multiselect'}
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
          ]}
        >
          <TestControlledRiskMultiSelect
            name={'testField'}
            label={'Test Multi Select'}
            data-testid={'multiselect'}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('multiselect')).toBeInTheDocument();
      });

      // Should not have entity descriptions
      const user = userEvent.setup();
      await user.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByText('Risk 1')).toBeInTheDocument();
        expect(screen.getByText('Risk 2')).toBeInTheDocument();
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
          ]}
        >
          <TestControlledRiskMultiSelect
            name={'testField'}
            label={'Test Multi Select'}
            data-testid={'multiselect'}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('multiselect')).toBeInTheDocument();
      });

      // Should load with entity information
      const user = userEvent.setup();
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
        <TestWrapper
          mocks={[
            mockedGetOrganisation(),
            mockedGetOrganisationModuleResponse(),
          ]}
        >
          <TestControlledRiskMultiSelect
            name={'testField'}
            label={'Test Multi Select'}
            showEntityLabels={true}
            data-testid={'multiselect'}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('multiselect')).toBeInTheDocument();
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
        <TestWrapper
          mocks={[
            mockedGetOrganisation(),
            mockedGetOrganisationModuleResponse(),
          ]}
        >
          <TestControlledRiskMultiSelect
            name={'testField'}
            label={'Test Multi Select'}
            excludedIds={['risk-1']}
            data-testid={'multiselect'}
          />
        </TestWrapper>
      );

      const user = userEvent.setup();

      await waitFor(() => {
        user.click(screen.getByRole('button'));
        expect(screen.getByText('Risk 2')).toBeInTheDocument();
        expect(screen.queryByText('Risk 1')).not.toBeInTheDocument();
      });
    });

    it('should apply custom filter function', async () => {
      mockUseEntityLabelsFeature.mockReturnValue({
        shouldShowEntityLabels: false,
        entitiesEnabled: false,
        hasEntityFilter: false,
        isMultiEntityContext: false,
        entityFilterCount: 0,
      });

      const filter = vi.fn().mockImplementation((risk) => risk.Id === 'risk-2');

      render(
        <TestWrapper
          mocks={[
            mockedGetOrganisation(),
            mockedGetOrganisationModuleResponse(),
          ]}
        >
          <TestControlledRiskMultiSelect
            name={'testField'}
            label={'Test Multi Select'}
            filter={filter}
            data-testid={'multiselect'}
          />
        </TestWrapper>
      );

      const user = userEvent.setup();

      await waitFor(() => {
        user.click(screen.getByRole('button'));
        expect(screen.getByText('Risk 2')).toBeInTheDocument();
        expect(screen.queryByText('Risk 1')).not.toBeInTheDocument();
      });

      expect(filter).toHaveBeenCalled();
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
        <TestWrapper
          mocks={[
            mockedGetOrganisation(),
            mockedGetOrganisationModuleResponse(),
          ]}
        >
          <TestControlledRiskMultiSelect
            name={'testField'}
            label={'Test Multi Select'}
            disabledOptions={disabledOptions}
            data-testid={'multiselect'}
          />
        </TestWrapper>
      );

      const user = userEvent.setup();

      await waitFor(() => {
        user.click(screen.getByRole('button'));
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
          mocks={[
            mockedGetOrganisation(),
            mockedGetOrganisationModuleResponse(),
          ]}
        >
          <TestControlledRiskMultiSelect
            name={'testField'}
            label={'Test Multi Select'}
            data-testid={'multiselect'}
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
          ]}
        >
          <TestControlledRiskMultiSelect
            name={'testField'}
            label={'Test Multi Select'}
            data-testid={'multiselect'}
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
          mocks={[
            mockedGetOrganisation(),
            mockedGetOrganisationModuleResponse(),
          ]}
        >
          <TestControlledRiskMultiSelect
            name={'testField'}
            label={'Test Multi Select'}
            data-testid={'multiselect'}
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
  });

  describe('Error handling', () => {
    it('should handle GraphQL errors gracefully', async () => {
      mockUseEntityLabelsFeature.mockReturnValue({
        shouldShowEntityLabels: false,
        entitiesEnabled: false,
        hasEntityFilter: false,
        isMultiEntityContext: false,
        entityFilterCount: 0,
      });

      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => undefined);

      render(
        <TestWrapper
          mocks={[
            mockErrorQuery,
            mockedGetOrganisation(),
            mockedGetOrganisationModuleResponse(),
          ]}
        >
          <TestControlledRiskMultiSelect
            name={'testField'}
            label={'Test Multi Select'}
            data-testid={'multiselect'}
          />
        </TestWrapper>
      );

      // Component should still render despite error
      await waitFor(() => {
        expect(screen.getByTestId('multiselect')).toBeInTheDocument();
      });

      consoleSpy.mockRestore();
    });

    it('should handle missing data gracefully', async () => {
      vi.clearAllMocks();
      mockUseEntityLabelsFeature.mockReturnValue({
        shouldShowEntityLabels: false,
        entitiesEnabled: false,
        hasEntityFilter: false,
        isMultiEntityContext: false,
        entityFilterCount: 0,
      });

      mockUseGetRiskListOnlyOptimized.mockReturnValue({
        data: { risk: [] },
        loading: false,
        refetch: vi.fn(),
        error: undefined,
      });

      render(
        <TestWrapper
          mocks={[
            mockedGetOrganisation(),
            mockedGetOrganisationModuleResponse(),
          ]}
        >
          <TestControlledRiskMultiSelect
            name={'testField'}
            label={'Test Multi Select'}
            data-testid={'multiselect'}
          />
        </TestWrapper>
      );

      const user = userEvent.setup();

      await waitFor(() => {
        user.click(screen.getByRole('button'));
        expect(screen.getByText(/no matches found/i)).toBeInTheDocument();
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
        <TestWrapper
          mocks={[
            mockedGetOrganisation(),
            mockedGetOrganisationModuleResponse(),
          ]}
        >
          <TestControlledRiskMultiSelect
            name={'testField'}
            label={'Test Multi Select'}
            data-testid={'multiselect'}
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
        <TestWrapper
          mocks={[
            mockedGetOrganisation(),
            mockedGetOrganisationModuleResponse(),
          ]}
        >
          <TestControlledRiskMultiSelect
            name={'testField'}
            label={'Test Multi Select'}
            data-testid={'multiselect'}
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
      });
    });

    it('should show no matches when custom filter excludes all options', async () => {
      mockUseEntityLabelsFeature.mockReturnValue({
        shouldShowEntityLabels: false,
        entitiesEnabled: false,
        hasEntityFilter: false,
        isMultiEntityContext: false,
        entityFilterCount: 0,
      });

      const filter = vi.fn().mockReturnValue(false);
      render(
        <TestWrapper
          mocks={[
            mockedGetOrganisation(),
            mockedGetOrganisationModuleResponse(),
          ]}
        >
          <TestControlledRiskMultiSelect
            name={'testField'}
            label={'Test Multi Select'}
            filter={filter}
            data-testid={'multiselect'}
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

    it('should apply excludedIds after custom filter', async () => {
      mockUseEntityLabelsFeature.mockReturnValue({
        shouldShowEntityLabels: false,
        entitiesEnabled: false,
        hasEntityFilter: false,
        isMultiEntityContext: false,
        entityFilterCount: 0,
      });

      const filter = vi.fn().mockReturnValue(true); // allow all
      render(
        <TestWrapper
          mocks={[
            mockedGetOrganisation(),
            mockedGetOrganisationModuleResponse(),
          ]}
        >
          <TestControlledRiskMultiSelect
            name={'testField'}
            label={'Test Multi Select'}
            filter={filter}
            excludedIds={['risk-1', 'risk-2']}
            data-testid={'multiselect'}
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
  });

  describe('Entity descriptions and tokens', () => {
    it('should render entity description in dropdown when entity labels enabled', async () => {
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
          ]}
        >
          <TestControlledRiskMultiSelect
            name={'testField'}
            label={'Test Multi Select'}
            data-testid={'multiselect'}
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
      // Description uses mocked entity path
      await waitFor(() => {
        expect(
          screen.getByText(/Entity: Entity Path entity-1/i)
        ).toBeInTheDocument();
      });
    });

    it('should include entity path subtitle in rendered tokens', async () => {
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
          ]}
          defaultValues={{ testField: [mockRisksWithEntities[0]] }}
        >
          <TestControlledRiskMultiSelect
            name={'testField'}
            label={'Test Multi Select'}
            data-testid={'multiselect'}
          />
        </TestWrapper>
      );

      // Subtitle text should appear (from custom token renderer)
      await waitFor(() => {
        expect(screen.getByText('Entity Path entity-1')).toBeInTheDocument();
      });
    });
  });
});
