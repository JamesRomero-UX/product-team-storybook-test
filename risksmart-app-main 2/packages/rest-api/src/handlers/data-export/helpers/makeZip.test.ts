import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('src/dataConverter');
vi.mock('yazl');

const mockLogger = vi.hoisted(() => ({
  info: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  debug: vi.fn(),
}));

vi.mock('src/logger', () => ({
  getLogger: vi.fn().mockReturnValue(mockLogger),
}));

import type { GetNormalisedExportDataQuery } from 'generated/graphql';
import { ZipFile } from 'yazl';

import { dataToCsv } from '../../../dataConverter';
import { makeZip } from './makeZip';

const mockDataToCsv = vi.mocked(dataToCsv);
const mockZipFile = vi.mocked(ZipFile);

describe('makeZip', () => {
  const mockZip: Pick<ZipFile, 'addBuffer' | 'end'> = {
    addBuffer: vi.fn(),
    end: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockZipFile.mockReturnValue(mockZip as ZipFile);
    mockDataToCsv.mockReturnValue('mocked,csv,data');
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  it('should create a ZIP file with CSV data', () => {
    const mockData = {
      department: [
        {
          DepartmentTypeId: 'dept-1',
          ParentId: '1',
          CreatedAtTimestamp: '2023-01-01T00:00:00Z',
          ModifiedAtTimestamp: '2023-01-01T00:00:00Z',
          ModifiedByUser: 'HR',
          CreatedByUser: 'System',
        },
      ],
      owner: [
        {
          UserId: 'user-1',
          ParentId: '1',
          CreatedAtTimestamp: '2023-01-01T00:00:00Z',
          ModifiedAtTimestamp: '2023-01-01T00:00:00Z',
          ModifiedByUser: 'Alice',
          CreatedByUser: 'System',
        },
      ],
    };

    const result = makeZip(mockData as unknown as GetNormalisedExportDataQuery);

    expect(mockZipFile).toHaveBeenCalled();
    expect(mockDataToCsv).toHaveBeenCalledTimes(2);
    expect(mockDataToCsv).toHaveBeenCalledWith(mockData.department, [
      'CustomAttributeData',
    ]);
    expect(mockDataToCsv).toHaveBeenCalledWith(mockData.owner, [
      'CustomAttributeData',
    ]);

    expect(mockZip.addBuffer).toHaveBeenCalledTimes(2);
    expect(mockZip.addBuffer).toHaveBeenCalledWith(
      Buffer.from('mocked,csv,data'),
      'department.csv'
    );
    expect(mockZip.addBuffer).toHaveBeenCalledWith(
      Buffer.from('mocked,csv,data'),
      'owner.csv'
    );

    expect(mockLogger.info).toHaveBeenNthCalledWith(1, 'Generating ZIP file');
    expect(mockLogger.info).toHaveBeenNthCalledWith(
      2,
      'ZIP file generation completed'
    );

    expect(mockZip.end).toHaveBeenCalled();
    expect(result).toBe(mockZip);
  });

  it('should skip and log invalid properties', () => {
    const mockData = {
      department: [
        {
          DepartmentTypeId: 'dept-1',
          ParentId: '1',
          CreatedAtTimestamp: '2023-01-01T00:00:00Z',
          ModifiedAtTimestamp: '2023-01-01T00:00:00Z',
          ModifiedByUser: 'HR',
          CreatedByUser: 'System',
        },
      ],
      attestation_group: undefined,
      control_parent: [],
    };

    makeZip(mockData as unknown as GetNormalisedExportDataQuery);

    expect(mockDataToCsv).toHaveBeenCalledTimes(1);
    expect(mockZip.addBuffer).toHaveBeenCalledTimes(1);
    expect(mockZip.addBuffer).toHaveBeenCalledWith(
      Buffer.from('mocked,csv,data'),
      'department.csv'
    );

    expect(mockLogger.info).toHaveBeenNthCalledWith(
      2,
      'Skipping empty or invalid data objects',
      {
        count: 2,
        skipped: 'attestation_group, control_parent',
      }
    );
  });

  it('should exclude CustomAttributeData column when converting to CSV', () => {
    const mockData = {
      department: [
        {
          DepartmentTypeId: 'dept-1',
          ParentId: '1',
          CreatedAtTimestamp: '2023-01-01T00:00:00Z',
          ModifiedAtTimestamp: '2023-01-01T00:00:00Z',
          ModifiedByUser: 'HR',
          CreatedByUser: 'System',
        },
      ],
    };

    makeZip(mockData as unknown as GetNormalisedExportDataQuery);

    expect(mockDataToCsv).toHaveBeenCalledWith(mockData.department, [
      'CustomAttributeData',
    ]);
  });
});
