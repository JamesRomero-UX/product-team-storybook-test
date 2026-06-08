import {
  CustomAttributeDataSchema,
  FileOrRelationSchema,
  NullableStringDateSchema,
} from 'src/schemas/global';
import { z } from 'zod';

export const ObligationAssessmentResultSchema = z
  .object({
    AssessmentId: z.string().uuid().nullish(),
    ComplianceMonitoringAssessmentId: z.string().uuid().nullish(),
    InternalAuditReportId: z.string().uuid().nullish(),
    ObligationIds: z
      .array(
        z.object({
          value: z
            .string({ required_error: 'Required' })
            .uuid({ message: 'Required' }),
        })
      )
      .min(1),
    Rating: z.number().int({ message: 'Required' }),
    Rationale: z.string().optional(),
    TestDate: NullableStringDateSchema,
    files: z.array(FileOrRelationSchema),
  })
  .and(CustomAttributeDataSchema);

export type ObligationAssessmentResultFormDataFields = Omit<
  z.infer<typeof ObligationAssessmentResultSchema>,
  'resultType'
>;

export const defaultValues: ObligationAssessmentResultFormDataFields = {
  AssessmentId: null,
  ComplianceMonitoringAssessmentId: null,
  InternalAuditReportId: null,
  ObligationIds: [],
  Rating: 1,
  files: [],
  CustomAttributeData: null,
  Rationale: '',
  TestDate: new Date().toISOString(),
};
