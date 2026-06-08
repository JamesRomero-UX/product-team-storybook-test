import type {
  APIGatewayAuthorizerEvent,
  APIGatewayAuthorizerResult,
  APIGatewayTokenAuthorizerEvent,
  PolicyDocument,
  StatementEffect,
} from 'aws-lambda';
import { getLogger } from 'src/logger';
import { Config } from 'sst/node/config';

const logger = getLogger();

const handler = async (
  event: APIGatewayAuthorizerEvent
): Promise<APIGatewayAuthorizerResult> => {
  const authentication = await authenticate(event);
  const result: APIGatewayAuthorizerResult = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    principalId: (authentication as any).value?.id || 'unknown',
    policyDocument: buildPolicy(
      authentication.success ? 'Allow' : 'Deny',
      event.methodArn
    ),
  };

  return result;
};

async function authenticate(
  event: APIGatewayAuthorizerEvent
): Promise<{ success: boolean }> {
  logger.appendKeys({
    requestedMethodArn: event.methodArn,
  });
  try {
    const token = getTokenOrThrow(event);
    if (token === Config.REST_API_KEY) {
      logger.info('Key matched. Authenticating request');

      return { success: true };
    }
    logger.info('Key does not match');
    throw new Error('Invalid token');
  } catch {
    logger.info('Invalid key');

    return { success: false };
  }
}

// The methodArn specifies exactly which function should be
// allowed ou denied access. You could use "*" to allow access
// to any of your functions, though it is always better to keep
// security tight.
function buildPolicy(
  effect: StatementEffect,
  methodArn: string
): PolicyDocument {
  return {
    Version: '2012-10-17',
    Statement: [
      {
        Action: 'execute-api:Invoke',
        Effect: effect,
        Resource: methodArn,
      },
    ],
  };
}

const getTokenOrThrow = (event: APIGatewayAuthorizerEvent) => {
  const auth =
    (event as APIGatewayTokenAuthorizerEvent).authorizationToken || '';
  const [scheme, token] = auth.split(' ', 2);
  if ((scheme || '').toLowerCase() !== 'bearer') {
    throw new Error("Authorization header value did not start with 'Bearer'.");
  }
  if (!token?.length) {
    throw new Error('Authorization header did not contain a Bearer token.');
  }

  return auth;
};

export { handler };
