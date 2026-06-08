import type { EventBridgeEvent } from 'aws-lambda';
import type { DataChangeEvent } from 'src/handlers/events/DataChangeEvent';

import type { EntityPermitProcessor } from '../types';

export const userGroupUser: {
  name: string;
  entityPermitProcessor: EntityPermitProcessor;
} = {
  name: 'user_group_user',
  entityPermitProcessor: async <
    T extends { OrgKey: string; UserId: string; UserGroupId: string },
  >(
    _: string,
    event: EventBridgeEvent<string, DataChangeEvent<T, 'action'>>
  ) => {
    const entity = event.detail.event.data.new ?? event.detail.event.data.old;
    if (!entity) {
      throw new Error('No entity');
    }

    return {
      Id: entity.UserGroupId,
      OP: event.detail.event.op,
      OrgKey: entity.OrgKey,
      EntityType: 'user_group_user',
      PermitAction: 'GROUP-USER',
      UserId: entity.UserId,
    };
  },
};
