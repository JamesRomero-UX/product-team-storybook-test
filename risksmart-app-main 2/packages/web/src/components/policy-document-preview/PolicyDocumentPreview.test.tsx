import { Document_File_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { fireEvent, render, screen } from '@testing-library/react';
import { defaultFormProviders, getWrapper } from 'src/testing/wrapper';
import { vi } from 'vitest';

import { mockedRoleAccessResponse } from '../../testing/mock-data/mockedGetRoleAccessResponse';
import { PolicyDocumentPreview } from './PolicyDocumentPreview';

global.URL.createObjectURL = vi.fn();

const mockDocumentFile = {
  Id: 'abcdefg',
  Version: '0.1',
  CustomAttributeData: null,
  PublishedDate: '2024-07-01T08:20:32.26+00:00',
  parent: {
    Title: 'ISO 27001',
    owners: [
      {
        UserId: '123',
        user: {
          UserName: 'RiskManager1',
          Id: '123',
        },
      },
    ],
    ownerGroups: [],
    tags: [],
    linkedDocuments: [],
  },
};

describe('PolicyDocumentPreview', () => {
  const mockDataHtml = {
    type: 'html',
    documentFile: {
      ...mockDocumentFile,
      Type: Document_File_Type_Enum.Html,
      Content: '<p>Test HTML Content</p>',
    },
    content: '<p>Test HTML Content</p>',
  } as const;

  const mockPdfDataFile = {
    type: 'file',
    fileName: 'test',
    blob: new Blob(),
    documentFile: {
      ...mockDocumentFile,
      Type: Document_File_Type_Enum.File,
      FileId: '123',
      file: { FileName: 'test.pdf' },
    },
  } as const;

  const mockDataFile = {
    type: 'file',
    fileName: 'test',
    blob: new Blob(),
    documentFile: {
      ...mockDocumentFile,
      Type: Document_File_Type_Enum.File,
      FileId: '456',
      file: { FileName: 'test.png' },
    },
  } as const;

  const mockDataLink = {
    type: 'link',
    link: 'http://example.com',
    documentFile: { ...mockDocumentFile, Type: Document_File_Type_Enum.Link },
  } as const;

  it('renders HTML content correctly', async () => {
    render(<PolicyDocumentPreview data={mockDataHtml} />, {
      wrapper: getWrapper(
        [mockedRoleAccessResponse()],
        ...defaultFormProviders
      ),
    });
    expect(await screen.findByText('Test HTML Content')).toBeInTheDocument();
  });

  it('renders PDF viewer for file type', async () => {
    render(<PolicyDocumentPreview data={mockPdfDataFile} />, {
      wrapper: getWrapper(
        [mockedRoleAccessResponse()],
        ...defaultFormProviders
      ),
    });
    expect(await screen.findByTestId('pdf-viewer')).toBeInTheDocument(); // Initial state before any PDF is loaded
  });

  it('renders link correctly', async () => {
    render(<PolicyDocumentPreview data={mockDataLink} />, {
      wrapper: getWrapper(
        [mockedRoleAccessResponse()],
        ...defaultFormProviders
      ),
    });
    expect(await screen.findByText('External Link')).toBeInTheDocument();
    expect(await screen.findByText('Visit Link')).toBeInTheDocument();
  });

  it('renders download file form for file type', async () => {
    render(<PolicyDocumentPreview data={mockDataFile} />, {
      wrapper: getWrapper(
        [mockedRoleAccessResponse()],
        ...defaultFormProviders
      ),
    });
    expect(await screen.findByText('Download File')).toBeInTheDocument();
    expect(await screen.findByText('Download')).toBeInTheDocument();
  });

  it('opens external link', async () => {
    // This test would check if clicking the button for a 'link' type data opens the correct URL
    // This requires mocking global.window.open or spying on it, and then verifying it was called with the correct URL
    const { findByText } = render(
      <PolicyDocumentPreview data={mockDataLink} />,
      {
        wrapper: getWrapper(
          [mockedRoleAccessResponse()],
          ...defaultFormProviders
        ),
      }
    );
    global.open = vi.fn();
    fireEvent.click(await findByText('Visit Link'));
    expect(global.open).toHaveBeenCalledWith('http://example.com', '_blank');
  });
});
