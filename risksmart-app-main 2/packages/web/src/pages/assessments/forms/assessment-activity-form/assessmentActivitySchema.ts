import {
  Assessment_Activity_Status_Enum,
  Assessment_Activity_Type_Enum,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import {
  CustomAttributeDataSchema,
  FileOrRelationSchema,
  NullableStringDateSchema,
  UserOptionSchema,
} from 'src/schemas/global';
import { z } from 'zod';

const linkedItemSchema = z.object({
  Id: z.string().uuid(),
  Type: z.nativeEnum(Parent_Type_Enum),
  Label: z.string(),
});

export type LinkedItem = z.infer<typeof linkedItemSchema>;

export const BaseAssessmentActivitySchema = z
  .object({
    Title: z.string().min(1, { message: 'Required' }),
    Summary: z.string(),
    AssignedUser: UserOptionSchema.nullish(),
    ActivityType: z.nativeEnum(Assessment_Activity_Type_Enum),
    Status: z.nativeEnum(Assessment_Activity_Status_Enum),
    CompletionDate: NullableStringDateSchema,
    LinkedItemIds: z.array(linkedItemSchema),
    files: z.array(FileOrRelationSchema),
  })
  .and(CustomAttributeDataSchema);

export type AssessmentActivityFormDataFields = z.infer<
  typeof BaseAssessmentActivitySchema
>;

export const defaultValues: AssessmentActivityFormDataFields = {
  Title: '',
  Summary: '',
  ActivityType: Assessment_Activity_Type_Enum.Task,
  Status: Assessment_Activity_Status_Enum.Notstarted,
  CompletionDate: null,
  AssignedUser: null,
  LinkedItemIds: [],
  CustomAttributeData: null,
  files: [],
};
