import type {
  AppetiteByIdResponse,
  RiskListAppetiteResponse,
} from '../../clients/client.interface';
import { resourceSchemas } from '../../schemas/index';
import type {
  AppetiteItemResponse,
  AppetiteListResponse,
} from '../../schemas/schema.types';
import type {
  DataEntityTransformFn,
  ListDataTransformFn,
} from '../../types/transform';
import {
  firstDefined,
  idToResourceReference,
  nodeObjectTypeToResourceType,
} from '../../utils/transforms';
import { transformParents } from '../common/base.transformer';

export const transformAppetiteListQueryResponse: TransformAppetitesListFn = (
  result,
  props
) => {
  return result.data.map((appetite) => {
    const updatedAt = firstDefined(
      appetite.ModifiedAtTimestamp,
      appetite.CreatedAtTimestamp
    );

    const createdBy = appetite.CreatedByUser
      ? idToResourceReference(
          appetite.CreatedByUser,
          'user',
          `${props.basePath}/users`
        )
      : null;

    const updatedBy = appetite.ModifiedByUser
      ? idToResourceReference(
          appetite.ModifiedByUser,
          'user',
          `${props.basePath}/users`
        )
      : createdBy;

    const parents = transformParents(appetite.parents, props.basePath);
    const parentIds = new Set(parents.map((parent) => parent?.id ?? null));
    const parentRisks = (appetite.parents || [])
      .map((item) => {
        if (item.risk?.Id && !parentIds.has(item.risk?.Id)) {
          return idToResourceReference(
            item.risk?.Id,
            'risk',
            `${props.basePath}/risks`
          );
        }

        return null;
      })
      .filter((item) => item !== null);

    return resourceSchemas.AppetiteListResponseSchema.parse({
      id: appetite.Id,
      sequentialId: appetite.SequentialId,
      statement: appetite.Statement ?? null,
      effectiveDate: appetite.EffectiveDate ?? null,
      lowerAppetite: appetite.LowerAppetite ?? null,
      upperAppetite: appetite.UpperAppetite ?? null,
      appetiteType: appetite.AppetiteType ?? null,
      impactAppetite: appetite.ImpactAppetite ?? null,
      likelihoodAppetite: appetite.LikelihoodAppetite ?? null,
      createdAt: appetite.CreatedAtTimestamp,
      updatedAt: updatedAt ?? appetite.CreatedAtTimestamp,
      createdBy: appetite.CreatedByUser,
      updatedBy: appetite.ModifiedByUser,
      links: {
        self: {
          href: `${props.basePath}/${props.linkId ? `risks/${props.linkId}/` : ''}appetites/${appetite.Id}`,
        },
        createdBy,
        updatedBy,
        owners: [],
        contributors: [],
        parents: [...parents, ...parentRisks],
      },
    });
  });
};

export const transformAppetiteByIdResponse: TransformAppetiteItemFn = (
  appetite,
  props
) => {
  const updatedAt = firstDefined(
    appetite.ModifiedAtTimestamp,
    appetite.CreatedAtTimestamp
  );

  const createdBy = appetite.CreatedByUser
    ? idToResourceReference(
        appetite.CreatedByUser,
        'user',
        `${props.basePath}/users`
      )
    : null;

  const updatedBy = appetite.ModifiedByUser
    ? idToResourceReference(
        appetite.ModifiedByUser,
        'user',
        `${props.basePath}/users`
      )
    : createdBy;

  const ancestorContributors = (appetite.ancestorContributors || []).map(
    ({ Id, ObjectType, ContributorType, AncestorId, UserGroupId, UserId }) => {
      return {
        id: Id,
        objectType:
          nodeObjectTypeToResourceType(ObjectType || '')?.type || null,
        contributorType: ContributorType,
        ancestorId: AncestorId,
        userGroupId: UserGroupId,
        user: UserId
          ? idToResourceReference(UserId, 'user', `${props.basePath}/users`)
          : null,
      };
    }
  );

  return resourceSchemas.AppetiteItemResponseSchema.parse({
    id: appetite.Id,
    sequentialId: appetite.SequentialId,
    statement: appetite.Statement ?? null,
    effectiveDate: appetite.EffectiveDate ?? null,
    lowerAppetite: appetite.LowerAppetite ?? null,
    upperAppetite: appetite.UpperAppetite ?? null,
    appetiteType: appetite.AppetiteType ?? null,
    impactAppetite: appetite.ImpactAppetite ?? null,
    likelihoodAppetite: appetite.LikelihoodAppetite ?? null,
    createdAt: appetite.CreatedAtTimestamp,
    updatedAt: updatedAt ?? appetite.CreatedAtTimestamp,
    createdBy: appetite.CreatedByUser,
    updatedBy: appetite.ModifiedByUser,
    ancestorContributors,
    links: {
      self: {
        href: `${props.basePath}/${props.linkId ? `risks/${props.linkId}/` : ''}appetites/${appetite.Id}`,
      },
      createdBy,
      updatedBy,
      owners: [],
      contributors: [],
    },
  });
};

export type TransformAppetitesListFn = ListDataTransformFn<
  RiskListAppetiteResponse['appetite'],
  AppetiteListResponse[]
>;

export type TransformAppetiteItemFn = DataEntityTransformFn<
  NonNullable<AppetiteByIdResponse>['appetite'],
  AppetiteItemResponse
>;
