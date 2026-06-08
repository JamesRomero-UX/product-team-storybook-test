import type { Meta, StoryObj } from '@storybook/react-vite';
import TagEditor from '@risk-smart/themed-cloudscape-components/tag-editor';
import { useState } from 'react';
import '../_setup';


const meta = {
  title: 'Cloudscape Reference/TagEditor',
  component: TagEditor,
  tags: ['cloudscape-real'],
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: 'Real Cloudscape TagEditor rendered with RiskSmart theme. 1:1 with live app.' } },
  },
} satisfies Meta<typeof TagEditor>;

export default meta;

type Story = StoryObj<typeof meta>;

const Controlled = () => {
  const [tags, setTags] = useState([{ key: 'env', value: 'prod', existing: false }]);
  return <TagEditor tags={tags} onChange={({ detail }) => setTags(detail.tags)} i18nStrings={{
    keyPlaceholder: 'Key',
    valuePlaceholder: 'Value',
    addButton: 'Add tag',
    removeButton: 'Remove',
    undoButton: 'Undo',
    undoPrompt: 'Tag will be removed',
    loading: 'Loading',
    keyHeader: 'Key',
    valueHeader: 'Value',
    optional: 'optional',
    keySuggestion: 'Custom',
    valueSuggestion: 'Custom',
    emptyTags: 'No tags',
    tooManyKeysSuggestion: 'Too many keys',
    tooManyValuesSuggestion: 'Too many values',
    keysSuggestionLoading: 'Loading',
    keysSuggestionError: 'Error',
    valuesSuggestionLoading: 'Loading',
    valuesSuggestionError: 'Error',
    emptyKeyError: 'Key required',
    maxKeyCharLengthError: 'Too long',
    maxValueCharLengthError: 'Too long',
    duplicateKeyError: 'Duplicate',
    invalidKeyError: 'Invalid',
    invalidValueError: 'Invalid',
    awsPrefixError: 'No aws: prefix',
    tagLimit: (n) => `Up to ${n}`,
    tagLimitReached: () => 'Limit reached',
    tagLimitExceeded: () => 'Exceeded',
    enteredKeyLabel: (k) => `Use "${k}"`,
    enteredValueLabel: (v) => `Use "${v}"`,
  }} />;
};
export const Default: Story = { render: () => <Controlled /> };
