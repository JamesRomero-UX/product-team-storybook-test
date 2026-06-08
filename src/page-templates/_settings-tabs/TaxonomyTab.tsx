// Settings → Taxonomy tab
//
// Mirrors pages/settings/tabs/taxonomy/Tab.tsx.
//
// This tab is the org-specific terminology / rating-palette override.
// Production layout:
//   TabHeader (title + Delete + Export buttons)
//   Organisation count message
//   "Show defaults" checkbox
//   Version select (history)
//   SegmentedControl: Common / Rating / Taxonomy / Library [+ InternalAuditRating]
//   TaxonomyForm (JSON editor — ACE-based in production)
//
// We use a Cloudscape <Textarea> as a JSON viewer instead of lifting the
// full TaxonomyForm + ACE editor stack (too deep, not core to the page
// shape).

import Checkbox from '@risk-smart/themed-cloudscape-components/checkbox';
import FormField from '@risk-smart/themed-cloudscape-components/form-field';
import SegmentedControl from '@risk-smart/themed-cloudscape-components/segmented-control';
import Select from '@risk-smart/themed-cloudscape-components/select';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Textarea from '@risk-smart/themed-cloudscape-components/textarea';
// eslint-disable-next-line import/no-unresolved
import Button from '@risksmart-app/components/src/button';
// eslint-disable-next-line import/no-unresolved
import TabHeader from 'src/components/tab-header';
import { useState } from 'react';

// Sample taxonomy snippets matching the structure of the i18n JSON
// files production overrides (taxonomy.json, ratings.json, common.json,
// library.json, internal_audit_ratings.json).
const SAMPLE_TAXONOMY: Record<string, unknown> = {
  Common: {
    risk_one: 'risk',
    risk_other: 'risks',
    control_one: 'control',
    control_other: 'controls',
    obligation_one: 'obligation',
    questionnaire_one: 'questionnaire',
  },
  Rating: {
    risk_assessment_result_status: [
      { color: 'light-green', label: 'Low',      value: 'low' },
      { color: 'orange',      label: 'Medium',   value: 'medium' },
      { color: 'light-red',   label: 'High',     value: 'high' },
      { color: 'dark-red',    label: 'Critical', value: 'critical' },
    ],
  },
  Taxonomy: {
    risk_tiers: [
      { value: 1, label: 'Enterprise' },
      { value: 2, label: 'Group' },
      { value: 3, label: 'Business unit' },
    ],
  },
  Library: {
    risks: [
      { title: 'Information security breach', description: 'Unauthorised access to confidential systems or data.' },
      { title: 'Regulatory non-compliance',   description: 'Failure to meet PRA / FCA obligations.' },
    ],
  },
  InternalAuditRating: {
    internal_audit_overall_rating: [
      { color: 'dark-green',  label: 'Satisfactory',     value: 'satisfactory' },
      { color: 'orange',      label: 'Requires improvement', value: 'requires_improvement' },
      { color: 'dark-red',    label: 'Unsatisfactory',   value: 'unsatisfactory' },
    ],
  },
};

const TAXONOMY_TYPES = [
  { id: 'Common',              text: 'Common' },
  { id: 'Rating',              text: 'Ratings' },
  { id: 'Taxonomy',            text: 'Taxonomy' },
  { id: 'Library',             text: 'Library' },
  { id: 'InternalAuditRating', text: 'Internal audit ratings' },
];

const VERSIONS = [
  { label: 'Latest',                   value: '2026-05-12T09:23:00Z' },
  { label: '2026-04-20 14:08:11',      value: '2026-04-20T14:08:11Z' },
  { label: '2025-12-04 11:30:00',      value: '2025-12-04T11:30:00Z' },
  { label: '2025-08-19 10:15:00',      value: '2025-08-19T10:15:00Z' },
];

const TaxonomyTab = () => {
  const [showDefaults, setShowDefaults] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState(VERSIONS[0]);
  const [selectedType, setSelectedType] = useState('Common');

  const json = JSON.stringify(
    SAMPLE_TAXONOMY[selectedType] ?? {},
    null,
    4,
  );

  const readOnly = showDefaults || selectedVersion.value !== VERSIONS[0].value;

  return (
    <SpaceBetween size={'m'}>
      <TabHeader
        actions={
          <SpaceBetween direction={'horizontal'} size={'xs'}>
            <Button disabled={readOnly}>{'Delete'}</Button>
            <Button iconName={'download'}>{'Export'}</Button>
          </SpaceBetween>
        }
      >
        {'Taxonomy'}
      </TabHeader>

      <div className={'text-grey600 text-sm'}>
        {'Used by 3 other organisations.'}
      </div>

      <FormField label={'Show defaults'}>
        <Checkbox
          checked={showDefaults}
          onChange={({ detail }) => setShowDefaults(detail.checked)}
        />
      </FormField>

      {!showDefaults && (
        <FormField label={'Version'}>
          <Select
            selectedOption={selectedVersion as any}
            onChange={({ detail }) =>
              setSelectedVersion(detail.selectedOption as any)
            }
            options={VERSIONS as any}
          />
        </FormField>
      )}

      <SegmentedControl
        selectedId={selectedType}
        onChange={({ detail }) => setSelectedType(detail.selectedId)}
        label={'Select taxonomy'}
        options={TAXONOMY_TYPES}
      />

      <FormField label={selectedType + (readOnly ? ' (read-only)' : '')}>
        <Textarea
          value={json}
          onChange={() => undefined}
          rows={16}
          readOnly={readOnly}
        />
      </FormField>

      {!readOnly && (
        <SpaceBetween direction={'horizontal'} size={'xs'}>
          <Button variant={'primary'}>{'Save'}</Button>
          <Button>{'Cancel'}</Button>
        </SpaceBetween>
      )}
    </SpaceBetween>
  );
};

export default TaxonomyTab;
