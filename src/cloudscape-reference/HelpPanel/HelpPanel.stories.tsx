// Real RiskSmart HelpPanel from
// `packages/web/src/components/help-panel` — wraps Cloudscape HelpPanel
// with RiskSmart-flavored sections rendered from sanitised HTML strings.
// Content is driven by the `useHelpStore` zustand store. For stories we
// pre-populate the store with sample HTML in a `useEffect`.
import type { Meta, StoryObj } from '@storybook/react-vite';
// eslint-disable-next-line import/no-unresolved
import HelpPanel from 'src/components/help-panel/HelpPanel';
// eslint-disable-next-line import/no-unresolved
import { useHelpStore } from 'src/components/help-panel/useHelpStore';
import { useEffect } from 'react';

import '../_setup';
import { RealProviders } from '../../app-shell/_providers';

const meta = {
  title: 'Cloudscape Reference/HelpPanel',
  component: HelpPanel as any,
  tags: ['cloudscape-real'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Real RiskSmart HelpPanel. 1:1 with live app. Pulls content from useHelpStore — populated here directly for the story; in production it is set by the page via i18n keys.',
      },
    },
  },
} satisfies Meta<any>;

export default meta;
type Story = StoryObj<typeof meta>;

const PopulateStore = ({
  summary = [],
  fields = {},
  contentId = null,
}: {
  summary?: { title: string; content: string }[];
  fields?: Record<string, { title: string; content: string }>;
  contentId?: string | null;
}) => {
  const setSummary = useHelpStore((s) => s.setSummaryHelpContent);
  const addFieldHelp = useHelpStore((s) => s.addFieldHelp);
  const setContentId = useHelpStore((s) => s.setContentId);
  const setTranslationKey = useHelpStore((s) => s.setTranslationKey);
  useEffect(() => {
    setSummary(summary);
    Object.entries(fields).forEach(([id, c]) => addFieldHelp(id, c));
    setContentId(contentId);
    setTranslationKey('risks.registerHelp');
  }, [summary, fields, contentId, setSummary, addFieldHelp, setContentId, setTranslationKey]);
  return null;
};

const Stage = ({ children }: { children: React.ReactNode }) => (
  <RealProviders initialPath={'/risks'}>
    <div style={{ width: 360, height: 640, background: '#fff', borderRadius: 12, border: '1px solid #e5e5e5', overflow: 'auto' }}>
      {children}
    </div>
  </RealProviders>
);

export const Closed: Story = {
  render: () => (
    <Stage>
      <PopulateStore />
      <HelpPanel />
    </Stage>
  ),
};

export const Open: Story = {
  render: () => (
    <Stage>
      <PopulateStore
        summary={[
          {
            title: 'About the Risk Register',
            content:
              '<p>The Risk Register lists every risk captured in your organisation, ordered by severity and last-modified date.</p><p>Use the property filter to narrow by owner, status, or tier; use the saved-views menu (top right) to switch between common scopes.</p>',
          },
          {
            title: 'Creating a risk',
            content:
              '<p>Click <strong>Create risk</strong> to open the risk-capture form. You will need to specify a title, severity, and at least one owner. Optional fields (description, linked controls, attachments) can be added later.</p>',
          },
        ]}
      />
      <HelpPanel />
    </Stage>
  ),
};

export const WithFieldHelp: Story = {
  render: () => (
    <Stage>
      <PopulateStore
        summary={[{ title: 'Risk form', content: '<p>Capture details about a new risk for this register.</p>' }]}
        fields={{
          severity: {
            title: 'Severity',
            content:
              '<p>Severity is a 4-level scale: <strong>Critical, High, Medium, Low</strong>. Critical risks must have an action plan within 7 days of capture.</p>',
          },
          owner: {
            title: 'Owner',
            content:
              '<p>The owner is responsible for tracking the risk through to mitigation. Choose an individual user or a group; for tier-1 risks, an executive sponsor is required.</p>',
          },
        }}
      />
      <HelpPanel />
    </Stage>
  ),
};
