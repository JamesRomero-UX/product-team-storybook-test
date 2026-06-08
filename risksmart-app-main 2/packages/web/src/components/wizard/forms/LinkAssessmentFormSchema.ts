import { z } from 'zod';

export const LinkAssessmentFormSchema = z.object({
  AssessmentId: z.string(),
});

export type LinkAssessmentFormFields = z.infer<typeof LinkAssessmentFormSchema>;
