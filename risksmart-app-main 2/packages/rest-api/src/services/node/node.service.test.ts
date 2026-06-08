import type { Mock } from 'vitest';
import { describe, expect, it, vi } from 'vitest';

import { NodeRepository } from '../../repositories/node/node.repository';
import type { ServiceOptions } from '../types';
import { NodeService } from './node.service';

vi.mock('../../repositories/node/node.repository');

describe('NodeService', () => {
  const mockOpts: ServiceOptions = {
    tenant: '',
    orgKey: '',
    userId: '',
    userRole: '',
  };
  const nodeRepoMock = {
    findWhere: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (NodeRepository as unknown as Mock).mockReturnValue(nodeRepoMock);
  });

  describe('findManyByIds', () => {
    it('should return nodes for given ids', async () => {
      const ids = ['1', '2', '3'];
      const expectedNodes = [{ Id: '1' }, { Id: '2' }, { Id: '3' }];
      nodeRepoMock.findWhere.mockResolvedValue(expectedNodes);

      const nodeService = NodeService(mockOpts);
      const nodes = await nodeService.findManyByIds(ids);

      expect(nodeRepoMock.findWhere).toHaveBeenCalledWith({ Id: { _in: ids } });
      expect(nodes).toEqual(expectedNodes);
    });
  });

  describe('findById', () => {
    it('should return node for given id', async () => {
      const objectId = '1';
      const expectedNode = { Id: '1' };
      nodeRepoMock.findWhere.mockResolvedValue([expectedNode]);

      const nodeService = NodeService(mockOpts);
      const node = await nodeService.findById(objectId);

      expect(nodeRepoMock.findWhere).toHaveBeenCalledWith(
        { Id: { _eq: objectId } },
        { limit: 1 }
      );
      expect(node).toEqual(expectedNode);
    });

    it('should throw an error if node not found', async () => {
      const objectId = '1';
      nodeRepoMock.findWhere.mockResolvedValue([]);

      const nodeService = NodeService(mockOpts);

      await expect(nodeService.findById(objectId)).rejects.toThrow(
        'Node not found'
      );
    });
  });

  describe('findObjectOwners', () => {
    it('should return owners for given object id', async () => {
      const objectId = '1';
      const expectedNode = {
        Id: '1',
        ancestorContributors: [
          { ContributorType: 'owner', name: 'Owner1' },
          { ContributorType: 'editor', name: 'Editor1' },
        ],
      };
      nodeRepoMock.findWhere.mockResolvedValue([expectedNode]);

      const nodeService = NodeService(mockOpts);
      const owners = await nodeService.findObjectOwners(objectId);

      expect(nodeRepoMock.findWhere).toHaveBeenCalledWith(
        { Id: { _eq: objectId } },
        { limit: 1 }
      );
      expect(owners).toEqual([{ ContributorType: 'owner', name: 'Owner1' }]);
    });

    it('should return empty array if no owners found', async () => {
      const objectId = '1';
      const expectedNode = {
        Id: '1',
        ancestorContributors: [{ ContributorType: 'editor', name: 'Editor1' }],
      };
      nodeRepoMock.findWhere.mockResolvedValue([expectedNode]);

      const nodeService = NodeService(mockOpts);
      const owners = await nodeService.findObjectOwners(objectId);

      expect(nodeRepoMock.findWhere).toHaveBeenCalledWith(
        { Id: { _eq: objectId } },
        { limit: 1 }
      );
      expect(owners).toEqual([]);
    });
  });
});
