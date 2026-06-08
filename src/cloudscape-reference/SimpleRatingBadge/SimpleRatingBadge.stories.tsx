// Real RiskSmart SimpleRatingBadge from
// `packages/web/src/components/simple-rating-badge`. Renders a colored
// pill via getColorStyles() — the same colour palette the live app uses
// for risk severity / status across every register and dashboard.
import type { Meta, StoryObj } from '@storybook/react-vite';
// eslint-disable-next-line import/no-unresolved
import SimpleRatingBadge from 'src/components/simple-rating-badge';
import '../_setup';

const meta = {
  title: 'Cloudscape Reference/SimpleRatingBadge',
  component: SimpleRatingBadge as any,
  tags: ['cloudscape-real'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Real RiskSmart SimpleRatingBadge. 1:1 with live app.',
      },
    },
  },
} satisfies Meta<any>;

export default meta;
type Story = StoryObj<typeof meta>;

const Row = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', maxWidth: 720 }}>
    {children}
  </div>
);

export const SeverityScale: Story = {
  render: () => (
    <Row>
      <SimpleRatingBadge rating={{ color: 'dark-green', label: 'Very Low' }} />
      <SimpleRatingBadge rating={{ color: 'light-green', label: 'Low' }} />
      <SimpleRatingBadge rating={{ color: 'orange', label: 'Medium' }} />
      <SimpleRatingBadge rating={{ color: 'light-red', label: 'High' }} />
      <SimpleRatingBadge rating={{ color: 'dark-red', label: 'Critical' }} />
    </Row>
  ),
};

export const StatusVariants: Story = {
  render: () => (
    <Row>
      <SimpleRatingBadge rating={{ color: 'darker-green', label: 'Open' }} />
      <SimpleRatingBadge rating={{ color: 'orange', label: 'In review' }} />
      <SimpleRatingBadge rating={{ color: 'light-grey', label: 'Mitigated' }} />
      <SimpleRatingBadge rating={{ color: 'strong-red', label: 'Breach' }} />
      <SimpleRatingBadge rating={{ color: 'blue-500', label: 'On track' }} />
    </Row>
  ),
};

export const WithTooltip: Story = {
  render: () => (
    <SimpleRatingBadge
      rating={{
        color: 'dark-red',
        label: 'Critical',
        tooltip: 'Hover to see this tooltip — useful for explaining the rating',
      }}
    />
  ),
};

export const NoColor: Story = {
  render: () => <SimpleRatingBadge rating={{ label: 'Unrated' }} />,
};

export const CustomChildren: Story = {
  render: () => (
    <SimpleRatingBadge rating={{ color: 'ai-assistant', label: 'ignored' }}>
      <strong>Custom content</strong>
    </SimpleRatingBadge>
  ),
};
