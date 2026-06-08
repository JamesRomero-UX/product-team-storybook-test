import { Logger } from '@aws-lambda-powertools/logger';
import { wrapHandler } from '@sentry/aws-serverless';
import type {
  APIGatewayProxyEventV2WithJWTAuthorizer,
  APIGatewayProxyResultV2,
} from 'aws-lambda';
import { createFeedbackStreamAdaptor } from 'src/adapters/firehose/feedback-stream';
import { getLangSmithConfig } from 'src/adapters/langsmith/config';
import { createLangSmithAdaptor } from 'src/adapters/langsmith/langsmith-client';
import { FeedbackIngestionError } from 'src/domain/errors';
import type { AIAssistantFeedbackService } from 'src/domain/services/ingest-ai-assistant-feedback-service';
import { createAIAssistantFeedbackService } from 'src/domain/services/ingest-ai-assistant-feedback-service';
import type { WorkflowFeedbackService } from 'src/domain/services/ingest-workflow-feedback-service';
import { createWorkflowFeedbackService } from 'src/domain/services/ingest-workflow-feedback-service';
import type {
  FeedbackObservabilityPublisher,
  FeedbackStoragePublisher,
} from 'src/domain/types';
import { ingestFeedbackRequestSchema } from 'src/domain/types';
import { getEnv } from 'src/lib';

const logger = new Logger({ serviceName: 'ai-feedback-ingestion' });

// Lazy-initialized dependencies (populated on first request)
let feedbackStoragePublisher: FeedbackStoragePublisher | null = null;
let feedbackObservabilityPublisher: FeedbackObservabilityPublisher | null =
  null;
let aiAssistantService: AIAssistantFeedbackService | null = null;
let workflowService: WorkflowFeedbackService | null = null;

interface Services {
  aiAssistantService: AIAssistantFeedbackService;
  workflowService: WorkflowFeedbackService;
}

const initializeDependencies = async (): Promise<Services> => {
  if (aiAssistantService && workflowService) {
    return { aiAssistantService, workflowService: workflowService };
  }

  const langSmithConfig = await getLangSmithConfig();

  feedbackObservabilityPublisher = createLangSmithAdaptor(langSmithConfig);

  feedbackStoragePublisher = createFeedbackStreamAdaptor({
    deliveryStreamPrefix: getEnv('DELIVERY_STREAM_PREFIX'),
  });

  aiAssistantService = createAIAssistantFeedbackService({
    feedbackStoragePublisher,
    feedbackObservabilityPublisher,
  });

  workflowService = createWorkflowFeedbackService({
    feedbackStoragePublisher,
    feedbackObservabilityPublisher,
  });

  return { aiAssistantService, workflowService: workflowService };
};

const baseHandler = async (
  event: APIGatewayProxyEventV2WithJWTAuthorizer
): Promise<APIGatewayProxyResultV2> => {
  try {
    // Initialize dependencies (lazy, cached after first call)
    const { aiAssistantService, workflowService } =
      await initializeDependencies();

    // Extract tenant and user from headers (set by calling service e.g. tRPC)
    // Case-insensitive lookup — SAM local preserves original casing
    const getHeader = (name: string): string | undefined => {
      const lower = name.toLowerCase();
      for (const [key, value] of Object.entries(event.headers)) {
        if (key.toLowerCase() === lower) {
          return value;
        }
      }

      return undefined;
    };
    const tenantId = getHeader('x-tenant-id');
    const userId = getHeader('x-user-id');

    if (!tenantId || !userId) {
      logger.warn('Missing required headers', {
        hasTenantId: !!tenantId,
        hasUserId: !!userId,
      });

      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Missing required headers: x-tenant-id, x-user-id',
        }),
      };
    }

    // Parse and validate request body
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Request body is required' }),
      };
    }

    const body = JSON.parse(event.body);
    const parseResult = ingestFeedbackRequestSchema.safeParse(body);

    if (!parseResult.success) {
      logger.warn('Invalid request body', {
        errors: parseResult.error.flatten(),
      });

      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Invalid request body',
          details: parseResult.error.flatten(),
        }),
      };
    }

    // Route to appropriate service based on workstream
    const request = parseResult.data;
    const feedback = await (request.workstream === 'ai-assistant'
      ? aiAssistantService.ingest(tenantId, userId, request.feedback)
      : workflowService.ingest(tenantId, userId, request.feedback));

    logger.info('Feedback ingested successfully', {
      feedbackId: feedback.id,
      workstream: feedback.workstream,
      tenantId,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        feedbackId: feedback.id,
      }),
    };
  } catch (error) {
    logger.error('Failed to ingest feedback', { error });

    // Handle known error types
    if (error instanceof FeedbackIngestionError) {
      return {
        statusCode: error.statusCode,
        body: JSON.stringify({
          error: error.message,
          code: error.code,
          ...(error.context && { details: error.context }),
        }),
      };
    }

    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Invalid JSON in request body',
          code: 'INVALID_JSON',
        }),
      };
    }

    // Unknown errors - log but don't expose details
    logger.error('Unexpected error during feedback ingestion', {
      error,
      errorType: error instanceof Error ? error.constructor.name : typeof error,
    });

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
      }),
    };
  }
};

export const handler = wrapHandler(baseHandler);
