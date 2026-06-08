import type { Logger } from '@aws-lambda-powertools/logger';
import type { EventBridgeClient } from '@aws-sdk/client-eventbridge';
import type { OrgUserEventMetadata } from '@risksmart-app/events/src/types/orguser-events';
import { createFormEventEmitters } from 'src/events/producers/data-event-producers';

import type {
  OperationType,
  ValidatedLambdaContext,
} from '../utils/mutation-middleware';
import type { EventData, EventStrategy } from './event-strategies';

/**
 * Strategy data type for FormEventStrategy
 */
export interface FormStrategyData {
  formFieldIds: { fieldId: string; parentType: string }[];
}

/**
 * Strategy for form configuration events (FormConfigured, FormConfigurationFailed)
 */
export class FormEventStrategy implements EventStrategy<FormStrategyData> {
  private emitters: ReturnType<typeof createFormEventEmitters>;

  constructor(
    private operationType: OperationType,
    eventBridge: EventBridgeClient,
    logger: Logger
  ) {
    this.emitters = createFormEventEmitters(eventBridge, logger);
  }

  validateContext(
    context: ValidatedLambdaContext<unknown, FormStrategyData>
  ): void {
    if (
      !context.strategyData?.formFieldIds ||
      context.strategyData.formFieldIds.length === 0
    ) {
      throw new Error('Missing form field IDs in context for form event');
    }
  }

  extractEventData(
    context: ValidatedLambdaContext<unknown, FormStrategyData>
  ): EventData[] {
    const formFieldIds = context.strategyData?.formFieldIds || [];

    return formFieldIds.map(({ fieldId, parentType }) => ({
      fieldId,
      parentType,
      operation: this.operationType,
    }));
  }

  async emitSuccessEvent(
    metadata: OrgUserEventMetadata,
    data: EventData
  ): Promise<void> {
    const { fieldId, parentType, operation } = data;
    if (!fieldId || !parentType || !operation) {
      throw new Error(
        'Missing fieldId, parentType, or operation in event data'
      );
    }

    return this.emitters.emitFormConfiguredEvent(metadata, {
      fieldId,
      parentType,
      operation: operation,
    });
  }

  async emitFailureEvent(
    metadata: OrgUserEventMetadata,
    data: EventData,
    error: string
  ): Promise<void> {
    const { fieldId, parentType, operation } = data;
    if (!fieldId || !parentType || !operation) {
      throw new Error(
        'Missing fieldId, parentType, or operation in event data'
      );
    }

    return this.emitters.emitFormConfigurationFailedEvent(metadata, {
      fieldId,
      parentType,
      operation: operation,
      error,
    });
  }
}
