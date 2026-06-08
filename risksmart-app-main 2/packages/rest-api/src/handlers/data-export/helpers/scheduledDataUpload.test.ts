import dayjs from 'dayjs';
import type { GetNormalisedExportDataQuery } from 'generated/graphql';
import { Readable } from 'stream';
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { mockDeep } from 'vitest-mock-extended';
import type { ZipFile } from 'yazl';

import type { SftpCredentials, SharePointCredentials } from '../types';
import { getMicrosoftGraphApiAccessToken } from './authUtils';
import { makeZip } from './makeZip';
import { uploadData } from './scheduledDataUpload';

vi.mock('./authUtils');
vi.mock('./makeZip');
vi.mock('src/logger', () => ({
  getLogger: vi.fn(() => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  })),
}));

const mockSftpClient = {
  connect: vi.fn(),
  mkdir: vi.fn(),
  put: vi.fn(),
  end: vi.fn(),
};

vi.mock('ssh2-sftp-client', () => ({
  default: vi.fn(() => mockSftpClient),
}));

const getMicrosoftGraphApiAccessTokenMock = vi.mocked(
  getMicrosoftGraphApiAccessToken
);
const makeZipMock = vi.mocked(makeZip);

describe('Data uploader', () => {
  const mockSharePointCredentials: SharePointCredentials = {
    tenant: 'test-tenant',
    orgKey: 'test-org',
    entraSecretValue: 'testSecretValue',
    entraClientId: 'testClientId',
    entraTenantId: 'testTenantId',
    sharePointSiteId: 'testPointSiteId',
    sharePointDriveId: 'testPointDriveId',
    sPFolder: 'test-folder',
  };

  const mockSftpCredentials: SftpCredentials = {
    tenant: 'test-tenant',
    orgKey: 'test-org',
    hostname: 'sftp.example.com',
    port: 22,
    username: 'testuser',
    password: 'testpass',
    sftpFolder: 'test-folder',
  };

  const NOW = dayjs();
  const MOCK_TIMESTAMP = NOW.subtract(1, 'hour').toISOString();
  const mockedFetch = vi.fn();

  beforeAll(() => {
    global.fetch = mockedFetch;
    vi.setSystemTime(NOW.toISOString());
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterAll(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('uploadData with Strategy pattern', () => {
    describe('SharePoint upload strategy', () => {
      it('should upload to SharePoint when SharePoint credentials are provided', async () => {
        const data = mockDeep<GetNormalisedExportDataQuery>({
          risk: [{ CreatedAtTimestamp: MOCK_TIMESTAMP }],
          contributor: [{ CreatedAtTimestamp: MOCK_TIMESTAMP }],
        });

        const mockZipBuffer = Buffer.from('mock zip content');
        const mockStream = Readable.from([mockZipBuffer]);
        makeZipMock.mockReturnValue({
          outputStream: mockStream,
        } as unknown as ZipFile);

        getMicrosoftGraphApiAccessTokenMock.mockResolvedValueOnce(
          'mocked access token'
        );
        mockedFetch.mockResolvedValue({ ok: true });

        await uploadData(data, mockSharePointCredentials);

        expect(getMicrosoftGraphApiAccessTokenMock).toHaveBeenCalledWith(
          mockSharePointCredentials
        );
        expect(makeZipMock).toHaveBeenCalledWith(data);
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining(
            'https://graph.microsoft.com/v1.0/sites/testPointSiteId/drives/testPointDriveId/root:/test-folder/'
          ),
          expect.objectContaining({
            method: 'PUT',
            headers: {
              Authorization: 'Bearer mocked access token',
              'Content-Type': 'application/zip',
            },
            body: mockZipBuffer,
          })
        );
      });

      it('should use default folder for SharePoint when sPFolder is not provided', async () => {
        const data = mockDeep<GetNormalisedExportDataQuery>({
          risk: [{ CreatedAtTimestamp: MOCK_TIMESTAMP }],
        });

        const credentialsWithoutFolder = {
          ...mockSharePointCredentials,
          sPFolder: undefined,
        };

        const mockZipBuffer = Buffer.from('mock zip content');
        const mockStream = Readable.from([mockZipBuffer]);
        makeZipMock.mockReturnValue({
          outputStream: mockStream,
        } as unknown as ZipFile);

        getMicrosoftGraphApiAccessTokenMock.mockResolvedValueOnce(
          'mocked access token'
        );
        mockedFetch.mockResolvedValue({ ok: true });

        await uploadData(data, credentialsWithoutFolder);

        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/root:/Scheduled data export/'),
          expect.any(Object)
        );
      });

      it('should handle SharePoint authentication errors through strategy', async () => {
        const data = mockDeep<GetNormalisedExportDataQuery>({
          contributor: [{ CreatedAtTimestamp: MOCK_TIMESTAMP }],
        });

        getMicrosoftGraphApiAccessTokenMock.mockRejectedValueOnce(
          new Error('Invalid credentials')
        );

        await expect(
          uploadData(data, mockSharePointCredentials)
        ).rejects.toThrow('Authentication failed: Invalid credentials');

        expect(global.fetch).not.toHaveBeenCalled();
      });

      it('should handle SharePoint upload failure with non-ok response', async () => {
        const data = mockDeep<GetNormalisedExportDataQuery>({
          risk: [{ CreatedAtTimestamp: MOCK_TIMESTAMP }],
        });

        const mockZipBuffer = Buffer.from('mock zip content');
        const mockStream = Readable.from([mockZipBuffer]);
        makeZipMock.mockReturnValue({
          outputStream: mockStream,
        } as unknown as ZipFile);

        getMicrosoftGraphApiAccessTokenMock.mockResolvedValueOnce(
          'mocked access token'
        );
        mockedFetch.mockResolvedValue({
          ok: false,
          status: 403,
          statusText: 'Forbidden',
          json: vi.fn().mockResolvedValue({ error: 'Access denied' }),
        });

        await expect(
          uploadData(data, mockSharePointCredentials)
        ).rejects.toThrow('HTTP 403: Forbidden');
      });

      it('should handle SharePoint fetch network errors', async () => {
        const data = mockDeep<GetNormalisedExportDataQuery>({
          risk: [{ CreatedAtTimestamp: MOCK_TIMESTAMP }],
        });

        const mockZipBuffer = Buffer.from('mock zip content');
        const mockStream = Readable.from([mockZipBuffer]);
        makeZipMock.mockReturnValue({
          outputStream: mockStream,
        } as unknown as ZipFile);

        getMicrosoftGraphApiAccessTokenMock.mockResolvedValueOnce(
          'mocked access token'
        );
        mockedFetch.mockRejectedValue(new Error('Network error'));

        await expect(
          uploadData(data, mockSharePointCredentials)
        ).rejects.toThrow('Network error');
      });

      it('should throw an error when SharePoint folder contains a URL', async () => {
        const data = mockDeep<GetNormalisedExportDataQuery>({
          risk: [{ CreatedAtTimestamp: MOCK_TIMESTAMP }],
        });

        const credentialsWithUrlFolder: SharePointCredentials = {
          ...mockSharePointCredentials,
          sPFolder: 'https://example.com/folder',
        };

        await expect(
          uploadData(data, credentialsWithUrlFolder)
        ).rejects.toThrow(
          'Folder path contains URL: https://example.com/folder'
        );

        // Should fail before attempting auth or fetch
        expect(getMicrosoftGraphApiAccessTokenMock).not.toHaveBeenCalled();
        expect(global.fetch).not.toHaveBeenCalled();
      });
    });

    describe('SFTP upload strategy', () => {
      it('should upload to SFTP when SFTP credentials are provided', async () => {
        const data = mockDeep<GetNormalisedExportDataQuery>({
          risk: [{ CreatedAtTimestamp: MOCK_TIMESTAMP }],
          contributor: [{ CreatedAtTimestamp: MOCK_TIMESTAMP }],
        });

        const mockZipBuffer = Buffer.from('mock zip content');
        const mockStream = Readable.from([mockZipBuffer]);
        makeZipMock.mockReturnValue({
          outputStream: mockStream,
        } as unknown as ZipFile);

        mockSftpClient.connect.mockResolvedValue(undefined);
        mockSftpClient.mkdir.mockResolvedValue(undefined);
        mockSftpClient.put.mockResolvedValue(undefined);
        mockSftpClient.end.mockResolvedValue(undefined);

        await uploadData(data, mockSftpCredentials);

        expect(mockSftpClient.connect).toHaveBeenCalledWith({
          host: 'sftp.example.com',
          port: 22,
          username: 'testuser',
          password: 'testpass',
          readyTimeout: 30000,
          keepaliveInterval: 10000,
          keepaliveCountMax: 3,
        });
        expect(makeZipMock).toHaveBeenCalledWith(data);
        expect(mockSftpClient.put).toHaveBeenCalledWith(
          mockZipBuffer,
          expect.stringMatching(
            /^test-folder\/\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}\.zip$/
          )
        );
      });

      it('should successfully handle SFTP upload with all steps', async () => {
        const data = mockDeep<GetNormalisedExportDataQuery>({
          risk: [{ CreatedAtTimestamp: MOCK_TIMESTAMP }],
          contributor: [{ CreatedAtTimestamp: MOCK_TIMESTAMP }],
        });

        const mockZipBuffer = Buffer.from('mock zip content');
        const mockStream = Readable.from([mockZipBuffer]);
        makeZipMock.mockReturnValue({
          outputStream: mockStream,
        } as unknown as ZipFile);

        mockSftpClient.connect.mockResolvedValue(undefined);
        mockSftpClient.mkdir.mockResolvedValue(undefined);
        mockSftpClient.put.mockResolvedValue(undefined);
        mockSftpClient.end.mockResolvedValue(undefined);

        await uploadData(data, mockSftpCredentials);

        expect(mockSftpClient.connect).toHaveBeenCalledWith({
          host: 'sftp.example.com',
          port: 22,
          username: 'testuser',
          password: 'testpass',
          readyTimeout: 30000,
          keepaliveInterval: 10000,
          keepaliveCountMax: 3,
        });
        expect(mockSftpClient.mkdir).toHaveBeenCalledWith('test-folder', true);
        expect(makeZipMock).toHaveBeenCalledWith(data);
        expect(mockSftpClient.put).toHaveBeenCalledWith(
          mockZipBuffer,
          expect.stringMatching(
            /^test-folder\/\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}\.zip$/
          )
        );
        expect(mockSftpClient.end).toHaveBeenCalledTimes(1);
      });

      it('should handle SFTP connection timeout errors', async () => {
        const data = mockDeep<GetNormalisedExportDataQuery>({
          risk: [{ CreatedAtTimestamp: MOCK_TIMESTAMP }],
        });

        mockSftpClient.connect.mockRejectedValue(
          new Error('getConnection: Timed out while waiting for handshake')
        );

        await expect(uploadData(data, mockSftpCredentials)).rejects.toThrow(
          'SFTP connection timeout to sftp.example.com:22. Please verify the hostname, port, and network connectivity.'
        );

        expect(mockSftpClient.end).toHaveBeenCalledTimes(1);
      });

      it('should handle SFTP authentication errors', async () => {
        const data = mockDeep<GetNormalisedExportDataQuery>({
          risk: [{ CreatedAtTimestamp: MOCK_TIMESTAMP }],
        });

        mockSftpClient.connect.mockRejectedValue(
          new Error('All configured authentication methods failed')
        );

        await expect(uploadData(data, mockSftpCredentials)).rejects.toThrow(
          'SFTP authentication failed for user testuser. Please verify the credentials.'
        );

        expect(mockSftpClient.end).toHaveBeenCalledTimes(1);
      });

      it('should handle SFTP connection refused errors', async () => {
        const data = mockDeep<GetNormalisedExportDataQuery>({
          risk: [{ CreatedAtTimestamp: MOCK_TIMESTAMP }],
        });

        mockSftpClient.connect.mockRejectedValue(
          new Error('connect ECONNREFUSED 192.168.1.1:22')
        );

        await expect(uploadData(data, mockSftpCredentials)).rejects.toThrow(
          'SFTP connection refused to sftp.example.com:22. Please verify the server is running and accessible.'
        );

        expect(mockSftpClient.end).toHaveBeenCalledTimes(1);
      });

      it('should handle generic SFTP errors', async () => {
        const data = mockDeep<GetNormalisedExportDataQuery>({
          risk: [{ CreatedAtTimestamp: MOCK_TIMESTAMP }],
        });

        mockSftpClient.connect.mockRejectedValue(
          new Error('Some generic SFTP error')
        );

        await expect(uploadData(data, mockSftpCredentials)).rejects.toThrow(
          'SFTP upload process failed: Some generic SFTP error'
        );

        expect(mockSftpClient.end).toHaveBeenCalledTimes(1);
      });

      it('should handle SFTP connection cleanup errors gracefully', async () => {
        const data = mockDeep<GetNormalisedExportDataQuery>({
          risk: [{ CreatedAtTimestamp: MOCK_TIMESTAMP }],
        });

        mockSftpClient.connect.mockRejectedValue(
          new Error('Connection failed')
        );
        mockSftpClient.end.mockRejectedValue(
          new Error('End connection failed')
        );

        await expect(uploadData(data, mockSftpCredentials)).rejects.toThrow(
          'SFTP upload process failed: Connection failed'
        );

        expect(mockSftpClient.end).toHaveBeenCalledTimes(1);
      });

      it('should use default folder for SFTP when sftpFolder is not provided', async () => {
        const data = mockDeep<GetNormalisedExportDataQuery>({
          risk: [{ CreatedAtTimestamp: MOCK_TIMESTAMP }],
        });

        const credentialsWithoutFolder = {
          ...mockSftpCredentials,
          sftpFolder: undefined,
        };

        const mockZipBuffer = Buffer.from('mock zip content');
        const mockStream = Readable.from([mockZipBuffer]);
        makeZipMock.mockReturnValue({
          outputStream: mockStream,
        } as unknown as ZipFile);

        mockSftpClient.connect.mockResolvedValue(undefined);
        mockSftpClient.mkdir.mockResolvedValue(undefined);
        mockSftpClient.put.mockResolvedValue(undefined);
        mockSftpClient.end.mockResolvedValue(undefined);

        await uploadData(data, credentialsWithoutFolder);

        expect(mockSftpClient.mkdir).toHaveBeenCalledWith(
          'scheduled-data-export',
          true
        );
        expect(mockSftpClient.put).toHaveBeenCalledWith(
          mockZipBuffer,
          expect.stringMatching(
            /^scheduled-data-export\/\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}\.zip$/
          )
        );
      });

      it('should throw an error when SFTP folder contains a URL', async () => {
        const data = mockDeep<GetNormalisedExportDataQuery>({
          risk: [{ CreatedAtTimestamp: MOCK_TIMESTAMP }],
        });

        const credentialsWithUrlFolder: SftpCredentials = {
          ...mockSftpCredentials,
          sftpFolder: 'https://example.com/folder',
        };

        await expect(
          uploadData(data, credentialsWithUrlFolder)
        ).rejects.toThrow(
          'Folder path contains URL: https://example.com/folder'
        );

        // Should fail before attempting connection
        expect(mockSftpClient.connect).not.toHaveBeenCalled();
      });
    });
  });
});
