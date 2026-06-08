import { z } from 'zod';

export const PostSchema = z.object({
  ThirdPartyId: z.string().uuid(),
  UserEmails: z.string().email().array(),
  Message: z.string().optional(),
  QuestionnaireTemplateVersionIds: z.string().uuid().array(),
});

export const DeleteSchema = z.object({
  ThirdPartyId: z.string().uuid(),
  ResponseIds: z.string().uuid().array(),
  Reason: z.string().optional(),
  ShareWithRespondents: z.boolean().default(false),
});
