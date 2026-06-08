import type { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import type {
  AppetiteParent,
  AppetiteParentInsertInput,
  Risk,
} from 'generated/graphql';
import {
  deleteAppetiteParent,
  getLatestAppetitesForRisk,
  insertAppetiteParents,
} from 'src/services/appetite/appetiteService';
import { getChildRiskIds, getRisk } from 'src/services/risk/riskService';

import type { AppetiteCascadingConfig } from '../types';

export const cascade = async (
  hasuraClient: ApolloClient<NormalizedCacheObject>,
  appetiteParent: AppetiteParent,
  config: AppetiteCascadingConfig | undefined
) => {
  const parent = await getRisk(hasuraClient, { Id: appetiteParent.ParentId });
  const isTierThree = parent?.[0]?.Tier === 3;
  const isTierTwo = parent?.[0]?.Tier === 2;

  if (isTierThree || (isTierTwo && !config?.enableTierTwoCascading)) {
    return;
  }

  const children = await getChildRiskIds(hasuraClient, appetiteParent.ParentId);

  const insertPayload = children.map((child) => ({
    Id: appetiteParent.Id,
    ParentId: child.Id,
    OrgKey: appetiteParent.OrgKey,
    CreatedAtTimestamp: new Date().toISOString(),
    CreatedByUser: appetiteParent.CreatedByUser,
    ModifiedAtTimestamp: new Date().toISOString(),
    ModifiedByUser: appetiteParent.ModifiedByUser,
  })) as AppetiteParentInsertInput[];

  if (insertPayload.length === 0) {
    return;
  }

  await insertAppetiteParents(hasuraClient, { objects: insertPayload });
};

export const inheritAppetite = async (
  hasuraClient: ApolloClient<NormalizedCacheObject>,
  risk: Pick<
    Risk,
    | 'Id'
    | 'Tier'
    | 'ParentRiskId'
    | 'OrgKey'
    | 'CreatedByUser'
    | 'CreatedAtTimestamp'
    | 'ModifiedByUser'
  >
) => {
  if (risk.Tier === 1 || !risk.ParentRiskId) {
    return;
  }

  const appetites = await getLatestAppetitesForRisk(hasuraClient, {
    riskId: risk.ParentRiskId,
  });

  if (!appetites || appetites?.length === 0) {
    return;
  }

  const objects = appetites.map((appetite) => ({
    Id: appetite.Id,
    ParentId: risk.Id,
    OrgKey: risk.OrgKey,
    CreatedAtTimestamp: new Date().toISOString(),
    CreatedByUser: risk.CreatedByUser,
    ModifiedAtTimestamp: new Date().toISOString(),
    ModifiedByUser: risk.ModifiedByUser,
  }));

  await insertAppetiteParents(hasuraClient, {
    objects,
  });
};

/*
 * Removes the Appetite linked items from child risks associated with this parent
 * If the Appetite is deleted than de linked items will be removed as part of the SQL cascade
 * */
export const unlinkChildRiskAppetites = async (
  hasuraClient: ApolloClient<NormalizedCacheObject>,
  appetiteParent: AppetiteParent
) => {
  const parent = await getRisk(hasuraClient, { Id: appetiteParent.ParentId });
  const isTierThree = parent?.[0]?.Tier === 3;

  if (isTierThree) {
    return;
  }

  const children = await getChildRiskIds(hasuraClient, appetiteParent.ParentId);

  await Promise.all(
    children.map(
      async (child) =>
        await deleteAppetiteParent(hasuraClient, {
          AppetiteId: appetiteParent.Id,
          ParentId: child.Id,
        })
    )
  );
};
