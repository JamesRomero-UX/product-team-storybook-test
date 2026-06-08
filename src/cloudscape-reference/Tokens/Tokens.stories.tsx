// Real production Tokens chip pill component, lifted directly from
// `packages/web/src/components/tokens/Tokens.tsx`. This is the canonical
// chip / pill pattern used throughout the app for displaying selected
// items (departments, tags, owners, contributors, etc.) with optional
// X-remove buttons, icons, subtitles, and a "show more / fewer" expander.
//
// 1:1 with live app. Use this pattern wherever you'd show a list of
// removable chips next to a form field or in a read-only display.

import type { Meta, StoryObj } from '@storybook/react-vite';
import { User01, Tag01, Building07 } from '@untitled-ui/icons-react';
import Tokens from 'src/components/tokens';
import '../_setup';
import { RealProviders } from '../../app-shell/_providers';

const meta = {
  title: 'Cloudscape Reference/Tokens',
  component: Tokens as any,
  tags: ['real-component'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Production Tokens chip pill component (`packages/web/src/components/tokens/Tokens.tsx`). ' +
          'Used everywhere chips are shown — department lists, tag lists, owner displays, contributor displays. ' +
          'Pill: `bg-grey150 text-grey650 rounded-full h-[33px] px-5`, optional X-close, optional icon, optional subtitle, optional URL link, optional show-more pagination.',
      },
    },
  },
  decorators: [
    (Story) => (
      <RealProviders>
        <Story />
      </RealProviders>
    ),
  ],
} satisfies Meta<typeof Tokens>;

export default meta;
type Story = StoryObj<typeof meta>;

const personIcon = <User01 width={20} height={20} />;
const tagIcon = <Tag01 width={20} height={20} />;
const deptIcon = <Building07 width={20} height={20} />;

// ─── Default — simple text-only chips with X close ────────────────────
export const Default: Story = {
  render: () => (
    <Tokens
      tokens={[
        { value: 'emma', label: 'Emma Bamford' },
        { value: 'richard', label: 'Richard Poole' },
        { value: 'james', label: 'James Romero' },
      ]}
      onRemove={(v) => console.log('remove', v)}
    />
  ),
};

// ─── With icons (people picker style) ────────────────────────────────
export const WithIcons: Story = {
  render: () => (
    <Tokens
      tokens={[
        { value: 'emma', label: 'Emma Bamford', icon: personIcon },
        { value: 'richard', label: 'Richard Poole', icon: personIcon },
      ]}
      onRemove={(v) => console.log('remove', v)}
    />
  ),
};

// ─── With subtitles (for context like role / org / email) ─────────────
export const WithSubtitles: Story = {
  render: () => (
    <Tokens
      tokens={[
        { value: 'emma', label: 'Emma Bamford', subtitle: 'Risk Manager' },
        { value: 'richard', label: 'Richard Poole', subtitle: 'CRO' },
        { value: 'james', label: 'James Romero', subtitle: 'VP Product' },
      ]}
      onRemove={(v) => console.log('remove', v)}
    />
  ),
};

// ─── Tags / categories (no icon, plain labels) ────────────────────────
export const Tags: Story = {
  render: () => (
    <Tokens
      tokens={[
        { value: 'critical', label: 'Critical' },
        { value: 'data-loss', label: 'Data loss' },
        { value: 'cyber', label: 'Cyber' },
        { value: 'q1-priority', label: 'Q1 priority' },
        { value: 'board-attention', label: 'Board attention' },
      ]}
      onRemove={(v) => console.log('remove', v)}
    />
  ),
};

// ─── Departments with icon ────────────────────────────────────────────
export const Departments: Story = {
  render: () => (
    <Tokens
      tokens={[
        { value: 'risk', label: 'Risk', icon: deptIcon },
        { value: 'compliance', label: 'Compliance', icon: deptIcon },
        { value: 'audit', label: 'Internal Audit', icon: deptIcon },
        { value: 'legal', label: 'Legal', icon: deptIcon },
      ]}
      onRemove={(v) => console.log('remove', v)}
    />
  ),
};

// ─── Disabled (read-only — X button hidden, padding tightens) ─────────
export const Disabled: Story = {
  render: () => (
    <Tokens
      disabled
      tokens={[
        { value: 'emma', label: 'Emma Bamford', icon: personIcon },
        { value: 'richard', label: 'Richard Poole', icon: personIcon },
        { value: 'james', label: 'James Romero', icon: personIcon },
      ]}
      onRemove={(v) => console.log('remove', v)}
    />
  ),
};

// ─── Mixed: some disabled, some removable ─────────────────────────────
export const PerTokenDisabled: Story = {
  render: () => (
    <Tokens
      tokens={[
        {
          value: 'emma',
          label: 'Emma Bamford',
          icon: personIcon,
          disabled: true,
        },
        { value: 'richard', label: 'Richard Poole', icon: personIcon },
        { value: 'james', label: 'James Romero', icon: personIcon },
      ]}
      onRemove={(v) => console.log('remove', v)}
    />
  ),
};

// ─── With URL link (label becomes a clickable link) ───────────────────
export const WithLinks: Story = {
  render: () => (
    <Tokens
      tokens={[
        { value: 'r-001', label: 'Data breach via legacy S3 bucket', url: '#' },
        { value: 'r-002', label: 'Vendor concentration — payments', url: '#' },
        { value: 'r-003', label: 'GDPR — third-party processors', url: '#' },
      ]}
      onRemove={(v) => console.log('remove', v)}
    />
  ),
};

// ─── Limit + show more (long lists) ───────────────────────────────────
export const WithLimit: Story = {
  render: () => (
    <Tokens
      limit={3}
      tokens={[
        { value: 't1', label: 'Critical', icon: tagIcon },
        { value: 't2', label: 'Data loss', icon: tagIcon },
        { value: 't3', label: 'Cyber', icon: tagIcon },
        { value: 't4', label: 'Q1 priority', icon: tagIcon },
        { value: 't5', label: 'Board attention', icon: tagIcon },
        { value: 't6', label: 'Regulatory', icon: tagIcon },
        { value: 't7', label: 'Operational', icon: tagIcon },
        { value: 't8', label: 'Technology', icon: tagIcon },
      ]}
      onRemove={(v) => console.log('remove', v)}
    />
  ),
};
