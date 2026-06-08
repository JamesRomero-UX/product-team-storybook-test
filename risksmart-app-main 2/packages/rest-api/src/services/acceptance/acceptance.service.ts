import { BadRequest } from 'http-errors';

import type { AcceptanceInsertInput } from '../../../generated/graphql';
import { ParentTypeEnum } from '../../../generated/graphql';
import type { UpdateInput } from '../../repositories/acceptance/acceptance.repository';
import { AcceptanceRepository } from '../../repositories/acceptance/acceptance.repository';
import { NodeService } from '../node/node.service';
import type { ServiceOptions } from '../types';

export const AcceptanceService = (opts: ServiceOptions) => {
  const acceptanceRepo = AcceptanceRepository(opts);
  const nodeService = NodeService(opts);
  const allowedParentTypes: ParentTypeEnum[] = [ParentTypeEnum.Risk];

  return {
    async findById(id: string) {
      const acceptances = await acceptanceRepo.findWhere(
        {
          Id: { _eq: id },
        },
        { limit: 1 }
      );
      if (!acceptances[0]) {
        throw new BadRequest('Acceptance not found');
      }

      return acceptances[0];
    },

    async create(parentId: string, data: AcceptanceInsertInput) {
      const { ObjectType } = await nodeService.findById(parentId);
      if (!allowedParentTypes.includes(ObjectType)) {
        throw new Error(`Invalid parent type: ${ObjectType}`);
      }

      const result = await acceptanceRepo.create([data]);

      if (!result[0]) {
        throw new Error('Acceptance not created');
      }

      await acceptanceRepo.createParentLink({
        Id: result[0].Id,
        ParentId: parentId,
      });

      return result[0];
    },

    async update(id: string, userId: string, data: UpdateInput) {
      const result = await acceptanceRepo.update(
        {
          Id: { _eq: id },
        },
        data
      );
      if (!result[0]) {
        throw new BadRequest('Acceptance not found');
      }

      return result[0];
    },

    async delete(id: string | string[]) {
      return acceptanceRepo.delete(id);
    },
  };
};
