import { isoDateTimeValue } from '../../utils/schemas';
import {
  baseEntitySchema,
  baseLinksSchema,
  listLinksSchema,
} from '../common/base.schema';
import { z } from '../openapi.zod';

const AssessmentResponseSchema = baseEntitySchema;

export const AssessmentListResponseSchema = AssessmentResponseSchema.extend({
  links: listLinksSchema,
}).strict();

export const AssessmentItemResponseSchema = AssessmentResponseSchema.extend({
  status: z.string().openapi({
    example: 'In Progress',
    description: 'Current status of the assessment',
  }),
  startDate: isoDateTimeValue
    .nullable()
    .openapi({ description: 'When the assessment started' }),
  endDate: isoDateTimeValue
    .nullable()
    .openapi({ description: 'When the assessment ended' }),
  completionDate: isoDateTimeValue
    .nullable()
    .openapi({ description: 'Date the assessment was completed' }),
  links: baseLinksSchema,
}).strict();

export type AssessmentItemResponse = z.infer<
  typeof AssessmentItemResponseSchema
>;
export type AssessmentListResponse = z.infer<
  typeof AssessmentListResponseSchema
>;
