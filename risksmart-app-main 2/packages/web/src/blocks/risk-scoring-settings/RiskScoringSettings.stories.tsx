import { cn, Container } from '@risksmart-app/atomic-ui';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useState } from 'react';
import { expect, fireEvent, fn, userEvent, within } from 'storybook/test';

import type { RiskScoringSettingsProps } from './index';
import { RiskScoringSettings } from './index';

const meta = {
  title: 'Blocks/RiskScoringSettings',
  component: RiskScoringSettings,
  tags: ['!autodocs', 'wip'],
  args: {
    lang: {
      alert: {
        title: 'Now configuring:',
        subtitle: {
          impactLikelihood: 'Impact & likelihood levels',
          multiImpact: 'Multi Impacts',
        },
        description: {
          default: 'Complete the configuration sections below.',
          pending: 'You have unsaved changes.',
          pendingNewVersion:
            'You have unsaved changes. Saving will create a new version.',
        },
      },
      page: {
        header: 'Scoring methodologies',
        description: 'Enable and configure your risk scoring approaches',
      },
      impactLikelihoodCard: {
        title: 'Configure impact, likelihood and the scoring matrix',
        description: 'Matrix-based risk scoring',
        selectedAlert: 'Always Active',
        selectedBadge: 'READY',
        setupBadge: 'SETUP',
      },
      multiImpactCard: {
        title: 'Configure multi impacts',
        description: 'Evaluate risks across multiple impacts',
        selectedAlert: 'Active',
        selectedBadge: 'READY',
        setupBadge: 'SETUP',
        unselectedAlert: 'Inactive',
        unselectedBadge: 'OFF',
      },
      likelihoodLevels: {
        title: 'Likelihood Levels',
        description: 'Define likelihood values and labels',
        addButton: 'Add Likelihood',
      },
      impactLevels: {
        title: 'Impact Levels',
        description: 'Define impact values and labels',
        addButton: 'Add Impact',
      },
      matrix: {
        title: 'Configure scoring matrix',
        description:
          'Define risk ratings for each impact-likelihood combination',
        alert: {
          description: 'Click on any cell to customize the risk rating',
        },
      },
      invertMatrixToggle: {
        title: 'Invert Axis',
        checked: '(Impact vs Likelihood)',
        unchecked: '(Likelihood vs Impact)',
      },
      impactCategories: {
        title: 'Multi impact configuration',
        description:
          'Define impact categories for multi-dimensional risk assessment',
        addButton: 'Add Impact',
      },
      impactAggregation: {
        title: 'Impact calculation method',
        description: {
          average:
            'Risk rating based upon the average score of the rated impacts',
          maximum:
            'Risk rating based upon the highest score of the rated impacts',
        },
        averageLabel: 'Average',
        maximumLabel: 'Worst case',
      },
    },
    state: {
      changeStatus: 'none',
      isMultiImpactEnabled: false,
      selectedMethodology: 'impact-likelihood',
      likelihoodLevels: [
        {
          value: 1,
          title: 'Very Low',
          description: '<10%',
          color: '#79B250',
        },
        {
          value: 2,
          title: 'Low',
          description: '10-30%',
          color: '#A8D08C',
        },
        {
          value: 3,
          title: 'Medium',
          description: '30-70%',
          color: '#F2A041',
        },
        {
          value: 4,
          title: 'High',
          description: '70-90%',
          color: '#D25F5F',
        },
        {
          value: 5,
          title: 'Very High',
          description: '90-100%',
          color: '#D92B2B',
        },
      ],
      impactLevels: [
        {
          value: 1,
          title: 'Insignificant',
          description: 'Level 1',
          color: '#79B250',
        },
        {
          value: 2,
          title: 'Minor',
          description: 'Level 2',
          color: '#A8D08C',
        },
        {
          value: 3,
          title: 'Moderate',
          description: 'Level 3',
          color: '#F2A041',
        },
        {
          value: 4,
          title: 'Major',
          description: 'Level 4',
          color: '#D25F5F',
        },
        {
          value: 5,
          title: 'Severe',
          description: 'Level 5',
          color: '#D92B2B',
        },
      ],
      impactCategories: [
        {
          name: 'Financial',
          color: '#79B250',
        },
        {
          name: 'Reputational',
          color: '#A8D08C',
        },
        {
          name: 'Operational',
          color: '#F2A041',
        },
      ],
      matrix: [
        {
          title: 'Minimal Risk',
          value: 1,
          color: '#79B250',
          likelihood: 1,
          impact: 1,
        },
        {
          title: 'Minimal Risk',
          value: 1,
          color: '#79B250',
          likelihood: 1,
          impact: 2,
        },
        {
          title: 'Minimal Risk',
          value: 1,
          color: '#79B250',
          likelihood: 1,
          impact: 3,
        },
        {
          title: 'Minimal Risk',
          value: 1,
          color: '#79B250',
          likelihood: 2,
          impact: 1,
        },
        {
          title: 'Minimal Risk',
          value: 1,
          color: '#79B250',
          likelihood: 2,
          impact: 2,
        },
        {
          title: 'Minimal Risk',
          value: 1,
          color: '#79B250',
          likelihood: 3,
          impact: 1,
        },
        {
          title: 'Low Risk',
          value: 2,
          color: '#A8D08C',
          likelihood: 1,
          impact: 4,
        },
        {
          title: 'Low Risk',
          value: 2,
          color: '#A8D08C',
          likelihood: 2,
          impact: 3,
        },
        {
          title: 'Low Risk',
          value: 2,
          color: '#A8D08C',
          likelihood: 2,
          impact: 4,
        },
        {
          title: 'Low Risk',
          value: 2,
          color: '#A8D08C',
          likelihood: 3,
          impact: 2,
        },
        {
          title: 'Low Risk',
          value: 2,
          color: '#A8D08C',
          likelihood: 3,
          impact: 3,
        },
        {
          title: 'Low Risk',
          value: 2,
          color: '#A8D08C',
          likelihood: 4,
          impact: 1,
        },
        {
          title: 'Low Risk',
          value: 2,
          color: '#A8D08C',
          likelihood: 4,
          impact: 2,
        },
        {
          title: 'Low Risk',
          value: 2,
          color: '#A8D08C',
          likelihood: 5,
          impact: 1,
        },
        {
          title: 'Low Risk',
          value: 2,
          color: '#A8D08C',
          likelihood: 5,
          impact: 2,
        },
        {
          title: 'Moderate Risk',
          value: 3,
          color: '#F2A041',
          likelihood: 1,
          impact: 5,
        },
        {
          title: 'Moderate Risk',
          value: 3,
          color: '#F2A041',
          likelihood: 2,
          impact: 5,
        },
        {
          title: 'Moderate Risk',
          value: 3,
          color: '#F2A041',
          likelihood: 3,
          impact: 4,
        },
        {
          title: 'Moderate Risk',
          value: 3,
          color: '#F2A041',
          likelihood: 3,
          impact: 5,
        },
        {
          title: 'Moderate Risk',
          value: 3,
          color: '#F2A041',
          likelihood: 4,
          impact: 3,
        },
        {
          title: 'Moderate Risk',
          value: 3,
          color: '#F2A041',
          likelihood: 5,
          impact: 3,
        },
        {
          title: 'High Risk',
          value: 4,
          color: '#D25F5F',
          likelihood: 4,
          impact: 4,
        },
        {
          title: 'High Risk',
          value: 4,
          color: '#D25F5F',
          likelihood: 4,
          impact: 5,
        },
        {
          title: 'High Risk',
          value: 4,
          color: '#D25F5F',
          likelihood: 5,
          impact: 4,
        },
        {
          title: 'High Risk',
          value: 4,
          color: '#D25F5F',
          likelihood: 5,
          impact: 5,
        },
      ],
      isMatrixInverted: false,
      isLikelihoodLevelsComplete: true,
      isImpactLevelsComplete: true,
      isImpactCategoriesComplete: true,
      isMatrixComplete: true,
      isImpactLikelihoodComplete: true,
      isMultiImpactComplete: true,
      impactAggregation: 'average',
    },
    actions: {
      onMultiImpactEnabledChange: fn(),
      onSelectedMethodologyChange: fn(),
      onAddLikelihoodLevel: fn(),
      onAddImpactLevel: fn(),
      onAddImpactCategory: fn(),
      onDeleteLikelihoodLevel: fn(),
      onDeleteImpactLevel: fn(),
      onDeleteImpactCategory: fn(),
      onEditMatrixCell: fn(),
      onInvertMatrixChange: fn(),
      onEditLikelihoodLevel: fn(),
      onEditImpactLevel: fn(),
      onEditImpactCategory: fn(),
      onImpactAggregationChange: fn(),
    },
  },
  parameters: {
    layout: 'fullscreen',
  },
  render: (args) => (
    <Container className={cn('m-6')}>
      <RiskScoringSettings {...args} />
    </Container>
  ),
} satisfies Meta<typeof RiskScoringSettings>;

export default meta;
type Story = StoryObj<typeof meta>;

const RiskScoringSettingsWithHooks = (args: RiskScoringSettingsProps) => {
  const [changeStatus, setChangeStatus] = useState(args.state.changeStatus);

  const [multiImpactEnabled, setMultiImpactEnabled] = useState(
    args.state.isMultiImpactEnabled
  );

  const [selectedMethodology, setSelectedMethodology] = useState(
    args.state.selectedMethodology
  );
  const [isMatrixInverted, setIsMatrixInverted] = useState(
    args.state.isMatrixInverted
  );

  const [impactAggregation, setImpactAggregation] = useState(
    args.state.impactAggregation
  );

  useEffect(() => {
    if (
      multiImpactEnabled !== args.state.isMultiImpactEnabled ||
      selectedMethodology !== args.state.selectedMethodology ||
      isMatrixInverted !== args.state.isMatrixInverted
    ) {
      setChangeStatus('cosmetic');
    }
  }, [multiImpactEnabled, selectedMethodology, isMatrixInverted, args]);

  const state = {
    ...args.state,
    changeStatus,
    isMultiImpactEnabled: multiImpactEnabled,
    selectedMethodology,
    isMatrixInverted,
    impactAggregation,
  };

  const actions = {
    ...args.actions,

    onMultiImpactEnabledChange: setMultiImpactEnabled,
    onSelectedMethodologyChange: setSelectedMethodology,
    onInvertMatrixChange: setIsMatrixInverted,
    onImpactAggregationChange: setImpactAggregation,
  };

  return (
    <Container className={cn('m-6')}>
      <RiskScoringSettings {...args} state={state} actions={actions} />
    </Container>
  );
};

export const Default: Story = {
  render: (args) => <RiskScoringSettingsWithHooks {...args} />,
  parameters: {
    chromatic: { disableSnapshot: true },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // -- Initial render: page header and alert --
    await expect(canvas.getByText('Scoring methodologies')).toBeVisible();
    await expect(canvas.getByText('Now configuring:')).toBeVisible();

    // -- Impact-Likelihood card is selected, Multi Impact is disabled --
    await expect(canvas.getByText('Always Active')).toBeVisible();
    await expect(canvas.getByText('Inactive')).toBeVisible();

    // -- Likelihood Levels accordion is open by default --
    await expect(canvas.getByText('Very Low')).toBeVisible();
    await expect(canvas.getByText('Very High')).toBeVisible();

    // -- Delete a likelihood level --
    const deleteLikelihoodBtn = canvas.getByRole('button', {
      name: /delete very low/i,
    });
    await userEvent.click(deleteLikelihoodBtn);
    await expect(args.actions.onDeleteLikelihoodLevel).toHaveBeenCalledWith(1);

    // -- Add a likelihood level --
    const addLikelihoodBtn = canvas.getByRole('button', {
      name: /add likelihood/i,
    });
    await userEvent.click(addLikelihoodBtn);
    await expect(args.actions.onAddLikelihoodLevel).toHaveBeenCalled();

    // -- Edit a likelihood level --
    const veryLowItem = canvas
      .getByText('Very Low')
      .closest('[data-slot="rating-item"]') as HTMLElement;
    fireEvent.click(veryLowItem);
    await expect(args.actions.onEditLikelihoodLevel).toHaveBeenCalledWith(
      args.state.likelihoodLevels.find((l) => l.title === 'Very Low')
    );

    // -- Open Impact Levels configuration accordion --
    await userEvent.click(canvas.getByText('Impact Levels'));
    await expect(canvas.getByText('Insignificant')).toBeVisible();
    await expect(canvas.getByText('Severe')).toBeVisible();

    // -- Delete an impact level --
    const deleteImpactBtn = canvas.getByRole('button', {
      name: /delete insignificant/i,
    });
    await userEvent.click(deleteImpactBtn);
    await expect(args.actions.onDeleteImpactLevel).toHaveBeenCalledWith(1);

    // -- Add an impact level --
    const addImpactBtn = canvas.getByRole('button', {
      name: /add impact/i,
    });
    await userEvent.click(addImpactBtn);
    await expect(args.actions.onAddImpactLevel).toHaveBeenCalled();

    // -- Edit an impact level --
    const insignificantItem = canvas
      .getByText('Insignificant')
      .closest('[data-slot="rating-item"]') as HTMLElement;
    fireEvent.click(insignificantItem);
    await expect(args.actions.onEditImpactLevel).toHaveBeenCalledWith(
      args.state.impactLevels.find((l) => l.title === 'Insignificant')
    );

    // -- Toggle multi-impact switch to enable it --
    const multiImpactSwitch = canvas.getByRole('switch', {
      name: /toggle configure multi impacts/i,
    });
    await userEvent.click(multiImpactSwitch);

    // -- Multi-impact view should now be visible with categories --
    await expect(canvas.getByText('Financial')).toBeVisible();
    await expect(canvas.getByText('Reputational')).toBeVisible();
    await expect(canvas.getByText('Operational')).toBeVisible();

    // -- Delete a category --
    const deleteCategoryBtn = canvas.getByRole('button', {
      name: /delete financial/i,
    });
    await userEvent.click(deleteCategoryBtn);
    await expect(args.actions.onDeleteImpactCategory).toHaveBeenCalledWith(
      'Financial'
    );

    // -- Add a category --
    const addCategoryBtn = canvas.getByRole('button', {
      name: /add impact/i,
    });
    await userEvent.click(addCategoryBtn);
    await expect(args.actions.onAddImpactCategory).toHaveBeenCalled();

    // -- Edit a category --
    const reputationalItem = canvas
      .getByText('Reputational')
      .closest('[data-slot="rating-item"]') as HTMLElement;
    fireEvent.click(reputationalItem);
    await expect(args.actions.onEditImpactCategory).toHaveBeenCalledWith(
      args.state.impactCategories.find((c) => c.name === 'Reputational')
    );

    // -- Switch impact aggregation to maximum (Worst case) --
    await userEvent.click(canvas.getByRole('button', { name: /worst case/i }));
    await expect(
      canvas.getByText(
        'Risk rating based upon the highest score of the rated impacts'
      )
    ).toBeVisible();

    // -- Switch back to impact-likelihood by clicking its card --
    await userEvent.click(canvas.getByText('Matrix-based risk scoring'));

    // -- Likelihood levels should be visible again --
    await expect(canvas.getByText('Likelihood Levels')).toBeVisible();

    // -- Open matrix configuration --
    await userEvent.click(canvas.getByText('Configure scoring matrix'));
    await expect(canvas.getByText('(Likelihood vs Impact)')).toBeVisible();

    // -- Toggle invert axis switch --
    await userEvent.click(
      canvas.getByRole('switch', {
        name: /invert axis/i,
      })
    );

    // -- Matrix alert text should change to reflect new axis orientation --
    await expect(canvas.getByText('(Impact vs Likelihood)')).toBeVisible();

    // -- Edit a matrix cell --
    const matrixCell = canvasElement.querySelector(
      '[data-slot="ratings-matrix-cell"]'
    ) as HTMLElement;
    fireEvent.click(matrixCell);
    await expect(args.actions.onEditMatrixCell).toHaveBeenCalled();

    // -- Toggle multi-impact switch to disable it --
    await userEvent.click(multiImpactSwitch);
  },
};

export const LikelihoodLevels: Story = {};

export const ImpactLevels: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByText('Impact Levels'));
  },
};

export const Matrix: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByText('Configure scoring matrix')
    );
  },
};

export const MultiImpact: Story = {
  args: {
    state: {
      ...meta.args.state,
      isMultiImpactEnabled: true,
      selectedMethodology: 'multi-impact',
    },
  },
};

export const PendingChanges: Story = {
  args: {
    state: {
      ...meta.args.state,
      changeStatus: 'cosmetic',
      isLikelihoodLevelsComplete: false,
      isImpactLikelihoodComplete: false,
    },
  },
};

export const MultiImpactIncomplete: Story = {
  args: {
    state: {
      ...meta.args.state,
      isMultiImpactEnabled: true,
      selectedMethodology: 'multi-impact',
      isMultiImpactComplete: false,
      impactAggregation: 'maximum',
    },
  },
};
