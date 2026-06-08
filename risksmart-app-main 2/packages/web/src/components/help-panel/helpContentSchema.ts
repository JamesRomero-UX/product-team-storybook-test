import { z } from 'zod';

export const HelpContentSchema = z.array(
  z.object({
    title: z.string(),
    content: z.string().or(
      z.array(
        z.object({
          title: z.string(),
          content: z.string(),
        })
      )
    ),
  })
);
