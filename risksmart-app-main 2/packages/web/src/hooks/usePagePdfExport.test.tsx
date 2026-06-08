// @vitest-environment jsdom
import { render, waitFor } from '@testing-library/react';
import { useEffect } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type {
  TableFields,
  TablePreferences,
  TablePropsWithActions,
  TableRecord,
} from '@/utils/table/types';

import { usePagePdfExport } from './usePagePdfExport';

// Hoisted mocks
const {
  mockAddNotification,
  mockAxiosPost,
  mockAxiosGet,
  mockGenerateTableData,
} = vi.hoisted(() => ({
  mockAddNotification: vi.fn(),
  mockAxiosPost: vi.fn(),
  mockAxiosGet: vi.fn(),
  mockGenerateTableData: vi.fn(() => ({
    headers: ['ID', 'Name'],
    rows: [
      ['1', 'Alice'],
      ['2', 'Bob'],
    ],
    metadata: {
      entityLabel: 'Risk Register',
      totalCount: 2,
      filteredCount: 2,
      hasFilters: false,
      filterInfo: '',
      appliedFilters: [],
    },
  })),
}));

// Module mocks
vi.mock('@risksmart-app/components/src/notifications/useNotifications', () => ({
  useNotifications: () => ({ addNotification: mockAddNotification }),
}));

vi.mock('@risksmart-app/components/src/hooks/useAxios', () => ({
  useAxiosStore: () => ({
    authorisedAxiosInstance: {
      post: mockAxiosPost,
      get: mockAxiosGet,
    },
  }),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}));

vi.mock('dayjs', () => ({
  default: () => ({
    toISOString: () => '2025-01-01T00:00:00.000Z',
    format: () => '2025-01-01-00-00-00',
  }),
}));

vi.mock('@/utils/table/hooks/useExportToPdf', () => ({
  useExportToPdf: () => ({
    exportToCsvString: vi.fn(() => ''),
    generateTableData: () => mockGenerateTableData(),
  }),
}));

// Minimal table setup

type Rec = TableRecord & { id: string; name: string };

const fields: TableFields<Rec> = {
  id: { header: 'ID' },
  name: { header: 'Name' },
};

const allItems: readonly Rec[] = [
  { id: '1', name: 'Alice' },
  { id: '2', name: 'Bob' },
];

const preferences: TablePreferences<Rec> = {
  contentDisplay: [
    { id: 'id', visible: true },
    { id: 'name', visible: true },
  ],
};

function Harness({
  onReady,
}: {
  onReady: (api: { exportToPdf: () => Promise<void> }) => void;
}) {
  const { exportToPdf } = usePagePdfExport<Rec>({
    tableProps: {
      allItems,
      items: allItems,
      filteringProperties: [],
      propertyFilterQuery: null,
      visibleColumns: ['id', 'name'],
      fields,
      entityLabel: 'Risk Register',
      preferenceDetails: { preferences } as unknown as {
        preferences: TablePreferences<Rec>;
      },
    } as unknown as TablePropsWithActions<Rec>,
    fields,
    pdfTemplateId: 'default-register',
    entityLabel: 'Risk Register',
  });

  useEffect(() => {
    onReady({ exportToPdf });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exportToPdf]);

  return null;
}

describe('usePagePdfExport', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default axios mocks
    mockAxiosPost.mockResolvedValue({
      data: {
        success: true,
        taskId: 'task-123',
        status: 'SUCCESS',
        token: { sig: 'signed-token', exp: 9999999999 },
      },
    });

    mockAxiosGet.mockImplementation(async (url: string, _config?: unknown) => {
      // First GET is status
      if (typeof url === 'string' && url.includes('/pdf/status/')) {
        return {
          data: {
            success: true,
            status: 'SUCCESS',
            // No downloadUrl to force building a tokenized proxy URL in the hook
          },
        };
      }
      // Second GET is the blob download
      if (typeof url === 'string' && url.includes('/pdf/download/')) {
        return { data: new Blob(['PDF'], { type: 'application/pdf' }) };
      }

      return { data: {} };
    });

    // Mock URL methods (define if missing in jsdom)
    if (!('createObjectURL' in URL)) {
      // @ts-expect-error augment for test
      URL.createObjectURL = vi.fn();
    }
    if (!('revokeObjectURL' in URL)) {
      // @ts-expect-error augment for test
      URL.revokeObjectURL = vi.fn();
    }
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(vi.fn());

    const realCreateElement = document.createElement.bind(document);
    let lastAnchor: HTMLAnchorElement | null = null;
    vi.spyOn(document, 'createElement').mockImplementation(
      (tagName: string): HTMLElement => {
        if (tagName.toLowerCase() === 'a') {
          const a = realCreateElement('a') as HTMLAnchorElement;
          // Stub click but keep as real element so appendChild works
          a.click = vi.fn();
          lastAnchor = a;

          return a as unknown as HTMLElement;
        }
        // Fallback to original for other tags

        return realCreateElement(tagName);
      }
    );

    // Expose lastAnchor for assertions
    (
      globalThis as unknown as {
        __lastAnchor: () => HTMLAnchorElement | null;
      }
    ).__lastAnchor = () => lastAnchor;
  });

  it('posts desired filename to /pdf/generate and uses it for download', async () => {
    let api: { exportToPdf: () => Promise<void> } | undefined;
    render(<Harness onReady={(a) => (api = a)} />);

    await waitFor(() => expect(api).toBeDefined());

    await api!.exportToPdf();

    // Assert POST body contains expected filename
    expect(mockAxiosPost).toHaveBeenCalledTimes(1);
    const [postUrl, postBody] = mockAxiosPost.mock.calls[0];
    expect(postUrl).toBe('/pdf/generate');

    const filename = (postBody as { input: { options: { filename: string } } })
      .input.options.filename as string;
    expect(filename).toBe('risk-register-2025-01-01-00-00-00.pdf');

    // Assert status poll then download
    expect(mockAxiosGet).toHaveBeenCalledWith(
      expect.stringMatching(/^\/pdf\/status\/task-123\?filename=.*\.pdf(&|$)/)
    );

    // Validate the link's download attribute was set to our filename
    const getLastAnchor = (
      globalThis as unknown as {
        __lastAnchor: () => HTMLAnchorElement | null;
      }
    ).__lastAnchor;
    const created = getLastAnchor();
    expect(created?.download).toBe('risk-register-2025-01-01-00-00-00.pdf');

    // We can't easily retrieve the instance from createElement here,
    // but we know our code sets link.download = filename,
    // so verify filename variable is as expected (above) and
    // that we attempted to fetch a blob for download
    expect(mockAxiosGet).toHaveBeenCalledWith(
      expect.stringMatching(
        /^\/pdf\/download\/task-123\?filename=.*\.pdf(&|$)/
      ),
      { responseType: 'blob' }
    );
  });

  it('includes normalized columnWidthRatios from preferences.custom.columnWidths aligned to visibleColumns', async () => {
    // Arrange: set explicit column widths in preferences to create a 2:1 ratio
    (preferences as unknown as { custom?: unknown }).custom = {
      columnWidths: { id: 200, name: 100 },
    } as { columnWidths: Record<string, number> };

    let api: { exportToPdf: () => Promise<void> } | undefined;
    render(<Harness onReady={(a) => (api = a)} />);

    await waitFor(() => expect(api).toBeDefined());

    await api!.exportToPdf();

    // Assert: POST body contains columnWidthRatios ~ [0.6667, 0.3333]
    const [, postBody] = mockAxiosPost.mock.calls[0];
    const ratios = (
      postBody as {
        input: { data: { columnWidthRatios?: number[] } };
      }
    ).input.data.columnWidthRatios as number[];

    expect(ratios).toEqual([0.6667, 0.3333]);
  });

  it('posts rows containing history strings and numeric zero values', async () => {
    // Arrange: return custom table data with history + zeros
    mockGenerateTableData.mockReturnValueOnce({
      headers: [
        'ID',
        'controlled_rating_history',
        'inherent_score',
        'residual_score',
      ],
      rows: [['R-1', '2025-01-01 High,2025-02-01 Medium', '0', '3']],
      metadata: {
        entityLabel: 'Risk Register',
        totalCount: 1,
        filteredCount: 1,
        hasFilters: false,
        filterInfo: '',
        appliedFilters: [],
      },
    });

    let api: { exportToPdf: () => Promise<void> } | undefined;
    render(<Harness onReady={(a) => (api = a)} />);

    await waitFor(() => expect(api).toBeDefined());
    await api!.exportToPdf();

    const [, postBody] = mockAxiosPost.mock.calls[0];
    const payload = (
      postBody as {
        input: { data: { headers: string[]; rows: (string | number)[][] } };
      }
    ).input.data;
    expect(payload.headers).toEqual([
      'ID',
      'controlled_rating_history',
      'inherent_score',
      'residual_score',
    ]);

    // Ensure zero is preserved as '0' after serialization to strings in the hook
    // The hook converts cells to String, so numbers become strings
    expect(payload.rows[0]).toEqual([
      'R-1',
      '2025-01-01 High,2025-02-01 Medium',
      '0',
      '3',
    ]);
  });
});
