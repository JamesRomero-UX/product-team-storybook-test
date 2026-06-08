import type { ApolloClient } from '@apollo/client';
import type { AccessTypeEnum, ParentTypeEnum } from 'generated/graphql';
import { ContributorTypeEnum } from 'generated/graphql';
import { BadRequest, Forbidden } from 'http-errors';
import { intersection } from 'lodash';
import { getRisksmartApiClient } from 'src/repositories/getRisksmartApiClient';
import { getSessionData } from 'src/session';

import { getHasuraBackendClientForAction } from '../../backendGraphqlClient';
import type { ActionInput } from '../../hasuraActionHelpers';
import { getLogger } from '../../logger';
import { CUSTOMER_SUPPORT_ROLE, SYSTEM_USER } from '../../repositories/types';
import { NodeService } from '../node/node.service';

export interface ObjectWithContributors {
  ancestorContributors?:
    | {
        UserId?: string | null;
        ContributorType?: string | null;
      }[]
    | null;
}

const logger = getLogger();

interface ObjectAccessOptions {
  /** This type of object. */
  objectType: ParentTypeEnum;
  /** The access required e.g can I "UPDATE" this risk */
  accessType: AccessTypeEnum;
  /**
   * This can be the object on which we are checking permissions e.g. can I
   * update a Risk Or the parent of the object of which we are checking
   * permissions e.g. can I insert a control under a Risk It is used to check
   * whether the user is a contributor or owner of the object. If the user is a
   * contributor/owner of this object, they will also be a contributor/owner of
   * any descendant objects
   */
  parentObject?:
    | ObjectWithContributors
    | ObjectWithContributors[]
    | null
    | undefined;
}

export type HasAccessOptions = ObjectAccessOptions & {
  userId: string;
};

export const hasPermission = async (
  hasuraClient: ApolloClient<unknown>,
  { parentObject, accessType, objectType, userId }: HasAccessOptions
) => {
  const apiClient = getRisksmartApiClient(hasuraClient);
  logger.info('Requesting access rules', { objectType, accessType });
  const { role_access } = await apiClient.getRoleAccess({
    AccessType: accessType,
    ObjectType: objectType,
  });

  const parentObjects = Array.isArray(parentObject)
    ? parentObject
    : [parentObject];

  const userContributions = intersection(
    ...parentObjects.map(
      (obj) =>
        (obj?.ancestorContributors ?? [])
          .filter((p) => p.UserId === userId)
          .map((p) => p.ContributorType) ?? []
    )
  );

  return (
    role_access.filter(
      (ra) =>
        ra.ContributorType === ContributorTypeEnum.Any ||
        userContributions.includes(ra.ContributorType)
    ).length > 0
  );
};

export const checkPermission = async <T>(
  request: ActionInput<T>,
  objectType: ParentTypeEnum,
  accessType: AccessTypeEnum,
  objectIds: string | string[]
) => {
  const sessionData = getSessionData(request.session_variables);
  const client = getHasuraBackendClientForAction(request);
  const nodeService = NodeService({
    tenant: sessionData.tenant,
    orgKey: sessionData.orgKey,
    userId: SYSTEM_USER,
    userRole: CUSTOMER_SUPPORT_ROLE,
  });

  const ids = Array.isArray(objectIds) ? objectIds : [objectIds];
  const nodes = await nodeService.findManyByIds(ids);

  if (nodes.length !== ids.length) {
    throw new BadRequest('Object ID(s) not found');
  }

  const check = await hasPermission(client, {
    userId: sessionData.userId,
    objectType,
    accessType,
    parentObject: nodes,
  });

  if (!check) {
    throw new Forbidden('You do not have permission to perform this action');
  }
};
