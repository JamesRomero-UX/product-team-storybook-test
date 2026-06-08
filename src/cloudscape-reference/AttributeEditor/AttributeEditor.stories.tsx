import type { Meta, StoryObj } from '@storybook/react-vite';
import AttributeEditor from '@risk-smart/themed-cloudscape-components/attribute-editor';
import Input from '@risk-smart/themed-cloudscape-components/input';
import { useState } from 'react';
import '../_setup';


const meta = {
  title: 'Cloudscape Reference/AttributeEditor',
  component: AttributeEditor,
  tags: ['cloudscape-real'],
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: 'Real Cloudscape AttributeEditor rendered with RiskSmart theme. 1:1 with live app.' } },
  },
} satisfies Meta<typeof AttributeEditor>;

export default meta;

type Story = StoryObj<typeof meta>;

const Controlled = () => {
  const [items, setItems] = useState([{ key: '', value: '' }]);
  return <AttributeEditor
    onAddButtonClick={() => setItems((cur) => [...cur, { key: '', value: '' }])}
    onRemoveButtonClick={({ detail }) => setItems((cur) => cur.filter((_, i) => i !== detail.itemIndex))}
    items={items}
    addButtonText={'Add attribute'}
    removeButtonText={'Remove'}
    definition={[
      { label: 'Key', control: (item, i) => <Input value={item.key} onChange={({ detail }) => setItems((cur) => cur.map((it, idx) => idx === i ? { ...it, key: detail.value } : it))} /> },
      { label: 'Value', control: (item, i) => <Input value={item.value} onChange={({ detail }) => setItems((cur) => cur.map((it, idx) => idx === i ? { ...it, value: detail.value } : it))} /> },
    ]}
    empty={'No attributes'}
  />;
};
export const Default: Story = { render: () => <Controlled /> };
