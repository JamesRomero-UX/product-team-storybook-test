// Real RiskSmart FileItem from
// `packages/components/src/file/FileItem.tsx` — Cloudscape Alert with
// click-to-download body + dismissible behavior. Shows uploaded files in
// the file-upload widget across the app.
//
// Note: the surrounding upload/download HOOKS (`useFileUpload`,
// `useFileDownload`, `useFileUpdate`) are deferred — they need Apollo
// mutations and S3 signing that aren't worth mocking for a template.
// FileItem itself is presentational and works with any download function.
import type { Meta, StoryObj } from '@storybook/react-vite';
// eslint-disable-next-line import/no-unresolved
import FileItem from '@risksmart-app/components/src/file/FileItem';
import { useState } from 'react';

import '../_setup';

const meta = {
  title: 'Cloudscape Reference/FileItem',
  component: FileItem as any,
  tags: ['cloudscape-real'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: 'Real RiskSmart FileItem. 1:1 with live app.' } },
  },
} satisfies Meta<any>;

export default meta;
type Story = StoryObj<typeof meta>;

const noopDownload = (_args: any) => {};

export const Uploaded: Story = {
  render: () => (
    <div style={{ width: 480 }}>
      <FileItem
        fileId={'f-001'}
        fileName={'quarterly-audit-findings.pdf'}
        fileSize={245_678}
        downloadFile={noopDownload}
      />
    </div>
  ),
};

export const WithError: Story = {
  render: () => (
    <div style={{ width: 480 }}>
      <FileItem
        fileId={'f-002'}
        fileName={'iam-policy-review.docx'}
        fileSize={1_245_678}
        error={{ message: 'Upload failed — file too large.' } as any}
        downloadFile={noopDownload}
      />
    </div>
  ),
};

export const Dismissable: Story = {
  render: () => {
    const [removed, setRemoved] = useState(false);
    if (removed) {
      return <div style={{ width: 480, color: '#73738C' }}>File removed. Refresh story to reset.</div>;
    }
    return (
      <div style={{ width: 480 }}>
        <FileItem
          fileId={'f-003'}
          fileName={'control-evidence-jan2026.csv'}
          fileSize={48_392}
          onRemove={() => setRemoved(true)}
          downloadFile={noopDownload}
        />
      </div>
    );
  },
};

export const Disabled: Story = {
  render: () => (
    <div style={{ width: 480 }}>
      <FileItem
        fileId={'f-004'}
        fileName={'archived-risk-export.pdf'}
        fileSize={3_456_789}
        disabled
        downloadFile={noopDownload}
      />
    </div>
  ),
};

export const Stack: Story = {
  render: () => (
    <div style={{ width: 480 }}>
      <FileItem fileId={'f-a'} fileName={'audit-report.pdf'} fileSize={245_678} downloadFile={noopDownload} />
      <FileItem fileId={'f-b'} fileName={'evidence-photos.zip'} fileSize={4_823_412} downloadFile={noopDownload} />
      <FileItem
        fileId={'f-c'}
        fileName={'broken-upload.docx'}
        fileSize={892_134}
        error={{ message: 'Upload failed' } as any}
        downloadFile={noopDownload}
      />
    </div>
  ),
};
