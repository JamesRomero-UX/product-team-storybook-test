import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { RatingsMatrix } from './index';
import type { AxisRating, MatrixCell } from './types';

const defaultLikelihoodRatings: AxisRating[] = [
  { title: 'Very Low', value: 1, color: '#79B250' },
  { title: 'Low', value: 2, color: '#A8D08C' },
  { title: 'Medium', value: 3, color: '#F2A041' },
  { title: 'High', value: 4, color: '#D25F5F' },
  { title: 'Very High', value: 5, color: '#D92B2B' },
];

const defaultImpactRatings: AxisRating[] = [
  { title: 'Insignificant', value: 1, color: '#79B250' },
  { title: 'Minor', value: 2, color: '#A8D08C' },
  { title: 'Moderate', value: 3, color: '#F2A041' },
  { title: 'Major', value: 4, color: '#D25F5F' },
  { title: 'Severe', value: 5, color: '#D92B2B' },
];

const defaultMatrix: MatrixCell[] = [
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
  { title: 'Low Risk', value: 2, color: '#A8D08C', likelihood: 1, impact: 4 },
  { title: 'Low Risk', value: 2, color: '#A8D08C', likelihood: 2, impact: 3 },
  { title: 'Low Risk', value: 2, color: '#A8D08C', likelihood: 2, impact: 4 },
  { title: 'Low Risk', value: 2, color: '#A8D08C', likelihood: 3, impact: 2 },
  { title: 'Low Risk', value: 2, color: '#A8D08C', likelihood: 3, impact: 3 },
  { title: 'Low Risk', value: 2, color: '#A8D08C', likelihood: 4, impact: 1 },
  { title: 'Low Risk', value: 2, color: '#A8D08C', likelihood: 4, impact: 2 },
  { title: 'Low Risk', value: 2, color: '#A8D08C', likelihood: 5, impact: 1 },
  { title: 'Low Risk', value: 2, color: '#A8D08C', likelihood: 5, impact: 2 },
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
  { title: 'High Risk', value: 4, color: '#D25F5F', likelihood: 4, impact: 4 },
  { title: 'High Risk', value: 4, color: '#D25F5F', likelihood: 5, impact: 4 },
];

const meta = {
  title: 'Patterns/RatingsMatrix',
  component: RatingsMatrix,
  tags: ['wip'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    onCellClick: { action: 'cell clicked' },
  },
  args: {
    likelihoodRatings: defaultLikelihoodRatings,
    impactRatings: defaultImpactRatings,
    matrix: defaultMatrix,
    inverted: false,
    onCellClick: fn(),
  },
} satisfies Meta<typeof RatingsMatrix>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // Verify that all column headers are rendered
    for (const col of defaultImpactRatings) {
      await expect(canvas.getByText(col.title)).toBeInTheDocument();
    }

    // Verify that all row headers are rendered
    for (const row of defaultLikelihoodRatings) {
      await expect(canvas.getByText(row.title)).toBeInTheDocument();
    }

    // Verify the corner label shows default (non-inverted) axis labels
    await expect(canvas.getByText('Impact →')).toBeInTheDocument();
    await expect(canvas.getByText('Likelihood ↓')).toBeInTheDocument();

    // Click the first "High Risk" cell (likelihood=4, impact=4)
    const highRiskCells = canvas.getAllByText('High Risk');
    await userEvent.click(highRiskCells[0]);

    await expect(args.onCellClick).toHaveBeenCalledWith({
      title: 'High Risk',
      value: 4,
      color: '#D25F5F',
      likelihood: 4,
      impact: 4,
    });
  },
};

export const Inverted: Story = {
  args: {
    inverted: true,
  },
};

export const NonInteractive: Story = {
  args: {
    onCellClick: undefined,
  },
};

/**
 * Tests clicking on an empty cell (no matrix entry) to cover the fallback path.
 */
export const EmptyCellClick: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // Find the empty cells (rendered as "-")
    const emptyCells = canvas.getAllByText('-');
    await expect(emptyCells.length).toBeGreaterThan(0);

    // Click the first empty cell
    await userEvent.click(emptyCells[0]);

    await expect(args.onCellClick).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '',
        value: 0,
        color: '#E0E0E0',
      })
    );
  },
};
