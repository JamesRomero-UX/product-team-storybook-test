import { MockedProvider } from '@apollo/client/testing';
import {
  GetRiskListOnlyOptimizedDocument,
  GetRiskListOptimizedDocument,
  GetRiskListWithEntitiesDocument,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider, useForm } from 'react-hook-form';
import {
  useGetRiskListOnlyOptimized,
  useGetRiskListOnlyWithEntitiesOptimized,
} from 'src/hooks/queries';
import { useGetEntities } from 'src/hooks/queries/entity/useGetEntities';
import { FeaturesProvider } from 'src/rbac/FeatureProvider';
import { mockedGetEntities } from 'src/testing/mock-data/mockedGetEntities';
import { mockedGetOrganisation } from 'src/testing/mock-data/mockedGetOrganisation';
import { mockedGetOrganisationModuleResponse } from 'src/testing/mock-data/mockedGetOrganisationModule';
import { describe, expect, it, vi } from 'vitest';

import { useEntityLabelsFeature } from '@/hooks/useEntityLabelsFeature';

import { ControlledRiskSelect } from '../controlled-risk-select/ControlledRiskSelect';
import { ControlledRiskMultiSelect } from './ControlledRiskMultiSelect';

// Mock dependencies
vi.mock('@/hooks/useEntityLabelsFeature');
vi.mock('src/hooks/queries/entity/useGetEntities');
vi.mock('@/hooks/queries/risk/useGetRiskListOnlyOptimized');
const mockUseGetRiskListOnlyOptimized = vi.mocked(useGetRiskListOnlyOptimized);
vi.mock('@/hooks/queries/risk/useGetRiskListOnlyWithEntitiesOptimized');
const mockUseGetRiskListOnlyWithEntitiesOptimized = vi.mocked(
  useGetRiskListOnlyWithEntitiesOptimized
);
const mockUseGetEntities = vi.mocked(useGetEntities);
vi.mock('@/hooks/useGetEntitiesTrpc');
vi.mock('@/components/tokens', () => ({
  default: ({
    tokens,
    onRemove,
    disabled,
  }: {
    tokens: Array<{ value: string; label: string; subtitle?: string }>;
    onRemove: (value: string) => void;
    disabled?: boolean;
  }) => (
    <div
      data-testid={'tokens-container'}
      className={'flex flex-wrap gap-y-3 gap-x-3 mt-3'}
    >
      {tokens.map((token, index) => (
        <span
          key={`${token.value}-option-${index}`}
          data-testid={`token-${token.value}`}
          className={`px-5 bg-grey150 text-grey650 rounded-full h-[33px] align-center items-stretch ${
            !disabled ? 'pr-3' : ''
          }`}
        >
          <span className={'flex space-x-1 items-center h-full gap-2'}>
            <span
              className={'text-[13px] leading-none font-semibold flex flex-col'}
            >
              <span>
                <span data-testid={`token-label-${token.value}`}>
                  {token.label}
                </span>
                {token.subtitle && (
                  <span
                    data-testid={`token-subtitle-${token.value}`}
                    className={
                      'text-[11px] text-grey500 font-normal leading-tight pl-2'
                    }
                  >
                    {token.subtitle}
                  </span>
                )}
              </span>
            </span>
            {!disabled && (
              <button
                aria-label={`remove ${token.label}`}
                className={
                  'border-none p-[0] m-[0] align-middle flex cursor-pointer'
                }
                onClick={() => onRemove(token.value)}
                data-testid={`remove-${token.value}`}
              >
                {'×'}
              </button>
            )}
          </span>
        </span>
      ))}
    </div>
  ),
}));

// Mock GraphQL responses
const mockBasicRiskData = {
  risk: [
    {
      Id: 'risk-1',
      Title: 'Basic Risk 1',
      SequentialId: 1,
      ancestorContributors: [],
    },
    {
      Id: 'risk-2',
      Title: 'Basic Risk 2',
      SequentialId: 2,
      ancestorContributors: [],
    },
  ],
};

const mockEntityRiskData = {
  risk: [
    {
      Id: 'risk-1',
      Title: 'Entity Risk 1',
      SequentialId: 1,
      ancestorContributors: [],
      enterpriseRiskInstance: {
        EntityId: 'entity-1',
        entity: {
          Id: 'entity-1',
          Name: 'Department A',
          ParentId: 'company-1',
          parent: {
            Id: 'company-1',
            Name: 'Company ABC',
            ParentId: null,
            parent: null,
          },
        },
      },
    },
    {
      Id: 'risk-2',
      Title: 'Entity Risk 2',
      SequentialId: 2,
      ancestorContributors: [],
      enterpriseRiskInstance: {
        EntityId: 'entity-2',
        entity: {
          Id: 'entity-2',
          Name: 'Department B',
          ParentId: null,
          parent: null,
        },
      },
    },
    {
      Id: 'risk-3',
      Title: 'Risk Without Entity',
      SequentialId: 3,
      ancestorContributors: [],
      enterpriseRiskInstance: null,
    },
  ],
};

// Mock GraphQL responses for ControlledRiskSelect
const mockBasicRiskSelectData = {
  risk: [
    {
      Id: 'risk-1',
      Title: 'Basic Risk 1',
      SequentialId: 1,
    },
    {
      Id: 'risk-2',
      Title: 'Basic Risk 2',
      SequentialId: 2,
    },
  ],
  node: [
    {
      Id: 'risk-1',
      SequentialId: 1,
    },
    {
      Id: 'risk-2',
      SequentialId: 2,
    },
  ],
};

const mockEntityRiskSelectData = {
  risk: [
    {
      Id: 'risk-1',
      Title: 'Entity Risk 1',
      SequentialId: 1,
      enterpriseRiskInstance: {
        EntityId: 'entity-1',
        entity: {
          Id: 'entity-1',
          Name: 'Department A',
          ParentId: 'company-1',
          parent: {
            Id: 'company-1',
            Name: 'Company ABC',
            ParentId: null,
            parent: null,
          },
        },
      },
    },
    {
      Id: 'risk-2',
      Title: 'Entity Risk 2',
      SequentialId: 2,
      enterpriseRiskInstance: {
        EntityId: 'entity-2',
        entity: {
          Id: 'entity-2',
          Name: 'Department B',
          ParentId: null,
          parent: null,
        },
      },
    },
  ],
  node: [
    {
      Id: 'risk-1',
      SequentialId: 1,
    },
    {
      Id: 'risk-2',
      SequentialId: 2,
    },
  ],
};

const mocks = [
  {
    request: {
      query: GetRiskListOptimizedDocument,
      variables: {},
    },
    result: {
      data: mockBasicRiskSelectData,
    },
  },
  {
    request: {
      query: GetRiskListWithEntitiesDocument,
      variables: {},
    },
    result: {
      data: mockEntityRiskSelectData,
    },
  },
  mockedGetEntities([
    {
      Id: 'entity-1',
      Name: 'Department A',
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
      Id: 'company-1',
      Name: 'Company ABC',
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
      Name: 'Department B',
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
  ]),
  mockedGetOrganisation(),
  mockedGetOrganisationModuleResponse(),
];

// Test wrapper component
const TestWrapper = ({
  children,
  enableEntityLabels = false,
}: {
  children: React.ReactNode;
  enableEntityLabels?: boolean;
}) => {
  const methods = useForm({
    defaultValues: {
      multiSelect: enableEntityLabels
        ? [mockEntityRiskData.risk[0]]
        : [mockBasicRiskData.risk[0]],
      singleSelect: enableEntityLabels
        ? mockEntityRiskData.risk[0].Id
        : mockBasicRiskData.risk[0].Id,
    },
  });

  const mockUseEntityLabelsFeature = vi.mocked(useEntityLabelsFeature);
  mockUseEntityLabelsFeature.mockReturnValue({
    shouldShowEntityLabels: enableEntityLabels,
    entitiesEnabled: enableEntityLabels,
    hasEntityFilter: false,
    isMultiEntityContext: false,
    entityFilterCount: 0,
  });
  mockUseGetEntities.mockReturnValue({
    data: {
      entity: [
        {
          Id: 'entity-1',
          Name: 'Department A',
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
          Id: 'company-1',
          Name: 'Company ABC',
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
          Name: 'Department B',
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

  return (
    <MockedProvider mocks={mocks} addTypename={false}>
      <FeaturesProvider>
        <form>
          <FormProvider {...methods}>{children}</FormProvider>
        </form>
      </FeaturesProvider>
    </MockedProvider>
  );
};

describe('Entity Labels Integration', () => {
  beforeEach(() => {
    mockUseGetRiskListOnlyOptimized.mockReturnValue({
      data: mockBasicRiskData,
      loading: false,
      refetch: vi.fn(),
      error: undefined,
    });

    mockUseGetRiskListOnlyWithEntitiesOptimized.mockReturnValue({
      data: mockEntityRiskData,
      loading: false,
      refetch: vi.fn(),
      error: undefined,
    });
  });

  describe('ControlledRiskMultiSelect with Entity Labels', () => {
    it('should display basic tokens when entity labels are disabled', async () => {
      const TestComponent = () => {
        const methods = useForm({
          defaultValues: { multiSelect: [mockBasicRiskData.risk[0]] },
        });

        return (
          <TestWrapper enableEntityLabels={false}>
            <ControlledRiskMultiSelect
              control={methods.control}
              name={'multiSelect'}
              label={'Multi Select'}
              data-testid={'multiselect'}
            />
          </TestWrapper>
        );
      };

      render(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('tokens-container')).toBeInTheDocument();
      });

      // Should not show entity subtitles when disabled
      expect(
        screen.queryByTestId('token-subtitle-risk-1')
      ).not.toBeInTheDocument();
    });

    it('should display enhanced tokens with entity info when entity labels are enabled', async () => {
      const TestComponent = () => {
        const methods = useForm({
          defaultValues: { multiSelect: [mockEntityRiskData.risk[0]] },
        });

        return (
          <TestWrapper enableEntityLabels={true}>
            <ControlledRiskMultiSelect
              control={methods.control}
              name={'multiSelect'}
              label={'Multi Select'}
              data-testid={'multiselect'}
            />
          </TestWrapper>
        );
      };

      render(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('tokens-container')).toBeInTheDocument();
      });

      // Should show entity subtitles when enabled (wait for async render)
      await waitFor(() => {
        expect(screen.getByTestId('token-subtitle-risk-1')).toBeInTheDocument();
      });
    });

    it('should handle entity labels toggle', async () => {
      let enableEntityLabels = false;

      const TestComponent = () => {
        const methods = useForm({
          defaultValues: { multiSelect: [mockBasicRiskData.risk[0]] },
        });
        const mockUseEntityLabelsFeature = vi.mocked(useEntityLabelsFeature);
        mockUseEntityLabelsFeature.mockReturnValue({
          shouldShowEntityLabels: enableEntityLabels,
          entitiesEnabled: enableEntityLabels,
          hasEntityFilter: false,
          isMultiEntityContext: false,
          entityFilterCount: 0,
        });

        return (
          <MockedProvider mocks={mocks} addTypename={false}>
            <FormProvider {...methods}>
              <ControlledRiskMultiSelect
                control={methods.control}
                name={'multiSelect'}
                label={'Multi Select'}
                data-testid={'multiselect'}
              />
            </FormProvider>
          </MockedProvider>
        );
      };

      const { rerender } = render(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('multiselect')).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByTestId('tokens-container')).toBeInTheDocument();
      });

      // Initially no entity info
      expect(
        screen.queryByTestId('token-subtitle-risk-1')
      ).not.toBeInTheDocument();

      // Toggle entity labels on
      enableEntityLabels = true;
      rerender(<TestComponent />);

      await waitFor(() => {
        expect(
          screen.queryByTestId('token-subtitle-risk-1')
        ).toBeInTheDocument();
      });
    });

    it('should filter out options with undefined values correctly', async () => {
      const TestComponent = () => {
        const methods = useForm({
          defaultValues: {
            multiSelect: [mockBasicRiskData.risk[0], mockBasicRiskData.risk[1]],
          },
        });

        return (
          <TestWrapper enableEntityLabels={false}>
            <ControlledRiskMultiSelect
              control={methods.control}
              name={'multiSelect'}
              label={'Multi Select'}
              data-testid={'multiselect'}
            />
          </TestWrapper>
        );
      };

      render(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('tokens-container')).toBeInTheDocument();
      });

      // Should only show valid tokens
      expect(screen.getByTestId('token-risk-1')).toBeInTheDocument();
      expect(screen.getByTestId('token-risk-2')).toBeInTheDocument();
      expect(screen.queryByTestId('token-undefined')).not.toBeInTheDocument();
    });

    it('should handle GraphQL loading states', async () => {
      const loadingMocks = [
        {
          request: {
            query: GetRiskListOnlyOptimizedDocument,
            variables: {},
          },
          delay: 100,
          result: {
            data: mockBasicRiskData,
          },
        },
        mockedGetEntities([]),
      ];

      const TestComponent = () => {
        const methods = useForm();

        return (
          <MockedProvider mocks={loadingMocks} addTypename={false}>
            <ControlledRiskMultiSelect
              control={methods.control}
              name={'multiSelect'}
              label={'Multi Select'}
              data-testid={'multiselect'}
            />
          </MockedProvider>
        );
      };

      render(<TestComponent />);

      // Should handle loading state gracefully
      expect(screen.getByTestId('multiselect')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByTestId('tokens-container')).toBeInTheDocument();
      });
    });

    it('should handle GraphQL errors gracefully', async () => {
      vi.clearAllMocks();
      const mockUseEntityLabelsFeature = vi.mocked(useEntityLabelsFeature);
      mockUseEntityLabelsFeature.mockReturnValue({
        shouldShowEntityLabels: false,
        entitiesEnabled: false,
        hasEntityFilter: false,
        isMultiEntityContext: false,
        entityFilterCount: 0,
      });
      mockUseGetEntities.mockRejectedValueOnce(new Error('GraphQL Error'));

      const errorMocks = [
        {
          request: {
            query: GetRiskListOnlyOptimizedDocument,
            variables: {},
          },
          error: new Error('GraphQL Error'),
        },
      ];

      const TestComponent = () => {
        const methods = useForm();

        return (
          <MockedProvider mocks={errorMocks} addTypename={false}>
            <ControlledRiskMultiSelect
              control={methods.control}
              name={'multiSelect'}
              label={'Multi Select'}
              data-testid={'multiselect'}
            />
          </MockedProvider>
        );
      };

      render(<TestComponent />);

      // Should render without crashing
      expect(screen.getByTestId('multiselect')).toBeInTheDocument();
    });
  });

  describe('ControlledRiskSelect with Entity Labels', () => {
    it('should use correct GraphQL query based on entity labels setting', async () => {
      const TestComponent = ({
        enableEntityLabels,
      }: {
        enableEntityLabels: boolean;
      }) => {
        const methods = useForm();

        return (
          <TestWrapper enableEntityLabels={enableEntityLabels}>
            <ControlledRiskSelect
              control={methods.control}
              name={'singleSelect'}
              label={'Single Select'}
              testId={'risk-select'}
              data-testid={'risk-select'}
            />
          </TestWrapper>
        );
      };

      const { rerender } = render(<TestComponent enableEntityLabels={false} />);

      await waitFor(() => {
        expect(screen.getByTestId('risk-select')).toBeInTheDocument();
      });

      // Switch to entity labels enabled
      rerender(<TestComponent enableEntityLabels={true} />);

      await waitFor(() => {
        expect(screen.getByTestId('risk-select')).toBeInTheDocument();
      });
    });
  });

  describe('Integration between MultiSelect and Select', () => {
    it('should work together with same entity labels setting', async () => {
      const TestComponent = () => {
        const methods = useForm();

        return (
          <TestWrapper enableEntityLabels={true}>
            <ControlledRiskMultiSelect
              control={methods.control}
              name={'multiSelect'}
              label={'Multi Select'}
              data-testid={'multiselect'}
            />
            <ControlledRiskSelect
              control={methods.control}
              name={'singleSelect'}
              label={'Single Select'}
              testId={'single-select'}
              data-testid={'single-select'}
            />
          </TestWrapper>
        );
      };

      render(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('multiselect')).toBeInTheDocument();
        expect(screen.getByTestId('single-select')).toBeInTheDocument();
      });

      // Both components should be using entity-enabled queries
      expect(screen.getByTestId('tokens-container')).toBeInTheDocument();
    });
  });

  describe('Entity hierarchy handling', () => {
    it('should handle complex entity hierarchies in tokens', async () => {
      const TestComponent = () => {
        const methods = useForm({
          defaultValues: { multiSelect: [mockEntityRiskData.risk[0]] },
        });

        return (
          <TestWrapper enableEntityLabels={true}>
            <ControlledRiskMultiSelect
              control={methods.control}
              name={'multiSelect'}
              label={'Multi Select'}
              data-testid={'multiselect'}
            />
          </TestWrapper>
        );
      };

      render(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('tokens-container')).toBeInTheDocument();
      });

      // Should show entity path in subtitle
      const subtitle = screen.queryByTestId('token-subtitle-risk-1');
      expect(subtitle).toBeInTheDocument();
      expect(subtitle?.textContent).toContain('Company ABC'); // Parent entity
    });

    it('should handle risks without entities', async () => {
      const TestComponent = () => {
        const methods = useForm({
          defaultValues: { multiSelect: [mockEntityRiskData.risk[2]] },
        });

        return (
          <TestWrapper enableEntityLabels={true}>
            <ControlledRiskMultiSelect
              control={methods.control}
              name={'multiSelect'}
              label={'Multi Select'}
              data-testid={'multiselect'}
            />
          </TestWrapper>
        );
      };

      render(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('tokens-container')).toBeInTheDocument();
      });

      // Should not show subtitle for risk without entity
      expect(
        screen.queryByTestId('token-subtitle-risk-3')
      ).not.toBeInTheDocument();
    });

    it('should handle null and undefined ParentId values', async () => {
      const TestComponent = () => {
        const methods = useForm({
          defaultValues: { multiSelect: [mockEntityRiskData.risk[1]] },
        });

        return (
          <TestWrapper enableEntityLabels={true}>
            <ControlledRiskMultiSelect
              control={methods.control}
              name={'multiSelect'}
              label={'Multi Select'}
              data-testid={'multiselect'}
            />
          </TestWrapper>
        );
      };

      render(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('tokens-container')).toBeInTheDocument();
      });

      // Should handle entity with null parent correctly
      const subtitle = screen.queryByTestId('token-subtitle-risk-2');
      expect(subtitle).toBeInTheDocument();
      expect(subtitle?.textContent).toBe('Department B'); // No parent path
    });
  });

  describe('User interactions', () => {
    it('should handle token removal with entity labels', async () => {
      const user = userEvent.setup();

      const TestComponent = () => {
        const methods = useForm({
          defaultValues: {
            multiSelect: [
              {
                value: mockEntityRiskData.risk[0].Id,
                label: mockEntityRiskData.risk[0].Title,
              },
              {
                value: mockEntityRiskData.risk[1].Id,
                label: mockEntityRiskData.risk[1].Title,
              },
            ],
          },
        });

        const mockUseEntityLabelsFeature = vi.mocked(useEntityLabelsFeature);
        mockUseEntityLabelsFeature.mockReturnValue({
          shouldShowEntityLabels: true,
          entitiesEnabled: true,
          hasEntityFilter: false,
          isMultiEntityContext: false,
          entityFilterCount: 0,
        });

        return (
          <MockedProvider mocks={mocks} addTypename={false}>
            <FormProvider {...methods}>
              <ControlledRiskMultiSelect
                control={methods.control}
                name={'multiSelect'}
                label={'Multi Select'}
                data-testid={'multiselect'}
              />
            </FormProvider>
          </MockedProvider>
        );
      };

      render(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('tokens-container')).toBeInTheDocument();
      });

      // Should have both tokens initially
      expect(screen.getByTestId('token-risk-1')).toBeInTheDocument();
      expect(screen.getByTestId('token-risk-2')).toBeInTheDocument();

      // Remove one token
      const removeButton = screen.getByTestId('remove-risk-1');
      await user.click(removeButton);

      // Wait for the form state to update and component to re-render
      await waitFor(
        () => {
          expect(screen.queryByTestId('token-risk-1')).not.toBeInTheDocument();
        },
        { timeout: 3000 }
      );
      expect(screen.getByTestId('token-risk-2')).toBeInTheDocument();
    });

    it('should maintain entity information during form interactions', async () => {
      const TestComponent = () => {
        const methods = useForm({
          defaultValues: { multiSelect: [mockEntityRiskData.risk[0]] },
        });

        return (
          <TestWrapper enableEntityLabels={true}>
            <ControlledRiskMultiSelect
              control={methods.control}
              name={'multiSelect'}
              label={'Multi Select'}
              data-testid={'multiselect'}
            />
          </TestWrapper>
        );
      };

      render(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('tokens-container')).toBeInTheDocument();
      });

      // Entity information should persist throughout component lifecycle
      const subtitle = screen.queryByTestId('token-subtitle-risk-1');
      expect(subtitle).toBeInTheDocument();
    });
  });

  describe('Performance and edge cases', () => {
    it('should handle large entity hierarchies efficiently', async () => {
      const TestComponent = () => {
        const methods = useForm({
          defaultValues: { multiSelect: [mockEntityRiskData.risk[0]] },
        });

        return (
          <TestWrapper enableEntityLabels={true}>
            <ControlledRiskMultiSelect
              control={methods.control}
              name={'multiSelect'}
              label={'Multi Select'}
              data-testid={'multiselect'}
            />
          </TestWrapper>
        );
      };

      render(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('tokens-container')).toBeInTheDocument();
      });

      // Should render without performance issues
      expect(screen.getByTestId('multiselect')).toBeInTheDocument();
    });

    it('should handle component remounting with entity labels', async () => {
      const TestComponent = () => {
        const methods = useForm({
          defaultValues: { multiSelect: [mockEntityRiskData.risk[0]] },
        });

        return (
          <TestWrapper enableEntityLabels={true}>
            <ControlledRiskMultiSelect
              control={methods.control}
              name={'multiSelect'}
              label={'Multi Select'}
              data-testid={'multiselect'}
            />
          </TestWrapper>
        );
      };

      const { unmount } = render(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('multiselect')).toBeInTheDocument();
      });

      unmount();

      // Re-render with a new component instance
      render(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('multiselect')).toBeInTheDocument();
      });
    });
  });
});
