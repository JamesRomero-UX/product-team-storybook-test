import { MockedProvider, type MockedResponse } from '@apollo/client/testing';
import {
  GetRiskListOptimizedDocument,
  GetRiskListWithEntitiesDocument,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type React from 'react';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';
import { useGetEntities } from 'src/hooks/queries/entity/useGetEntities';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useEntityLabelsFeature } from '@/hooks/useEntityLabelsFeature';

import { ControlledRiskSelect } from './ControlledRiskSelect';

// Mock dependencies
vi.mock('@/hooks/useEntityLabelsFeature');
vi.mock('src/hooks/queries/entity/useGetEntities');
const mockUseGetEntities = vi.mocked(useGetEntities);
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
  },
  {
    Id: 'risk-2',
    Title: 'Risk 2',
    SequentialId: 2,
  },
  {
    Id: 'risk-3',
    Title: 'Risk 3',
    SequentialId: 3,
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

const mockBasicQuery: MockedResponse = {
  request: {
    query: GetRiskListOptimizedDocument,
  },
  result: {
    data: {
      risk: mockBasicRisks,
      node: mockBasicRisks.map((risk) => ({
        Id: risk.Id,
        SequentialId: risk.SequentialId,
        Title: risk.Title, // Include Title for proper label display
      })),
    },
  },
};

const mockEntitiesQuery: MockedResponse = {
  request: {
    query: GetRiskListWithEntitiesDocument,
  },
  result: {
    data: {
      risk: mockRisksWithEntities,
      node: mockRisksWithEntities.map((risk) => ({
        Id: risk.Id,
        SequentialId: risk.SequentialId,
        Title: risk.Title, // Include Title for proper label display
      })),
    },
  },
};

const mockErrorQuery: MockedResponse = {
  request: {
    query: GetRiskListOptimizedDocument,
  },
  error: new Error('GraphQL Error'),
};

// Test wrapper component
interface TestWrapperProps {
  children: React.ReactNode;
  defaultValues?: { testField: null | string };
  mocks?: MockedResponse[];
}

const TestWrapper = ({
  children,
  defaultValues = { testField: null },
  mocks = [mockBasicQuery, mockEntitiesQuery],
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
const TestControlledRiskSelect = (
  props: Omit<React.ComponentProps<typeof ControlledRiskSelect>, 'control'>
) => {
  const { control } = useFormContext();

  return <ControlledRiskSelect {...props} control={control} />;
};

describe('ControlledRiskSelect', () => {
  const mockUseEntityLabelsFeature = vi.mocked(useEntityLabelsFeature);

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseGetEntities.mockReturnValue({
      data: {
        entity: [
          {
            Id: 'company-1',
            Name: 'Company',
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
            Id: 'parent-1',
            Name: 'Parent Entity',
            ParentId: 'company-1',
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
            Id: 'entity-2',
            Name: 'Entity 2',
            ParentId: 'company-1',
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
        <TestWrapper>
          <TestControlledRiskSelect
            name={'testField'}
            label={'Test Risk Select'}
            testId={'risk-select'}
            data-testid={'risk-select'}
          />
        </TestWrapper>
      );

      expect(screen.getByTestId('risk-select')).toBeInTheDocument();
      expect(screen.getByLabelText('Test Risk Select')).toBeInTheDocument();
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
        <TestWrapper>
          <TestControlledRiskSelect
            name={'testField'}
            label={'Test Risk Select'}
            testId={'risk-select'}
            data-testid={'risk-select'}
          />
        </TestWrapper>
      );

      // Initial loading state
      expect(screen.getByRole('button')).toBeInTheDocument();

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
        <TestWrapper>
          <TestControlledRiskSelect
            name={'testField'}
            label={'Test Risk Select'}
            disabled
            testId={'risk-select'}
            data-testid={'risk-select'}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByRole('button')).toBeDisabled();
      });
    });

    it('should include empty option when addEmptyOption is true', async () => {
      mockUseEntityLabelsFeature.mockReturnValue({
        shouldShowEntityLabels: false,
        entitiesEnabled: false,
        hasEntityFilter: false,
        isMultiEntityContext: false,
        entityFilterCount: 0,
      });

      render(
        <TestWrapper>
          <TestControlledRiskSelect
            name={'testField'}
            label={'Test Risk Select'}
            addEmptyOption
            testId={'risk-select'}
            data-testid={'risk-select'}
          />
        </TestWrapper>
      );

      const user = userEvent.setup();
      await user.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByText('Enter value')).toBeInTheDocument();
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
        <TestWrapper mocks={[mockBasicQuery]}>
          <TestControlledRiskSelect
            name={'testField'}
            label={'Test Risk Select'}
            testId={'risk-select'}
            data-testid={'risk-select'}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('risk-select')).toBeInTheDocument();
      });

      const user = userEvent.setup();
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
        <TestWrapper mocks={[mockEntitiesQuery]}>
          <TestControlledRiskSelect
            name={'testField'}
            label={'Test Risk Select'}
            testId={'risk-select'}
            data-testid={'risk-select'}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('risk-select')).toBeInTheDocument();
      });

      const user = userEvent.setup();
      await user.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByText('Risk 1')).toBeInTheDocument();
        expect(screen.getByText('Risk 2')).toBeInTheDocument();
        // Should show entity descriptions when enabled
        expect(
          screen.getByText('Company > Parent Entity > Entity 1')
        ).toBeInTheDocument();
        expect(screen.getByText('Company > Entity 2')).toBeInTheDocument();
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
        <TestWrapper mocks={[mockBasicQuery, mockEntitiesQuery]}>
          <TestControlledRiskSelect
            name={'testField'}
            label={'Test Risk Select'}
            showEntityLabels={true}
            testId={'risk-select'}
            data-testid={'risk-select'}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('risk-select')).toBeInTheDocument();
      });
    });
  });

  describe('Access control', () => {
    it('should include selected risk even if not in available options', async () => {
      mockUseEntityLabelsFeature.mockReturnValue({
        shouldShowEntityLabels: false,
        entitiesEnabled: false,
        hasEntityFilter: false,
        isMultiEntityContext: false,
        entityFilterCount: 0,
      });

      // Risk that's not in the query results but is selected
      const limitedQuery: MockedResponse = {
        request: {
          query: GetRiskListOptimizedDocument,
        },
        result: {
          data: {
            risk: [mockBasicRisks[0]], // Only risk-1
            node: [
              ...mockBasicRisks.map((risk) => ({
                Id: risk.Id,
                SequentialId: risk.SequentialId,
                Title: risk.Title, // Include Title for proper label display
              })), // Include all risks in node data
            ],
          },
        },
      };

      render(
        <TestWrapper
          defaultValues={{ testField: 'risk-2' }} // But risk-2 is selected
          mocks={[limitedQuery]}
        >
          <TestControlledRiskSelect
            name={'testField'}
            label={'Test Risk Select'}
            testId={'risk-select'}
            data-testid={'risk-select'}
          />
        </TestWrapper>
      );

      // Wait for the select to render with the pre-selected value
      // Target the specific button trigger that shows the selected value
      await waitFor(() => {
        const selectButton = screen.getByRole('button');
        expect(selectButton).toHaveTextContent('Risk 2');
      });

      const user = userEvent.setup();
      await user.click(screen.getByRole('button'));

      await waitFor(() => {
        // Should show both the available option and the selected one
        expect(screen.getByText('Risk 1')).toBeInTheDocument();
        // Use getAllByText for Risk 2 since it appears in both trigger and dropdown
        const risk2Elements = screen.getAllByText('Risk 2');
        expect(risk2Elements.length).toBeGreaterThan(0);
      });
    });

    it('should handle missing risk data gracefully', async () => {
      mockUseEntityLabelsFeature.mockReturnValue({
        shouldShowEntityLabels: false,
        entitiesEnabled: false,
        hasEntityFilter: false,
        isMultiEntityContext: false,
        entityFilterCount: 0,
      });

      render(
        <TestWrapper
          defaultValues={{ testField: 'nonexistent-risk' }}
          mocks={[mockBasicQuery]}
        >
          <TestControlledRiskSelect
            name={'testField'}
            label={'Test Risk Select'}
            testId={'risk-select'}
            data-testid={'risk-select'}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('risk-select')).toBeInTheDocument();
      });

      const user = userEvent.setup();
      await user.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByText('Risk 1')).toBeInTheDocument();
        expect(screen.getByText('Risk 2')).toBeInTheDocument();
        expect(screen.getByText('Risk 3')).toBeInTheDocument();
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
        .mockImplementation((_msg?: unknown, ..._args: unknown[]) => {
          return undefined as unknown as void;
        });

      render(
        <TestWrapper mocks={[mockErrorQuery]}>
          <TestControlledRiskSelect
            name={'testField'}
            label={'Test Risk Select'}
            testId={'risk-select'}
            data-testid={'risk-select'}
          />
        </TestWrapper>
      );

      // Component should still render despite error
      expect(screen.getByTestId('risk-select')).toBeInTheDocument();

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
          query: GetRiskListOptimizedDocument,
        },
        result: {
          data: {
            risk: [],
            node: [],
          },
        },
      };

      render(
        <TestWrapper mocks={[emptyQuery]}>
          <TestControlledRiskSelect
            name={'testField'}
            label={'Test Risk Select'}
            testId={'risk-select'}
            data-testid={'risk-select'}
          />
        </TestWrapper>
      );

      const user = userEvent.setup();
      await user.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByText(/no matches found/i)).toBeInTheDocument();
      });
    });
  });

  describe('User interactions', () => {
    it('should allow selecting a single option', async () => {
      mockUseEntityLabelsFeature.mockReturnValue({
        shouldShowEntityLabels: false,
        entitiesEnabled: false,
        hasEntityFilter: false,
        isMultiEntityContext: false,
        entityFilterCount: 0,
      });

      render(
        <TestWrapper>
          <TestControlledRiskSelect
            name={'testField'}
            label={'Test Risk Select'}
            testId={'risk-select'}
            data-testid={'risk-select'}
          />
        </TestWrapper>
      );

      const user = userEvent.setup();
      await user.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByText('Risk 1')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Risk 1'));

      await waitFor(() => {
        const combobox = screen.getByRole('button');
        expect(combobox).toHaveTextContent('Risk 1');
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
          <TestControlledRiskSelect
            name={'testField'}
            label={'Test Risk Select'}
            testId={'risk-select'}
            data-testid={'risk-select'}
          />
        </TestWrapper>
      );

      const user = userEvent.setup();
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

    it('should clear selection when empty option is selected', async () => {
      mockUseEntityLabelsFeature.mockReturnValue({
        shouldShowEntityLabels: false,
        entitiesEnabled: false,
        hasEntityFilter: false,
        isMultiEntityContext: false,
        entityFilterCount: 0,
      });

      render(
        <TestWrapper defaultValues={{ testField: 'risk-1' }}>
          <TestControlledRiskSelect
            name={'testField'}
            label={'Test Risk Select'}
            addEmptyOption
            testId={'risk-select'}
            data-testid={'risk-select'}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        const combobox = screen.getByRole('button');
        expect(combobox).toHaveTextContent('Risk 1');
      });

      const user = userEvent.setup();
      await user.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByText('-')).toBeInTheDocument();
      });

      await user.click(screen.getByText('-'));

      await waitFor(() => {
        const combobox = screen.getByRole('button');
        expect(combobox).toHaveTextContent('Enter value');
      });
    });

    describe('Single mode', () => {
      it('should behave the same whether single prop is set or not', async () => {
        mockUseEntityLabelsFeature.mockReturnValue({
          shouldShowEntityLabels: false,
          entitiesEnabled: false,
          hasEntityFilter: false,
          isMultiEntityContext: false,
          entityFilterCount: 0,
        });

        render(
          <TestWrapper>
            <TestControlledRiskSelect
              name={'testField'}
              label={'Test Risk Select'}
              single={true}
              testId={'risk-select'}
              data-testid={'risk-select'}
            />
          </TestWrapper>
        );

        const user = userEvent.setup();
        await user.click(screen.getByRole('button'));

        await waitFor(() => {
          expect(screen.getByText('Risk 1')).toBeInTheDocument();
        });

        await user.click(screen.getByText('Risk 1'));

        await waitFor(() => {
          const combobox = screen.getByRole('button');
          expect(combobox).toHaveTextContent('Risk 1');
        });

        // Should not allow multiple selections (this is inherent to Select component)
        await user.click(screen.getByRole('button'));
        await user.click(screen.getByText('Risk 2'));

        await waitFor(() => {
          const combobox = screen.getByRole('button');
          expect(combobox).toHaveTextContent('Risk 2');
          expect(combobox).not.toHaveTextContent('Risk 1');
        });
      });
    });
  });
});
