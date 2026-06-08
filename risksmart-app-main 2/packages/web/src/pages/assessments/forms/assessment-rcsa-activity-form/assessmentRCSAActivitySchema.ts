import {
  Assessment_Activity_Status_Enum,
  Assessment_Activity_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import {
  CustomAttributeDataSchema,
  FileOrRelationSchema,
  NullableStringDateSchema,
  UserOrGroupsSchema,
} from 'src/schemas/global';
import { z } from 'zod';

export const BaseAssessmentActivitySchema = z
  .object({
    Title: z.string().min(1, { message: 'Required' }),
    Summary: z.string(),
    RiskIds: z
      .array(
        z.object({
          value: z
            .string({ required_error: 'Required' })
            .uuid({ message: 'Required' }),
        })
      )
      .min(1, { message: 'An activity must be linked to at least 1 risk' }),

    ActivityType: z.nativeEnum(Assessment_Activity_Type_Enum),
    Status: z.nativeEnum(Assessment_Activity_Status_Enum),
    CompletionDate: NullableStringDateSchema,
    Owners: UserOrGroupsSchema.min(1, { message: 'Required' }),
    files: z.array(FileOrRelationSchema),
  })
  .and(CustomAttributeDataSchema);

export type AssessmentRCSAActivityFormDataFields = z.infer<
  typeof BaseAssessmentActivitySchema
>;

export const defaultValues: AssessmentRCSAActivityFormDataFields = {
  Title: '',
  Summary: '',
  ActivityType: Assessment_Activity_Type_Enum.Task,
  Status: Assessment_Activity_Status_Enum.Notstarted,
  CompletionDate: null,
  RiskIds: [],
  CustomAttributeData: null,
  Owners: [],
  files: [],
};
