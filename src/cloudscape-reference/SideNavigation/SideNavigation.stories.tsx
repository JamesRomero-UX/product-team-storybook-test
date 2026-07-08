import type { Meta, StoryObj } from '@storybook/react-vite';
import SideNavigation, {
  type SideNavigationProps,
} from '@risk-smart/themed-cloudscape-components/side-navigation';
// Custom production Navigation (icon-extended) — read-only alias resolves
// to risksmart-app/packages/components/src/navigation/index.ts
// eslint-disable-next-line import/no-unresolved
import RiskSmartNavigation from '@risksmart-app/components/navigation';
import {
  Activity as UIActivity,
  AlertTriangle as UIAlertTriangle,
  BarChart10 as UIBarChart10,
  BezierCurve02 as UIBezierCurve02,
  Certificate02 as UICertificate02,
  CheckCircleBroken as UICheckCircleBroken,
  CheckVerified03 as UICheckVerified03,
  FileCheck01 as UIFileCheck01,
  Grid01 as UIGrid01,
  NotificationMessage as UINotificationMessage,
  Settings01 as UISettings01,
  Settings04 as UISettings04,
  UsersPlus as UIUsersPlus,
  Zap as UIZap,
} from '@untitled-ui/icons-react';
import { useState } from 'react';
import { createMemoryRouter, RouterProvider } from 'react-router';

import '../_setup';

const meta = {
  title: 'Cloudscape Reference/SideNavigation',
  component: SideNavigation,
  tags: ['cloudscape-real'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          "Real Cloudscape SideNavigation rendered with RiskSmart theme, via RiskSmart's custom icon-extended Navigation. 1:1 with live app.",
      },
    },
  },
} satisfies Meta<typeof SideNavigation>;

export default meta;

type Story = StoryObj<typeof meta>;

// ─── RiskSmart with Icons (Live App) ─────────────────────────────────────────
// Uses the production custom Navigation component from
// `risksmart-app/packages/components/src/navigation/Navigation.tsx`. That
// component wraps Cloudscape's SideNavigation API into a navy-themed,
// icon-bearing rail with its own header, logo, and collapse toggle —
// rendered exactly the same as the live app. Items take an extra `icon`
// prop typed as `JSX.Element` (see NavItemWithIcon).
type NavItemWithIcon = SideNavigationProps.Item & {
  icon?: React.ReactElement;
  count?: string;
};

// Production menu config mirrored from the live web app at:
//   risksmart-app/packages/web/src/routes/useNavItems.tsx
// In production the items are filtered by permission, feature flag, and module
// enablement; here every item is shown so the full structure is visible.
// Icons match the live app's imports from `@untitled-ui/icons-react`.
const RISKSMART_NAV_ITEMS_WITH_ICONS: NavItemWithIcon[] = [
  { type: 'link', text: 'Home', href: '/', icon: <UIGrid01 /> },
  { type: 'divider' },
  {
    type: 'section',
    text: 'Internal audits',
    icon: <UIBezierCurve02 />,
    items: [
      { type: 'link', text: 'Dashboard', href: '/internal-audits/dashboard' },
      { type: 'link', text: 'Register', href: '/internal-audits' },
      { type: 'link', text: 'Reports', href: '/internal-audits/reports' },
      { type: 'link', text: 'Findings', href: '/internal-audits/findings' },
    ],
  },
  { type: 'divider' },
  {
    type: 'section',
    text: 'Risks',
    icon: <UIZap />,
    items: [
      { type: 'link', text: 'Dashboard', href: '/risks/dashboard' },
      { type: 'link', text: 'Register', href: '/risks' },
      { type: 'link', text: 'Appetites', href: '/appetites' },
      { type: 'link', text: 'Acceptances', href: '/acceptances' },
    ],
  },
  { type: 'link', text: 'Policy', href: '/policy', icon: <UIFileCheck01 /> },
  {
    type: 'section',
    text: 'Compliance',
    icon: <UICheckVerified03 />,
    items: [
      { type: 'link', text: 'Dashboard', href: '/compliance/dashboard' },
      { type: 'link', text: 'Register', href: '/compliance' },
      { type: 'link', text: 'Obligation changes', href: '/compliance/changes' },
      { type: 'link', text: 'Monitoring', href: '/compliance/monitoring' },
      { type: 'link', text: 'Findings', href: '/compliance/findings' },
    ],
  },
  {
    type: 'section',
    text: 'Third Party',
    icon: <UIUsersPlus />,
    items: [
      { type: 'link', text: 'Register', href: '/third-party' },
      {
        type: 'link',
        text: 'Questionnaire templates',
        href: '/third-party/questionnaire',
      },
      {
        type: 'link',
        text: 'Questionnaire responses',
        href: '/third-party/questionnaire-responses',
      },
    ],
  },
  { type: 'divider' },
  {
    type: 'section',
    text: 'Controls',
    icon: <UISettings04 />,
    items: [
      { type: 'link', text: 'Register', href: '/controls' },
      { type: 'link', text: 'Groups', href: '/control-groups' },
      { type: 'link', text: 'Tests', href: '/controls/tests' },
    ],
  },
  { type: 'link', text: 'Issues', href: '/issues', icon: <UIAlertTriangle /> },
  { type: 'link', text: 'Actions', href: '/actions', icon: <UICheckCircleBroken /> },
  { type: 'link', text: 'Indicators', href: '/indicator', icon: <UIActivity /> },
  {
    type: 'section',
    text: 'Assessments',
    icon: <UICertificate02 />,
    items: [
      { type: 'link', text: 'Register', href: '/assessments' },
      { type: 'link', text: 'Activities', href: '/assessments/activities' },
      { type: 'link', text: 'Findings', href: '/assessments/findings' },
    ],
  },
  { type: 'link', text: 'Reports', href: '/reports', icon: <UIBarChart10 /> },
  {
    type: 'link',
    text: 'Report an issue',
    href: '/report-an-issue',
    icon: <UIAlertTriangle />,
  },
  { type: 'link', text: 'Documents', href: '/documents', icon: <UIFileCheck01 /> },
  { type: 'divider' },
  {
    type: 'link',
    text: 'Requests',
    href: '/requests',
    icon: <UINotificationMessage />,
  },
  { type: 'link', text: 'Settings', href: '/settings', icon: <UISettings01 /> },
];

const RiskSmartNavShell = () => {
  const [open, setOpen] = useState(true);
  return (
    <div style={{ display: 'flex', minHeight: 1080 }}>
      <RiskSmartNavigation
        navigationOpen={open}
        setNavigationOpen={setOpen}
        navItems={RISKSMART_NAV_ITEMS_WITH_ICONS}
        logoutUrl={'/logout'}
      />
      <div style={{ flex: 1, padding: 24, background: '#f9f9fd' }}>
        <h2 style={{ marginTop: 0 }}>Live-app Navigation</h2>
        <p>
          This is the actual <code>Navigation</code> component from{' '}
          <code>packages/components/src/navigation/Navigation.tsx</code> — the
          same code path the production app uses. Click the toggle to collapse /
          expand. Section items show their{' '}
          <code>@untitled-ui/icons-react</code> icon to the left.
        </p>
      </div>
    </div>
  );
};

// React Router v7 requires a data router for `useMatches` (used by
// NestedLink/Link/Section in the navigation chain). createMemoryRouter
// satisfies that contract without needing a real browser history.
const riskSmartRouter = createMemoryRouter(
  [{ path: '*', element: <RiskSmartNavShell /> }],
  { initialEntries: ['/'] },
);

const RiskSmartWithIconsDemo = () => <RouterProvider router={riskSmartRouter} />;

export const RiskSmartWithIcons: Story = {
  name: 'RiskSmart with Icons (Live App)',
  render: () => <RiskSmartWithIconsDemo />,
  parameters: {
    docs: {
      description: {
        story:
          "1:1 with live app — uses RiskSmart's custom icon-extended SideNavigation. Includes section icons that the stock Cloudscape variant doesn't support. Imported via path alias from `risksmart-app/packages/components/src/navigation`; the dev repo is read-only — Vite resolves the file but never writes back. Wrapped in `MemoryRouter` to satisfy the navigation chain's `react-router` dependencies (`NavLink`, `useLocation`, `useMatches`).",
      },
    },
  },
};
