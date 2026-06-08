import type { Meta, StoryObj } from '@storybook/react-vite';
import FileDropzone from '@risk-smart/themed-cloudscape-components/file-dropzone';
import { useState } from 'react';
import '../_setup';


const meta = {
  title: 'Cloudscape Reference/FileDropzone',
  component: FileDropzone,
  tags: ['cloudscape-real'],
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: 'Real Cloudscape FileDropzone rendered with RiskSmart theme. 1:1 with live app.' } },
  },
} satisfies Meta<typeof FileDropzone>;

export default meta;

type Story = StoryObj<typeof meta>;

const Controlled = () => {
  const [files, setFiles] = useState<File[]>([]);
  return <FileDropzone onChange={({ detail }) => setFiles((cur) => [...cur, ...detail.value])}>{files.length === 0 ? 'Drop files here' : `${files.length} file(s)`}</FileDropzone>;
};
export const Default: Story = { render: () => <div style={{ width: 480 }}><Controlled /></div> };
