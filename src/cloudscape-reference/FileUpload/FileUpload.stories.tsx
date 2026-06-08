import type { Meta, StoryObj } from '@storybook/react-vite';
import FileUpload from '@risk-smart/themed-cloudscape-components/file-upload';
import { useState } from 'react';
import '../_setup';


const meta = {
  title: 'Cloudscape Reference/FileUpload',
  component: FileUpload,
  tags: ['cloudscape-real'],
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: 'Real Cloudscape FileUpload rendered with RiskSmart theme. 1:1 with live app.' } },
  },
} satisfies Meta<typeof FileUpload>;

export default meta;

type Story = StoryObj<typeof meta>;

const Controlled = () => {
  const [files, setFiles] = useState<File[]>([]);
  return <FileUpload value={files} onChange={({ detail }) => setFiles(detail.value)} multiple
    i18nStrings={{
      uploadButtonText: () => 'Choose files',
      dropzoneText: () => 'Drop files here',
      removeFileAriaLabel: (i) => `Remove file ${i + 1}`,
      limitShowFewer: 'Show fewer',
      limitShowMore: 'Show more',
      errorIconAriaLabel: 'Error',
    }} />;
};
export const Default: Story = { render: () => <Controlled /> };
