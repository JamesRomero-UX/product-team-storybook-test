import type { GetChangeRequestsQuery } from '@risksmart-app/web-graphql-client/generated/graphql';

export type ChangeRequestResponses =
  GetChangeRequestsQuery['change_request'][0]['responses'];

/*
 * TODO: All this logic needs to be refactored.
 *  Currently there is nothing on the response that guarantees the order of approvers when the global and object levels approvers are merge together.
 *  It works for now, but we need a consistent and predictable way to determine the order of approvers.
 *  A fix is in planning, please consider this before extending this logic further.
 * */

const getUniqueLevelIds = (responses: ChangeRequestResponses) =>
  Array.from(new Set(responses.map((r) => r.approver.level?.Id)));

const getCurrentLevelId = (responses: ChangeRequestResponses) => {
  const firstUnapproved = responses.find((response) => !response.Approved);

  return firstUnapproved?.approver.level?.Id;
};

export const getMaxLevel = (responses: ChangeRequestResponses) => {
  if (!responses || responses.length === 0) {
    return 0;
  }

  return getUniqueLevelIds(responses).length;
};

export const getCurrentLevel = (responses: ChangeRequestResponses) => {
  if (!responses || responses.length === 0) {
    return 0;
  }

  // Group responses by level and track approval status
  // Only mark a level as approved if all approvers in that level have approved
  const levelStatus = new Map<string, { total: number; approved: number }>();

  for (const response of responses) {
    const levelId = response.approver.level?.Id;
    if (!levelId) {
      continue;
    }

    if (!levelStatus.has(levelId)) {
      levelStatus.set(levelId, { total: 0, approved: 0 });
    }

    const status = levelStatus.get(levelId)!;
    status.total++;
    if (response.Approved === true) {
      status.approved++;
    }
  }

  // Start at level 1 and increment for each level where all approvers have approved
  let currentLevel = 1;

  levelStatus.forEach(({ total, approved }) => {
    if (total === approved) {
      currentLevel++;
    }
  });

  return currentLevel;
};

const groupApproversByLevel = (responses: ChangeRequestResponses) => {
  const levelGroups = new Map<
    string | null,
    Array<{ id: string; label: string }>
  >();

  responses.forEach((response) => {
    const levelId = response.approver.level?.Id ?? null;

    const approver = {
      id: response.approver.OwnerApprover
        ? 'owner'
        : (response.approver.user?.Id ?? response.approver.group?.Id ?? ''),
      label: response.approver.OwnerApprover
        ? 'Owner'
        : (response.approver.user?.FriendlyName ??
          response.approver.group?.Name ??
          ''),
    };

    if (!levelGroups.has(levelId)) {
      levelGroups.set(levelId, []);
    }
    levelGroups.get(levelId)!.push(approver);
  });

  return levelGroups;
};

const getNextLevelId = (responses: ChangeRequestResponses): string | null => {
  const currentLevelId = getCurrentLevelId(responses);

  if (!currentLevelId) {
    return null;
  }

  // Find first different level after current level
  let foundCurrent = false;
  for (const response of responses) {
    const levelId = response.approver.level?.Id ?? null;

    if (foundCurrent && levelId !== currentLevelId) {
      return levelId;
    }

    if (levelId === currentLevelId) {
      foundCurrent = true;
    }
  }

  return null;
};

export const getCurrentApprovers = (responses: ChangeRequestResponses) => {
  if (responses.length === 0) {
    return [];
  }

  const currentLevelId = getCurrentLevelId(responses);
  if (!currentLevelId) {
    return [];
  }

  const levelGroups = groupApproversByLevel(responses);

  return levelGroups.get(currentLevelId) ?? [];
};

export const getNextApprovers = (responses: ChangeRequestResponses) => {
  if (responses.length === 0) {
    return [];
  }

  const pendingResponses = responses.filter((response) => !response.Approved);
  const nextLevelId = getNextLevelId(pendingResponses);
  if (!nextLevelId) {
    return [];
  }

  const levelGroups = groupApproversByLevel(responses);

  return levelGroups.get(nextLevelId) ?? [];
};
