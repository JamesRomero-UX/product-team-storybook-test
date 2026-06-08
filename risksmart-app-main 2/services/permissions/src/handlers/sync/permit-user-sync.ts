import type { Logger } from '@aws-lambda-powertools/logger';

import type { TenantSyncStats } from './common';

type UserRetriever = () => Promise<
  {
    Id: string;
  }[]
>;

type UserCreator = (userIds: string[]) => Promise<void>;

interface Dependencies {
  userRetriever: UserRetriever;
  userCreator: UserCreator;
  syncStats: TenantSyncStats;
  tenantLogger: Logger;
  permitUserMap: Map<string, unknown>;
  unassignedUsers: Set<string>;
}

export const createUserSyncHandler = (dependencies: Dependencies) => {
  const syncExecutor = async () => {
    await executeUserSync(dependencies);
  };

  return {
    executeUserSync: syncExecutor,
  };
};

export const executeUserSync = async (input: Dependencies) => {
  const {
    userRetriever,
    userCreator,
    syncStats,
    tenantLogger,
    permitUserMap,
    unassignedUsers,
  } = input;
  // Process users
  tenantLogger.info('Processing users');
  const orgUsers = await userRetriever();

  tenantLogger.info('Got orgUsers from DB', {
    orgUserCount: orgUsers.length,
  });

  // Filter out users that already exist in Permit (either assigned or unassigned)
  const nonPermitUsers = orgUsers.filter(
    (c) => !permitUserMap.has(c.Id) && !unassignedUsers.has(c.Id)
  );

  if (nonPermitUsers.length > 0) {
    tenantLogger.info('Bulk creating users', {
      userCount: nonPermitUsers.length,
    });
    await userCreator(nonPermitUsers.map((user) => user.Id));
    // Update sync stats
    syncStats.usersCreated += nonPermitUsers.length;
  }
  tenantLogger.info('Created users');
};
