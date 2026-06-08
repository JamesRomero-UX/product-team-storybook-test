// Real RiskSmart Link wrapper from
// `packages/web/src/components/link` — auto-routes internal hrefs via
// react-router (relative or absolute) and falls through to a normal
// anchor for external URLs.
import type { Meta, StoryObj } from '@storybook/react-vite';
// eslint-disable-next-line import/no-unresolved
import Link from 'src/components/link';
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
  title: 'Cloudscape Reference/Link (web)',
  component: Link as any,
  tags: ['cloudscape-real'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Real RiskSmart web Link wrapper. 1:1 with live app. Delegates to react-router for internal hrefs and adds optional `isRelativeUrl` mode that prepends the current pathname.',
      },
    },
  },
} satisfies Meta<any>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Internal: Story = {
  render: () => (
    <Wrap>
      <Link href={'/risks'}>Go to risks register</Link>
      <Link href={'/risks/R-001'}>Risk R-001</Link>
      <Link href={'/dashboard'}>Dashboard</Link>
    </Wrap>
  ),
};

export const External: Story = {
  render: () => (
    <Wrap>
      <Link href={'https://risksmart.com'} external>
        risksmart.com (external)
      </Link>
      <Link href={'https://docs.risksmart.com'} external>
        Documentation (external)
      </Link>
    </Wrap>
  ),
};

export const RelativeUrl: Story = {
  render: () => (
    <Wrap>
      <Link href={'edit'} isRelativeUrl>
        Edit (resolves relative to current path)
      </Link>
    </Wrap>
  ),
};

export const Variants: Story = {
  render: () => (
    <Wrap>
      <Link href={'/'}>default</Link>
      <Link href={'/'} variant={'primary'}>primary</Link>
      <Link href={'/'} variant={'info'}>info</Link>
    </Wrap>
  ),
};
