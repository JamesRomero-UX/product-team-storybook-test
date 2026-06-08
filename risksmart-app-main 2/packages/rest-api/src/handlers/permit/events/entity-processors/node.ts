import { isRootObjectType } from '@risksmart-app/permitio/types';
import type { EventBridgeEvent } from 'aws-lambda';
import type { DataChangeEvent } from 'src/handlers/events/DataChangeEvent';

import type { EntityPermitProcessor } from '../types';

export const node: {
  name: string;
  entityPermitProcessor: EntityPermitProcessor;
} = {
  name: 'node',
  entityPermitProcessor: async <
    T extends { OrgKey: string; Id: string; ObjectType: string },
  >(
    tenant: string,
    event: EventBridgeEvent<string, DataChangeEvent<T, 'action'>>
  ) => {
    const entity = event.detail.event.data.new ?? event.detail.event.data.old;
    if (!entity) {
      throw new Error('No entity');
    }

    if (event.detail.event.op === 'DELETE') {
      return {
        Id: entity.Id,
        OP: event.detail.event.op,
        OrgKey: entity.OrgKey,
        EntityType: entity.ObjectType,
        PermitAction: 'GENERIC',
      };
    }

    return {
      Id: entity.Id,
      Parents: isRootObjectType(entity.ObjectType)
        ? [
            {
              ParentId: `${entity.ObjectType}-${entity.OrgKey}`,
              ParentType: 'rs_node',
            },
          ]
        : [],
      OP: event.detail.event.op,
      OrgKey: entity.OrgKey,
      EntityType: entity.ObjectType,
      PermitAction: 'GENERIC',
    };
  },
};
