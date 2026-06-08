import { z } from 'zod';

export const PublishSchema = z.object({
  QuestionnaireTemplateId: z.string().uuid(),
  QuestionnaireTemplateVersionId: z.string().uuid(),
});
