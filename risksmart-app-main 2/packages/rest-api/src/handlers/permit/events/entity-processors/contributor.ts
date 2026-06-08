import type { EventBridgeEvent } from 'aws-lambda';
import type { DataChangeEvent } from 'src/handlers/events/DataChangeEvent';

import type { EntityPermitProcessor } from '../types';

export const contributor: {
  name: string;
  entityPermitProcessor: EntityPermitProcessor;
} = {
  name: 'contributor',
  entityPermitProcessor: async <
    T extends { OrgKey: string; ParentId: string; UserId: string },
  >(
    tenant: string,
    event: EventBridgeEvent<string, DataChangeEvent<T, 'action'>>
  ) => {
    const entity = event.detail.event.data.new ?? event.detail.event.data.old;
    if (!entity) {
      throw new Error('No entity');
    }

    return {
      Id: entity.ParentId,
      ContributorId: entity.UserId,
      OP: event.detail.event.op,
      OrgKey: entity.OrgKey,
      PermitAction: 'USER-ENTITY',
    };
  },
};
