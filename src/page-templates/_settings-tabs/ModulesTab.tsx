// Settings → Modules tab
//
// Lifts the production structure verbatim from:
//   pages/settings/tabs/modules/Tab.tsx
//   pages/settings/tabs/modules/ModuleSettings.tsx
//   pages/settings/tabs/modules/SubmoduleSettings.tsx
//   pages/settings/tabs/modules/RiskScoreSettings.tsx
//   pages/settings/tabs/modules/AppetiteCascadingSettings.tsx
//   pages/settings/tabs/modules/IngestionConfigSettings.tsx
//
// Production Tab.tsx uses non-standard JSX spread children:
//   <FormProvider>{...settings}</FormProvider>
// esbuild rejects that pattern, so we drop the FormProvider wrapper and
// render the settings array directly. Submodule-specific form fields
// (risk_scoring / appetite_cascading / reg_feed) are rendered with
// plain Cloudscape Select + Textarea instead of the production
// ControlledSelect / ControlledJsonEditor (which depend on
// react-hook-form context + ACE editor).
//
// Production className strings (lifted verbatim):
//   module row:    'flex border-0 border-grey150 border-solid border-t-[0.5px] !p-4'
//   submodule row: 'flex border-0 border-grey150 border-solid border-t-[0.5px] pt-4'
//   footer:        'gap-2 border-0 border-grey150 border-solid border-t-[0.5px] pt-4'
//   TabHeader:     className={'py-6'}   ← passed directly, no wrapping div

import Alert from '@risk-smart/themed-cloudscape-components/alert';
import FormField from '@risk-smart/themed-cloudscape-components/form-field';
import Input from '@risk-smart/themed-cloudscape-components/input';
import Select from '@risk-smart/themed-cloudscape-components/select';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Toggle from '@risk-smart/themed-cloudscape-components/toggle';
import JsonEditor from './_JsonEditor';
// eslint-disable-next-line import/no-unresolved
import Button from '@risksmart-app/components/src/button';
// eslint-disable-next-line import/no-unresolved
import Link from '@risksmart-app/components/src/link';
// eslint-disable-next-line import/no-unresolved
import TabHeader from 'src/components/tab-header';
import { Edit02 } from '@untitled-ui/icons-react';
import { useState } from 'react';

// ─── Module model — matches src/context/moduleContext ────────────────
type BasicModule = {
  enabled: boolean;
  title: string;
  description: string;
  subModules?: Record<string, BasicModule>;
  allowTabConfig?: boolean;
};

// ─── Submodule-specific form fields (lifted from production) ─────────

// RiskScoreSettings.tsx — Risk Scoring Model select + JSON config
const RiskScoreSettings = () => {
  const [model, setModel] = useState({
    label: 'Default',
    value: 'default',
  });
  const [config, setConfig] = useState('{}');

  return (
    <SpaceBetween size={'s'}>
      <FormField label={'Risk scoring model'}>
        <Select
          selectedOption={model as any}
          onChange={({ detail }) => setModel(detail.selectedOption as any)}
          options={[
            { label: 'Default', value: 'default' },
            {
              label: 'Control effectiveness averages',
              value: 'control_effectiveness_averages',
            },
            {
              label: 'Control type-based effectiveness averages',
              value: 'typed_control_effectiveness_averages',
            },
          ]}
        />
      </FormField>
      <FormField label={'Risk scoring model config'}>
        <JsonEditor value={config} onChange={setConfig} />
      </FormField>
    </SpaceBetween>
  );
};

// AppetiteCascadingSettings.tsx — Appetite Cascading Model select + JSON
const AppetiteCascadingSettings = () => {
  const [model, setModel] = useState({
    label: 'Default',
    value: 'default',
  });
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

// IngestionConfigSettings.tsx — API key + Ingestion config JSON
const IngestionConfigSettings = () => {
  const [apiKey, setApiKey] = useState('');
  const [config, setConfig] = useState('{}');

  return (
    <SpaceBetween size={'s'}>
      <FormField label={'API key'}>
        <Input
          type={'password'}
          value={apiKey}
          onChange={({ detail }) => setApiKey(detail.value)}
        />
      </FormField>
      <FormField label={'Ingestion configuration'}>
        <JsonEditor value={config} onChange={setConfig} />
      </FormField>
    </SpaceBetween>
  );
};

// ─── Production module list ──────────────────────────────────────────
//
// Order and `enabled` / `allowTabConfig` values are lifted verbatim from
// packages/modules/src/defaults.ts → `defaultModules`.
// Titles and descriptions are resolved from
// packages/i18n/src/locales/default/en/common.json
//   → modules.titles[id] / modules.descriptions[id]
// with $t(...) taxonomy placeholders rendered into their default
// English forms (e.g. $t(risk_other, capitalize) → "Risks").
const INITIAL_MODULES: Record<string, BasicModule> = {
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
    description:
      'Draft, update and publish Policies to your organisation in minutes.',
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
        description:
          'Publish and share public-facing Documents from one central place.',
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
    description:
      'Onboard Third parties and link Actions, Controls and Issues to them.',
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
        description:
          'Compile Reports and Findings across different audits in one place.',
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
        description:
          'Identify and record the Causes of Issues and assign their significance.',
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
        description:
          'Group related Controls for sharper visibility and oversight.',
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
    description:
      'Manage Approvals smoothly, capturing every ‘yes’ and ‘no’ along the way.',
  },
  custom_datasource: {
    enabled: false,
    title: 'Custom data sources',
    description:
      'Connect your RiskSmart data sources to unlock tailored reporting.',
  },
  notification: {
    enabled: true,
    title: 'Notifications',
    description:
      'Stay up to date with RiskSmart notifications and never miss an update.',
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
      chat: {
        enabled: false,
        title: 'RiskSmart assistant',
        description:
          'Allow RiskSmart to use AI to help you generate descriptions.',
      },
      chat_warning: {
        enabled: false,
        title: 'RiskSmart AI beta warning',
        description:
          'Your AI-powered companion for risk management. This is currently a beta feature.',
      },
      suggested_controls: {
        enabled: false,
        title: 'Suggest Risk Controls',
        description:
          'Uses AI to suggest controls to add to a risk. This can include new and existing controls.',
      },
    },
  },
  integrations: {
    enabled: false,
    title: 'Integrations',
    description:
      'Connect RiskSmart with external tools and services to automate workflows and streamline processes.',
    subModules: {
      zapier_self_managed: {
        enabled: true,
        title: 'Zapier (Self-Managed)',
        description:
          'Connect using your API credentials. Manage your own Zaps, choose your apps, and control your Zapier subscription.',
      },
      zapier_by_risksmart: {
        enabled: true,
        title: 'Zapier by RiskSmart',
        description:
          'Embedded integration experience — browse thousands of apps and build automated workflows without leaving the platform.',
      },
      mcp_server_integrations: {
        enabled: true,
        title: 'MCP Server for Integrations',
        description:
          'Connect long-running B2B AI systems to RiskSmart for automated compliance monitoring and continuous risk intelligence.',
      },
      mcp_personal: {
        enabled: true,
        title: 'MCP Personal',
        description:
          'Connect AI assistants like Claude and ChatGPT directly to your risk data for natural language queries and insights.',
      },
      rest_api: {
        enabled: true,
        title: 'REST API',
        description: 'Build custom integrations using the RiskSmart REST API.',
      },
      slack: {
        enabled: false,
        title: 'Slack',
        description:
          'Receive RiskSmart notifications and updates directly in your Slack channels.',
      },
    },
  },
};

// ─── SubModuleSettings — verbatim production className + behaviour ───
const SubModuleSettings = ({
  subModules,
  isDirty,
  onToggle,
}: {
  subModules: Record<string, BasicModule>;
  isDirty: boolean;
  onToggle: (id: string) => void;
}) => {
  return (
    <>
      <h4>{'Submodules'}</h4>
      {Object.entries(subModules).map(([subKey, sub]) => (
        <div
          key={subKey}
          className={
            'flex border-0 border-grey150 border-solid border-t-[0.5px] pt-4'
          }
        >
          <div>
            <Toggle
              checked={sub.enabled}
              onChange={() => onToggle(subKey)}
              ariaLabel={`Toggle ${subKey}`}
            />
          </div>
          <div className={'ml-[8px]'}>
            <h4 className={'my-0'}>{sub.title}</h4>
            <p>{sub.description}</p>
            {subKey === 'risk_scoring' && sub.enabled && <RiskScoreSettings />}
            {subKey === 'appetite_cascading' && sub.enabled && (
              <AppetiteCascadingSettings />
            )}
            {subKey === 'reg_feed' && sub.enabled && <IngestionConfigSettings />}
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
      ))}
    </>
  );
};

// ─── ModuleSettings — verbatim production className + structure ──────
const ModuleSettings = ({
  moduleId,
  module,
  isDirty,
  onToggle,
  onSubToggle,
}: {
  moduleId: string;
  module: BasicModule;
  isDirty: boolean;
  onToggle: (id: string) => void;
  onSubToggle: (parentId: string, subId: string) => void;
}) => (
  <div
    key={moduleId}
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
              onToggle={(subId) => onSubToggle(moduleId, subId)}
            />
          )}
        </>
      )}
    </div>
  </div>
);

const ModulesTab = () => {
  const [modules, setModules] =
    useState<Record<string, BasicModule>>(INITIAL_MODULES);
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
    setModules(INITIAL_MODULES);
    setIsDirty(false);
    setAlertDismissed(false);
  };

  const save = () => {
    setIsDirty(false);
    setAlertDismissed(false);
  };

  return (
    <div>
      <TabHeader className={'py-6'}>{'Modules'}</TabHeader>
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

export default ModulesTab;
