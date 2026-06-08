import { AccessTypeEnum, ParentTypeEnum } from 'generated/graphql';
import { Forbidden } from 'http-errors';
import { backendRouteHandler } from 'src/backendActionApiHandler';
import { getHasuraBackendClientForAction } from 'src/backendGraphqlClient';
import { getRisksmartApiClient } from 'src/repositories/getRisksmartApiClient';
import { hasPermission } from 'src/services/role-access/roleAccessService';
import { getSessionData } from 'src/session';

import { PostSchema } from './schema';

export const handler = backendRouteHandler(PostSchema, async (body) => {
  const hasuraClient = await getHasuraBackendClientForAction(body);
  const apiClient = getRisksmartApiClient(hasuraClient);
  const sessionData = getSessionData(body.session_variables);
  const input = body.input.object;

  const permissionGranted = await hasPermission(hasuraClient, {
    userId: sessionData.userId,
    objectType: ParentTypeEnum.ThirdParty,
    accessType: AccessTypeEnum.Insert,
  });
  if (!permissionGranted) {
    throw new Forbidden('Access denied');
  }

  const result = await apiClient.insertThirdParty({
    object: {
      Title: input.Title,
      Description: input.Description,
      CustomAttributeData: input.CustomAttributeData,
      CompanyName: input.CompanyName,
      CompaniesHouseNumber: input.CompaniesHouseNumber,
      Address: input.Address,
      CityTown: input.CityTown,
      Postcode: input.Postcode,
      Country: input.Country,
      PrimaryContactName: input.PrimaryContactName,
      ContactName: input.ContactName,
      ContactEmail: input.ContactEmail,
      CompanyDomain: input.CompanyDomain,
      Type: input.Type,
      Status: input.Status,
      Criticality: input.Criticality,
      owners: {
        data: input.OwnerUserIds.map((UserId) => ({ UserId })),
      },
      contributors: {
        data: input.ContributorUserIds.map((UserId) => ({
          UserId,
        })),
      },
      ownerGroups: {
        data: input.OwnerGroupIds.map((UserGroupId) => ({
          UserGroupId,
        })),
      },
      contributorGroups: {
        data: input.ContributorGroupIds.map((UserGroupId) => ({
          UserGroupId,
        })),
      },
      tags: {
        data: input.TagTypeIds.map((TagTypeId) => ({ TagTypeId })),
      },
      departments: {
        data: input.DepartmentTypeIds.map((DepartmentTypeId) => ({
          DepartmentTypeId,
        })),
      },
    },
  });
  const thirdPartyId = result.insert_third_party_one?.Id;
  if (!thirdPartyId) {
    throw new Error('Missing third party id');
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      Id: thirdPartyId,
    }),
  };
});
