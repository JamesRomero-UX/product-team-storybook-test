import { NodeRepository } from '../../repositories/node/node.repository';
import type { ServiceOptions } from '../types';

export const NodeService = (opts: ServiceOptions) => {
  const nodeRepo = NodeRepository(opts);

  return {
    async findManyByIds(ids: string[]) {
      const nodes = await nodeRepo.findWhere({
        Id: { _in: ids },
      });

      return nodes;
    },

    async findById(objectId: string) {
      const node = await nodeRepo.findWhere(
        {
          Id: { _eq: objectId },
        },
        {
          limit: 1,
        }
      );
      if (!node[0]) {
        throw new Error('Node not found');
      }

      return node[0];
    },

    async findObjectOwners(objectId: string) {
      const node = await this.findById(objectId);

      return (
        node.ancestorContributors?.filter(
          (contributor) => contributor.ContributorType === 'owner'
        ) ?? []
      );
    },
  };
};
