import type { EventBridgeEvent } from 'aws-lambda';
import type { DataChangeEvent } from 'src/handlers/events/DataChangeEvent';

export type TABLE_NAMES =
  | 'node'
  | 'linked_item'
  | 'owner'
  | 'user'
  | 'contributor'
  | 'owner_group'
  | 'contributor_group'
  | 'user_group'
  | 'user_group_user'
  | 'user_role';

export type EntityPermitProcessor = <
  T extends {
    Id: string;
    OrgKey: string;
    UserId: string;
    UserGroupId: string;
    ObjectType: string;
    Source: string;
    Target: string;
    ParentId: string;
    RelationshipType: string;
    RoleKey: string;
  },
>(
  tenant: string,
  event: EventBridgeEvent<string, DataChangeEvent<T, 'action'>>
) => Promise<{
  OP: 'INSERT' | 'UPDATE' | 'DELETE';
  PermitAction:
    | 'GENERIC'
    | 'GROUP'
    | 'GROUP-USER'
    | 'PARENT-RELATION'
    | 'USER-ENTITY'
    | 'USER'
    | 'USER-ROLE';
  OrgKey?: string | undefined;
  Id: string;
  EntityType?: string | undefined;
  OwnerGroupId?: string | undefined;
  OwnerId?: string | undefined;
  ContributorGroupId?: string | undefined;
  ContributorId?: string | undefined;
  Parents?: {
    ParentId: string;
    ParentType: string;
  }[];
  UserId?: string | undefined;
  RelationshipType?: string | undefined;
  RoleKey?: string | undefined;
}>;
