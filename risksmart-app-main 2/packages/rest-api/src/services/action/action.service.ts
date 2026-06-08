import { BadRequest } from 'http-errors';
import { ModifiedSinceLastViewError } from 'src/errors/ModifiedSinceLastViewError';

import type {
  ActionInsertInput,
  RelationFileInsertInput,
} from '../../../generated/graphql';
import { ParentTypeEnum } from '../../../generated/graphql';
import type {
  UpdateByPkInput,
  UpdateInput,
} from '../../repositories/action/action.repository';
import { ActionRepository } from '../../repositories/action/action.repository';
import { NodeService } from '../node/node.service';
import type { ServiceOptions } from '../types';

export const ActionService = (opts: ServiceOptions) => {
  const actionRepo = ActionRepository(opts);
  const nodeService = NodeService(opts);
  const allowedParentTypes: ParentTypeEnum[] = [ParentTypeEnum.Risk];

  return {
    async findById(id: string) {
      const actions = await actionRepo.findWhere(
        {
          Id: { _eq: id },
        },
        { limit: 1 }
      );
      if (!actions[0]) {
        throw new BadRequest('Action not found');
      }

      return actions[0];
    },

    async create(parentId: string, data: ActionInsertInput) {
      const { ObjectType } = await nodeService.findById(parentId);
      if (!allowedParentTypes.includes(ObjectType)) {
        throw new Error(`Invalid parent type: ${ObjectType}`);
      }

      const result = await actionRepo.create([data]);

      if (!result[0]) {
        throw new Error('Action not created');
      }

      await actionRepo.createParentLink({
        ActionId: result[0].Id,
        ParentId: parentId,
        ParentType: ObjectType,
      });

      return result[0];
    },

    async update(id: string, userId: string, data: UpdateInput) {
      const result = await actionRepo.update(
        {
          Id: { _eq: id },
        },
        data
      );
      if (!result[0]) {
        throw new BadRequest('Action not found');
      }

      return result[0];
    },

    async updateByPk(id: string, userId: string, data: UpdateByPkInput) {
      const action = await this.findById(id);
      if (
        new Date(action.ModifiedAtTimestamp).valueOf() !==
        new Date(data.OriginalTimestamp).valueOf()
      ) {
        throw new ModifiedSinceLastViewError();
      }
      const result = await actionRepo.updateByPk(id, data);

      // 0 records being updated is most likely a permission issue which we need to resolve,
      // or the action has been deleted in the small time window between getting it above, and performing the update
      if (!result) {
        throw new Error('Failed to update action');
      }

      return result;
    },

    async updateWithFiles(
      id: string,
      data: UpdateByPkInput,
      addedFiles: RelationFileInsertInput[],
      deletedFilesIds: string[]
    ) {
      const action = await this.findById(id);
      if (
        new Date(action.ModifiedAtTimestamp).valueOf() !==
        new Date(data.OriginalTimestamp).valueOf()
      ) {
        throw new ModifiedSinceLastViewError();
      }

      const result = await actionRepo.updateWithFiles(
        data,
        addedFiles,
        deletedFilesIds
      );

      if (!result) {
        throw new Error('Failed to update action');
      }

      return result;
    },

    async delete(id: string | string[]) {
      return actionRepo.delete(id);
    },
  };
};
