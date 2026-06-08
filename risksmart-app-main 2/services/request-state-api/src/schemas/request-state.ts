import { z } from 'zod';

import {
  type RequestState,
  RequestStateTaskStatus,
} from '../event-store/aggregator/types';

export const getRequestStateSchema = z.object({
  correlationId: z.string().uuid('Correlation ID must be a valid UUID'),
});

/**
 * Schema for validating RequestStateTask objects from DynamoDB
 */
export const requestStateTaskSchema = z.object({
  status: z.nativeEnum(RequestStateTaskStatus),
});

/**
 * Schema for validating RequestState objects from DynamoDB
 */
export const requestStateSchema = z.object({
  correlationId: z.string(),
  tenant: z.string(),
  orgKey: z.string(),
  userId: z.string(),
  tasks: z.record(requestStateTaskSchema),
  response: z.string().optional(),
  error: z.string().optional(),
});

/**
 * Schema for validating DynamoDB internal record fields
 */
export const recordFieldsSchema = z.object({
  _id: z.string(),
  _rng: z.string(),
  _facet: z.string(),
  _typ: z.string(),
  _ts: z.number(),
  _date: z.string(),
  _seq: z.number(),
});

/**
 * Schema for validating StateRecord<RequestState> from DynamoDB
 * This validates both the DynamoDB metadata and the RequestState data
 */
export const stateRecordSchema = recordFieldsSchema.and(requestStateSchema);

/**
 * Type-safe function to extract RequestState from validated state record
 */
export const extractRequestState = (
  stateRecord: z.infer<typeof stateRecordSchema>
): RequestState => {
  const { _id, _rng, _facet, _typ, _ts, _date, _seq, ...requestState } =
    stateRecord;

  return requestState as RequestState;
};
