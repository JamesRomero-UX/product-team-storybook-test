import {
  GetAncestorContributorsForObjectDocument,
  GetCreatorForObjectDocument,
  GetDepartmentsForObjectDocument,
  GetOrgUsersByRoleDocument,
  GetOwnerGroupsForObjectDocument,
  GetOwnersForObjectDocument,
  GetUserContributorsForObjectDocument,
  GetUserGroupContributorsForObjectDocument,
} from 'generated/graphql';
import { getHasuraClient } from 'src/graphqlClient';
import { Config } from 'sst/node/config';

import { getLogger } from '../../logger';
import type { NotificationArrayObject } from './utilities';
const logger = getLogger();

export const getOrgRiskManagerIds = async ({
  orgKey,
  tenant,
}: {
  orgKey: string;
  tenant: string;
}) => {
  logger.info('Requesting risk managers', { orgKey });
  const hasuraClient = await getHasuraClient({
    tenantName: tenant,
    adminSecret: Config.HASURA_ADMIN_SECRET,
  });

  const { data, errors } = await hasuraClient.query({
    query: GetOrgUsersByRoleDocument,
    variables: {
      orgKey: orgKey,
      roleKey: 'RiskManager',
    },
  });

  if (errors) {
    errors.map((e) => logger.error(e.message, e as Error));
    throw new Error('Failed to retrieve users');
  }

  if (data.user.length === 0) {
    logger.info('No users found');
  }

  return data.user
    .filter((user) => {
      if (user?.Status === 'archived') {
        logger.warn(
          'Archived user found in org users query result, filtering out',
          {
            userId: user?.Id,
          }
        );

        return false;
      }

      return true;
    })
    .map((u) => u.Id!);
};

export const getRecipientObjects = async ({
  objectId: objectId,
  orgKey,
  eventKey,
  departmentIds,
}: {
  objectId: string;
  orgKey: string;
  eventKey: string;
  departmentIds?: string[];
}) => {
  const eventDepartments = departmentIds?.map((departmentId) => {
    return {
      id: `${orgKey}-${eventKey}-${departmentId}`,
      collection: 'org-events-departments',
      name: `${orgKey}-${eventKey}-${departmentId}`,
      org_id: orgKey,
    };
  });

  const event = {
    id: `${orgKey}-${eventKey}`,
    collection: 'org-events',
    name: `${orgKey}-${eventKey}`,
    org_id: orgKey,
  };

  const object = {
    id: `${orgKey}-${eventKey}-${objectId}`,
    collection: 'org-events-objects',
    name: `${orgKey}-${eventKey}-${objectId}`,
    org_id: orgKey,
  };

  return [event, object, ...(eventDepartments ?? [])];
};

export const getObjectDepartments = async ({
  objectId: objectId,
  tenant,
}: {
  objectId: string;
  tenant: string;
}): Promise<string[]> => {
  logger.info('Requesting departments', { objectId });
  const hasuraClient = getHasuraClient({
    tenantName: tenant,
    adminSecret: Config.HASURA_ADMIN_SECRET,
  });

  const { data, errors } = await hasuraClient.query({
    query: GetDepartmentsForObjectDocument,
    variables: {
      Id: objectId,
    },
  });

  if (errors) {
    errors.map((e) => logger.error(e.message, e as Error));
    throw new Error('Failed to get departments');
  }

  // return if any the department type Ids where type is not null
  return data.department
    .map((d) => d.type?.DepartmentTypeId)
    .filter((d) => d !== undefined);
};

export const getObjectOwners = async ({
  objectId: objectId,
  tenant,
}: {
  objectId: string;
  tenant: string;
}) => {
  logger.info('Requesting owners', { objectId });
  const hasuraClient = getHasuraClient({
    tenantName: tenant,
    adminSecret: Config.HASURA_ADMIN_SECRET,
  });

  const { data, errors } = await hasuraClient.query({
    query: GetOwnersForObjectDocument,
    variables: {
      Id: objectId,
    },
  });

  if (errors) {
    errors.map((e) => logger.error(e.message, e as Error));
    throw new Error('Failed to get owners');
  }

  //Return array of the users, filtering out any archived users as an additional safety check
  return data?.owner
    .filter((owner) => {
      if (owner.user?.Status === 'archived') {
        logger.warn(
          'Archived user found in owners query result, filtering out',
          {
            userId: owner.user?.Id,
            userEmail: owner.user?.Email,
          }
        );

        return false;
      }

      return true;
    })
    .map((owner) => {
      return {
        id: owner.user?.Id,
        email: owner.user?.Email,
        name: owner.user?.UserName,
      };
    });
};

export const getObjectOwnerGroups = async ({
  objectId: objectId,
  tenant,
}: {
  objectId: string;
  tenant: string;
}) => {
  logger.info('Requesting owner groups', { objectId });
  const hasuraClient = getHasuraClient({
    tenantName: tenant,
    adminSecret: Config.HASURA_ADMIN_SECRET,
  });

  const { data, errors } = await hasuraClient.query({
    query: GetOwnerGroupsForObjectDocument,
    variables: {
      Id: objectId,
    },
  });

  if (errors) {
    errors.map((e) => logger.error(e.message, e as Error));
    throw new Error('Failed to get owner groups');
  }

  //Return array of the users
  return data?.owner_group.map((group) => {
    return {
      id: group.group?.Id,
      email: group.group?.Email,
      name: group.group?.Name,
    };
  });
};

export const getObjectContributors = async ({
  objectId: objectId,
  tenant,
}: {
  objectId: string;
  tenant: string;
}) => {
  logger.info('Requesting contributors', { objectId });
  const hasuraClient = getHasuraClient({
    tenantName: tenant,
    adminSecret: Config.HASURA_ADMIN_SECRET,
  });

  const { data, errors } = await hasuraClient.query({
    query: GetUserContributorsForObjectDocument,
    variables: {
      Id: objectId,
    },
  });

  if (errors) {
    errors.map((e) => logger.error(e.message, e as Error));
    throw new Error('Failed to get contributors');
  }

  return data?.contributor
    .filter((contributor) => {
      if (contributor.user?.Status === 'archived') {
        logger.warn(
          'Archived user found in contributors query result, filtering out',
          {
            userId: contributor.user?.Id,
            userEmail: contributor.user?.Email,
          }
        );

        return false;
      }

      return true;
    })
    .map((contributor) => {
      return {
        id: contributor.user?.Id,
        email: contributor.user?.Email,
        name: contributor.user?.UserName,
      };
    });
};

export const getAncestorContributors = async ({
  objectId: objectId,
  tenant,
}: {
  objectId: string;
  tenant: string;
}) => {
  logger.info('Requesting ancestor contributors', { objectId });
  const hasuraClient = getHasuraClient({
    tenantName: tenant,
    adminSecret: Config.HASURA_ADMIN_SECRET,
  });

  const { data, errors } = await hasuraClient.query({
    query: GetAncestorContributorsForObjectDocument,
    variables: {
      Id: objectId,
    },
  });

  if (errors) {
    errors.map((e) => logger.error(e.message, e as Error));
    throw new Error('Failed to get contributors');
  }

  const userAncestors = data?.ancestor_contributor
    .filter(
      (contributor) =>
        contributor.user_group === null &&
        contributor.AncestorId !== contributor.Id
    )
    .filter((contributor) => {
      if (contributor.user?.Status === 'archived') {
        logger.warn(
          'Archived user found in ancestor contributors query result, filtering out',
          {
            userId: contributor.user?.Id,
            userEmail: contributor.user?.Email,
          }
        );

        return false;
      }

      return true;
    })
    .map((contributor) => {
      return {
        group: false,
        id: contributor.user?.Id,
        email: contributor.user?.Email,
        name: contributor.user?.UserName,
      };
    });

  const groupAncestors = data?.ancestor_contributor
    .filter((contributor) => contributor.user_group !== null)
    .map((contributor) => {
      return {
        group: true,
        id: contributor.user_group?.Id,
        email: contributor.user_group?.Email,
        name: contributor.user_group?.Name,
      };
    });

  return [
    ...(userAncestors.length ? userAncestors : []),
    ...(groupAncestors.length ? groupAncestors : []),
  ];
};

export const getObjectContributorsGroups = async ({
  objectId: objectId,
  tenant,
}: {
  objectId: string;
  tenant: string;
}) => {
  logger.info('Requesting contributor groups', { objectId });
  const hasuraClient = getHasuraClient({
    tenantName: tenant,
    adminSecret: Config.HASURA_ADMIN_SECRET,
  });

  const { data, errors } = await hasuraClient.query({
    query: GetUserGroupContributorsForObjectDocument,
    variables: {
      Id: objectId,
    },
  });

  if (errors) {
    errors.map((e) => logger.error(e.message, e as Error));
    throw new Error('Failed to get contributors');
  }

  return data?.contributor_group.map((contributor) => {
    return {
      id: contributor.group?.Id,
      email: contributor.group?.Email,
      name: contributor.group?.Name,
    };
  });
};

export const getObjectModifiedUser = async ({
  objectId: objectId,
  tenant,
  orgKey,
}: {
  objectId: string;
  tenant: string;
  orgKey: string;
}) => {
  logger.info('Requesting user that modified', { objectId });
  const hasuraClient = getHasuraClient({
    tenantName: tenant,
    adminSecret: Config.HASURA_ADMIN_SECRET,
  });

  const { data, errors } = await hasuraClient.query({
    query: GetCreatorForObjectDocument,
    variables: {
      Id: objectId,
      OrgKey: orgKey,
    },
  });

  if (errors) {
    errors.map((e) => logger.error(e.message, e as Error));
    throw new Error('Failed to get modifier');
  }

  //Return array of the users (including archived users since we want to show who performed the action)
  return data?.user.map((user) => {
    return {
      id: user?.Id,
      email: user?.Email,
      name: user?.UserName,
    };
  });
};

/**
 * Fetches owners and contributors from all direct parents of an object.
 * This is used to limit notifications to only direct parent contributors
 * instead of all ancestors in the hierarchy.
 */
export const getDirectParentContributors = async ({
  parentIds,
  tenant,
  orgKey,
}: {
  parentIds: string[];
  tenant: string;
  orgKey: string;
}): Promise<NotificationArrayObject[]> => {
  if (parentIds.length === 0) {
    return [];
  }

  logger.info('Requesting direct parent contributors', {
    parentIds,
    parentCount: parentIds.length,
  });

  const allContributors: NotificationArrayObject[] = [];

  // Fetch owners and contributors for each parent
  for (const parentId of parentIds) {
    // Get owners
    const owners = await getObjectOwners({ objectId: parentId, tenant });
    for (const owner of owners) {
      if (owner.id && owner.email && owner.name) {
        allContributors.push({
          id: owner.id,
          email: owner.email,
          name: owner.name,
        });
      }
    }

    // Get contributors
    const contributors = await getObjectContributors({
      objectId: parentId,
      tenant,
    });
    for (const contributor of contributors) {
      if (contributor.id && contributor.email && contributor.name) {
        allContributors.push({
          id: contributor.id,
          email: contributor.email,
          name: contributor.name,
        });
      }
    }

    // Get owner groups
    const ownerGroups = await getObjectOwnerGroups({
      objectId: parentId,
      tenant,
    });
    for (const group of ownerGroups) {
      if (group.id && group.email && group.name) {
        allContributors.push({
          collection: 'Org-user-groups',
          id: `${orgKey}-${group.id}`,
          email: group.email,
          name: group.name,
        });
      }
    }

    // Get contributor groups
    const contributorGroups = await getObjectContributorsGroups({
      objectId: parentId,
      tenant,
    });
    for (const group of contributorGroups) {
      if (group.id && group.email && group.name) {
        allContributors.push({
          collection: 'Org-user-groups',
          id: `${orgKey}-${group.id}`,
          email: group.email,
          name: group.name,
        });
      }
    }
  }

  // Deduplicate by id
  const uniqueContributors = allContributors.reduce<NotificationArrayObject[]>(
    (acc, contributor) => {
      if (!acc.some((c) => c.id === contributor.id)) {
        acc.push(contributor);
      }

      return acc;
    },
    []
  );

  logger.info('Found direct parent contributors', {
    totalCount: uniqueContributors.length,
  });

  return uniqueContributors;
};
