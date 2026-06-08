// Page Templates / Settings Page — full tab strip for CS-level
// permissions (every tab visible).
//
// Mirrors pages/settings/Page.tsx — title comes from
// taxonomy.format(t('setting_other'), 'capitalize') ('Settings'). The
// only contextual action in PageLayout is a Download button when the
// Data Export tab is active.
//
// Tab order matches the production tabPreferences default for an org
// using all features. Render order is dynamic per-org in production,
// but the 17-tab list itself is fixed at the Settings parent_type.
//
// Each tab's body is built in its own follow-up step. This file owns
// the SHELL. Tab content modules live alongside under
// _settings-tabs/<TabName>.tsx and are imported here.

import type { Meta, StoryObj } from '@storybook/react-vite';
import Box from '@risk-smart/themed-cloudscape-components/box';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
// eslint-disable-next-line import/no-unresolved
import Button from '@risksmart-app/components/src/button';
// eslint-disable-next-line import/no-unresolved
import ControlledTabs from 'src/components/controlled-tabs';
import { Download01 } from '@untitled-ui/icons-react';
import { useState } from 'react';

import '../cloudscape-reference/_setup';
import { PageLayout, RealProviders } from '../app-shell/Shell';

// ─── Tab bodies — built per tab in follow-up steps ───────────────────
import UsersTab from './_settings-tabs/UsersTab';
import GroupsTab from './_settings-tabs/GroupsTab';
import CustomRolesTab from './_settings-tabs/CustomRolesTab';
import ApprovalsTab from './_settings-tabs/ApprovalsTab';
import DepartmentsTab from './_settings-tabs/DepartmentsTab';
import EntitiesTab from './_settings-tabs/EntitiesTab';
import TagsTab from './_settings-tabs/TagsTab';
import TaxonomyTab from './_settings-tabs/TaxonomyTab';
import ModulesTab from './_settings-tabs/ModulesTab';
import ColoursTab from './_settings-tabs/ColoursTab';
import NotificationsTab from './_settings-tabs/NotificationsTab';
import DataExportTab from './_settings-tabs/DataExportTab';
import DataImportTab from './_settings-tabs/DataImportTab';
import AuthenticationTab from './_settings-tabs/AuthenticationTab';
import SsoTab from './_settings-tabs/SsoTab';
import ExternalApiTab from './_settings-tabs/ExternalApiTab';
import AuditTab from './_settings-tabs/AuditTab';

const meta = {
  title: 'Page Templates/Settings Page',
  component: PageLayout as any,
  tags: ['cloudscape-real'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Full Settings shell with the 17 tabs a CustomerSupport user ' +
          'sees. Tab content is filled in step by step — this story ' +
          'ships the shell + placeholder bodies.',
      },
    },
  },
} satisfies Meta<any>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Placeholder body for tabs we haven't filled yet ─────────────────
const TabPlaceholder = ({ label }: { label: string }) => (
  <div className={'py-12 text-center'}>
    <Box variant={'h3'} color={'text-status-inactive'}>
      {label}
    </Box>
    <Box variant={'p'} color={'text-status-inactive'}>
      {'Content for this tab is built in a follow-up step.'}
    </Box>
  </div>
);

// ─── Tab list — production order, all 17 visible ─────────────────────
//
// IDs match production activeTabId enum from pages/settings/Page.tsx:
//   'approvals' | 'audit' | 'authentication' | 'colours' | 'customRoles' |
//   'dataExport' | 'dataImport' | 'departments' | 'entities' |
//   'externalApi' | 'groups' | 'modules' | 'sso' | 'notifications' |
//   'tags' | 'taxonomy' | 'users'
//
// Render order below is the logical grouping default:
//   identity → org structure → classification → product config →
//   data → integrations → audit
const TAB_DEFS: Array<{ id: string; label: string }> = [
  { id: 'users',          label: 'Users' },
  { id: 'groups',         label: 'User groups' },
  { id: 'customRoles',    label: 'Custom roles' },
  { id: 'approvals',      label: 'Approvals' },
  { id: 'departments',    label: 'Departments' },
  { id: 'entities',       label: 'Entities' },
  { id: 'tags',           label: 'Tags' },
  { id: 'taxonomy',       label: 'Taxonomy' },
  { id: 'modules',        label: 'Modules' },
  { id: 'colours',        label: 'Colours' },
  { id: 'notifications',  label: 'Notifications' },
  { id: 'dataExport',     label: 'Data export' },
  { id: 'dataImport',     label: 'Data import' },
  { id: 'authentication', label: 'Authentication' },
  { id: 'sso',            label: 'SSO' },
  { id: 'externalApi',    label: 'External API' },
  { id: 'audit',          label: 'Audit' },
];

// ─── Page composition ────────────────────────────────────────────────
//
// Production has a contextual Download action ONLY when the Data Export
// tab is active. Every other tab shows no top-right action.
const SettingsPage = ({ initialTabId = 'users' }: { initialTabId?: string }) => {
  const [activeTabId, setActiveTabId] = useState(initialTabId);

  const contextualActions =
    activeTabId === 'dataExport' ? (
      <Button iconAlign={'left'} iconSvg={<Download01 width={16} height={16} />}>
        {'Download'}
      </Button>
    ) : undefined;

  // Resolve a tab's content. Filled tabs return their real body;
  // unfilled tabs fall back to TabPlaceholder.
  const tabContent = (id: string, label: string): React.ReactNode => {
    switch (id) {
      case 'users':       return <UsersTab />;
      case 'groups':      return <GroupsTab />;
      case 'customRoles': return <CustomRolesTab />;
      case 'approvals':   return <ApprovalsTab />;
      case 'departments': return <DepartmentsTab />;
      case 'entities':    return <EntitiesTab />;
      case 'tags':        return <TagsTab />;
      case 'taxonomy':    return <TaxonomyTab />;
      case 'modules':        return <ModulesTab />;
      case 'colours':        return <ColoursTab />;
      case 'notifications':  return <NotificationsTab />;
      case 'dataExport':     return <DataExportTab />;
      case 'dataImport':     return <DataImportTab />;
      case 'authentication': return <AuthenticationTab />;
      case 'sso':            return <SsoTab />;
      case 'externalApi':    return <ExternalApiTab />;
      case 'audit':          return <AuditTab />;
      default:               return <TabPlaceholder label={label} />;
    }
  };

  const tabs = TAB_DEFS.map((t) => ({
    label: t.label,
    id: t.id,
    content: tabContent(t.id, t.label),
  }));

  return (
    <RealProviders initialPath={'/settings'}>
      <PageLayout title={'Settings'} actions={contextualActions}>
        <ControlledTabs
          variant={'container'}
          activeTabId={activeTabId}
          onChange={({ detail }) => setActiveTabId(detail.activeTabId)}
          tabs={tabs}
        />
      </PageLayout>
    </RealProviders>
  );
};

// ─── Stories ─────────────────────────────────────────────────────────
//
// One story per tab, so each can be screenshot'd independently. The
// `Default` story lands on Users (the live-app default tab).

export const Default: Story = {
  name: 'Users tab',
  render: () => <SettingsPage initialTabId={'users'} />,
};

export const Groups: Story = {
  name: 'User groups tab',
  render: () => <SettingsPage initialTabId={'groups'} />,
};

export const CustomRoles: Story = {
  name: 'Custom roles tab',
  render: () => <SettingsPage initialTabId={'customRoles'} />,
};

export const Approvals: Story = {
  name: 'Approvals tab',
  render: () => <SettingsPage initialTabId={'approvals'} />,
};

export const Departments: Story = {
  name: 'Departments tab',
  render: () => <SettingsPage initialTabId={'departments'} />,
};

export const Entities: Story = {
  name: 'Entities tab',
  render: () => <SettingsPage initialTabId={'entities'} />,
};

export const Tags: Story = {
  name: 'Tags tab',
  render: () => <SettingsPage initialTabId={'tags'} />,
};

export const Taxonomy: Story = {
  name: 'Taxonomy tab',
  render: () => <SettingsPage initialTabId={'taxonomy'} />,
};

export const Modules: Story = {
  name: 'Modules tab',
  render: () => <SettingsPage initialTabId={'modules'} />,
};

export const Colours: Story = {
  name: 'Colours tab',
  render: () => <SettingsPage initialTabId={'colours'} />,
};

export const Notifications: Story = {
  name: 'Notifications tab',
  render: () => <SettingsPage initialTabId={'notifications'} />,
};

export const DataExport: Story = {
  name: 'Data export tab',
  render: () => <SettingsPage initialTabId={'dataExport'} />,
};

export const DataImport: Story = {
  name: 'Data import tab',
  render: () => <SettingsPage initialTabId={'dataImport'} />,
};

export const Authentication: Story = {
  name: 'Authentication tab',
  render: () => <SettingsPage initialTabId={'authentication'} />,
};

export const SSO: Story = {
  name: 'SSO tab',
  render: () => <SettingsPage initialTabId={'sso'} />,
};

export const ExternalApi: Story = {
  name: 'External API tab',
  render: () => <SettingsPage initialTabId={'externalApi'} />,
};

export const Audit: Story = {
  name: 'Audit tab',
  render: () => <SettingsPage initialTabId={'audit'} />,
};
