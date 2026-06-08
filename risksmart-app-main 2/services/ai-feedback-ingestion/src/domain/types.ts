import { v7 as uuidv7 } from 'uuid';
import { z } from 'zod';

import { ValidationError } from './errors';

// ============================================
// Type-safe Transform Helper
// ============================================

/**
 * Ensures compile-time key completeness when building objects for Zod parsing.
 * Use with `satisfies TypesafeTransform<typeof schema>` to catch missing keys.
 */
export type TypesafeTransform<T extends z.ZodTypeAny> = {
  [K in keyof z.input<T>]: unknown;
};

// ============================================
// Branded Type Schemas
// ============================================

export const feedbackIdSchema = z.string().uuid().brand('FeedbackId');
export type FeedbackId = z.infer<typeof feedbackIdSchema>;

export const tenantIdSchema = z.string().min(1).brand('TenantId');
export type TenantId = z.infer<typeof tenantIdSchema>;

export const userIdSchema = z.string().min(1).brand('UserId');
export type UserId = z.infer<typeof userIdSchema>;

export const observabilityRunIdSchema = z
  .string()
  .min(1)
  .brand('ObservabilityRunId');
export type ObservabilityRunId = z.infer<typeof observabilityRunIdSchema>;

export const timestampSchema = z.string().datetime().brand('Timestamp');
export type Timestamp = z.infer<typeof timestampSchema>;

// ============================================
// Base Feedback Types
// ============================================

export const feedbackTypeSchema = z.enum(['thumbs_up', 'thumbs_down']);
export type FeedbackType = Readonly<z.infer<typeof feedbackTypeSchema>>;

// ============================================
// Domain Interfaces (Ports)
// ============================================

/**
 * Port for publishing feedback to storage (e.g., Firehose/S3)
 */
export interface FeedbackStoragePublisher {
  publish: (tenantId: string, feedback: Feedback) => Promise<void>;
}

/**
 * Port for submitting feedback to observability platform
 */
export interface FeedbackObservabilityPublisher {
  submitFeedback: (params: {
    runId: string;
    score: number;
    comment?: string;
  }) => Promise<void>;
}

// ============================================
// AI Assistant Feedback Input (from API request)
// ============================================

export const aiAssistantFeedbackInputSchema = z.object({
  sessionId: z.string(),
  responseId: z.string(),
  observabilityRunId: z.string(),
  feedbackType: feedbackTypeSchema,
  comment: z.string().optional(),
  // Optional context for analytics
  userQuery: z.string().optional(),
  aiResponse: z.string().optional(),
});

export type AIAssistantFeedbackInput = Readonly<
  z.infer<typeof aiAssistantFeedbackInputSchema>
>;

// ============================================
// Stored Feedback Record (for Firehose/S3)
// ============================================

// Workflow-specific values stored as JSON object
export const aiAssistantValuesSchema = z.object({
  sessionId: z.string(),
  responseId: z.string(),
  userQuery: z.string().optional(),
  aiResponse: z.string().optional(),
});

export type AIAssistantValues = Readonly<
  z.infer<typeof aiAssistantValuesSchema>
>;

// AI Assistant Feedback schema (full domain object)
export const aiAssistantFeedbackSchema = z.object({
  id: feedbackIdSchema,
  tenantId: tenantIdSchema,
  userId: userIdSchema,
  workstream: z.literal('ai-assistant'),
  observabilityRunId: observabilityRunIdSchema,
  feedbackType: feedbackTypeSchema,
  comment: z.string().optional(),
  timestamp: timestampSchema,
  values: aiAssistantValuesSchema,
});

export type AIAssistantFeedback = Readonly<
  z.infer<typeof aiAssistantFeedbackSchema>
>;

// ============================================
// Workflow Feedback Input (from API request)
// ============================================

export const workflowFeedbackInputSchema = z.object({
  workflowName: z.string(),
  observabilityRunId: z.string(),
  feedbackType: feedbackTypeSchema,
  comment: z.string().optional(),
});

export type WorkflowFeedbackInput = Readonly<
  z.infer<typeof workflowFeedbackInputSchema>
>;

// Workflow-specific values
export const workflowValuesSchema = z.object({
  workflowName: z.string(),
});

export type WorkflowValues = Readonly<z.infer<typeof workflowValuesSchema>>;

// Workflow Feedback schema (full domain object)
export const workflowFeedbackSchema = z.object({
  id: feedbackIdSchema,
  tenantId: tenantIdSchema,
  userId: userIdSchema,
  workstream: z.literal('workflow'),
  observabilityRunId: observabilityRunIdSchema,
  feedbackType: feedbackTypeSchema,
  comment: z.string().optional(),
  timestamp: timestampSchema,
  values: workflowValuesSchema,
});

export type WorkflowFeedback = Readonly<z.infer<typeof workflowFeedbackSchema>>;

// Base feedback record schema (common fields + values as JSON string for Parquet)
export const feedbackRecordSchema = z.object({
  id: feedbackIdSchema,
  tenantId: tenantIdSchema,
  userId: userIdSchema,
  workstream: z.string(),
  observabilityRunId: observabilityRunIdSchema,
  feedbackType: feedbackTypeSchema,
  comment: z.string().optional(),
  timestamp: timestampSchema,
  // Workflow-specific data serialized as JSON string
  values: z.string(),
});

export type FeedbackRecord = Readonly<z.infer<typeof feedbackRecordSchema>>;

// ============================================
// Factory Functions
// ============================================

export interface CreateAIAssistantFeedbackParams {
  tenantId: string;
  userId: string;
  input: AIAssistantFeedbackInput;
}

export const createAIAssistantFeedback = (
  params: CreateAIAssistantFeedbackParams
): AIAssistantFeedback => {
  const { tenantId, userId, input } = params;

  if (!input.sessionId || !input.responseId) {
    throw new ValidationError(
      'sessionId and responseId are required for AI Assistant feedback',
      {
        sessionId: input.sessionId,
        responseId: input.responseId,
      }
    );
  }

  return aiAssistantFeedbackSchema.parse({
    id: uuidv7(),
    tenantId,
    userId,
    workstream: 'ai-assistant',
    observabilityRunId: input.observabilityRunId,
    feedbackType: input.feedbackType,
    comment: input.comment,
    timestamp: new Date().toISOString(),
    values: {
      sessionId: input.sessionId,
      responseId: input.responseId,
      userQuery: input.userQuery,
      aiResponse: input.aiResponse,
    },
  } satisfies TypesafeTransform<typeof aiAssistantFeedbackSchema>);
};

export interface CreateWorkflowFeedbackParams {
  tenantId: string;
  userId: string;
  input: WorkflowFeedbackInput;
}

export const createWorkflowFeedback = (
  params: CreateWorkflowFeedbackParams
): WorkflowFeedback => {
  const { tenantId, userId, input } = params;

  if (!input.workflowName) {
    throw new ValidationError(
      'workflowName is required for workflow feedback',
      {
        workflowName: input.workflowName,
      }
    );
  }

  return workflowFeedbackSchema.parse({
    id: uuidv7(),
    tenantId,
    userId,
    workstream: 'workflow',
    observabilityRunId: input.observabilityRunId,
    feedbackType: input.feedbackType,
    comment: input.comment,
    timestamp: new Date().toISOString(),
    values: {
      workflowName: input.workflowName,
    },
  } satisfies TypesafeTransform<typeof workflowFeedbackSchema>);
};

// ============================================
// API Request Schema (discriminated union)
// ============================================

export const aiAssistantFeedbackRequestSchema = z.object({
  workstream: z.literal('ai-assistant'),
  feedback: aiAssistantFeedbackInputSchema,
});

export const workflowFeedbackRequestSchema = z.object({
  workstream: z.literal('workflow'),
  feedback: workflowFeedbackInputSchema,
});

export const ingestFeedbackRequestSchema = z.discriminatedUnion('workstream', [
  aiAssistantFeedbackRequestSchema,
  workflowFeedbackRequestSchema,
]);

export type IngestFeedbackRequest = Readonly<
  z.infer<typeof ingestFeedbackRequestSchema>
>;

// Discriminated union for all feedback records
export const feedbackSchema = z.discriminatedUnion('workstream', [
  aiAssistantFeedbackSchema,
  workflowFeedbackSchema,
]);
export type Feedback = Readonly<z.infer<typeof feedbackSchema>>;

// ============================================
// Ingestion Result Types
// ============================================

/**
 * Successful ingestion result
 */
export interface IngestionSuccess {
  destination: string;
  status: 'fulfilled';
}

/**
 * Failed ingestion result with error reason
 */
export interface IngestionFailure {
  destination: string;
  status: 'rejected';
  reason: unknown;
}

/**
 * Result of an ingestion operation - either success or failure
 */
export type IngestionResult = IngestionSuccess | IngestionFailure;
