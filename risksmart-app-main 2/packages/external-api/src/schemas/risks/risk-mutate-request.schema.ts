import { RiskStatusType } from '@risksmart-app/domain/src/types/consts/risk-status-type';

import {
  entityIdValue,
  ownersList,
  testFrequency,
  treatmentType,
  unitOfTime,
} from '../../utils/schemas';
import { CustomFieldsInputSchema } from '../common/custom-fields.schema';
import { z } from '../openapi.zod';

const parentRiskId = entityIdValue.openapi({
  description:
    'Risk ID of the tier (1 - 3) above Risk, if not provided Risk is assumed to be tier 1',
});

const scheduleInputSchema = z.object({
  startDate: z.string().datetime({ offset: true }).nullish().openapi({
    description: 'When the schedule starts',
    example: '2024-01-01T00:00:00Z',
  }),
  manualDueDate: z.string().datetime({ offset: true }).nullish().openapi({
    description: 'Manual override for the due date',
    example: '2024-06-30T00:00:00Z',
  }),
  frequency: testFrequency,
  timeToCompleteValue: z.number().int().nullish().openapi({
    example: 7,
    description: 'Number of time units allocated to complete the test',
  }),
  timeToCompleteUnit: unitOfTime,
});

const baseRiskRequestFields = {
  title: z
    .string()
    .min(1, 'Title is required')
    .openapi({ example: 'Operational Risk - Data Loss' }),
  description: z.string().nullish().openapi({
    example: 'Risk of data loss due to inadequate backup procedures',
  }),
  treatment: treatmentType,
  status: z.nativeEnum(RiskStatusType).nullish().openapi({
    example: RiskStatusType.Active,
    description: 'The current status of the Risk',
  }),
  owners: ownersList,
  schedule: scheduleInputSchema
    .optional()
    .openapi({ description: 'Optional Risk test schedule' }),
  parentRiskId: parentRiskId.optional(),
  customFields: CustomFieldsInputSchema,
} as const;

export const createRiskRequestSchema = z.object(baseRiskRequestFields);
// update schema is the same for create for now.
export const updateRiskRequestSchema = createRiskRequestSchema;

export type UpdateRiskRequest = z.infer<typeof updateRiskRequestSchema>;
export type UpdateRiskRequestSchema = typeof updateRiskRequestSchema;

export type CreateRiskRequest = z.infer<typeof createRiskRequestSchema>;
export type CreateRiskRequestSchema = typeof createRiskRequestSchema;
