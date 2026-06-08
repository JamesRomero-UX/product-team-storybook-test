import { PromptId } from '@risksmart-app/shared/ai/PromptId';
import { z } from 'zod';

export const PostRequestSchema = z.object({
  prompt: z.nativeEnum(PromptId),
  bodyText: z.string(),
});
