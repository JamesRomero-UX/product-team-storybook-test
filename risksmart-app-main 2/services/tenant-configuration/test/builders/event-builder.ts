import { EventBridgeEvent } from 'aws-lambda';

const mockEvent: EventBridgeEvent<'EXTERNAL_OBLIGATIONS_UPDATED', unknown> = {
  version: '0',
  id: '7181fbe4-0ce1-4465-bb82-c11ba43d9708',
  'detail-type': 'EXTERNAL_OBLIGATIONS_UPDATED',
  source: 'risksmart.rulebook-ingestion',
  account: '000000000000',
  time: '2025-12-18T16:47:38Z',
  region: 'eu-west-2',
  resources: [],
  detail: {
    location:
      's3://tech-admin-risksmartapp-rulebook-changes/550e8400-e29b-41d4-a716-446655440000/changes.json',
  },
};

export const buildEvent: () => EventBridgeEvent<
  'EXTERNAL_OBLIGATIONS_UPDATED',
  unknown
> = () => {
  return mockEvent;
};
