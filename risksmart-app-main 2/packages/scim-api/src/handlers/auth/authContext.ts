import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import { Unauthorized } from 'http-errors';

export interface AuthContext {
  orgKey: string;
  tenant: string;
  domains: string[];
}

interface RequestContext {
  authorizer: {
    lambda: {
      orgKey: string;
      tenant: string;
      domains: string;
    };
  };
}

export const getAuthContext = (event: APIGatewayProxyEventV2): AuthContext => {
  try {
    const orgKey = (event.requestContext as unknown as RequestContext)
      .authorizer?.lambda?.orgKey;
    const tenant = (event.requestContext as unknown as RequestContext)
      .authorizer?.lambda?.tenant;
    const domainsString = (
      event.requestContext as unknown as RequestContext
    ).authorizer?.lambda?.domains.toLowerCase();

    const domains = JSON.parse(domainsString) as string[];

    console.log({ orgKey, tenant, domains });

    return { orgKey, tenant, domains };
  } catch {
    throw new Unauthorized(
      'Missing orgKey, tenant or domains in request context'
    );
  }
};
