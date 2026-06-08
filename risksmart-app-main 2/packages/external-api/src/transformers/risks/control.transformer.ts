import type {
  ControlByIdResponse,
  ControlListQueryResponse,
} from '../../clients/client.interface';
import { resourceSchemas } from '../../schemas/index';
import type {
  ControlItemResponse,
  ControlListResponse,
} from '../../schemas/schema.types';
import type {
  DataEntityTransformFn,
  ListDataTransformFn,
} from '../../types/transform';
import {
  idToResourceReference,
  nodeObjectTypeToResourceType,
} from '../../utils/transforms';
import {
  type BaseEntityInput,
  transformBaseEntity,
  transformParents,
} from '../common/base.transformer';

type ControlListItem = ControlListQueryResponse['control'][0];

// Map control-specific field names to base entity structure
const mapControlToBaseEntity = <
  T extends ControlListItem | NonNullable<ControlByIdResponse>['control'],
>(
  control: T
): BaseEntityInput => ({
  Id: control.Id,
  SequentialId: control.SequentialId,
  Title: control.Title,
  Description: control.Description,
  CreatedAtTimestamp: control.CreatedAtTimestamp,
  ModifiedAtTimestamp: control.ModifiedAtTimestamp,
  CreatedByUser: control.CreatedByUser,
  ModifiedByUser: control.ModifiedByUser,
  owners: control.owners,
  contributors: control.contributors,
  tags: control.tags,
});

export const transformControlListQueryResponse: TransformControlsListFn = (
  result,
  props
) => {
  return result.data.map((queryControl) => {
    const baseEntity = mapControlToBaseEntity(queryControl);
    const { baseData, links } = transformBaseEntity(
      baseEntity,
      props.basePath,
      'controls'
    );
    const parents = transformParents(queryControl.parents, props.basePath);

    return resourceSchemas.ControlListResponseSchema.parse({
      ...baseData,
      links: { ...links, parents },
    });
  });
};

export const transformControlItem: TransformControlItemFn = (
  control,
  props
) => {
  const baseEntity = mapControlToBaseEntity(control);
  const { baseData, links } = transformBaseEntity(
    baseEntity,
    props.basePath,
    'controls'
  );
  const ancestorContributors = (control.ancestorContributors || []).map(
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

  return resourceSchemas.ControlItemResponseSchema.parse({
    ...baseData,
    type: control.Type,
    ancestorContributors,
    links,
  });
};

export type TransformControlsListFn = ListDataTransformFn<
  ControlListQueryResponse['control'],
  ControlListResponse[]
>;

export type TransformControlItemFn = DataEntityTransformFn<
  NonNullable<ControlByIdResponse>['control'],
  ControlItemResponse
>;
