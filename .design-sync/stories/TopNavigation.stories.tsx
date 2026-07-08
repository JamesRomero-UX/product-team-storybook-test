// Static reference story for the themed TopNavigation (the app top bar).
// Pure Cloudscape composition — no app providers/data — so it renders and
// verifies as a clean design-system card. Added by design-sync to give the
// app shell a real preview.
import type { Meta, StoryObj } from '@storybook/react-vite';
import TopNavigation from '@risk-smart/themed-cloudscape-components/top-navigation';
import Input from '@risk-smart/themed-cloudscape-components/input';

const meta = {
  title: 'Cloudscape Reference/TopNavigation',
  component: TopNavigation as any,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<any>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <TopNavigation
      identity={{ href: '#', title: 'RiskSmart' }}
      search={
        <Input
          type="search"
          value=""
          placeholder="Search risks, controls, policies…"
          ariaLabel="Search"
          onChange={() => {}}
        />
      }
      utilities={[
        { type: 'button', iconName: 'notification', title: 'Notifications', ariaLabel: 'Notifications' },
        { type: 'button', iconName: 'settings', title: 'Settings', ariaLabel: 'Settings' },
        {
          type: 'menu-dropdown',
          text: 'James Romero',
          description: 'james.romero@risksmart.com',
          iconName: 'user-profile',
          items: [
            { id: 'profile', text: 'Profile' },
            { id: 'preferences', text: 'Preferences' },
            { id: 'signout', text: 'Sign out' },
          ],
        },
      ]}
    />
  ),
};
