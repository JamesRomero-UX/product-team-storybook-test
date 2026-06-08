import type {
  Access_Type_Enum,
  GetRoleAccessQuery,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC, ReactNode } from 'react';

import { useHasPermissionQuery } from './useHasPermission';

export type ParentType = `${Parent_Type_Enum}`;
type AccessType = `${Access_Type_Enum}`;
export type ObjectAccess = `${AccessType}:${ParentType}`;

export type ObjectWithContributors = {
  Id: string;
  ancestorContributors: {
    UserId?: null | string;
    ContributorType?: null | string; //  This is a Contributor_Type_Enum,
  }[];
};

type AllObjectAccessOptions = {
  /** This type of object. */
  objectType: Parent_Type_Enum;
  /** The access required e.g can I "UPDATE" this risk */
  accessType: Access_Type_Enum;
};

type ObjectAccessOptions = AllObjectAccessOptions & {
  /**
   * This can be the object on which we are checking permissions e.g. can I
   * update a Risk Or the parent of the object of which we are checking
   * permissions e.g. can I insert a control under a Risk It is used to check
   * whether the user is a contributor or owner of the object. If the user is a
   * contributor/owner of this object, they will also be a contributor/owner of
   * any descendant objects
   */
  parentObject?: null | ObjectWithContributors;

  /**
   * When true, checks whether the users role can have access to the object type
   * and access type, if they are set as a contributor/owner of a specific
   * object. This is useful if you want functionality listing objects without
   * first attempting to retrieve those objects to check for permissions for
   * example, standard users can view the risk register, because if they are a
   * contributor or owner of a risk, they'd like to see them in this location.
   * However, they may not actually have access to any risks.
   */
  canHaveAccessAsContributor?: boolean;
};

export type HasPermission = (
  /**
   * The permission required to access the object e.g. update:risk
   *
   * If an array of permissions is provided, the user must have at least one of
   * the permissions to pass the check
   */
  permission: ObjectAccess | ObjectAccess[],
  /**
   * The object on which we are checking permissions e.g. can I update a Risk OR
   * can I insert a control under a Risk
   */
  parentObject?: null | ObjectWithContributors,
  /**
   * When true, checks whether the user can be granted access even if they are
   * only a contributor of the object
   */
  canHaveAccessAsContributor?: boolean
) => { hasPermission: boolean; loading: boolean };

export type HasAccessOptions = ObjectAccessOptions & {
  roleAccess: GetRoleAccessQuery['role_access'];
  userId?: string;
};

export const Permission: FC<{
  children: ReactNode;
  parentObject?: null | ObjectWithContributors;
  permission: ObjectAccess;
  canHaveAccessAsContributor?: boolean;
}> = ({ children, permission, parentObject, canHaveAccessAsContributor }) => {
  const { hasPermission: permissionGranted, loading } = useHasPermissionQuery(
    permission,
    parentObject,
    canHaveAccessAsContributor
  );

  return permissionGranted && !loading ? <>{children}</> : <></>;
};
