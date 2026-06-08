// Prototype — RSP-4034: Surface risk appetite posture toggle in Modules settings
//
// Brief: https://linear.app/risksmart/issue/RSP-4034
//
// The `posture` feature flag switches risk appetite between banding (upper/lower
// limits) and posture mode (single threshold). Today it can only be toggled by
// engineering. This surfaces it in Settings → Modules as a CS-only toggle.
//
// Stories:
//   1. CSUser_PostureOff  — CS user, posture toggle visible and OFF
//   2. CSUser_PostureOn   — CS user, posture toggle visible and ON
//   3. NonCSUser          — Standard user, posture toggle absent
//
// Library: Cloudscape (modifying an existing screen).
// Starting canvas: page-templates/SettingsPage + _settings-tabs/ModulesTab
// Pattern: follows SubModuleSettings verbatim — same Toggle, same className
//           strings, same h4/p label structure as every other submodule row.
//
// Key design decisions (per RSP-4034 ACs):
//   - Exactly the same control + label style as existing submodule rows (appetite,
//     appetite_cascading, etc.). No bespoke warnings, modals, or confirm dialogs.
//   - CS-only gate: rendered only when isCustomerSupport === true.
//   - Posture toggle is independent of the module system — it reads/writes the
//     org.Meta.features 'posture' entry, not a module enabled flag.
//     Engineering note: the write path is NOT the existing UpdateModulesDocument.
//     A separate org Meta mutation is needed (see README.md for details).
//
// i18n keys to add (packages/i18n/src/locales/default/en/common.json):
//   modules.titles.appetite_posture   → "Risk appetite posture mode"
//   modules.descriptions.appetite_posture →
//     "Switches risk appetite from banding (upper and lower limits) to posture
//      mode (single threshold)."
//
// Lifted verbatim from:
//   pages/settings/tabs/modules/Tab.tsx
//   pages/settings/tabs/modules/ModuleSettings.tsx
//   pages/settings/tabs/modules/SubmoduleSettings.tsx
//   (all className strings are verbatim production)
//
// Production Tab.tsx uses <FormProvider>{...settings}</FormProvider> (JSX
// spread children) which esbuild rejects. This prototype drops the FormProvider
// wrapper and renders settings directly — same workaround as ModulesTab.tsx.
//
// ⚠️ SPECULATIVE — no dedicated production page exists for the posture toggle yet.
// The prototype uses the SAME production sub-components and className strings so
// the look is 1:1 with the live app. The posture row itself is the new addition.

import type { Meta, StoryObj } from '@storybook/react-vite';
import Alert from '@risk-smart/themed-cloudscape-components/alert';
import FormField from '@risk-smart/themed-cloudscape-components/form-field';
import Select from '@risk-smart/themed-cloudscape-components/select';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Toggle from '@risk-smart/themed-cloudscape-components/toggle';
// eslint-disable-next-line import/no-unresolved
import Button from '@risksmart-app/components/src/button';
// eslint-disable-next-line import/no-unresolved
import ControlledTabs from 'src/components/controlled-tabs';
// eslint-disable-next-line import/no-unresolved
import Link from '@risksmart-app/components/src/link';
// eslint-disable-next-line import/no-unresolved
import TabHeader from 'src/components/tab-header';
import { Edit02 } from '@untitled-ui/icons-react';
import { useState, useEffect } from 'react';

import '../cloudscape-reference/_setup';
import { PageLayout, RealProviders } from '../app-shell/Shell';
import JsonEditor from '../page-templates/_settings-tabs/_JsonEditor';

// ─── Types ──────────────────────────────────────────────────────────────────

type BasicModule = {
  enabled: boolean;
  title: string;
  description: string;
  subModules?: Record<string, BasicModule>;
  allowTabConfig?: boolean;
};

// ─── Module data — verbatim defaults.ts + new appetite_posture entry ────────
//
// appetite_posture is inserted after appetite_cascading in the risk submodules,
// matching its logical grouping with the other appetite-related submodules.
// The `csOnly` set below controls visibility — it is NOT a module property in
// production; it's a prototype-only concept to demonstrate the CS gate.

const CS_ONLY_SUBMODULES = new Set(['appetite_posture']);

const makeInitialModules = (postureEnabled: boolean): Record<string, BasicModule> => ({
  risk: {
    enabled: true,
    allowTabConfig: true,
    title: 'Risks module',
    description:
      'Bring your entire Risks cycle together in one place, without the need for spreadsheets.',
    subModules: {
      impact: {
        enabled: false,
        title: 'Impacts',
        description:
          'Assess the potential severity of a Risk consequences against a range of organisation-defined Impacts.',
      },
      risk_scoring: {
        enabled: true,
        title: 'Scoring methodology',
        description:
          'Select and configure the scoring methodology that best suits your organisation.',
      },
      appetite: {
        enabled: true,
        title: 'Appetites',
        description:
          'Define Appetite levels for Risks and track any breaches against those thresholds.',
      },
      appetite_cascading: {
        enabled: true,
        title: 'Risk cascade',
        description:
          'Cascade Appetite levels from higher Risk tiers down with one simple setting, saving users the need to manually input appetites on every Risk.',
      },
      // ── NEW: RSP-4034 ──────────────────────────────────────────────────────
      // CS-only. Reads/writes the 'posture' feature flag on org.Meta.features.
      // Not a module-backed feature — the Toggle here drives a separate mutation.
      appetite_posture: {
        enabled: postureEnabled,
        title: 'Risk appetite posture mode',
        description:
          'Switches risk appetite from banding (upper and lower limits) to posture mode (single threshold).',
      },
      // ── END NEW ───────────────────────────────────────────────────────────
      acceptance: {
        enabled: true,
        title: 'Acceptances',
        description:
          'Log and monitor accepted Risks so they remain visible and up to date.',
      },
      rcsa_wizard: {
        enabled: false,
        title: 'Wizard',
        description:
          'Build and guide processes quickly with RiskSmart’s step-by-step wizard.',
      },
    },
  },
  document: {
    enabled: false,
    allowTabConfig: true,
    title: 'Policy module',
    description: 'Draft, update and publish Policies to your organisation in minutes.',
    subModules: {
      attestation: {
        enabled: false,
        title: 'Attestations',
        description:
          'Distribute Policies for Attestation across your organisation and track responses with ease.',
      },
      public_document: {
        enabled: true,
        title: 'Public documents',
        description: 'Publish and share public-facing Documents from one central place.',
      },
    },
  },
  obligation: {
    enabled: false,
    allowTabConfig: true,
    title: 'Compliance module',
    description:
      'Manage organisational Compliance and track Actions, Controls and Issues.',
    subModules: {
      compliance_monitoring_assessment: {
        enabled: false,
        allowTabConfig: true,
        title: 'Monitoring and Findings',
        description:
          'Compile and report on Compliance findings across your organisation.',
      },
      reg_feed: {
        enabled: true,
        title: 'Regulatory Change Feed',
        description:
          'Track and review regulatory obligation changes across your organisation.',
      },
    },
  },
  third_party: {
    enabled: false,
    allowTabConfig: true,
    title: 'Third party module',
    description: 'Onboard Third parties and link Actions, Controls and Issues to them.',
  },
  internal_audit_entity: {
    enabled: false,
    allowTabConfig: true,
    title: 'Internal audit module',
    description:
      'Plan audits, write Reports and link Actions, Controls and Issues to your audit records.',
    subModules: {
      internal_audit_report: {
        enabled: true,
        allowTabConfig: true,
        title: 'Reports and Findings',
        description: 'Compile Reports and Findings across different audits in one place.',
      },
    },
  },
  issue: {
    enabled: true,
    allowTabConfig: true,
    title: 'Issues module',
    description:
      'Capture and track Issues, monitor progress and see how quickly they are resolved.',
    subModules: {
      cause: {
        enabled: true,
        title: 'Causes',
        description: 'Identify and record the Causes of Issues and assign their significance.',
      },
      consequence: {
        enabled: true,
        title: 'Consequences',
        description:
          'Record the Consequences of Issues and allocate values to reflect their impact.',
      },
    },
  },
  control: {
    enabled: true,
    allowTabConfig: true,
    title: 'Controls module',
    description:
      'Record and test Controls, link them to Risks, and track Issues, Actions and Indicators all in one view.',
    subModules: {
      control_group: {
        enabled: true,
        title: 'Control groups',
        description: 'Group related Controls for sharper visibility and oversight.',
      },
    },
  },
  action: {
    enabled: true,
    allowTabConfig: true,
    title: 'Actions module',
    description:
      'Track Actions with clear deadlines, updates and links to other objects in RiskSmart.',
  },
  indicator: {
    enabled: true,
    allowTabConfig: false,
    title: 'Indicators module',
    description:
      'Track KPIs, spot trends and view how Indicators link across your organisation.',
  },
  assessment: {
    enabled: true,
    allowTabConfig: true,
    title: 'Assessments module',
    description:
      'Conduct Assessments of objects in RiskSmart and log Assessment activities and Findings against them.',
  },
  incident_reporting: {
    enabled: true,
    title: 'Issue reporting',
    description: 'Enable users to log Issues as they arise.',
  },
  approval: {
    enabled: false,
    title: 'Approvals',
    description: 'Manage Approvals smoothly, capturing every ‘yes’ and ‘no’ along the way.',
  },
  custom_datasource: {
    enabled: false,
    title: 'Custom data sources',
    description: 'Connect your RiskSmart data sources to unlock tailored reporting.',
  },
  notification: {
    enabled: true,
    title: 'Notifications',
    description: 'Stay up to date with RiskSmart notifications and never miss an update.',
  },
  enterprise_risk: {
    enabled: false,
    allowTabConfig: true,
    title: 'Enterprise risks module',
    description:
      'Define enterprise-level Risks, push them to individual entities for local management, and roll up ratings to see an aggregated enterprise-wide view.',
  },
  ai: {
    enabled: false,
    title: 'RiskSmart AI',
    description:
      'Get instant insights, automate tasks, and enhance decision-making with AI-powered features.',
    subModules: {
      chat: { enabled: false, title: 'RiskSmart assistant', description: 'Allow RiskSmart to use AI to help you generate descriptions.' },
      chat_warning: { enabled: false, title: 'RiskSmart AI beta warning', description: 'Your AI-powered companion for risk management. This is currently a beta feature.' },
      suggested_controls: { enabled: false, title: 'Suggest Risk Controls', description: 'Uses AI to suggest controls to add to a risk.' },
    },
  },
  integrations: {
    enabled: false,
    title: 'Integrations',
    description:
      'Connect RiskSmart with external tools and services to automate workflows and streamline processes.',
    subModules: {
      zapier_self_managed: { enabled: true, title: 'Zapier (Self-Managed)', description: 'Connect using your API credentials. Manage your own Zaps, choose your apps, and control your Zapier subscription.' },
      zapier_by_risksmart: { enabled: true, title: 'Zapier by RiskSmart', description: 'Embedded integration experience — browse thousands of apps and build automated workflows without leaving the platform.' },
      mcp_server_integrations: { enabled: true, title: 'MCP Server for Integrations', description: 'Connect long-running B2B AI systems to RiskSmart for automated compliance monitoring and continuous risk intelligence.' },
      mcp_personal: { enabled: true, title: 'MCP Personal', description: 'Connect AI assistants like Claude and ChatGPT directly to your risk data for natural language queries and insights.' },
      rest_api: { enabled: true, title: 'REST API', description: 'Build custom integrations using the RiskSmart REST API.' },
      slack: { enabled: false, title: 'Slack', description: 'Receive RiskSmart notifications and updates directly in your Slack channels.' },
    },
  },
});

// ─── Submodule-specific form fields — verbatim from _settings-tabs/ModulesTab ─

const RiskScoreSettings = () => {
  const [model, setModel] = useState({ label: 'Default', value: 'default' });
  const [config, setConfig] = useState('{}');
  return (
    <SpaceBetween size={'s'}>
      <FormField label={'Risk scoring model'}>
        <Select
          selectedOption={model as any}
          onChange={({ detail }) => setModel(detail.selectedOption as any)}
          options={[
            { label: 'Default', value: 'default' },
            { label: 'Control effectiveness averages', value: 'control_effectiveness_averages' },
            { label: 'Control type-based effectiveness averages', value: 'typed_control_effectiveness_averages' },
          ]}
        />
      </FormField>
      <FormField label={'Risk scoring model config'}>
        <JsonEditor value={config} onChange={setConfig} />
      </FormField>
    </SpaceBetween>
  );
};

const AppetiteCascadingSettings = () => {
  const [model, setModel] = useState({ label: 'Default', value: 'default' });
  const [config, setConfig] = useState('{}');
  return (
    <SpaceBetween size={'s'}>
      <FormField label={'Appetite cascading model'}>
        <Select
          selectedOption={model as any}
          onChange={({ detail }) => setModel(detail.selectedOption as any)}
          options={[
            { label: 'Default', value: 'default' },
            { label: 'Top-down cascading', value: 'top_down_cascade' },
          ]}
        />
      </FormField>
      <FormField label={'Appetite cascading model config'}>
        <JsonEditor value={config} onChange={setConfig} />
      </FormField>
    </SpaceBetween>
  );
};

// ─── SubModuleSettings — verbatim production pattern + CS gate ───────────────

const SubModuleSettings = ({
  subModules,
  isDirty,
  isCustomerSupport,
  onToggle,
}: {
  subModules: Record<string, BasicModule>;
  isDirty: boolean;
  isCustomerSupport: boolean;
  onToggle: (id: string) => void;
}) => (
  <>
    <h4>{'Submodules'}</h4>
    {Object.entries(subModules).map(([subKey, sub]) => {
      // ── CS-only gate — verbatim intent from ACs ─────────────────────────
      // Non-CS users never see appetite_posture; the row is simply absent.
      if (CS_ONLY_SUBMODULES.has(subKey) && !isCustomerSupport) return null;

      // ── Prototype visual annotation ───────────────────────────────────────
      // CS-only rows get a left-border accent, subtle tinted background, and a
      // "CS only" badge so reviewers immediately see what's new vs. existing.
      // None of this ships to production — it's prototype-only scaffolding.
      const isNewCsRow = CS_ONLY_SUBMODULES.has(subKey);

      return (
        <div
          key={subKey}
          id={isNewCsRow ? 'posture-row' : undefined}
          className={'flex border-0 border-grey150 border-solid border-t-[0.5px] pt-4'}
          style={isNewCsRow ? {
            borderLeft: '3px solid #E07B00',
            paddingLeft: 12,
            backgroundColor: 'rgba(230, 120, 0, 0.04)',
            borderRadius: '0 4px 4px 0',
            marginLeft: -3,
          } : undefined}
        >
          <div>
            <Toggle
              checked={sub.enabled}
              onChange={() => onToggle(subKey)}
              ariaLabel={`Toggle ${subKey}`}
            />
          </div>
          <div className={'ml-[8px]'}>
            <h4 className={'my-0'} style={isNewCsRow ? { display: 'flex', alignItems: 'center', gap: 6 } : undefined}>
              {sub.title}
              {isNewCsRow && (
                <span style={{
                  fontSize: 10,
                  fontWeight: 700,
                  padding: '2px 7px',
                  borderRadius: 3,
                  background: '#0073bb',
                  color: '#fff',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  flexShrink: 0,
                }}>
                  {'CS only'}
                </span>
              )}
            </h4>
            <p>{sub.description}</p>
            {subKey === 'risk_scoring' && sub.enabled && <RiskScoreSettings />}
            {subKey === 'appetite_cascading' && sub.enabled && <AppetiteCascadingSettings />}
            {sub.allowTabConfig && !isDirty && (
              <>
                <h4>{'Configuration'}</h4>
                <Link onClick={() => undefined}>
                  <div className={'flex items-center gap-2'}>
                    <Edit02 width={16} />
                    <span>{'Edit tabs'}</span>
                  </div>
                </Link>
              </>
            )}
          </div>
        </div>
      );
    })}
  </>
);

// ─── ModuleSettings — verbatim production structure ──────────────────────────

const ModuleSettings = ({
  moduleId,
  module,
  isDirty,
  isCustomerSupport,
  onToggle,
  onSubToggle,
}: {
  moduleId: string;
  module: BasicModule;
  isDirty: boolean;
  isCustomerSupport: boolean;
  onToggle: (id: string) => void;
  onSubToggle: (parentId: string, subId: string) => void;
}) => (
  <div
    className={
      'flex border-0 border-grey150 border-solid border-t-[0.5px] !p-4'
    }
  >
    <div>
      <Toggle
        checked={module.enabled}
        onChange={() => onToggle(moduleId)}
        ariaLabel={`Toggle ${moduleId}`}
      />
    </div>
    <div className={'ml-[16px] text-left w-full'}>
      <h3 className={'mt-0'}>{module.title}</h3>
      <p>{module.description}</p>
      {module.enabled && (
        <>
          {module.allowTabConfig && !isDirty && (
            <>
              <h4>{'Configuration'}</h4>
              <Link onClick={() => undefined}>
                <div className={'flex items-center gap-2'}>
                  <Edit02 width={16} />
                  <span>{'Edit tabs'}</span>
                </div>
              </Link>
            </>
          )}
          {module.subModules && (
            <SubModuleSettings
              subModules={module.subModules}
              isDirty={isDirty}
              isCustomerSupport={isCustomerSupport}
              onToggle={(subId) => onSubToggle(moduleId, subId)}
            />
          )}
        </>
      )}
    </div>
  </div>
);

// ─── ModulesTabWithPosture — the full tab with posture toggle ─────────────────

const ModulesTabWithPosture = ({
  isCustomerSupport,
  initialPostureEnabled,
}: {
  isCustomerSupport: boolean;
  initialPostureEnabled: boolean;
}) => {
  const [modules, setModules] = useState<Record<string, BasicModule>>(
    makeInitialModules(initialPostureEnabled)
  );
  const [isDirty, setIsDirty] = useState(false);
  const [alertDismissed, setAlertDismissed] = useState(false);

  const toggle = (id: string) => {
    setModules((prev) => ({
      ...prev,
      [id]: { ...prev[id], enabled: !prev[id].enabled },
    }));
    setIsDirty(true);
  };

  const subToggle = (parentId: string, subId: string) => {
    setModules((prev) => {
      const parent = prev[parentId];
      if (!parent.subModules) return prev;
      return {
        ...prev,
        [parentId]: {
          ...parent,
          subModules: {
            ...parent.subModules,
            [subId]: {
              ...parent.subModules[subId],
              enabled: !parent.subModules[subId].enabled,
            },
          },
        },
      };
    });
    setIsDirty(true);
  };

  const reset = () => {
    setModules(makeInitialModules(initialPostureEnabled));
    setIsDirty(false);
    setAlertDismissed(false);
  };

  const save = () => {
    setIsDirty(false);
    setAlertDismissed(false);
  };

  // ── Scroll to the new posture row on mount so reviewers land on the change ──
  useEffect(() => {
    const el = document.getElementById('posture-row');
    if (el) {
      setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'center' }), 450);
    }
  }, []);

  return (
    <div>
      <TabHeader className={'py-6'}>{'Modules'}</TabHeader>

      {/* ── Prototype annotation banner ─────────────────────────────────────
           Remove before shipping. Orients reviewers to the single new row.   */}
      <div style={{
        background: '#f0f7ff',
        border: '1px solid #0073bb',
        borderRadius: 4,
        padding: '8px 14px',
        marginBottom: 12,
        fontSize: 12,
        color: '#16508a',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        flexWrap: 'wrap',
      }}>
        <span style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>{'Prototype · RSP-4034'}</span>
        <span>{'—'}</span>
        <span>{'One new row added under Risks → Submodules: '}</span>
        <span style={{ fontWeight: 600, fontStyle: 'italic' }}>{'Risk appetite posture mode'}</span>
        <span style={{ color: '#0073bb' }}>{'(orange-bordered, CS-only badge below)'}</span>
      </div>

      {isDirty && !alertDismissed && (
        <Alert
          type={'info'}
          dismissible={true}
          onDismiss={() => setAlertDismissed(true)}
        >
          {
            'You have unsaved changes. You must save your changes before you can configure tabs. This will also reset any existing tab configurations for the module.'
          }
        </Alert>
      )}
      {Object.entries(modules).map(([id, m]) => (
        <ModuleSettings
          key={id}
          moduleId={id}
          module={m}
          isDirty={isDirty}
          isCustomerSupport={isCustomerSupport}
          onToggle={toggle}
          onSubToggle={subToggle}
        />
      ))}
      <div
        className={
          'gap-2 border-0 border-grey150 border-solid border-t-[0.5px] pt-4'
        }
      >
        <SpaceBetween direction={'horizontal'} size={'s'}>
          <Button variant={'primary'} onClick={save}>
            {'Save'}
          </Button>
          <Button onClick={reset}>{'Cancel'}</Button>
        </SpaceBetween>
      </div>
    </div>
  );
};

// ─── Settings shell — mirrors SettingsPage.stories.tsx structure ─────────────
//
// Tab IDs are camelCase matching production (pages/settings/Page.tsx).
// PageLayout accepts only `title` and `actions` — no breadcrumbs/counter/splitPanel.
// ControlledTabs requires variant={'container'}.

const TAB_DEFS = [
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

const SettingsShell = ({
  isCustomerSupport,
  initialPostureEnabled,
}: {
  isCustomerSupport: boolean;
  initialPostureEnabled: boolean;
}) => {
  const [activeTabId, setActiveTabId] = useState('modules');

  const tabs = TAB_DEFS.map((t) => ({
    label: t.label,
    id: t.id,
    content:
      t.id === 'modules' ? (
        <ModulesTabWithPosture
          isCustomerSupport={isCustomerSupport}
          initialPostureEnabled={initialPostureEnabled}
        />
      ) : (
        <div className={'py-8 px-4'} style={{ color: '#8a9ab0', fontSize: 13 }}>
          {t.label} tab
        </div>
      ),
  }));

  return (
    <RealProviders initialPath={'/settings'}>
      <PageLayout title={'Settings'} actions={undefined}>
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

// ─── Storybook meta ───────────────────────────────────────────────────────────

const meta = {
  title: 'Prototypes/RSP-4034 Posture Toggle',
  component: SettingsShell as any,
  tags: ['prototype'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'RSP-4034 — Surfaces the `posture` feature flag as a CS-only toggle in ' +
          'Settings → Modules. Three stories show: CS user with posture OFF, CS user ' +
          'with posture ON, and a standard user where the toggle is absent.',
      },
    },
  },
} satisfies Meta<any>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Story 1: CS user, posture flag OFF ──────────────────────────────────────
// The toggle appears under risk → Submodules, after "Risk cascade".
// Toggle is in the OFF (unchecked) state — the tenant has not yet enabled posture.

export const CSUser_PostureOff: Story = {
  name: 'CS User — posture OFF',
  render: () => (
    <SettingsShell isCustomerSupport={true} initialPostureEnabled={false} />
  ),
  parameters: {
    docs: {
      description: {
        story:
          'CS user sees the "Risk appetite posture mode" toggle under ' +
          'Risk → Submodules. Toggle is OFF — banding variant is active.',
      },
    },
  },
};

// ─── Story 2: CS user, posture flag ON ───────────────────────────────────────
// Toggle is in the ON (checked) state — the tenant has posture mode enabled.
// Flipping it to OFF updates the flag; flipping back re-enables it.

export const CSUser_PostureOn: Story = {
  name: 'CS User — posture ON',
  render: () => (
    <SettingsShell isCustomerSupport={true} initialPostureEnabled={true} />
  ),
  parameters: {
    docs: {
      description: {
        story:
          'CS user sees the "Risk appetite posture mode" toggle ON — ' +
          'posture variant (single threshold) is active for this tenant.',
      },
    },
  },
};

// ─── Story 3: Non-CS user ────────────────────────────────────────────────────
// The posture toggle row is completely absent. Everything else is unchanged.
// Matches how other CS-only controls behave elsewhere in the app.

export const NonCSUser: Story = {
  name: 'Non-CS User — toggle absent',
  render: () => (
    <SettingsShell isCustomerSupport={false} initialPostureEnabled={false} />
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Standard (non-CS) user. The "Risk appetite posture mode" toggle ' +
          'row is absent — the Risks submodules list looks exactly as today.',
      },
    },
  },
};
