// Real RiskSmart Link wrapper from
// `packages/components/src/link` — the cross-package version of Link
// (used by shared library components like global-header). Slightly
// simpler than the web variant: no `isRelativeUrl` mode.
import type { Meta, StoryObj } from '@storybook/react-vite';
// eslint-disable-next-line import/no-unresolved
import Link from '@risksmart-app/components/src/link';
import '../_setup';
import { RealProviders } from '../../app-shell/_providers';

const Wrap = ({ children }: { children: React.ReactNode }) => (
  <RealProviders initialPath={'/risks'}>
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
      {children}
    </div>
  </RealProviders>
);

const meta = {
  title: 'Cloudscape Reference/Link (components)',
  component: Link as any,
  tags: ['cloudscape-real'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Real RiskSmart cross-app Link wrapper from packages/components. 1:1 with live app. Used by shared library components (e.g. inside the global header).',
      },
    },
  },
} satisfies Meta<any>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Internal: Story = {
  render: () => (
    <Wrap>
      <Link href={'/risks'}>Internal link</Link>
      <Link href={'/'} variant={'primary'}>Primary internal link</Link>
    </Wrap>
  ),
};

export const External: Story = {
  render: () => (
    <Wrap>
      <Link href={'https://risksmart.com'} external>External link</Link>
    </Wrap>
  ),
};
