import type { Meta, StoryObj } from '@storybook/react-vite';
import FileTokenGroup from '@risk-smart/themed-cloudscape-components/file-token-group';
import { useState } from 'react';
import '../_setup';


const meta = {
  title: 'Cloudscape Reference/FileTokenGroup',
  component: FileTokenGroup,
  tags: ['cloudscape-real'],
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: 'Real Cloudscape FileTokenGroup rendered with RiskSmart theme. 1:1 with live app.' } },
  },
} satisfies Meta<typeof FileTokenGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

const SAMPLE = [
  new File(['data'], 'risk-register.pdf', { type: 'application/pdf' }),
  new File(['data'], 'controls.xlsx', { type: 'application/vnd.ms-excel' }),
];
const Controlled = () => {
  const [items, setItems] = useState(SAMPLE.map((file) => ({ file })));
  return <FileTokenGroup items={items} onDismiss={({ detail }) => setItems((cur) => cur.filter((_, i) => i !== detail.fileIndex))}
    i18nStrings={{
      removeFileAriaLabel: (i) => `Remove file ${i + 1}`,
      limitShowFewer: 'Show fewer',
      limitShowMore: 'Show more',
      errorIconAriaLabel: 'Error',
    }} />;
};
export const Default: Story = { render: () => <Controlled /> };
