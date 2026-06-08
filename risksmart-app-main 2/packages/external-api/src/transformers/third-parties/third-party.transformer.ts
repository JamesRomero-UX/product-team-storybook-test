import type {
  ThirdPartyByIdResponse,
  ThirdPartyListQueryResponse,
} from '../../clients/client.interface';
import { resourceSchemas } from '../../schemas/index';
import type {
  ThirdPartyItemResponse,
  ThirdPartyListResponse,
} from '../../schemas/schema.types';
import type {
  DataEntityTransformFn,
  ListDataTransformFn,
} from '../../types/transform';
import {
  type BaseEntityInput,
  transformBaseEntity,
} from '../common/base.transformer';

type InputData = NonNullable<ThirdPartyByIdResponse>['thirdParty'];

// Map third party-specific field names to base entity structure
const mapThirdPartyToBaseEntity = (data: InputData): BaseEntityInput => ({
  Id: data.Id,
  SequentialId: data.SequentialId,
  Title: data.Title,
  Description: data.Description,
  CreatedAtTimestamp: data.CreatedAtTimestamp,
  ModifiedAtTimestamp: data.ModifiedAtTimestamp,
  CreatedByUser: data.CreatedByUser,
  ModifiedByUser: data.ModifiedByUser,
  owners: data.owners,
  contributors: data.contributors,
  tags: data.tags,
});

export type TransformThirdPartiesListFn = ListDataTransformFn<
  ThirdPartyListQueryResponse['thirdParty'],
  ThirdPartyListResponse[]
>;

export type TransformThirdPartyItemFn = DataEntityTransformFn<
  NonNullable<ThirdPartyByIdResponse>['thirdParty'],
  ThirdPartyItemResponse
>;

export const transformItem: TransformThirdPartyItemFn = (thirdParty, opts) => {
  const { basePath } = opts;
  const baseEntity = mapThirdPartyToBaseEntity(thirdParty);
  const { baseData, links } = transformBaseEntity(
    baseEntity,
    basePath,
    'third-parties'
  );

  // Build address object, only include if at least one field has a value
  const hasAddressData =
    thirdParty.Address ||
    thirdParty.CityTown ||
    thirdParty.Postcode ||
    thirdParty.Country;

  const address = hasAddressData
    ? {
        addressLine1: thirdParty.Address,
        cityTown: thirdParty.CityTown,
        postcode: thirdParty.Postcode,
        country: thirdParty.Country,
      }
    : null;

  const responseData: ThirdPartyItemResponse = {
    ...baseData,
    companyName: thirdParty.CompanyName,
    companyRegistration: thirdParty.CompaniesHouseNumber,
    address,
    primaryContactName: thirdParty.PrimaryContactName,
    contactName: thirdParty.ContactName,
    contactEmail: thirdParty.ContactEmail,
    companyDomain: thirdParty.CompanyDomain,
    type: thirdParty.Type,
    status: thirdParty.Status,
    criticality: thirdParty.Criticality,
    links,
  };

  return resourceSchemas.ThirdPartyItemResponseSchema.parse(responseData);
};

export const transformListQueryResponse: TransformThirdPartiesListFn = (
  result,
  opts
) => {
  const { basePath } = opts;

  return result.data.map((thirdParty) => {
    const baseEntity = mapThirdPartyToBaseEntity(thirdParty);
    const { baseData, links } = transformBaseEntity(
      baseEntity,
      basePath,
      'third-parties'
    );

    return resourceSchemas.ThirdPartyListResponseSchema.parse({
      ...baseData,
      links: {
        ...links,
        parents: [], // Third parties don't have parent relationships
      },
    });
  });
};
