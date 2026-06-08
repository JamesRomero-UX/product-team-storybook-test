import { IndicatorType } from '@risksmart-app/domain/src/types/consts/indicator-type';

import {
  entityIdValue,
  ownersList,
  testFrequency,
  unitOfTime,
} from '../../utils/schemas';
import { CustomFieldsInputSchema } from '../common/custom-fields.schema';
import { z } from '../openapi.zod';

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

const baseIndicatorRequestFields = {
  title: z
    .string()
    .min(1, 'Title is required')
    .openapi({ example: 'Monthly revenue indicator' }),
  description: z
    .string()
    .nullish()
    .openapi({ example: 'Tracks monthly revenue against target' }),
  owners: ownersList,
  schedule: scheduleInputSchema
    .optional()
    .openapi({ description: 'Optional indicator test schedule' }),
  customFields: CustomFieldsInputSchema,
} as const;

const numberTypeFields = {
  type: z.literal(IndicatorType.Number),
  unit: z.string().nullish().openapi({
    example: 'USD',
    description: 'Unit of measurement for the indicator value',
  }),
  upperTolerance: z
    .number()
    .nullish()
    .openapi({ example: 150, description: 'Upper tolerance boundary' }),
  lowerTolerance: z
    .number()
    .nullish()
    .openapi({ example: 50, description: 'Lower tolerance boundary' }),
  upperAppetite: z
    .number()
    .nullish()
    .openapi({ example: 120, description: 'Upper appetite boundary' }),
  lowerAppetite: z
    .number()
    .nullish()
    .openapi({ example: 80, description: 'Lower appetite boundary' }),
} as const;

const textTypeFields = {
  type: z.literal(IndicatorType.Text),
  targetValue: z.string().min(1, 'Target value is required').openapi({
    example: 'Green',
    description: 'Expected text value for the indicator',
  }),
} as const;

const toleranceSequenceRefinement = (
  value: {
    lowerTolerance?: number | null;
    lowerAppetite?: number | null;
    upperAppetite?: number | null;
    upperTolerance?: number | null;
    [key: string]: unknown;
  },
  ctx: z.RefinementCtx
) => {
  const limits = [
    value.lowerTolerance,
    value.lowerAppetite,
    value.upperAppetite,
    value.upperTolerance,
  ];
  const limitsWithValue = limits.filter(
    (limit): limit is number => limit !== null && limit !== undefined
  );

  const outOfSequence = limitsWithValue.find((limit, idx) => {
    const prev = limitsWithValue[idx - 1];

    return idx !== 0 && prev !== undefined && limit < prev;
  });
  if (outOfSequence !== undefined) {
    ctx.addIssue({
      message: 'Tolerances/appetites are out of sequence',
      code: z.ZodIssueCode.custom,
      path: ['lowerTolerance'],
    });
  }
};

// Create schema includes parentId (required for linking to a risk or control)
const createParentFields = {
  parentId: entityIdValue.openapi({
    description: 'ID of the parent Risk or Control',
  }),
} as const;

export const createIndicatorRequestSchema = z
  .discriminatedUnion('type', [
    z.object({
      ...baseIndicatorRequestFields,
      ...createParentFields,
      ...numberTypeFields,
    }),
    z.object({
      ...baseIndicatorRequestFields,
      ...createParentFields,
      ...textTypeFields,
    }),
  ])
  .superRefine(toleranceSequenceRefinement);

// Update schema does not include parentId (cannot change parent on update)
// type is omitted — indicator type is immutable and is threaded from the existing record
export const updateIndicatorRequestSchema = z
  .object({
    ...baseIndicatorRequestFields,
    unit: z.string().nullish().openapi({
      example: 'USD',
      description: 'Unit of measurement for the indicator value',
    }),
    upperTolerance: z
      .number()
      .nullish()
      .openapi({ example: 150, description: 'Upper tolerance boundary' }),
    lowerTolerance: z
      .number()
      .nullish()
      .openapi({ example: 50, description: 'Lower tolerance boundary' }),
    upperAppetite: z
      .number()
      .nullish()
      .openapi({ example: 120, description: 'Upper appetite boundary' }),
    lowerAppetite: z
      .number()
      .nullish()
      .openapi({ example: 80, description: 'Lower appetite boundary' }),
    targetValue: z.string().min(1).optional(),
  })
  .superRefine(toleranceSequenceRefinement);

export type CreateIndicatorRequest = z.infer<
  typeof createIndicatorRequestSchema
>;
export type CreateIndicatorRequestSchema = typeof createIndicatorRequestSchema;

export type UpdateIndicatorRequest = z.infer<
  typeof updateIndicatorRequestSchema
>;
export type UpdateIndicatorRequestSchema = typeof updateIndicatorRequestSchema;

// Schema for creating an indicator when parentId comes from URL path (e.g. POST /risks/:id/indicators)
// type is still required here — it's a create operation.
export const createIndicatorForParentRequestSchema = z
  .discriminatedUnion('type', [
    z.object({ ...baseIndicatorRequestFields, ...numberTypeFields }),
    z.object({ ...baseIndicatorRequestFields, ...textTypeFields }),
  ])
  .superRefine(toleranceSequenceRefinement);

export type CreateIndicatorForParentRequest = z.infer<
  typeof createIndicatorForParentRequestSchema
>;
export type CreateIndicatorForParentRequestSchema =
  typeof createIndicatorForParentRequestSchema;
