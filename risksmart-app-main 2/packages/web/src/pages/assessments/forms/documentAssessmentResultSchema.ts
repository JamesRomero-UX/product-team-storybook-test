import {
  CustomAttributeDataSchema,
  FileOrRelationSchema,
  NullableStringDateSchema,
} from 'src/schemas/global';
import { z } from 'zod';

export const DocumentAssessmentResultSchema = z
  .object({
    AssessmentId: z.string().uuid().nullish(),
    ComplianceMonitoringAssessmentId: z.string().uuid().nullish(),
    InternalAuditReportId: z.string().uuid().nullish(),
    DocumentIds: z
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

export type DocumentAssessmentResultFormDataFields = Omit<
  z.infer<typeof DocumentAssessmentResultSchema>,
  'resultType'
>;

export const defaultValues: DocumentAssessmentResultFormDataFields = {
  AssessmentId: null,
  ComplianceMonitoringAssessmentId: null,
  InternalAuditReportId: null,
  DocumentIds: [],
  Rating: 1,
  files: [],
  CustomAttributeData: null,
  Rationale: '',
  TestDate: new Date().toISOString(),
};
