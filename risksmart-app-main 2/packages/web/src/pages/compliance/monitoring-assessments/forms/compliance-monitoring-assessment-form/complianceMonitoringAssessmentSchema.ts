import { Assessment_Status_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import {
  CustomAttributeDataSchema,
  InheritedContributorSchema,
  NullableStringDateSchema,
  TagsAndDepartmentsSchema,
  UserOptionSchema,
  UserOrGroupsSchema,
} from 'src/schemas/global';
import { z } from 'zod';

const BaseComplianceMonitoringAssessmentSchema = z.object({
  Title: z.string().min(1, { message: 'Required' }),
  Summary: z.string(),
  ActualCompletionDate: NullableStringDateSchema,
  NextTestDate: NullableStringDateSchema,
  StartDate: NullableStringDateSchema,
  TargetCompletionDate: NullableStringDateSchema,
  CompletedByUser: UserOptionSchema.nullable(),
  Contributors: UserOrGroupsSchema,
  Status: z.nativeEnum(Assessment_Status_Enum),
  Outcome: z.number().nullable(),
  Owners: UserOrGroupsSchema.min(1, { message: 'Required' }),
  ancestorContributors: InheritedContributorSchema,
});

export const ComplianceMonitoringAssessmentFormSchema =
  BaseComplianceMonitoringAssessmentSchema.and(TagsAndDepartmentsSchema).and(
    CustomAttributeDataSchema
  );

export type ComplianceMonitoringAssessmentFormDataFields = z.infer<
  typeof ComplianceMonitoringAssessmentFormSchema
>;

export const defaultValues: ComplianceMonitoringAssessmentFormDataFields = {
  Title: '',
  Summary: '',
  ActualCompletionDate: null,
  NextTestDate: null,
  StartDate: null,
  TargetCompletionDate: null,
  CompletedByUser: null,
  Status: Assessment_Status_Enum.Notstarted,
  Outcome: null,
  tags: [],
  departments: [],
  CustomAttributeData: null,
  Contributors: [],
  Owners: [],
  ancestorContributors: [],
};
