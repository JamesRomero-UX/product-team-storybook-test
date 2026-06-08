import z from 'zod';
export const slackCallbackSchema = z.object({
  code: z.string(),
  state: z.string(),
});

export const slackSuccessResponse = z.object({
  ok: z.literal(true),
  app_id: z.string(),
  authed_user: z.object({
    id: z.string(),
  }),
  access_token: z.string(),
  scope: z.string(),
  team: z.object({
    id: z.string(),
    name: z.string(),
  }),
  token_type: z.string(),
});

export const slackErrorResponse = z.object({
  ok: z.literal(false),
  error: z.string(),
});

export const slackResponse = z.discriminatedUnion('ok', [
  slackSuccessResponse,
  slackErrorResponse,
]);

export const slackChannelDataConnectionSchema = z.object({
  access_token: z.string(),
});
