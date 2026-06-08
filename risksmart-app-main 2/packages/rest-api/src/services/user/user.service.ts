import { getBackendRestApiClient } from 'src/repositories/getBackendRestApiClient';

import type { ServiceOptions } from '../types';

export const UserService = (opts: ServiceOptions) => {
  const apiClient = getBackendRestApiClient(opts);

  return {
    async findAll() {
      return (await apiClient.getUsers({})).user;
    },
    async findById(id: string) {
      return (await apiClient.getUsers({ where: { Id: { _eq: id } } })).user;
    },
    async findByGroupIds(groupIds: string[]) {
      return (
        await apiClient.getUsers({
          where: { group_memberships: { UserGroupId: { _in: groupIds } } },
        })
      ).user;
    },
  };
};
