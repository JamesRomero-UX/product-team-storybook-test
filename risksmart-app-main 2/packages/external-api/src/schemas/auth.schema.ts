import { z } from './openapi.zod';

export const AuthTokenRequestSchema = z.object({
  clientKey: z
    .string({ message: 'Client key is required' })
    .openapi({ example: 'app_key_abc123', description: 'API client key' }),
  clientSecret: z
    .string({ message: 'Client Secret is required' })
    .openapi({ example: 'secret_xyz789', description: 'API client secret' }),
});

export const AuthTokenResponseSchema = z.object({
  accessToken: z.string().openapi({
    example: 'eyJhbGciOiJSUzI1NiJ9...',
    description: 'JWT bearer token',
  }),
  tokenType: z
    .literal('Bearer')
    .openapi({ example: 'Bearer', description: 'Token type, always Bearer' }),
  expiresIn: z
    .number()
    .int()
    .positive()
    .openapi({ example: 3600, description: 'Token lifetime in seconds' }),
});

export type AuthTokenRequestData = z.infer<typeof AuthTokenRequestSchema>;
export type AuthTokenResponseData = z.infer<typeof AuthTokenResponseSchema>;
