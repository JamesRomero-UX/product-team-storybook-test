import { WizardStatusEnum } from 'generated/graphql';
import { z } from 'zod';

const BaseSchema = z.object({
  RiskId: z.string().min(1, { message: 'Required' }),
});

export const PostSchema = z.object({
  object: BaseSchema.and(
    z.object({
      AssessmentId: z.string().uuid(),
      Status: z.nativeEnum(WizardStatusEnum),
      ActivityId: z.string().uuid(),
    })
  ),
});

export const PutSchema = z.object({
  object: BaseSchema.and(
    z.object({
      RiskId: z.string().uuid(),
      CurrentStep: z.number(),
      Status: z.nativeEnum(WizardStatusEnum).nullish(),
    })
  ),
});

export const DeleteSchema = z.object({ RiskId: z.string().uuid() });
