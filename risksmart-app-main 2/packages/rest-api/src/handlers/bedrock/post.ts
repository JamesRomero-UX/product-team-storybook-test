import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from '@aws-sdk/client-bedrock-runtime';
import { getEnv } from 'src/environment';
import frontendApiHandler from 'src/frontendApiHandler';

import { getLogger } from '../../logger';
import { prompts } from './prompts';
import { PostRequestSchema } from './schema';

const logger = getLogger();

const guardrailIdentifier = getEnv('BEDROCK_GUARDRAIL_IDENTIFIER');
const guardrailVersion = getEnv('BEDROCK_GUARDRAIL_VERSION');

export const handler = frontendApiHandler(
  PostRequestSchema,
  async (request) => {
    const editedPrompt = prompts[request.prompt](request.bodyText);
    const payload = {
      prompt: editedPrompt.prompt,
      max_tokens: editedPrompt.max_tokens,
      stop: [],
      temperature: editedPrompt.temperature,
      top_p: editedPrompt.top_p,
      top_k: 1, //  Value must >= 1
    };

    logger.info(JSON.stringify(payload));

    const client = new BedrockRuntimeClient({ region: 'eu-west-2' });

    const command = new InvokeModelCommand({
      modelId: 'mistral.mistral-large-2402-v1:0',
      contentType: 'application/json',
      body: JSON.stringify(payload),
      guardrailIdentifier: guardrailIdentifier,
      guardrailVersion: guardrailVersion,
    });

    const apiResponse = await client.send(command);

    // Decode and return the response.
    const decodedResponseBody = new TextDecoder().decode(apiResponse.body);
    const responseBody = JSON.parse(decodedResponseBody);
    logger.info(responseBody);

    const guardrailAction = responseBody['amazon-bedrock-guardrailAction'];
    if (
      guardrailAction === 'INTERVENED' ||
      guardrailAction === 'GUARDRAIL_INTERVENED'
    ) {
      logger.info('Request blocked by guardrail');

      return {
        statusCode: 403,
        body: JSON.stringify({
          error: 'GUARDRAIL_INTERVENED',
          message:
            'Your request could not be processed as it did not meet content policy guidelines.',
        }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        returnedText: responseBody.outputs[0].text.replace(/^\n|\n$/g, ''),
      }),
    };
  }
);
