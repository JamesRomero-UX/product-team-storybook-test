import type { APIGatewayProxyEventV2 } from 'aws-lambda';

export interface SessionVariables {
  [variable: string]: string;
}

export interface ActionInput<T> {
  action: { name: string };
  input: T;
  event: APIGatewayProxyEventV2;
  session_variables: SessionVariables;
}
