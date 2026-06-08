import type { Meta, StoryObj } from '@storybook/react-vite';
import FileInput from '@risk-smart/themed-cloudscape-components/file-input';
import { useState } from 'react';
import '../_setup';


const meta = {
  title: 'Cloudscape Reference/FileInput',
  component: FileInput,
  tags: ['cloudscape-real'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: 'Real Cloudscape FileInput rendered with RiskSmart theme. 1:1 with live app.' } },
  },
} satisfies Meta<typeof FileInput>;

export default meta;

type Story = StoryObj<typeof meta>;

const Controlled = () => {
  const [files, setFiles] = useState<File[]>([]);
  return <FileInput value={files} onChange={({ detail }) => setFiles(detail.value)} multiple>Choose file</FileInput>;
};
export const Default: Story = { render: () => <Controlled /> };
