import type { InstanceTypePrefix, ResourceInstanceId } from './branded-ids';

export const getRelationshipTupleKey = (tuple: {
  subject: string;
  relation: string;
  object: string;
}) => {
  return `${tuple.subject}:${tuple.relation}:${tuple.object}`;
}; // Helper function to create a unique key for role assignments

export const getRoleAssignmentKey = (assignment: {
  resource_instance?: string | undefined;
  role: string;
  tenant?: string | undefined;
  user: string;
}) => {
  if (!assignment.resource_instance) {
    return `${assignment.role}:${assignment.tenant}:${assignment.user}`;
  }

  return `${assignment.resource_instance}:${assignment.role}:${assignment.tenant}:${assignment.user}`;
};

export const PERMIT_LIST_CONCURRENCY = 15; // Configure how many parallel permit list requests to make

// Type definitions for sync stats
export interface SyncStatsCommon {
  tenant: string;
  timeMs: number;
}

// Organization level stats
export type OrgSyncStats = SyncStatsCommon & {
  orgKey: string;
  ownershipAssigned: number;
  ownershipRemoved: number;
  resourceInstancesCreated: number;
  resourceInstancesDeleted: number;
  relationshipTuplesCreated: number;
  relationshipTuplesDeleted: number;
  userGroupsCreated: number;
  userGroupsDeleted: number;
  userGroupUsersAssigned: number;
  userGroupUsersRemoved: number;
};

// Tenant level stats
export type TenantSyncStats = SyncStatsCommon & {
  usersCreated: number;
  usersDeleted: number;
  orgStats: OrgSyncStats[];
};

export interface ResourceInstance {
  InstanceType: InstanceTypePrefix;
  Id: string;
  OrgKey: string;
  ObjectType?: string | undefined;
  Relations: {
    Subject: ResourceInstanceId;
    Relation: string;
  }[];
}

// Combined stats for backward compatibility
export type SyncStats = OrgSyncStats;
export interface PermitTenant {
  OrgKey: string;
  Users: {
    Id: string;
    Roles: string[];
    RoleAssignments: {
      Roles: string[];
      OrgKey: string;
      ResourceInstanceId: ResourceInstanceId;
    }[];
  }[];
  ResourceInstances: Map<ResourceInstanceId, ResourceInstance>;
}
