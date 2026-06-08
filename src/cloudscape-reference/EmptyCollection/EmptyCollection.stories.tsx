// Real RiskSmart EmptyCollection family from
// `packages/web/src/components/empty-collection` — the empty-state cards
// shown inside Cloudscape Tables when there's no data, no filter
// matches, or the entire entity collection is empty.
import type { Meta, StoryObj } from '@storybook/react-vite';
import Table from '@risk-smart/themed-cloudscape-components/table';
// eslint-disable-next-line import/no-unresolved
import Button from '@risksmart-app/components/src/button';
// eslint-disable-next-line import/no-unresolved
import EmptyCollection from 'src/components/empty-collection/EmptyCollection';
// eslint-disable-next-line import/no-unresolved
import EmptyEntityCollection from 'src/components/empty-collection/EmptyEntityCollection';
// eslint-disable-next-line import/no-unresolved
import NoMatchesCollection from 'src/components/empty-collection/NoMatchesCollection';
import '../_setup';

import { RealProviders } from '../../app-shell/_providers';

const meta = {
  title: 'Cloudscape Reference/EmptyCollection',
  component: EmptyCollection as any,
  tags: ['cloudscape-real'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Real RiskSmart EmptyCollection. 1:1 with live app.',
      },
    },
  },
} satisfies Meta<any>;

export default meta;
type Story = StoryObj<typeof meta>;

const InsideTable = ({ empty }: { empty: React.ReactNode }) => (
  <div style={{ width: 720 }}>
    <Table columnDefinitions={[{ id: 'name', header: 'Name', cell: () => '' }]} items={[]} empty={empty} />
  </div>
);

export const EmptyCollectionBasic: Story = {
  render: () => (
    <RealProviders initialPath={'/risks'}>
      <InsideTable
        empty={
          <EmptyCollection
            title={'No risks recorded'}
            subtitle={'Capture your first risk to populate this register.'}
            action={<Button variant={'primary'}>Create risk</Button>}
          />
        }
      />
    </RealProviders>
  ),
};

export const NoMatches: Story = {
  render: () => (
    <RealProviders initialPath={'/risks'}>
      <InsideTable
        empty={<NoMatchesCollection onClearClick={() => {}} />}
      />
    </RealProviders>
  ),
};

export const NoMatchesNoClearButton: Story = {
  render: () => (
    <RealProviders initialPath={'/risks'}>
      <InsideTable
        empty={<NoMatchesCollection onClearClick={() => {}} hideClearButton />}
      />
    </RealProviders>
  ),
};

export const EmptyEntity: Story = {
  render: () => (
    <RealProviders initialPath={'/risks'}>
      <InsideTable
        empty={
          <EmptyEntityCollection
            entityLabel={'risk'}
            action={<Button variant={'primary'}>Create risk</Button>}
          />
        }
      />
    </RealProviders>
  ),
};
