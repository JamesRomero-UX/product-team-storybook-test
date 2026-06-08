import { GetParameterCommand, SSMClient } from '@aws-sdk/client-ssm';
import { z } from 'zod';

import { ConfigurationError } from '../../domain/errors';
import { getEnv } from '../../lib';

const langSmithConfigSchema = z.object({
  apiKey: z.string().min(1),
  endpoint: z.string().url().optional(),
  workspaceId: z.string().optional(),
});

export type LangSmithConfig = z.infer<typeof langSmithConfigSchema>;

let cachedLangSmithConfig: LangSmithConfig | null = null;

const ssmClient = new SSMClient({});

export const getLangSmithConfig = async (): Promise<LangSmithConfig> => {
  if (cachedLangSmithConfig) {
    return cachedLangSmithConfig;
  }

  const ssmParamName = getEnv('AI_FEEDBACK_LANGSMITH_CONFIG_PARAM_NAME');

  const command = new GetParameterCommand({
    Name: ssmParamName,
    WithDecryption: true,
  });

  try {
    const ssmResponse = await ssmClient.send(command);

    if (!ssmResponse.Parameter?.Value) {
      throw new ConfigurationError(
        `SSM parameter ${ssmParamName} exists but has no value`,
        { parameterName: ssmParamName }
      );
    }

    cachedLangSmithConfig = langSmithConfigSchema.parse(
      JSON.parse(ssmResponse.Parameter.Value)
    );

    return cachedLangSmithConfig;
  } catch (error) {
    if (error instanceof ConfigurationError) {
      throw error;
    }

    throw new ConfigurationError(
      `Failed to retrieve or parse LangSmith configuration from SSM`,
      {
        parameterName: ssmParamName,
        error: error instanceof Error ? error.message : String(error),
      }
    );
  }
};
