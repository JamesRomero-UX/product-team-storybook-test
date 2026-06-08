import type { EventBridgeEvent } from 'aws-lambda';
import type { DataChangeEvent } from 'src/handlers/events/DataChangeEvent';

import type { EntityPermitProcessor } from '../types';

export const linkedItem: {
  name: string;
  entityPermitProcessor: EntityPermitProcessor;
} = {
  name: 'linked_item',
  entityPermitProcessor: async <
    T extends {
      OrgKey: string;
      Source: string;
      Target: string;
      RelationshipType: string;
    },
  >(
    tenant: string,
    event: EventBridgeEvent<string, DataChangeEvent<T, 'action'>>
  ) => {
    const entity = event.detail.event.data.new ?? event.detail.event.data.old;
    if (!entity) {
      throw new Error('No entity');
    }

    return {
      Id: entity.Target,
      Parents: [
        {
          ParentId: entity.Source,
          ParentType: 'rs_node',
        },
      ],
      OP: event.detail.event.op,
      OrgKey: entity.OrgKey,
      PermitAction: 'PARENT-RELATION',
      RelationshipType: entity.RelationshipType,
    };
  },
};
