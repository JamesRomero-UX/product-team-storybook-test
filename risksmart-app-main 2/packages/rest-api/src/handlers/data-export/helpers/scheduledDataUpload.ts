import dayjs from 'dayjs';
import type {
  GetNormalisedExportDataQuery,
  GetNormalisedRelianceBankExportDataQuery,
} from 'generated/graphql';
import { getLogger } from 'src/logger';
import Client from 'ssh2-sftp-client';
import { Readable } from 'stream';

import type { SftpCredentials, SharePointCredentials } from '../types';
import { getMicrosoftGraphApiAccessToken } from './authUtils';
import { makeZip } from './makeZip';
import { isUrl } from './urlUtils';

const logger = getLogger();

type ExportData =
  | GetNormalisedExportDataQuery
  | GetNormalisedRelianceBankExportDataQuery;
type Credentials = SharePointCredentials | SftpCredentials;

interface DataUploadStrategy {
  upload(data: ExportData): Promise<void>;
}

class SharePointUploadStrategy implements DataUploadStrategy {
  constructor(private credentials: SharePointCredentials) {}

  async upload(data: ExportData): Promise<void> {
    const { sharePointDriveId, sharePointSiteId, sPFolder } = this.credentials;

    if (isUrl(sPFolder)) {
      throw new Error(`Folder path contains URL: ${sPFolder}`);
    }

    const folder = sPFolder || 'Scheduled data export';
    const zipFileName = `${dayjs().format('YYYY-MM-DD_HH-mm-ss')}.zip`;

    let accessToken: string;

    try {
      accessToken = await getMicrosoftGraphApiAccessToken(this.credentials);
    } catch (error) {
      logger.error('Failed to get Microsoft Graph API access token');
      throw new Error(`Authentication failed: ${(error as Error).message}`);
    }

    try {
      logger.info('Creating zip file from export data');
      const zip = makeZip(data);

      // Convert zip stream to buffer for SharePoint upload
      const chunks: Buffer[] = [];
      const stream = Readable.from(zip.outputStream as AsyncIterable<Buffer>);

      for await (const chunk of stream) {
        chunks.push(chunk);
      }

      const zipBuffer = Buffer.concat(chunks);
      logger.info('Zip file created successfully', {
        zipBufferSize: zipBuffer.length,
      });

      const uploadUrl = `https://graph.microsoft.com/v1.0/sites/${sharePointSiteId}/drives/${sharePointDriveId}/root:/${folder}/${zipFileName}:/content`;

      const response = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/zip',
        },
        body: zipBuffer,
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        const error = new Error(
          `HTTP ${response.status}: ${response.statusText}`
        ) as Error & { status: number; body: unknown };
        error.status = response.status;
        error.body = errorBody;

        logger.error('Zip file failed upload', {
          zipFileName,
          status: response.status,
          body: errorBody,
        });

        throw error;
      }

      logger.info('Zip file successfully uploaded to SharePoint', {
        zipFileName,
        uploadUrl,
      });
    } catch (error) {
      logger.error('Error in SharePoint upload process', error as Error);
      throw error;
    }
  }
}

class SftpUploadStrategy implements DataUploadStrategy {
  constructor(private credentials: SftpCredentials) {}

  async upload(data: ExportData): Promise<void> {
    const { hostname, port, username, password, sftpFolder } = this.credentials;

    if (isUrl(sftpFolder)) {
      throw new Error(`Folder path contains URL: ${sftpFolder}`);
    }

    const folder = sftpFolder || 'scheduled-data-export';
    const zipFileName = `${dayjs().format('YYYY-MM-DD_HH-mm-ss')}.zip`;
    const remotePath = `${folder}/${zipFileName}`;

    const sftp = new Client();

    try {
      await sftp.connect({
        host: hostname,
        port,
        username,
        password,
        readyTimeout: 30000,
        keepaliveInterval: 10000,
        keepaliveCountMax: 3,
      });

      logger.info('Connected to SFTP server', {
        hostname,
        port,
      });

      await sftp.mkdir(folder, true);
      logger.info('Created remote directory', {
        folder,
      });

      logger.info('Creating zip file from export data');
      const zip = makeZip(data);

      // Convert zip stream to buffer for SFTP upload
      const chunks: Buffer[] = [];
      const stream = Readable.from(zip.outputStream as AsyncIterable<Buffer>);

      for await (const chunk of stream) {
        chunks.push(chunk);
      }

      const zipBuffer = Buffer.concat(chunks);
      logger.info('Zip file created successfully', {
        zipBufferSize: zipBuffer.length,
      });

      await sftp.put(zipBuffer, remotePath);
      logger.info('SFTP export completed successfully', {
        zipFileName,
        remotePath,
      });
    } catch (error) {
      logger.error('Error in SFTP connection or upload process');
      throw this.createSftpError(error as Error, hostname, port, username);
    } finally {
      await this.closeSftpConnection(sftp);
    }
  }

  private createSftpError(
    error: Error,
    hostname: string,
    port: number,
    username: string
  ): Error {
    const errorMessage = error.message;

    if (errorMessage.includes('getConnection: Timed out')) {
      return new Error(
        `SFTP connection timeout to ${hostname}:${port}. Please verify the hostname, port, and network connectivity.`
      );
    }

    if (errorMessage.includes('All configured authentication methods failed')) {
      return new Error(
        `SFTP authentication failed for user ${username}. Please verify the credentials.`
      );
    }

    if (errorMessage.includes('connect ECONNREFUSED')) {
      return new Error(
        `SFTP connection refused to ${hostname}:${port}. Please verify the server is running and accessible.`
      );
    }

    return new Error(`SFTP upload process failed: ${errorMessage}`);
  }

  private async closeSftpConnection(sftp: Client): Promise<void> {
    try {
      await sftp.end();
      logger.info('SFTP connection closed successfully');
    } catch (endError) {
      logger.warn('Error closing SFTP connection', endError as Error);
    }
  }
}

const createUploadStrategy = (credentials: Credentials): DataUploadStrategy => {
  if ('sharePointSiteId' in credentials) {
    return new SharePointUploadStrategy(credentials);
  } else if ('hostname' in credentials) {
    return new SftpUploadStrategy(credentials);
  } else {
    throw new Error('Unknown credentials type');
  }
};

export const uploadData = async (
  data: ExportData,
  credentials: Credentials
): Promise<void> => {
  const strategy = createUploadStrategy(credentials);
  await strategy.upload(data);
};
