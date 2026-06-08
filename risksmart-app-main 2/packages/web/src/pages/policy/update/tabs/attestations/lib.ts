import type { GetGlobalUsersAndGroupsQuery } from '@risksmart-app/web-graphql-client/generated/graphql';

export const calculateTotalUsers = ({
  query,
  groups,
  attestationForEveryone,
}: {
  query: GetGlobalUsersAndGroupsQuery | undefined;
  groups: {
    value: string;
    type: 'user' | 'userGroup';
  }[];
  attestationForEveryone: boolean;
}): { userIds: string[] } => {
  if (!query) {
    return { userIds: [] };
  }

  const globalUserIds = query.globalUsers.nodes
    .map((user) => user.Id)
    .filter((id): id is string => typeof id === 'string');

  // find unique users from selected groups
  const uniqueUsersForSelectedGroups = new Set(
    query.userGroups.flatMap((group) =>
      groups?.map((g) => g.value).includes(group.Id)
        ? group.users.map((user) => user.UserId)
        : []
    )
  );

  if (attestationForEveryone) {
    return { userIds: globalUserIds };
  }

  return { userIds: Array.from(uniqueUsersForSelectedGroups) };
};
