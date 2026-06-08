// Real RiskSmart ActionsButton from
// `packages/web/src/components/actions-button` — wraps Cloudscape
// ButtonDropdown so a row / page action area can collapse many buttons
// into a single "Actions" menu. Used on detail pages whenever the
// number of action buttons exceeds 2.
import type { Meta, StoryObj } from '@storybook/react-vite';
// eslint-disable-next-line import/no-unresolved
import ActionsButton from 'src/components/actions-button';

import '../_setup';
import { RealProviders } from '../../app-shell/_providers';

const meta = {
  title: 'Cloudscape Reference/ActionsButton',
  component: ActionsButton as any,
  tags: ['cloudscape-real'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: 'Real RiskSmart ActionsButton. 1:1 with live app.' } },
  },
} satisfies Meta<any>;

export default meta;
type Story = StoryObj<typeof meta>;

const Wrap = ({ children }: { children: React.ReactNode }) => (
  <RealProviders initialPath={'/'}>
    <div style={{ padding: 24 }}>{children}</div>
  </RealProviders>
);

const noop = () => {};

export const Default: Story = {
  render: () => (
    <Wrap>
      <ActionsButton
        buttonText={'Actions'}
        items={[
          { id: 'export', text: 'Export', onItemClick: noop },
          { id: 'duplicate', text: 'Duplicate', onItemClick: noop },
          { id: 'archive', text: 'Archive', onItemClick: noop },
          { id: 'delete', text: 'Delete', onItemClick: noop },
        ]}
      />
    </Wrap>
  ),
};

export const PrimaryVariant: Story = {
  render: () => (
    <Wrap>
      <ActionsButton
        buttonText={'Create'}
        variant={'primary'}
        items={[
          { id: 'risk', text: 'New risk', onItemClick: noop },
          { id: 'control', text: 'New control', onItemClick: noop },
          { id: 'issue', text: 'New issue', onItemClick: noop },
        ]}
      />
    </Wrap>
  ),
};

export const Single: Story = {
  render: () => (
    <Wrap>
      <ActionsButton
        buttonText={'Actions'}
        items={[{ id: 'export', text: 'Export', onItemClick: noop }]}
      />
    </Wrap>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Wrap>
      <ActionsButton
        buttonText={'Actions'}
        disabled
        items={[
          { id: 'export', text: 'Export', onItemClick: noop },
          { id: 'archive', text: 'Archive', onItemClick: noop },
        ]}
      />
    </Wrap>
  ),
};

export const ItemsWithDisabledMix: Story = {
  render: () => (
    <Wrap>
      <ActionsButton
        buttonText={'Actions'}
        items={[
          { id: 'export', text: 'Export', onItemClick: noop },
          { id: 'archive', text: 'Archive', disabled: true, onItemClick: noop },
          { id: 'delete', text: 'Delete', onItemClick: noop },
        ]}
      />
    </Wrap>
  ),
};
