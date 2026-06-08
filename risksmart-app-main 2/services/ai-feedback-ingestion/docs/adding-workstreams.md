# Adding a New Workstream

This guide walks through adding a new feedback workstream (e.g., `risk-assessment`).

## 1. Define Types (types.ts)

### Input Schema (what the API receives)

```typescript
export const riskAssessmentFeedbackInputSchema = z.object({
  riskId: z.string(),
  assessmentId: z.string(),
  langsmithRunId: z.string(),
  feedbackType: feedbackTypeSchema,
  comment: z.string().optional(),
});

export type RiskAssessmentFeedbackInput = z.infer<
  typeof riskAssessmentFeedbackInputSchema
>;
```

### Values Schema (workflow-specific data for storage)

```typescript
export const riskAssessmentValuesSchema = z.object({
  riskId: z.string(),
  assessmentId: z.string(),
});

export type RiskAssessmentValues = z.infer<typeof riskAssessmentValuesSchema>;
```

### Feedback Interface (full record before serialization)

```typescript
export interface RiskAssessmentFeedback {
  id: string;
  tenantId: string;
  userId: string;
  workstream: 'risk-assessment';
  langsmithRunId: string;
  feedbackType: FeedbackType;
  comment?: string;
  timestamp: string;
  values: RiskAssessmentValues;
}
```

### Update Discriminated Union

```typescript
export const riskAssessmentFeedbackRequestSchema = z.object({
  workstream: z.literal('risk-assessment'),
  feedback: riskAssessmentFeedbackInputSchema,
});

export const ingestFeedbackRequestSchema = z.discriminatedUnion('workstream', [
  aiAssistantFeedbackRequestSchema,
  workflowFeedbackRequestSchema,
  riskAssessmentFeedbackRequestSchema, // Add here
]);

// Update union type
export type Feedback =
  | AIAssistantFeedback
  | WorkflowFeedback
  | RiskAssessmentFeedback;
```

## 2. Create Domain Service

Create `src/domain/services/ingest-risk-assessment-feedback-service.ts`:

```typescript
import { v7 as uuidv7 } from 'uuid';

import type { FeedbackStreamAdaptor } from '../../adapters/firehose/feedback-stream';
import type { LangSmithAdaptor } from '../../adapters/langsmith/langsmith-client';
import type {
  RiskAssessmentFeedback,
  RiskAssessmentFeedbackInput,
} from '../types';

export interface RiskAssessmentFeedbackServiceDeps {
  feedbackStream: FeedbackStreamAdaptor;
  langsmith: LangSmithAdaptor;
}

export interface RiskAssessmentFeedbackService {
  ingest: (
    tenantId: string,
    userId: string,
    input: RiskAssessmentFeedbackInput
  ) => Promise<RiskAssessmentFeedback>;
}

export const createRiskAssessmentFeedbackService = (
  deps: RiskAssessmentFeedbackServiceDeps
): RiskAssessmentFeedbackService => {
  const ingest = async (
    tenantId: string,
    userId: string,
    input: RiskAssessmentFeedbackInput
  ): Promise<RiskAssessmentFeedback> => {
    if (!input.riskId || !input.assessmentId) {
      throw new Error('riskId and assessmentId are required');
    }

    const feedback: RiskAssessmentFeedback = {
      id: uuidv7(),
      tenantId,
      userId,
      workstream: 'risk-assessment',
      langsmithRunId: input.langsmithRunId,
      feedbackType: input.feedbackType,
      comment: input.comment,
      timestamp: new Date().toISOString(),
      values: {
        riskId: input.riskId,
        assessmentId: input.assessmentId,
      },
    };

    await Promise.all([
      deps.feedbackStream.publish(tenantId, feedback),
      deps.langsmith.submitFeedback({
        runId: input.langsmithRunId,
        score: input.feedbackType === 'thumbs_up' ? 1 : 0,
        comment: input.comment,
      }),
    ]);

    return feedback;
  };

  return { ingest };
};
```

## 3. Update Handler

In `src/handlers/ingest-ai-feedback/index.ts`:

```typescript
import { createRiskAssessmentFeedbackService } from '../../domain/services/ingest-risk-assessment-feedback-service';

// Initialize service
const riskAssessmentService = createRiskAssessmentFeedbackService({
  feedbackStream,
  langsmith,
});

// In handler, add routing case:
switch (parseResult.data.workstream) {
  case 'ai-assistant':
    feedback = await aiAssistantService.ingest(
      tenantId,
      userId,
      parseResult.data.feedback
    );
    break;
  case 'workflow':
    feedback = await workflowService.ingest(
      tenantId,
      userId,
      parseResult.data.feedback
    );
    break;
  case 'risk-assessment': // Add case
    feedback = await riskAssessmentService.ingest(
      tenantId,
      userId,
      parseResult.data.feedback
    );
    break;
}
```

## 4. Add Tests

Create `src/domain/services/ingest-risk-assessment-feedback-service.test.ts`:

```typescript
import { describe, expect, it, vi, beforeEach } from 'vitest';
// ... similar structure to existing service tests
```

## 5. Run Tests & Type Check

```bash
pnpm run test:unit
pnpm exec tsc --noEmit
```

## Checklist

- [ ] Input schema defined with Zod
- [ ] Values schema defined
- [ ] Feedback interface created
- [ ] Request schema added to discriminated union
- [ ] `Feedback` union type updated
- [ ] Domain service created
- [ ] Handler updated with new service initialization and routing case
- [ ] Unit tests for domain service
- [ ] TypeScript compiles
- [ ] All tests pass
