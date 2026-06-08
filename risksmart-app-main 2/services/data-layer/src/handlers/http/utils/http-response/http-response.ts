import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

const buildLocationUrl = ({
  event,
  objectType,
  objectId,
}: {
  event: APIGatewayProxyEvent;
  objectType: string;
  objectId?: string;
}): string => {
  const host = event.headers['Host'] || event.headers['host'];
  const stage = event.requestContext.stage;
  const protocol = 'https';

  if (!objectId) {
    return `${protocol}://${host}/${stage}/${objectType}`;
  }

  return `${protocol}://${host}/${stage}/${objectType}/${objectId}`;
};

export const createdResponse = <T extends { Id: string }>({
  event,
  object,
  objectType,
}: {
  event: APIGatewayProxyEvent;
  object: T;
  objectType: string;
}): APIGatewayProxyResult => ({
  statusCode: 201,
  headers: {
    'Content-Type': 'application/json',
    Location: buildLocationUrl({ event, objectType, objectId: object.Id }),
  },
  body: JSON.stringify({ data: object }),
});

export const okResponse = <T extends { Id: string }>({
  event,
  object,
  objectType,
}: {
  event: APIGatewayProxyEvent;
  object: T;
  objectType: string;
}): APIGatewayProxyResult => ({
  statusCode: 200,
  headers: {
    'Content-Type': 'application/json',
    Location: buildLocationUrl({ event, objectType, objectId: object.Id }),
  },
  body: JSON.stringify({ data: object }),
});

export const deletedResponse = ({
  event,
  objectType,
  objectId,
}: {
  event: APIGatewayProxyEvent;
  objectType: string;
  objectId?: string;
}): APIGatewayProxyResult => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  headers['Location'] = buildLocationUrl({
    event,
    objectType,
    objectId: objectId,
  });

  return {
    statusCode: 204,
    headers,
    body: '',
  };
};
