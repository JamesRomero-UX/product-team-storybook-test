// Production navigation menu — kept in lock-step with the live app at:
//   risksmart-app/packages/web/src/routes/useNavItems.tsx
//
// In production the items are filtered by permission, feature flag, and
// module enablement. For storybook reference we render the full menu with
// every item enabled, matching user-facing labels and ordering exactly.
//
// `RiskSmartNavigation` (the live custom rail) accepts an extended item type
// where sections and links can carry an `icon` JSX element.
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
  HeartHexagon as UIHeartHexagon,
  NotificationMessage as UINotificationMessage,
  Settings01 as UISettings01,
  Settings04 as UISettings04,
  UsersPlus as UIUsersPlus,
  Zap as UIZap,
} from '@untitled-ui/icons-react';
import type { ReactElement } from 'react';

export type NavItemWithIcon = {
  type: 'link' | 'divider' | 'section';
  text?: string;
  href?: string;
  icon?: ReactElement;
  count?: string;
  items?: NavItemWithIcon[];
};

export const RISKSMART_NAV_ITEMS_WITH_ICONS: NavItemWithIcon[] = [
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
    text: 'Operational resilience',
    icon: <UIHeartHexagon />,
    items: [
      { type: 'link', text: 'Important Business Services', href: '/opres/ibs' },
      { type: 'link', text: 'Scenarios & self-assessments', href: '/opres/scenarios' },
      { type: 'link', text: 'Vulnerabilities', href: '/opres/vulnerabilities' },
    ],
  },
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
  {
    type: 'link',
    text: 'Actions',
    href: '/actions',
    icon: <UICheckCircleBroken />,
  },
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
