import {
  AssessmentActivityStatusEnum,
  AssessmentActivityTypeEnum,
} from 'generated/graphql';
import {
  CustomAttributeDataSchema,
  NullableStringDateSchema,
  OwnersSchema,
} from 'src/sharedSchemas';
import { z } from 'zod';

export const AssessmentActivityPostSchema = z
  .object({
    ActivityType: z.nativeEnum(AssessmentActivityTypeEnum),
    ParentId: z.string().uuid(),
    Status: z.nativeEnum(AssessmentActivityStatusEnum),
    Summary: z.string().nullish(),
    Title: z.string(),
    AssignedUser: z.string().nullish(),
    CompletionDate: NullableStringDateSchema,
    LinkedItemIds: z.array(z.string().uuid()),
    IsRCSA: z.boolean().nullish(),
    RiskId: z.string().uuid().nullish(),
  })
  .extend(OwnersSchema)
  .and(CustomAttributeDataSchema);

export const AssessmentActivityPutSchema = z
  .object({
    Id: z.string().uuid(),
    ActivityType: z.nativeEnum(AssessmentActivityTypeEnum),
    ParentId: z.string().uuid(),
    Status: z.nativeEnum(AssessmentActivityStatusEnum),
    Summary: z.string().nullish(),
    Title: z.string().nullish(),
    AssignedUser: z.string().nullish(),
    CompletionDate: NullableStringDateSchema,
    OriginalTimestamp: NullableStringDateSchema,
    LinkedItemIds: z.array(z.string().uuid()),
    IsWizardAction: z.boolean().nullish(),
  })
  .extend(OwnersSchema)
  .and(CustomAttributeDataSchema);
