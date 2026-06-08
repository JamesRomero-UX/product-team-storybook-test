// App Shell — renders the real production PageLayout from the dev repo
// inside <RealProviders>. PageLayout composes the real GlobalHeader, real
// Navigation, real AppLayout. No reproductions, no approximations.
import Container from '@risk-smart/themed-cloudscape-components/container';
import Header from '@risk-smart/themed-cloudscape-components/header';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import type { Meta, StoryObj } from '@storybook/react-vite';

import '../cloudscape-reference/_setup';
import { PageLayout, RealProviders } from './Shell';

const meta = {
  title: 'App Shell/Authenticated Layout',
  component: PageLayout as any,
  tags: ['composite'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The real production `PageLayout` from `risksmart-app/packages/web/src/layouts/PageLayout.tsx`, wrapped in <RealProviders>. PageLayout composes AuthenticatedAppLayout (Navigation + GlobalHeader + AppLayout). No reproductions.',
      },
    },
  },
} satisfies Meta<any>;

export default meta;
type Story = StoryObj<typeof meta>;

// Sample content that demonstrates the live-app convention: page content
// goes inside a <Container> with a <Header>. This gives the white card
// chrome (rounded corners, shadow, padding) you see on every real page —
// instead of bare text floating on the gray content area.
//
// When prototyping, follow this pattern:
//   <PageLayout title="X" actions={<ActionsButton />}>
//     <Container header={<Header>Section title</Header>}>
//       {/* your prototype content */}
//     </Container>
//   </PageLayout>
//
// For multiple sections, wrap each in its own Container and stack with
// <SpaceBetween size="m">.
const Sample = ({ title }: { title: string }) => (
  <SpaceBetween size={'m'}>
    <Container
      header={
        <Header
          variant={'h2'}
          description={
            'Drop your prototype JSX inside a Container like this. The white card chrome (rounded corners, padding, header) matches every live-app page.'
          }
        >
          {title}
        </Header>
      }
    >
      <p style={{ margin: 0, color: '#5C5C79' }}>
        Page content sits inside this Container. The shell around it
        (toolbar, side rail, AppLayout chrome) is the real production
        composition — you only need to compose the inner content.
      </p>
    </Container>
    <Container
      header={
        <Header variant={'h3'}>
          {'Second section example'}
        </Header>
      }
    >
      <p style={{ margin: 0, color: '#5C5C79' }}>
        Multiple sections stack vertically with consistent spacing via
        SpaceBetween. Each section is its own Container card.
      </p>
    </Container>
  </SpaceBetween>
);

export const Default: Story = {
  name: 'Default (with content)',
  render: () => (
    <RealProviders initialPath={'/risks'}>
      <PageLayout title={'Risks'} actions={null}>
        <Sample title={'Risks'} />
      </PageLayout>
    </RealProviders>
  ),
};

export const Empty: Story = {
  name: 'Empty (no content)',
  render: () => (
    <RealProviders initialPath={'/'}>
      <PageLayout title={'Home'} actions={null}>
        <Sample title={'Home'} />
      </PageLayout>
    </RealProviders>
  ),
};

export const NavigationCollapsed: Story = {
  name: 'Navigation collapsed',
  render: () => (
    <RealProviders initialPath={'/compliance/dashboard'}>
      <PageLayout title={'Compliance'} actions={null}>
        <Sample title={'Compliance dashboard'} />
      </PageLayout>
    </RealProviders>
  ),
};

export const AiAssistantActive: Story = {
  name: 'AI assistant active',
  render: () => (
    <RealProviders initialPath={'/risks'}>
      <PageLayout title={'Risks'} actions={null}>
        <Sample title={'Risks (AI on)'} />
      </PageLayout>
    </RealProviders>
  ),
};
