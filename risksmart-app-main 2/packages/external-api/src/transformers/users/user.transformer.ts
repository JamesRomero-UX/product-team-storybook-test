import type {
  UserByIdResponse,
  UsersListQueryResponse,
} from '../../clients/client.interface';
import { resourceSchemas } from '../../schemas/index';
import type { UserItemResponse, UserListResponse } from '../../schemas/schema.types';
import type { DataEntityTransformFn, ListDataTransformFn } from '../../types/transform';
import { firstDefined } from '../../utils/transforms';

export type TransformUserListFn = ListDataTransformFn<
  UsersListQueryResponse['user'],
  UserListResponse[]
>;

export const transformListQueryResponse: TransformUserListFn = (
  result,
  { basePath }
) => {
  return result.data.map((user) => {
    const friendlyName =
      firstDefined(
        user.FriendlyName,
        user.FirstName && user.LastName
          ? `${user.FirstName} ${user.LastName}`
          : undefined
      ) || 'Unknown User';

    return resourceSchemas.UserListResponseSchema.parse({
      id: user.Id,
      firstName: user.FirstName,
      lastName: user.LastName,
      lastSeen: user.LastSeen,
      friendlyName,
      links: {
        self: user.Id ? { href: `${basePath}/users/${encodeURIComponent(user.Id)}` } : null,
      },
    });
  });
};

export type TransformUserItemFn = DataEntityTransformFn<
  NonNullable<UserByIdResponse>['user'],
  UserItemResponse
>;

export const transformItem: DataEntityTransformFn<
  NonNullable<UserByIdResponse>['user'],
  UserItemResponse
> = (user, { basePath }) => {
  // Use FriendlyName from database (generated column) or construct from FirstName + LastName
  const friendlyName =
    firstDefined(
      user.FriendlyName,
      user.FirstName && user.LastName
        ? `${user.FirstName} ${user.LastName}`
        : undefined
    ) || 'Unknown User';

  return resourceSchemas.UserItemResponseSchema.parse({
    id: user.Id,
    firstName: user.FirstName,
    lastName: user.LastName,
    businessUnitId: user.BusinessUnit_Id,
    status: user.Status,
    jobTitle: user.JobTitle,
    department: user.Department,
    officeLocation: user.OfficeLocation,
    lastSeen: user.LastSeen,
    friendlyName,
    links: {
        self: user.Id ? { href: `${basePath}/users/${encodeURIComponent(user.Id)}` } : null,
      },
  });
};
