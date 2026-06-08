import type {
  AcceptanceByIdResponse,
  ListAcceptancesResponse,
} from '../../clients/client.interface';
import { resourceSchemas } from '../../schemas/index';
import type {
  AcceptanceItemResponse,
  AcceptanceListResponse,
} from '../../schemas/schema.types';
import type {
  DataEntityTransformFn,
  ListDataTransformFn,
} from '../../types/transform';
import { idToResourceReference } from '../../utils/transforms';
import type { BaseEntityInput } from '../common/base.transformer';
import {
  transformBaseEntity,
  transformParents,
} from '../common/base.transformer';

type InputData =
  | NonNullable<AcceptanceByIdResponse>['acceptance']
  | ListAcceptancesResponse['acceptance'][0];

const mapAcceptanceToBaseEntity = (data: InputData): BaseEntityInput => ({
  Id: data.Id,
  SequentialId: data.SequentialId,
  Title: data.Title,
  Description: data.Details,
  CreatedAtTimestamp: data.CreatedAtTimestamp,
  ModifiedAtTimestamp: data.ModifiedAtTimestamp,
  CreatedByUser: data.CreatedByUser,
  ModifiedByUser: data.ModifiedByUser,
  owners: [],
  contributors: [],
  tags: [],
});

export const transformRiskAcceptanceItem: TransformRiskAcceptanceItemFn = (
  acceptance,
  opts
) => {
  const { basePath, linkId } = opts;
  if (!linkId) {
    throw new Error('Link ID required for acceptance transforms');
  }
  const baseRiskPath = `risks/${linkId}/acceptances`;
  const baseEntity = mapAcceptanceToBaseEntity(acceptance);
  const { baseData, links: baseLinks } = transformBaseEntity(
    baseEntity,
    basePath,
    baseRiskPath
  );
  const { linkedItems: _, ...links } = baseLinks;
  const parents = transformParents(acceptance.parents, basePath);
  const toUserLinkRef = (userId?: string | null) =>
    userId ? idToResourceReference(userId, 'user', `${basePath}/users`) : null;
  const transformedInput: AcceptanceItemResponse = {
    ...baseData,
    dateAcceptedFrom: acceptance.DateAcceptedFrom,
    dateAcceptedTo: acceptance.DateAcceptedTo,
    status: acceptance.Status,
    approvedByUser: acceptance.ApprovedByUser,
    approvedByUserGroup: acceptance.ApprovedByUserGroup,
    requestedByUser: acceptance.RequestedByUser,
    requestedByUserGroup: acceptance.RequestedByUserGroup,
    links: {
      ...links,
      parents,
      approvedByUser: toUserLinkRef(acceptance.ApprovedByUser),
      requestedByUser: toUserLinkRef(acceptance.RequestedByUser),
    },
  };

  return resourceSchemas.AcceptanceItemResponseSchema.parse(transformedInput);
};

export const transformRiskAcceptanceList: TransformRiskAcceptancesListFn = (
  result,
  opts
) => {
  const { basePath, linkId } = opts;
  if (!linkId) {
    throw new Error('Link ID required for acceptance transforms');
  }

  return result.data.map((acceptance) => {
    const baseEntity = mapAcceptanceToBaseEntity(acceptance);
    const { baseData, links: baseLinks } = transformBaseEntity(
      baseEntity,
      basePath,
      `risks/${linkId}/acceptances`
    );
    const parents = transformParents(acceptance.parents, basePath);
    const { linkedItems: _, ...links } = baseLinks;

    return resourceSchemas.AcceptanceListResponseSchema.parse({
      ...baseData,
      links: {
        ...links,
        parents,
      },
    });
  });
};

export type TransformRiskAcceptancesListFn = ListDataTransformFn<
  ListAcceptancesResponse['acceptance'],
  AcceptanceListResponse[]
>;

export type TransformRiskAcceptanceItemFn = DataEntityTransformFn<
  InputData,
  AcceptanceItemResponse
>;
