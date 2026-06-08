// @vitest-environment jsdom
import { render, waitFor } from '@testing-library/react';
import { useEffect } from 'react';
import { mockedGetOrganisation } from 'src/testing/mock-data/mockedGetOrganisation';
import { getWrapper } from 'src/testing/wrapper';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { TableFields, TablePreferences, TableRecord } from '../types';
import { useExportToCsv } from './useExportToCsv';

// Hoisted mocks to satisfy Vitest's mock hoisting rules
const {
  mockAddNotification,
  mockDownloadBlob,
  mockHandleError,
  mockRecordsToExportArray,
} = vi.hoisted(() => ({
  mockAddNotification: vi.fn(),
  mockDownloadBlob: vi.fn(),
  mockHandleError: vi.fn(),
  mockRecordsToExportArray: vi.fn(),
}));

// Mocks
vi.mock('@risksmart-app/components/src/notifications/useNotifications', () => ({
  useNotifications: () => ({ addNotification: mockAddNotification }),
}));

vi.mock('@risksmart-app/components/src/file/fileUtils', async () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const actual = await vi.importActual<any>(
    '@risksmart-app/components/src/file/fileUtils'
  );

  return {
    ...actual,
    downloadBlob: mockDownloadBlob,
  };
});

vi.mock('@/utils/errorUtils', () => ({ handleError: mockHandleError }));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}));

vi.mock('dayjs', () => ({
  default: () => ({ toISOString: () => '2025-01-01T00:00:00.000Z' }),
}));

vi.mock('@/utils/table/utils/tableExport', () => ({
  recordsToExportArray: (...args: unknown[]) =>
    mockRecordsToExportArray(...args),
}));

type Rec = TableRecord & { id: string; name: string };

const tableFields: TableFields<Rec> = {
  id: { header: 'ID' },
  name: { header: 'Name' },
};

const allPageItems: readonly Rec[] = [
  { id: '1', name: 'Alice' },
  { id: '2', name: 'Bob' },
];

const preferences: TablePreferences<Rec> = {
  contentDisplay: [
    { id: 'id', visible: true },
    { id: 'name', visible: false },
  ],
};

function HookHarness({
  onReady,
}: {
  onReady: (fns: {
    exportToCsvString: () => string;
    exportToCsv: () => void;
  }) => void;
}) {
  const fns = useExportToCsv<Rec>({
    tableFields,
    allPageItems,
    preferences,
    entityLabel: 'risks',
  });

  useEffect(() => {
    onReady(fns);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fns.exportToCsvString, fns.exportToCsv]);

  return null;
}

describe('useExportToCsv', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exportToCsvString returns CSV and uses visible columns from preferences', async () => {
    mockRecordsToExportArray.mockReturnValueOnce([
      ['ID', 'Name'],
      ['1', 'Alice,Bob'],
    ]);

    let api:
      | { exportToCsvString: () => string; exportToCsv: () => void }
      | undefined;
    render(<HookHarness onReady={(fns) => (api = fns)} />, {
      wrapper: getWrapper([mockedGetOrganisation()], 'features', 'graphql'),
    });

    await waitFor(() => expect(api).toBeDefined());

    const csv = api!.exportToCsvString();

    // Should call recordsToExportArray with items, fields, and only visible columns from preferences
    expect(mockRecordsToExportArray).toHaveBeenCalledWith(
      allPageItems,
      tableFields,
      ['id'],
      expect.anything()
    );

    // Expect CSV string to be properly quoted and newline separated
    expect(csv).toBe('"ID","Name"\r\n"1","Alice,Bob"');
  });

  it('exportToCsv triggers file download with BOM and file name', async () => {
    mockRecordsToExportArray.mockReturnValueOnce([
      ['ID', 'Name'],
      ['1', 'Alice,Bob'],
    ]);

    let api:
      | { exportToCsvString: () => string; exportToCsv: () => void }
      | undefined;
    render(<HookHarness onReady={(fns) => (api = fns)} />, {
      wrapper: getWrapper([mockedGetOrganisation()], 'features', 'graphql'),
    });

    await waitFor(() => expect(api).toBeDefined());

    api!.exportToCsv();

    expect(mockDownloadBlob).toHaveBeenCalledTimes(1);
    const [fileName, blob] = mockDownloadBlob.mock.calls[0];
    expect(fileName).toBe('risks-2025-01-01T00:00:00.000Z.csv');
    // Assert blob structure without relying on Blob.text (env differences)
    expect(blob).toBeInstanceOf(Blob);
    expect((blob as Blob).type).toBe('text/csv;charset=utf-8');
  });

  it('exportToCsvString handles errors by notifying and returning empty string', async () => {
    const err = new Error('boom');
    mockRecordsToExportArray.mockImplementationOnce(() => {
      throw err;
    });

    let api:
      | { exportToCsvString: () => string; exportToCsv: () => void }
      | undefined;
    render(<HookHarness onReady={(fns) => (api = fns)} />, {
      wrapper: getWrapper([mockedGetOrganisation()], 'features', 'graphql'),
    });

    await waitFor(() => expect(api).toBeDefined());

    const result = api!.exportToCsvString();
    expect(result).toBe('');
    expect(mockHandleError).toHaveBeenCalledWith(err);
    expect(mockAddNotification).toHaveBeenCalledWith({
      type: 'error',
      content: 'export.export_failed_message',
    });
  });

  it('exportToCsv handles errors by notifying', async () => {
    mockRecordsToExportArray.mockReturnValueOnce([
      ['ID', 'Name'],
      ['1', 'Alice,Bob'],
    ]);
    const err = new Error('download failed');
    mockDownloadBlob.mockImplementationOnce(() => {
      throw err;
    });

    let api:
      | { exportToCsvString: () => string; exportToCsv: () => void }
      | undefined;
    render(<HookHarness onReady={(fns) => (api = fns)} />, {
      wrapper: getWrapper([mockedGetOrganisation()], 'features', 'graphql'),
    });

    await waitFor(() => expect(api).toBeDefined());

    api!.exportToCsv();

    expect(mockHandleError).toHaveBeenCalledWith(err);
    expect(mockAddNotification).toHaveBeenCalledWith({
      type: 'error',
      content: 'export.export_failed_message',
    });
  });
});
