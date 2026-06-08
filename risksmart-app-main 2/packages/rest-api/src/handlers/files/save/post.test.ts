import type { APIGatewayProxyEventV2, Context } from 'aws-lambda';
import { stub } from 'src/testing/stub';

import { handler } from './post';

describe('files save post', () => {
  it('should validate the post body', async () => {
    const result = await handler(
      stub<APIGatewayProxyEventV2>({}),
      stub<Context>({})
    );
    expect(result.statusCode).toEqual(400);
  });
});
