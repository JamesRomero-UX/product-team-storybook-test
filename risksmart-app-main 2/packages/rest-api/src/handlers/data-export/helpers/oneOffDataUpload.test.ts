import type { GetNormalisedExportDataQuery } from 'generated/graphql';
import { getEnv } from 'src/environment';
import { getS3PresignedUrlForDownload, uploadFile } from 'src/s3Services';
import { afterAll, beforeEach, describe, expect, test, vi } from 'vitest';

import { uploadData } from './oneOffDataUpload';

vi.mock('src/environment', () => ({
  getEnv: vi.fn(),
}));

vi.mock('src/s3Services', () => ({
  uploadFile: vi.fn(),
  getS3PresignedUrlForDownload: vi.fn(),
}));

vi.mock('src/logger', () => ({
  getLogger: vi.fn(() => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  })),
}));

const mockGetEnv = vi.mocked(getEnv);
const mockUploadFile = vi.mocked(uploadFile);
const mockGetS3PresignedUrlForDownload = vi.mocked(
  getS3PresignedUrlForDownload
);

describe('uploadData', () => {
  const mockData: GetNormalisedExportDataQuery = {
    acceptance_parent: [
      {
        Id: 'test',
        ParentId: 'test',
        CreatedAtTimestamp: 'test',
        ModifiedAtTimestamp: 'test',
        ModifiedByUser: 'test',
        CreatedByUser: 'test',
      },
    ],
    action_parent: [
      {
        ActionId: 'test',
        ParentId: 'test',
        CreatedAtTimestamp: 'test',
        ModifiedAtTimestamp: 'test',
        ModifiedByUser: 'test',
        CreatedByUser: 'test',
      },
    ],
  } as GetNormalisedExportDataQuery;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2023-10-15T10:30:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  test('should successfully upload data and return presigned URL', async () => {
    const orgKey = 'test-org';
    const expiresInSeconds = 3600;
    const expectedBucket = 'test-bucket';
    const expectedPresignedUrl = 'https://test-url.com';
    const expectedKey = `${orgKey}/2023-10-15.zip`;

    mockGetEnv.mockReturnValue(expectedBucket);
    mockUploadFile.mockResolvedValue(undefined);
    mockGetS3PresignedUrlForDownload.mockResolvedValue(expectedPresignedUrl);

    const result = await uploadData({
      data: mockData,
      orgKey,
      expiresInSeconds,
    });

    expect(mockGetEnv).toHaveBeenCalledWith('DATA_EXPORT_BUCKET');
    expect(mockUploadFile).toHaveBeenCalledWith({
      org: orgKey,
      bucket: expectedBucket,
      key: expectedKey,
      data: expect.any(Object), // Readable stream
      contentType: 'application/zip',
    });
    expect(mockGetS3PresignedUrlForDownload).toHaveBeenCalledWith({
      org: orgKey,
      bucket: expectedBucket,
      key: expectedKey,
      expiresInSeconds,
    });
    expect(result).toBe(expectedPresignedUrl);
  });

  test('should throw error when DATA_EXPORT_BUCKET environment variable is not set', async () => {
    mockGetEnv.mockReturnValue('');

    await expect(
      uploadData({
        data: mockData,
        orgKey: 'test-org',
        expiresInSeconds: 3600,
      })
    ).rejects.toThrow(
      'DATA_EXPORT_BUCKET environment variable is not configured'
    );
  });

  test('should handle upload file error and rethrow', async () => {
    const uploadError = new Error('S3 upload failed');
    mockGetEnv.mockReturnValue('test-bucket');
    mockUploadFile.mockRejectedValue(uploadError);

    await expect(
      uploadData({
        data: mockData,
        orgKey: 'test-org',
        expiresInSeconds: 3600,
      })
    ).rejects.toThrow('S3 upload failed');

    expect(mockGetS3PresignedUrlForDownload).not.toHaveBeenCalled();
  });

  test('should handle presigned URL generation error and rethrow', async () => {
    const presignedUrlError = new Error('Presigned URL generation failed');
    mockGetEnv.mockReturnValue('test-bucket');
    mockUploadFile.mockResolvedValue(undefined);
    mockGetS3PresignedUrlForDownload.mockRejectedValue(presignedUrlError);

    await expect(
      uploadData({
        data: mockData,
        orgKey: 'test-org',
        expiresInSeconds: 3600,
      })
    ).rejects.toThrow('Presigned URL generation failed');
  });

  test('should generate correct file key with timestamp', async () => {
    const orgKey = 'my-org-123';
    const expectedKey = `${orgKey}/2023-10-15.zip`;

    mockGetEnv.mockReturnValue('test-bucket');
    mockUploadFile.mockResolvedValue(undefined);
    mockGetS3PresignedUrlForDownload.mockResolvedValue('test-url');

    await uploadData({
      data: mockData,
      orgKey,
      expiresInSeconds: 3600,
    });

    expect(mockUploadFile).toHaveBeenCalledWith(
      expect.objectContaining({
        key: expectedKey,
      })
    );
  });
});
