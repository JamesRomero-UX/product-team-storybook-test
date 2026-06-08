import axios, { AxiosError } from 'axios';

import {
  type ApiRequestContext,
  createCachedSsmParameter,
  getRequestHeaders,
  getUrlFromSsmParam,
} from '../clients/client-utils';
import { logger } from '../utils/logger';
import type { CachedSsmParameter } from '../utils/ssm-parameter-client';

// Lazy-initialized SSM parameter client — defers SSM call until first use
let aiFeedbackUrlParam: CachedSsmParameter | null = null;

export type Workstream = 'ai-assistant' | 'workflow';

export type FeedbackType = 'thumbs_up' | 'thumbs_down';

interface BaseFeedback {
  observabilityRunId: string;
  feedbackType: FeedbackType;
  comment?: string | null;
}

export interface FeedbackRequest {
  workstream: Workstream;
  feedback: AiAssistantFeedback | WorkflowFeedback;
}

export interface AiAssistantFeedback extends BaseFeedback {
  sessionId: string;
  responseId: string;
  userQuery?: string | null;
  aiResponse?: string | null;
}

export interface WorkflowFeedback extends BaseFeedback {
  workflowName: string;
}

export interface FeedbackResponse {
  error?: string;
  code?: string;
  details?: string;
  success?: boolean;
  feedbackId?: string;
}

/**
 * Gets the AI feedback API URL from SSM Parameter Store.
 * In local dev, the SSM mock (scripts/local-mocks/ssm-mock.js) serves
 * the URL via AWS_ENDPOINT_URL_SSM.
 */
async function getAiFeedbackApiUrl(): Promise<string> {
  if (!aiFeedbackUrlParam) {
    aiFeedbackUrlParam = createCachedSsmParameter(
      'AI_FEEDBACK_API_URL_SSM_PARAM'
    );
  }

  return await getUrlFromSsmParam(aiFeedbackUrlParam);
}

export async function submitFeedback(
  context: ApiRequestContext,
  feedback: FeedbackRequest
): Promise<{ data: FeedbackResponse; status: number }> {
  const { tenant, userId } = context;
  let baseUrl = await getAiFeedbackApiUrl();
  baseUrl = baseUrl.replace(/\/$/, '');

  const url = `${baseUrl}/feedback`;

  const baseHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-tenant-id': tenant,
    'x-user-id': userId,
  };

  const bodyString = JSON.stringify(feedback);
  const headers = await getRequestHeaders(url, 'POST', baseHeaders, bodyString);

  logger.info(
    {
      url,
    },
    'Attempting to send feedback'
  );

  try {
    const response = await axios.post<FeedbackResponse>(url, feedback, {
      headers,
    });

    logger.info({ status: response.status }, 'Feedback successfully sent');

    return { data: response.data, status: response.status };
  } catch (error) {
    if (error instanceof AxiosError) {
      logger.error(
        {
          url,
          status: error.response?.status,
          error: error.response?.data as unknown,
        },
        'Feedback failed to send'
      );

      if (error.response) {
        return {
          data: error.response.data as FeedbackResponse,
          status: error.response.status,
        };
      }
    }

    throw error;
  }
}
