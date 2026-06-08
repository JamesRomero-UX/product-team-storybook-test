import { toApiContext } from '../../clients/client-utils';
import { dataLayerApiClient } from '../../clients/data-layer-api-client';
import { mapDataLayerError } from '../../utils/error-mapping';
import type { ServiceContext, UserGroupService } from '../service.types';

export class UserGroupServiceImpl implements UserGroupService {
  async getById(ctx: ServiceContext, id: string) {
    try {
      const { data } = await dataLayerApiClient.getUserGroupById(
        toApiContext(ctx),
        id
      );

      return data;
    } catch (error) {
      mapDataLayerError(error, { 404: 'User group not found' });
    }
  }

  async getUsersByGroupId(ctx: ServiceContext, groupId: string) {
    try {
      const { data } = await dataLayerApiClient.getUsersByGroupId(
        toApiContext(ctx),
        groupId
      );

      return data;
    } catch (error) {
      mapDataLayerError(error, { 404: 'User group not found' });
    }
  }

  async getUserGroupsWithApprovers(ctx: ServiceContext) {
    try {
      const { data } = await dataLayerApiClient.getUserGroupsWithApprovers(
        toApiContext(ctx)
      );

      return data;
    } catch (error) {
      mapDataLayerError(error);
    }
  }
}
