import { Risk_Assessment_Result_Control_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import {
  CustomAttributeDataSchema,
  FileOrRelationSchema,
  NullableStringDateSchema,
} from 'src/schemas/global';
import { z } from 'zod';

export const RiskAssessmentResultSchema = z
  .object({
    AssessmentId: z.string().uuid().nullish(),
    ComplianceMonitoringAssessmentId: z.string().uuid().nullish(),
    InternalAuditReportId: z.string().uuid().nullish(),
    RiskIds: z
      .array(
        z.object({
          value: z
            .string({ required_error: 'Required' })
            .uuid({ message: 'Required' }),
        })
      )
      .min(1, { message: 'A rating must be linked to at least 1 risk' }),
    Rating: z.number().int({ message: 'Required' }).nullish(),
    Impact: z.number().int({ message: 'Required' }).nullish(),
    Likelihood: z.number().int({ message: 'Required' }).nullish(),
    ControlType: z.nativeEnum(Risk_Assessment_Result_Control_Type_Enum),
    Rationale: z.string().nullish(),
    TestDate: NullableStringDateSchema,
    files: z.array(FileOrRelationSchema),
  })
  .and(CustomAttributeDataSchema);

export type RiskAssessmentResultFormDataFields = Omit<
  z.infer<typeof RiskAssessmentResultSchema>,
  'resultType'
>;

export const defaultValues: RiskAssessmentResultFormDataFields = {
  AssessmentId: null,
  ComplianceMonitoringAssessmentId: null,
  InternalAuditReportId: null,
  RiskIds: [],
  Rating: null,
  Impact: null,
  Likelihood: null,
  ControlType: Risk_Assessment_Result_Control_Type_Enum.Uncontrolled,
  files: [],
  CustomAttributeData: null,
  Rationale: '',
  TestDate: new Date().toISOString(),
};
