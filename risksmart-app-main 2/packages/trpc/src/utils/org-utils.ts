import { toApiContext } from '../clients/client-utils';
import { dataLayerApiClient } from '../clients/data-layer-api-client';
import type { ServiceContext } from '../services/service.types';
import { mapHttpStatusToTRPCError } from './error-mapping';

export interface OrgDetails {
  OrgKey: string;
  OrgName: string;
}

export const getOrgDetails = async (
  ctx: ServiceContext
): Promise<OrgDetails> => {
  const { data, status } = await dataLayerApiClient.getOrganisation(
    toApiContext(ctx)
  );

  if (status >= 400) {
    throw mapHttpStatusToTRPCError(status, data, {
      404: 'Organisation not found',
    });
  }

  const org = data[0];
  if (!org) {
    throw new Error('Organisation not found');
  }

  return {
    OrgKey: org.OrgKey,
    OrgName: org.Name,
  };
};
