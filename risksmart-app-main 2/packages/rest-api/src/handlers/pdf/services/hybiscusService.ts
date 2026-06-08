import { HybiscusClient, isHybiscusAPIError } from '@hybiscus/api';
import { getEnv } from 'src/environment';
import type { PdfGenerationOptions, PdfTemplate } from 'src/handlers/pdf/types';
import { getLogger } from 'src/logger';
import { Config } from 'sst/node/config';

const logger = getLogger();

const HYBISCUS_BASE_URL = getEnv('HYBISCUS_API_URL');
const HYBISCUS_API_KEY = Config.HYBISCUS_API_KEY || '';

// Stateless approach for serverless: do not store filenames in memory.
const hybiscusClient = new HybiscusClient({
  apiKey: HYBISCUS_API_KEY,
  asyncBaseURL: HYBISCUS_BASE_URL,
  timeout: 55000,
});

interface HybiscusApiError {
  taskID?: string;
  status?: string;
  error?: unknown;
}

export interface GeneratePdfWithHybiscusParams {
  template: PdfTemplate;
  data: Record<string, unknown>;
  options: PdfGenerationOptions;
  context: {
    tenant: string;
    orgKey: string;
  };
}

export async function generatePdfWithHybiscus({
  template,
  data,
  options,
  context,
}: GeneratePdfWithHybiscusParams): Promise<{
  taskId: string;
  status: string;
  downloadUrl?: string;
}> {
  try {
    const report = await template.buildConfig({ data, options, context });

    logger.info('Submitting PDF generation to Hybiscus', {
      templateId: template.id,
    });

    const buildResponse = await hybiscusClient.buildReport({ report });

    logger.info('PDF generation task created', {
      taskId: buildResponse.taskID,
      status: buildResponse.status,
    });

    return {
      taskId: buildResponse.taskID || '',
      status: buildResponse.status || 'UNKNOWN',
      // Do not expose raw third-party URL directly; downstream uses our proxy with token
      downloadUrl: undefined,
    };
  } catch (error) {
    if (isHybiscusAPIError(error)) {
      const e = error as HybiscusApiError;
      logger.error('Hybiscus API error', {
        taskID: e.taskID,
        status: e.status,
        error: e.error,
      });
    } else {
      logger.error('Hybiscus PDF generation failed', {
        error: error as Error,
        message: (error as Error).message,
      });
    }

    throw new Error('Failed to submit PDF generation request to Hybiscus');
  }
}

export async function getTaskStatus(
  taskId: string,
  options: { waitForCompletion?: boolean } = {}
): Promise<{
  status: string;
  downloadUrl?: string;
  errorMessage?: string;
}> {
  try {
    let result;

    if (options.waitForCompletion) {
      logger.info('Waiting for task completion using SDK', { taskId });
      result = await hybiscusClient.api.waitForTaskSuccess(taskId);
    } else {
      logger.info('Checking task status from Hybiscus', { taskId });
      result = await hybiscusClient.api.getTaskStatus(taskId);
    }

    logger.info('Retrieved task status from Hybiscus', {
      taskId,
      status: result.status,
      waitForCompletion: options.waitForCompletion,
    });

    if (result.status === 'SUCCESS') {
      const reportResult = await getReport(taskId);

      return {
        status: result.status,
        downloadUrl: reportResult.downloadUrl,
      };
    }

    if (result.status === 'FAILED') {
      return {
        status: result.status,
        errorMessage: 'PDF generation failed',
      };
    }

    return { status: result.status || 'UNKNOWN' };
  } catch (error) {
    if (isHybiscusAPIError(error)) {
      const e = error as HybiscusApiError;
      logger.error('Hybiscus API error while checking status', {
        taskId,
        error: e.error,
        status: e.status,
        waitForCompletion: options.waitForCompletion,
      });
    } else {
      logger.error('Failed to get task status from Hybiscus', {
        error: error as Error,
        message: (error as Error).message,
        taskId,
        waitForCompletion: options.waitForCompletion,
      });
    }

    throw new Error('Failed to get PDF generation status');
  }
}

export async function getReport(taskId: string): Promise<{
  downloadUrl: string;
  contentType: string;
}> {
  try {
    const downloadUrl = `${HYBISCUS_BASE_URL}/get-report?task_id=${taskId}&api_key=${HYBISCUS_API_KEY}`;

    logger.info('Generated PDF download URL', { taskId });

    return {
      downloadUrl,
      contentType: 'application/pdf',
    };
  } catch (error) {
    logger.error('Failed to get report from Hybiscus', error as Error);
    throw new Error('Failed to retrieve PDF report');
  }
}
