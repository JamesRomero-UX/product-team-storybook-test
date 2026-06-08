import type { APIGatewayProxyEventV2, Context } from 'aws-lambda';
import { stub } from 'src/testing/stub';
import { vi } from 'vitest';

import { sendToEventBridgeInBatches } from '../notifications/eventBridgeUtils';
import { handler } from './data';
import type { DataChangeEvent } from './DataChangeEvent';

vi.mock('../notifications/eventBridgeUtils');

describe('event data handler', () => {
  it('should not publish to event bridge if no tenant is supplied', async () => {
    const data: DataChangeEvent<unknown, string> = {
      created_at: '',
      delivery_info: {
        current_retry: 0,
        max_retries: 0,
      },
      event: {
        session_variables: {},
        trace_context: null,
        data: { old: null, new: null },
        op: 'UPDATE',
      },
      id: '',
      table: {
        name: '',
        schema: '',
      },
      trigger: {
        name: '',
      },
    };

    const result = await handler(
      stub<APIGatewayProxyEventV2>({
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }),
      stub<Context>({})
    );
    expect(result.statusCode).toEqual(200);
    expect(sendToEventBridgeInBatches).not.toHaveBeenCalled();
  });
});
