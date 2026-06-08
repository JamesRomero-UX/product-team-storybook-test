import { ApprovalStatus } from '@risksmart-app/domain/src/types/consts/approval-status';
import { createDrizzleClient } from '@risksmart-app/drizzle/src/db';
import {
  getChangeRequestsRegisterQueryConfig,
  getPendingChangeRequestsQueryConfig,
} from '@risksmart-app/drizzle/src/queries/change-request.query';
import { filter } from '@risksmart-app/permitio/src/permit';
import _ from 'lodash';

import type {
  ChangeRequestRegisterResponse,
  ChangeRequestResponseRow,
  PendingChangeRequestResponseRow,
} from '../../types/index';
import type { ChangeRequestService, ServiceContext } from '../service.types';

export class ChangeRequestServiceImpl implements ChangeRequestService {
  async getChangeRequestsRegister(
    ctx: ServiceContext
  ): Promise<ChangeRequestRegisterResponse> {
    const db = await createDrizzleClient(ctx);

    // Query change requests with comprehensive relationships
    const data = await db.org((tx) => {
      return tx.query.change_request.findMany({
        ...getChangeRequestsRegisterQueryConfig,
      });
    });

    const dataWithCurrentUserOwnerList = data.map((item) => ({
      ...item,
      currentUserOwnerList: _.uniqBy(
        item.parentOwnerAndContributors.filter(
          (contributor) =>
            contributor.UserId === ctx.userId &&
            contributor.ContributorType === 'owner'
        ) || [],
        'UserId'
      ),
    }));

    const dataWithParentOwners = dataWithCurrentUserOwnerList.map((item) => ({
      ...item,
      parentOwners: _.uniqBy(
        item.parentOwnerAndContributors.filter(
          (contributor) => contributor.ContributorType === 'owner'
        ) || [],
        'UserId'
      ),
    }));

    // Filter change requests based on permissions - the user should only see
    // change requests where they have access to the parent entity
    const filteredChangeRequests = await filter<ChangeRequestResponseRow>(
      dataWithParentOwners,
      'rs_node',
      (entity: ChangeRequestResponseRow) => entity.ParentId,
      ctx.userId,
      ctx.orgId
    );

    return {
      change_request: filteredChangeRequests,
    };
  }

  async getPendingChangeRequests(ctx: ServiceContext, parentId: string) {
    const db = await createDrizzleClient(ctx);
    const data = await db.org((tx) => {
      return tx.query.change_request.findMany({
        where: {
          ParentId: parentId,
          ChangeRequestStatus: ApprovalStatus.Pending,
        },
        ...getPendingChangeRequestsQueryConfig,
      });
    });

    const filteredPendingChangeRequests =
      await filter<PendingChangeRequestResponseRow>(
        data,
        'rs_node',
        (entity) => entity.Id,
        ctx.userId,
        ctx.orgId
      );

    return filteredPendingChangeRequests;
  }
}
