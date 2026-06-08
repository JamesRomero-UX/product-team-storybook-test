import type { Meta, StoryObj } from '@storybook/react-vite';

import { cn } from '../../lib/utils';
import { IntegrationCard } from '.';

const defaultLang = {
  getStarted: 'Get Started',
  comingSoon: 'Coming Soon',
  earlyAccess: 'Early Access',
  contactMessage:
    'Contact your Customer Success team to enable this integration.',
};

const meta = {
  title: 'Patterns/IntegrationCard',
  component: IntegrationCard,
  argTypes: {
    isComingSoon: { control: 'boolean' },
    isDisabled: { control: 'boolean' },
  },
  args: {
    name: 'Zapier (Self-Managed)',
    description: 'Your Zapier account, your rules.',
    content:
      'Connect using your API credentials. Manage your own Zaps, choose your apps, and control your Zapier subscription.',
    iconUrl: '/automations/zapier.svg',
    lang: defaultLang,
    isComingSoon: false,
    isDisabled: false,
  },
} satisfies Meta<typeof IntegrationCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Active: Story = {};

export const Disabled: Story = {
  args: {
    isDisabled: true,
  },
};

export const ComingSoon: Story = {
  args: {
    isComingSoon: true,
    name: 'Slack App',
    description: 'Risk management in Slack.',
    content:
      'Get instant notifications, approve actions, and interact with RiskSmart data right where your team collaborates.',
  },
};

export const AllStates: Story = {
  render: () => (
    <div className={cn('grid grid-cols-3 gap-4')}>
      <IntegrationCard
        name={'Zapier (Self-Managed)'}
        description={'Your Zapier account, your rules.'}
        content={
          'Connect using your API credentials. Manage your own Zaps and control your subscription.'
        }
        iconUrl={'/automations/zapier.svg'}
        lang={defaultLang}
      />
      <IntegrationCard
        name={'MCP Personal'}
        description={'Your AI, your risk data.'}
        content={
          'Connect Claude, ChatGPT, and other AI assistants directly to your risks.'
        }
        iconUrl={'/automations/mcp.svg'}
        lang={defaultLang}
        isDisabled
      />
      <IntegrationCard
        name={'Slack App'}
        description={'Risk management in Slack.'}
        content={
          'Get notifications and interact with RiskSmart right where your team collaborates.'
        }
        iconUrl={'/automations/slack.svg'}
        lang={defaultLang}
        isComingSoon
      />
    </div>
  ),
};
