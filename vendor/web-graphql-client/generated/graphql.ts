// GENERATED STUB — do not edit by hand. Run scripts/generate-graphql-stub.mjs to refresh.
// Source: ~/Documents/risksmart-app-main 2/packages/web-graphql-client/graphql/**/*.graphql
//
// The real generated/graphql.ts is codegen output that requires a running
// Hasura instance. This stub re-parses the checked-in .graphql documents at
// build time, returns weak `any` types, and exports lowercase-string Proxy
// stubs for enums (matches Hasura's lowercase enum-table convention).

/* eslint-disable */
import { parse } from 'graphql';

export const AcceptancePartsDocument = parse(`fragment AcceptanceParts on acceptance {
  DateAcceptedFrom
  DateAcceptedTo
  Details
  Id
  Status
  ModifiedAtTimestamp
  CreatedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  ApprovedByUser
  ApprovedByUserGroup
  RequestedByUser
  RequestedByUserGroup
  CustomAttributeData
  SequentialId
}`) as any;
export type AcceptancePartsFragment = any;

export const DeleteAcceptancesDocument = parse(`mutation deleteAcceptances(\$Ids: [uuid!]!) {
  deleteAcceptancesById(Ids: \$Ids) {
    affected_rows
  }
}`) as any;
export type DeleteAcceptancesMutation = any;
export type DeleteAcceptancesMutationVariables = any;
export type deleteAcceptancesMutation = any;
export type deleteAcceptancesMutationVariables = any;

export const GetAcceptanceAuditByIdDocument = parse(`query getAcceptanceAuditById(\$Id: uuid!) {
  acceptance_audit(where: { Id: { _eq: \$Id } }, order_by: {ModifiedAtTimestamp: desc}) {
    DateAcceptedFrom
    DateAcceptedTo
    Details
    Id
    Status
    ModifiedAtTimestamp
    CreatedAtTimestamp
    Title
    CreatedByUser
    ModifiedByUser
    ApprovedByUser
    ApprovedByUserGroup
    RequestedByUser
    RequestedByUserGroup
    CustomAttributeData
    SequentialId
  }
}`) as any;
export type GetAcceptanceAuditByIdQuery = any;
export type GetAcceptanceAuditByIdQueryVariables = any;
export type GetGetAcceptanceAuditByIdQuery = any;
export type getAcceptanceAuditByIdQuery = any;
export type getAcceptanceAuditByIdQueryVariables = any;

export const GetAcceptanceByIdDocument = parse(`query getAcceptanceById(\$_eq: uuid!) {
  acceptance(where: { Id: { _eq: \$_eq } }) {
    ...AcceptanceParts
    ancestorContributors {
      ...AncestorContributorParts
    }
    files {
      ...RelationFileParts
    }
    parents {
      risk {
        Id
      }
    }
  }
}

fragment AcceptanceParts on acceptance {
  DateAcceptedFrom
  DateAcceptedTo
  Details
  Id
  Status
  ModifiedAtTimestamp
  CreatedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  ApprovedByUser
  ApprovedByUserGroup
  RequestedByUser
  RequestedByUserGroup
  CustomAttributeData
  SequentialId
}

fragment AncestorContributorParts on ancestor_contributor {
  ContributorType
  UserId
  Id
  AncestorId
  UserGroupId
  user {
    FriendlyName
  }
  user_group {
    Name
  }
}

fragment RelationFileParts on relation_file {
  ParentId
  ChangeRequestFileOperation
  file {
    ...FileParts
  }
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}`) as any;
export type GetAcceptanceByIdQuery = any;
export type GetAcceptanceByIdQueryVariables = any;
export type GetGetAcceptanceByIdQuery = any;
export type getAcceptanceByIdQuery = any;
export type getAcceptanceByIdQueryVariables = any;

export const GetAcceptancesDocument = parse(`query getAcceptances(\$where: acceptance_bool_exp! = {}) {
  acceptance(where: \$where) {
    ...AcceptanceParts
    createdByUser {
      FriendlyName
    }
    modifiedByUser {
      FriendlyName
    }
    requestedByUser {
      FriendlyName
    }
    requestedByUserGroup {
      Name
    }
    approvedByUser {
      FriendlyName
    }
    approvedByUserGroup {
      Name
    }
    parents {
      risk {
        Id
        Tier
        Title
        owners {
          ...OwnerParts
        }
        ownerGroups {
          ...OwnerGroupParts
        }
        contributors {
          ...ContributorParts
        }
        contributorGroups {
          ...ContributorGroupParts
        }
        tags {
          ...TagParts
        }
        departments {
          ...DepartmentParts
        }
      }
    }
    files {
      ...RelationFileParts
    }
    changeRequests(
      distinct_on: [ChangeRequestStatus]
      order_by: [{ ChangeRequestStatus: asc }, { ModifiedAtTimestamp: desc }]
    ) {
      ChangeRequestStatus
      ModifiedAtTimestamp
    }
  }
}

fragment AcceptanceParts on acceptance {
  DateAcceptedFrom
  DateAcceptedTo
  Details
  Id
  Status
  ModifiedAtTimestamp
  CreatedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  ApprovedByUser
  ApprovedByUserGroup
  RequestedByUser
  RequestedByUserGroup
  CustomAttributeData
  SequentialId
}

fragment OwnerParts on owner {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment OwnerGroupParts on owner_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment ContributorParts on contributor {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment ContributorGroupParts on contributor_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment TagParts on tag {
  type {
    Description
    Name
  }
  ParentId
  TagTypeId
}

fragment DepartmentParts on department {
  type {
    Description
    Name
  }
  ParentId
  DepartmentTypeId
}

fragment RelationFileParts on relation_file {
  ParentId
  ChangeRequestFileOperation
  file {
    ...FileParts
  }
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}`) as any;
export type GetAcceptancesQuery = any;
export type GetAcceptancesQueryVariables = any;
export type GetGetAcceptancesQuery = any;
export type getAcceptancesQuery = any;
export type getAcceptancesQueryVariables = any;

export const GetAcceptancesByParentRiskIdDocument = parse(`query getAcceptancesByParentRiskId(\$ParentId: uuid) {
  acceptance(where: { parents: { ParentId: { _eq: \$ParentId } } }) {
    ...AcceptanceParts
    ancestorContributors {
      ...AncestorContributorParts
    }
    createdByUser {
      FriendlyName
    }
    modifiedByUser {
      FriendlyName
    }
    requestedByUser {
      FriendlyName
    }
    requestedByUserGroup {
      Name
    }
    approvedByUser {
      FriendlyName
    }
    approvedByUserGroup {
      Name
    }
    parents {
      risk {
        Id
        Tier
        Title
        owners {
          ...OwnerParts
        }
        ownerGroups {
          ...OwnerGroupParts
        }
        contributors {
          ...ContributorParts
        }
        contributorGroups {
          ...ContributorGroupParts
        }
        ancestorContributors {
          ...AncestorContributorParts
        }
        tags {
          ...TagParts
        }
        departments {
          ...DepartmentParts
        }
      }
    }
    files {
      ...RelationFileParts
    }
    changeRequests(
      distinct_on: [ChangeRequestStatus]
      order_by: [{ ChangeRequestStatus: asc }, { ModifiedAtTimestamp: desc }]
    ) {
      ChangeRequestStatus
      ModifiedAtTimestamp
    }
  }
}

fragment AcceptanceParts on acceptance {
  DateAcceptedFrom
  DateAcceptedTo
  Details
  Id
  Status
  ModifiedAtTimestamp
  CreatedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  ApprovedByUser
  ApprovedByUserGroup
  RequestedByUser
  RequestedByUserGroup
  CustomAttributeData
  SequentialId
}

fragment AncestorContributorParts on ancestor_contributor {
  ContributorType
  UserId
  Id
  AncestorId
  UserGroupId
  user {
    FriendlyName
  }
  user_group {
    Name
  }
}

fragment OwnerParts on owner {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment OwnerGroupParts on owner_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment ContributorParts on contributor {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment ContributorGroupParts on contributor_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment TagParts on tag {
  type {
    Description
    Name
  }
  ParentId
  TagTypeId
}

fragment DepartmentParts on department {
  type {
    Description
    Name
  }
  ParentId
  DepartmentTypeId
}

fragment RelationFileParts on relation_file {
  ParentId
  ChangeRequestFileOperation
  file {
    ...FileParts
  }
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}`) as any;
export type GetAcceptancesByParentRiskIdQuery = any;
export type GetAcceptancesByParentRiskIdQueryVariables = any;
export type GetGetAcceptancesByParentRiskIdQuery = any;
export type getAcceptancesByParentRiskIdQuery = any;
export type getAcceptancesByParentRiskIdQueryVariables = any;

export const InsertAcceptanceDocument = parse(`mutation insertAcceptance(
  \$DateAcceptedFrom: timestamptz!
  \$DateAcceptedTo: timestamptz!
  \$Details: String
  \$ParentId: uuid!
  \$Status: acceptance_status_enum
  \$Title: String
  \$ApprovedByUser: String
  \$ApprovedByUserGroup: uuid
  \$RequestedByUser: String
  \$RequestedByUserGroup: uuid
  \$CustomAttributeData: jsonb
) {
  insertChildAcceptance(
    DateAcceptedFrom: \$DateAcceptedFrom
    DateAcceptedTo: \$DateAcceptedTo
    Details: \$Details
    ParentId: \$ParentId
    Status: \$Status
    Title: \$Title
    ApprovedByUser: \$ApprovedByUser
    ApprovedByUserGroup: \$ApprovedByUserGroup
    RequestedByUser: \$RequestedByUser
    RequestedByUserGroup: \$RequestedByUserGroup
    CustomAttributeData: \$CustomAttributeData
  ) {
    Id
  }
}`) as any;
export type InsertAcceptanceMutation = any;
export type InsertAcceptanceMutationVariables = any;
export type insertAcceptanceMutation = any;
export type insertAcceptanceMutationVariables = any;

export const UpdateAcceptanceDocument = parse(`mutation updateAcceptance(
  \$DateAcceptedFrom: timestamptz!
  \$DateAcceptedTo: timestamptz!
  \$Details: String
  \$Status: acceptance_status_enum
  \$Title: String
  \$Id: uuid!
  \$OriginalTimestamp: timestamptz!
  \$ApprovedByUser: String
  \$ApprovedByUserGroup: uuid
  \$RequestedByUser: String
  \$RequestedByUserGroup: uuid
  \$CustomAttributeData: jsonb
) {
  updateChildAcceptance(
    Id: \$Id
    LatestModifiedAtTimestamp: \$OriginalTimestamp
    DateAcceptedFrom: \$DateAcceptedFrom
    DateAcceptedTo: \$DateAcceptedTo
    Details: \$Details
    Status: \$Status
    Title: \$Title
    ApprovedByUser: \$ApprovedByUser
    ApprovedByUserGroup: \$ApprovedByUserGroup
    RequestedByUser: \$RequestedByUser
    RequestedByUserGroup: \$RequestedByUserGroup
    CustomAttributeData: \$CustomAttributeData
  ) {
    affected_rows
  }
}`) as any;
export type UpdateAcceptanceMutation = any;
export type UpdateAcceptanceMutationVariables = any;
export type updateAcceptanceMutation = any;
export type updateAcceptanceMutationVariables = any;

export const ActionPartsDocument = parse(`fragment ActionParts on action {
  DateDue
  DateRaised
  Description
  Id
  Priority
  Status
  ModifiedAtTimestamp
  CreatedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  ClosedDate
  CustomAttributeData
  SequentialId
}`) as any;
export type ActionPartsFragment = any;

export const DeleteActionsDocument = parse(`mutation deleteActions(\$Ids: [uuid!]!) {
  deleteActionsById(Ids: \$Ids) {
    affected_rows
  }
}`) as any;
export type DeleteActionsMutation = any;
export type DeleteActionsMutationVariables = any;
export type deleteActionsMutation = any;
export type deleteActionsMutationVariables = any;

export const GetActionAuditByIdDocument = parse(`query getActionAuditById(\$id: uuid!) {
  action_audit(where: { Id: { _eq: \$id } }, order_by: {ModifiedAtTimestamp: desc}) {
    DateDue
    DateRaised
    Description
    Id
    Priority
    Status
    ModifiedAtTimestamp
    CreatedAtTimestamp
    Title
    CreatedByUser
    ModifiedByUser
    ClosedDate
    CustomAttributeData
    SequentialId
  }
}`) as any;
export type GetActionAuditByIdQuery = any;
export type GetActionAuditByIdQueryVariables = any;
export type GetGetActionAuditByIdQuery = any;
export type getActionAuditByIdQuery = any;
export type getActionAuditByIdQueryVariables = any;

export const GetActionByIdDocument = parse(`query getActionById(\$_eq: uuid!) {
  action(where: { Id: { _eq: \$_eq } }) {
    ...ActionParts
    tags {
      ...TagParts
    }
    departments {
      ...DepartmentParts
    }
    files {
      ...RelationFileParts
    }
    owners {
      ...OwnerParts
    }
    contributors {
      ...ContributorParts
    }
    ownerGroups {
      ...OwnerGroupParts
    }
    contributorGroups {
      ...ContributorGroupParts
    }
    ancestorContributors {
      ...AncestorContributorParts
    }
  }
}

fragment ActionParts on action {
  DateDue
  DateRaised
  Description
  Id
  Priority
  Status
  ModifiedAtTimestamp
  CreatedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  ClosedDate
  CustomAttributeData
  SequentialId
}

fragment TagParts on tag {
  type {
    Description
    Name
  }
  ParentId
  TagTypeId
}

fragment DepartmentParts on department {
  type {
    Description
    Name
  }
  ParentId
  DepartmentTypeId
}

fragment RelationFileParts on relation_file {
  ParentId
  ChangeRequestFileOperation
  file {
    ...FileParts
  }
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}

fragment OwnerParts on owner {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment ContributorParts on contributor {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment OwnerGroupParts on owner_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment ContributorGroupParts on contributor_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment AncestorContributorParts on ancestor_contributor {
  ContributorType
  UserId
  Id
  AncestorId
  UserGroupId
  user {
    FriendlyName
  }
  user_group {
    Name
  }
}`) as any;
export type GetActionByIdQuery = any;
export type GetActionByIdQueryVariables = any;
export type GetGetActionByIdQuery = any;
export type getActionByIdQuery = any;
export type getActionByIdQueryVariables = any;

export const GetActionsDocument = parse(`query getActions(\$where: action_bool_exp! = {}) {
  action(where: \$where) {
    ...ActionParts
    parents {
      parent {
        Id
        ObjectType
        SequentialId
      }
      obligation {
        Title
      }
      risk {
        Title
      }
      control {
        Title
      }
      issue {
        Title
        Type
      }
      document {
        Title
      }
      assessment {
        Title
      }
      internalAuditEntity {
        Title
      }
      internalAuditReport {
        Title
      }
      complianceMonitoringAssessment {
        Title
      }
      thirdParty {
        Title
      }
    }
    actionUpdateSummary {
      Count
      LatestDescription
      LatestTitle
      LatestCreatedAtTimestamp
    }
    owners {
      ...OwnerParts
    }
    ownerGroups {
      ...OwnerGroupParts
    }
    contributors {
      ...ContributorParts
    }
    contributorGroups {
      ...ContributorGroupParts
    }
    modifiedByUser {
      FriendlyName
    }
    createdByUser {
      FriendlyName
    }
    tags {
      ...TagParts
    }
    departments {
      ...DepartmentParts
    }
  }
}

fragment ActionParts on action {
  DateDue
  DateRaised
  Description
  Id
  Priority
  Status
  ModifiedAtTimestamp
  CreatedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  ClosedDate
  CustomAttributeData
  SequentialId
}

fragment OwnerParts on owner {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment OwnerGroupParts on owner_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment ContributorParts on contributor {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment ContributorGroupParts on contributor_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment TagParts on tag {
  type {
    Description
    Name
  }
  ParentId
  TagTypeId
}

fragment DepartmentParts on department {
  type {
    Description
    Name
  }
  ParentId
  DepartmentTypeId
}`) as any;
export type GetActionsQuery = any;
export type GetActionsQueryVariables = any;
export type GetGetActionsQuery = any;
export type getActionsQuery = any;
export type getActionsQueryVariables = any;

export const GetWidgetActionsByPriorityDocument = parse(`query getWidgetActionsByPriority(\$where: action_bool_exp) {
  action(where: \$where) {
    Priority
  }
}`) as any;
export type GetWidgetActionsByPriorityQuery = any;
export type GetWidgetActionsByPriorityQueryVariables = any;
export type GetGetWidgetActionsByPriorityQuery = any;
export type getWidgetActionsByPriorityQuery = any;
export type getWidgetActionsByPriorityQueryVariables = any;

export const InsertChildActionDocument = parse(`mutation insertChildAction(
  \$DateDue: timestamptz!
  \$Title: String!
  \$Status: action_status_enum!
  \$Priority: Int
  \$Description: String
  \$DateRaised: timestamptz!
  \$ParentId: uuid
  \$ClosedDate: timestamptz
  \$CustomAttributeData: jsonb
  \$OwnerUserIds: [String!]!
  \$ContributorUserIds: [String!]!
  \$OwnerGroupIds: [uuid!]!
  \$ContributorGroupIds: [uuid!]!
  \$TagTypeIds: [uuid!]!
  \$DepartmentTypeIds: [uuid!]!
) {
  insertChildAction(
    ParentId: \$ParentId
    DateDue: \$DateDue
    Title: \$Title
    Status: \$Status
    Priority: \$Priority
    Description: \$Description
    DateRaised: \$DateRaised
    ClosedDate: \$ClosedDate
    CustomAttributeData: \$CustomAttributeData
    TagTypeIds: \$TagTypeIds
    DepartmentTypeIds: \$DepartmentTypeIds
    OwnerUserIds: \$OwnerUserIds
    ContributorUserIds: \$ContributorUserIds
    OwnerGroupIds: \$OwnerGroupIds
    ContributorGroupIds: \$ContributorGroupIds
  ) {
    Id
  }
}`) as any;
export type InsertChildActionMutation = any;
export type InsertChildActionMutationVariables = any;
export type insertChildActionMutation = any;
export type insertChildActionMutationVariables = any;

export const GetOverdueActionCountDocument = parse(`query GetOverdueActionCount(\$where: action_bool_exp) {
  action_aggregate(where: \$where) {
    aggregate {
      count
    }
  }
}`) as any;
export type GetOverdueActionCountQuery = any;
export type GetOverdueActionCountQueryVariables = any;
export type GetGetOverdueActionCountQuery = any;

export const UpdateActionDocument = parse(`mutation updateAction(
  \$DateDue: timestamptz!
  \$Title: String!
  \$Status: action_status_enum!
  \$Priority: Int
  \$Id: uuid!
  \$Description: String
  \$DateRaised: timestamptz!
  \$OriginalTimestamp: timestamptz!
  \$ClosedDate: timestamptz
  \$CustomAttributeData: jsonb
  \$ContributorUserIds: [String!]!
  \$ContributorGroupIds: [uuid!]!
  \$OwnerUserIds: [String!]!
  \$OwnerGroupIds: [uuid!]!
  \$TagTypeIds: [uuid!]!
  \$DepartmentTypeIds: [uuid!]!
) {
  updateChildAction(
    Id: \$Id
    OriginalTimestamp: \$OriginalTimestamp
    DateDue: \$DateDue
    DateRaised: \$DateRaised
    Description: \$Description
    Priority: \$Priority
    Status: \$Status
    Title: \$Title
    ClosedDate: \$ClosedDate
    CustomAttributeData: \$CustomAttributeData
    TagTypeIds: \$TagTypeIds
    DepartmentTypeIds: \$DepartmentTypeIds
    ContributorUserIds: \$ContributorUserIds
    ContributorGroupIds: \$ContributorGroupIds
    OwnerUserIds: \$OwnerUserIds
    OwnerGroupIds: \$OwnerGroupIds
  ) {
    affected_rows
    change_request_id
  }
}`) as any;
export type UpdateActionMutation = any;
export type UpdateActionMutationVariables = any;
export type updateActionMutation = any;
export type updateActionMutationVariables = any;

export const ActionUpdatePartsDocument = parse(`fragment ActionUpdateParts on action_update {
  Description
  Id
  ParentActionId
  CreatedAtTimestamp
  ModifiedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  CustomAttributeData
}`) as any;
export type ActionUpdatePartsFragment = any;

export const DeleteActionUpdatesDocument = parse(`mutation deleteActionUpdates(\$Ids: [uuid!]) {
  delete_file(where: { relationFile: { ParentId: { _in: \$Ids } } }) {
    affected_rows
  }

  delete_relation_file(where: { ParentId: { _in: \$Ids } }) {
    affected_rows
  }

  delete_action_update(where: { Id: { _in: \$Ids } }) {
    affected_rows
  }
}`) as any;
export type DeleteActionUpdatesMutation = any;
export type DeleteActionUpdatesMutationVariables = any;
export type deleteActionUpdatesMutation = any;
export type deleteActionUpdatesMutationVariables = any;

export const GetActionUpdateAuditByIdDocument = parse(`query getActionUpdateAuditById(\$Id: uuid!) {
  action_update_audit(where: { Id: { _eq: \$Id } }, order_by: {ModifiedAtTimestamp: desc}) {
    Description
    Id
    ParentActionId
    CreatedAtTimestamp
    ModifiedAtTimestamp
    Title
    CreatedByUser
    ModifiedByUser
    CustomAttributeData
  }
}`) as any;
export type GetActionUpdateAuditByIdQuery = any;
export type GetActionUpdateAuditByIdQueryVariables = any;
export type GetGetActionUpdateAuditByIdQuery = any;
export type getActionUpdateAuditByIdQuery = any;
export type getActionUpdateAuditByIdQueryVariables = any;

export const GetActionUpdateByIdDocument = parse(`query getActionUpdateById(\$_eq: uuid!) {
  action_update(where: { Id: { _eq: \$_eq } }) {
    ...ActionUpdateParts
    files {
      ...RelationFileParts
    }
  }
}

fragment ActionUpdateParts on action_update {
  Description
  Id
  ParentActionId
  CreatedAtTimestamp
  ModifiedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  CustomAttributeData
}

fragment RelationFileParts on relation_file {
  ParentId
  ChangeRequestFileOperation
  file {
    ...FileParts
  }
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}`) as any;
export type GetActionUpdateByIdQuery = any;
export type GetActionUpdateByIdQueryVariables = any;
export type GetGetActionUpdateByIdQuery = any;
export type getActionUpdateByIdQuery = any;
export type getActionUpdateByIdQueryVariables = any;

export const GetActionUpdatesByParentActionIdDocument = parse(`query getActionUpdatesByParentActionId(\$_eq: uuid!) {
  action_update(where: { ParentActionId: { _eq: \$_eq } }) {
    ...ActionUpdateParts
    createdByUser {
      FriendlyName
    }
  }
}

fragment ActionUpdateParts on action_update {
  Description
  Id
  ParentActionId
  CreatedAtTimestamp
  ModifiedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  CustomAttributeData
}`) as any;
export type GetActionUpdatesByParentActionIdQuery = any;
export type GetActionUpdatesByParentActionIdQueryVariables = any;
export type GetGetActionUpdatesByParentActionIdQuery = any;
export type getActionUpdatesByParentActionIdQuery = any;
export type getActionUpdatesByParentActionIdQueryVariables = any;

export const InsertActionUpdateDocument = parse(`mutation insertActionUpdate(
  \$Description: String!
  \$ParentActionId: uuid!
  \$Title: String!
  \$CustomAttributeData: jsonb
) {
  insert_action_update_one(
    object: {
      Description: \$Description
      ParentActionId: \$ParentActionId
      Title: \$Title
      CustomAttributeData: \$CustomAttributeData
    }
  ) {
    Id
  }
}`) as any;
export type InsertActionUpdateMutation = any;
export type InsertActionUpdateMutationVariables = any;
export type insertActionUpdateMutation = any;
export type insertActionUpdateMutationVariables = any;

export const UpdateActionUpdateDocument = parse(`mutation updateActionUpdate(
  \$Description: String!
  \$ParentActionId: uuid!
  \$Title: String!
  \$Id: uuid!
  \$OriginalTimestamp: timestamptz!
  \$CustomAttributeData: jsonb
) {
  update_action_update(
    _set: {
      Description: \$Description
      ParentActionId: \$ParentActionId
      Title: \$Title
      CustomAttributeData: \$CustomAttributeData
    }
    where: {
      ModifiedAtTimestamp: { _eq: \$OriginalTimestamp }
      Id: { _eq: \$Id }
    }
  ) {
    affected_rows
  }
}`) as any;
export type UpdateActionUpdateMutation = any;
export type UpdateActionUpdateMutationVariables = any;
export type updateActionUpdateMutation = any;
export type updateActionUpdateMutationVariables = any;

export const GetAggregationSettingsForOrgDocument = parse(`query getAggregationSettingsForOrg {
  aggregation_org {
    RiskScoringModel
    Appetite
    Config
  }
}`) as any;
export type GetAggregationSettingsForOrgQuery = any;
export type GetAggregationSettingsForOrgQueryVariables = any;
export type GetGetAggregationSettingsForOrgQuery = any;
export type getAggregationSettingsForOrgQuery = any;
export type getAggregationSettingsForOrgQueryVariables = any;

export const GetRiskScoresDocument = parse(`subscription getRiskScores {
  risk {
    Id
    Tier

    inherent: assessmentResults(
      where: {
        riskAssessmentResult: {
          ControlType: { _eq: Uncontrolled }
          RatingType: { _in: ["assessment", "rating"] }
        }
      }
      order_by: [
        { riskAssessmentResult: { TestDate: desc_nulls_last } }
        { riskAssessmentResult: { CreatedAtTimestamp: desc_nulls_last } }
      ]
      limit: 1
    ) {
      riskAssessmentResult {
        ...RiskAssessmentResultParts
      }
    }

    residual: assessmentResults(
      where: {
        riskAssessmentResult: {
          ControlType: { _eq: Controlled }
          RatingType: { _in: ["assessment", "rating"] }
        }
      }
      order_by: [
        { riskAssessmentResult: { TestDate: desc_nulls_last } }
        { riskAssessmentResult: { CreatedAtTimestamp: desc_nulls_last } }
      ]
      limit: 1
    ) {
      riskAssessmentResult {
        ...RiskAssessmentResultParts
      }
    }

    riskScore {
      ResidualScore
      InherentScore
      ResidualRating
      InherentRating
      ResidualImpact
      ResidualLikelihood
      InherentImpact
      InherentLikelihood
      ModifiedAtTimestamp
    }
  }
}

fragment RiskAssessmentResultParts on risk_assessment_result {
  Id
  Likelihood
  Impact
  Rating
  ControlType
  CustomAttributeData
  Rationale
  TestDate
}`) as any;
export type GetRiskScoresSubscription = any;
export type GetRiskScoresSubscriptionVariables = any;

export const UpdateAggregationSettingsForOrgDocument = parse(`mutation updateAggregationSettingsForOrg(
  \$RiskScoringModel: risk_scoring_model_enum
  \$AppetiteCascadingModel: appetite_model_enum
  \$Config: jsonb
) {
  insert_aggregation_org(
    objects: {
      RiskScoringModel: \$RiskScoringModel
      Appetite: \$AppetiteCascadingModel
      Config: \$Config
    }
    on_conflict: {
      constraint: aggregation_org_pkey
      update_columns: [RiskScoringModel, Appetite, Config]
    }
  ) {
    affected_rows
  }
}`) as any;
export type UpdateAggregationSettingsForOrgMutation = any;
export type UpdateAggregationSettingsForOrgMutationVariables = any;
export type updateAggregationSettingsForOrgMutation = any;
export type updateAggregationSettingsForOrgMutationVariables = any;

export const AncestorContributorPartsDocument = parse(`fragment AncestorContributorParts on ancestor_contributor {
  ContributorType
  UserId
  Id
  AncestorId
  UserGroupId
  user {
    FriendlyName
  }
  user_group {
    Name
  }
}`) as any;
export type AncestorContributorPartsFragment = any;

export const AppetitePartsDocument = parse(`fragment AppetiteParts on appetite {
  Id
  LowerAppetite
  UpperAppetite
  ImpactAppetite
  LikelihoodAppetite
  Statement
  EffectiveDate
  AppetiteType
  CreatedAtTimestamp
  ModifiedAtTimestamp
  CreatedByUser
  ModifiedByUser
  CustomAttributeData
  SequentialId
  ImpactId
}`) as any;
export type AppetitePartsFragment = any;

export const DeleteAppetitesDocument = parse(`mutation deleteAppetites(\$Ids: [uuid!]) {
  delete_file(where: { relationFile: { ParentId: { _in: \$Ids } } }) {
    affected_rows
  }

  delete_relation_file(where: { ParentId: { _in: \$Ids } }) {
    affected_rows
  }

  delete_appetite(where: { Id: { _in: \$Ids } }) {
    affected_rows
  }
}`) as any;
export type DeleteAppetitesMutation = any;
export type DeleteAppetitesMutationVariables = any;
export type deleteAppetitesMutation = any;
export type deleteAppetitesMutationVariables = any;

export const GetActiveAppetitesByParentIdDocument = parse(`query getActiveAppetitesByParentId(\$parentId: uuid!) {
  appetite_parent(
    where: { ParentId: { _eq: \$parentId }, Status: { _eq: active } }
  ) {
    Status
    appetite {
      ...AppetiteParts
      impact {
        Id
        Name
      }
    }
  }
}

fragment AppetiteParts on appetite {
  Id
  LowerAppetite
  UpperAppetite
  ImpactAppetite
  LikelihoodAppetite
  Statement
  EffectiveDate
  AppetiteType
  CreatedAtTimestamp
  ModifiedAtTimestamp
  CreatedByUser
  ModifiedByUser
  CustomAttributeData
  SequentialId
  ImpactId
}`) as any;
export type GetActiveAppetitesByParentIdQuery = any;
export type GetActiveAppetitesByParentIdQueryVariables = any;
export type GetGetActiveAppetitesByParentIdQuery = any;
export type getActiveAppetitesByParentIdQuery = any;
export type getActiveAppetitesByParentIdQueryVariables = any;

export const GetActiveRiskAppetitesDocument = parse(`query getActiveRiskAppetites(\$where: appetite_parent_bool_exp! = {}) {
  appetite_parent(where: \$where) {
    Status
    appetite {
      ...AppetiteParts
      modifiedByUser {
        FriendlyName
      }
    }
    risk {
      Id
      Tier
      Title
      SequentialId
      owners {
        ...OwnerParts
      }
      ownerGroups {
        ...OwnerGroupParts
      }
      contributors {
        ...ContributorParts
      }
      contributorGroups {
        ...ContributorGroupParts
      }
      assessmentResults(
        where: {
          riskAssessmentResult: {
            ControlType: { _eq: Controlled }
            RatingType: { _in: ["assessment", "rating"] }
          }
        }
        order_by: [
          { riskAssessmentResult: { TestDate: desc_nulls_last } }
          { riskAssessmentResult: { CreatedAtTimestamp: desc_nulls_last } }
        ]
      ) {
        riskAssessmentResult {
          Rating
          Likelihood
          Impact
        }
      }
      riskScore {
        InherentScore
        ResidualScore
        InherentRating
        ResidualRating
        InherentLikelihood
        InherentImpact
        ResidualLikelihood
        ResidualImpact
      }
    }
  }
}

fragment AppetiteParts on appetite {
  Id
  LowerAppetite
  UpperAppetite
  ImpactAppetite
  LikelihoodAppetite
  Statement
  EffectiveDate
  AppetiteType
  CreatedAtTimestamp
  ModifiedAtTimestamp
  CreatedByUser
  ModifiedByUser
  CustomAttributeData
  SequentialId
  ImpactId
}

fragment OwnerParts on owner {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment OwnerGroupParts on owner_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment ContributorParts on contributor {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment ContributorGroupParts on contributor_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}`) as any;
export type GetActiveRiskAppetitesQuery = any;
export type GetActiveRiskAppetitesQueryVariables = any;
export type GetGetActiveRiskAppetitesQuery = any;
export type getActiveRiskAppetitesQuery = any;
export type getActiveRiskAppetitesQueryVariables = any;

export const GetAppetiteAuditByIdDocument = parse(`query getAppetiteAuditById(\$Id: uuid) {
  appetite_audit(where: { Id: { _eq: \$Id } }, order_by: {ModifiedAtTimestamp: desc}) {
    Id
    LowerAppetite
    UpperAppetite
    ImpactAppetite
    LikelihoodAppetite
    Statement
    EffectiveDate
    AppetiteType
    CreatedAtTimestamp
    ModifiedAtTimestamp
    CreatedByUser
    ModifiedByUser
    CustomAttributeData
    SequentialId
  }
}`) as any;
export type GetAppetiteAuditByIdQuery = any;
export type GetAppetiteAuditByIdQueryVariables = any;
export type GetGetAppetiteAuditByIdQuery = any;
export type getAppetiteAuditByIdQuery = any;
export type getAppetiteAuditByIdQueryVariables = any;

export const GetAppetiteByIdDocument = parse(`query getAppetiteById(\$_eq: uuid) {
  appetite(where: { Id: { _eq: \$_eq } }) {
    ...AppetiteParts
    files {
      ...RelationFileParts
    }
    impact {
      Id
    }
    parents {
      risk {
        Id
      }
    }
    ancestorContributors {
      ...AncestorContributorParts
    }
  }
}

fragment AppetiteParts on appetite {
  Id
  LowerAppetite
  UpperAppetite
  ImpactAppetite
  LikelihoodAppetite
  Statement
  EffectiveDate
  AppetiteType
  CreatedAtTimestamp
  ModifiedAtTimestamp
  CreatedByUser
  ModifiedByUser
  CustomAttributeData
  SequentialId
  ImpactId
}

fragment RelationFileParts on relation_file {
  ParentId
  ChangeRequestFileOperation
  file {
    ...FileParts
  }
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}

fragment AncestorContributorParts on ancestor_contributor {
  ContributorType
  UserId
  Id
  AncestorId
  UserGroupId
  user {
    FriendlyName
  }
  user_group {
    Name
  }
}`) as any;
export type GetAppetiteByIdQuery = any;
export type GetAppetiteByIdQueryVariables = any;
export type GetGetAppetiteByIdQuery = any;
export type getAppetiteByIdQuery = any;
export type getAppetiteByIdQueryVariables = any;

export const GetAppetitesDocument = parse(`query getAppetites {
  appetite {
    Id
    SequentialId
    ancestorContributors {
      ...AncestorContributorParts
    }
  }
}

fragment AncestorContributorParts on ancestor_contributor {
  ContributorType
  UserId
  Id
  AncestorId
  UserGroupId
  user {
    FriendlyName
  }
  user_group {
    Name
  }
}`) as any;
export type GetAppetitesQuery = any;
export type GetAppetitesQueryVariables = any;
export type GetGetAppetitesQuery = any;
export type getAppetitesQuery = any;
export type getAppetitesQueryVariables = any;

export const GetAppetitesByRiskIdDocument = parse(`query getAppetitesByRiskId(\$riskId: uuid!) {
  appetite_parent(
    where: { ParentId: { _eq: \$riskId } }
    order_by: [
      { appetite: { EffectiveDate: desc_nulls_last } }
      { appetite: { CreatedAtTimestamp: desc_nulls_last } }
    ]
  ) {
    Status

    appetite {
      ...AppetiteParts
      modifiedByUser {
        FriendlyName
      }
      impact {
        Id
        Name
      }
    }
  }
}

fragment AppetiteParts on appetite {
  Id
  LowerAppetite
  UpperAppetite
  ImpactAppetite
  LikelihoodAppetite
  Statement
  EffectiveDate
  AppetiteType
  CreatedAtTimestamp
  ModifiedAtTimestamp
  CreatedByUser
  ModifiedByUser
  CustomAttributeData
  SequentialId
  ImpactId
}`) as any;
export type GetAppetitesByRiskIdQuery = any;
export type GetAppetitesByRiskIdQueryVariables = any;
export type GetGetAppetitesByRiskIdQuery = any;
export type getAppetitesByRiskIdQuery = any;
export type getAppetitesByRiskIdQueryVariables = any;

export const GetAppetitesGroupedByImpactDocument = parse(`query getAppetitesGroupedByImpact {
  impact {
    Id
    appetites(
      order_by: [
        { EffectiveDate: desc_nulls_last }
        { CreatedAtTimestamp: desc_nulls_last }
      ]
    ) {
      ...AppetiteParts
      parents {
        risk {
          Id
        }
      }
    }
  }
}

fragment AppetiteParts on appetite {
  Id
  LowerAppetite
  UpperAppetite
  ImpactAppetite
  LikelihoodAppetite
  Statement
  EffectiveDate
  AppetiteType
  CreatedAtTimestamp
  ModifiedAtTimestamp
  CreatedByUser
  ModifiedByUser
  CustomAttributeData
  SequentialId
  ImpactId
}`) as any;
export type GetAppetitesGroupedByImpactQuery = any;
export type GetAppetitesGroupedByImpactQueryVariables = any;
export type GetGetAppetitesGroupedByImpactQuery = any;
export type getAppetitesGroupedByImpactQuery = any;
export type getAppetitesGroupedByImpactQueryVariables = any;

export const InsertAppetiteDocument = parse(`mutation insertAppetite(
  \$LowerAppetite: Int
  \$ParentIds: [uuid!]!
  \$Statement: String
  \$UpperAppetite: Int
  \$ImpactAppetite: Int
  \$LikelihoodAppetite: Int
  \$AppetiteType: appetite_type_enum
  \$EffectiveDate: timestamptz
  \$CustomAttributeData: jsonb
  \$ImpactId: uuid
) {
  insertChildAppetite(
    LowerAppetite: \$LowerAppetite
    ParentIds: \$ParentIds
    Statement: \$Statement
    UpperAppetite: \$UpperAppetite
    CustomAttributeData: \$CustomAttributeData
    EffectiveDate: \$EffectiveDate
    AppetiteType: \$AppetiteType
    ImpactAppetite: \$ImpactAppetite
    LikelihoodAppetite: \$LikelihoodAppetite
    ImpactId: \$ImpactId
  ) {
    Id
  }
}`) as any;
export type InsertAppetiteMutation = any;
export type InsertAppetiteMutationVariables = any;
export type insertAppetiteMutation = any;
export type insertAppetiteMutationVariables = any;

export const UpdateAppetiteDocument = parse(`mutation updateAppetite(
  \$LowerAppetite: Int
  \$Statement: String
  \$UpperAppetite: Int
  \$ImpactAppetite: Int
  \$LikelihoodAppetite: Int
  \$Id: uuid!
  \$OriginalTimestamp: timestamptz
  \$EffectiveDate: timestamptz
  \$AppetiteType: appetite_type_enum
  \$CustomAttributeData: jsonb
  \$ImpactId: uuid
) {
  update_appetite(
    _set: {
      LowerAppetite: \$LowerAppetite
      Statement: \$Statement
      UpperAppetite: \$UpperAppetite
      CustomAttributeData: \$CustomAttributeData
      EffectiveDate: \$EffectiveDate
      AppetiteType: \$AppetiteType
      ImpactAppetite: \$ImpactAppetite
      LikelihoodAppetite: \$LikelihoodAppetite
      ImpactId: \$ImpactId
    }
    where: {
      ModifiedAtTimestamp: { _eq: \$OriginalTimestamp }
      Id: { _eq: \$Id }
    }
  ) {
    affected_rows
  }
}`) as any;
export type UpdateAppetiteMutation = any;
export type UpdateAppetiteMutationVariables = any;
export type updateAppetiteMutation = any;
export type updateAppetiteMutationVariables = any;

export const GetChangeRequestsByApprovalDocument = parse(`query getChangeRequestsByApproval(\$approvalId: uuid!) {
  change_request(
    where: {
      responses: { approver: { level: { ApprovalId: { _eq: \$approvalId } } } }
      ChangeRequestStatus: { _eq: pending }
    }
  ) {
    Id
  }
}`) as any;
export type GetChangeRequestsByApprovalQuery = any;
export type GetChangeRequestsByApprovalQueryVariables = any;
export type GetGetChangeRequestsByApprovalQuery = any;
export type getChangeRequestsByApprovalQuery = any;
export type getChangeRequestsByApprovalQueryVariables = any;

export const DeleteApprovalDocument = parse(`mutation deleteApproval(\$Id: uuid!) {
  delete_approval(where: { Id: { _eq: \$Id } }) {
    affected_rows
  }
}`) as any;
export type DeleteApprovalMutation = any;
export type DeleteApprovalMutationVariables = any;
export type deleteApprovalMutation = any;
export type deleteApprovalMutationVariables = any;

export const GetApprovalAuditByIdDocument = parse(`query getApprovalAuditById(\$Id: uuid!) {
  approval_audit(where: { Id: { _eq: \$Id } }, order_by: {ModifiedAtTimestamp: desc}) {
    Id
    Workflow
    ModifiedAtTimestamp
    ModifiedByUser
    CreatedAtTimestamp
    CreatedByUser
    InFlightEditRule
  }
}`) as any;
export type GetApprovalAuditByIdQuery = any;
export type GetApprovalAuditByIdQueryVariables = any;
export type GetGetApprovalAuditByIdQuery = any;
export type getApprovalAuditByIdQuery = any;
export type getApprovalAuditByIdQueryVariables = any;

export const GetApprovalByIdDocument = parse(`query getApprovalById(\$Id: uuid!) {
  approval: approval_by_pk(Id: \$Id) {
    Id
    Workflow
    ModifiedAtTimestamp
    CreatedAtTimestamp
    InFlightEditRule
    levels(order_by: { SequenceOrder: asc }) {
      Id
      approvers {
        Id
        UserId
        UserGroupId
        OwnerApprover
        user {
          FriendlyName
        }
        group {
          Name
        }
      }
      ApprovalRuleType
    }
    createdBy {
      Id
      FriendlyName
    }
  }
}`) as any;
export type GetApprovalByIdQuery = any;
export type GetApprovalByIdQueryVariables = any;
export type GetGetApprovalByIdQuery = any;
export type getApprovalByIdQuery = any;
export type getApprovalByIdQueryVariables = any;

export const GetGlobalApprovalsDocument = parse(`query getGlobalApprovals(\$global: Boolean = true, \$parentId: uuid) {
  approval(
    where: {
      _or: [
        {
          _and: [
            { ParentId: { _is_null: \$global } }
            { _not: { Workflow: { _is_null: \$global } } }
          ]
        }
        { ParentId: { _eq: \$parentId } }
      ]
    }
  ) {
    Id
    Workflow
    ModifiedAtTimestamp
    CreatedAtTimestamp
    createdBy {
      Id
      FriendlyName
    }
    levels(order_by: { SequenceOrder: asc }) {
      Id
    }
  }
}`) as any;
export type GetGlobalApprovalsQuery = any;
export type GetGlobalApprovalsQueryVariables = any;
export type GetGetGlobalApprovalsQuery = any;
export type getGlobalApprovalsQuery = any;
export type getGlobalApprovalsQueryVariables = any;

export const InsertApprovalDocument = parse(`mutation insertApproval(\$approval: approval_insert_input!) {
  insert_approval_one(object: \$approval) {
    Id
  }
}`) as any;
export type InsertApprovalMutation = any;
export type InsertApprovalMutationVariables = any;
export type insertApprovalMutation = any;
export type insertApprovalMutationVariables = any;

export const UpdateApprovalDocument = parse(`mutation updateApproval(
  \$Id: uuid!
  \$approval: approval_set_input!
  \$updateLevels: [approval_level_updates!]!
  \$insertLevels: [approval_level_insert_input!]!
  \$insertApprovers: [approver_insert_input!]!
  \$deleteLevelIds: [uuid!]!
  \$deleteApproverIds: [uuid!]!
) {
  update_approval_by_pk(pk_columns: { Id: \$Id }, _set: \$approval) {
    Id
  }
  delete_approval_level(where: { Id: { _in: \$deleteLevelIds } }) {
    affected_rows
  }
  delete_approver(where: { Id: { _in: \$deleteApproverIds } }) {
    affected_rows
  }
  update_approval_level_many(updates: \$updateLevels) {
    affected_rows
  }
  insert_approval_level(objects: \$insertLevels) {
    affected_rows
  }
  insert_approver(objects: \$insertApprovers) {
    affected_rows
  }
}`) as any;
export type UpdateApprovalMutation = any;
export type UpdateApprovalMutationVariables = any;
export type updateApprovalMutation = any;
export type updateApprovalMutationVariables = any;

export const AssessmentActivityPartsDocument = parse(`fragment AssessmentActivityParts on assessment_activity {
  Title
  Id
  ParentId
  Summary
  Status
  ActivityType
  CompletionDate
  AssignedUser
  CreatedByUser
  CreatedAtTimestamp
  ModifiedByUser
  ModifiedAtTimestamp
  CustomAttributeData
  ownerGroups {
    UserGroupId
    group {
      Name
      users{
        UserId
      }
    }
  }
  owners {
    UserId
    user {
      FriendlyName
    }
  }
  createdByUser {
    FriendlyName
  }
  modifiedByUser {
    FriendlyName
  }
  IsRCSA
  RiskId
}`) as any;
export type AssessmentActivityPartsFragment = any;

export const DeleteAssessmentActivitiesDocument = parse(`mutation deleteAssessmentActivities(\$Ids: [uuid!]) {
  delete_assessment_activity(where: { Id: { _in: \$Ids } }) {
    affected_rows
  }
}`) as any;
export type DeleteAssessmentActivitiesMutation = any;
export type DeleteAssessmentActivitiesMutationVariables = any;
export type deleteAssessmentActivitiesMutation = any;
export type deleteAssessmentActivitiesMutationVariables = any;

export const GetAssessmentActivitiesDocument = parse(`query getAssessmentActivities {
  assessment_activity(where: { parentAssessment: {} }) {
    ...AssessmentActivityParts
    parentRisk {
      Title
      SequentialId
      scheduleState {
        DueDate
        OverdueDate
      }
    }
    assignedUser {
      Id
      FriendlyName
    }
    files {
      ...RelationFileParts
    }
  }
}

fragment AssessmentActivityParts on assessment_activity {
  Title
  Id
  ParentId
  Summary
  Status
  ActivityType
  CompletionDate
  AssignedUser
  CreatedByUser
  CreatedAtTimestamp
  ModifiedByUser
  ModifiedAtTimestamp
  CustomAttributeData
  ownerGroups {
    UserGroupId
    group {
      Name
      users{
        UserId
      }
    }
  }
  owners {
    UserId
    user {
      FriendlyName
    }
  }
  createdByUser {
    FriendlyName
  }
  modifiedByUser {
    FriendlyName
  }
  IsRCSA
  RiskId
}

fragment RelationFileParts on relation_file {
  ParentId
  ChangeRequestFileOperation
  file {
    ...FileParts
  }
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}`) as any;
export type GetAssessmentActivitiesQuery = any;
export type GetAssessmentActivitiesQueryVariables = any;
export type GetGetAssessmentActivitiesQuery = any;
export type getAssessmentActivitiesQuery = any;
export type getAssessmentActivitiesQueryVariables = any;

export const GetAssessmentActivitiesByParentIdDocument = parse(`query getAssessmentActivitiesByParentId(\$AssessmentId: uuid!) {
  assessment_activity(
    where: { ParentId: { _eq: \$AssessmentId }, IsRCSA: { _eq: false } }
  ) {
    ...AssessmentActivityParts
    assignedUser {
      FriendlyName
    }
    files {
      ...RelationFileParts
    }
  }
}

fragment AssessmentActivityParts on assessment_activity {
  Title
  Id
  ParentId
  Summary
  Status
  ActivityType
  CompletionDate
  AssignedUser
  CreatedByUser
  CreatedAtTimestamp
  ModifiedByUser
  ModifiedAtTimestamp
  CustomAttributeData
  ownerGroups {
    UserGroupId
    group {
      Name
      users{
        UserId
      }
    }
  }
  owners {
    UserId
    user {
      FriendlyName
    }
  }
  createdByUser {
    FriendlyName
  }
  modifiedByUser {
    FriendlyName
  }
  IsRCSA
  RiskId
}

fragment RelationFileParts on relation_file {
  ParentId
  ChangeRequestFileOperation
  file {
    ...FileParts
  }
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}`) as any;
export type GetAssessmentActivitiesByParentIdQuery = any;
export type GetAssessmentActivitiesByParentIdQueryVariables = any;
export type GetGetAssessmentActivitiesByParentIdQuery = any;
export type getAssessmentActivitiesByParentIdQuery = any;
export type getAssessmentActivitiesByParentIdQueryVariables = any;

export const GetAssessmentActivityAuditByIdDocument = parse(`query getAssessmentActivityAuditById(\$Id: uuid!) {
  assessment_activity_audit(where: { Id: { _eq: \$Id } }, order_by: {ModifiedAtTimestamp: desc}) {
    Title
    Id
    ParentId
    Summary
    Status
    ActivityType
    CompletionDate
    AssignedUser
    CreatedByUser
    CreatedAtTimestamp
    ModifiedByUser
    ModifiedAtTimestamp
    CustomAttributeData
  }
}`) as any;
export type GetAssessmentActivityAuditByIdQuery = any;
export type GetAssessmentActivityAuditByIdQueryVariables = any;
export type GetGetAssessmentActivityAuditByIdQuery = any;
export type getAssessmentActivityAuditByIdQuery = any;
export type getAssessmentActivityAuditByIdQueryVariables = any;

export const GetAssessmentActivityByIdDocument = parse(`query getAssessmentActivityById(\$AssessmentActivityId: uuid!) {
  assessment_activity(where: { Id: { _eq: \$AssessmentActivityId } }) {
    ...AssessmentActivityParts
    files {
      ...RelationFileParts
    }
    ancestorContributors {
      ...AncestorContributorParts
    }
  }
  linked_item(where: { Source: { _eq: \$AssessmentActivityId } }) {
    Id
    Source
    Target
    target_control {
      ...ControlParts
    }
    target_control_group {
      ...ControlGroupParts
    }
    target_obligation {
      ...ObligationParts
    }
    target_document {
      ...DocumentParts
    }
    target_risk {
      ...RiskParts
    }
    target_assessment_activity {
      ...AssessmentActivityParts
    }
    target_assessment {
      ...AssessmentParts
    }
    target_impact {
      ...ImpactParts
    }
    target_obligation_impact {
      Id
      Description
      ParentObligationId
    }
    target_impact_rating {
      Id
      impact {
        ...ImpactParts
      }
    }
    target_action {
      ...ActionParts
    }
    target_indicator {
      ...IndicatorParts
    }
    target_acceptance {
      ...AcceptanceParts
    }
    target_appetite {
      ...AppetiteParts
    }
    target_issue {
      ...IssueParts
    }
  }
}

fragment AssessmentActivityParts on assessment_activity {
  Title
  Id
  ParentId
  Summary
  Status
  ActivityType
  CompletionDate
  AssignedUser
  CreatedByUser
  CreatedAtTimestamp
  ModifiedByUser
  ModifiedAtTimestamp
  CustomAttributeData
  ownerGroups {
    UserGroupId
    group {
      Name
      users{
        UserId
      }
    }
  }
  owners {
    UserId
    user {
      FriendlyName
    }
  }
  createdByUser {
    FriendlyName
  }
  modifiedByUser {
    FriendlyName
  }
  IsRCSA
  RiskId
}

fragment RelationFileParts on relation_file {
  ParentId
  ChangeRequestFileOperation
  file {
    ...FileParts
  }
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}

fragment AncestorContributorParts on ancestor_contributor {
  ContributorType
  UserId
  Id
  AncestorId
  UserGroupId
  user {
    FriendlyName
  }
  user_group {
    Name
  }
}

fragment ControlParts on control {
  CreatedByUser
  ModifiedByUser
  Description
  Id
  CreatedAtTimestamp
  ModifiedAtTimestamp
  Title
  Type
  CustomAttributeData
  SequentialId
  schedule {
    ...ScheduleParts
  }
}

fragment ScheduleParts on schedule {
  Id
  Frequency
  ManualDueDate
  StartDate
  TimeToCompleteValue
  TimeToCompleteUnit
}

fragment ControlGroupParts on control_group {
  Description
  Id
  Owner
  ModifiedAtTimestamp
  CreatedAtTimestamp
  Title
  ModifiedByUser
  CreatedByUser
  CustomAttributeData
}

fragment ObligationParts on obligation {
  Adherence
  Description
  Id
  Interpretation
  ParentId
  Title
  Type
  CustomAttributeData
  SequentialId
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
  ExternalId
  RegulatorySourceId
  ExternalSyncedAt
  Reference
  SourceUrl
  schedule {
    ...ScheduleParts
  }
}

fragment DocumentParts on document {
  Id
  Title
  DocumentType
  Purpose
  ParentDocument
  CreatedByUser
  ModifiedByUser
  CreatedAtTimestamp
  ModifiedAtTimestamp
  CustomAttributeData
  SequentialId
  schedule {
    ...ScheduleParts
  }
}

fragment RiskParts on risk {
  Id
  Title
  Tier
  Description
  ParentRiskId
  CreatedByUser
  Treatment
  Status
  ModifiedByUser
  CreatedAtTimestamp
  ModifiedAtTimestamp
  CustomAttributeData
  SequentialId
  schedule {
    ...ScheduleParts
  }
}

fragment AssessmentParts on assessment {
  ActualCompletionDate
  CompletedByUser
  CreatedAtTimestamp
  CreatedByUser
  CustomAttributeData
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  NextTestDate
  OriginatingItemId
  SequentialId
  StartDate
  Summary
  TargetCompletionDate
  Title
  Status
  Outcome
}

fragment ImpactParts on impact {
  CreatedAtTimestamp
  CreatedByUser
  Rationale
  RatingGuidance
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  Name
  CustomAttributeData
  SequentialId
  LikelihoodAppetite
}

fragment ActionParts on action {
  DateDue
  DateRaised
  Description
  Id
  Priority
  Status
  ModifiedAtTimestamp
  CreatedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  ClosedDate
  CustomAttributeData
  SequentialId
}

fragment IndicatorParts on indicator {
  SequentialId
  Type
  UpperToleranceNum
  Unit
  Title
  TargetValueTxt
  LowerToleranceNum
  Id
  Description
  CustomAttributeData
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
  LowerAppetiteNum
  UpperAppetiteNum
  schedule {
    ...ScheduleParts
  }
}

fragment AcceptanceParts on acceptance {
  DateAcceptedFrom
  DateAcceptedTo
  Details
  Id
  Status
  ModifiedAtTimestamp
  CreatedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  ApprovedByUser
  ApprovedByUserGroup
  RequestedByUser
  RequestedByUserGroup
  CustomAttributeData
  SequentialId
}

fragment AppetiteParts on appetite {
  Id
  LowerAppetite
  UpperAppetite
  ImpactAppetite
  LikelihoodAppetite
  Statement
  EffectiveDate
  AppetiteType
  CreatedAtTimestamp
  ModifiedAtTimestamp
  CreatedByUser
  ModifiedByUser
  CustomAttributeData
  SequentialId
  ImpactId
}

fragment IssueParts on issue {
  RaisedAtTimestamp
  DateIdentified
  DateOccurred
  Details
  Id
  ImpactsCustomer
  IsExternalIssue
  CreatedAtTimestamp
  ModifiedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  SequentialId
  CustomAttributeData
  Meta
  Type
}`) as any;
export type GetAssessmentActivityByIdQuery = any;
export type GetAssessmentActivityByIdQueryVariables = any;
export type GetGetAssessmentActivityByIdQuery = any;
export type getAssessmentActivityByIdQuery = any;
export type getAssessmentActivityByIdQueryVariables = any;

export const GetAssessmentRCSAActivitiesByParentIdDocument = parse(`query getAssessmentRCSAActivitiesByParentId(\$AssessmentId: uuid!) {
  assessment_activity(
    where: { ParentId: { _eq: \$AssessmentId }, IsRCSA: { _eq: true } }
  ) {
    ...AssessmentActivityParts
    parentRisk {
      Title
      SequentialId
    }
    assignedUser {
      FriendlyName
    }
    files {
      ...RelationFileParts
    }
  }
}

fragment AssessmentActivityParts on assessment_activity {
  Title
  Id
  ParentId
  Summary
  Status
  ActivityType
  CompletionDate
  AssignedUser
  CreatedByUser
  CreatedAtTimestamp
  ModifiedByUser
  ModifiedAtTimestamp
  CustomAttributeData
  ownerGroups {
    UserGroupId
    group {
      Name
      users{
        UserId
      }
    }
  }
  owners {
    UserId
    user {
      FriendlyName
    }
  }
  createdByUser {
    FriendlyName
  }
  modifiedByUser {
    FriendlyName
  }
  IsRCSA
  RiskId
}

fragment RelationFileParts on relation_file {
  ParentId
  ChangeRequestFileOperation
  file {
    ...FileParts
  }
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}`) as any;
export type GetAssessmentRCSAActivitiesByParentIdQuery = any;
export type GetAssessmentRCSAActivitiesByParentIdQueryVariables = any;
export type GetGetAssessmentRCSAActivitiesByParentIdQuery = any;
export type getAssessmentRCSAActivitiesByParentIdQuery = any;
export type getAssessmentRCSAActivitiesByParentIdQueryVariables = any;

export const InsertAssessmentActivityWithLinkedItemsDocument = parse(`mutation insertAssessmentActivityWithLinkedItems(
  \$ActivityType: assessment_activity_type_enum!
  \$ParentId: uuid!
  \$Status: assessment_activity_status_enum!
  \$Summary: String
  \$Title: String!
  \$CompletionDate: timestamptz
  \$AssignedUser: String
  \$LinkedItemIds: [uuid!]!
  \$CustomAttributeData: jsonb
  \$IsRCSA: Boolean
  \$RiskId: uuid
  \$OwnerUserIds: [String!]!
  \$OwnerGroupIds: [uuid!]!
) {
  insertAssessmentActivityWithLinkedItems(
    ActivityType: \$ActivityType
    ParentId: \$ParentId
    Status: \$Status
    Summary: \$Summary
    Title: \$Title
    CompletionDate: \$CompletionDate
    AssignedUser: \$AssignedUser
    LinkedItemIds: \$LinkedItemIds
    CustomAttributeData: \$CustomAttributeData
    IsRCSA: \$IsRCSA
    RiskId: \$RiskId
    OwnerUserIds: \$OwnerUserIds
    OwnerGroupIds: \$OwnerGroupIds
  ) {
    Id
  }
}`) as any;
export type InsertAssessmentActivityWithLinkedItemsMutation = any;
export type InsertAssessmentActivityWithLinkedItemsMutationVariables = any;
export type insertAssessmentActivityWithLinkedItemsMutation = any;
export type insertAssessmentActivityWithLinkedItemsMutationVariables = any;

export const UpdateAssessmentActivityWithLinkedItemsDocument = parse(`mutation updateAssessmentActivityWithLinkedItems(
  \$ActivityType: assessment_activity_type_enum!
  \$Status: assessment_activity_status_enum!
  \$Summary: String
  \$Title: String
  \$CompletionDate: timestamptz
  \$AssignedUser: String
  \$OriginalTimestamp: timestamptz
  \$Id: uuid!
  \$ParentId: uuid!
  \$LinkedItemIds: [uuid!]!
  \$CustomAttributeData: jsonb
  \$IsWizardAction: Boolean
  \$OwnerUserIds: [String!]!
  \$OwnerGroupIds: [uuid!]!
) {
  updateAssessmentActivityWithLinkedItems(
    Id: \$Id
    ParentId: \$ParentId
    ActivityType: \$ActivityType
    Status: \$Status
    Summary: \$Summary
    Title: \$Title
    CompletionDate: \$CompletionDate
    AssignedUser: \$AssignedUser
    OriginalTimestamp: \$OriginalTimestamp
    LinkedItemIds: \$LinkedItemIds
    CustomAttributeData: \$CustomAttributeData
    IsWizardAction: \$IsWizardAction
    OwnerUserIds: \$OwnerUserIds
    OwnerGroupIds: \$OwnerGroupIds
  ) {
    Id
  }
}`) as any;
export type UpdateAssessmentActivityWithLinkedItemsMutation = any;
export type UpdateAssessmentActivityWithLinkedItemsMutationVariables = any;
export type updateAssessmentActivityWithLinkedItemsMutation = any;
export type updateAssessmentActivityWithLinkedItemsMutationVariables = any;

export const DocumentAssessmentResultPartsDocument = parse(`fragment DocumentAssessmentResultParts on document_assessment_result {
  Id
  Rating
  CustomAttributeData
  Rationale
  TestDate
}`) as any;
export type DocumentAssessmentResultPartsFragment = any;

export const ObligationAssessmentResultPartsDocument = parse(`fragment ObligationAssessmentResultParts on obligation_assessment_result {
  Id
  Rating
  CustomAttributeData
  Rationale
  TestDate
}`) as any;
export type ObligationAssessmentResultPartsFragment = any;

export const RiskAssessmentResultPartsDocument = parse(`fragment RiskAssessmentResultParts on risk_assessment_result {
  Id
  Likelihood
  Impact
  Rating
  ControlType
  CustomAttributeData
  Rationale
  TestDate
}`) as any;
export type RiskAssessmentResultPartsFragment = any;

export const DocumentInternalAuditResultPartsDocument = parse(`fragment DocumentInternalAuditResultParts on document_internal_audit_result {
  Id
  Rating
  CustomAttributeData
  Rationale
  TestDate
}`) as any;
export type DocumentInternalAuditResultPartsFragment = any;

export const ObligationInternalAuditResultPartsDocument = parse(`fragment ObligationInternalAuditResultParts on obligation_internal_audit_result {
  Id
  Rating
  CustomAttributeData
  Rationale
  TestDate
}`) as any;
export type ObligationInternalAuditResultPartsFragment = any;

export const RiskControlledInternalAuditResultPartsDocument = parse(`fragment RiskControlledInternalAuditResultParts on risk_controlled_internal_audit_result {
  Id
  Likelihood
  Impact
  Rating
  CustomAttributeData
  Rationale
  TestDate
}`) as any;
export type RiskControlledInternalAuditResultPartsFragment = any;

export const RiskUncontrolledInternalAuditResultPartsDocument = parse(`fragment RiskUncontrolledInternalAuditResultParts on risk_uncontrolled_internal_audit_result {
  Id
  Likelihood
  Impact
  Rating
  CustomAttributeData
  Rationale
  TestDate
}`) as any;
export type RiskUncontrolledInternalAuditResultPartsFragment = any;

export const DocumentSecondLineResultPartsDocument = parse(`fragment DocumentSecondLineResultParts on document_second_line_result {
  Id
  Rating
  CustomAttributeData
  Rationale
  TestDate
}`) as any;
export type DocumentSecondLineResultPartsFragment = any;

export const ObligationSecondLineResultPartsDocument = parse(`fragment ObligationSecondLineResultParts on obligation_second_line_result {
  Id
  Rating
  CustomAttributeData
  Rationale
  TestDate
}`) as any;
export type ObligationSecondLineResultPartsFragment = any;

export const RiskControlledSecondLineResultPartsDocument = parse(`fragment RiskControlledSecondLineResultParts on risk_controlled_second_line_result {
  Id
  Likelihood
  Impact
  Rating
  CustomAttributeData
  Rationale
  TestDate
}`) as any;
export type RiskControlledSecondLineResultPartsFragment = any;

export const RiskUncontrolledSecondLineResultPartsDocument = parse(`fragment RiskUncontrolledSecondLineResultParts on risk_uncontrolled_second_line_result {
  Id
  Likelihood
  Impact
  Rating
  CustomAttributeData
  Rationale
  TestDate
}`) as any;
export type RiskUncontrolledSecondLineResultPartsFragment = any;

export const DeleteAssessmentResultsDocument = parse(`mutation deleteAssessmentResults(\$Ids: [uuid!]!) {
  delete_document_assessment_result(where: { Id: { _in: \$Ids } }) {
    affected_rows
  }

  delete_obligation_assessment_result(where: { Id: { _in: \$Ids } }) {
    affected_rows
  }

  delete_risk_assessment_result(where: { Id: { _in: \$Ids } }) {
    affected_rows
  }

  delete_test_result(where: { Id: { _in: \$Ids } }) {
    affected_rows
  }

  delete_relation_file(where: { ParentId: { _in: \$Ids } }) {
    affected_rows
  }
}`) as any;
export type DeleteAssessmentResultsMutation = any;
export type DeleteAssessmentResultsMutationVariables = any;
export type deleteAssessmentResultsMutation = any;
export type deleteAssessmentResultsMutationVariables = any;

export const GetAllAssessmentResultsDocument = parse(`query getAllAssessmentResults {
  document_assessment_result(
    order_by: { CreatedByUser: asc }
    where: { parents: { assessment: {} } }
  ) {
    ...DocumentAssessmentResultParts
    assessments: parents(where: { ParentType: { _eq: assessment } }) {
      assessment {
        Id
        Title
        ActualCompletionDate
        StartDate
        Status
        completedByUser {
          FriendlyName
        }
      }
    }
    documents: parents(where: { ParentType: { _eq: document } }) {
      document {
        Id
        Title
      }
      node {
        Id
        SequentialId
        ObjectType
      }
    }
    files {
      ...RelationFileParts
    }
  }

  obligation_assessment_result(
    order_by: { CreatedByUser: asc }
    where: { parents: { assessment: {} } }
  ) {
    ...ObligationAssessmentResultParts
    assessments: parents(where: { ParentType: { _eq: assessment } }) {
      assessment {
        Id
        Title
        ActualCompletionDate
        StartDate
        Status
        completedByUser {
          FriendlyName
        }
      }
    }
    obligations: parents(where: { ParentType: { _eq: obligation } }) {
      obligation {
        Id
        Title
      }
      node {
        Id
        SequentialId
        ObjectType
      }
    }
    files {
      ...RelationFileParts
    }
  }

  risk_assessment_result(
    order_by: { CreatedByUser: asc }
    where: { parents: { assessment: {} } }
  ) {
    ...RiskAssessmentResultParts
    assessments: parents(where: { ParentType: { _eq: assessment } }) {
      assessment {
        Id
        Title
        ActualCompletionDate
        StartDate
        Status
        completedByUser {
          FriendlyName
        }
      }
    }
    risks: parents(where: { ParentType: { _eq: risk } }) {
      risk {
        Id
        Title
      }
      node {
        Id
        SequentialId
        ObjectType
      }
    }
    files {
      ...RelationFileParts
    }
  }
}

fragment DocumentAssessmentResultParts on document_assessment_result {
  Id
  Rating
  CustomAttributeData
  Rationale
  TestDate
}

fragment RelationFileParts on relation_file {
  ParentId
  ChangeRequestFileOperation
  file {
    ...FileParts
  }
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}

fragment ObligationAssessmentResultParts on obligation_assessment_result {
  Id
  Rating
  CustomAttributeData
  Rationale
  TestDate
}

fragment RiskAssessmentResultParts on risk_assessment_result {
  Id
  Likelihood
  Impact
  Rating
  ControlType
  CustomAttributeData
  Rationale
  TestDate
}`) as any;
export type GetAllAssessmentResultsQuery = any;
export type GetAllAssessmentResultsQueryVariables = any;
export type GetGetAllAssessmentResultsQuery = any;
export type getAllAssessmentResultsQuery = any;
export type getAllAssessmentResultsQueryVariables = any;

export const GetAssessmentResultByIdDocument = parse(`query getAssessmentResultById(\$Id: uuid!) {
  assessment_result_parent(where: { Id: { _eq: \$Id } }) {
    Id
    ParentId
    ResultType
    ParentType
    obligationAssessmentResult {
      ...ObligationAssessmentResultParts
    }
    documentAssessmentResult {
      ...DocumentAssessmentResultParts
    }
    riskAssessmentResult {
      ...RiskAssessmentResultParts
    }
    testResult {
      ...TestResultParts
    }
    impactRating {
      ...ImpactRatingParts
    }
  }
}

fragment ObligationAssessmentResultParts on obligation_assessment_result {
  Id
  Rating
  CustomAttributeData
  Rationale
  TestDate
}

fragment DocumentAssessmentResultParts on document_assessment_result {
  Id
  Rating
  CustomAttributeData
  Rationale
  TestDate
}

fragment RiskAssessmentResultParts on risk_assessment_result {
  Id
  Likelihood
  Impact
  Rating
  ControlType
  CustomAttributeData
  Rationale
  TestDate
}

fragment TestResultParts on test_result {
  Description
  DesignEffectiveness
  Id
  OverallEffectiveness
  ParentControlId
  PerformanceEffectiveness
  Submitter
  TestDate
  TestType
  CreatedAtTimestamp
  ModifiedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  CustomAttributeData
  SequentialId
}

fragment ImpactRatingParts on impact_rating {
  CreatedAtTimestamp
  CreatedByUser
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  CustomAttributeData
  SequentialId
  Rating
  RatedItemId
  ImpactId
  TestDate
  CompletedBy
  Likelihood
}`) as any;
export type GetAssessmentResultByIdQuery = any;
export type GetAssessmentResultByIdQueryVariables = any;
export type GetGetAssessmentResultByIdQuery = any;
export type getAssessmentResultByIdQuery = any;
export type getAssessmentResultByIdQueryVariables = any;

export const GetAssessmentResultParentAuditByIdDocument = parse(`query getAssessmentResultParentAuditById(\$Id: uuid!) {
  assessment_result_parent_audit(where: { Id: { _eq: \$Id } }, order_by: {ModifiedAtTimestamp: desc}) {
    Id
    ParentId
    ResultType
    ParentType
    CreatedByUser
    CreatedAtTimestamp
    ModifiedByUser
    ModifiedAtTimestamp
  }
}`) as any;
export type GetAssessmentResultParentAuditByIdQuery = any;
export type GetAssessmentResultParentAuditByIdQueryVariables = any;
export type GetGetAssessmentResultParentAuditByIdQuery = any;
export type getAssessmentResultParentAuditByIdQuery = any;
export type getAssessmentResultParentAuditByIdQueryVariables = any;

export const GetAssessmentResultsByParentIdDocument = parse(`query getAssessmentResultsByParentId(\$ParentId: uuid!) {
  document_assessment_result(
    where: { parents: { ParentId: { _eq: \$ParentId } } }
    order_by: [{ TestDate: desc_nulls_last }, { CreatedAtTimestamp: desc }]
  ) {
    ...DocumentAssessmentResultParts
    parents(where: { ParentType: { _eq: document } }) {
      document {
        Id
        Title
      }
      node {
        Id
        SequentialId
        ObjectType
      }
    }
    files {
      ...RelationFileParts
    }
    ancestorContributors {
      ...AncestorContributorParts
    }
  }

  obligation_assessment_result(
    where: { parents: { ParentId: { _eq: \$ParentId } } }
    order_by: [{ TestDate: desc_nulls_last }, { CreatedAtTimestamp: desc }]
  ) {
    ...ObligationAssessmentResultParts
    parents(where: { ParentType: { _eq: obligation } }) {
      obligation {
        Id
        Title
      }
      node {
        Id
        SequentialId
        ObjectType
      }
    }
    files {
      ...RelationFileParts
    }
    ancestorContributors {
      ...AncestorContributorParts
    }
  }

  risk_assessment_result(
    where: { parents: { ParentId: { _eq: \$ParentId } } }
    order_by: [{ TestDate: desc_nulls_last }, { CreatedAtTimestamp: desc }]
  ) {
    ...RiskAssessmentResultParts
    parents(where: { ParentType: { _eq: risk } }) {
      risk {
        Id
        Title
      }
      node {
        Id
        SequentialId
        ObjectType
      }
    }
    files {
      ...RelationFileParts
    }
    ancestorContributors {
      ...AncestorContributorParts
    }
  }

  test_result(
    where: { assessmentParents: { ParentId: { _eq: \$ParentId } } }
    order_by: [{ TestDate: desc_nulls_last }, { CreatedAtTimestamp: desc }]
  ) {
    ...TestResultParts
    parent {
      ...ControlParts
    }
    files {
      ...RelationFileParts
    }
  }

  impact_rating(
    where: { assessmentParents: { ParentId: { _eq: \$ParentId } } }
  ) {
    ...ImpactRatingParts
    createdByUser {
      FriendlyName
    }
    completedBy {
      FriendlyName
    }
    impact {
      Id
      Name
    }
    ratedItem {
      risk {
        Title
      }
      ObjectType
    }
  }

  issue(where: { parents: { ParentId: { _eq: \$ParentId } } }) {
    ...IssueParts
    consequences {
      CostType
      CostValue
      Type
    }
    owners {
      ...OwnerParts
    }
    ownerGroups {
      ...OwnerGroupParts
    }
    contributors {
      ...ContributorParts
    }
    contributorGroups {
      ...ContributorGroupParts
    }
    ancestorContributors {
      ...AncestorContributorParts
    }
    assessment {
      ...IssueAssessmentParts
      modifiedByUser {
        FriendlyName
      }
      createdByUser {
        FriendlyName
      }
      certifiedIndividual {
        FriendlyName
      }
      departments {
        ...DepartmentParts
      }
    }
    actions_aggregate(where: { action: { Status: { _eq: open } } }) {
      aggregate {
        count
      }
    }
    modifiedByUser {
      FriendlyName
    }
    createdByUser {
      FriendlyName
    }
    departments {
      ...DepartmentParts
    }
    tags {
      ...TagParts
    }
    parents {
      obligation {
        Title
        Id
      }
      document {
        Title
        Id
      }
      control {
        Title
        Id
      }
      assessment {
        Title
        Id
      }
    }
  }

  impact(where: { parents: { ParentId: { _eq: \$ParentId } } }) {
    ...ImpactParts
    createdByUser {
      FriendlyName
    }
    owners {
      ...OwnerParts
    }
    ownerGroups {
      ...OwnerGroupParts
    }
    ratings(
      distinct_on: [RatedItemId]
      order_by: [{ RatedItemId: desc }, { TestDate: desc }]
    ) {
      Rating
      RatedItemId
      ratedItem {
        risk {
          Id
          Title
        }
      }
    }
    appetites(
      order_by: [
        { EffectiveDate: desc_nulls_last }
        { CreatedAtTimestamp: desc_nulls_last }
      ]
    ) {
      ...AppetiteParts
      ImpactId
      parents {
        risk {
          Id
        }
      }
    }
  }

  action(where: { parents: { ParentId: { _eq: \$ParentId } } }) {
    ...ActionParts
    parents {
      parent {
        Id
        ObjectType
        SequentialId
      }
      obligation {
        Title
        Id
      }
      risk {
        Title
        Id
      }
      control {
        Title
        Id
      }
      issue {
        Title
        Id
        Type
      }
      document {
        Title
        Id
      }
      assessment {
        Title
        Id
      }
    }
    updates(order_by: { CreatedAtTimestamp: desc }, limit: 1) {
      ...ActionUpdateParts
    }
    updates_aggregate {
      aggregate {
        count
      }
    }
    owners {
      ...OwnerParts
    }
    ownerGroups {
      ...OwnerGroupParts
    }
    contributors {
      ...ContributorParts
    }
    contributorGroups {
      ...ContributorGroupParts
    }
    ancestorContributors {
      ...AncestorContributorParts
    }
    modifiedByUser {
      FriendlyName
    }
    createdByUser {
      FriendlyName
    }
    tags {
      ...TagParts
    }
    departments {
      ...DepartmentParts
    }
  }
}

fragment DocumentAssessmentResultParts on document_assessment_result {
  Id
  Rating
  CustomAttributeData
  Rationale
  TestDate
}

fragment RelationFileParts on relation_file {
  ParentId
  ChangeRequestFileOperation
  file {
    ...FileParts
  }
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}

fragment AncestorContributorParts on ancestor_contributor {
  ContributorType
  UserId
  Id
  AncestorId
  UserGroupId
  user {
    FriendlyName
  }
  user_group {
    Name
  }
}

fragment ObligationAssessmentResultParts on obligation_assessment_result {
  Id
  Rating
  CustomAttributeData
  Rationale
  TestDate
}

fragment RiskAssessmentResultParts on risk_assessment_result {
  Id
  Likelihood
  Impact
  Rating
  ControlType
  CustomAttributeData
  Rationale
  TestDate
}

fragment TestResultParts on test_result {
  Description
  DesignEffectiveness
  Id
  OverallEffectiveness
  ParentControlId
  PerformanceEffectiveness
  Submitter
  TestDate
  TestType
  CreatedAtTimestamp
  ModifiedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  CustomAttributeData
  SequentialId
}

fragment ControlParts on control {
  CreatedByUser
  ModifiedByUser
  Description
  Id
  CreatedAtTimestamp
  ModifiedAtTimestamp
  Title
  Type
  CustomAttributeData
  SequentialId
  schedule {
    ...ScheduleParts
  }
}

fragment ScheduleParts on schedule {
  Id
  Frequency
  ManualDueDate
  StartDate
  TimeToCompleteValue
  TimeToCompleteUnit
}

fragment ImpactRatingParts on impact_rating {
  CreatedAtTimestamp
  CreatedByUser
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  CustomAttributeData
  SequentialId
  Rating
  RatedItemId
  ImpactId
  TestDate
  CompletedBy
  Likelihood
}

fragment IssueParts on issue {
  RaisedAtTimestamp
  DateIdentified
  DateOccurred
  Details
  Id
  ImpactsCustomer
  IsExternalIssue
  CreatedAtTimestamp
  ModifiedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  SequentialId
  CustomAttributeData
  Meta
  Type
}

fragment OwnerParts on owner {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment OwnerGroupParts on owner_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment ContributorParts on contributor {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment ContributorGroupParts on contributor_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment IssueAssessmentParts on issue_assessment {
  ActualCloseDate
  CertifiedIndividual
  IssueCausedBySystemIssue
  IssueCausedByThirdParty
  IssueType
  ParentIssueId
  PoliciesBreached
  PolicyBreach
  PolicyOwner
  PolicyOwnerCommentary
  Rationale
  RegulatoryBreach
  RegulationsBreached
  Reportable
  Severity
  Status
  SystemResponsible
  TargetCloseDate
  ThirdPartyResponsible
  CreatedAtTimestamp
  ModifiedAtTimestamp
  CreatedByUser
  ModifiedByUser
  Id
  CustomAttributeData
  Type
}

fragment DepartmentParts on department {
  type {
    Description
    Name
  }
  ParentId
  DepartmentTypeId
}

fragment TagParts on tag {
  type {
    Description
    Name
  }
  ParentId
  TagTypeId
}

fragment ImpactParts on impact {
  CreatedAtTimestamp
  CreatedByUser
  Rationale
  RatingGuidance
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  Name
  CustomAttributeData
  SequentialId
  LikelihoodAppetite
}

fragment AppetiteParts on appetite {
  Id
  LowerAppetite
  UpperAppetite
  ImpactAppetite
  LikelihoodAppetite
  Statement
  EffectiveDate
  AppetiteType
  CreatedAtTimestamp
  ModifiedAtTimestamp
  CreatedByUser
  ModifiedByUser
  CustomAttributeData
  SequentialId
  ImpactId
}

fragment ActionParts on action {
  DateDue
  DateRaised
  Description
  Id
  Priority
  Status
  ModifiedAtTimestamp
  CreatedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  ClosedDate
  CustomAttributeData
  SequentialId
}

fragment ActionUpdateParts on action_update {
  Description
  Id
  ParentActionId
  CreatedAtTimestamp
  ModifiedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  CustomAttributeData
}`) as any;
export type GetAssessmentResultsByParentIdQuery = any;
export type GetAssessmentResultsByParentIdQueryVariables = any;
export type GetGetAssessmentResultsByParentIdQuery = any;
export type getAssessmentResultsByParentIdQuery = any;
export type getAssessmentResultsByParentIdQueryVariables = any;

export const GetDocumentAssessmentResultAuditByIdDocument = parse(`query getDocumentAssessmentResultAuditById(
  \$Id: uuid!
) {
  document_assessment_result_audit(where: { Id: { _eq: \$Id } }, order_by: {ModifiedAtTimestamp: desc}) {
    Id
    Rating
    CustomAttributeData
    Rationale
    TestDate
    CreatedByUser
    CreatedAtTimestamp
    ModifiedByUser
    ModifiedAtTimestamp
  }
}`) as any;
export type GetDocumentAssessmentResultAuditByIdQuery = any;
export type GetDocumentAssessmentResultAuditByIdQueryVariables = any;
export type GetGetDocumentAssessmentResultAuditByIdQuery = any;
export type getDocumentAssessmentResultAuditByIdQuery = any;
export type getDocumentAssessmentResultAuditByIdQueryVariables = any;

export const GetDocumentAssessmentResultByIdDocument = parse(`query getDocumentAssessmentResultById(\$Id: uuid!) {
  document_assessment_result(where: { Id: { _eq: \$Id } }) {
    ...DocumentAssessmentResultParts
    parents {
      document {
        Id
        Title
      }
      assessment {
        Id
        Title
      }
    }
    files {
      ...RelationFileParts
    }
  }
}

fragment DocumentAssessmentResultParts on document_assessment_result {
  Id
  Rating
  CustomAttributeData
  Rationale
  TestDate
}

fragment RelationFileParts on relation_file {
  ParentId
  ChangeRequestFileOperation
  file {
    ...FileParts
  }
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}`) as any;
export type GetDocumentAssessmentResultByIdQuery = any;
export type GetDocumentAssessmentResultByIdQueryVariables = any;
export type GetGetDocumentAssessmentResultByIdQuery = any;
export type getDocumentAssessmentResultByIdQuery = any;
export type getDocumentAssessmentResultByIdQueryVariables = any;

export const GetDocumentAssessmentResultsByParentIdDocument = parse(`query getDocumentAssessmentResultsByParentId(\$ParentId: uuid!) {
  document_assessment_result(
    where: {
      parents: { ParentId: { _eq: \$ParentId } }
      RatingType: { _in: ["assessment", "rating"] }
    }
  ) {
    ...DocumentAssessmentResultParts
    files {
      ...RelationFileParts
    }
    parents(where: { ParentType: { _eq: assessment } }) {
      assessment {
        ...AssessmentParts
        completedByUser {
          FriendlyName
        }
      }
    }
  }
}

fragment DocumentAssessmentResultParts on document_assessment_result {
  Id
  Rating
  CustomAttributeData
  Rationale
  TestDate
}

fragment RelationFileParts on relation_file {
  ParentId
  ChangeRequestFileOperation
  file {
    ...FileParts
  }
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}

fragment AssessmentParts on assessment {
  ActualCompletionDate
  CompletedByUser
  CreatedAtTimestamp
  CreatedByUser
  CustomAttributeData
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  NextTestDate
  OriginatingItemId
  SequentialId
  StartDate
  Summary
  TargetCompletionDate
  Title
  Status
  Outcome
}`) as any;
export type GetDocumentAssessmentResultsByParentIdQuery = any;
export type GetDocumentAssessmentResultsByParentIdQueryVariables = any;
export type GetGetDocumentAssessmentResultsByParentIdQuery = any;
export type getDocumentAssessmentResultsByParentIdQuery = any;
export type getDocumentAssessmentResultsByParentIdQueryVariables = any;

export const GetLatestDocumentAssessmentResultByDocumentIdDocument = parse(`query getLatestDocumentAssessmentResultByDocumentId(\$DocumentId: uuid!) {
  document_assessment_result(
    where: {
      parents: { ParentId: { _eq: \$DocumentId } }
      RatingType: { _in: ["assessment", "rating"] }
    }
    order_by: [{ TestDate: desc_nulls_last }, { CreatedAtTimestamp: desc }]
  ) {
    ...DocumentAssessmentResultParts
    ancestorContributors {
      ...AncestorContributorParts
    }
    parents(where: { ParentType: { _eq: assessment } }) {
      assessment {
        ...AssessmentParts
      }
    }
  }
}

fragment DocumentAssessmentResultParts on document_assessment_result {
  Id
  Rating
  CustomAttributeData
  Rationale
  TestDate
}

fragment AncestorContributorParts on ancestor_contributor {
  ContributorType
  UserId
  Id
  AncestorId
  UserGroupId
  user {
    FriendlyName
  }
  user_group {
    Name
  }
}

fragment AssessmentParts on assessment {
  ActualCompletionDate
  CompletedByUser
  CreatedAtTimestamp
  CreatedByUser
  CustomAttributeData
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  NextTestDate
  OriginatingItemId
  SequentialId
  StartDate
  Summary
  TargetCompletionDate
  Title
  Status
  Outcome
}`) as any;
export type GetLatestDocumentAssessmentResultByDocumentIdQuery = any;
export type GetLatestDocumentAssessmentResultByDocumentIdQueryVariables = any;
export type GetGetLatestDocumentAssessmentResultByDocumentIdQuery = any;
export type getLatestDocumentAssessmentResultByDocumentIdQuery = any;
export type getLatestDocumentAssessmentResultByDocumentIdQueryVariables = any;

export const GetLatestDocumentAssessmentResultsDocument = parse(`query getLatestDocumentAssessmentResults {
  document_assessment_result(
    where: { RatingType: { _in: ["assessment", "rating"] } }
    order_by: [
      { TestDate: desc_nulls_last }
      { CreatedAtTimestamp: desc_nulls_last }
    ]
  ) {
    ...DocumentAssessmentResultParts
    parents {
      ParentId
      assessment {
        ...AssessmentParts
      }
    }
  }
}

fragment DocumentAssessmentResultParts on document_assessment_result {
  Id
  Rating
  CustomAttributeData
  Rationale
  TestDate
}

fragment AssessmentParts on assessment {
  ActualCompletionDate
  CompletedByUser
  CreatedAtTimestamp
  CreatedByUser
  CustomAttributeData
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  NextTestDate
  OriginatingItemId
  SequentialId
  StartDate
  Summary
  TargetCompletionDate
  Title
  Status
  Outcome
}`) as any;
export type GetLatestDocumentAssessmentResultsQuery = any;
export type GetLatestDocumentAssessmentResultsQueryVariables = any;
export type GetGetLatestDocumentAssessmentResultsQuery = any;
export type getLatestDocumentAssessmentResultsQuery = any;
export type getLatestDocumentAssessmentResultsQueryVariables = any;

export const GetLatestObligationAssessmentResultByObligationIdDocument = parse(`query getLatestObligationAssessmentResultByObligationId(\$ObligationId: uuid!) {
  obligation_assessment_result(
    where: {
      parents: { ParentId: { _eq: \$ObligationId } }
      RatingType: { _in: ["assessment", "rating"] }
    }
    order_by: [
      { TestDate: desc_nulls_last }
      { CreatedAtTimestamp: desc_nulls_last }
    ]
  ) {
    ...ObligationAssessmentResultParts
    ancestorContributors {
      ...AncestorContributorParts
    }
    parents(where: { ParentType: { _eq: assessment } }) {
      assessment {
        ...AssessmentParts
      }
    }
  }
}

fragment ObligationAssessmentResultParts on obligation_assessment_result {
  Id
  Rating
  CustomAttributeData
  Rationale
  TestDate
}

fragment AncestorContributorParts on ancestor_contributor {
  ContributorType
  UserId
  Id
  AncestorId
  UserGroupId
  user {
    FriendlyName
  }
  user_group {
    Name
  }
}

fragment AssessmentParts on assessment {
  ActualCompletionDate
  CompletedByUser
  CreatedAtTimestamp
  CreatedByUser
  CustomAttributeData
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  NextTestDate
  OriginatingItemId
  SequentialId
  StartDate
  Summary
  TargetCompletionDate
  Title
  Status
  Outcome
}`) as any;
export type GetLatestObligationAssessmentResultByObligationIdQuery = any;
export type GetLatestObligationAssessmentResultByObligationIdQueryVariables = any;
export type GetGetLatestObligationAssessmentResultByObligationIdQuery = any;
export type getLatestObligationAssessmentResultByObligationIdQuery = any;
export type getLatestObligationAssessmentResultByObligationIdQueryVariables = any;

export const GetLatestObligationAssessmentResultsDocument = parse(`query getLatestObligationAssessmentResults {
  obligation_assessment_result(
    where: { RatingType: { _in: ["assessment", "rating"] } }
    order_by: [
      { TestDate: desc_nulls_last }
      { CreatedAtTimestamp: desc_nulls_last }
    ]
  ) {
    ...ObligationAssessmentResultParts
    parents {
      ParentId
      assessment {
        ...AssessmentParts
      }
    }
  }
}

fragment ObligationAssessmentResultParts on obligation_assessment_result {
  Id
  Rating
  CustomAttributeData
  Rationale
  TestDate
}

fragment AssessmentParts on assessment {
  ActualCompletionDate
  CompletedByUser
  CreatedAtTimestamp
  CreatedByUser
  CustomAttributeData
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  NextTestDate
  OriginatingItemId
  SequentialId
  StartDate
  Summary
  TargetCompletionDate
  Title
  Status
  Outcome
}`) as any;
export type GetLatestObligationAssessmentResultsQuery = any;
export type GetLatestObligationAssessmentResultsQueryVariables = any;
export type GetGetLatestObligationAssessmentResultsQuery = any;
export type getLatestObligationAssessmentResultsQuery = any;
export type getLatestObligationAssessmentResultsQueryVariables = any;

export const GetLatestRiskScoresByRiskIdDocument = parse(`subscription getLatestRiskScoresByRiskId(\$RiskId: uuid!) {
  risk_score(where: { RiskId: { _eq: \$RiskId } }) {
    ResidualScore
    InherentScore
    ResidualRating
    InherentRating
    ResidualImpact
    ResidualLikelihood
    InherentImpact
    InherentLikelihood
    ModifiedAtTimestamp
  }
}`) as any;
export type GetLatestRiskScoresByRiskIdSubscription = any;
export type GetLatestRiskScoresByRiskIdSubscriptionVariables = any;

export const GetObligationAssessmentResultAuditByIdDocument = parse(`query getObligationAssessmentResultAuditById(
  \$Id: uuid!
) {
  obligation_assessment_result_audit(where: { Id: { _eq: \$Id } }, order_by: {ModifiedAtTimestamp: desc}) {
    Id
    Rating
    CustomAttributeData
    Rationale
    TestDate
    ModifiedByUser
    ModifiedAtTimestamp
    CreatedByUser
    CreatedAtTimestamp
  }
}`) as any;
export type GetObligationAssessmentResultAuditByIdQuery = any;
export type GetObligationAssessmentResultAuditByIdQueryVariables = any;
export type GetGetObligationAssessmentResultAuditByIdQuery = any;
export type getObligationAssessmentResultAuditByIdQuery = any;
export type getObligationAssessmentResultAuditByIdQueryVariables = any;

export const GetObligationAssessmentResultByIdDocument = parse(`query getObligationAssessmentResultById(\$Id: uuid!) {
  obligation_assessment_result(where: { Id: { _eq: \$Id } }) {
    ...ObligationAssessmentResultParts
    parents {
      obligation {
        Id
        Title
      }
      assessment {
        Id
        Title
      }
    }
    files {
      ...RelationFileParts
    }
  }
}

fragment ObligationAssessmentResultParts on obligation_assessment_result {
  Id
  Rating
  CustomAttributeData
  Rationale
  TestDate
}

fragment RelationFileParts on relation_file {
  ParentId
  ChangeRequestFileOperation
  file {
    ...FileParts
  }
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}`) as any;
export type GetObligationAssessmentResultByIdQuery = any;
export type GetObligationAssessmentResultByIdQueryVariables = any;
export type GetGetObligationAssessmentResultByIdQuery = any;
export type getObligationAssessmentResultByIdQuery = any;
export type getObligationAssessmentResultByIdQueryVariables = any;

export const GetObligationAssessmentResultsByObligationIdDocument = parse(`query getObligationAssessmentResultsByObligationId(\$ObligationId: uuid!) {
  obligation_assessment_result(
    where: {
      parents: { ParentId: { _eq: \$ObligationId } }
      RatingType: { _in: ["assessment", "rating"] }
    }
  ) {
    ...ObligationAssessmentResultParts
    files {
      ...RelationFileParts
    }
    parents(where: { ParentType: { _eq: assessment } }) {
      assessment {
        ...AssessmentParts
        completedByUser {
          FriendlyName
        }
      }
    }
  }
}

fragment ObligationAssessmentResultParts on obligation_assessment_result {
  Id
  Rating
  CustomAttributeData
  Rationale
  TestDate
}

fragment RelationFileParts on relation_file {
  ParentId
  ChangeRequestFileOperation
  file {
    ...FileParts
  }
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}

fragment AssessmentParts on assessment {
  ActualCompletionDate
  CompletedByUser
  CreatedAtTimestamp
  CreatedByUser
  CustomAttributeData
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  NextTestDate
  OriginatingItemId
  SequentialId
  StartDate
  Summary
  TargetCompletionDate
  Title
  Status
  Outcome
}`) as any;
export type GetObligationAssessmentResultsByObligationIdQuery = any;
export type GetObligationAssessmentResultsByObligationIdQueryVariables = any;
export type GetGetObligationAssessmentResultsByObligationIdQuery = any;
export type getObligationAssessmentResultsByObligationIdQuery = any;
export type getObligationAssessmentResultsByObligationIdQueryVariables = any;

export const GetRiskAssessmentResultAuditByIdDocument = parse(`query getRiskAssessmentResultAuditById(
  \$Id: uuid!
) {
  risk_assessment_result_audit(where: { Id: { _eq: \$Id } }, order_by: {ModifiedAtTimestamp: desc}) {
    Id
    Likelihood
    Impact
    Rating
    ControlType
    CustomAttributeData
    Rationale
    TestDate
    ModifiedByUser
    ModifiedAtTimestamp
    CreatedByUser
    CreatedAtTimestamp
  }
}`) as any;
export type GetRiskAssessmentResultAuditByIdQuery = any;
export type GetRiskAssessmentResultAuditByIdQueryVariables = any;
export type GetGetRiskAssessmentResultAuditByIdQuery = any;
export type getRiskAssessmentResultAuditByIdQuery = any;
export type getRiskAssessmentResultAuditByIdQueryVariables = any;

export const GetRiskAssessmentResultByIdDocument = parse(`query getRiskAssessmentResultById(\$Id: uuid!) {
  risk_assessment_result(where: { Id: { _eq: \$Id } }) {
    ...RiskAssessmentResultParts
    parents {
      risk {
        Id
        Title
      }
      assessment {
        Id
        Title
      }
    }
    files {
      ...RelationFileParts
    }
  }
}

fragment RiskAssessmentResultParts on risk_assessment_result {
  Id
  Likelihood
  Impact
  Rating
  ControlType
  CustomAttributeData
  Rationale
  TestDate
}

fragment RelationFileParts on relation_file {
  ParentId
  ChangeRequestFileOperation
  file {
    ...FileParts
  }
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}`) as any;
export type GetRiskAssessmentResultByIdQuery = any;
export type GetRiskAssessmentResultByIdQueryVariables = any;
export type GetGetRiskAssessmentResultByIdQuery = any;
export type getRiskAssessmentResultByIdQuery = any;
export type getRiskAssessmentResultByIdQueryVariables = any;

export const GetRiskAssessmentResultsByControlTypeDocument = parse(`query getRiskAssessmentResultsByControlType {
  controlled: risk_assessment_result(
    where: {
      ControlType: { _eq: Controlled }
      RatingType: { _in: ["assessment", "rating"] }
    }
    order_by: [{ TestDate: desc_nulls_last }, { CreatedAtTimestamp: desc }]
  ) {
    ...RiskAssessmentResultParts
    parents {
      ParentId
      risk {
        Id
        Title
      }
      assessment {
        Id
        Title
      }
    }
  }
  uncontrolled: risk_assessment_result(
    where: {
      ControlType: { _eq: Uncontrolled }
      RatingType: { _in: ["assessment", "rating"] }
    }
    order_by: [{ TestDate: desc_nulls_last }, { CreatedAtTimestamp: desc }]
  ) {
    ...RiskAssessmentResultParts
    parents {
      ParentId
      risk {
        Id
        Title
      }
      assessment {
        Id
        Title
      }
    }
  }
}

fragment RiskAssessmentResultParts on risk_assessment_result {
  Id
  Likelihood
  Impact
  Rating
  ControlType
  CustomAttributeData
  Rationale
  TestDate
}`) as any;
export type GetRiskAssessmentResultsByControlTypeQuery = any;
export type GetRiskAssessmentResultsByControlTypeQueryVariables = any;
export type GetGetRiskAssessmentResultsByControlTypeQuery = any;
export type getRiskAssessmentResultsByControlTypeQuery = any;
export type getRiskAssessmentResultsByControlTypeQueryVariables = any;

export const GetRiskAssessmentResultsByRiskIdDocument = parse(`query getRiskAssessmentResultsByRiskId(\$RiskId: uuid!) {
  risk_assessment_result(
    where: {
      parents: { ParentId: { _eq: \$RiskId } }
      RatingType: { _in: ["assessment", "rating"] }
    }
    order_by: [{ CreatedAtTimestamp: desc }]
  ) {
    ...RiskAssessmentResultParts
    parents(where: { ParentType: { _eq: assessment } }) {
      assessment {
        ...AssessmentParts
        completedByUser {
          FriendlyName
        }
      }
    }
  }
}

fragment RiskAssessmentResultParts on risk_assessment_result {
  Id
  Likelihood
  Impact
  Rating
  ControlType
  CustomAttributeData
  Rationale
  TestDate
}

fragment AssessmentParts on assessment {
  ActualCompletionDate
  CompletedByUser
  CreatedAtTimestamp
  CreatedByUser
  CustomAttributeData
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  NextTestDate
  OriginatingItemId
  SequentialId
  StartDate
  Summary
  TargetCompletionDate
  Title
  Status
  Outcome
}`) as any;
export type GetRiskAssessmentResultsByRiskIdQuery = any;
export type GetRiskAssessmentResultsByRiskIdQueryVariables = any;
export type GetGetRiskAssessmentResultsByRiskIdQuery = any;
export type getRiskAssessmentResultsByRiskIdQuery = any;
export type getRiskAssessmentResultsByRiskIdQueryVariables = any;

export const GetRiskAssessmentResultsByRiskIdAndControlTypeDocument = parse(`query getRiskAssessmentResultsByRiskIdAndControlType(
  \$RiskId: uuid!
  \$ControlType: risk_assessment_result_control_type_enum!
) {
  risk_assessment_result(
    where: {
      parents: { ParentId: { _eq: \$RiskId } }
      ControlType: { _eq: \$ControlType }
      RatingType: { _in: ["assessment", "rating"] }
    }
    order_by: [{ CreatedAtTimestamp: desc }]
  ) {
    Id
    Rating
    Likelihood
    Impact
    ControlType
    CustomAttributeData
    parents(where: { ParentType: { _eq: assessment } }) {
      assessment {
        ...AssessmentParts
        completedByUser {
          FriendlyName
        }
      }
    }
  }
}

fragment AssessmentParts on assessment {
  ActualCompletionDate
  CompletedByUser
  CreatedAtTimestamp
  CreatedByUser
  CustomAttributeData
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  NextTestDate
  OriginatingItemId
  SequentialId
  StartDate
  Summary
  TargetCompletionDate
  Title
  Status
  Outcome
}`) as any;
export type GetRiskAssessmentResultsByRiskIdAndControlTypeQuery = any;
export type GetRiskAssessmentResultsByRiskIdAndControlTypeQueryVariables = any;
export type GetGetRiskAssessmentResultsByRiskIdAndControlTypeQuery = any;
export type getRiskAssessmentResultsByRiskIdAndControlTypeQuery = any;
export type getRiskAssessmentResultsByRiskIdAndControlTypeQueryVariables = any;

export const GetRiskScoresByRiskIdDocument = parse(`query getRiskScoresByRiskId(\$RiskId: uuid!) {
  risk(where: { Id: { _eq: \$RiskId } }) {
    Tier
  }

  inherent: risk_assessment_result(
    where: {
      parents: { ParentId: { _eq: \$RiskId } }
      ControlType: { _eq: Uncontrolled }
      RatingType: { _in: ["assessment", "rating"] }
    }
    order_by: [{ TestDate: desc_nulls_last }, { CreatedAtTimestamp: desc }]
    limit: 1
  ) {
    ...RiskAssessmentResultParts
    ancestorContributors {
      ...AncestorContributorParts
    }
    parents(where: { ParentType: { _eq: assessment } }) {
      assessment {
        ...AssessmentParts
      }
    }
  }
  residual: risk_assessment_result(
    where: {
      parents: { ParentId: { _eq: \$RiskId } }
      ControlType: { _eq: Controlled }
      RatingType: { _in: ["assessment", "rating"] }
    }
    order_by: [{ TestDate: desc_nulls_last }, { CreatedAtTimestamp: desc }]
    limit: 1
  ) {
    ...RiskAssessmentResultParts
    ancestorContributors {
      ...AncestorContributorParts
    }
    parents(where: { ParentType: { _eq: assessment } }) {
      assessment {
        ...AssessmentParts
      }
    }
  }
}

fragment RiskAssessmentResultParts on risk_assessment_result {
  Id
  Likelihood
  Impact
  Rating
  ControlType
  CustomAttributeData
  Rationale
  TestDate
}

fragment AncestorContributorParts on ancestor_contributor {
  ContributorType
  UserId
  Id
  AncestorId
  UserGroupId
  user {
    FriendlyName
  }
  user_group {
    Name
  }
}

fragment AssessmentParts on assessment {
  ActualCompletionDate
  CompletedByUser
  CreatedAtTimestamp
  CreatedByUser
  CustomAttributeData
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  NextTestDate
  OriginatingItemId
  SequentialId
  StartDate
  Summary
  TargetCompletionDate
  Title
  Status
  Outcome
}`) as any;
export type GetRiskScoresByRiskIdQuery = any;
export type GetRiskScoresByRiskIdQueryVariables = any;
export type GetGetRiskScoresByRiskIdQuery = any;
export type getRiskScoresByRiskIdQuery = any;
export type getRiskScoresByRiskIdQueryVariables = any;

export const InsertDocumentAssessmentResultDocument = parse(`mutation insertDocumentAssessmentResult(
  \$Rating: Int
  \$AssessmentId: uuid
  \$DocumentIds: [uuid!]!
  \$CustomAttributeData: jsonb
  \$TestDate: timestamptz
  \$Rationale: String
) {
  insertChildDocumentAssessmentResult(
    Rating: \$Rating
    AssessmentId: \$AssessmentId
    DocumentIds: \$DocumentIds
    CustomAttributeData: \$CustomAttributeData
    TestDate: \$TestDate
    Rationale: \$Rationale
  ) {
    Ids
  }
}`) as any;
export type InsertDocumentAssessmentResultMutation = any;
export type InsertDocumentAssessmentResultMutationVariables = any;
export type insertDocumentAssessmentResultMutation = any;
export type insertDocumentAssessmentResultMutationVariables = any;

export const InsertChildImpactRatingDocument = parse(`mutation insertChildImpactRating(
  \$Ratings: [InsertImpactRatingPairInput!]!
  \$TestDate: timestamptz!
  \$AssessmentId: uuid
  \$RatedItemId: uuid!
  \$CustomAttributeData: jsonb
  \$CompletedBy: String!
  \$Likelihood: Int
) {
  insertChildImpactRating(
    AssessmentId: \$AssessmentId
    Ratings: \$Ratings
    TestDate: \$TestDate
    RatedItemId: \$RatedItemId
    CustomAttributeData: \$CustomAttributeData
    CompletedBy: \$CompletedBy
    Likelihood: \$Likelihood
  ) {
    Ids
  }
}`) as any;
export type InsertChildImpactRatingMutation = any;
export type InsertChildImpactRatingMutationVariables = any;
export type insertChildImpactRatingMutation = any;
export type insertChildImpactRatingMutationVariables = any;

export const InsertObligationAssessmentResultDocument = parse(`mutation insertObligationAssessmentResult(
  \$Rating: Int
  \$AssessmentId: uuid
  \$ObligationIds: [uuid!]!
  \$CustomAttributeData: jsonb
  \$TestDate: timestamptz
  \$Rationale: String
) {
  insertChildObligationAssessmentResult(
    Rating: \$Rating
    AssessmentId: \$AssessmentId
    ObligationIds: \$ObligationIds
    CustomAttributeData: \$CustomAttributeData
    TestDate: \$TestDate
    Rationale: \$Rationale
  ) {
    Ids
  }
}`) as any;
export type InsertObligationAssessmentResultMutation = any;
export type InsertObligationAssessmentResultMutationVariables = any;
export type insertObligationAssessmentResultMutation = any;
export type insertObligationAssessmentResultMutationVariables = any;

export const InsertRiskAssessmentResultsDocument = parse(`mutation insertRiskAssessmentResults(
  \$Rating: Int
  \$Likelihood: Int
  \$Impact: Int
  \$ControlType: risk_assessment_result_control_type_enum
  \$AssessmentId: uuid
  \$RiskIds: [uuid!]!
  \$CustomAttributeData: jsonb
  \$TestDate: timestamptz
  \$Rationale: String
) {
  insertChildRiskAssessmentResult(
    Rating: \$Rating
    AssessmentId: \$AssessmentId
    RiskIds: \$RiskIds
    Impact: \$Impact
    Likelihood: \$Likelihood
    ControlType: \$ControlType
    CustomAttributeData: \$CustomAttributeData
    TestDate: \$TestDate
    Rationale: \$Rationale
  ) {
    Ids
  }
}`) as any;
export type InsertRiskAssessmentResultsMutation = any;
export type InsertRiskAssessmentResultsMutationVariables = any;
export type insertRiskAssessmentResultsMutation = any;
export type insertRiskAssessmentResultsMutationVariables = any;

export const UpdateDocumentAssessmentResultDocument = parse(`mutation updateDocumentAssessmentResult(
  \$Id: uuid!
  \$Rating: Int
  \$Rationale: String
  \$TestDate: timestamptz
  \$CustomAttributeData: jsonb
) {
  update_document_assessment_result(
    where: { Id: { _eq: \$Id } }
    _set: {
      CustomAttributeData: \$CustomAttributeData
      Rating: \$Rating
      Rationale: \$Rationale
      TestDate: \$TestDate
    }
  ) {
    affected_rows
  }
}`) as any;
export type UpdateDocumentAssessmentResultMutation = any;
export type UpdateDocumentAssessmentResultMutationVariables = any;
export type updateDocumentAssessmentResultMutation = any;
export type updateDocumentAssessmentResultMutationVariables = any;

export const UpdateObligationAssessmentResultDocument = parse(`mutation updateObligationAssessmentResult(
  \$Id: uuid!
  \$Rating: Int
  \$Rationale: String
  \$TestDate: timestamptz
  \$CustomAttributeData: jsonb
) {
  update_obligation_assessment_result(
    where: { Id: { _eq: \$Id } }
    _set: {
      CustomAttributeData: \$CustomAttributeData
      Rating: \$Rating
      Rationale: \$Rationale
      TestDate: \$TestDate
    }
  ) {
    affected_rows
  }
}`) as any;
export type UpdateObligationAssessmentResultMutation = any;
export type UpdateObligationAssessmentResultMutationVariables = any;
export type updateObligationAssessmentResultMutation = any;
export type updateObligationAssessmentResultMutationVariables = any;

export const UpdateRiskAssessmentResultDocument = parse(`mutation updateRiskAssessmentResult(
  \$Id: uuid!
  \$Impact: Int
  \$Likelihood: Int
  \$Rating: Int
  \$Rationale: String
  \$TestDate: timestamptz
  \$CustomAttributeData: jsonb
  \$AssessmentId: uuid
) {
  updateChildRiskAssessmentResult(
    Id: \$Id
    CustomAttributeData: \$CustomAttributeData
    Impact: \$Impact
    Likelihood: \$Likelihood
    Rating: \$Rating
    Rationale: \$Rationale
    TestDate: \$TestDate
    AssessmentId: \$AssessmentId
  ) {
    affected_rows
  }
}`) as any;
export type UpdateRiskAssessmentResultMutation = any;
export type UpdateRiskAssessmentResultMutationVariables = any;
export type updateRiskAssessmentResultMutation = any;
export type updateRiskAssessmentResultMutationVariables = any;

export const AssessmentPartsDocument = parse(`fragment AssessmentParts on assessment {
  ActualCompletionDate
  CompletedByUser
  CreatedAtTimestamp
  CreatedByUser
  CustomAttributeData
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  NextTestDate
  OriginatingItemId
  SequentialId
  StartDate
  Summary
  TargetCompletionDate
  Title
  Status
  Outcome
}`) as any;
export type AssessmentPartsFragment = any;

export const DeleteAssessmentsDocument = parse(`mutation deleteAssessments(\$Ids: [uuid!]!) {
  # delete_document_assessment_result(where: { AssessmentId: { _in: \$Ids } }) {
  #   affected_rows
  # }

  # delete_obligation_assessment_result(where: { AssessmentId: { _in: \$Ids } }) {
  #   affected_rows
  # }

  # delete_risk_assessment_result(where: { AssessmentId: { _in: \$Ids } }) {
  #   affected_rows
  # }

  delete_assessment(where: { Id: { _in: \$Ids } }) {
    affected_rows
  }
}`) as any;
export type DeleteAssessmentsMutation = any;
export type DeleteAssessmentsMutationVariables = any;
export type deleteAssessmentsMutation = any;
export type deleteAssessmentsMutationVariables = any;

export const GetAssessmentAuditByIdDocument = parse(`query getAssessmentAuditById(\$Id: uuid!) {
  assessment_audit(where: { Id: { _eq: \$Id } }, order_by: {ModifiedAtTimestamp: desc}) {
    ActualCompletionDate
    CompletedByUser
    CreatedAtTimestamp
    CreatedByUser
    CustomAttributeData
    Id
    ModifiedAtTimestamp
    ModifiedByUser
    NextTestDate
    OriginatingItemId
    SequentialId
    StartDate
    Summary
    TargetCompletionDate
    Title
    Status
    Outcome
  }
}`) as any;
export type GetAssessmentAuditByIdQuery = any;
export type GetAssessmentAuditByIdQueryVariables = any;
export type GetGetAssessmentAuditByIdQuery = any;
export type getAssessmentAuditByIdQuery = any;
export type getAssessmentAuditByIdQueryVariables = any;

export const GetAssessmentByIdDocument = parse(`query getAssessmentById(\$Id: uuid!) {
  assessment(where: { Id: { _eq: \$Id } }) {
    ...AssessmentParts
    owners {
      ...OwnerParts
    }
    ownerGroups {
      ...OwnerGroupParts
    }
    contributors {
      ...ContributorParts
    }
    contributorGroups {
      ...ContributorGroupParts
    }
    contributors {
      ...ContributorParts
    }
    contributorGroups {
      UserGroupId
    }
    ancestorContributors {
      ...AncestorContributorParts
    }
    tags {
      ...TagParts
    }
    departments {
      ...DepartmentParts
    }
    completedByUser {
      FriendlyName
    }
  }
}

fragment AssessmentParts on assessment {
  ActualCompletionDate
  CompletedByUser
  CreatedAtTimestamp
  CreatedByUser
  CustomAttributeData
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  NextTestDate
  OriginatingItemId
  SequentialId
  StartDate
  Summary
  TargetCompletionDate
  Title
  Status
  Outcome
}

fragment OwnerParts on owner {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment OwnerGroupParts on owner_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment ContributorParts on contributor {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment ContributorGroupParts on contributor_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment AncestorContributorParts on ancestor_contributor {
  ContributorType
  UserId
  Id
  AncestorId
  UserGroupId
  user {
    FriendlyName
  }
  user_group {
    Name
  }
}

fragment TagParts on tag {
  type {
    Description
    Name
  }
  ParentId
  TagTypeId
}

fragment DepartmentParts on department {
  type {
    Description
    Name
  }
  ParentId
  DepartmentTypeId
}`) as any;
export type GetAssessmentByIdQuery = any;
export type GetAssessmentByIdQueryVariables = any;
export type GetGetAssessmentByIdQuery = any;
export type getAssessmentByIdQuery = any;
export type getAssessmentByIdQueryVariables = any;

export const GetAssessmentsDocument = parse(`query getAssessments(\$where: assessment_bool_exp! = {}) {
  assessment(where: \$where) {
    ...AssessmentParts
    owners {
      ...OwnerParts
    }
    ownerGroups {
      ...OwnerGroupParts
    }
    contributors {
      ...ContributorParts
    }
    contributorGroups {
      ...ContributorGroupParts
    }
    tags {
      ...TagParts
    }
    departments {
      ...DepartmentParts
    }
    completedByUser {
      FriendlyName
    }
    assessedItems: assessmentResults {
      riskAssessmentResult {
        Id
        parents(where: { ParentType: { _eq: risk } }) {
          risk {
            Id
            Title
          }
        }
      }
      obligationAssessmentResult {
        Id
        parents(where: { ParentType: { _eq: obligation } }) {
          obligation {
            Id
            Title
          }
        }
      }
      documentAssessmentResult {
        Id
        parents(where: { ParentType: { _eq: document } }) {
          document {
            Id
            Title
          }
        }
      }
    }
  }
}

fragment AssessmentParts on assessment {
  ActualCompletionDate
  CompletedByUser
  CreatedAtTimestamp
  CreatedByUser
  CustomAttributeData
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  NextTestDate
  OriginatingItemId
  SequentialId
  StartDate
  Summary
  TargetCompletionDate
  Title
  Status
  Outcome
}

fragment OwnerParts on owner {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment OwnerGroupParts on owner_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment ContributorParts on contributor {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment ContributorGroupParts on contributor_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment TagParts on tag {
  type {
    Description
    Name
  }
  ParentId
  TagTypeId
}

fragment DepartmentParts on department {
  type {
    Description
    Name
  }
  ParentId
  DepartmentTypeId
}`) as any;
export type GetAssessmentsQuery = any;
export type GetAssessmentsQueryVariables = any;
export type GetGetAssessmentsQuery = any;
export type getAssessmentsQuery = any;
export type getAssessmentsQueryVariables = any;

export const InsertAssessmentDocument = parse(`mutation insertAssessment(\$object: InsertAssessmentInput!) {
  insertAssessmentApi(object: \$object) {
    Id
  }
}`) as any;
export type InsertAssessmentMutation = any;
export type InsertAssessmentMutationVariables = any;
export type insertAssessmentMutation = any;
export type insertAssessmentMutationVariables = any;

export const UpdateAssessmentDocument = parse(`mutation updateAssessment(\$object: UpdateAssessmentInput!) {
  updateAssessmentApi(object: \$object) {
    affected_rows
  }
}`) as any;
export type UpdateAssessmentMutation = any;
export type UpdateAssessmentMutationVariables = any;
export type updateAssessmentMutation = any;
export type updateAssessmentMutationVariables = any;

export const AttestationConfigPartsDocument = parse(`fragment AttestationConfigParts on attestation_config {
  RequireGlobalAttestation
  AttestationTimeLimit
  PromptText
  groups {
    ...AttestationGroupParts
  }
}

fragment AttestationGroupParts on attestation_group {
  GroupId
  group {
    Name
    users {
      UserId
    }
  }
}`) as any;
export type AttestationConfigPartsFragment = any;

export const AttestationGroupPartsDocument = parse(`fragment AttestationGroupParts on attestation_group {
  GroupId
  group {
    Name
    users {
      UserId
    }
  }
}`) as any;
export type AttestationGroupPartsFragment = any;

export const GetAttestationConfigDocument = parse(`query GetAttestationConfig(\$id: uuid!) {
  attestation_config(where: { ParentId: { _eq: \$id } }, limit: 1) {
    ...AttestationConfigParts
  }

  document_file(where: { ParentDocumentId: { _eq: \$id } }, limit: 1) {
    Id
    Version
    Status
    PublishedDate
  }
}

fragment AttestationConfigParts on attestation_config {
  RequireGlobalAttestation
  AttestationTimeLimit
  PromptText
  groups {
    ...AttestationGroupParts
  }
}

fragment AttestationGroupParts on attestation_group {
  GroupId
  group {
    Name
    users {
      UserId
    }
  }
}`) as any;
export type GetAttestationConfigQuery = any;
export type GetAttestationConfigQueryVariables = any;
export type GetGetAttestationConfigQuery = any;

export const GetGlobalUsersAndGroupsDocument = parse(`query getGlobalUsersAndGroups {
  globalUsers: user_aggregate(where: { IsCustomerSupport: { _eq: false } }) {
    aggregate {
      count
    }
    nodes {
      Id
    }
  }
  userGroups: user_group {
    Id
    Name
    users {
      UserId
    }
  }
}`) as any;
export type GetGlobalUsersAndGroupsQuery = any;
export type GetGlobalUsersAndGroupsQueryVariables = any;
export type GetGetGlobalUsersAndGroupsQuery = any;
export type getGlobalUsersAndGroupsQuery = any;
export type getGlobalUsersAndGroupsQueryVariables = any;

export const InsertAttestationConfigDocument = parse(`mutation insertAttestationConfig(\$object: InsertAttestationConfigInput) {
  insertChildAttestationConfig(object: \$object) {
    Id
  }
}`) as any;
export type InsertAttestationConfigMutation = any;
export type InsertAttestationConfigMutationVariables = any;
export type insertAttestationConfigMutation = any;
export type insertAttestationConfigMutationVariables = any;

export const AttestationCyclePartsDocument = parse(`fragment AttestationCycleParts on attestation_cycle {
  AllowCarryForward
  CreatedAtTimestamp
  CreatedByUser
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  ParentId
  Status
  records {
    AttestationStatus
    attestationRecordStatus {
      Status
    }
    ExpiresAt
    UserId
  }
  parent {
    Version
    Id
    parent {
      Title
      Id
    }
  }
}`) as any;
export type AttestationCyclePartsFragment = any;

export const GetAttestationCycleRegisterDocument = parse(`query getAttestationCycleRegister {
  attestation_cycle {
    ...AttestationCycleParts
  }
}

fragment AttestationCycleParts on attestation_cycle {
  AllowCarryForward
  CreatedAtTimestamp
  CreatedByUser
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  ParentId
  Status
  records {
    AttestationStatus
    attestationRecordStatus {
      Status
    }
    ExpiresAt
    UserId
  }
  parent {
    Version
    Id
    parent {
      Title
      Id
    }
  }
}`) as any;
export type GetAttestationCycleRegisterQuery = any;
export type GetAttestationCycleRegisterQueryVariables = any;
export type GetGetAttestationCycleRegisterQuery = any;
export type getAttestationCycleRegisterQuery = any;
export type getAttestationCycleRegisterQueryVariables = any;

export const GetAttestationCyclesDocument = parse(`query getAttestationCycles(
  \$where: attestation_cycle_bool_exp!
  \$orderBy: [attestation_cycle_order_by!]
) {
  attestation_cycle(where: \$where, order_by: \$orderBy) {
    ...AttestationCycleParts
  }
}

fragment AttestationCycleParts on attestation_cycle {
  AllowCarryForward
  CreatedAtTimestamp
  CreatedByUser
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  ParentId
  Status
  records {
    AttestationStatus
    attestationRecordStatus {
      Status
    }
    ExpiresAt
    UserId
  }
  parent {
    Version
    Id
    parent {
      Title
      Id
    }
  }
}`) as any;
export type GetAttestationCyclesQuery = any;
export type GetAttestationCyclesQueryVariables = any;
export type GetGetAttestationCyclesQuery = any;
export type getAttestationCyclesQuery = any;
export type getAttestationCyclesQueryVariables = any;

export const GetActiveAttestationCycleDocument = parse(`query getActiveAttestationCycle(\$parentDocumentId: uuid!) {
  attestation_cycle(
    where: {
      Status: { _eq: "active" }
      parent: { ParentDocumentId: { _eq: \$parentDocumentId } }
    }
  ) {
    Id
    CreatedAtTimestamp
    CreatedByUser
    ModifiedAtTimestamp
    ModifiedByUser
    Status
    AllowCarryForward
    parent {
      Id
      ParentDocumentId
    }
  }
}`) as any;
export type GetActiveAttestationCycleQuery = any;
export type GetActiveAttestationCycleQueryVariables = any;
export type GetGetActiveAttestationCycleQuery = any;
export type getActiveAttestationCycleQuery = any;
export type getActiveAttestationCycleQueryVariables = any;

export const InsertAttestationCycleDocument = parse(`mutation insertAttestationCycle(
  \$AllowCarryForward: Boolean!
  \$DocumentId: uuid!
  \$attestationConfig: InsertAttestationConfigInput
) {
  insertChildAttestationCycle(
    object: { AllowCarryForward: \$AllowCarryForward, DocumentId: \$DocumentId }
  ) {
    Id
  }

  insertChildAttestationConfig(object: \$attestationConfig) {
    Id
  }
}`) as any;
export type InsertAttestationCycleMutation = any;
export type InsertAttestationCycleMutationVariables = any;
export type insertAttestationCycleMutation = any;
export type insertAttestationCycleMutationVariables = any;

export const AttestDocument = parse(`mutation attest(\$Id: uuid!) {
  attestRecord(Id: \$Id) {
    affected_rows
  }
}`) as any;
export type AttestMutation = any;
export type AttestMutationVariables = any;
export type attestMutation = any;
export type attestMutationVariables = any;

export const GetAttestationStatusDocument = parse(`query getAttestationStatus(\$ParentId: uuid!, \$UserId: String!) {
  attestation_record(
    where: { NodeId: { _eq: \$ParentId }, UserId: { _eq: \$UserId } }
    limit: 1
    order_by: { CreatedAtTimestamp: desc }
  ) {
    Id
    AttestationStatus
    attestationRecordStatus {
      Status
    }
    config {
      PromptText
    }
  }
}`) as any;
export type GetAttestationStatusQuery = any;
export type GetAttestationStatusQueryVariables = any;
export type GetGetAttestationStatusQuery = any;
export type getAttestationStatusQuery = any;
export type getAttestationStatusQueryVariables = any;

export const GetPolicyAttestationRecordsDocument = parse(`query getPolicyAttestationRecords(\$where: attestation_record_bool_exp! = {}) {
  attestation_record(
    where: \$where
    order_by: { Active: desc, NodeId: desc, ExpiresAt: asc }
  ) {
    Id
    ExpiresAt
    Active
    CreatedAtTimestamp
    ModifiedAtTimestamp
    AttestationStatus
    AttestedAt
    UserId
    NodeId
    CycleId
    carriedForwardFromRecord {
      node {
        documentFile {
          Id
          Version
        }
      }
    }
    attestationRecordStatus {
      Status
    }
    user {
      Id
      FirstName
      LastName
      FriendlyName
      Email
      Department
    }
    node {
      documentFile {
        Id
        Version
        parent {
          Id
          Title
          owners {
            ...OwnerParts
          }
          ownerGroups {
            ...OwnerGroupParts
          }
        }
      }
    }
  }
}

fragment OwnerParts on owner {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment OwnerGroupParts on owner_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}`) as any;
export type GetPolicyAttestationRecordsQuery = any;
export type GetPolicyAttestationRecordsQueryVariables = any;
export type GetGetPolicyAttestationRecordsQuery = any;
export type getPolicyAttestationRecordsQuery = any;
export type getPolicyAttestationRecordsQueryVariables = any;

export const GetPolicyAttestationRecordsForDocumentDocument = parse(`query getPolicyAttestationRecordsForDocument(\$documentFileId: uuid) {
  attestation_record(
    where: {
      node: { ObjectType: { _eq: document_file } }
      NodeId: { _eq: \$documentFileId }
    }
    order_by: { Active: desc, NodeId: desc, ExpiresAt: asc }
  ) {
    ExpiresAt
    Active
    CreatedAtTimestamp
    AttestationStatus
    AttestedAt
    UserId
    NodeId
    CycleId
    attestationRecordStatus {
      Status
    }
    carriedForwardFromRecord {
      node {
        Id
        documentFile {
          Id
          Version
        }
      }
    }
    user {
      Id
      FriendlyName
      Email
    }
    node {
      documentFile {
        Id
        Version
        parent {
          Id
          Title
        }
      }
    }
  }
}`) as any;
export type GetPolicyAttestationRecordsForDocumentQuery = any;
export type GetPolicyAttestationRecordsForDocumentQueryVariables = any;
export type GetGetPolicyAttestationRecordsForDocumentQuery = any;
export type getPolicyAttestationRecordsForDocumentQuery = any;
export type getPolicyAttestationRecordsForDocumentQueryVariables = any;

export const AttestationNotRequiredDocument = parse(`mutation attestationNotRequired(\$Ids: [uuid!]!) {
  attestationNotRequired(Ids: \$Ids) {
    affected_rows
  }
}`) as any;
export type AttestationNotRequiredMutation = any;
export type AttestationNotRequiredMutationVariables = any;
export type attestationNotRequiredMutation = any;
export type attestationNotRequiredMutationVariables = any;

export const GetAuditLogsDocument = parse(`query getAuditLogs(
  \$limit: Int
  \$offset: Int
  \$orderBy: [audit_log_view_order_by!]
  \$where: audit_log_view_bool_exp
) {
  audit_log_view(
    limit: \$limit
    offset: \$offset
    order_by: \$orderBy
    where: \$where
  ) {
    Action
    ModifiedByUser
    ModifiedAtTimestamp
    PerformedByUser {
      FriendlyName
    }
    ObjectType
    Item
    Id
    OrgKey
  }
}`) as any;
export type GetAuditLogsQuery = any;
export type GetAuditLogsQueryVariables = any;
export type GetGetAuditLogsQuery = any;
export type getAuditLogsQuery = any;
export type getAuditLogsQueryVariables = any;

export const GetBusinessAreasDocument = parse(`query getBusinessAreas {
  business_area(order_by: { Title: asc }) {
    Id
    Title
    SequentialId
    CreatedAtTimestamp
    ModifiedAtTimestamp
    createdByUser {
      FriendlyName
    }
    modifiedByUser {
      FriendlyName
    }
  }
}`) as any;
export type GetBusinessAreasQuery = any;
export type GetBusinessAreasQueryVariables = any;
export type GetGetBusinessAreasQuery = any;
export type getBusinessAreasQuery = any;
export type getBusinessAreasQueryVariables = any;

export const CausePartsDocument = parse(`fragment CauseParts on cause {
  ModifiedByUser
  CreatedByUser
  Title
  ModifiedAtTimestamp
  CreatedAtTimestamp
  Significance
  ParentIssueId
  Id
  Description
  CustomAttributeData
}`) as any;
export type CausePartsFragment = any;

export const DeleteCausesDocument = parse(`mutation deleteCauses(\$Ids: [uuid!]) {
  delete_cause(where: { Id: { _in: \$Ids } }) {
    affected_rows
  }
}`) as any;
export type DeleteCausesMutation = any;
export type DeleteCausesMutationVariables = any;
export type deleteCausesMutation = any;
export type deleteCausesMutationVariables = any;

export const GetCauseAuditByIdDocument = parse(`query getCauseAuditById(\$Id: uuid!) {
  cause_audit(where: { Id: { _eq: \$Id } }, order_by: {ModifiedAtTimestamp: desc}) {
    ModifiedByUser
    CreatedByUser
    Title
    ModifiedAtTimestamp
    CreatedAtTimestamp
    Significance
    ParentIssueId
    Id
    Description
    CustomAttributeData
  }
}`) as any;
export type GetCauseAuditByIdQuery = any;
export type GetCauseAuditByIdQueryVariables = any;
export type GetGetCauseAuditByIdQuery = any;
export type getCauseAuditByIdQuery = any;
export type getCauseAuditByIdQueryVariables = any;

export const GetCauseByIdDocument = parse(`query getCauseById(\$_eq: uuid!) {
  cause(where: { Id: { _eq: \$_eq } }) {
    ModifiedByUser
    CreatedByUser
    Title
    ModifiedAtTimestamp
    CreatedAtTimestamp
    Significance
    ParentIssueId
    Id
    Description
    CustomAttributeData
  }
}`) as any;
export type GetCauseByIdQuery = any;
export type GetCauseByIdQueryVariables = any;
export type GetGetCauseByIdQuery = any;
export type getCauseByIdQuery = any;
export type getCauseByIdQueryVariables = any;

export const GetCausesDocument = parse(`query getCauses(\$where: cause_bool_exp! = {}) {
  cause(where: \$where) {
    ...CauseParts
    createdByUser {
      FriendlyName
    }
    modifiedByUser {
      FriendlyName
    }
    issue {
      Type
      SequentialId
      CreatedAtTimestamp
      Title
      owners {
        ...OwnerParts
      }
      ownerGroups {
        ...OwnerGroupParts
      }
      contributors {
        ...ContributorParts
      }
      contributorGroups {
        ...ContributorGroupParts
      }
      assessment {
        IssueType
        ActualCloseDate
        Status
        Severity
        departments {
          ...DepartmentParts
        }
      }
    }
  }
}

fragment CauseParts on cause {
  ModifiedByUser
  CreatedByUser
  Title
  ModifiedAtTimestamp
  CreatedAtTimestamp
  Significance
  ParentIssueId
  Id
  Description
  CustomAttributeData
}

fragment OwnerParts on owner {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment OwnerGroupParts on owner_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment ContributorParts on contributor {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment ContributorGroupParts on contributor_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment DepartmentParts on department {
  type {
    Description
    Name
  }
  ParentId
  DepartmentTypeId
}`) as any;
export type GetCausesQuery = any;
export type GetCausesQueryVariables = any;
export type GetGetCausesQuery = any;
export type getCausesQuery = any;
export type getCausesQueryVariables = any;

export const GetCausesByParentIssueIdDocument = parse(`query getCausesByParentIssueId(\$_eq: uuid!) {
  cause(where: { ParentIssueId: { _eq: \$_eq } }) {
    ModifiedByUser
    CreatedByUser
    Title
    ModifiedAtTimestamp
    CreatedAtTimestamp
    Significance
    ParentIssueId
    Id
    Description
    CustomAttributeData
  }
}`) as any;
export type GetCausesByParentIssueIdQuery = any;
export type GetCausesByParentIssueIdQueryVariables = any;
export type GetGetCausesByParentIssueIdQuery = any;
export type getCausesByParentIssueIdQuery = any;
export type getCausesByParentIssueIdQueryVariables = any;

export const InsertCauseDocument = parse(`mutation insertCause(
  \$Title: String
  \$Description: String
  \$Significance: Int
  \$ParentIssueId: uuid
  \$CustomAttributeData: jsonb
) {
  insert_cause(
    objects: {
      Description: \$Description
      ParentIssueId: \$ParentIssueId
      Significance: \$Significance
      Title: \$Title
      CustomAttributeData: \$CustomAttributeData
    }
  ) {
    returning {
      Id
    }
  }
}`) as any;
export type InsertCauseMutation = any;
export type InsertCauseMutationVariables = any;
export type insertCauseMutation = any;
export type insertCauseMutationVariables = any;

export const UpdateCauseDocument = parse(`mutation updateCause(
  \$Id: uuid
  \$Title: String
  \$Description: String
  \$Significance: Int
  \$ParentIssueId: uuid
  \$OriginalTimestamp: timestamptz
  \$CustomAttributeData: jsonb
) {
  update_cause(
    _set: {
      Description: \$Description
      ParentIssueId: \$ParentIssueId
      Significance: \$Significance
      Title: \$Title
      CustomAttributeData: \$CustomAttributeData
    }
    where: {
      ModifiedAtTimestamp: { _eq: \$OriginalTimestamp }
      Id: { _eq: \$Id }
    }
  ) {
    affected_rows
  }
}`) as any;
export type UpdateCauseMutation = any;
export type UpdateCauseMutationVariables = any;
export type updateCauseMutation = any;
export type updateCauseMutationVariables = any;

export const GetChangeRequestByIdDocument = parse(`subscription getChangeRequestById(\$Id: uuid!) {
  change_request_by_pk(Id: \$Id) {
    ...ChangeRequestParts
  }
}

fragment ChangeRequestParts on change_request {
  createdBy {
    FriendlyName
    Id
    Email
  }
  Id
  SequentialId
  ParentId
  Type
  parent {
    Id
    SequentialId
    ObjectType
    owners: ancestorContributors(where: { ContributorType: { _eq: "owner" } }) {
      UserId
      user {
        FriendlyName
      }
      user_group {
        users {
          UserId
        }
      }
      ContributorType
    }

    risk {
      Title
    }
    documentFile {
      Version
      parent {
        Id
        SequentialId
        Title
        owners: ancestorContributors(
          where: { ContributorType: { _eq: "owner" } }
        ) {
          UserId
          user {
            FriendlyName
          }
          user_group {
            users {
              UserId
            }
          }
          ContributorType
        }
      }
    }
    acceptance {
      Title
      parents {
        risk {
          Id
          owners: ancestorContributors(
            where: { ContributorType: { _eq: "owner" } }
          ) {
            UserId
            user {
              FriendlyName
            }
            user_group {
              users {
                UserId
              }
            }
            ContributorType
          }
        }
      }
    }
    control {
      Title
    }
    action {
      Title
    }
    issue_assessment {
      parent {
        Id
        SequentialId
        Title
        owners: ancestorContributors(
          where: { ContributorType: { _eq: "owner" } }
        ) {
          UserId
          user {
            FriendlyName
          }
          user_group {
            users {
              UserId
            }
          }
          ContributorType
        }
      }
    }
  }
  CreatedAtTimestamp
  ModifiedAtTimestamp
  RequestedChanges
  requestedFileChanges {
    ...RelationFileParts
  }
  ChangeRequestStatus
  contributors {
    user {
      Id
      FriendlyName
      Email
    }
  }
  Comment
  RequesterComment
  OverriddenByUser
  OverriddenAtTimestamp
  responses {
    Id
    Approved
    ModifiedAtTimestamp
    CreatedAtTimestamp
    ApprovedByUser
    ApprovedAtTimestamp
    Comment
    approver {
      Id
      OwnerApprover
      level {
        Id
        ApprovalRuleType
        SequenceOrder
        approval {
          Id
          ParentId
          Workflow
          InFlightEditRule
        }
      }
      user {
        FriendlyName
        Email
        Id
      }
      group {
        Id
        Name
        users {
          UserId
          user {
            FriendlyName
          }
        }
      }
    }
  }
}

fragment RelationFileParts on relation_file {
  ParentId
  ChangeRequestFileOperation
  file {
    ...FileParts
  }
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}`) as any;
export type GetChangeRequestByIdSubscription = any;
export type GetChangeRequestByIdSubscriptionVariables = any;

export const GetChangeRequestByParentIdDocument = parse(`subscription getChangeRequestByParentId(\$Id: uuid!) {
  change_request(where: { ParentId: { _eq: \$Id } }) {
    ...ChangeRequestParts
  }
}

fragment ChangeRequestParts on change_request {
  createdBy {
    FriendlyName
    Id
    Email
  }
  Id
  SequentialId
  ParentId
  Type
  parent {
    Id
    SequentialId
    ObjectType
    owners: ancestorContributors(where: { ContributorType: { _eq: "owner" } }) {
      UserId
      user {
        FriendlyName
      }
      user_group {
        users {
          UserId
        }
      }
      ContributorType
    }

    risk {
      Title
    }
    documentFile {
      Version
      parent {
        Id
        SequentialId
        Title
        owners: ancestorContributors(
          where: { ContributorType: { _eq: "owner" } }
        ) {
          UserId
          user {
            FriendlyName
          }
          user_group {
            users {
              UserId
            }
          }
          ContributorType
        }
      }
    }
    acceptance {
      Title
      parents {
        risk {
          Id
          owners: ancestorContributors(
            where: { ContributorType: { _eq: "owner" } }
          ) {
            UserId
            user {
              FriendlyName
            }
            user_group {
              users {
                UserId
              }
            }
            ContributorType
          }
        }
      }
    }
    control {
      Title
    }
    action {
      Title
    }
    issue_assessment {
      parent {
        Id
        SequentialId
        Title
        owners: ancestorContributors(
          where: { ContributorType: { _eq: "owner" } }
        ) {
          UserId
          user {
            FriendlyName
          }
          user_group {
            users {
              UserId
            }
          }
          ContributorType
        }
      }
    }
  }
  CreatedAtTimestamp
  ModifiedAtTimestamp
  RequestedChanges
  requestedFileChanges {
    ...RelationFileParts
  }
  ChangeRequestStatus
  contributors {
    user {
      Id
      FriendlyName
      Email
    }
  }
  Comment
  RequesterComment
  OverriddenByUser
  OverriddenAtTimestamp
  responses {
    Id
    Approved
    ModifiedAtTimestamp
    CreatedAtTimestamp
    ApprovedByUser
    ApprovedAtTimestamp
    Comment
    approver {
      Id
      OwnerApprover
      level {
        Id
        ApprovalRuleType
        SequenceOrder
        approval {
          Id
          ParentId
          Workflow
          InFlightEditRule
        }
      }
      user {
        FriendlyName
        Email
        Id
      }
      group {
        Id
        Name
        users {
          UserId
          user {
            FriendlyName
          }
        }
      }
    }
  }
}

fragment RelationFileParts on relation_file {
  ParentId
  ChangeRequestFileOperation
  file {
    ...FileParts
  }
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}`) as any;
export type GetChangeRequestByParentIdSubscription = any;
export type GetChangeRequestByParentIdSubscriptionVariables = any;

export const ChangeRequestPartsDocument = parse(`fragment ChangeRequestParts on change_request {
  createdBy {
    FriendlyName
    Id
    Email
  }
  Id
  SequentialId
  ParentId
  Type
  parent {
    Id
    SequentialId
    ObjectType
    owners: ancestorContributors(where: { ContributorType: { _eq: "owner" } }) {
      UserId
      user {
        FriendlyName
      }
      user_group {
        users {
          UserId
        }
      }
      ContributorType
    }

    risk {
      Title
    }
    documentFile {
      Version
      parent {
        Id
        SequentialId
        Title
        owners: ancestorContributors(
          where: { ContributorType: { _eq: "owner" } }
        ) {
          UserId
          user {
            FriendlyName
          }
          user_group {
            users {
              UserId
            }
          }
          ContributorType
        }
      }
    }
    acceptance {
      Title
      parents {
        risk {
          Id
          owners: ancestorContributors(
            where: { ContributorType: { _eq: "owner" } }
          ) {
            UserId
            user {
              FriendlyName
            }
            user_group {
              users {
                UserId
              }
            }
            ContributorType
          }
        }
      }
    }
    control {
      Title
    }
    action {
      Title
    }
    issue_assessment {
      parent {
        Id
        SequentialId
        Title
        owners: ancestorContributors(
          where: { ContributorType: { _eq: "owner" } }
        ) {
          UserId
          user {
            FriendlyName
          }
          user_group {
            users {
              UserId
            }
          }
          ContributorType
        }
      }
    }
  }
  CreatedAtTimestamp
  ModifiedAtTimestamp
  RequestedChanges
  requestedFileChanges {
    ...RelationFileParts
  }
  ChangeRequestStatus
  contributors {
    user {
      Id
      FriendlyName
      Email
    }
  }
  Comment
  RequesterComment
  OverriddenByUser
  OverriddenAtTimestamp
  responses {
    Id
    Approved
    ModifiedAtTimestamp
    CreatedAtTimestamp
    ApprovedByUser
    ApprovedAtTimestamp
    Comment
    approver {
      Id
      OwnerApprover
      level {
        Id
        ApprovalRuleType
        SequenceOrder
        approval {
          Id
          ParentId
          Workflow
          InFlightEditRule
        }
      }
      user {
        FriendlyName
        Email
        Id
      }
      group {
        Id
        Name
        users {
          UserId
          user {
            FriendlyName
          }
        }
      }
    }
  }
}

fragment RelationFileParts on relation_file {
  ParentId
  ChangeRequestFileOperation
  file {
    ...FileParts
  }
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}`) as any;
export type ChangeRequestPartsFragment = any;

export const GetApprovalLevelsDocument = parse(`query getApprovalLevels(\$Workflow: String!, \$ParentId: uuid) {
  levels: approval_level(
    where: {
      # Get all the the approval levels for the parent object,
      # and global approval levels for the parent type.
      approval: {
        _or: [
          { Workflow: { _eq: \$Workflow }, ParentId: { _is_null: true } }
          { Workflow: { _eq: \$Workflow }, ParentId: { _eq: \$ParentId } }
        ]
      }
    }
    order_by: {
      # Order by specific levels first, then global levels
      approval: { ParentId: asc }
      SequenceOrder: asc
    }
  ) {
    Id
    ApprovalRuleType
    approvers {
      Id
      UserId
      UserGroupId
      OwnerApprover

      group {
        Id
        users {
          UserId
          user {
            FriendlyName
          }
        }
      }
    }
  }
}`) as any;
export type GetApprovalLevelsQuery = any;
export type GetApprovalLevelsQueryVariables = any;
export type GetGetApprovalLevelsQuery = any;
export type getApprovalLevelsQuery = any;
export type getApprovalLevelsQueryVariables = any;

export const GetChangeRequestAuditByIdDocument = parse(`query getChangeRequestAuditById(\$Id: uuid!) {
  change_request_audit(where: {
    Id:{
      _eq: \$Id
    }
  }, order_by: {ModifiedAtTimestamp: desc}) {
    Id
    SequentialId
    ParentId
    Type
    CreatedAtTimestamp
    CreatedByUser
    ModifiedAtTimestamp
    ModifiedByUser
    RequestedChanges
    ChangeRequestStatus
    Comment
    OverriddenByUser
    OverriddenAtTimestamp
  }
}`) as any;
export type GetChangeRequestAuditByIdQuery = any;
export type GetChangeRequestAuditByIdQueryVariables = any;
export type GetGetChangeRequestAuditByIdQuery = any;
export type getChangeRequestAuditByIdQuery = any;
export type getChangeRequestAuditByIdQueryVariables = any;

export const GetChangeRequestsDocument = parse(`query getChangeRequests(
  \$where: change_request_bool_exp! = {}
  \$currentUserId: String!
) {
  change_request(where: \$where) {
    Id
    SequentialId
    ChangeRequestStatus
    ModifiedAtTimestamp
    CreatedAtTimestamp
    Workflow
    parent {
      Id
      ObjectType
      SequentialId

      documentFile {
        Version
        parent {
          SequentialId
          Id
          Title
          owners {
            user {
              Id
              FriendlyName
              Email
            }
          }
        }
      }
      acceptance {
        Title
        parents {
          risk {
            owners {
              user {
                Id
                FriendlyName
                Email
              }
            }
          }
        }
      }
      risk {
        Title
        owners {
          user {
            Id
            FriendlyName
            Email
          }
        }
      }
      control {
        Title
        owners {
          user {
            Id
            FriendlyName
            Email
          }
        }
      }
      action {
        Title
        owners {
          user {
            Id
            FriendlyName
            Email
          }
        }
      }
      issue_assessment {
        parent {
          Id
          Title
          SequentialId
          owners {
            user {
              Id
              FriendlyName
              Email
            }
          }
        }
      }
    }
    ParentId
    createdBy {
      Id
      FriendlyName
    }
    contributors {
      user {
        Id
        FriendlyName
        Email
      }
    }
    responses {
      Id
      Approved
      CreatedAtTimestamp
      ModifiedAtTimestamp
      ApprovedByUser
      ApprovedAtTimestamp
      approver {
        Id
        OwnerApprover
        level {
          Id
          ApprovalRuleType
          SequenceOrder

          approval {
            InFlightEditRule
            Id
            Workflow
          }
        }
        group {
          Name
          Id
          users {
            UserId
          }
        }
        user {
          FriendlyName
          Email
          Id
        }
      }
    }
    currentUserOwnerList: parentOwnerAndContributors(
      where: {
        ContributorType: { _eq: "owner" }
        UserId: { _eq: \$currentUserId }
      }
      distinct_on: [UserId]
    ) {
      UserId
    }
  }
}`) as any;
export type GetChangeRequestsQuery = any;
export type GetChangeRequestsQueryVariables = any;
export type GetGetChangeRequestsQuery = any;
export type getChangeRequestsQuery = any;
export type getChangeRequestsQueryVariables = any;

export const GetPendingChangeRequestsDocument = parse(`query getPendingChangeRequests(\$ParentId: uuid!) {
  change_request(
    where: {
      ParentId: { _eq: \$ParentId }
      ChangeRequestStatus: { _eq: pending }
    }
  ) {
    ...ChangeRequestParts
  }
}

fragment ChangeRequestParts on change_request {
  createdBy {
    FriendlyName
    Id
    Email
  }
  Id
  SequentialId
  ParentId
  Type
  parent {
    Id
    SequentialId
    ObjectType
    owners: ancestorContributors(where: { ContributorType: { _eq: "owner" } }) {
      UserId
      user {
        FriendlyName
      }
      user_group {
        users {
          UserId
        }
      }
      ContributorType
    }

    risk {
      Title
    }
    documentFile {
      Version
      parent {
        Id
        SequentialId
        Title
        owners: ancestorContributors(
          where: { ContributorType: { _eq: "owner" } }
        ) {
          UserId
          user {
            FriendlyName
          }
          user_group {
            users {
              UserId
            }
          }
          ContributorType
        }
      }
    }
    acceptance {
      Title
      parents {
        risk {
          Id
          owners: ancestorContributors(
            where: { ContributorType: { _eq: "owner" } }
          ) {
            UserId
            user {
              FriendlyName
            }
            user_group {
              users {
                UserId
              }
            }
            ContributorType
          }
        }
      }
    }
    control {
      Title
    }
    action {
      Title
    }
    issue_assessment {
      parent {
        Id
        SequentialId
        Title
        owners: ancestorContributors(
          where: { ContributorType: { _eq: "owner" } }
        ) {
          UserId
          user {
            FriendlyName
          }
          user_group {
            users {
              UserId
            }
          }
          ContributorType
        }
      }
    }
  }
  CreatedAtTimestamp
  ModifiedAtTimestamp
  RequestedChanges
  requestedFileChanges {
    ...RelationFileParts
  }
  ChangeRequestStatus
  contributors {
    user {
      Id
      FriendlyName
      Email
    }
  }
  Comment
  RequesterComment
  OverriddenByUser
  OverriddenAtTimestamp
  responses {
    Id
    Approved
    ModifiedAtTimestamp
    CreatedAtTimestamp
    ApprovedByUser
    ApprovedAtTimestamp
    Comment
    approver {
      Id
      OwnerApprover
      level {
        Id
        ApprovalRuleType
        SequenceOrder
        approval {
          Id
          ParentId
          Workflow
          InFlightEditRule
        }
      }
      user {
        FriendlyName
        Email
        Id
      }
      group {
        Id
        Name
        users {
          UserId
          user {
            FriendlyName
          }
        }
      }
    }
  }
}

fragment RelationFileParts on relation_file {
  ParentId
  ChangeRequestFileOperation
  file {
    ...FileParts
  }
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}`) as any;
export type GetPendingChangeRequestsQuery = any;
export type GetPendingChangeRequestsQueryVariables = any;
export type GetGetPendingChangeRequestsQuery = any;
export type getPendingChangeRequestsQuery = any;
export type getPendingChangeRequestsQueryVariables = any;

export const GetMostRecentNonPendingChangeRequestDocument = parse(`query getMostRecentNonPendingChangeRequest(\$ParentId: uuid!) {
  change_request(
    where: {
      ParentId: { _eq: \$ParentId }
      ChangeRequestStatus: { _neq: pending }
    }
    order_by: { CreatedAtTimestamp: desc }
  ) {
    ...ChangeRequestParts
  }
}

fragment ChangeRequestParts on change_request {
  createdBy {
    FriendlyName
    Id
    Email
  }
  Id
  SequentialId
  ParentId
  Type
  parent {
    Id
    SequentialId
    ObjectType
    owners: ancestorContributors(where: { ContributorType: { _eq: "owner" } }) {
      UserId
      user {
        FriendlyName
      }
      user_group {
        users {
          UserId
        }
      }
      ContributorType
    }

    risk {
      Title
    }
    documentFile {
      Version
      parent {
        Id
        SequentialId
        Title
        owners: ancestorContributors(
          where: { ContributorType: { _eq: "owner" } }
        ) {
          UserId
          user {
            FriendlyName
          }
          user_group {
            users {
              UserId
            }
          }
          ContributorType
        }
      }
    }
    acceptance {
      Title
      parents {
        risk {
          Id
          owners: ancestorContributors(
            where: { ContributorType: { _eq: "owner" } }
          ) {
            UserId
            user {
              FriendlyName
            }
            user_group {
              users {
                UserId
              }
            }
            ContributorType
          }
        }
      }
    }
    control {
      Title
    }
    action {
      Title
    }
    issue_assessment {
      parent {
        Id
        SequentialId
        Title
        owners: ancestorContributors(
          where: { ContributorType: { _eq: "owner" } }
        ) {
          UserId
          user {
            FriendlyName
          }
          user_group {
            users {
              UserId
            }
          }
          ContributorType
        }
      }
    }
  }
  CreatedAtTimestamp
  ModifiedAtTimestamp
  RequestedChanges
  requestedFileChanges {
    ...RelationFileParts
  }
  ChangeRequestStatus
  contributors {
    user {
      Id
      FriendlyName
      Email
    }
  }
  Comment
  RequesterComment
  OverriddenByUser
  OverriddenAtTimestamp
  responses {
    Id
    Approved
    ModifiedAtTimestamp
    CreatedAtTimestamp
    ApprovedByUser
    ApprovedAtTimestamp
    Comment
    approver {
      Id
      OwnerApprover
      level {
        Id
        ApprovalRuleType
        SequenceOrder
        approval {
          Id
          ParentId
          Workflow
          InFlightEditRule
        }
      }
      user {
        FriendlyName
        Email
        Id
      }
      group {
        Id
        Name
        users {
          UserId
          user {
            FriendlyName
          }
        }
      }
    }
  }
}

fragment RelationFileParts on relation_file {
  ParentId
  ChangeRequestFileOperation
  file {
    ...FileParts
  }
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}`) as any;
export type GetMostRecentNonPendingChangeRequestQuery = any;
export type GetMostRecentNonPendingChangeRequestQueryVariables = any;
export type GetGetMostRecentNonPendingChangeRequestQuery = any;
export type getMostRecentNonPendingChangeRequestQuery = any;
export type getMostRecentNonPendingChangeRequestQueryVariables = any;

export const GetLivePendingChangeRequestsDocument = parse(`subscription getLivePendingChangeRequests(\$ParentId: uuid!) {
  change_request(
    where: {
      ParentId: { _eq: \$ParentId }
      ChangeRequestStatus: { _eq: pending }
    }
  ) {
    ...ChangeRequestParts
  }
}

fragment ChangeRequestParts on change_request {
  createdBy {
    FriendlyName
    Id
    Email
  }
  Id
  SequentialId
  ParentId
  Type
  parent {
    Id
    SequentialId
    ObjectType
    owners: ancestorContributors(where: { ContributorType: { _eq: "owner" } }) {
      UserId
      user {
        FriendlyName
      }
      user_group {
        users {
          UserId
        }
      }
      ContributorType
    }

    risk {
      Title
    }
    documentFile {
      Version
      parent {
        Id
        SequentialId
        Title
        owners: ancestorContributors(
          where: { ContributorType: { _eq: "owner" } }
        ) {
          UserId
          user {
            FriendlyName
          }
          user_group {
            users {
              UserId
            }
          }
          ContributorType
        }
      }
    }
    acceptance {
      Title
      parents {
        risk {
          Id
          owners: ancestorContributors(
            where: { ContributorType: { _eq: "owner" } }
          ) {
            UserId
            user {
              FriendlyName
            }
            user_group {
              users {
                UserId
              }
            }
            ContributorType
          }
        }
      }
    }
    control {
      Title
    }
    action {
      Title
    }
    issue_assessment {
      parent {
        Id
        SequentialId
        Title
        owners: ancestorContributors(
          where: { ContributorType: { _eq: "owner" } }
        ) {
          UserId
          user {
            FriendlyName
          }
          user_group {
            users {
              UserId
            }
          }
          ContributorType
        }
      }
    }
  }
  CreatedAtTimestamp
  ModifiedAtTimestamp
  RequestedChanges
  requestedFileChanges {
    ...RelationFileParts
  }
  ChangeRequestStatus
  contributors {
    user {
      Id
      FriendlyName
      Email
    }
  }
  Comment
  RequesterComment
  OverriddenByUser
  OverriddenAtTimestamp
  responses {
    Id
    Approved
    ModifiedAtTimestamp
    CreatedAtTimestamp
    ApprovedByUser
    ApprovedAtTimestamp
    Comment
    approver {
      Id
      OwnerApprover
      level {
        Id
        ApprovalRuleType
        SequenceOrder
        approval {
          Id
          ParentId
          Workflow
          InFlightEditRule
        }
      }
      user {
        FriendlyName
        Email
        Id
      }
      group {
        Id
        Name
        users {
          UserId
          user {
            FriendlyName
          }
        }
      }
    }
  }
}

fragment RelationFileParts on relation_file {
  ParentId
  ChangeRequestFileOperation
  file {
    ...FileParts
  }
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}`) as any;
export type GetLivePendingChangeRequestsSubscription = any;
export type GetLivePendingChangeRequestsSubscriptionVariables = any;

export const OverrideChangeRequestByIdDocument = parse(`mutation overrideChangeRequestById(
  \$Id: uuid!
  \$Approved: Boolean!
  \$Rationale: String!
) {
  overrideChangeRequest(Id: \$Id, Approved: \$Approved, Rationale: \$Rationale) {
    Id
  }
}`) as any;
export type OverrideChangeRequestByIdMutation = any;
export type OverrideChangeRequestByIdMutationVariables = any;
export type overrideChangeRequestByIdMutation = any;
export type overrideChangeRequestByIdMutationVariables = any;

export const UpdateApproverResponsesDocument = parse(`mutation updateApproverResponses(
  \$input: UpdateApproverResponsesInput!
) {
  updateApproverResponses(
    input: \$input
  ) {
    Id
  }
}`) as any;
export type UpdateApproverResponsesMutation = any;
export type UpdateApproverResponsesMutationVariables = any;
export type updateApproverResponsesMutation = any;
export type updateApproverResponsesMutationVariables = any;

export const GetColourPalettesDocument = parse(`query getColourPalettes {
  colour_palette {
    Id
    Name
    Settings
  }
}`) as any;
export type GetColourPalettesQuery = any;
export type GetColourPalettesQueryVariables = any;
export type GetGetColourPalettesQuery = any;
export type getColourPalettesQuery = any;
export type getColourPalettesQueryVariables = any;

export const InsertColourPaletteDocument = parse(`mutation InsertColourPalette(\$Name: String!, \$Settings: jsonb!) {
  insert_colour_palette_one(object: { Name: \$Name, Settings: \$Settings }) {
    Id
  }
}`) as any;
export type InsertColourPaletteMutation = any;
export type InsertColourPaletteMutationVariables = any;

export const UpdateColourPaletteDocument = parse(`mutation UpdateColourPalette(\$Id: uuid!, \$Name: String!, \$Settings: jsonb!) {
  update_colour_palette_by_pk(
    pk_columns: { Id: \$Id }
    _set: { Name: \$Name, Settings: \$Settings }
  ) {
    Id
  }
}`) as any;
export type UpdateColourPaletteMutation = any;
export type UpdateColourPaletteMutationVariables = any;

export const DeleteCommentDocument = parse(`mutation deleteComment(\$Id: uuid!) {
  delete_comment_by_pk(Id: \$Id) {
    Id
  }
}`) as any;
export type DeleteCommentMutation = any;
export type DeleteCommentMutationVariables = any;
export type deleteCommentMutation = any;
export type deleteCommentMutationVariables = any;

export const DeleteConversationDocument = parse(`mutation deleteConversation(\$Id: uuid!) {
  delete_comment(where: { ConversationId: { _eq: \$Id } }) {
    affected_rows
  }

  delete_conversation_by_pk(Id: \$Id) {
    Id
  }
}`) as any;
export type DeleteConversationMutation = any;
export type DeleteConversationMutationVariables = any;
export type deleteConversationMutation = any;
export type deleteConversationMutationVariables = any;

export const DeleteConversationsDocument = parse(`mutation deleteConversations(\$Ids: [uuid!]) {
  delete_comment(where: { ConversationId: { _in: \$Ids } }) {
    affected_rows
  }

  delete_conversation(where: { Id: { _in: \$Ids } }) {
    affected_rows
  }
}`) as any;
export type DeleteConversationsMutation = any;
export type DeleteConversationsMutationVariables = any;
export type deleteConversationsMutation = any;
export type deleteConversationsMutationVariables = any;

export const GetCommentAuditByIdDocument = parse(`query getCommentAuditById(\$Id: uuid!) {
  comment_audit(where: { Id: { _eq: \$Id } }, order_by: {ModifiedAtTimestamp: desc}) {
    Id
    Content
    ModifiedAtTimestamp
    CreatedAtTimestamp
    CreatedByUser
    ModifiedByUser
  }
}`) as any;
export type GetCommentAuditByIdQuery = any;
export type GetCommentAuditByIdQueryVariables = any;
export type GetGetCommentAuditByIdQuery = any;
export type getCommentAuditByIdQuery = any;
export type getCommentAuditByIdQueryVariables = any;

export const GetCommentsByConversationIdDocument = parse(`query getCommentsByConversationId(\$ConversationId: uuid!) {
  comment(where: { ConversationId: { _eq: \$ConversationId } }) {
    Id
    Content
    ModifiedAtTimestamp
    CreatedAtTimestamp
    CreatedByUser
    ModifiedByUser
    modifiedByUser {
      FriendlyName
    }
    createdByUser {
      FriendlyName
    }
  }
}`) as any;
export type GetCommentsByConversationIdQuery = any;
export type GetCommentsByConversationIdQueryVariables = any;
export type GetGetCommentsByConversationIdQuery = any;
export type getCommentsByConversationIdQuery = any;
export type getCommentsByConversationIdQueryVariables = any;

export const GetConversationAuditByIdDocument = parse(`query getConversationAuditById(\$Id: uuid!) {
  conversation_audit(where: { Id: { _eq: \$Id } }, order_by: {ModifiedAtTimestamp: desc}) {
    Id
    IsResolved
    ParentId
    ModifiedAtTimestamp
    CreatedAtTimestamp
    CreatedByUser
    ModifiedByUser
  }
}`) as any;
export type GetConversationAuditByIdQuery = any;
export type GetConversationAuditByIdQueryVariables = any;
export type GetGetConversationAuditByIdQuery = any;
export type getConversationAuditByIdQuery = any;
export type getConversationAuditByIdQueryVariables = any;

export const InsertCommentDocument = parse(`mutation insertComment(\$Content: String!, \$ConversationId: uuid!) {
  insert_comment_one(
    object: { Content: \$Content, ConversationId: \$ConversationId }
  ) {
    Id
  }
}`) as any;
export type InsertCommentMutation = any;
export type InsertCommentMutationVariables = any;
export type insertCommentMutation = any;
export type insertCommentMutationVariables = any;

export const InsertConversationDocument = parse(`mutation insertConversation(\$Content: String!, \$ParentId: uuid!) {
  insert_conversation_one(
    object: { ParentId: \$ParentId, comments: { data: { Content: \$Content } } }
  ) {
    Id
  }
}`) as any;
export type InsertConversationMutation = any;
export type InsertConversationMutationVariables = any;
export type insertConversationMutation = any;
export type insertConversationMutationVariables = any;

export const ResolveConversationDocument = parse(`mutation resolveConversation(\$Id: uuid!) {
  update_conversation_by_pk(
    pk_columns: { Id: \$Id }
    _set: { IsResolved: true }
  ) {
    Id
  }
}`) as any;
export type ResolveConversationMutation = any;
export type ResolveConversationMutationVariables = any;
export type resolveConversationMutation = any;
export type resolveConversationMutationVariables = any;

export const UpdateCommentDocument = parse(`mutation updateComment(\$Id: uuid!, \$Content: String!) {
  update_comment_by_pk(pk_columns: { Id: \$Id }, _set: { Content: \$Content }) {
    Id
  }
}`) as any;
export type UpdateCommentMutation = any;
export type UpdateCommentMutationVariables = any;
export type updateCommentMutation = any;
export type updateCommentMutationVariables = any;

export const ComplianceMonitoringAssessmentPartsDocument = parse(`fragment ComplianceMonitoringAssessmentParts on compliance_monitoring_assessment {
  ActualCompletionDate
  CompletedByUser
  CreatedAtTimestamp
  CreatedByUser
  CustomAttributeData
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  NextTestDate
  OriginatingItemId
  SequentialId
  StartDate
  Summary
  TargetCompletionDate
  Title
  Status
  Outcome
}`) as any;
export type ComplianceMonitoringAssessmentPartsFragment = any;

export const DeleteComplianceMonitoringAssessmentsDocument = parse(`mutation deleteComplianceMonitoringAssessments(\$Ids: [uuid!]!) {
  delete_compliance_monitoring_assessment(where: { Id: { _in: \$Ids } }) {
    affected_rows
  }
}`) as any;
export type DeleteComplianceMonitoringAssessmentsMutation = any;
export type DeleteComplianceMonitoringAssessmentsMutationVariables = any;
export type deleteComplianceMonitoringAssessmentsMutation = any;
export type deleteComplianceMonitoringAssessmentsMutationVariables = any;

export const GetAllComplianceMonitoringAssessmentsDocument = parse(`query getAllComplianceMonitoringAssessments {
  compliance_monitoring_assessment(order_by: { ModifiedByUser: asc }) {
    Title
    Summary
    TargetCompletionDate
    ActualCompletionDate
    StartDate
    NextTestDate
    CreatedAtTimestamp
    ModifiedAtTimestamp
    CreatedByUser
    ModifiedByUser
    Outcome
  }
}`) as any;
export type GetAllComplianceMonitoringAssessmentsQuery = any;
export type GetAllComplianceMonitoringAssessmentsQueryVariables = any;
export type GetGetAllComplianceMonitoringAssessmentsQuery = any;
export type getAllComplianceMonitoringAssessmentsQuery = any;
export type getAllComplianceMonitoringAssessmentsQueryVariables = any;

export const GetComplianceMonitoringAssessmentByIdDocument = parse(`query getComplianceMonitoringAssessmentById(\$Id: uuid!) {
  compliance_monitoring_assessment(where: { Id: { _eq: \$Id } }) {
    ...ComplianceMonitoringAssessmentParts
    owners {
      ...OwnerParts
    }
    ownerGroups {
      ...OwnerGroupParts
    }
    contributors {
      ...ContributorParts
    }
    contributorGroups {
      ...ContributorGroupParts
    }
    contributors {
      ...ContributorParts
    }
    contributorGroups {
      UserGroupId
    }
    ancestorContributors {
      ...AncestorContributorParts
    }
    tags {
      ...TagParts
    }
    departments {
      ...DepartmentParts
    }
    completedByUser {
      FriendlyName
    }
  }
}

fragment ComplianceMonitoringAssessmentParts on compliance_monitoring_assessment {
  ActualCompletionDate
  CompletedByUser
  CreatedAtTimestamp
  CreatedByUser
  CustomAttributeData
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  NextTestDate
  OriginatingItemId
  SequentialId
  StartDate
  Summary
  TargetCompletionDate
  Title
  Status
  Outcome
}

fragment OwnerParts on owner {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment OwnerGroupParts on owner_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment ContributorParts on contributor {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment ContributorGroupParts on contributor_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment AncestorContributorParts on ancestor_contributor {
  ContributorType
  UserId
  Id
  AncestorId
  UserGroupId
  user {
    FriendlyName
  }
  user_group {
    Name
  }
}

fragment TagParts on tag {
  type {
    Description
    Name
  }
  ParentId
  TagTypeId
}

fragment DepartmentParts on department {
  type {
    Description
    Name
  }
  ParentId
  DepartmentTypeId
}`) as any;
export type GetComplianceMonitoringAssessmentByIdQuery = any;
export type GetComplianceMonitoringAssessmentByIdQueryVariables = any;
export type GetGetComplianceMonitoringAssessmentByIdQuery = any;
export type getComplianceMonitoringAssessmentByIdQuery = any;
export type getComplianceMonitoringAssessmentByIdQueryVariables = any;

export const GetComplianceMonitoringAssessmentsDocument = parse(`query getComplianceMonitoringAssessments {
  compliance_monitoring_assessment {
    ...ComplianceMonitoringAssessmentParts
    owners {
      ...OwnerParts
    }
    ownerGroups {
      ...OwnerGroupParts
    }
    contributors {
      ...ContributorParts
    }
    contributorGroups {
      ...ContributorGroupParts
    }
    tags {
      ...TagParts
    }
    departments {
      ...DepartmentParts
    }
    completedByUser {
      FriendlyName
    }
    assessedItems: assessmentResults {
      riskAssessmentResult {
        Id
        parents(where: { ParentType: { _eq: risk } }) {
          risk {
            Id
            Title
          }
        }
      }
      obligationAssessmentResult {
        Id
        parents(where: { ParentType: { _eq: obligation } }) {
          obligation {
            Id
            Title
          }
        }
      }
      documentAssessmentResult {
        Id
        parents(where: { ParentType: { _eq: document } }) {
          document {
            Id
            Title
          }
        }
      }
    }
  }
}

fragment ComplianceMonitoringAssessmentParts on compliance_monitoring_assessment {
  ActualCompletionDate
  CompletedByUser
  CreatedAtTimestamp
  CreatedByUser
  CustomAttributeData
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  NextTestDate
  OriginatingItemId
  SequentialId
  StartDate
  Summary
  TargetCompletionDate
  Title
  Status
  Outcome
}

fragment OwnerParts on owner {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment OwnerGroupParts on owner_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment ContributorParts on contributor {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment ContributorGroupParts on contributor_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment TagParts on tag {
  type {
    Description
    Name
  }
  ParentId
  TagTypeId
}

fragment DepartmentParts on department {
  type {
    Description
    Name
  }
  ParentId
  DepartmentTypeId
}`) as any;
export type GetComplianceMonitoringAssessmentsQuery = any;
export type GetComplianceMonitoringAssessmentsQueryVariables = any;
export type GetGetComplianceMonitoringAssessmentsQuery = any;
export type getComplianceMonitoringAssessmentsQuery = any;
export type getComplianceMonitoringAssessmentsQueryVariables = any;

export const InsertComplianceMonitoringAssessmentDocument = parse(`mutation insertComplianceMonitoringAssessment(\$object: InsertAssessmentInput!) {
  insertComplianceMonitoringAssessmentApi(object: \$object) {
    Id
  }
}`) as any;
export type InsertComplianceMonitoringAssessmentMutation = any;
export type InsertComplianceMonitoringAssessmentMutationVariables = any;
export type insertComplianceMonitoringAssessmentMutation = any;
export type insertComplianceMonitoringAssessmentMutationVariables = any;

export const UpdateComplianceMonitoringAssessmentDocument = parse(`mutation updateComplianceMonitoringAssessment(\$object: UpdateAssessmentInput!) {
  updateComplianceMonitoringAssessmentApi(object: \$object) {
    affected_rows
  }
}`) as any;
export type UpdateComplianceMonitoringAssessmentMutation = any;
export type UpdateComplianceMonitoringAssessmentMutationVariables = any;
export type updateComplianceMonitoringAssessmentMutation = any;
export type updateComplianceMonitoringAssessmentMutationVariables = any;

export const ConsequencePartsDocument = parse(`fragment ConsequenceParts on consequence {
  CostType
  CostValue
  Criticality
  Description
  Id
  ParentIssueId
  ModifiedAtTimestamp
  CreatedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  CustomAttributeData
  Type
}`) as any;
export type ConsequencePartsFragment = any;

export const DeleteConsequencesDocument = parse(`mutation deleteConsequences(\$Ids: [uuid!]) {
  delete_consequence(where: { Id: { _in: \$Ids } }) {
    affected_rows
  }
}`) as any;
export type DeleteConsequencesMutation = any;
export type DeleteConsequencesMutationVariables = any;
export type deleteConsequencesMutation = any;
export type deleteConsequencesMutationVariables = any;

export const GetConsequenceAuditByIdDocument = parse(`query getConsequenceAuditById(\$Id: uuid!) {
  consequence_audit(where: { Id: { _eq: \$Id } }, order_by: {ModifiedAtTimestamp: desc}) {
    CostType
    CostValue
    Criticality
    Description
    Id
    ParentIssueId
    ModifiedAtTimestamp
    CreatedAtTimestamp
    Title
    CreatedByUser
    ModifiedByUser
    CustomAttributeData
    Type
  }
}`) as any;
export type GetConsequenceAuditByIdQuery = any;
export type GetConsequenceAuditByIdQueryVariables = any;
export type GetGetConsequenceAuditByIdQuery = any;
export type getConsequenceAuditByIdQuery = any;
export type getConsequenceAuditByIdQueryVariables = any;

export const GetConsequenceByIdDocument = parse(`query getConsequenceById(\$_eq: uuid!) {
  consequence(where: { Id: { _eq: \$_eq } }) {
    ...ConsequenceParts
  }
}

fragment ConsequenceParts on consequence {
  CostType
  CostValue
  Criticality
  Description
  Id
  ParentIssueId
  ModifiedAtTimestamp
  CreatedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  CustomAttributeData
  Type
}`) as any;
export type GetConsequenceByIdQuery = any;
export type GetConsequenceByIdQueryVariables = any;
export type GetGetConsequenceByIdQuery = any;
export type getConsequenceByIdQuery = any;
export type getConsequenceByIdQueryVariables = any;

export const GetConsequencesDocument = parse(`query getConsequences(\$where: consequence_bool_exp! = {}) {
  consequence(where: \$where) {
    ...ConsequenceParts
    createdByUser {
      FriendlyName
    }
    modifiedByUser {
      FriendlyName
    }
    issue {
      Type
      SequentialId
      CreatedAtTimestamp
      Title
      owners {
        ...OwnerParts
      }
      ownerGroups {
        ...OwnerGroupParts
      }
      contributors {
        ...ContributorParts
      }
      contributorGroups {
        ...ContributorGroupParts
      }
      assessment {
        IssueType
        ActualCloseDate
        Status
        Severity
        departments {
          ...DepartmentParts
        }
      }
      departments {
        ...DepartmentParts
      }
      tags {
        ...TagParts
      }
    }
  }
}

fragment ConsequenceParts on consequence {
  CostType
  CostValue
  Criticality
  Description
  Id
  ParentIssueId
  ModifiedAtTimestamp
  CreatedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  CustomAttributeData
  Type
}

fragment OwnerParts on owner {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment OwnerGroupParts on owner_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment ContributorParts on contributor {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment ContributorGroupParts on contributor_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment DepartmentParts on department {
  type {
    Description
    Name
  }
  ParentId
  DepartmentTypeId
}

fragment TagParts on tag {
  type {
    Description
    Name
  }
  ParentId
  TagTypeId
}`) as any;
export type GetConsequencesQuery = any;
export type GetConsequencesQueryVariables = any;
export type GetGetConsequencesQuery = any;
export type getConsequencesQuery = any;
export type getConsequencesQueryVariables = any;

export const GetConsequencesByParentIssueIdDocument = parse(`query getConsequencesByParentIssueId(\$_eq: uuid!) {
  consequence(where: { ParentIssueId: { _eq: \$_eq } }) {
    ...ConsequenceParts
  }
}

fragment ConsequenceParts on consequence {
  CostType
  CostValue
  Criticality
  Description
  Id
  ParentIssueId
  ModifiedAtTimestamp
  CreatedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  CustomAttributeData
  Type
}`) as any;
export type GetConsequencesByParentIssueIdQuery = any;
export type GetConsequencesByParentIssueIdQueryVariables = any;
export type GetGetConsequencesByParentIssueIdQuery = any;
export type getConsequencesByParentIssueIdQuery = any;
export type getConsequencesByParentIssueIdQueryVariables = any;

export const InsertConsequenceDocument = parse(`mutation insertConsequence(
  \$Title: String
  \$Description: String
  \$Criticality: Int
  \$ParentIssueId: uuid
  \$CostValue: numeric
  \$CostType: cost_type_enum
  \$CustomAttributeData: jsonb
  \$Type: consequence_type_enum
) {
  insert_consequence_one(
    object: {
      Title: \$Title
      Description: \$Description
      Criticality: \$Criticality
      ParentIssueId: \$ParentIssueId
      CostValue: \$CostValue
      CostType: \$CostType
      CustomAttributeData: \$CustomAttributeData
      Type: \$Type
    }
  ) {
    Id
  }
}`) as any;
export type InsertConsequenceMutation = any;
export type InsertConsequenceMutationVariables = any;
export type insertConsequenceMutation = any;
export type insertConsequenceMutationVariables = any;

export const UpdateConsequenceDocument = parse(`mutation updateConsequence(
  \$Id: uuid
  \$Title: String
  \$Description: String
  \$Criticality: Int
  \$CostType: cost_type_enum
  \$CostValue: numeric
  \$ParentIssueId: uuid
  \$OriginalTimestamp: timestamptz
  \$CustomAttributeData: jsonb
  \$Type: consequence_type_enum
) {
  update_consequence(
    where: {
      Id: { _eq: \$Id }
      ModifiedAtTimestamp: { _eq: \$OriginalTimestamp }
    }
    _set: {
      Title: \$Title
      Description: \$Description
      Criticality: \$Criticality
      CostType: \$CostType
      CostValue: \$CostValue
      ParentIssueId: \$ParentIssueId
      CustomAttributeData: \$CustomAttributeData
      Type: \$Type
    }
  ) {
    affected_rows
  }
}`) as any;
export type UpdateConsequenceMutation = any;
export type UpdateConsequenceMutationVariables = any;
export type updateConsequenceMutation = any;
export type updateConsequenceMutationVariables = any;

export const AddControlParentsDocument = parse(`mutation addControlParents(\$objects: [control_parent_insert_input!]!) {
  insert_control_parent(objects: \$objects) {
    affected_rows
  }
}`) as any;
export type AddControlParentsMutation = any;
export type AddControlParentsMutationVariables = any;
export type addControlParentsMutation = any;
export type addControlParentsMutationVariables = any;

export const ControlPartsDocument = parse(`fragment ControlParts on control {
  CreatedByUser
  ModifiedByUser
  Description
  Id
  CreatedAtTimestamp
  ModifiedAtTimestamp
  Title
  Type
  CustomAttributeData
  SequentialId
  schedule {
    ...ScheduleParts
  }
}

fragment ScheduleParts on schedule {
  Id
  Frequency
  ManualDueDate
  StartDate
  TimeToCompleteValue
  TimeToCompleteUnit
}`) as any;
export type ControlPartsFragment = any;

export const DeleteControlsDocument = parse(`mutation deleteControls(\$Ids: [uuid!]!) {
  deleteControlsById(Ids: \$Ids) {
    affected_rows
  }
}`) as any;
export type DeleteControlsMutation = any;
export type DeleteControlsMutationVariables = any;
export type deleteControlsMutation = any;
export type deleteControlsMutationVariables = any;

export const GetControlAuditByIdDocument = parse(`query getControlAuditById(\$Id: uuid) {
  control_audit(
    where: { Id: { _eq: \$Id } }
    order_by: { ModifiedAtTimestamp: desc }
  ) {
    CreatedByUser
    ModifiedByUser
    Description
    Id
    CreatedAtTimestamp
    ModifiedAtTimestamp
    Title
    Type
    CustomAttributeData
    SequentialId
  }
}`) as any;
export type GetControlAuditByIdQuery = any;
export type GetControlAuditByIdQueryVariables = any;
export type GetGetControlAuditByIdQuery = any;
export type getControlAuditByIdQuery = any;
export type getControlAuditByIdQueryVariables = any;

export const GetControlByIdDocument = parse(`query getControlById(\$_eq: uuid) {
  control(where: { Id: { _eq: \$_eq } }) {
    ...ControlParts
    scheduleState {
      LatestDate
    }
    tags {
      ...TagParts
    }
    departments {
      ...DepartmentParts
    }
    owners {
      ...OwnerParts
    }
    contributors {
      ...ContributorParts
    }
    ownerGroups {
      ...OwnerGroupParts
    }
    contributorGroups {
      ...ContributorGroupParts
    }
    ancestorContributors {
      ...AncestorContributorParts
    }
  }
}

fragment ControlParts on control {
  CreatedByUser
  ModifiedByUser
  Description
  Id
  CreatedAtTimestamp
  ModifiedAtTimestamp
  Title
  Type
  CustomAttributeData
  SequentialId
  schedule {
    ...ScheduleParts
  }
}

fragment ScheduleParts on schedule {
  Id
  Frequency
  ManualDueDate
  StartDate
  TimeToCompleteValue
  TimeToCompleteUnit
}

fragment TagParts on tag {
  type {
    Description
    Name
  }
  ParentId
  TagTypeId
}

fragment DepartmentParts on department {
  type {
    Description
    Name
  }
  ParentId
  DepartmentTypeId
}

fragment OwnerParts on owner {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment ContributorParts on contributor {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment OwnerGroupParts on owner_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment ContributorGroupParts on contributor_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment AncestorContributorParts on ancestor_contributor {
  ContributorType
  UserId
  Id
  AncestorId
  UserGroupId
  user {
    FriendlyName
  }
  user_group {
    Name
  }
}`) as any;
export type GetControlByIdQuery = any;
export type GetControlByIdQueryVariables = any;
export type GetGetControlByIdQuery = any;
export type getControlByIdQuery = any;
export type getControlByIdQueryVariables = any;

export const GetControlsDocument = parse(`query getControls(\$where: control_bool_exp! = {}) {
  control(where: \$where) {
    ...ControlParts
    scheduleState {
      LatestDate
      DueDate
      OverdueDate
    }
    actions_aggregate(where: { action: { Status: { _eq: open } } }) {
      aggregate {
        count
      }
    }
    open_issue_aggregate: issues_aggregate(
      where: { issue: { assessment: { Status: { _eq: open } } } }
    ) {
      aggregate {
        count
      }
    }
    issues_aggregate {
      aggregate {
        count
      }
    }
    indicators_aggregate {
      aggregate {
        count
      }
    }
    testResults(
      where: { RatingType: { _in: ["assessment", "rating"] } }
      order_by: { TestDate: desc, ModifiedAtTimestamp: desc }
    ) {
      OverallEffectiveness
      DesignEffectiveness
      PerformanceEffectiveness
      TestDate
      Id
    }
    owners {
      ...OwnerParts
    }
    ownerGroups {
      ...OwnerGroupParts
    }
    contributors {
      ...ContributorParts
    }
    contributorGroups {
      ...ContributorGroupParts
    }
    parents {
      parent {
        Id
        ObjectType
        SequentialId
      }
      obligation {
        Title
      }
      risk {
        Title
      }
      thirdParty {
        Title
      }
      group {
        Id
        Title
      }
    }
    modifiedByUser {
      FriendlyName
    }
    createdByUser {
      FriendlyName
    }
    tags {
      ...TagParts
    }
    departments {
      ...DepartmentParts
    }
  }
}

fragment ControlParts on control {
  CreatedByUser
  ModifiedByUser
  Description
  Id
  CreatedAtTimestamp
  ModifiedAtTimestamp
  Title
  Type
  CustomAttributeData
  SequentialId
  schedule {
    ...ScheduleParts
  }
}

fragment ScheduleParts on schedule {
  Id
  Frequency
  ManualDueDate
  StartDate
  TimeToCompleteValue
  TimeToCompleteUnit
}

fragment OwnerParts on owner {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment OwnerGroupParts on owner_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment ContributorParts on contributor {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment ContributorGroupParts on contributor_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment TagParts on tag {
  type {
    Description
    Name
  }
  ParentId
  TagTypeId
}

fragment DepartmentParts on department {
  type {
    Description
    Name
  }
  ParentId
  DepartmentTypeId
}`) as any;
export type GetControlsQuery = any;
export type GetControlsQueryVariables = any;
export type GetGetControlsQuery = any;
export type getControlsQuery = any;
export type getControlsQueryVariables = any;

export const GetControlsBasicDocument = parse(`query getControlsBasic {
  # Note: Query is must faster for standard users when controls are queried separately to nodes
  control {
    Id
    Title
    SequentialId
  }
  # Get control nodes so we have IDs for even controls we don't have access to
  node(where: { ObjectType: { _eq: control } }) {
    Id
    SequentialId
  }
}`) as any;
export type GetControlsBasicQuery = any;
export type GetControlsBasicQueryVariables = any;
export type GetGetControlsBasicQuery = any;
export type getControlsBasicQuery = any;
export type getControlsBasicQueryVariables = any;

export const GetControlsByUserDocument = parse(`query getControlsByUser(\$_eq: String = "") {
  control(where: { CreatedByUser: { _eq: \$_eq } }) {
    ...ControlParts
  }
}

fragment ControlParts on control {
  CreatedByUser
  ModifiedByUser
  Description
  Id
  CreatedAtTimestamp
  ModifiedAtTimestamp
  Title
  Type
  CustomAttributeData
  SequentialId
  schedule {
    ...ScheduleParts
  }
}

fragment ScheduleParts on schedule {
  Id
  Frequency
  ManualDueDate
  StartDate
  TimeToCompleteValue
  TimeToCompleteUnit
}`) as any;
export type GetControlsByUserQuery = any;
export type GetControlsByUserQueryVariables = any;
export type GetGetControlsByUserQuery = any;
export type getControlsByUserQuery = any;
export type getControlsByUserQueryVariables = any;

export const InsertChildControlDocument = parse(`mutation insertChildControl(\$object: InsertChildControlInput) {
  insertChildControl(object: \$object) {
    Id
  }
}`) as any;
export type InsertChildControlMutation = any;
export type InsertChildControlMutationVariables = any;
export type insertChildControlMutation = any;
export type insertChildControlMutationVariables = any;

export const RemoveParentControlsDocument = parse(`mutation removeParentControls(\$ParentId: uuid!, \$ControlIds: [uuid!]!) {
  delete_control_parent(
    where: { ParentId: { _eq: \$ParentId }, ControlId: { _in: \$ControlIds } }
  ) {
    affected_rows
  }
}`) as any;
export type RemoveParentControlsMutation = any;
export type RemoveParentControlsMutationVariables = any;
export type removeParentControlsMutation = any;
export type removeParentControlsMutationVariables = any;

export const UpdateControlDocument = parse(`mutation updateControl(\$object: UpdateChildControlInput) {
  updateChildControl(object: \$object) {
    affected_rows
  }
}`) as any;
export type UpdateControlMutation = any;
export type UpdateControlMutationVariables = any;
export type updateControlMutation = any;
export type updateControlMutationVariables = any;

export const ControlGroupPartsDocument = parse(`fragment ControlGroupParts on control_group {
  Description
  Id
  Owner
  ModifiedAtTimestamp
  CreatedAtTimestamp
  Title
  ModifiedByUser
  CreatedByUser
  CustomAttributeData
}`) as any;
export type ControlGroupPartsFragment = any;

export const DeleteControlGroupDocument = parse(`mutation deleteControlGroup(\$id: uuid!, \$original_timestamp: timestamptz) {
  delete_control_group(
    where: {
      Id: { _eq: \$id }
      ModifiedAtTimestamp: { _eq: \$original_timestamp }
    }
  ) {
    affected_rows
  }
}`) as any;
export type DeleteControlGroupMutation = any;
export type DeleteControlGroupMutationVariables = any;
export type deleteControlGroupMutation = any;
export type deleteControlGroupMutationVariables = any;

export const GetControlGroupAuditByIdDocument = parse(`query getControlGroupAuditById(\$_eq: uuid!) {
  control_group_audit(where: { Id: { _eq: \$_eq } }, order_by: {ModifiedAtTimestamp: desc}) {
    Description
    Id
    Owner
    ModifiedAtTimestamp
    CreatedAtTimestamp
    Title
    ModifiedByUser
    CreatedByUser
    CustomAttributeData
  }
}`) as any;
export type GetControlGroupAuditByIdQuery = any;
export type GetControlGroupAuditByIdQueryVariables = any;
export type GetGetControlGroupAuditByIdQuery = any;
export type getControlGroupAuditByIdQuery = any;
export type getControlGroupAuditByIdQueryVariables = any;

export const GetControlGroupByIdDocument = parse(`query getControlGroupById(\$_eq: uuid!) {
  control_group(where: { Id: { _eq: \$_eq } }) {
    ...ControlGroupParts
    ancestorContributors {
      ...AncestorContributorParts
    }
  }
}

fragment ControlGroupParts on control_group {
  Description
  Id
  Owner
  ModifiedAtTimestamp
  CreatedAtTimestamp
  Title
  ModifiedByUser
  CreatedByUser
  CustomAttributeData
}

fragment AncestorContributorParts on ancestor_contributor {
  ContributorType
  UserId
  Id
  AncestorId
  UserGroupId
  user {
    FriendlyName
  }
  user_group {
    Name
  }
}`) as any;
export type GetControlGroupByIdQuery = any;
export type GetControlGroupByIdQueryVariables = any;
export type GetGetControlGroupByIdQuery = any;
export type getControlGroupByIdQuery = any;
export type getControlGroupByIdQueryVariables = any;

export const GetControlGroupsDocument = parse(`query getControlGroups {
  control_group(order_by: { Title: asc }) {
    ...ControlGroupParts
  }
}

fragment ControlGroupParts on control_group {
  Description
  Id
  Owner
  ModifiedAtTimestamp
  CreatedAtTimestamp
  Title
  ModifiedByUser
  CreatedByUser
  CustomAttributeData
}`) as any;
export type GetControlGroupsQuery = any;
export type GetControlGroupsQueryVariables = any;
export type GetGetControlGroupsQuery = any;
export type getControlGroupsQuery = any;
export type getControlGroupsQueryVariables = any;

export const GetControlGroupsByTitleDocument = parse(`query getControlGroupsByTitle(\$title: String!) {
  control_group(where: { Title: { _eq: \$title } }) {
    ...ControlGroupParts
  }
}

fragment ControlGroupParts on control_group {
  Description
  Id
  Owner
  ModifiedAtTimestamp
  CreatedAtTimestamp
  Title
  ModifiedByUser
  CreatedByUser
  CustomAttributeData
}`) as any;
export type GetControlGroupsByTitleQuery = any;
export type GetControlGroupsByTitleQueryVariables = any;
export type GetGetControlGroupsByTitleQuery = any;
export type getControlGroupsByTitleQuery = any;
export type getControlGroupsByTitleQueryVariables = any;

export const GetControlGroupsFlatDocument = parse(`query getControlGroupsFlat {
  control_group {
    ...ControlGroupParts
    controls_aggregate {
      aggregate {
        count
      }
    }
    owner {
      FriendlyName
    }
    createdByUser {
      FriendlyName
    }
  }
}

fragment ControlGroupParts on control_group {
  Description
  Id
  Owner
  ModifiedAtTimestamp
  CreatedAtTimestamp
  Title
  ModifiedByUser
  CreatedByUser
  CustomAttributeData
}`) as any;
export type GetControlGroupsFlatQuery = any;
export type GetControlGroupsFlatQueryVariables = any;
export type GetGetControlGroupsFlatQuery = any;
export type getControlGroupsFlatQuery = any;
export type getControlGroupsFlatQueryVariables = any;

export const InsertControlGroupDocument = parse(`mutation insertControlGroup(
  \$Title: String!
  \$Description: String!
  \$Owner: String!
  \$CustomAttributeData: jsonb
) {
  insert_control_group_one(
    object: {
      Title: \$Title
      Description: \$Description
      Owner: \$Owner
      CustomAttributeData: \$CustomAttributeData
    }
  ) {
    Id
  }
}`) as any;
export type InsertControlGroupMutation = any;
export type InsertControlGroupMutationVariables = any;
export type insertControlGroupMutation = any;
export type insertControlGroupMutationVariables = any;

export const UpdateControlGroupDocument = parse(`mutation updateControlGroup(
  \$Description: String!
  \$Owner: String!
  \$Title: String!
  \$Id: uuid!
  \$OriginalTimestamp: timestamptz!
  \$CustomAttributeData: jsonb
) {
  update_control_group(
    where: {
      Id: { _eq: \$Id }
      ModifiedAtTimestamp: { _eq: \$OriginalTimestamp }
    }
    _set: {
      Description: \$Description
      Owner: \$Owner
      Title: \$Title
      CustomAttributeData: \$CustomAttributeData
    }
  ) {
    affected_rows
  }
}`) as any;
export type UpdateControlGroupMutation = any;
export type UpdateControlGroupMutationVariables = any;
export type updateControlGroupMutation = any;
export type updateControlGroupMutationVariables = any;

export const GetCustomAttributeSchemaAuditByIdDocument = parse(`query getCustomAttributeSchemaAuditById(\$Id: uuid!) {
  custom_attribute_schema_audit(where: { Id: { _eq: \$Id } }, order_by: {ModifiedAtTimestamp: desc}) {
    ModifiedByUser
    ModifiedAtTimestamp
    CreatedByUser
    CreatedAtTimestamp
    Id
    Schema
    Title
    UiSchema
  }
}`) as any;
export type GetCustomAttributeSchemaAuditByIdQuery = any;
export type GetCustomAttributeSchemaAuditByIdQueryVariables = any;
export type GetGetCustomAttributeSchemaAuditByIdQuery = any;
export type getCustomAttributeSchemaAuditByIdQuery = any;
export type getCustomAttributeSchemaAuditByIdQueryVariables = any;

export const DeleteCustomDatasourceDocument = parse(`mutation deleteCustomDatasource(\$Id: uuid!) {
  delete_custom_datasource_by_pk(Id: \$Id) {
    Id
  }
}`) as any;
export type DeleteCustomDatasourceMutation = any;
export type DeleteCustomDatasourceMutationVariables = any;
export type deleteCustomDatasourceMutation = any;
export type deleteCustomDatasourceMutationVariables = any;

export const GetCustomDatasourceByIdDocument = parse(`query getCustomDatasourceById(\$Id: uuid!) {
  custom_datasource_by_pk(Id: \$Id) {
    Title
    Id
    Filters
    Datasources
    Fields
    CreatedByUser
    ModifiedByUser
    CreatedAtTimestamp
    ModifiedAtTimestamp
  }
}`) as any;
export type GetCustomDatasourceByIdQuery = any;
export type GetCustomDatasourceByIdQueryVariables = any;
export type GetGetCustomDatasourceByIdQuery = any;
export type getCustomDatasourceByIdQuery = any;
export type getCustomDatasourceByIdQueryVariables = any;

export const GetCustomDatasourcesDocument = parse(`query getCustomDatasources {
  custom_datasource {
    Title
    Id
    Filters
    Datasources
    Fields
    CreatedByUser
    ModifiedByUser
    CreatedAtTimestamp
    ModifiedAtTimestamp
    modifiedByUser {
      FriendlyName
    }
    createdByUser {
      FriendlyName
    }
  }
}`) as any;
export type GetCustomDatasourcesQuery = any;
export type GetCustomDatasourcesQueryVariables = any;
export type GetGetCustomDatasourcesQuery = any;
export type getCustomDatasourcesQuery = any;
export type getCustomDatasourcesQueryVariables = any;

export const InsertCustomDataSourceDocument = parse(`mutation insertCustomDataSource(
  \$customDatasource: custom_datasource_insert_input!
) {
  insert_custom_datasource_one(object: \$customDatasource) {
    Id
  }
}`) as any;
export type InsertCustomDataSourceMutation = any;
export type InsertCustomDataSourceMutationVariables = any;
export type insertCustomDataSourceMutation = any;
export type insertCustomDataSourceMutationVariables = any;

export const UpdateCustomDatasourceDocument = parse(`mutation updateCustomDatasource(
  \$Id: uuid!
  \$Data: custom_datasource_set_input!
) {
  update_custom_datasource_by_pk(pk_columns: { Id: \$Id }, _set: \$Data) {
    Id
  }
}`) as any;
export type UpdateCustomDatasourceMutation = any;
export type UpdateCustomDatasourceMutationVariables = any;
export type updateCustomDatasourceMutation = any;
export type updateCustomDatasourceMutationVariables = any;

export const GetCustomRibbonAuditByIdDocument = parse(`query getCustomRibbonAuditById(\$Id: uuid!) {
  custom_ribbon_audit(where: { Id: { _eq: \$Id } }, order_by: {ModifiedAtTimestamp: desc}) {
    ModifiedByUser
    ModifiedAtTimestamp
    CreatedByUser
    CreatedAtTimestamp
    Id
    Filters
    ParentType
  }
}`) as any;
export type GetCustomRibbonAuditByIdQuery = any;
export type GetCustomRibbonAuditByIdQueryVariables = any;
export type GetGetCustomRibbonAuditByIdQuery = any;
export type getCustomRibbonAuditByIdQuery = any;
export type getCustomRibbonAuditByIdQueryVariables = any;

export const GetRibbonItemsByParentTypeDocument = parse(`query getRibbonItemsByParentType(\$parentType: parent_type_enum!) {
  custom_ribbon(where: { ParentType: { _eq: \$parentType } }) {
    Id
    ParentType
    Filters
    ModifiedAtTimestamp
  }
}`) as any;
export type GetRibbonItemsByParentTypeQuery = any;
export type GetRibbonItemsByParentTypeQueryVariables = any;
export type GetGetRibbonItemsByParentTypeQuery = any;
export type getRibbonItemsByParentTypeQuery = any;
export type getRibbonItemsByParentTypeQueryVariables = any;

export const InsertRibbonItemsByParentTypeDocument = parse(`mutation insertRibbonItemsByParentType(
  \$parentType: parent_type_enum!
  \$filters: jsonb!
) {
  insert_custom_ribbon_one(
    object: { ParentType: \$parentType, Filters: \$filters }
    on_conflict: {
      update_columns: [Filters]
      constraint: idx_customribbon_orgkey_parenttype
    }
  ) {
    Id
  }
}`) as any;
export type InsertRibbonItemsByParentTypeMutation = any;
export type InsertRibbonItemsByParentTypeMutationVariables = any;
export type insertRibbonItemsByParentTypeMutation = any;
export type insertRibbonItemsByParentTypeMutationVariables = any;

export const UpdateRibbonItemsByParentTypeDocument = parse(`mutation updateRibbonItemsByParentType(
  \$id: uuid
  \$originalTimestamp: timestamptz!
  \$parentType: parent_type_enum!
  \$filters: jsonb!
) {
  update_custom_ribbon(
    where: {
      Id: { _eq: \$id }
      ParentType: { _eq: \$parentType }
      ModifiedAtTimestamp: { _eq: \$originalTimestamp }
    }
    _set: { Filters: \$filters }
  ) {
    affected_rows
  }
}`) as any;
export type UpdateRibbonItemsByParentTypeMutation = any;
export type UpdateRibbonItemsByParentTypeMutationVariables = any;
export type updateRibbonItemsByParentTypeMutation = any;
export type updateRibbonItemsByParentTypeMutationVariables = any;

export const CustomRoleUserUpdateDocument = parse(`mutation customRoleUserUpdate(\$input: CustomRoleUserUpdateInputData) {
  customRoleUserUpdate(Input: \$input) {
    affected_rows
  }
}`) as any;
export type CustomRoleUserUpdateMutation = any;
export type CustomRoleUserUpdateMutationVariables = any;
export type customRoleUserUpdateMutation = any;
export type customRoleUserUpdateMutationVariables = any;

export const DeleteCustomRoleDocument = parse(`mutation deleteCustomRole(\$filter: custom_role_bool_exp!) {
  delete_custom_role(where: \$filter) {
    affected_rows
  }
}`) as any;
export type DeleteCustomRoleMutation = any;
export type DeleteCustomRoleMutationVariables = any;
export type deleteCustomRoleMutation = any;
export type deleteCustomRoleMutationVariables = any;

export const GetCustomRoleByIdDocument = parse(`query getCustomRoleById(\$Id: uuid) {
  custom_role(where: { Id: { _eq: \$Id } }) {
    Id
    RoleName
    Description
    CreatedAtTimestamp
    CreatedByUser
    ModifiedByUser
    ModifiedAtTimestamp
    customRoleUsers {
      UserId
      Id
    }
    customRoleAssignments {
      RoleTypeKey
      Id
    }
  }
}`) as any;
export type GetCustomRoleByIdQuery = any;
export type GetCustomRoleByIdQueryVariables = any;
export type GetGetCustomRoleByIdQuery = any;
export type getCustomRoleByIdQuery = any;
export type getCustomRoleByIdQueryVariables = any;

export const GetCustomRolesDocument = parse(`query getCustomRoles {
  custom_role {
    Id
    RoleName
    Description
    CreatedAtTimestamp
    CreatedByUser
    ModifiedByUser
    ModifiedAtTimestamp
    customRoleUsers_aggregate {
      aggregate {
        count
      }
    }
  }
}`) as any;
export type GetCustomRolesQuery = any;
export type GetCustomRolesQueryVariables = any;
export type GetGetCustomRolesQuery = any;
export type getCustomRolesQuery = any;
export type getCustomRolesQueryVariables = any;

export const InsertCustomRoleDocument = parse(`mutation insertCustomRole(\$input: CustomRoleInsertInputData) {
  customRoleInsert(Input: \$input) {
    Id
  }
}`) as any;
export type InsertCustomRoleMutation = any;
export type InsertCustomRoleMutationVariables = any;
export type insertCustomRoleMutation = any;
export type insertCustomRoleMutationVariables = any;

export const UpdateCustomRoleDocument = parse(`mutation updateCustomRole(\$input: CustomRoleUpdateInputData) {
  customRoleUpdate(Input: \$input) {
    affected_rows
  }
}`) as any;
export type UpdateCustomRoleMutation = any;
export type UpdateCustomRoleMutationVariables = any;
export type updateCustomRoleMutation = any;
export type updateCustomRoleMutationVariables = any;

export const DashboardPartsDocument = parse(`fragment DashboardParts on dashboard {
  Id
  Name
  Description
  Sharing
  Content
  CreatedByUser
}`) as any;
export type DashboardPartsFragment = any;

export const DeleteDashboardDocument = parse(`mutation deleteDashboard(\$Id: uuid!) {
  delete_dashboard_by_pk(Id: \$Id) {
    Id
  }
}`) as any;
export type DeleteDashboardMutation = any;
export type DeleteDashboardMutationVariables = any;
export type deleteDashboardMutation = any;
export type deleteDashboardMutationVariables = any;

export const GetDashboardAuditByIdDocument = parse(`query getDashboardAuditById(\$Id: uuid!) {
  dashboard_audit(where: {Id: {_eq: \$Id}}, order_by: {ModifiedAtTimestamp: desc}) {
    Id
    Name
    Description
    Sharing
    Content
    CreatedByUser
    CreatedAtTimestamp
    ModifiedByUser
    ModifiedAtTimestamp
  }
}`) as any;
export type GetDashboardAuditByIdQuery = any;
export type GetDashboardAuditByIdQueryVariables = any;
export type GetGetDashboardAuditByIdQuery = any;
export type getDashboardAuditByIdQuery = any;
export type getDashboardAuditByIdQueryVariables = any;

export const GetDashboardByIdDocument = parse(`query getDashboardById(\$Id: uuid!) {
  dashboard_by_pk(Id: \$Id) {
    ...DashboardParts
    owners {
      ...OwnerParts
    }
    ownerGroups {
      ...OwnerGroupParts
    }
    contributors {
      ...ContributorParts
    }
    contributorGroups {
      ...ContributorGroupParts
    }
    ancestorContributors {
      ...AncestorContributorParts
    }
  }
}

fragment DashboardParts on dashboard {
  Id
  Name
  Description
  Sharing
  Content
  CreatedByUser
}

fragment OwnerParts on owner {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment OwnerGroupParts on owner_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment ContributorParts on contributor {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment ContributorGroupParts on contributor_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment AncestorContributorParts on ancestor_contributor {
  ContributorType
  UserId
  Id
  AncestorId
  UserGroupId
  user {
    FriendlyName
  }
  user_group {
    Name
  }
}`) as any;
export type GetDashboardByIdQuery = any;
export type GetDashboardByIdQueryVariables = any;
export type GetGetDashboardByIdQuery = any;
export type getDashboardByIdQuery = any;
export type getDashboardByIdQueryVariables = any;

export const GetDashboardsDocument = parse(`query getDashboards {
  dashboard {
    ...DashboardParts
  }
}

fragment DashboardParts on dashboard {
  Id
  Name
  Description
  Sharing
  Content
  CreatedByUser
}`) as any;
export type GetDashboardsQuery = any;
export type GetDashboardsQueryVariables = any;
export type GetGetDashboardsQuery = any;
export type getDashboardsQuery = any;
export type getDashboardsQueryVariables = any;

export const GetMyItemsDashboardDocument = parse(`query getMyItemsDashboard(
  \$userId: String!
  \$actionFilterConditions: action_bool_exp!
  \$riskFilterConditions: risk_bool_exp!
  \$indicatorFilterConditions: indicator_bool_exp!
  \$documentFilterConditions: document_bool_exp!
  \$assessmentFilterConditions: assessment_bool_exp!
  \$controlFilterConditions: control_bool_exp!
  \$issueFilterConditions: issue_bool_exp!
  \$assessmentActivityFilterConditions: assessment_activity_bool_exp!
  \$obligationFilterConditions: obligation_bool_exp!
) {
  change_request {
    ...MyItemsChangeRequestParts
  }

  action(
    where: {
      _or: [\$actionFilterConditions]
      _and: [{ Status: { _neq: closed } }]
    }
  ) {
    Id
    ownerGroups {
      ...MyItemsOwnerGroupParts
    }
    contributorGroups {
      ...MyItemsContributorGroupParts
    }
  }

  risk(where: \$riskFilterConditions) {
    Id
    ownerGroups {
      ...MyItemsOwnerGroupParts
    }
    contributorGroups {
      ...MyItemsContributorGroupParts
    }
  }

  indicator(where: \$indicatorFilterConditions) {
    Id
    ownerGroups {
      ...MyItemsOwnerGroupParts
    }
    contributorGroups {
      ...MyItemsContributorGroupParts
    }
  }

  document(where: \$documentFilterConditions) {
    Id
    ownerGroups {
      ...MyItemsOwnerGroupParts
    }
    contributorGroups {
      ...MyItemsContributorGroupParts
    }
  }

  assessment(where: \$assessmentFilterConditions) {
    Id
    ownerGroups {
      ...MyItemsOwnerGroupParts
    }
    contributorGroups {
      ...MyItemsContributorGroupParts
    }
  }

  assessment_activity(
    where: {
      _or: [\$assessmentActivityFilterConditions]
      _and: [{ IsRCSA: { _eq: true } }, { Status: { _neq: complete } }]
    }
  ) {
    Id
    ownerGroups {
      ...MyItemsOwnerGroupParts
    }
  }

  control(where: \$controlFilterConditions) {
    Id
    ownerGroups {
      ...MyItemsOwnerGroupParts
    }
    contributorGroups {
      ...MyItemsContributorGroupParts
    }
  }

  issue(
    where: {
      _or: [\$issueFilterConditions]
      _and: [
        {
          _or: [
            { _not: { assessment: {} } }
            { assessment: { Status: { _neq: closed } } }
          ]
        }
      ]
    }
  ) {
    Id
    assessment {
      Status
    }
    ownerGroups {
      ...MyItemsOwnerGroupParts
    }
    contributorGroups {
      ...MyItemsContributorGroupParts
    }
  }

  attestation_record_aggregate(
    where: {
      _and: [
        { UserId: { _eq: \$userId } }
        { AttestationStatus: { _eq: pending } }
      ]
    }
  ) {
    aggregate {
      count
    }
  }

  obligation(where: \$obligationFilterConditions) {
    Id
    ownerGroups {
      ...MyItemsOwnerGroupParts
    }
    contributorGroups {
      ...MyItemsContributorGroupParts
    }
  }
}

fragment MyItemsChangeRequestParts on change_request {
  ChangeRequestStatus
  CreatedAtTimestamp
  Id
  responses {
    Approved
    approver {
      OwnerApprover
      level {
        Id
        ApprovalRuleType
      }
      group {
        users {
          UserId
        }
      }
      user {
        Id
      }
    }
  }
  parent {
    Id
    SequentialId
    ObjectType
    risk {
      Id
      Title
    }

    documentFile {
      Version
      parent {
        Id
        Title
      }
    }

    action {
      Id
      Title
    }

    issue_assessment {
      parent {
        Id
        Title
      }
    }

    acceptance {
      Id
      Title
    }

    control {
      Id
      Title
    }

    issue {
      Id
      Title
    }
  }
  currentUserOwnerList: parentOwnerAndContributors(
    where: { ContributorType: { _eq: "owner" }, UserId: { _eq: \$userId } }
    distinct_on: [UserId]
  ) {
    UserId
  }
}

fragment MyItemsOwnerGroupParts on owner_group {
  UserGroupId
  group {
    users {
      UserId
    }
  }
}

fragment MyItemsContributorGroupParts on contributor_group {
  UserGroupId
  group {
    users {
      UserId
    }
  }
}`) as any;
export type GetMyItemsDashboardQuery = any;
export type GetMyItemsDashboardQueryVariables = any;
export type GetGetMyItemsDashboardQuery = any;
export type getMyItemsDashboardQuery = any;
export type getMyItemsDashboardQueryVariables = any;

export const InsertDashboardDocument = parse(`mutation insertDashboard(
  \$Name: String!
  \$Description: String
  \$Sharing: dashboard_sharing_type_enum_action!
  \$Content: jsonb!
  \$ContributorGroupIds: [uuid!]!
  \$ContributorUserIds: [String!]!
) {
  insertChildDashboard(
    Name: \$Name
    Description: \$Description
    Sharing: \$Sharing
    Content: \$Content
    ContributorUserIds: \$ContributorUserIds
    ContributorGroupIds: \$ContributorGroupIds
  ) {
    Id
  }
}`) as any;
export type InsertDashboardMutation = any;
export type InsertDashboardMutationVariables = any;
export type insertDashboardMutation = any;
export type insertDashboardMutationVariables = any;

export const MyItemsAncestorContributorsPartsDocument = parse(`fragment MyItemsAncestorContributorsParts on ancestor_contributor {
  ContributorType
  Id
  AncestorId
  UserGroupId
}`) as any;
export type MyItemsAncestorContributorsPartsFragment = any;

export const MyItemsChangeRequestPartsDocument = parse(`fragment MyItemsChangeRequestParts on change_request {
  ChangeRequestStatus
  CreatedAtTimestamp
  Id
  responses {
    Approved
    approver {
      OwnerApprover
      level {
        Id
        ApprovalRuleType
      }
      group {
        users {
          UserId
        }
      }
      user {
        Id
      }
    }
  }
  parent {
    Id
    SequentialId
    ObjectType
    risk {
      Id
      Title
    }

    documentFile {
      Version
      parent {
        Id
        Title
      }
    }

    action {
      Id
      Title
    }

    issue_assessment {
      parent {
        Id
        Title
      }
    }

    acceptance {
      Id
      Title
    }

    control {
      Id
      Title
    }

    issue {
      Id
      Title
    }
  }
  currentUserOwnerList: parentOwnerAndContributors(
    where: { ContributorType: { _eq: "owner" }, UserId: { _eq: \$userId } }
    distinct_on: [UserId]
  ) {
    UserId
  }
}`) as any;
export type MyItemsChangeRequestPartsFragment = any;

export const MyItemsContributorGroupPartsDocument = parse(`fragment MyItemsContributorGroupParts on contributor_group {
  UserGroupId
  group {
    users {
      UserId
    }
  }
}`) as any;
export type MyItemsContributorGroupPartsFragment = any;

export const MyItemsOwnerGroupPartsDocument = parse(`fragment MyItemsOwnerGroupParts on owner_group {
  UserGroupId
  group {
    users {
      UserId
    }
  }
}`) as any;
export type MyItemsOwnerGroupPartsFragment = any;

export const UpdateDashboardDocument = parse(`mutation updateDashboard(
  \$Id: uuid!
  \$Name: String!
  \$Description: String
  \$Sharing: dashboard_sharing_type_enum_action!
  \$Content: jsonb!
  \$ContributorUserIds: [String!]!
  \$ContributorGroupIds: [uuid!]!
) {
  updateChildDashboard(
    Id: \$Id
    Content: \$Content
    Description: \$Description
    Name: \$Name
    Sharing: \$Sharing
    ContributorUserIds: \$ContributorUserIds
    ContributorGroupIds: \$ContributorGroupIds
  ) {
    Id
  }
}`) as any;
export type UpdateDashboardMutation = any;
export type UpdateDashboardMutationVariables = any;
export type updateDashboardMutation = any;
export type updateDashboardMutationVariables = any;

export const DataExportCreateScheduleDocument = parse(`mutation dataExportCreateSchedule(
  \$object: DataExportCreateScheduleInput!
) {
  dataExportCreateSchedule(
    object: \$object
  ) {
    message
  }
}`) as any;
export type DataExportCreateScheduleMutation = any;
export type DataExportCreateScheduleMutationVariables = any;
export type dataExportCreateScheduleMutation = any;
export type dataExportCreateScheduleMutationVariables = any;

export const DataExportOneOffExportDocument = parse(`query dataExportOneOffExport {
  dataExportOneOffExport {
    message
    downloadUrl
    expiresInSeconds
  }
}`) as any;
export type DataExportOneOffExportQuery = any;
export type DataExportOneOffExportQueryVariables = any;
export type GetDataExportOneOffExportQuery = any;
export type dataExportOneOffExportQuery = any;
export type dataExportOneOffExportQueryVariables = any;

export const GetActiveDataExportScheduleDocument = parse(`subscription getActiveDataExportSchedule {
  data_export_schedule(
    where: { Status: { _eq: active } }
    order_by: { CreatedAtTimestamp: desc }
    limit: 1
  ) {
    Id
    Frequency
    StartTimestamp
    EndTimestamp
    StorageType
  }
}`) as any;
export type GetActiveDataExportScheduleSubscription = any;
export type GetActiveDataExportScheduleSubscriptionVariables = any;

export const GetDataExportScheduleExecutionsDocument = parse(`subscription getDataExportScheduleExecutions {
  data_export_schedule_execution {
    ParentId
    ExecutionTimestamp
    Status
    Errors
    dataExportSchedule {
      Frequency
      StartTimestamp
      EndTimestamp
    }
  }
}`) as any;
export type GetDataExportScheduleExecutionsSubscription = any;
export type GetDataExportScheduleExecutionsSubscriptionVariables = any;

export const DataExportTestScheduleDocument = parse(`mutation dataExportTestSchedule(\$object: DataExportTestScheduleInput!) {
  dataExportTestSchedule(object: \$object) {
    message
  }
}`) as any;
export type DataExportTestScheduleMutation = any;
export type DataExportTestScheduleMutationVariables = any;
export type dataExportTestScheduleMutation = any;
export type dataExportTestScheduleMutationVariables = any;

export const DataImportStartImportDocument = parse(`mutation dataImportStartImport(\$Id: uuid!) {
  dataImportStartImport(Id: \$Id) {
    message
  }
}`) as any;
export type DataImportStartImportMutation = any;
export type DataImportStartImportMutationVariables = any;
export type dataImportStartImportMutation = any;
export type dataImportStartImportMutationVariables = any;

export const DataImportValidateDocument = parse(`mutation dataImportValidate(\$Id: uuid!) {
  dataImportValidate(Id: \$Id) {
    message
  }
}`) as any;
export type DataImportValidateMutation = any;
export type DataImportValidateMutationVariables = any;
export type dataImportValidateMutation = any;
export type dataImportValidateMutationVariables = any;

export const DeleteDataImportByIdDocument = parse(`mutation deleteDataImportById(\$id: uuid!) {
  delete_data_import(where: { Id: { _eq: \$id } }) {
    affected_rows
  }
}`) as any;
export type DeleteDataImportByIdMutation = any;
export type DeleteDataImportByIdMutationVariables = any;
export type deleteDataImportByIdMutation = any;
export type deleteDataImportByIdMutationVariables = any;

export const GetDataImportByIdDocument = parse(`query getDataImportById(\$id: uuid!) {
  data_import(where: { Id: { _eq: \$id } }) {
    Id
    files {
      ...RelationFileParts
    }
  }
}

fragment RelationFileParts on relation_file {
  ParentId
  ChangeRequestFileOperation
  file {
    ...FileParts
  }
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}`) as any;
export type GetDataImportByIdQuery = any;
export type GetDataImportByIdQueryVariables = any;
export type GetGetDataImportByIdQuery = any;
export type getDataImportByIdQuery = any;
export type getDataImportByIdQueryVariables = any;

export const GetDataImportErrorsDocument = parse(`query getDataImportErrors(\$dataImportId: uuid) {
  data_import_error(where: { DataImportId: { _eq: \$dataImportId } }) {
    RowNumber
    ImportObject
    DataImportId
    Message
  }
}`) as any;
export type GetDataImportErrorsQuery = any;
export type GetDataImportErrorsQueryVariables = any;
export type GetGetDataImportErrorsQuery = any;
export type getDataImportErrorsQuery = any;
export type getDataImportErrorsQueryVariables = any;

export const GetDataImportStatusDocument = parse(`subscription getDataImportStatus(\$id: uuid!) {
  data_import(where: { Id: { _eq: \$id } }) {
    Status
  }
}`) as any;
export type GetDataImportStatusSubscription = any;
export type GetDataImportStatusSubscriptionVariables = any;

export const GetDataImportsDocument = parse(`query getDataImports {
  data_import {
    Id
    Status
    CreatedAtTimestamp
    ModifiedAtTimestamp
    modifiedByUser {
      FriendlyName
    }
    createdByUser {
      FriendlyName
    }
  }
}`) as any;
export type GetDataImportsQuery = any;
export type GetDataImportsQueryVariables = any;
export type GetGetDataImportsQuery = any;
export type getDataImportsQuery = any;
export type getDataImportsQueryVariables = any;

export const InsertDataImportDocument = parse(`mutation insertDataImport {
  insert_data_import_one(object: {}) {
    Id
  }
}`) as any;
export type InsertDataImportMutation = any;
export type InsertDataImportMutationVariables = any;
export type insertDataImportMutation = any;
export type insertDataImportMutationVariables = any;

export const DeleteDepartmentTypesDocument = parse(`mutation deleteDepartmentTypes(\$Ids: [uuid!]!) {
  deleteDepartmentTypeApi(Ids: \$Ids) {
    affected_rows
  }
}`) as any;
export type DeleteDepartmentTypesMutation = any;
export type DeleteDepartmentTypesMutationVariables = any;
export type deleteDepartmentTypesMutation = any;
export type deleteDepartmentTypesMutationVariables = any;

export const DepartmentPartsDocument = parse(`fragment DepartmentParts on department {
  type {
    Description
    Name
  }
  ParentId
  DepartmentTypeId
}`) as any;
export type DepartmentPartsFragment = any;

export const GetDepartmentAuditByIdDocument = parse(`query getDepartmentAuditById(\$DepartmentTypeId: uuid!, \$ParentId: uuid!) {
  department_audit(where: {DepartmentTypeId: {_eq: \$DepartmentTypeId}, ParentId: {_eq: \$ParentId}}, order_by: {ModifiedAtTimestamp: desc}) {
    DepartmentTypeId
    CreatedAtTimestamp
    ModifiedAtTimestamp
    CreatedByUser
    ModifiedByUser
  }
}`) as any;
export type GetDepartmentAuditByIdQuery = any;
export type GetDepartmentAuditByIdQueryVariables = any;
export type GetGetDepartmentAuditByIdQuery = any;
export type getDepartmentAuditByIdQuery = any;
export type getDepartmentAuditByIdQueryVariables = any;

export const GetDepartmentTypeByIdDocument = parse(`query GetDepartmentTypeById(\$Id: uuid) {
  department_type(where: { DepartmentTypeId: { _eq: \$Id } }) {
    DepartmentTypeId
    Name
    Description
    ModifiedAtTimestamp
    DepartmentTypeGroupId
    department_type_group {
      Id
      Name
    }
  }
}`) as any;
export type GetDepartmentTypeByIdQuery = any;
export type GetDepartmentTypeByIdQueryVariables = any;
export type GetGetDepartmentTypeByIdQuery = any;

export const GetDepartmentTypesByNameDocument = parse(`query getDepartmentTypesByName(\$Name: String!) {
  department_type(where: { Name: { _eq: \$Name } }) {
    Name
    DepartmentTypeId
  }
}`) as any;
export type GetDepartmentTypesByNameQuery = any;
export type GetDepartmentTypesByNameQueryVariables = any;
export type GetGetDepartmentTypesByNameQuery = any;
export type getDepartmentTypesByNameQuery = any;
export type getDepartmentTypesByNameQueryVariables = any;

export const GetDepartmentTypeGroupsDocument = parse(`query getDepartmentTypeGroups {
  department_type_group(order_by: { Name: asc }) {
    Id
    Name
  }
}`) as any;
export type GetDepartmentTypeGroupsQuery = any;
export type GetDepartmentTypeGroupsQueryVariables = any;
export type GetGetDepartmentTypeGroupsQuery = any;
export type getDepartmentTypeGroupsQuery = any;
export type getDepartmentTypeGroupsQueryVariables = any;

export const GetDepartmentsDocument = parse(`query getDepartments {
  department_type(order_by: { Name: asc }) {
    DepartmentTypeId
    Name
    Description
    CreatedAtTimestamp
    ModifiedAtTimestamp
    createdByUser {
      FriendlyName
    }
    modifiedByUser {
      FriendlyName
    }
    department_type_group {
      Id
      Name
    }
  }
}`) as any;
export type GetDepartmentsQuery = any;
export type GetDepartmentsQueryVariables = any;
export type GetGetDepartmentsQuery = any;
export type getDepartmentsQuery = any;
export type getDepartmentsQueryVariables = any;

export const InsertDepartmentTypeGroupByNameDocument = parse(`mutation InsertDepartmentTypeGroupByName(\$Name: String) {
  insert_department_type_group_one(
    object: { Name: \$Name }
    on_conflict: {
      constraint: DepartmentTypeGroup_pkey
      update_columns: Name
      where: { Name: { _eq: \$Name } }
    }
  ) {
    Id
  }
}`) as any;
export type InsertDepartmentTypeGroupByNameMutation = any;
export type InsertDepartmentTypeGroupByNameMutationVariables = any;

export const InsertDepartmentTypeWithGroupNameDocument = parse(`mutation insertDepartmentTypeWithGroupName(
  \$Name: String!
  \$Description: String
  \$DepartmentGroupName: String
) {
  insert_department_type_one(
    object: {
      Name: \$Name
      Description: \$Description
      department_type_group: {
        data: { Name: \$DepartmentGroupName }
        on_conflict: {
          constraint: DepartmentTypeGroup_pkey
          update_columns: Name
        }
      }
    }
  ) {
    DepartmentTypeId
  }
}`) as any;
export type InsertDepartmentTypeWithGroupNameMutation = any;
export type InsertDepartmentTypeWithGroupNameMutationVariables = any;
export type insertDepartmentTypeWithGroupNameMutation = any;
export type insertDepartmentTypeWithGroupNameMutationVariables = any;

export const InsertDepartmentTypeWithOptionalGroupIdDocument = parse(`mutation insertDepartmentTypeWithOptionalGroupId(
  \$Name: String!
  \$Description: String
  \$DepartmentTypeGroupId: uuid
) {
  insert_department_type_one(
    object: {
      Name: \$Name
      Description: \$Description
      DepartmentTypeGroupId: \$DepartmentTypeGroupId
    }
  ) {
    DepartmentTypeId
  }
}`) as any;
export type InsertDepartmentTypeWithOptionalGroupIdMutation = any;
export type InsertDepartmentTypeWithOptionalGroupIdMutationVariables = any;
export type insertDepartmentTypeWithOptionalGroupIdMutation = any;
export type insertDepartmentTypeWithOptionalGroupIdMutationVariables = any;

export const UpdateDepartmentTypeDocument = parse(`mutation UpdateDepartmentType(
  \$DepartmentTypeId: uuid!
  \$Name: String
  \$Description: String
  \$DepartmentTypeGroupId: uuid
  \$OriginalTimestamp: timestamptz
) {
  update_department_type(
    where: {
      DepartmentTypeId: { _eq: \$DepartmentTypeId }
      _and: { ModifiedAtTimestamp: { _eq: \$OriginalTimestamp } }
    }
    _set: {
      Name: \$Name
      Description: \$Description
      DepartmentTypeGroupId: \$DepartmentTypeGroupId
    }
  ) {
    affected_rows
  }
}`) as any;
export type UpdateDepartmentTypeMutation = any;
export type UpdateDepartmentTypeMutationVariables = any;

export const DeleteDocumentDocument = parse(`mutation deleteDocument(\$id: uuid!) {
  deleteDocumentById(Id: \$id) {
    affected_rows
  }
}`) as any;
export type DeleteDocumentMutation = any;
export type DeleteDocumentMutationVariables = any;
export type deleteDocumentMutation = any;
export type deleteDocumentMutationVariables = any;

export const DocumentPartsDocument = parse(`fragment DocumentParts on document {
  Id
  Title
  DocumentType
  Purpose
  ParentDocument
  CreatedByUser
  ModifiedByUser
  CreatedAtTimestamp
  ModifiedAtTimestamp
  CustomAttributeData
  SequentialId
  schedule {
    ...ScheduleParts
  }
}

fragment ScheduleParts on schedule {
  Id
  Frequency
  ManualDueDate
  StartDate
  TimeToCompleteValue
  TimeToCompleteUnit
}`) as any;
export type DocumentPartsFragment = any;

export const GetDocumentAuditByIdDocument = parse(`query getDocumentAuditById(\$id: uuid!) {
  document_audit(
    where: { Id: { _eq: \$id } }
    order_by: { ModifiedAtTimestamp: desc }
  ) {
    Id
    Title
    DocumentType
    Purpose
    ParentDocument
    CreatedByUser
    ModifiedByUser
    CreatedAtTimestamp
    ModifiedAtTimestamp
    CustomAttributeData
    SequentialId
  }
}`) as any;
export type GetDocumentAuditByIdQuery = any;
export type GetDocumentAuditByIdQueryVariables = any;
export type GetGetDocumentAuditByIdQuery = any;
export type getDocumentAuditByIdQuery = any;
export type getDocumentAuditByIdQueryVariables = any;

export const GetDocumentByIdDocument = parse(`query getDocumentById(\$id: uuid!) {
  document(where: { Id: { _eq: \$id } }) {
    ...DocumentParts
    tags {
      ...TagParts
    }
    scheduleState {
      LatestDate
    }
    departments {
      ...DepartmentParts
    }
    linkedDocuments {
      LinkedDocumentId
      child {
        Title
      }
    }
    attestationConfig {
      ...AttestationConfigParts
    }
    owners {
      ...OwnerParts
    }
    contributors {
      ...ContributorParts
    }
    ownerGroups {
      ...OwnerGroupParts
    }
    contributorGroups {
      ...ContributorGroupParts
    }
    ancestorContributors {
      ...AncestorContributorParts
    }
    latestDraftVersion: documentFiles(
      where: { Status: { _in: [draft, pending_approval] } }
      order_by: { CreatedAtTimestamp: desc }
      limit: 1
    ) {
      Id
      Status
    }
    latestPublishedVersion: documentFiles(
      where: { Status: { _in: [published, archived] } }
      order_by: { CreatedAtTimestamp: desc }
      limit: 1
    ) {
      Id
      Status
    }
    parent {
      Title
    }
  }
}

fragment DocumentParts on document {
  Id
  Title
  DocumentType
  Purpose
  ParentDocument
  CreatedByUser
  ModifiedByUser
  CreatedAtTimestamp
  ModifiedAtTimestamp
  CustomAttributeData
  SequentialId
  schedule {
    ...ScheduleParts
  }
}

fragment ScheduleParts on schedule {
  Id
  Frequency
  ManualDueDate
  StartDate
  TimeToCompleteValue
  TimeToCompleteUnit
}

fragment TagParts on tag {
  type {
    Description
    Name
  }
  ParentId
  TagTypeId
}

fragment DepartmentParts on department {
  type {
    Description
    Name
  }
  ParentId
  DepartmentTypeId
}

fragment AttestationConfigParts on attestation_config {
  RequireGlobalAttestation
  AttestationTimeLimit
  PromptText
  groups {
    ...AttestationGroupParts
  }
}

fragment AttestationGroupParts on attestation_group {
  GroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment OwnerParts on owner {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment ContributorParts on contributor {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment OwnerGroupParts on owner_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment ContributorGroupParts on contributor_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment AncestorContributorParts on ancestor_contributor {
  ContributorType
  UserId
  Id
  AncestorId
  UserGroupId
  user {
    FriendlyName
  }
  user_group {
    Name
  }
}`) as any;
export type GetDocumentByIdQuery = any;
export type GetDocumentByIdQueryVariables = any;
export type GetGetDocumentByIdQuery = any;
export type getDocumentByIdQuery = any;
export type getDocumentByIdQueryVariables = any;

export const GetDocumentListDocument = parse(`query getDocumentList {
  document(order_by: { Title: asc }) {
    Id
    Title
  }
}`) as any;
export type GetDocumentListQuery = any;
export type GetDocumentListQueryVariables = any;
export type GetGetDocumentListQuery = any;
export type getDocumentListQuery = any;
export type getDocumentListQueryVariables = any;

export const GetDocumentsDocument = parse(`query getDocuments(
  \$where: document_bool_exp! = {}
  \$filesWhere: document_file_bool_exp = {}
  \$documentAssessmentResultsWhere: document_assessment_result_bool_exp = {}
  \$includeAssessmentResultsHistory: Boolean = false
) {
  document(where: \$where) {
    ...DocumentParts
    parent {
      Title
    }
    scheduleState {
      LatestDate
      DueDate
      OverdueDate
    }
    owners {
      ...OwnerParts
    }
    ownerGroups {
      ...OwnerGroupParts
    }
    contributors {
      ...ContributorParts
    }
    contributorGroups {
      ...ContributorGroupParts
    }
    modifiedByUser {
      FriendlyName
    }
    createdByUser {
      FriendlyName
    }
    tags {
      ...TagParts
    }
    departments {
      ...DepartmentParts
    }
    documentFiles(
      order_by: { CreatedAtTimestamp: desc }
      limit: 1
      where: \$filesWhere
    ) {
      Status
      ReviewDate
      NextReviewDate
      changeRequests(
        distinct_on: [ChangeRequestStatus]
        order_by: [{ ChangeRequestStatus: asc }, { ModifiedAtTimestamp: desc }]
      ) {
        ChangeRequestStatus
        ModifiedAtTimestamp
      }
    }
    latestPublishedVersion: documentFiles(
      where: { PublishedDate: { _is_null: false } }
      order_by: { PublishedDate: desc }
      limit: 1
    ) {
      PublishedDate
    }
    assessmentResults(
      where: {
        documentAssessmentResult: {
          _and: [
            { RatingType: { _in: ["assessment", "rating"] } }
            \$documentAssessmentResultsWhere
          ]
        }
      }
      order_by: [
        { documentAssessmentResult: { TestDate: desc_nulls_last } }
        { documentAssessmentResult: { CreatedAtTimestamp: desc_nulls_last } }
      ]
    ) @include(if: \$includeAssessmentResultsHistory) {
      ParentId
      documentAssessmentResult {
        Id
        Rating
        TestDate
        CreatedAtTimestamp
      }
    }
  }
  assessment_result_parent(
    where: {
      documentAssessmentResult: {
        RatingType: { _in: ["assessment", "rating"] }
      }
    }
    distinct_on: [ParentId]
    order_by: [
      { ParentId: desc }
      {
        documentAssessmentResult: {
          TestDate: desc_nulls_last
          CreatedAtTimestamp: desc_nulls_last
        }
      }
    ]
  ) {
    documentAssessmentResult {
      parents {
        ParentId
      }
      Id
      Rating
      CustomAttributeData
    }
  }
}

fragment DocumentParts on document {
  Id
  Title
  DocumentType
  Purpose
  ParentDocument
  CreatedByUser
  ModifiedByUser
  CreatedAtTimestamp
  ModifiedAtTimestamp
  CustomAttributeData
  SequentialId
  schedule {
    ...ScheduleParts
  }
}

fragment ScheduleParts on schedule {
  Id
  Frequency
  ManualDueDate
  StartDate
  TimeToCompleteValue
  TimeToCompleteUnit
}

fragment OwnerParts on owner {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment OwnerGroupParts on owner_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment ContributorParts on contributor {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment ContributorGroupParts on contributor_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment TagParts on tag {
  type {
    Description
    Name
  }
  ParentId
  TagTypeId
}

fragment DepartmentParts on department {
  type {
    Description
    Name
  }
  ParentId
  DepartmentTypeId
}`) as any;
export type GetDocumentsQuery = any;
export type GetDocumentsQueryVariables = any;
export type GetGetDocumentsQuery = any;
export type getDocumentsQuery = any;
export type getDocumentsQueryVariables = any;

export const InsertDocumentDocument = parse(`mutation insertDocument(\$object: InsertChildDocumentInput) {
  insertChildDocument(object: \$object) {
    Id
  }
}`) as any;
export type InsertDocumentMutation = any;
export type InsertDocumentMutationVariables = any;
export type insertDocumentMutation = any;
export type insertDocumentMutationVariables = any;

export const UpdateDocumentDocument = parse(`mutation updateDocument(\$object: UpdateChildDocumentInput) {
  updateChildDocument(object: \$object) {
    Id
  }
}`) as any;
export type UpdateDocumentMutation = any;
export type UpdateDocumentMutationVariables = any;
export type updateDocumentMutation = any;
export type updateDocumentMutationVariables = any;

export const DocumentRelationFilePartsDocument = parse(`fragment DocumentRelationFileParts on document_file {
  CustomAttributeData
  CreatedAtTimestamp
  CreatedByUser
  FileId
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  NextReviewDate
  ParentDocumentId
  ReasonForReview
  ReviewDate
  ReviewedBy
  Status
  Summary
  Version
  Type
}`) as any;
export type DocumentRelationFilePartsFragment = any;

export const PublicDocumentRelationFilePartsDocument = parse(`fragment PublicDocumentRelationFileParts on document_file {
  CustomAttributeData
  CreatedAtTimestamp
  CreatedByUser
  FileId
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  NextReviewDate
  ParentDocumentId
  ReasonForReview
  ReviewDate
  ReviewedBy
  Status
  Summary
  Version
  Type
  PublishedDate
}`) as any;
export type PublicDocumentRelationFilePartsFragment = any;

export const DeleteDocumentFilesDocument = parse(`mutation deleteDocumentFiles(\$documentFileIds: [uuid!]!) {
  delete_file(where: { documentFile: { Id: { _in: \$documentFileIds } } }) {
    affected_rows
  }

  delete_document_file(where: { Id: { _in: \$documentFileIds } }) {
    affected_rows
  }
}`) as any;
export type DeleteDocumentFilesMutation = any;
export type DeleteDocumentFilesMutationVariables = any;
export type deleteDocumentFilesMutation = any;
export type deleteDocumentFilesMutationVariables = any;

export const GetDocumentFileAuditByIdDocument = parse(`query getDocumentFileAuditById(\$id: uuid!) {
  document_file_audit(where: { Id: { _eq: \$id } }, order_by: {ModifiedAtTimestamp: desc}) {
    CustomAttributeData
    CreatedAtTimestamp
    CreatedByUser
    FileId
    Id
    ModifiedAtTimestamp
    ModifiedByUser
    NextReviewDate
    ParentDocumentId
    ReasonForReview
    ReviewDate
    ReviewedBy
    Status
    Summary
    Version
    Type
  }
}`) as any;
export type GetDocumentFileAuditByIdQuery = any;
export type GetDocumentFileAuditByIdQueryVariables = any;
export type GetGetDocumentFileAuditByIdQuery = any;
export type getDocumentFileAuditByIdQuery = any;
export type getDocumentFileAuditByIdQueryVariables = any;

export const GetDocumentFileByIdDocument = parse(`query getDocumentFileById(\$id: uuid!) {
  document_file(where: { Id: { _eq: \$id } }) {
    ...DocumentRelationFileParts
    Content
    Link
    Version
    file {
      ...FileParts
    }
    parent {
      Id
      Title
      ownerGroups {
        ...OwnerGroupParts
      }
      owners {
        ...OwnerParts
      }
    }
    changeRequests(
      distinct_on: [ChangeRequestStatus]
      order_by: [{ ChangeRequestStatus: asc }, { ModifiedAtTimestamp: desc }]
    ) {
      ChangeRequestStatus
      ModifiedAtTimestamp
    }
  }
}

fragment DocumentRelationFileParts on document_file {
  CustomAttributeData
  CreatedAtTimestamp
  CreatedByUser
  FileId
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  NextReviewDate
  ParentDocumentId
  ReasonForReview
  ReviewDate
  ReviewedBy
  Status
  Summary
  Version
  Type
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}

fragment OwnerGroupParts on owner_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment OwnerParts on owner {
  UserId
  user {
    FriendlyName
    Id
  }
}`) as any;
export type GetDocumentFileByIdQuery = any;
export type GetDocumentFileByIdQueryVariables = any;
export type GetGetDocumentFileByIdQuery = any;
export type getDocumentFileByIdQuery = any;
export type getDocumentFileByIdQueryVariables = any;

export const GetDocumentFilesByDocumentIdDocument = parse(`query getDocumentFilesByDocumentId(\$documentId: uuid!) {
  document_file(where: { ParentDocumentId: { _eq: \$documentId } }) {
    ...DocumentRelationFileParts
    Content
    Link
    ModifiedAtTimestamp
    file {
      ...FileParts
    }
    reviewedBy {
      FriendlyName
    }
    changeRequests(
      distinct_on: [ChangeRequestStatus]
      order_by: [{ ChangeRequestStatus: asc }, { ModifiedAtTimestamp: desc }]
    ) {
      ChangeRequestStatus
      ModifiedAtTimestamp
    }
  }
}

fragment DocumentRelationFileParts on document_file {
  CustomAttributeData
  CreatedAtTimestamp
  CreatedByUser
  FileId
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  NextReviewDate
  ParentDocumentId
  ReasonForReview
  ReviewDate
  ReviewedBy
  Status
  Summary
  Version
  Type
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}`) as any;
export type GetDocumentFilesByDocumentIdQuery = any;
export type GetDocumentFilesByDocumentIdQueryVariables = any;
export type GetGetDocumentFilesByDocumentIdQuery = any;
export type getDocumentFilesByDocumentIdQuery = any;
export type getDocumentFilesByDocumentIdQueryVariables = any;

export const GetDocumentFileDocument = parse(`query getDocumentFile(\$where: document_file_bool_exp) {
  document_file(
    where: \$where
    order_by: { CreatedAtTimestamp: desc }
    limit: 1
  ) {
    Id
    Version
    Content
    Type
    Link
    FileId
    CustomAttributeData
    PublishedDate
    file {
      FileName
    }
    parent {
      Title
      owners {
        ...OwnerParts
      }
      ownerGroups {
        ...OwnerGroupParts
      }
      tags {
        ...TagParts
      }
      linkedDocuments {
        child {
          Id
          Title
        }
      }
    }
  }
}

fragment OwnerParts on owner {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment OwnerGroupParts on owner_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment TagParts on tag {
  type {
    Description
    Name
  }
  ParentId
  TagTypeId
}`) as any;
export type GetDocumentFileQuery = any;
export type GetDocumentFileQueryVariables = any;
export type GetGetDocumentFileQuery = any;
export type getDocumentFileQuery = any;
export type getDocumentFileQueryVariables = any;

export const GetLatestPublicDocumentFileByDocumentIdDocument = parse(`query getLatestPublicDocumentFileByDocumentId(\$documentId: uuid!) {
  document_file(
    where: {
      Status: { _eq: published }
      ParentDocumentId: { _eq: \$documentId }
    }
    order_by: { CreatedAtTimestamp: desc }
  ) {
    ...PublicDocumentRelationFileParts
    Link
    Content
    file {
      ...FileParts
    }
    reviewedBy {
      FriendlyName
    }
    parent {
      Title
      DocumentType
      owners {
        ...OwnerParts
      }
      ownerGroups {
        ...OwnerGroupParts
      }
    }
  }
}

fragment PublicDocumentRelationFileParts on document_file {
  CustomAttributeData
  CreatedAtTimestamp
  CreatedByUser
  FileId
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  NextReviewDate
  ParentDocumentId
  ReasonForReview
  ReviewDate
  ReviewedBy
  Status
  Summary
  Version
  Type
  PublishedDate
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}

fragment OwnerParts on owner {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment OwnerGroupParts on owner_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}`) as any;
export type GetLatestPublicDocumentFileByDocumentIdQuery = any;
export type GetLatestPublicDocumentFileByDocumentIdQueryVariables = any;
export type GetGetLatestPublicDocumentFileByDocumentIdQuery = any;
export type getLatestPublicDocumentFileByDocumentIdQuery = any;
export type getLatestPublicDocumentFileByDocumentIdQueryVariables = any;

export const GetPublicDocumentFilesDocument = parse(`query getPublicDocumentFiles(\$currentUserId: String!) {
  document_file(
    where: { Status: { _eq: published } }
    order_by: { CreatedAtTimestamp: desc }
  ) {
    ...PublicDocumentRelationFileParts
    Link
    Content
    file {
      ...FileParts
    }
    ModifiedAtTimestamp
    reviewedBy {
      FriendlyName
    }
    parent {
      Title
      DocumentType
      owners {
        ...OwnerParts
      }
      ownerGroups {
        ...OwnerGroupParts
      }
      departments {
        ...DepartmentParts
      }
    }
    attestations(
      where: { UserId: { _eq: \$currentUserId } }
      limit: 1
      order_by: { CreatedAtTimestamp: desc }
    ) {
      AttestationStatus
      attestationRecordStatus {
        Status
      }
      ExpiresAt
      Active
    }
  }
}

fragment PublicDocumentRelationFileParts on document_file {
  CustomAttributeData
  CreatedAtTimestamp
  CreatedByUser
  FileId
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  NextReviewDate
  ParentDocumentId
  ReasonForReview
  ReviewDate
  ReviewedBy
  Status
  Summary
  Version
  Type
  PublishedDate
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}

fragment OwnerParts on owner {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment OwnerGroupParts on owner_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment DepartmentParts on department {
  type {
    Description
    Name
  }
  ParentId
  DepartmentTypeId
}`) as any;
export type GetPublicDocumentFilesQuery = any;
export type GetPublicDocumentFilesQueryVariables = any;
export type GetGetPublicDocumentFilesQuery = any;
export type getPublicDocumentFilesQuery = any;
export type getPublicDocumentFilesQueryVariables = any;

export const InsertDocumentVersionDocument = parse(`mutation insertDocumentVersion(
  \$FileId: uuid
  \$NextReviewDate: timestamptz
  \$ParentDocumentId: uuid!
  \$ReasonForReview: String
  \$ReviewDate: timestamptz
  \$ReviewedBy: String
  \$Summary: String
  \$Version: String
  \$Content: String
  \$Type: document_file_type_enum
  \$Link: String
  \$CustomAttributeData: jsonb
) {
  insertDocumentVersion(
    FileId: \$FileId
    NextReviewDate: \$NextReviewDate
    ParentDocumentId: \$ParentDocumentId
    ReasonForReview: \$ReasonForReview
    ReviewDate: \$ReviewDate
    ReviewedBy: \$ReviewedBy
    Summary: \$Summary
    Version: \$Version
    Content: \$Content
    Type: \$Type
    Link: \$Link
    CustomAttributeData: \$CustomAttributeData
  ) {
    Id
  }
}`) as any;
export type InsertDocumentVersionMutation = any;
export type InsertDocumentVersionMutationVariables = any;
export type insertDocumentVersionMutation = any;
export type insertDocumentVersionMutationVariables = any;

export const UpdateDocumentVersionDocument = parse(`mutation updateDocumentVersion(
  \$Id: uuid!
  \$FileId: uuid
  \$LatestModifiedAtTimestamp: timestamptz!
  \$NextReviewDate: timestamptz
  \$ReasonForReview: String
  \$ReviewDate: timestamptz
  \$ReviewedBy: String
  \$Status: version_status_enum!
  \$Summary: String
  \$Version: String!
  \$Content: String
  \$Type: document_file_type_enum!
  \$Link: String
  \$CustomAttributeData: jsonb
) {
  updateDocumentVersion(
    NextReviewDate: \$NextReviewDate
    ReasonForReview: \$ReasonForReview
    ReviewDate: \$ReviewDate
    ReviewedBy: \$ReviewedBy
    Summary: \$Summary
    Status: \$Status
    Version: \$Version
    FileId: \$FileId
    Content: \$Content
    Type: \$Type
    Link: \$Link
    Id: \$Id
    LatestModifiedAtTimestamp: \$LatestModifiedAtTimestamp
    CustomAttributeData: \$CustomAttributeData
  ) {
    affected_rows
  }
}`) as any;
export type UpdateDocumentVersionMutation = any;
export type UpdateDocumentVersionMutationVariables = any;
export type updateDocumentVersionMutation = any;
export type updateDocumentVersionMutationVariables = any;

export const AddRiskToEnterpriseRiskDocument = parse(`mutation addRiskToEnterpriseRisk(\$objects: [AddRiskToEnterpriseRiskInput!]!) {
  addRiskToEnterpriseRisk(objects: \$objects) {
    affected_rows
  }
}`) as any;
export type AddRiskToEnterpriseRiskMutation = any;
export type AddRiskToEnterpriseRiskMutationVariables = any;
export type addRiskToEnterpriseRiskMutation = any;
export type addRiskToEnterpriseRiskMutationVariables = any;

export const GetEnterpriseRisksDocument = parse(`query getEnterpriseRisks(\$where: enterprise_risk_bool_exp! = {}) {
  enterprise_risk(where: \$where) {
    Id
    SequentialId
    Title
    Description
    CreatedAtTimestamp
    ModifiedAtTimestamp
    Treatment
    CustomAttributeData
    Tier
    ParentId

    score {
      InherentScoreMean
      InherentScoreMedian
      InherentScoreWorstCase
      ResidualScoreMean
      ResidualScoreMedian
      ResidualScoreWorstCase
      InherentRatingMean
      InherentRatingMedian
      InherentRatingWorstCase
      ResidualRatingMean
      ResidualRatingMedian
      ResidualRatingWorstCase
    }

    parent {
      Id
      Title
    }

    createdByUser {
      FriendlyName
    }

    modifiedByUser {
      FriendlyName
    }
  }
}`) as any;
export type GetEnterpriseRisksQuery = any;
export type GetEnterpriseRisksQueryVariables = any;
export type GetGetEnterpriseRisksQuery = any;
export type getEnterpriseRisksQuery = any;
export type getEnterpriseRisksQueryVariables = any;

export const GetEnterpriseRiskByIdDocument = parse(`query getEnterpriseRiskById(\$Id: uuid!) {
  enterprise_risk(where: { Id: { _eq: \$Id } }) {
    Id
    SequentialId
    Title
    Description
    CreatedAtTimestamp
    ModifiedAtTimestamp
    Treatment
    CustomAttributeData
    Tier
    ParentId
    children {
      Id
    }

    parent {
      Id
      Title
    }
  }
}`) as any;
export type GetEnterpriseRiskByIdQuery = any;
export type GetEnterpriseRiskByIdQueryVariables = any;
export type GetGetEnterpriseRiskByIdQuery = any;
export type getEnterpriseRiskByIdQuery = any;
export type getEnterpriseRiskByIdQueryVariables = any;

export const DeleteEnterpriseRiskDocument = parse(`mutation deleteEnterpriseRisk(\$Id: uuid!) {
  deleteChildEnterpriseRisk(Id: \$Id) {
    affected_rows
  }
}`) as any;
export type DeleteEnterpriseRiskMutation = any;
export type DeleteEnterpriseRiskMutationVariables = any;
export type deleteEnterpriseRiskMutation = any;
export type deleteEnterpriseRiskMutationVariables = any;

export const InsertEnterpriseRiskDocument = parse(`mutation insertEnterpriseRisk(
  \$Title: String!
  \$Description: String
  \$Treatment: risk_treatment_type_enum
  \$CustomAttributeData: jsonb
  \$Tier: Int!
  \$ParentId: uuid
) {
  insertChildEnterpriseRisk(
    object: {
      Title: \$Title
      Description: \$Description
      Treatment: \$Treatment
      CustomAttributeData: \$CustomAttributeData
      Tier: \$Tier
      ParentId: \$ParentId
    }
  ) {
    Id
  }
}`) as any;
export type InsertEnterpriseRiskMutation = any;
export type InsertEnterpriseRiskMutationVariables = any;
export type insertEnterpriseRiskMutation = any;
export type insertEnterpriseRiskMutationVariables = any;

export const UpdateEnterpriseRiskDocument = parse(`mutation updateEnterpriseRisk(
  \$Id: uuid!
  \$Title: String!
  \$Description: String
  \$Treatment: risk_treatment_type_enum
  \$CustomAttributeData: jsonb
  \$Tier: Int!
  \$ParentId: uuid
) {
  updateChildEnterpriseRisk(
    object: {
      Id: \$Id
      Title: \$Title
      Description: \$Description
      Treatment: \$Treatment
      CustomAttributeData: \$CustomAttributeData
      Tier: \$Tier
      ParentId: \$ParentId
    }
  ) {
    affected_rows
  }
}`) as any;
export type UpdateEnterpriseRiskMutation = any;
export type UpdateEnterpriseRiskMutationVariables = any;
export type updateEnterpriseRiskMutation = any;
export type updateEnterpriseRiskMutationVariables = any;

export const GetEnterpriseRisksByTierDocument = parse(`query getEnterpriseRisksByTier(\$Tier: Int!) {
  enterprise_risk(where: { Tier: { _eq: \$Tier } }) {
    Id
    SequentialId
    Title
  }
}`) as any;
export type GetEnterpriseRisksByTierQuery = any;
export type GetEnterpriseRisksByTierQueryVariables = any;
export type GetGetEnterpriseRisksByTierQuery = any;
export type getEnterpriseRisksByTierQuery = any;
export type getEnterpriseRisksByTierQueryVariables = any;

export const GetEnterpriseRisksFlatDocument = parse(`query getEnterpriseRisksFlat(\$where: enterprise_risk_bool_exp! = {}) {
  enterprise_risk(where: \$where) {
    Id
    SequentialId
    Title
    Tier
    Treatment
    ParentId
    CustomAttributeData
    CreatedAtTimestamp
    ModifiedAtTimestamp
    Description
    score {
      InherentScoreMean
      InherentScoreMedian
      InherentScoreWorstCase
      ResidualScoreMean
      ResidualScoreMedian
      ResidualScoreWorstCase
      InherentRatingMean
      InherentRatingMedian
      InherentRatingWorstCase
      ResidualRatingMean
      ResidualRatingMedian
      ResidualRatingWorstCase
    }
    createdByUser {
      FriendlyName
    }

    modifiedByUser {
      FriendlyName
    }
  }
}`) as any;
export type GetEnterpriseRisksFlatQuery = any;
export type GetEnterpriseRisksFlatQueryVariables = any;
export type GetGetEnterpriseRisksFlatQuery = any;
export type getEnterpriseRisksFlatQuery = any;
export type getEnterpriseRisksFlatQueryVariables = any;

export const InstatiateEnterpriseRiskDocument = parse(`mutation instatiateEnterpriseRisk(
  \$EnterpriseRiskIds: [uuid!]!
  \$Entities: [uuid!]!
) {
  instantiateChildEnterpriseRisk(
    object: { EnterpriseRiskIds: \$EnterpriseRiskIds, Entities: \$Entities }
  ) {
    affected_rows
  }
}`) as any;
export type InstatiateEnterpriseRiskMutation = any;
export type InstatiateEnterpriseRiskMutationVariables = any;
export type instatiateEnterpriseRiskMutation = any;
export type instatiateEnterpriseRiskMutationVariables = any;

export const GetEntitiesDocument = parse(`query getEntities {
  entity {
    Id
    Name
    Description
    ParentId
    Weight
    CreatedAtTimestamp
    ModifiedAtTimestamp
    modifiedByUser {
      FriendlyName
    }
    createdByUser {
      FriendlyName
    }
    parent {
      Id
      Name
    }
    owners {
      ...OwnerParts
    }
    ownerGroups {
      ...OwnerGroupParts
    }
    children {
      Id
      Name
    }
  }
}

fragment OwnerParts on owner {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment OwnerGroupParts on owner_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}`) as any;
export type GetEntitiesQuery = any;
export type GetEntitiesQueryVariables = any;
export type GetGetEntitiesQuery = any;
export type getEntitiesQuery = any;
export type getEntitiesQueryVariables = any;

export const GetEntityByIdDocument = parse(`query getEntityById(\$Id: uuid!) {
  entity_by_pk(Id: \$Id) {
    Id
    Name
    Description
    ParentId
    Weight
    CreatedAtTimestamp
    ModifiedAtTimestamp
    modifiedByUser {
      FriendlyName
    }
    createdByUser {
      FriendlyName
    }
    parent {
      Id
      Name
    }
    owners {
      ...OwnerParts
    }
    ownerGroups {
      ...OwnerGroupParts
    }
  }
}

fragment OwnerParts on owner {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment OwnerGroupParts on owner_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}`) as any;
export type GetEntityByIdQuery = any;
export type GetEntityByIdQueryVariables = any;
export type GetGetEntityByIdQuery = any;
export type getEntityByIdQuery = any;
export type getEntityByIdQueryVariables = any;

export const InsertEntityDocument = parse(`mutation insertEntity(
  \$Name: String!
  \$Description: String
  \$ParentId: uuid
  \$Weight: numeric!
  \$owners: [String!]!
  \$ownerGroups: [String!]!
) {
  insertChildEntity(
    object: {
      Name: \$Name
      Description: \$Description
      ParentId: \$ParentId
      Weight: \$Weight
      owners: \$owners
      ownerGroups: \$ownerGroups
    }
  ) {
    Id
  }
}`) as any;
export type InsertEntityMutation = any;
export type InsertEntityMutationVariables = any;
export type insertEntityMutation = any;
export type insertEntityMutationVariables = any;

export const UpdateEntityDocument = parse(`mutation updateEntity(
  \$Id: uuid!
  \$Name: String!
  \$Description: String
  \$ParentId: uuid
  \$Weight: numeric!
  \$owners: [String!]!
  \$ownerGroups: [String!]!
) {
  updateChildEntity(
    object: {
      Id: \$Id
      Name: \$Name
      Description: \$Description
      ParentId: \$ParentId
      Weight: \$Weight
      owners: \$owners
      ownerGroups: \$ownerGroups
    }
  ) {
    affected_rows
  }
}`) as any;
export type UpdateEntityMutation = any;
export type UpdateEntityMutationVariables = any;
export type updateEntityMutation = any;
export type updateEntityMutationVariables = any;

export const DeleteEntityDocument = parse(`mutation deleteEntity(\$Id: uuid!) {
  deleteChildEntity(Id: \$Id) {
    affected_rows
  }
}`) as any;
export type DeleteEntityMutation = any;
export type DeleteEntityMutationVariables = any;
export type deleteEntityMutation = any;
export type deleteEntityMutationVariables = any;

export const FilePartsDocument = parse(`fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}`) as any;
export type FilePartsFragment = any;

export const DeleteRelationFileByIdDocument = parse(`mutation deleteRelationFileById(\$parentIds: [uuid!], \$fileIds: [uuid!]) {
  delete_relation_file(
    where: { FileId: { _in: \$fileIds }, ParentId: { _in: \$parentIds } }
  ) {
    affected_rows
  }
}`) as any;
export type DeleteRelationFileByIdMutation = any;
export type DeleteRelationFileByIdMutationVariables = any;
export type deleteRelationFileByIdMutation = any;
export type deleteRelationFileByIdMutationVariables = any;

export const GetFileAuditByIdDocument = parse(`query getFileAuditById(\$Id: uuid!) {
  file_audit(where: { Id: { _eq: \$Id } }, order_by: {ModifiedAtTimestamp: desc}) {
    Id
    FileName
    FileSize
    Meta
    ContentType
    CreatedByUser
    CreatedAtTimestamp
    ModifiedByUser
    ModifiedAtTimestamp
  }
}`) as any;
export type GetFileAuditByIdQuery = any;
export type GetFileAuditByIdQueryVariables = any;
export type GetGetFileAuditByIdQuery = any;
export type getFileAuditByIdQuery = any;
export type getFileAuditByIdQueryVariables = any;

export const GetFileByIdDocument = parse(`query getFileById(\$Id: uuid!) {
  file_by_pk(Id: \$Id) {
    ...FileParts
  }
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}`) as any;
export type GetFileByIdQuery = any;
export type GetFileByIdQueryVariables = any;
export type GetGetFileByIdQuery = any;
export type getFileByIdQuery = any;
export type getFileByIdQueryVariables = any;

export const FormConfigurationPartsDocument = parse(`fragment FormConfigurationParts on form_configuration {
  ParentType
  createdByUser {
    FriendlyName
  }
  customAttributeSchema {
    UiSchema
    Schema
    Id
  }
  modifiedByUser {
    FriendlyName
  }
  fields_config {
    FieldId
    Hidden
    Required
    ReadOnly
    DefaultValue
    FormConfigurationParentType
    Label
    Description
    Conditions
  }
}`) as any;
export type FormConfigurationPartsFragment = any;

export const GetFormConfigurationDocument = parse(`query getFormConfiguration(\$where: form_configuration_bool_exp! = {}) {
  form_configuration(where: \$where) {
    ...FormConfigurationParts
  }
}

fragment FormConfigurationParts on form_configuration {
  ParentType
  createdByUser {
    FriendlyName
  }
  customAttributeSchema {
    UiSchema
    Schema
    Id
  }
  modifiedByUser {
    FriendlyName
  }
  fields_config {
    FieldId
    Hidden
    Required
    ReadOnly
    DefaultValue
    FormConfigurationParentType
    Label
    Description
    Conditions
  }
}`) as any;
export type GetFormConfigurationQuery = any;
export type GetFormConfigurationQueryVariables = any;
export type GetGetFormConfigurationQuery = any;
export type getFormConfigurationQuery = any;
export type getFormConfigurationQueryVariables = any;

export const GetFormConfigurationAuditDocument = parse(`query getFormConfigurationAudit(\$parentType: String!) {
  form_configuration_audit(where: { ParentType: { _eq: \$parentType } }, order_by: {ModifiedAtTimestamp: desc}) {
    ParentType
    ModifiedByUser
    ModifiedAtTimestamp
    CreatedByUser
    CreatedAtTimestamp
    CustomAttributeSchemaId
  }
}`) as any;
export type GetFormConfigurationAuditQuery = any;
export type GetFormConfigurationAuditQueryVariables = any;
export type GetGetFormConfigurationAuditQuery = any;
export type getFormConfigurationAuditQuery = any;
export type getFormConfigurationAuditQueryVariables = any;

export const GetFormConfigurationByParentTypeDocument = parse(`query getFormConfigurationByParentType(\$parentTypes: [parent_type_enum!]!) {
  form_configuration(where: { ParentType: { _in: \$parentTypes } }) {
    ...FormConfigurationParts
  }
}

fragment FormConfigurationParts on form_configuration {
  ParentType
  createdByUser {
    FriendlyName
  }
  customAttributeSchema {
    UiSchema
    Schema
    Id
  }
  modifiedByUser {
    FriendlyName
  }
  fields_config {
    FieldId
    Hidden
    Required
    ReadOnly
    DefaultValue
    FormConfigurationParentType
    Label
    Description
    Conditions
  }
}`) as any;
export type GetFormConfigurationByParentTypeQuery = any;
export type GetFormConfigurationByParentTypeQueryVariables = any;
export type GetGetFormConfigurationByParentTypeQuery = any;
export type getFormConfigurationByParentTypeQuery = any;
export type getFormConfigurationByParentTypeQueryVariables = any;

export const DeleteFormFieldDocument = parse(`mutation deleteFormField(\$object: DeleteFormFieldInput!) {
  deleteFormField(object: \$object) {
    Id
  }
}`) as any;
export type DeleteFormFieldMutation = any;
export type DeleteFormFieldMutationVariables = any;
export type deleteFormFieldMutation = any;
export type deleteFormFieldMutationVariables = any;

export const InsertFormFieldDocument = parse(`mutation insertFormField(\$object: InsertFormFieldInput!) {
  insertFormField(object: \$object) {
    Id
  }
}`) as any;
export type InsertFormFieldMutation = any;
export type InsertFormFieldMutationVariables = any;
export type insertFormFieldMutation = any;
export type insertFormFieldMutationVariables = any;

export const UpdateFormFieldDocument = parse(`mutation updateFormField(\$object: UpdateFormFieldInput!) {
  updateFormField(object: \$object) {
    Id
  }
}`) as any;
export type UpdateFormFieldMutation = any;
export type UpdateFormFieldMutationVariables = any;
export type updateFormFieldMutation = any;
export type updateFormFieldMutationVariables = any;

export const GetAllFormsCustomisationDocument = parse(`query getAllFormsCustomisation {
  # This contains the custom attribute configuration for the form (json forms schema)
  form_configuration {
    ...FormConfigurationParts
  }
  # This contains customisation for both standard and custom attributes
  form_field_configuration {
    FieldId
    Hidden
    Required
    ReadOnly
    DefaultValue
    FormConfigurationParentType
    Label
    Description
  }
  # This contains the order of both standard and custom attributes within a form
  form_field_ordering {
    FieldId
    Position
    FormConfigurationParentType
  }
}

fragment FormConfigurationParts on form_configuration {
  ParentType
  createdByUser {
    FriendlyName
  }
  customAttributeSchema {
    UiSchema
    Schema
    Id
  }
  modifiedByUser {
    FriendlyName
  }
  fields_config {
    FieldId
    Hidden
    Required
    ReadOnly
    DefaultValue
    FormConfigurationParentType
    Label
    Description
    Conditions
  }
}`) as any;
export type GetAllFormsCustomisationQuery = any;
export type GetAllFormsCustomisationQueryVariables = any;
export type GetGetAllFormsCustomisationQuery = any;
export type getAllFormsCustomisationQuery = any;
export type getAllFormsCustomisationQueryVariables = any;

export const GetFormCustomisationDocument = parse(`query getFormCustomisation(\$parentTypes: [parent_type_enum!]!) {
  # This contains the custom attribute configuration for the form (json forms schema)
  form_configuration(where: { ParentType: { _in: \$parentTypes } }) {
    ...FormConfigurationParts
  }
  ## todo: try and remove this as lives as also returned in query above
  # This contains customisation for both standard and custom attributes
  form_field_configuration(
    where: { FormConfigurationParentType: { _in: \$parentTypes } }
  ) {
    FieldId
    Hidden
    Required
    ReadOnly
    DefaultValue
    FormConfigurationParentType
    Label
    Description
    Conditions
  }

  # This contains the order of both standard and custom attributes within a form
  form_field_ordering(
    where: { FormConfigurationParentType: { _in: \$parentTypes } }
  ) {
    FieldId
    Position
    FormConfigurationParentType
  }
}

fragment FormConfigurationParts on form_configuration {
  ParentType
  createdByUser {
    FriendlyName
  }
  customAttributeSchema {
    UiSchema
    Schema
    Id
  }
  modifiedByUser {
    FriendlyName
  }
  fields_config {
    FieldId
    Hidden
    Required
    ReadOnly
    DefaultValue
    FormConfigurationParentType
    Label
    Description
    Conditions
  }
}`) as any;
export type GetFormCustomisationQuery = any;
export type GetFormCustomisationQueryVariables = any;
export type GetGetFormCustomisationQuery = any;
export type getFormCustomisationQuery = any;
export type getFormCustomisationQueryVariables = any;

export const GetFormFieldConfigurationAuditByParentTypeDocument = parse(`query getFormFieldConfigurationAuditByParentType(
  \$parentType: String!,
  \$fieldId: String!) {
  form_field_configuration_audit(
    where: {
      FormConfigurationParentType: { _eq: \$parentType }
      FieldId: { _eq: \$fieldId }
    }, order_by: {ModifiedAtTimestamp: desc}
  ) {
    FieldId
    Hidden
    Required
    ReadOnly
    CreatedByUser
    CreatedAtTimestamp
    ModifiedByUser
    ModifiedAtTimestamp
    FormConfigurationParentType
  }
}`) as any;
export type GetFormFieldConfigurationAuditByParentTypeQuery = any;
export type GetFormFieldConfigurationAuditByParentTypeQueryVariables = any;
export type GetGetFormFieldConfigurationAuditByParentTypeQuery = any;
export type getFormFieldConfigurationAuditByParentTypeQuery = any;
export type getFormFieldConfigurationAuditByParentTypeQueryVariables = any;

export const GetFormFieldOptionsByParentTypeDocument = parse(`query getFormFieldOptionsByParentType(\$parentTypes: [parent_type_enum!]!) {
  form_field_configuration(
    where: { FormConfigurationParentType: { _in: \$parentTypes } }
  ) {
    FormConfigurationParentType
    FieldId
    Hidden
    Required
    ReadOnly
    DefaultValue
    Label
    Description
  }
}`) as any;
export type GetFormFieldOptionsByParentTypeQuery = any;
export type GetFormFieldOptionsByParentTypeQueryVariables = any;
export type GetGetFormFieldOptionsByParentTypeQuery = any;
export type getFormFieldOptionsByParentTypeQuery = any;
export type getFormFieldOptionsByParentTypeQueryVariables = any;

export const GetFormFieldOrderingAuditByIdDocument = parse(`query getFormFieldOrderingAuditById(
  \$parentType: String!,
  \$fieldId: String!) {
  form_field_ordering_audit(
    where: {
      FormConfigurationParentType: { _eq: \$parentType }
      FieldId: { _eq: \$fieldId }
    }
  ) {
    FieldId
    Position
    CreatedByUser
    CreatedAtTimestamp
    ModifiedByUser
    ModifiedAtTimestamp
  }
}`) as any;
export type GetFormFieldOrderingAuditByIdQuery = any;
export type GetFormFieldOrderingAuditByIdQueryVariables = any;
export type GetGetFormFieldOrderingAuditByIdQuery = any;
export type getFormFieldOrderingAuditByIdQuery = any;
export type getFormFieldOrderingAuditByIdQueryVariables = any;

export const InsertFormFieldPositionsDocument = parse(`mutation insertFormFieldPositions(
  \$parentType: parent_type_enum!
  \$fieldConfig: [form_field_ordering_insert_input!]!
  \$fieldIds: [String!]!
) {
  insert_form_configuration_one(
    object: {
      ParentType: \$parentType
      fields_ordering: {
        data: \$fieldConfig
        on_conflict: {
          update_columns: [Position, FieldId]
          constraint: form_field_configuration_pkey
        }
      }
    }
    on_conflict: {
      constraint: form_configuration_pkey
      update_columns: [ParentType]
    }
  ) {
    CreatedAtTimestamp
  }

  # Delete any field configs that are no longer in the form
  delete_form_field_ordering(
    where: {
      FieldId: { _nin: \$fieldIds }
      FormConfigurationParentType: { _eq: \$parentType }
    }
  ) {
    affected_rows
  }
}`) as any;
export type InsertFormFieldPositionsMutation = any;
export type InsertFormFieldPositionsMutationVariables = any;
export type insertFormFieldPositionsMutation = any;
export type insertFormFieldPositionsMutationVariables = any;

export const UpdateFormFieldPositionsDocument = parse(`mutation updateFormFieldPositions(
  \$parentType: parent_type_enum!
  \$fieldConfig: [form_field_ordering_insert_input!]!
  \$fieldIds: [String!]!
) {
  # Update the form configuration object, and change nothing, to trigger an audit log
  update_form_configuration(
    _set: { ParentType: \$parentType }
    where: { ParentType: { _eq: \$parentType } }
  ) {
    affected_rows
  }

  insert_form_field_ordering(
    objects: \$fieldConfig
    on_conflict: {
      update_columns: [Position, FormConfigurationParentType, FieldId]
      constraint: form_field_configuration_pkey
    }
  ) {
    returning {
      FieldId
    }
  }

  # Delete any field configs that are no longer in the form
  delete_form_field_ordering(
    where: {
      FieldId: { _nin: \$fieldIds }
      FormConfigurationParentType: { _eq: \$parentType }
    }
  ) {
    affected_rows
  }
}`) as any;
export type UpdateFormFieldPositionsMutation = any;
export type UpdateFormFieldPositionsMutationVariables = any;
export type updateFormFieldPositionsMutation = any;
export type updateFormFieldPositionsMutationVariables = any;

export const GetOwnersAndContributorsDocument = parse(`query getOwnersAndContributors(\$parentId: uuid!) {
  ancestor_contributor(where: { Id: { _eq: \$parentId } }) {
    UserId
    UserGroupId
    ContributorType
  }
}`) as any;
export type GetOwnersAndContributorsQuery = any;
export type GetOwnersAndContributorsQueryVariables = any;
export type GetGetOwnersAndContributorsQuery = any;
export type getOwnersAndContributorsQuery = any;
export type getOwnersAndContributorsQueryVariables = any;

export const GetUsersDocument = parse(`query getUsers {
  user(
    order_by: { FriendlyName: asc }
    where: {
      _or: [
        { RoleKey: { _neq: "ThirdPartyRespondent" } }
        { RoleKey: { _is_null: true } }
      ]
    }
  ) {
    Id
    FriendlyName
    Status
    RoleKey
    Email
    Department
    JobTitle
    OfficeLocation
    LastSeen
    IsCustomerSupport
  }
}`) as any;
export type GetUsersQuery = any;
export type GetUsersQueryVariables = any;
export type GetGetUsersQuery = any;
export type getUsersQuery = any;
export type getUsersQueryVariables = any;

export const DeleteImpactRatingDocument = parse(`mutation deleteImpactRating(\$Id: uuid!) {
  delete_impact_rating(where: { Id: { _eq: \$Id } }) {
    affected_rows
  }
}`) as any;
export type DeleteImpactRatingMutation = any;
export type DeleteImpactRatingMutationVariables = any;
export type deleteImpactRatingMutation = any;
export type deleteImpactRatingMutationVariables = any;

export const DeleteImpactRatingsDocument = parse(`mutation deleteImpactRatings(\$Ids: [uuid!]!) {
  delete_impact_rating(where: { Id: { _in: \$Ids } }) {
    affected_rows
  }
}`) as any;
export type DeleteImpactRatingsMutation = any;
export type DeleteImpactRatingsMutationVariables = any;
export type deleteImpactRatingsMutation = any;
export type deleteImpactRatingsMutationVariables = any;

export const GetImpactRatingAuditByIdDocument = parse(`query getImpactRatingAuditById(\$id: uuid!) {
  impact_rating_audit(where: { Id: { _eq: \$id } }, order_by: {ModifiedAtTimestamp: desc}) {
    CreatedAtTimestamp
    CreatedByUser
    Id
    ModifiedAtTimestamp
    ModifiedByUser
    CustomAttributeData
    SequentialId
    Rating
    RatedItemId
    ImpactId
    TestDate
    CompletedBy
    Likelihood
  }
}`) as any;
export type GetImpactRatingAuditByIdQuery = any;
export type GetImpactRatingAuditByIdQueryVariables = any;
export type GetGetImpactRatingAuditByIdQuery = any;
export type getImpactRatingAuditByIdQuery = any;
export type getImpactRatingAuditByIdQueryVariables = any;

export const GetImpactRatingByIdDocument = parse(`query getImpactRatingById(\$id: uuid!) {
  impact_rating(where: { Id: { _eq: \$id } }) {
    ...ImpactRatingParts
    createdByUser {
      FriendlyName
    }
  }
}

fragment ImpactRatingParts on impact_rating {
  CreatedAtTimestamp
  CreatedByUser
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  CustomAttributeData
  SequentialId
  Rating
  RatedItemId
  ImpactId
  TestDate
  CompletedBy
  Likelihood
}`) as any;
export type GetImpactRatingByIdQuery = any;
export type GetImpactRatingByIdQueryVariables = any;
export type GetGetImpactRatingByIdQuery = any;
export type getImpactRatingByIdQuery = any;
export type getImpactRatingByIdQueryVariables = any;

export const GetInternalAuditImpactRatingByIdDocument = parse(`query getInternalAuditImpactRatingById(\$id: uuid!) {
  impact_internal_audit_rating(where: { Id: { _eq: \$id } }) {
    ...ImpactInternalAuditRatingParts
    createdByUser {
      FriendlyName
    }
  }
}

fragment ImpactInternalAuditRatingParts on impact_internal_audit_rating {
  CreatedAtTimestamp
  CreatedByUser
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  CustomAttributeData
  SequentialId
  Rating
  RatedItemId
  ImpactId
  TestDate
  CompletedBy
  Likelihood
}`) as any;
export type GetInternalAuditImpactRatingByIdQuery = any;
export type GetInternalAuditImpactRatingByIdQueryVariables = any;
export type GetGetInternalAuditImpactRatingByIdQuery = any;
export type getInternalAuditImpactRatingByIdQuery = any;
export type getInternalAuditImpactRatingByIdQueryVariables = any;

export const GetSecondLineImpactRatingByIdDocument = parse(`query getSecondLineImpactRatingById(\$id: uuid!) {
  impact_second_line_rating(where: { Id: { _eq: \$id } }) {
    ...ImpactSecondLineRatingParts
    createdByUser {
      FriendlyName
    }
  }
}

fragment ImpactSecondLineRatingParts on impact_second_line_rating {
  CreatedAtTimestamp
  CreatedByUser
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  CustomAttributeData
  SequentialId
  Rating
  RatedItemId
  ImpactId
  TestDate
  CompletedBy
  Likelihood
}`) as any;
export type GetSecondLineImpactRatingByIdQuery = any;
export type GetSecondLineImpactRatingByIdQueryVariables = any;
export type GetGetSecondLineImpactRatingByIdQuery = any;
export type getSecondLineImpactRatingByIdQuery = any;
export type getSecondLineImpactRatingByIdQueryVariables = any;

export const GetImpactRatingCountDocument = parse(`query getImpactRatingCount {
  impact_rating_aggregate(
    where: { RatingType: { _in: ["assessment", "rating"] } }
  ) {
    aggregate {
      count
    }
  }
}`) as any;
export type GetImpactRatingCountQuery = any;
export type GetImpactRatingCountQueryVariables = any;
export type GetGetImpactRatingCountQuery = any;
export type getImpactRatingCountQuery = any;
export type getImpactRatingCountQueryVariables = any;

export const GetImpactRatingsDocument = parse(`query getImpactRatings {
  impact_rating(where: { RatingType: { _in: ["assessment", "rating"] } }) {
    ...ImpactRatingParts
    createdByUser {
      FriendlyName
    }
    completedBy {
      FriendlyName
    }
    impact {
      Id
      Name
    }
    ratedItem {
      risk {
        Title
      }
      ObjectType
    }
  }
}

fragment ImpactRatingParts on impact_rating {
  CreatedAtTimestamp
  CreatedByUser
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  CustomAttributeData
  SequentialId
  Rating
  RatedItemId
  ImpactId
  TestDate
  CompletedBy
  Likelihood
}`) as any;
export type GetImpactRatingsQuery = any;
export type GetImpactRatingsQueryVariables = any;
export type GetGetImpactRatingsQuery = any;
export type getImpactRatingsQuery = any;
export type getImpactRatingsQueryVariables = any;

export const GetImpactRatingsByImpactIdDocument = parse(`query getImpactRatingsByImpactId(\$impactId: uuid!) {
  impact_rating(
    where: {
      ImpactId: { _eq: \$impactId }
      RatingType: { _in: ["assessment", "rating"] }
    }
  ) {
    ...ImpactRatingParts
    createdByUser {
      FriendlyName
    }
    completedBy {
      FriendlyName
    }
    impact {
      Name
      Rationale
    }
    ratedItem {
      risk {
        Title
      }
      ObjectType
    }
  }
}

fragment ImpactRatingParts on impact_rating {
  CreatedAtTimestamp
  CreatedByUser
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  CustomAttributeData
  SequentialId
  Rating
  RatedItemId
  ImpactId
  TestDate
  CompletedBy
  Likelihood
}`) as any;
export type GetImpactRatingsByImpactIdQuery = any;
export type GetImpactRatingsByImpactIdQueryVariables = any;
export type GetGetImpactRatingsByImpactIdQuery = any;
export type getImpactRatingsByImpactIdQuery = any;
export type getImpactRatingsByImpactIdQueryVariables = any;

export const GetImpactRatingsByRatedItemIdDocument = parse(`query getImpactRatingsByRatedItemId(\$ratedItemId: uuid!) {
  impact_rating(
    where: {
      RatedItemId: { _eq: \$ratedItemId }
      RatingType: { _in: ["assessment", "rating"] }
    }
    order_by: { TestDate: desc, CreatedAtTimestamp: desc }
  ) {
    ...ImpactRatingParts
    createdByUser {
      FriendlyName
    }
    completedBy {
      FriendlyName
    }
    impact {
      Name
      Rationale
    }
    ratedItem {
      risk {
        Title
      }
      ObjectType
    }
  }
}

fragment ImpactRatingParts on impact_rating {
  CreatedAtTimestamp
  CreatedByUser
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  CustomAttributeData
  SequentialId
  Rating
  RatedItemId
  ImpactId
  TestDate
  CompletedBy
  Likelihood
}`) as any;
export type GetImpactRatingsByRatedItemIdQuery = any;
export type GetImpactRatingsByRatedItemIdQueryVariables = any;
export type GetGetImpactRatingsByRatedItemIdQuery = any;
export type getImpactRatingsByRatedItemIdQuery = any;
export type getImpactRatingsByRatedItemIdQueryVariables = any;

export const GetImpactRatingsWithAppetitesDocument = parse(`query getImpactRatingsWithAppetites(\$today: timestamptz!) {
  impact_rating(
    where: { RatingType: { _in: ["assessment", "rating"] } }
    distinct_on: [RatedItemId, ImpactId]
    order_by: [
      { RatedItemId: desc, ImpactId: desc }
      { CreatedAtTimestamp: desc }
    ]
  ) {
    ...ImpactRatingParts
    createdByUser {
      FriendlyName
    }
    completedBy {
      FriendlyName
    }
    impact {
      Id
      Name
    }
    ratedItem {
      risk {
        Title
        likelihoodAppetite: appetites(
          where: {
            appetite: {
              AppetiteType: { _eq: likelihood }
              EffectiveDate: { _lte: \$today }
            }
          }
          order_by: { appetite: { EffectiveDate: desc } }
          limit: 1
        ) {
          appetite {
            LikelihoodAppetite
            EffectiveDate
          }
        }
        impactAppetites: appetites(
          where: {
            appetite: {
              AppetiteType: { _eq: impact }
              EffectiveDate: { _lte: \$today }
            }
          }
          order_by: { appetite: { EffectiveDate: desc } }
        ) {
          appetite {
            ImpactId
            ImpactAppetite
            EffectiveDate
          }
        }
      }
      ObjectType
    }
  }
}

fragment ImpactRatingParts on impact_rating {
  CreatedAtTimestamp
  CreatedByUser
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  CustomAttributeData
  SequentialId
  Rating
  RatedItemId
  ImpactId
  TestDate
  CompletedBy
  Likelihood
}`) as any;
export type GetImpactRatingsWithAppetitesQuery = any;
export type GetImpactRatingsWithAppetitesQueryVariables = any;
export type GetGetImpactRatingsWithAppetitesQuery = any;
export type getImpactRatingsWithAppetitesQuery = any;
export type getImpactRatingsWithAppetitesQueryVariables = any;

export const GetLatestImpactRatingsForRatedImpactsByRatedItemIdDocument = parse(`query getLatestImpactRatingsForRatedImpactsByRatedItemId(\$RatedItemId: uuid!) {
  impact(
    where: {
      ratings: {
        RatedItemId: { _eq: \$RatedItemId }
        RatingType: { _in: ["assessment", "rating"] }
      }
    }
  ) {
    Name
    Rationale
    ratings(
      where: {
        RatedItemId: { _eq: \$RatedItemId }
        RatingType: { _in: ["assessment", "rating"] }
      }
      order_by: { TestDate: desc }
      limit: 1
    ) {
      ...ImpactRatingParts
      createdByUser {
        FriendlyName
      }
      completedBy {
        FriendlyName
      }
    }
  }
}

fragment ImpactRatingParts on impact_rating {
  CreatedAtTimestamp
  CreatedByUser
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  CustomAttributeData
  SequentialId
  Rating
  RatedItemId
  ImpactId
  TestDate
  CompletedBy
  Likelihood
}`) as any;
export type GetLatestImpactRatingsForRatedImpactsByRatedItemIdQuery = any;
export type GetLatestImpactRatingsForRatedImpactsByRatedItemIdQueryVariables = any;
export type GetGetLatestImpactRatingsForRatedImpactsByRatedItemIdQuery = any;
export type getLatestImpactRatingsForRatedImpactsByRatedItemIdQuery = any;
export type getLatestImpactRatingsForRatedImpactsByRatedItemIdQueryVariables = any;

export const ImpactRatingPartsDocument = parse(`fragment ImpactRatingParts on impact_rating {
  CreatedAtTimestamp
  CreatedByUser
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  CustomAttributeData
  SequentialId
  Rating
  RatedItemId
  ImpactId
  TestDate
  CompletedBy
  Likelihood
}`) as any;
export type ImpactRatingPartsFragment = any;

export const ImpactInternalAuditRatingPartsDocument = parse(`fragment ImpactInternalAuditRatingParts on impact_internal_audit_rating {
  CreatedAtTimestamp
  CreatedByUser
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  CustomAttributeData
  SequentialId
  Rating
  RatedItemId
  ImpactId
  TestDate
  CompletedBy
  Likelihood
}`) as any;
export type ImpactInternalAuditRatingPartsFragment = any;

export const ImpactSecondLineRatingPartsDocument = parse(`fragment ImpactSecondLineRatingParts on impact_second_line_rating {
  CreatedAtTimestamp
  CreatedByUser
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  CustomAttributeData
  SequentialId
  Rating
  RatedItemId
  ImpactId
  TestDate
  CompletedBy
  Likelihood
}`) as any;
export type ImpactSecondLineRatingPartsFragment = any;

export const InsertChildImpactRatingsDocument = parse(`mutation insertChildImpactRatings(
  \$Ratings: [InsertImpactRatingPairInput!]!
  \$TestDate: timestamptz!
  \$AssessmentId: uuid
  \$RatedItemId: uuid!
  \$CustomAttributeData: jsonb
  \$CompletedBy: String
  \$Likelihood: Int
) {
  insertChildImpactRating(
    AssessmentId: \$AssessmentId
    Ratings: \$Ratings
    TestDate: \$TestDate
    RatedItemId: \$RatedItemId
    CustomAttributeData: \$CustomAttributeData
    CompletedBy: \$CompletedBy
    Likelihood: \$Likelihood
  ) {
    Ids
  }
}`) as any;
export type InsertChildImpactRatingsMutation = any;
export type InsertChildImpactRatingsMutationVariables = any;
export type insertChildImpactRatingsMutation = any;
export type insertChildImpactRatingsMutationVariables = any;

export const DeleteImpactDocument = parse(`mutation deleteImpact(\$Id: uuid!) {
  delete_impact_rating(where: { ImpactId: { _eq: \$Id } }) {
    affected_rows
  }

  delete_impact(where: { Id: { _eq: \$Id } }) {
    affected_rows
  }
}`) as any;
export type DeleteImpactMutation = any;
export type DeleteImpactMutationVariables = any;
export type deleteImpactMutation = any;
export type deleteImpactMutationVariables = any;

export const GetImpactAuditByIdDocument = parse(`query getImpactAuditById(\$id: uuid!) {
  impact_audit(where: { Id: { _eq: \$id } }, order_by: {ModifiedAtTimestamp: desc}) {
    CreatedAtTimestamp
    CreatedByUser
    Rationale
    RatingGuidance
    Id
    ModifiedAtTimestamp
    ModifiedByUser
    Name
    CustomAttributeData
    SequentialId
    LikelihoodAppetite
  }
}`) as any;
export type GetImpactAuditByIdQuery = any;
export type GetImpactAuditByIdQueryVariables = any;
export type GetGetImpactAuditByIdQuery = any;
export type getImpactAuditByIdQuery = any;
export type getImpactAuditByIdQueryVariables = any;

export const GetImpactByIdDocument = parse(`query getImpactById(\$id: uuid!) {
  impact(where: { Id: { _eq: \$id } }) {
    ...ImpactParts
    createdByUser {
      FriendlyName
    }
    owners {
      ...OwnerParts
    }
    ownerGroups {
      ...OwnerGroupParts
    }
    ancestorContributors {
      ...AncestorContributorParts
    }
  }
}

fragment ImpactParts on impact {
  CreatedAtTimestamp
  CreatedByUser
  Rationale
  RatingGuidance
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  Name
  CustomAttributeData
  SequentialId
  LikelihoodAppetite
}

fragment OwnerParts on owner {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment OwnerGroupParts on owner_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment AncestorContributorParts on ancestor_contributor {
  ContributorType
  UserId
  Id
  AncestorId
  UserGroupId
  user {
    FriendlyName
  }
  user_group {
    Name
  }
}`) as any;
export type GetImpactByIdQuery = any;
export type GetImpactByIdQueryVariables = any;
export type GetGetImpactByIdQuery = any;
export type getImpactByIdQuery = any;
export type getImpactByIdQueryVariables = any;

export const GetImpactCountDocument = parse(`query getImpactCount {
  impact_aggregate {
    aggregate {
      count
    }
  }
}`) as any;
export type GetImpactCountQuery = any;
export type GetImpactCountQueryVariables = any;
export type GetGetImpactCountQuery = any;
export type getImpactCountQuery = any;
export type getImpactCountQueryVariables = any;

export const GetImpactListDocument = parse(`query getImpactList {
  impact {
    Id
    SequentialId
    Name
    Rationale
    RatingGuidance
  }
}`) as any;
export type GetImpactListQuery = any;
export type GetImpactListQueryVariables = any;
export type GetGetImpactListQuery = any;
export type getImpactListQuery = any;
export type getImpactListQueryVariables = any;

export const GetImpactsDocument = parse(`query getImpacts {
  impact {
    ...ImpactParts
    createdByUser {
      FriendlyName
    }
    owners {
      ...OwnerParts
    }
    ownerGroups {
      ...OwnerGroupParts
    }
    ratings(
      distinct_on: [RatedItemId]
      order_by: [{ RatedItemId: desc }, { TestDate: desc }]
    ) {
      Rating
      RatedItemId
      ratedItem {
        risk {
          Id
          Title
        }
      }
    }
    appetites(
      order_by: [
        { EffectiveDate: desc_nulls_last }
        { CreatedAtTimestamp: desc_nulls_last }
      ]
    ) {
      ...AppetiteParts
      ImpactId
      parents {
        risk {
          Id
        }
      }
    }
  }
}

fragment ImpactParts on impact {
  CreatedAtTimestamp
  CreatedByUser
  Rationale
  RatingGuidance
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  Name
  CustomAttributeData
  SequentialId
  LikelihoodAppetite
}

fragment OwnerParts on owner {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment OwnerGroupParts on owner_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment AppetiteParts on appetite {
  Id
  LowerAppetite
  UpperAppetite
  ImpactAppetite
  LikelihoodAppetite
  Statement
  EffectiveDate
  AppetiteType
  CreatedAtTimestamp
  ModifiedAtTimestamp
  CreatedByUser
  ModifiedByUser
  CustomAttributeData
  SequentialId
  ImpactId
}`) as any;
export type GetImpactsQuery = any;
export type GetImpactsQueryVariables = any;
export type GetGetImpactsQuery = any;
export type getImpactsQuery = any;
export type getImpactsQueryVariables = any;

export const ImpactPartsDocument = parse(`fragment ImpactParts on impact {
  CreatedAtTimestamp
  CreatedByUser
  Rationale
  RatingGuidance
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  Name
  CustomAttributeData
  SequentialId
  LikelihoodAppetite
}`) as any;
export type ImpactPartsFragment = any;

export const InsertImpactDocument = parse(`mutation insertImpact(\$object: InsertImpactInput!) {
  insertImpactApi(object: \$object) {
    Id
  }
}`) as any;
export type InsertImpactMutation = any;
export type InsertImpactMutationVariables = any;
export type insertImpactMutation = any;
export type insertImpactMutationVariables = any;

export const UpdateImpactDocument = parse(`mutation updateImpact(\$object: UpdateImpactInput!) {
  updateImpactApi(object: \$object) {
    affected_rows
  }
}`) as any;
export type UpdateImpactMutation = any;
export type UpdateImpactMutationVariables = any;
export type updateImpactMutation = any;
export type updateImpactMutationVariables = any;

export const DeleteIndicatorResultsDocument = parse(`mutation deleteIndicatorResults(\$ids: [uuid!]) {
  delete_indicator_result(where: { Id: { _in: \$ids } }) {
    affected_rows
  }
}`) as any;
export type DeleteIndicatorResultsMutation = any;
export type DeleteIndicatorResultsMutationVariables = any;
export type deleteIndicatorResultsMutation = any;
export type deleteIndicatorResultsMutationVariables = any;

export const GetIndicatorResultAuditByIdDocument = parse(`query getIndicatorResultAuditById(\$id: uuid!) {
  indicator_result_audit(where: { Id: { _eq: \$id } }) {
    Description
    Id
    ResultDate
    TargetValueNum
    TargetValueTxt
    CustomAttributeData
    ModifiedByUser
    ModifiedAtTimestamp
    CreatedByUser
    CreatedAtTimestamp
  }
}`) as any;
export type GetIndicatorResultAuditByIdQuery = any;
export type GetIndicatorResultAuditByIdQueryVariables = any;
export type GetGetIndicatorResultAuditByIdQuery = any;
export type getIndicatorResultAuditByIdQuery = any;
export type getIndicatorResultAuditByIdQueryVariables = any;

export const GetIndicatorResultByIdDocument = parse(`query getIndicatorResultById(\$id: uuid!) {
  indicator_result(where: { Id: { _eq: \$id } }) {
    Description
    Id
    ResultDate
    TargetValueNum
    TargetValueTxt
    CustomAttributeData
    modifiedBy {
      FriendlyName
    }
    parent {
      Type
    }
    files {
      ...RelationFileParts
    }
  }
}

fragment RelationFileParts on relation_file {
  ParentId
  ChangeRequestFileOperation
  file {
    ...FileParts
  }
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}`) as any;
export type GetIndicatorResultByIdQuery = any;
export type GetIndicatorResultByIdQueryVariables = any;
export type GetGetIndicatorResultByIdQuery = any;
export type getIndicatorResultByIdQuery = any;
export type getIndicatorResultByIdQueryVariables = any;

export const GetIndicatorResultsByIndicatorIdDocument = parse(`query getIndicatorResultsByIndicatorId(\$indicatorId: uuid!) {
  indicator_result(
    where: { IndicatorId: { _eq: \$indicatorId } }
    order_by: { ResultDate: asc }
  ) {
    Description
    Id
    ResultDate
    TargetValueNum
    TargetValueTxt
    CustomAttributeData
    modifiedBy {
      FriendlyName
    }
    parent {
      Type
    }
  }
}`) as any;
export type GetIndicatorResultsByIndicatorIdQuery = any;
export type GetIndicatorResultsByIndicatorIdQueryVariables = any;
export type GetGetIndicatorResultsByIndicatorIdQuery = any;
export type getIndicatorResultsByIndicatorIdQuery = any;
export type getIndicatorResultsByIndicatorIdQueryVariables = any;

export const InsertIndicatorResultDocument = parse(`mutation insertIndicatorResult(
  \$Description: String
  \$IndicatorId: uuid!
  \$ResultDate: timestamptz!
  \$TargetValueNum: numeric
  \$TargetValueTxt: String
  \$CustomAttributeData: jsonb
) {
  insert_indicator_result_one(
    object: {
      Description: \$Description
      IndicatorId: \$IndicatorId
      ResultDate: \$ResultDate
      TargetValueNum: \$TargetValueNum
      TargetValueTxt: \$TargetValueTxt
      CustomAttributeData: \$CustomAttributeData
    }
  ) {
    Id
  }
}`) as any;
export type InsertIndicatorResultMutation = any;
export type InsertIndicatorResultMutationVariables = any;
export type insertIndicatorResultMutation = any;
export type insertIndicatorResultMutationVariables = any;

export const UpdateIndicatorResultDocument = parse(`mutation updateIndicatorResult(
  \$id: uuid!
  \$Description: String
  \$ResultDate: timestamptz!
  \$TargetValueNum: numeric
  \$TargetValueTxt: String
  \$CustomAttributeData: jsonb
) {
  update_indicator_result(
    where: { Id: { _eq: \$id } }
    _set: {
      Description: \$Description
      ResultDate: \$ResultDate
      TargetValueNum: \$TargetValueNum
      TargetValueTxt: \$TargetValueTxt
      CustomAttributeData: \$CustomAttributeData
    }
  ) {
    returning {
      Id
    }
  }
}`) as any;
export type UpdateIndicatorResultMutation = any;
export type UpdateIndicatorResultMutationVariables = any;
export type updateIndicatorResultMutation = any;
export type updateIndicatorResultMutationVariables = any;

export const DeleteIndicatorsDocument = parse(`mutation deleteIndicators(\$ids: [uuid!]) {
  delete_indicator_result(where: { IndicatorId: { _in: \$ids } }) {
    affected_rows
  }
  delete_indicator(where: { Id: { _in: \$ids } }) {
    affected_rows
  }
}`) as any;
export type DeleteIndicatorsMutation = any;
export type DeleteIndicatorsMutationVariables = any;
export type deleteIndicatorsMutation = any;
export type deleteIndicatorsMutationVariables = any;

export const GetIndicatorAuditByIdDocument = parse(`query getIndicatorAuditById(\$id: uuid) {
  indicator_audit(where: { Id: { _eq: \$id } }) {
    SequentialId
    Type
    UpperToleranceNum
    Unit
    Title
    TargetValueTxt
    LowerToleranceNum
    Id
    Description
    CustomAttributeData
    CreatedAtTimestamp
    CreatedByUser
    ModifiedAtTimestamp
    ModifiedByUser
    LowerAppetiteNum
    UpperAppetiteNum
  }
}`) as any;
export type GetIndicatorAuditByIdQuery = any;
export type GetIndicatorAuditByIdQueryVariables = any;
export type GetGetIndicatorAuditByIdQuery = any;
export type getIndicatorAuditByIdQuery = any;
export type getIndicatorAuditByIdQueryVariables = any;

export const GetIndicatorByIdDocument = parse(`query getIndicatorById(\$id: uuid) {
  indicator(where: { Id: { _eq: \$id } }) {
    ...IndicatorParts
    tags {
      ...TagParts
    }
    scheduleState {
      LatestDate
    }
    departments {
      ...DepartmentParts
    }
    owners {
      ...OwnerParts
    }
    contributors {
      ...ContributorParts
    }
    ownerGroups {
      ...OwnerGroupParts
    }
    contributorGroups {
      ...ContributorGroupParts
    }
    ancestorContributors {
      ...AncestorContributorParts
    }
    files {
      ...RelationFileParts
    }
  }
}

fragment IndicatorParts on indicator {
  SequentialId
  Type
  UpperToleranceNum
  Unit
  Title
  TargetValueTxt
  LowerToleranceNum
  Id
  Description
  CustomAttributeData
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
  LowerAppetiteNum
  UpperAppetiteNum
  schedule {
    ...ScheduleParts
  }
}

fragment ScheduleParts on schedule {
  Id
  Frequency
  ManualDueDate
  StartDate
  TimeToCompleteValue
  TimeToCompleteUnit
}

fragment TagParts on tag {
  type {
    Description
    Name
  }
  ParentId
  TagTypeId
}

fragment DepartmentParts on department {
  type {
    Description
    Name
  }
  ParentId
  DepartmentTypeId
}

fragment OwnerParts on owner {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment ContributorParts on contributor {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment OwnerGroupParts on owner_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment ContributorGroupParts on contributor_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment AncestorContributorParts on ancestor_contributor {
  ContributorType
  UserId
  Id
  AncestorId
  UserGroupId
  user {
    FriendlyName
  }
  user_group {
    Name
  }
}

fragment RelationFileParts on relation_file {
  ParentId
  ChangeRequestFileOperation
  file {
    ...FileParts
  }
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}`) as any;
export type GetIndicatorByIdQuery = any;
export type GetIndicatorByIdQueryVariables = any;
export type GetGetIndicatorByIdQuery = any;
export type getIndicatorByIdQuery = any;
export type getIndicatorByIdQueryVariables = any;

export const GetIndicatorTitlesByParentIdDocument = parse(`query getIndicatorTitlesByParentId(\$parentId: uuid) {
  indicator(where: { parents: { ParentId: { _eq: \$parentId } } }) {
    Title
    Id
  }
}`) as any;
export type GetIndicatorTitlesByParentIdQuery = any;
export type GetIndicatorTitlesByParentIdQueryVariables = any;
export type GetGetIndicatorTitlesByParentIdQuery = any;
export type getIndicatorTitlesByParentIdQuery = any;
export type getIndicatorTitlesByParentIdQueryVariables = any;

export const GetIndicatorsDocument = parse(`query getIndicators(
  \$where: indicator_bool_exp! = {}
  \$resultsWhere: indicator_result_bool_exp! = {}
) {
  indicator(where: \$where) {
    ...IndicatorParts
    scheduleState {
      LatestDate
      DueDate
      OverdueDate
    }
    createdBy {
      FriendlyName
    }
    modifiedBy {
      FriendlyName
    }
    owners {
      ...OwnerParts
    }
    ownerGroups {
      ...OwnerGroupParts
    }
    contributors {
      ...ContributorParts
    }
    contributorGroups {
      ...ContributorGroupParts
    }
    orderedResults: results(
      where: \$resultsWhere
      order_by: { ResultDate: desc_nulls_last }
    ) {
      TargetValueNum
      TargetValueTxt
      ResultDate
    }
    parents {
      parent {
        Id
        ObjectType
        SequentialId
      }
      control {
        Title
      }
      risk {
        Title
      }
    }
    tags {
      ...TagParts
    }
    departments {
      ...DepartmentParts
    }
  }
}

fragment IndicatorParts on indicator {
  SequentialId
  Type
  UpperToleranceNum
  Unit
  Title
  TargetValueTxt
  LowerToleranceNum
  Id
  Description
  CustomAttributeData
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
  LowerAppetiteNum
  UpperAppetiteNum
  schedule {
    ...ScheduleParts
  }
}

fragment ScheduleParts on schedule {
  Id
  Frequency
  ManualDueDate
  StartDate
  TimeToCompleteValue
  TimeToCompleteUnit
}

fragment OwnerParts on owner {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment OwnerGroupParts on owner_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment ContributorParts on contributor {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment ContributorGroupParts on contributor_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment TagParts on tag {
  type {
    Description
    Name
  }
  ParentId
  TagTypeId
}

fragment DepartmentParts on department {
  type {
    Description
    Name
  }
  ParentId
  DepartmentTypeId
}`) as any;
export type GetIndicatorsQuery = any;
export type GetIndicatorsQueryVariables = any;
export type GetGetIndicatorsQuery = any;
export type getIndicatorsQuery = any;
export type getIndicatorsQueryVariables = any;

export const GetIndicatorsByParentIdDocument = parse(`query getIndicatorsByParentId(\$parentId: uuid) {
  indicator(where: { parents: { ParentId: { _eq: \$parentId } } }) {
    ...IndicatorParts
    createdBy {
      FriendlyName
    }
    modifiedBy {
      FriendlyName
    }
    owners {
      ...OwnerParts
    }
    orderedResults: results(
      limit: 2
      order_by: { ResultDate: desc_nulls_last }
    ) {
      TargetValueNum
      TargetValueTxt
      ResultDate
    }
    parents {
      control {
        Title
      }
      risk {
        Title
      }
    }
    tags {
      ...TagParts
    }
    departments {
      ...DepartmentParts
    }
  }
}

fragment IndicatorParts on indicator {
  SequentialId
  Type
  UpperToleranceNum
  Unit
  Title
  TargetValueTxt
  LowerToleranceNum
  Id
  Description
  CustomAttributeData
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
  LowerAppetiteNum
  UpperAppetiteNum
  schedule {
    ...ScheduleParts
  }
}

fragment ScheduleParts on schedule {
  Id
  Frequency
  ManualDueDate
  StartDate
  TimeToCompleteValue
  TimeToCompleteUnit
}

fragment OwnerParts on owner {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment TagParts on tag {
  type {
    Description
    Name
  }
  ParentId
  TagTypeId
}

fragment DepartmentParts on department {
  type {
    Description
    Name
  }
  ParentId
  DepartmentTypeId
}`) as any;
export type GetIndicatorsByParentIdQuery = any;
export type GetIndicatorsByParentIdQueryVariables = any;
export type GetGetIndicatorsByParentIdQuery = any;
export type getIndicatorsByParentIdQuery = any;
export type getIndicatorsByParentIdQueryVariables = any;

export const IndicatorPartsDocument = parse(`fragment IndicatorParts on indicator {
  SequentialId
  Type
  UpperToleranceNum
  Unit
  Title
  TargetValueTxt
  LowerToleranceNum
  Id
  Description
  CustomAttributeData
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
  LowerAppetiteNum
  UpperAppetiteNum
  schedule {
    ...ScheduleParts
  }
}

fragment ScheduleParts on schedule {
  Id
  Frequency
  ManualDueDate
  StartDate
  TimeToCompleteValue
  TimeToCompleteUnit
}`) as any;
export type IndicatorPartsFragment = any;

export const InsertIndicatorDocument = parse(`mutation insertIndicator(\$object: InsertChildIndicatorInput) {
  insertChildIndicator(object: \$object) {
    Id
  }
}`) as any;
export type InsertIndicatorMutation = any;
export type InsertIndicatorMutationVariables = any;
export type insertIndicatorMutation = any;
export type insertIndicatorMutationVariables = any;

export const UpdateIndicatorDocument = parse(`mutation updateIndicator(\$object: UpdateChildIndicatorInput) {
  updateChildIndicator(object: \$object) {
    Id
  }
}`) as any;
export type UpdateIndicatorMutation = any;
export type UpdateIndicatorMutationVariables = any;
export type updateIndicatorMutation = any;
export type updateIndicatorMutationVariables = any;

export const DeleteIngestionConfigDocument = parse(`mutation deleteIngestionConfig(
  \$object: DeleteIngestionConfigInput!
) {
  deleteChildIngestionConfig(object: \$object) {
    Id
  }
}`) as any;
export type DeleteIngestionConfigMutation = any;
export type DeleteIngestionConfigMutationVariables = any;
export type deleteIngestionConfigMutation = any;
export type deleteIngestionConfigMutationVariables = any;

export const GetIngestionConfigsDocument = parse(`query getIngestionConfigs {
  ingestion_config {
    Id
    IngestionConfig
    SecretArn
    ModifiedAtTimestamp
  }
}`) as any;
export type GetIngestionConfigsQuery = any;
export type GetIngestionConfigsQueryVariables = any;
export type GetGetIngestionConfigsQuery = any;
export type getIngestionConfigsQuery = any;
export type getIngestionConfigsQueryVariables = any;

export const InsertIngestionConfigDocument = parse(`mutation insertIngestionConfig(
  \$object: InsertIngestionConfigInput!
) {
  insertChildIngestionConfig(object: \$object) {
    Id
  }
}`) as any;
export type InsertIngestionConfigMutation = any;
export type InsertIngestionConfigMutationVariables = any;
export type insertIngestionConfigMutation = any;
export type insertIngestionConfigMutationVariables = any;

export const UpdateIngestionConfigDocument = parse(`mutation updateIngestionConfig(
  \$object: UpdateIngestionConfigInput!
) {
  updateChildIngestionConfig(object: \$object) {
    Id
  }
}`) as any;
export type UpdateIngestionConfigMutation = any;
export type UpdateIngestionConfigMutationVariables = any;
export type updateIngestionConfigMutation = any;
export type updateIngestionConfigMutationVariables = any;

export const DeleteInternalAuditsDocument = parse(`mutation deleteInternalAudits(\$Ids: [uuid!]!) {
  delete_internal_audit_entity(where: { Id: { _in: \$Ids } }) {
    affected_rows
  }
}`) as any;
export type DeleteInternalAuditsMutation = any;
export type DeleteInternalAuditsMutationVariables = any;
export type deleteInternalAuditsMutation = any;
export type deleteInternalAuditsMutationVariables = any;

export const GetInternalAuditByIdDocument = parse(`query getInternalAuditById(\$id: uuid) {
  internal_audit_entity(where: { Id: { _eq: \$id } }) {
    ...InternalAuditEntityParts
    owners {
      ...OwnerParts
    }
    ownerGroups {
      ...OwnerGroupParts
    }
    contributors {
      ...ContributorParts
    }
    contributorGroups {
      ...ContributorGroupParts
    }
    modifiedByUser {
      FriendlyName
    }
    createdByUser {
      FriendlyName
    }
    tags {
      ...TagParts
    }
    departments {
      ...DepartmentParts
    }
    ancestorContributors {
      ...AncestorContributorParts
    }
  }
}

fragment InternalAuditEntityParts on internal_audit_entity {
  Id
  SequentialId
  Title
  Description
  CreatedByUser
  ModifiedByUser
  CreatedAtTimestamp
  ModifiedAtTimestamp
  CustomAttributeData
  businessArea {
    Title
    SequentialId
    Id
  }
}

fragment OwnerParts on owner {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment OwnerGroupParts on owner_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment ContributorParts on contributor {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment ContributorGroupParts on contributor_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment TagParts on tag {
  type {
    Description
    Name
  }
  ParentId
  TagTypeId
}

fragment DepartmentParts on department {
  type {
    Description
    Name
  }
  ParentId
  DepartmentTypeId
}

fragment AncestorContributorParts on ancestor_contributor {
  ContributorType
  UserId
  Id
  AncestorId
  UserGroupId
  user {
    FriendlyName
  }
  user_group {
    Name
  }
}`) as any;
export type GetInternalAuditByIdQuery = any;
export type GetInternalAuditByIdQueryVariables = any;
export type GetGetInternalAuditByIdQuery = any;
export type getInternalAuditByIdQuery = any;
export type getInternalAuditByIdQueryVariables = any;

export const GetInternalAuditsDocument = parse(`query getInternalAudits(\$where: internal_audit_entity_bool_exp! = {}) {
  internal_audit_entity(where: \$where) {
    ...InternalAuditEntityParts
    actions {
      action {
        ...ActionParts
      }
    }
    internalAuditReports {
      ...InternalAuditReportParts
    }
    issues {
      issue {
        ...IssueParts
        assessment {
          ...IssueAssessmentParts
        }
      }
    }
    owners {
      ...OwnerParts
    }
    ownerGroups {
      ...OwnerGroupParts
    }
    contributors {
      ...ContributorParts
    }
    contributorGroups {
      ...ContributorGroupParts
    }
    modifiedByUser {
      FriendlyName
    }
    createdByUser {
      FriendlyName
    }
    tags {
      ...TagParts
    }
    departments {
      ...DepartmentParts
    }
  }
}

fragment InternalAuditEntityParts on internal_audit_entity {
  Id
  SequentialId
  Title
  Description
  CreatedByUser
  ModifiedByUser
  CreatedAtTimestamp
  ModifiedAtTimestamp
  CustomAttributeData
  businessArea {
    Title
    SequentialId
    Id
  }
}

fragment ActionParts on action {
  DateDue
  DateRaised
  Description
  Id
  Priority
  Status
  ModifiedAtTimestamp
  CreatedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  ClosedDate
  CustomAttributeData
  SequentialId
}

fragment InternalAuditReportParts on internal_audit_report {
  ActualCompletionDate
  CompletedByUser
  CreatedAtTimestamp
  CreatedByUser
  CustomAttributeData
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  NextTestDate
  OriginatingItemId
  SequentialId
  StartDate
  Summary
  TargetCompletionDate
  Title
  Status
  Outcome
}

fragment IssueParts on issue {
  RaisedAtTimestamp
  DateIdentified
  DateOccurred
  Details
  Id
  ImpactsCustomer
  IsExternalIssue
  CreatedAtTimestamp
  ModifiedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  SequentialId
  CustomAttributeData
  Meta
  Type
}

fragment IssueAssessmentParts on issue_assessment {
  ActualCloseDate
  CertifiedIndividual
  IssueCausedBySystemIssue
  IssueCausedByThirdParty
  IssueType
  ParentIssueId
  PoliciesBreached
  PolicyBreach
  PolicyOwner
  PolicyOwnerCommentary
  Rationale
  RegulatoryBreach
  RegulationsBreached
  Reportable
  Severity
  Status
  SystemResponsible
  TargetCloseDate
  ThirdPartyResponsible
  CreatedAtTimestamp
  ModifiedAtTimestamp
  CreatedByUser
  ModifiedByUser
  Id
  CustomAttributeData
  Type
}

fragment OwnerParts on owner {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment OwnerGroupParts on owner_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment ContributorParts on contributor {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment ContributorGroupParts on contributor_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment TagParts on tag {
  type {
    Description
    Name
  }
  ParentId
  TagTypeId
}

fragment DepartmentParts on department {
  type {
    Description
    Name
  }
  ParentId
  DepartmentTypeId
}`) as any;
export type GetInternalAuditsQuery = any;
export type GetInternalAuditsQueryVariables = any;
export type GetGetInternalAuditsQuery = any;
export type getInternalAuditsQuery = any;
export type getInternalAuditsQueryVariables = any;

export const GetLinkedRisksByInternalAuditIdDocument = parse(`query getLinkedRisksByInternalAuditId(\$id: uuid) {
  linked_risks: linked_item(where: { Source: { _eq: \$id }, target_risk: {} }) {
    Id
    risk: target_risk {
      ...RiskParts
      createdByUser {
        FriendlyName
      }
      parent {
        Title
      }
      parentNode {
        Id
        ObjectType
        SequentialId
      }
      owners {
        ...OwnerParts
      }
      ownerGroups {
        ...OwnerGroupParts
      }
      contributors {
        ...ContributorParts
      }
      contributorGroups {
        ...ContributorGroupParts
      }
      ancestorContributors {
        ...AncestorContributorParts
      }
      appetites(
        limit: 1
        where: { appetite: { AppetiteType: { _eq: risk } } }
        order_by: [
          { appetite: { EffectiveDate: desc_nulls_last } }
          { appetite: { CreatedAtTimestamp: desc_nulls_last } }
        ]
      ) {
        appetite {
          LowerAppetite
          UpperAppetite
        }
      }
      impactRatings(
        where: { RatingType: { _in: ["assessment", "rating"] } }
        distinct_on: [ImpactId]
        order_by: [{ ImpactId: desc }, { TestDate: desc }]
      ) {
        Rating
        ImpactId
      }
      impactRatingsForTrend: impactRatings(
        where: { RatingType: { _in: ["assessment", "rating"] } }
        order_by: [{ TestDate: desc_nulls_last }]
        limit: 10
      ) {
        ImpactId
        Rating
        TestDate
      }
      assessmentResults(
        where: {
          riskAssessmentResult: {
            RatingType: { _in: ["assessment", "rating"] }
          }
        }
        order_by: [
          { riskAssessmentResult: { TestDate: desc_nulls_last } }
          { riskAssessmentResult: { CreatedAtTimestamp: desc_nulls_last } }
        ]
      ) {
        ParentId
        riskAssessmentResult {
          Id
          Rating
          ControlType
          Likelihood
          Impact
          CustomAttributeData
          CreatedAtTimestamp
          TestDate
        }
      }
      controls_aggregate {
        aggregate {
          count
        }
      }
      indicators_aggregate {
        aggregate {
          count
        }
      }
      actions_aggregate {
        aggregate {
          count
        }
      }
      tags {
        ...TagParts
      }
      departments {
        ...DepartmentParts
      }
    }
  }
}

fragment RiskParts on risk {
  Id
  Title
  Tier
  Description
  ParentRiskId
  CreatedByUser
  Treatment
  Status
  ModifiedByUser
  CreatedAtTimestamp
  ModifiedAtTimestamp
  CustomAttributeData
  SequentialId
  schedule {
    ...ScheduleParts
  }
}

fragment ScheduleParts on schedule {
  Id
  Frequency
  ManualDueDate
  StartDate
  TimeToCompleteValue
  TimeToCompleteUnit
}

fragment OwnerParts on owner {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment OwnerGroupParts on owner_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment ContributorParts on contributor {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment ContributorGroupParts on contributor_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment AncestorContributorParts on ancestor_contributor {
  ContributorType
  UserId
  Id
  AncestorId
  UserGroupId
  user {
    FriendlyName
  }
  user_group {
    Name
  }
}

fragment TagParts on tag {
  type {
    Description
    Name
  }
  ParentId
  TagTypeId
}

fragment DepartmentParts on department {
  type {
    Description
    Name
  }
  ParentId
  DepartmentTypeId
}`) as any;
export type GetLinkedRisksByInternalAuditIdQuery = any;
export type GetLinkedRisksByInternalAuditIdQueryVariables = any;
export type GetGetLinkedRisksByInternalAuditIdQuery = any;
export type getLinkedRisksByInternalAuditIdQuery = any;
export type getLinkedRisksByInternalAuditIdQueryVariables = any;

export const InsertInternalAuditDocument = parse(`mutation insertInternalAudit(\$Input: InsertInternalAuditInput) {
  insertInternalAudit(Input: \$Input) {
    Id
  }
}`) as any;
export type InsertInternalAuditMutation = any;
export type InsertInternalAuditMutationVariables = any;
export type insertInternalAuditMutation = any;
export type insertInternalAuditMutationVariables = any;

export const InternalAuditEntityPartsDocument = parse(`fragment InternalAuditEntityParts on internal_audit_entity {
  Id
  SequentialId
  Title
  Description
  CreatedByUser
  ModifiedByUser
  CreatedAtTimestamp
  ModifiedAtTimestamp
  CustomAttributeData
  businessArea {
    Title
    SequentialId
    Id
  }
}`) as any;
export type InternalAuditEntityPartsFragment = any;

export const UpdateInternalAuditDocument = parse(`mutation updateInternalAudit(\$Input: UpdateInternalAuditInput) {
  updateInternalAudit(Input: \$Input) {
    Id
  }
}`) as any;
export type UpdateInternalAuditMutation = any;
export type UpdateInternalAuditMutationVariables = any;
export type updateInternalAuditMutation = any;
export type updateInternalAuditMutationVariables = any;

export const InternalAuditReportPartsDocument = parse(`fragment InternalAuditReportParts on internal_audit_report {
  ActualCompletionDate
  CompletedByUser
  CreatedAtTimestamp
  CreatedByUser
  CustomAttributeData
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  NextTestDate
  OriginatingItemId
  SequentialId
  StartDate
  Summary
  TargetCompletionDate
  Title
  Status
  Outcome
}`) as any;
export type InternalAuditReportPartsFragment = any;

export const DeleteInternalAuditReportsDocument = parse(`mutation deleteInternalAuditReports(\$Ids: [uuid!]!) {
  delete_internal_audit_report(where: { Id: { _in: \$Ids } }) {
    affected_rows
  }
}`) as any;
export type DeleteInternalAuditReportsMutation = any;
export type DeleteInternalAuditReportsMutationVariables = any;
export type deleteInternalAuditReportsMutation = any;
export type deleteInternalAuditReportsMutationVariables = any;

export const GetInternalAuditReportByIdDocument = parse(`query getInternalAuditReportById(\$Id: uuid!) {
  internal_audit_report(where: { Id: { _eq: \$Id } }) {
    ...InternalAuditReportParts
    owners {
      ...OwnerParts
    }
    ownerGroups {
      ...OwnerGroupParts
    }
    contributors {
      ...ContributorParts
    }
    contributorGroups {
      ...ContributorGroupParts
    }
    contributors {
      ...ContributorParts
    }
    contributorGroups {
      UserGroupId
    }
    ancestorContributors {
      ...AncestorContributorParts
    }
    tags {
      ...TagParts
    }
    departments {
      ...DepartmentParts
    }
    completedByUser {
      FriendlyName
    }
  }
}

fragment InternalAuditReportParts on internal_audit_report {
  ActualCompletionDate
  CompletedByUser
  CreatedAtTimestamp
  CreatedByUser
  CustomAttributeData
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  NextTestDate
  OriginatingItemId
  SequentialId
  StartDate
  Summary
  TargetCompletionDate
  Title
  Status
  Outcome
}

fragment OwnerParts on owner {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment OwnerGroupParts on owner_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment ContributorParts on contributor {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment ContributorGroupParts on contributor_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment AncestorContributorParts on ancestor_contributor {
  ContributorType
  UserId
  Id
  AncestorId
  UserGroupId
  user {
    FriendlyName
  }
  user_group {
    Name
  }
}

fragment TagParts on tag {
  type {
    Description
    Name
  }
  ParentId
  TagTypeId
}

fragment DepartmentParts on department {
  type {
    Description
    Name
  }
  ParentId
  DepartmentTypeId
}`) as any;
export type GetInternalAuditReportByIdQuery = any;
export type GetInternalAuditReportByIdQueryVariables = any;
export type GetGetInternalAuditReportByIdQuery = any;
export type getInternalAuditReportByIdQuery = any;
export type getInternalAuditReportByIdQueryVariables = any;

export const GetInternalAuditReportsDocument = parse(`query getInternalAuditReports {
  internal_audit_report {
    ...InternalAuditReportParts
    owners {
      ...OwnerParts
    }
    ownerGroups {
      ...OwnerGroupParts
    }
    contributors {
      ...ContributorParts
    }
    contributorGroups {
      ...ContributorGroupParts
    }
    tags {
      ...TagParts
    }
    departments {
      ...DepartmentParts
    }
    completedByUser {
      FriendlyName
    }
    assessedItems: assessmentResults {
      controlledRiskAssessmentResult {
        Id
        parents(where: { ParentType: { _eq: risk } }) {
          risk {
            Id
            Title
          }
        }
      }
      uncontrolledRiskAssessmentResult {
        Id
        parents(where: { ParentType: { _eq: risk } }) {
          risk {
            Id
            Title
          }
        }
      }
      obligationAssessmentResult {
        Id
        parents(where: { ParentType: { _eq: obligation } }) {
          obligation {
            Id
            Title
          }
        }
      }
      documentAssessmentResult {
        Id
        parents(where: { ParentType: { _eq: document } }) {
          document {
            Id
            Title
          }
        }
      }
    }
  }
}

fragment InternalAuditReportParts on internal_audit_report {
  ActualCompletionDate
  CompletedByUser
  CreatedAtTimestamp
  CreatedByUser
  CustomAttributeData
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  NextTestDate
  OriginatingItemId
  SequentialId
  StartDate
  Summary
  TargetCompletionDate
  Title
  Status
  Outcome
}

fragment OwnerParts on owner {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment OwnerGroupParts on owner_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment ContributorParts on contributor {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment ContributorGroupParts on contributor_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment TagParts on tag {
  type {
    Description
    Name
  }
  ParentId
  TagTypeId
}

fragment DepartmentParts on department {
  type {
    Description
    Name
  }
  ParentId
  DepartmentTypeId
}`) as any;
export type GetInternalAuditReportsQuery = any;
export type GetInternalAuditReportsQueryVariables = any;
export type GetGetInternalAuditReportsQuery = any;
export type getInternalAuditReportsQuery = any;
export type getInternalAuditReportsQueryVariables = any;

export const GetInternalAuditReportsByOriginatingItemIdDocument = parse(`query getInternalAuditReportsByOriginatingItemId(\$OriginatingItemId: uuid!) {
  internal_audit_report(
    where: { OriginatingItemId: { _eq: \$OriginatingItemId } }
  ) {
    ...InternalAuditReportParts
    owners {
      ...OwnerParts
    }
    ownerGroups {
      ...OwnerGroupParts
    }
    contributors {
      ...ContributorParts
    }
    contributorGroups {
      ...ContributorGroupParts
    }
    contributors {
      ...ContributorParts
    }
    contributorGroups {
      UserGroupId
    }
    ancestorContributors {
      ...AncestorContributorParts
    }
    tags {
      ...TagParts
    }
    departments {
      ...DepartmentParts
    }
    completedByUser {
      FriendlyName
    }
    assessedItems: assessmentResults {
      controlledRiskAssessmentResult {
        Id
        parents(where: { ParentType: { _eq: risk } }) {
          risk {
            Id
            Title
          }
        }
      }
      uncontrolledRiskAssessmentResult {
        Id
        parents(where: { ParentType: { _eq: risk } }) {
          risk {
            Id
            Title
          }
        }
      }
      obligationAssessmentResult {
        Id
        parents(where: { ParentType: { _eq: obligation } }) {
          obligation {
            Id
            Title
          }
        }
      }
      documentAssessmentResult {
        Id
        parents(where: { ParentType: { _eq: document } }) {
          document {
            Id
            Title
          }
        }
      }
    }
  }
}

fragment InternalAuditReportParts on internal_audit_report {
  ActualCompletionDate
  CompletedByUser
  CreatedAtTimestamp
  CreatedByUser
  CustomAttributeData
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  NextTestDate
  OriginatingItemId
  SequentialId
  StartDate
  Summary
  TargetCompletionDate
  Title
  Status
  Outcome
}

fragment OwnerParts on owner {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment OwnerGroupParts on owner_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment ContributorParts on contributor {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment ContributorGroupParts on contributor_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment AncestorContributorParts on ancestor_contributor {
  ContributorType
  UserId
  Id
  AncestorId
  UserGroupId
  user {
    FriendlyName
  }
  user_group {
    Name
  }
}

fragment TagParts on tag {
  type {
    Description
    Name
  }
  ParentId
  TagTypeId
}

fragment DepartmentParts on department {
  type {
    Description
    Name
  }
  ParentId
  DepartmentTypeId
}`) as any;
export type GetInternalAuditReportsByOriginatingItemIdQuery = any;
export type GetInternalAuditReportsByOriginatingItemIdQueryVariables = any;
export type GetGetInternalAuditReportsByOriginatingItemIdQuery = any;
export type getInternalAuditReportsByOriginatingItemIdQuery = any;
export type getInternalAuditReportsByOriginatingItemIdQueryVariables = any;

export const InsertInternalAuditReportDocument = parse(`mutation insertInternalAuditReport(\$object: InsertAssessmentInput!) {
  insertInternalAuditReportApi(object: \$object) {
    Id
  }
}`) as any;
export type InsertInternalAuditReportMutation = any;
export type InsertInternalAuditReportMutationVariables = any;
export type insertInternalAuditReportMutation = any;
export type insertInternalAuditReportMutationVariables = any;

export const UpdateInternalAuditReportDocument = parse(`mutation updateInternalAuditReport(\$object: UpdateAssessmentInput!) {
  updateInternalAuditReportApi(object: \$object) {
    affected_rows
  }
}`) as any;
export type UpdateInternalAuditReportMutation = any;
export type UpdateInternalAuditReportMutationVariables = any;
export type updateInternalAuditReportMutation = any;
export type updateInternalAuditReportMutationVariables = any;

export const DeleteInternalAuditResultsDocument = parse(`mutation deleteInternalAuditResults(\$Ids: [uuid!]!) {
  delete_document_internal_audit_result(where: { Id: { _in: \$Ids } }) {
    affected_rows
  }

  delete_obligation_internal_audit_result(where: { Id: { _in: \$Ids } }) {
    affected_rows
  }

  delete_risk_controlled_internal_audit_result(where: { Id: { _in: \$Ids } }) {
    affected_rows
  }

  delete_risk_uncontrolled_internal_audit_result(where: { Id: { _in: \$Ids } }) {
    affected_rows
  }

  delete_control_test_internal_audit_result(where: { Id: { _in: \$Ids } }) {
    affected_rows
  }

  delete_control_test_internal_audit_result(where: { Id: { _in: \$Ids } }) {
    affected_rows
  }

  delete_impact_internal_audit_rating(where: { Id: { _in: \$Ids } }) {
    affected_rows
  }
}`) as any;
export type DeleteInternalAuditResultsMutation = any;
export type DeleteInternalAuditResultsMutationVariables = any;
export type deleteInternalAuditResultsMutation = any;
export type deleteInternalAuditResultsMutationVariables = any;

export const GetAllInternalAuditReportResultsDocument = parse(`query getAllInternalAuditReportResults {
  document_internal_audit_result(
    order_by: { CreatedByUser: asc }
    where: { parents: { internalAuditReport: {} } }
  ) {
    ...DocumentInternalAuditResultParts
    internalAuditReports: parents(
      where: { ParentType: { _eq: internal_audit_report } }
    ) {
      internalAuditReport {
        Id
        Title
        ActualCompletionDate
        StartDate
        Status
        completedByUser {
          FriendlyName
        }
      }
    }
    documents: parents(where: { ParentType: { _eq: document } }) {
      document {
        Id
        Title
      }
      node {
        Id
        SequentialId
        ObjectType
      }
    }
    files {
      ...RelationFileParts
    }
  }

  obligation_internal_audit_result(
    order_by: { CreatedByUser: asc }
    where: { parents: { internalAuditReport: {} } }
  ) {
    ...ObligationInternalAuditResultParts
    internalAuditReports: parents(
      where: { ParentType: { _eq: internal_audit_report } }
    ) {
      internalAuditReport {
        Id
        Title
        ActualCompletionDate
        StartDate
        Status
        completedByUser {
          FriendlyName
        }
      }
    }
    obligations: parents(where: { ParentType: { _eq: obligation } }) {
      obligation {
        Id
        Title
      }
      node {
        Id
        SequentialId
        ObjectType
      }
    }
    files {
      ...RelationFileParts
    }
  }

  risk_uncontrolled_internal_audit_result(
    order_by: { CreatedByUser: asc }
    where: { parents: { internalAuditReport: {} } }
  ) {
    ...RiskUncontrolledInternalAuditResultParts
    internalAuditReports: parents(
      where: { ParentType: { _eq: internal_audit_report } }
    ) {
      internalAuditReport {
        Id
        Title
        ActualCompletionDate
        StartDate
        Status
        completedByUser {
          FriendlyName
        }
      }
    }
    risks: parents(where: { ParentType: { _eq: risk } }) {
      risk {
        Id
        Title
      }
      node {
        Id
        SequentialId
        ObjectType
      }
    }
    files {
      ...RelationFileParts
    }
  }

  risk_controlled_internal_audit_result(
    order_by: { CreatedByUser: asc }
    where: { parents: { internalAuditReport: {} } }
  ) {
    ...RiskControlledInternalAuditResultParts
    internalAuditReports: parents(
      where: { ParentType: { _eq: internal_audit_report } }
    ) {
      internalAuditReport {
        Id
        Title
        ActualCompletionDate
        StartDate
        Status
        completedByUser {
          FriendlyName
        }
      }
    }
    risks: parents(where: { ParentType: { _eq: risk } }) {
      risk {
        Id
        Title
      }
      node {
        Id
        SequentialId
        ObjectType
      }
    }
    files {
      ...RelationFileParts
    }
  }
}

fragment DocumentInternalAuditResultParts on document_internal_audit_result {
  Id
  Rating
  CustomAttributeData
  Rationale
  TestDate
}

fragment RelationFileParts on relation_file {
  ParentId
  ChangeRequestFileOperation
  file {
    ...FileParts
  }
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}

fragment ObligationInternalAuditResultParts on obligation_internal_audit_result {
  Id
  Rating
  CustomAttributeData
  Rationale
  TestDate
}

fragment RiskUncontrolledInternalAuditResultParts on risk_uncontrolled_internal_audit_result {
  Id
  Likelihood
  Impact
  Rating
  CustomAttributeData
  Rationale
  TestDate
}

fragment RiskControlledInternalAuditResultParts on risk_controlled_internal_audit_result {
  Id
  Likelihood
  Impact
  Rating
  CustomAttributeData
  Rationale
  TestDate
}`) as any;
export type GetAllInternalAuditReportResultsQuery = any;
export type GetAllInternalAuditReportResultsQueryVariables = any;
export type GetGetAllInternalAuditReportResultsQuery = any;
export type getAllInternalAuditReportResultsQuery = any;
export type getAllInternalAuditReportResultsQueryVariables = any;

export const GetDocumentInternalAuditResultByIdDocument = parse(`query getDocumentInternalAuditResultById(\$Id: uuid!) {
  document_internal_audit_result(where: { Id: { _eq: \$Id } }) {
    ...DocumentInternalAuditResultParts
    parents {
      document {
        Id
        Title
      }
      internalAuditReport {
        Id
        Title
      }
    }
    files {
      ...RelationFileParts
    }
  }
}

fragment DocumentInternalAuditResultParts on document_internal_audit_result {
  Id
  Rating
  CustomAttributeData
  Rationale
  TestDate
}

fragment RelationFileParts on relation_file {
  ParentId
  ChangeRequestFileOperation
  file {
    ...FileParts
  }
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}`) as any;
export type GetDocumentInternalAuditResultByIdQuery = any;
export type GetDocumentInternalAuditResultByIdQueryVariables = any;
export type GetGetDocumentInternalAuditResultByIdQuery = any;
export type getDocumentInternalAuditResultByIdQuery = any;
export type getDocumentInternalAuditResultByIdQueryVariables = any;

export const GetInternalAuditReportDocumentAssessmentResultsByDocumentIdDocument = parse(`query getInternalAuditReportDocumentAssessmentResultsByDocumentId(
  \$ParentId: uuid!
) {
  document_internal_audit_result(
    where: { parents: { ParentId: { _eq: \$ParentId } } }
  ) {
    ...DocumentInternalAuditResultParts
    files {
      ...RelationFileParts
    }
    parents(where: { ParentType: { _eq: internal_audit_report } }) {
      internalAuditReport {
        ...InternalAuditReportParts
        completedByUser {
          FriendlyName
        }
      }
    }
  }
}

fragment DocumentInternalAuditResultParts on document_internal_audit_result {
  Id
  Rating
  CustomAttributeData
  Rationale
  TestDate
}

fragment RelationFileParts on relation_file {
  ParentId
  ChangeRequestFileOperation
  file {
    ...FileParts
  }
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}

fragment InternalAuditReportParts on internal_audit_report {
  ActualCompletionDate
  CompletedByUser
  CreatedAtTimestamp
  CreatedByUser
  CustomAttributeData
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  NextTestDate
  OriginatingItemId
  SequentialId
  StartDate
  Summary
  TargetCompletionDate
  Title
  Status
  Outcome
}`) as any;
export type GetInternalAuditReportDocumentAssessmentResultsByDocumentIdQuery = any;
export type GetInternalAuditReportDocumentAssessmentResultsByDocumentIdQueryVariables = any;
export type GetGetInternalAuditReportDocumentAssessmentResultsByDocumentIdQuery = any;
export type getInternalAuditReportDocumentAssessmentResultsByDocumentIdQuery = any;
export type getInternalAuditReportDocumentAssessmentResultsByDocumentIdQueryVariables = any;

export const GetInternalAuditReportObligationAssessmentResultsByObligationIdDocument = parse(`query getInternalAuditReportObligationAssessmentResultsByObligationId(
  \$ObligationId: uuid!
) {
  obligation_internal_audit_result(
    where: { parents: { ParentId: { _eq: \$ObligationId } } }
  ) {
    ...ObligationInternalAuditResultParts
    files {
      ...RelationFileParts
    }
    parents(where: { ParentType: { _eq: internal_audit_report } }) {
      internalAuditReport {
        ...InternalAuditReportParts
        completedByUser {
          FriendlyName
        }
      }
    }
  }
}

fragment ObligationInternalAuditResultParts on obligation_internal_audit_result {
  Id
  Rating
  CustomAttributeData
  Rationale
  TestDate
}

fragment RelationFileParts on relation_file {
  ParentId
  ChangeRequestFileOperation
  file {
    ...FileParts
  }
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}

fragment InternalAuditReportParts on internal_audit_report {
  ActualCompletionDate
  CompletedByUser
  CreatedAtTimestamp
  CreatedByUser
  CustomAttributeData
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  NextTestDate
  OriginatingItemId
  SequentialId
  StartDate
  Summary
  TargetCompletionDate
  Title
  Status
  Outcome
}`) as any;
export type GetInternalAuditReportObligationAssessmentResultsByObligationIdQuery = any;
export type GetInternalAuditReportObligationAssessmentResultsByObligationIdQueryVariables = any;
export type GetGetInternalAuditReportObligationAssessmentResultsByObligationIdQuery = any;
export type getInternalAuditReportObligationAssessmentResultsByObligationIdQuery = any;
export type getInternalAuditReportObligationAssessmentResultsByObligationIdQueryVariables = any;

export const GetInternalAuditReportRiskAssessmentResultsByRiskIdDocument = parse(`query getInternalAuditReportRiskAssessmentResultsByRiskId(\$RiskId: uuid!) {
  risk_controlled_internal_audit_result(
    where: { parents: { ParentId: { _eq: \$RiskId } } }
    order_by: [{ CreatedAtTimestamp: desc }]
  ) {
    ...RiskControlledInternalAuditResultParts
    parents(where: { ParentType: { _eq: internal_audit_report } }) {
      internalAuditReport {
        ...InternalAuditReportParts
        completedByUser {
          FriendlyName
        }
      }
    }
  }

  risk_uncontrolled_internal_audit_result(
    where: { parents: { ParentId: { _eq: \$RiskId } } }
    order_by: [{ CreatedAtTimestamp: desc }]
  ) {
    ...RiskUncontrolledInternalAuditResultParts
    parents(where: { ParentType: { _eq: internal_audit_report } }) {
      internalAuditReport {
        ...InternalAuditReportParts
        completedByUser {
          FriendlyName
        }
      }
    }
  }
}

fragment RiskControlledInternalAuditResultParts on risk_controlled_internal_audit_result {
  Id
  Likelihood
  Impact
  Rating
  CustomAttributeData
  Rationale
  TestDate
}

fragment InternalAuditReportParts on internal_audit_report {
  ActualCompletionDate
  CompletedByUser
  CreatedAtTimestamp
  CreatedByUser
  CustomAttributeData
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  NextTestDate
  OriginatingItemId
  SequentialId
  StartDate
  Summary
  TargetCompletionDate
  Title
  Status
  Outcome
}

fragment RiskUncontrolledInternalAuditResultParts on risk_uncontrolled_internal_audit_result {
  Id
  Likelihood
  Impact
  Rating
  CustomAttributeData
  Rationale
  TestDate
}`) as any;
export type GetInternalAuditReportRiskAssessmentResultsByRiskIdQuery = any;
export type GetInternalAuditReportRiskAssessmentResultsByRiskIdQueryVariables = any;
export type GetGetInternalAuditReportRiskAssessmentResultsByRiskIdQuery = any;
export type getInternalAuditReportRiskAssessmentResultsByRiskIdQuery = any;
export type getInternalAuditReportRiskAssessmentResultsByRiskIdQueryVariables = any;

export const GetInternalAuditReportTestResultsByControlIdDocument = parse(`query getInternalAuditReportTestResultsByControlId(\$controlId: uuid) {
  control_test_internal_audit_result(
    where: { ParentControlId: { _eq: \$controlId } }
  ) {
    ...ControlTestInternalAuditResultParts
    submitter {
      FriendlyName
    }
    files {
      ...RelationFileParts
    }
    parents(where: { ParentType: { _eq: internal_audit_report } }) {
      internalAuditReport {
        ...InternalAuditReportParts
        completedByUser {
          FriendlyName
        }
      }
    }
  }
}

fragment ControlTestInternalAuditResultParts on control_test_internal_audit_result {
  Description
  DesignEffectiveness
  Id
  OverallEffectiveness
  ParentControlId
  PerformanceEffectiveness
  Submitter
  TestDate
  TestType
  CreatedAtTimestamp
  ModifiedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  CustomAttributeData
  SequentialId
}

fragment RelationFileParts on relation_file {
  ParentId
  ChangeRequestFileOperation
  file {
    ...FileParts
  }
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}

fragment InternalAuditReportParts on internal_audit_report {
  ActualCompletionDate
  CompletedByUser
  CreatedAtTimestamp
  CreatedByUser
  CustomAttributeData
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  NextTestDate
  OriginatingItemId
  SequentialId
  StartDate
  Summary
  TargetCompletionDate
  Title
  Status
  Outcome
}`) as any;
export type GetInternalAuditReportTestResultsByControlIdQuery = any;
export type GetInternalAuditReportTestResultsByControlIdQueryVariables = any;
export type GetGetInternalAuditReportTestResultsByControlIdQuery = any;
export type getInternalAuditReportTestResultsByControlIdQuery = any;
export type getInternalAuditReportTestResultsByControlIdQueryVariables = any;

export const GetInternalAuditResultByIdDocument = parse(`query getInternalAuditResultById(\$Id: uuid!) {
  internal_audit_result_parent(where: { Id: { _eq: \$Id } }) {
    Id
    ParentId
    ResultType
    ParentType
    obligationAssessmentResult {
      ...ObligationInternalAuditResultParts
    }
    documentAssessmentResult {
      ...DocumentInternalAuditResultParts
    }
    controlledRiskAssessmentResult {
      ...RiskControlledInternalAuditResultParts
    }
    uncontrolledRiskAssessmentResult {
      ...RiskUncontrolledInternalAuditResultParts
    }
    testResult {
      ...ControlTestInternalAuditResultParts
    }
    impactRating {
      ...ImpactInternalAuditRatingParts
    }
  }
}

fragment ObligationInternalAuditResultParts on obligation_internal_audit_result {
  Id
  Rating
  CustomAttributeData
  Rationale
  TestDate
}

fragment DocumentInternalAuditResultParts on document_internal_audit_result {
  Id
  Rating
  CustomAttributeData
  Rationale
  TestDate
}

fragment RiskControlledInternalAuditResultParts on risk_controlled_internal_audit_result {
  Id
  Likelihood
  Impact
  Rating
  CustomAttributeData
  Rationale
  TestDate
}

fragment RiskUncontrolledInternalAuditResultParts on risk_uncontrolled_internal_audit_result {
  Id
  Likelihood
  Impact
  Rating
  CustomAttributeData
  Rationale
  TestDate
}

fragment ControlTestInternalAuditResultParts on control_test_internal_audit_result {
  Description
  DesignEffectiveness
  Id
  OverallEffectiveness
  ParentControlId
  PerformanceEffectiveness
  Submitter
  TestDate
  TestType
  CreatedAtTimestamp
  ModifiedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  CustomAttributeData
  SequentialId
}

fragment ImpactInternalAuditRatingParts on impact_internal_audit_rating {
  CreatedAtTimestamp
  CreatedByUser
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  CustomAttributeData
  SequentialId
  Rating
  RatedItemId
  ImpactId
  TestDate
  CompletedBy
  Likelihood
}`) as any;
export type GetInternalAuditResultByIdQuery = any;
export type GetInternalAuditResultByIdQueryVariables = any;
export type GetGetInternalAuditResultByIdQuery = any;
export type getInternalAuditResultByIdQuery = any;
export type getInternalAuditResultByIdQueryVariables = any;

export const GetInternalAuditResultsByParentIdDocument = parse(`query getInternalAuditResultsByParentId(\$ParentId: uuid!) {
  document_internal_audit_result(
    where: { parents: { ParentId: { _eq: \$ParentId } } }
    order_by: [{ TestDate: desc_nulls_last }, { CreatedAtTimestamp: desc }]
  ) {
    ...DocumentInternalAuditResultParts
    parents(where: { ParentType: { _eq: document } }) {
      document {
        Id
        Title
      }
      node {
        Id
        SequentialId
        ObjectType
      }
    }
    files {
      ...RelationFileParts
    }
    ancestorContributors {
      ...AncestorContributorParts
    }
  }

  obligation_internal_audit_result(
    where: { parents: { ParentId: { _eq: \$ParentId } } }
    order_by: [{ TestDate: desc_nulls_last }, { CreatedAtTimestamp: desc }]
  ) {
    ...ObligationInternalAuditResultParts
    parents(where: { ParentType: { _eq: obligation } }) {
      obligation {
        Id
        Title
      }
      node {
        Id
        SequentialId
        ObjectType
      }
    }
    files {
      ...RelationFileParts
    }
    ancestorContributors {
      ...AncestorContributorParts
    }
  }

  risk_controlled_internal_audit_result(
    where: { parents: { ParentId: { _eq: \$ParentId } } }
    order_by: [{ TestDate: desc_nulls_last }, { CreatedAtTimestamp: desc }]
  ) {
    ...RiskControlledInternalAuditResultParts
    parents(where: { ParentType: { _eq: risk } }) {
      risk {
        Id
        Title
      }
      node {
        Id
        SequentialId
        ObjectType
      }
    }
    files {
      ...RelationFileParts
    }
    ancestorContributors {
      ...AncestorContributorParts
    }
  }

  risk_uncontrolled_internal_audit_result(
    where: { parents: { ParentId: { _eq: \$ParentId } } }
    order_by: [{ TestDate: desc_nulls_last }, { CreatedAtTimestamp: desc }]
  ) {
    ...RiskUncontrolledInternalAuditResultParts
    parents(where: { ParentType: { _eq: risk } }) {
      risk {
        Id
        Title
      }
      node {
        Id
        SequentialId
        ObjectType
      }
    }
    files {
      ...RelationFileParts
    }
    ancestorContributors {
      ...AncestorContributorParts
    }
  }

  control_test_internal_audit_result(
    where: { parents: { ParentId: { _eq: \$ParentId } } }
    order_by: [{ TestDate: desc_nulls_last }, { CreatedAtTimestamp: desc }]
  ) {
    ...ControlTestInternalAuditResultParts
    parent {
      ...ControlParts
    }
    files {
      ...RelationFileParts
    }
  }

  impact_internal_audit_rating(
    where: { parents: { ParentId: { _eq: \$ParentId } } }
  ) {
    ...ImpactInternalAuditRatingParts
    createdByUser {
      FriendlyName
    }
    completedBy {
      FriendlyName
    }
    impact {
      Id
      Name
    }
    ratedItem {
      risk {
        Title
      }
      ObjectType
    }
  }

  issue(where: { parents: { ParentId: { _eq: \$ParentId } } }) {
    ...IssueParts
    consequences {
      CostType
      CostValue
      Type
    }
    owners {
      ...OwnerParts
    }
    ownerGroups {
      ...OwnerGroupParts
    }
    contributors {
      ...ContributorParts
    }
    contributorGroups {
      ...ContributorGroupParts
    }
    ancestorContributors {
      ...AncestorContributorParts
    }
    assessment {
      ...IssueAssessmentParts
      modifiedByUser {
        FriendlyName
      }
      createdByUser {
        FriendlyName
      }
      certifiedIndividual {
        FriendlyName
      }
      departments {
        ...DepartmentParts
      }
    }
    actions_aggregate(where: { action: { Status: { _eq: open } } }) {
      aggregate {
        count
      }
    }
    modifiedByUser {
      FriendlyName
    }
    createdByUser {
      FriendlyName
    }
    departments {
      ...DepartmentParts
    }
    tags {
      ...TagParts
    }
    parents {
      obligation {
        Title
        Id
      }
      document {
        Title
        Id
      }
      control {
        Title
        Id
      }
      assessment {
        Title
        Id
      }
    }
  }

  impact(where: { parents: { ParentId: { _eq: \$ParentId } } }) {
    ...ImpactParts
    createdByUser {
      FriendlyName
    }
    owners {
      ...OwnerParts
    }
    ownerGroups {
      ...OwnerGroupParts
    }
    ratings(
      distinct_on: [RatedItemId]
      order_by: [{ RatedItemId: desc }, { TestDate: desc }]
    ) {
      Rating
      RatedItemId
      ratedItem {
        risk {
          Id
          Title
        }
      }
    }
    appetites(
      order_by: [
        { EffectiveDate: desc_nulls_last }
        { CreatedAtTimestamp: desc_nulls_last }
      ]
    ) {
      ...AppetiteParts
      ImpactId
      parents {
        risk {
          Id
        }
      }
    }
  }

  action(where: { parents: { ParentId: { _eq: \$ParentId } } }) {
    ...ActionParts
    parents {
      parent {
        Id
        ObjectType
        SequentialId
      }
      obligation {
        Title
        Id
      }
      risk {
        Title
        Id
      }
      control {
        Title
        Id
      }
      issue {
        Title
        Id
        Type
      }
      document {
        Title
        Id
      }
      assessment {
        Title
        Id
      }
    }
    updates(order_by: { CreatedAtTimestamp: desc }, limit: 1) {
      ...ActionUpdateParts
    }
    updates_aggregate {
      aggregate {
        count
      }
    }
    owners {
      ...OwnerParts
    }
    ownerGroups {
      ...OwnerGroupParts
    }
    contributors {
      ...ContributorParts
    }
    contributorGroups {
      ...ContributorGroupParts
    }
    ancestorContributors {
      ...AncestorContributorParts
    }
    modifiedByUser {
      FriendlyName
    }
    createdByUser {
      FriendlyName
    }
    tags {
      ...TagParts
    }
    departments {
      ...DepartmentParts
    }
  }
}

fragment DocumentInternalAuditResultParts on document_internal_audit_result {
  Id
  Rating
  CustomAttributeData
  Rationale
  TestDate
}

fragment RelationFileParts on relation_file {
  ParentId
  ChangeRequestFileOperation
  file {
    ...FileParts
  }
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}

fragment AncestorContributorParts on ancestor_contributor {
  ContributorType
  UserId
  Id
  AncestorId
  UserGroupId
  user {
    FriendlyName
  }
  user_group {
    Name
  }
}

fragment ObligationInternalAuditResultParts on obligation_internal_audit_result {
  Id
  Rating
  CustomAttributeData
  Rationale
  TestDate
}

fragment RiskControlledInternalAuditResultParts on risk_controlled_internal_audit_result {
  Id
  Likelihood
  Impact
  Rating
  CustomAttributeData
  Rationale
  TestDate
}

fragment RiskUncontrolledInternalAuditResultParts on risk_uncontrolled_internal_audit_result {
  Id
  Likelihood
  Impact
  Rating
  CustomAttributeData
  Rationale
  TestDate
}

fragment ControlTestInternalAuditResultParts on control_test_internal_audit_result {
  Description
  DesignEffectiveness
  Id
  OverallEffectiveness
  ParentControlId
  PerformanceEffectiveness
  Submitter
  TestDate
  TestType
  CreatedAtTimestamp
  ModifiedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  CustomAttributeData
  SequentialId
}

fragment ControlParts on control {
  CreatedByUser
  ModifiedByUser
  Description
  Id
  CreatedAtTimestamp
  ModifiedAtTimestamp
  Title
  Type
  CustomAttributeData
  SequentialId
  schedule {
    ...ScheduleParts
  }
}

fragment ScheduleParts on schedule {
  Id
  Frequency
  ManualDueDate
  StartDate
  TimeToCompleteValue
  TimeToCompleteUnit
}

fragment ImpactInternalAuditRatingParts on impact_internal_audit_rating {
  CreatedAtTimestamp
  CreatedByUser
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  CustomAttributeData
  SequentialId
  Rating
  RatedItemId
  ImpactId
  TestDate
  CompletedBy
  Likelihood
}

fragment IssueParts on issue {
  RaisedAtTimestamp
  DateIdentified
  DateOccurred
  Details
  Id
  ImpactsCustomer
  IsExternalIssue
  CreatedAtTimestamp
  ModifiedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  SequentialId
  CustomAttributeData
  Meta
  Type
}

fragment OwnerParts on owner {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment OwnerGroupParts on owner_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment ContributorParts on contributor {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment ContributorGroupParts on contributor_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment IssueAssessmentParts on issue_assessment {
  ActualCloseDate
  CertifiedIndividual
  IssueCausedBySystemIssue
  IssueCausedByThirdParty
  IssueType
  ParentIssueId
  PoliciesBreached
  PolicyBreach
  PolicyOwner
  PolicyOwnerCommentary
  Rationale
  RegulatoryBreach
  RegulationsBreached
  Reportable
  Severity
  Status
  SystemResponsible
  TargetCloseDate
  ThirdPartyResponsible
  CreatedAtTimestamp
  ModifiedAtTimestamp
  CreatedByUser
  ModifiedByUser
  Id
  CustomAttributeData
  Type
}

fragment DepartmentParts on department {
  type {
    Description
    Name
  }
  ParentId
  DepartmentTypeId
}

fragment TagParts on tag {
  type {
    Description
    Name
  }
  ParentId
  TagTypeId
}

fragment ImpactParts on impact {
  CreatedAtTimestamp
  CreatedByUser
  Rationale
  RatingGuidance
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  Name
  CustomAttributeData
  SequentialId
  LikelihoodAppetite
}

fragment AppetiteParts on appetite {
  Id
  LowerAppetite
  UpperAppetite
  ImpactAppetite
  LikelihoodAppetite
  Statement
  EffectiveDate
  AppetiteType
  CreatedAtTimestamp
  ModifiedAtTimestamp
  CreatedByUser
  ModifiedByUser
  CustomAttributeData
  SequentialId
  ImpactId
}

fragment ActionParts on action {
  DateDue
  DateRaised
  Description
  Id
  Priority
  Status
  ModifiedAtTimestamp
  CreatedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  ClosedDate
  CustomAttributeData
  SequentialId
}

fragment ActionUpdateParts on action_update {
  Description
  Id
  ParentActionId
  CreatedAtTimestamp
  ModifiedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  CustomAttributeData
}`) as any;
export type GetInternalAuditResultsByParentIdQuery = any;
export type GetInternalAuditResultsByParentIdQueryVariables = any;
export type GetGetInternalAuditResultsByParentIdQuery = any;
export type getInternalAuditResultsByParentIdQuery = any;
export type getInternalAuditResultsByParentIdQueryVariables = any;

export const GetInternalAuditTestResultByIdDocument = parse(`query getInternalAuditTestResultById(\$Id: uuid) {
  control_test_internal_audit_result(where: { Id: { _eq: \$Id } }) {
    ...ControlTestInternalAuditResultParts
    files {
      ...RelationFileParts
    }
  }
}

fragment ControlTestInternalAuditResultParts on control_test_internal_audit_result {
  Description
  DesignEffectiveness
  Id
  OverallEffectiveness
  ParentControlId
  PerformanceEffectiveness
  Submitter
  TestDate
  TestType
  CreatedAtTimestamp
  ModifiedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  CustomAttributeData
  SequentialId
}

fragment RelationFileParts on relation_file {
  ParentId
  ChangeRequestFileOperation
  file {
    ...FileParts
  }
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}`) as any;
export type GetInternalAuditTestResultByIdQuery = any;
export type GetInternalAuditTestResultByIdQueryVariables = any;
export type GetGetInternalAuditTestResultByIdQuery = any;
export type getInternalAuditTestResultByIdQuery = any;
export type getInternalAuditTestResultByIdQueryVariables = any;

export const GetLatestInternalAuditReportDocumentAssessmentResultByDocumentIdDocument = parse(`query getLatestInternalAuditReportDocumentAssessmentResultByDocumentId(
  \$DocumentId: uuid!
) {
  document_internal_audit_result(
    where: { parents: { ParentId: { _eq: \$DocumentId } } }
    order_by: [{ TestDate: desc_nulls_last }, { CreatedAtTimestamp: desc }]
    limit: 1
  ) {
    ...DocumentInternalAuditResultParts
    ancestorContributors {
      ...AncestorContributorParts
    }
    parents(where: { ParentType: { _eq: internal_audit_report } }) {
      internalAuditReport {
        ...InternalAuditReportParts
        completedByUser {
          FriendlyName
        }
      }
    }
  }
}

fragment DocumentInternalAuditResultParts on document_internal_audit_result {
  Id
  Rating
  CustomAttributeData
  Rationale
  TestDate
}

fragment AncestorContributorParts on ancestor_contributor {
  ContributorType
  UserId
  Id
  AncestorId
  UserGroupId
  user {
    FriendlyName
  }
  user_group {
    Name
  }
}

fragment InternalAuditReportParts on internal_audit_report {
  ActualCompletionDate
  CompletedByUser
  CreatedAtTimestamp
  CreatedByUser
  CustomAttributeData
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  NextTestDate
  OriginatingItemId
  SequentialId
  StartDate
  Summary
  TargetCompletionDate
  Title
  Status
  Outcome
}`) as any;
export type GetLatestInternalAuditReportDocumentAssessmentResultByDocumentIdQuery = any;
export type GetLatestInternalAuditReportDocumentAssessmentResultByDocumentIdQueryVariables = any;
export type GetGetLatestInternalAuditReportDocumentAssessmentResultByDocumentIdQuery = any;
export type getLatestInternalAuditReportDocumentAssessmentResultByDocumentIdQuery = any;
export type getLatestInternalAuditReportDocumentAssessmentResultByDocumentIdQueryVariables = any;

export const GetLatestInternalAuditReportObligationAssessmentResultByObligationIdDocument = parse(`query getLatestInternalAuditReportObligationAssessmentResultByObligationId(
  \$ObligationId: uuid!
) {
  obligation_internal_audit_result(
    where: { parents: { ParentId: { _eq: \$ObligationId } } }
    order_by: [
      { TestDate: desc_nulls_last }
      { CreatedAtTimestamp: desc_nulls_last }
    ]
    limit: 1
  ) {
    ...ObligationInternalAuditResultParts
    ancestorContributors {
      ...AncestorContributorParts
    }
    parents(where: { ParentType: { _eq: internal_audit_report } }) {
      internalAuditReport {
        ...InternalAuditReportParts
        completedByUser {
          FriendlyName
        }
      }
    }
  }
}

fragment ObligationInternalAuditResultParts on obligation_internal_audit_result {
  Id
  Rating
  CustomAttributeData
  Rationale
  TestDate
}

fragment AncestorContributorParts on ancestor_contributor {
  ContributorType
  UserId
  Id
  AncestorId
  UserGroupId
  user {
    FriendlyName
  }
  user_group {
    Name
  }
}

fragment InternalAuditReportParts on internal_audit_report {
  ActualCompletionDate
  CompletedByUser
  CreatedAtTimestamp
  CreatedByUser
  CustomAttributeData
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  NextTestDate
  OriginatingItemId
  SequentialId
  StartDate
  Summary
  TargetCompletionDate
  Title
  Status
  Outcome
}`) as any;
export type GetLatestInternalAuditReportObligationAssessmentResultByObligationIdQuery = any;
export type GetLatestInternalAuditReportObligationAssessmentResultByObligationIdQueryVariables = any;
export type GetGetLatestInternalAuditReportObligationAssessmentResultByObligationIdQuery = any;
export type getLatestInternalAuditReportObligationAssessmentResultByObligationIdQuery = any;
export type getLatestInternalAuditReportObligationAssessmentResultByObligationIdQueryVariables = any;

export const GetLatestInternalAuditReportRiskAssessmentResultsByRiskIdDocument = parse(`query getLatestInternalAuditReportRiskAssessmentResultsByRiskId(
  \$RiskId: uuid!
) {
  uncontrolled: risk_uncontrolled_internal_audit_result(
    where: { parents: { ParentId: { _eq: \$RiskId } } }
    order_by: [{ TestDate: desc_nulls_last }, { CreatedAtTimestamp: desc }]
    limit: 1
  ) {
    ...RiskUncontrolledInternalAuditResultParts
    ancestorContributors {
      ...AncestorContributorParts
    }
    parents(where: { ParentType: { _eq: internal_audit_report } }) {
      internalAuditReport {
        ...InternalAuditReportParts
        completedByUser {
          FriendlyName
        }
      }
    }
  }
  controlled: risk_controlled_internal_audit_result(
    where: { parents: { ParentId: { _eq: \$RiskId } } }
    order_by: [{ TestDate: desc_nulls_last }, { CreatedAtTimestamp: desc }]
    limit: 1
  ) {
    ...RiskControlledInternalAuditResultParts
    ancestorContributors {
      ...AncestorContributorParts
    }
    parents(where: { ParentType: { _eq: internal_audit_report } }) {
      internalAuditReport {
        ...InternalAuditReportParts
        completedByUser {
          FriendlyName
        }
      }
    }
  }
}

fragment RiskUncontrolledInternalAuditResultParts on risk_uncontrolled_internal_audit_result {
  Id
  Likelihood
  Impact
  Rating
  CustomAttributeData
  Rationale
  TestDate
}

fragment AncestorContributorParts on ancestor_contributor {
  ContributorType
  UserId
  Id
  AncestorId
  UserGroupId
  user {
    FriendlyName
  }
  user_group {
    Name
  }
}

fragment InternalAuditReportParts on internal_audit_report {
  ActualCompletionDate
  CompletedByUser
  CreatedAtTimestamp
  CreatedByUser
  CustomAttributeData
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  NextTestDate
  OriginatingItemId
  SequentialId
  StartDate
  Summary
  TargetCompletionDate
  Title
  Status
  Outcome
}

fragment RiskControlledInternalAuditResultParts on risk_controlled_internal_audit_result {
  Id
  Likelihood
  Impact
  Rating
  CustomAttributeData
  Rationale
  TestDate
}`) as any;
export type GetLatestInternalAuditReportRiskAssessmentResultsByRiskIdQuery = any;
export type GetLatestInternalAuditReportRiskAssessmentResultsByRiskIdQueryVariables = any;
export type GetGetLatestInternalAuditReportRiskAssessmentResultsByRiskIdQuery = any;
export type getLatestInternalAuditReportRiskAssessmentResultsByRiskIdQuery = any;
export type getLatestInternalAuditReportRiskAssessmentResultsByRiskIdQueryVariables = any;

export const GetLatestInternalAuditReportTestResultsByControlIdDocument = parse(`query getLatestInternalAuditReportTestResultsByControlId(\$controlId: uuid) {
  control_test_internal_audit_result(
    where: { ParentControlId: { _eq: \$controlId } }
    order_by: [{ TestDate: desc_nulls_last }, { CreatedAtTimestamp: desc }]
    limit: 1
  ) {
    ...ControlTestInternalAuditResultParts
    submitter {
      FriendlyName
    }
    files {
      ...RelationFileParts
    }
    parents(where: { ParentType: { _eq: internal_audit_report } }) {
      internalAuditReport {
        ...InternalAuditReportParts
        completedByUser {
          FriendlyName
        }
      }
    }
  }
}

fragment ControlTestInternalAuditResultParts on control_test_internal_audit_result {
  Description
  DesignEffectiveness
  Id
  OverallEffectiveness
  ParentControlId
  PerformanceEffectiveness
  Submitter
  TestDate
  TestType
  CreatedAtTimestamp
  ModifiedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  CustomAttributeData
  SequentialId
}

fragment RelationFileParts on relation_file {
  ParentId
  ChangeRequestFileOperation
  file {
    ...FileParts
  }
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}

fragment InternalAuditReportParts on internal_audit_report {
  ActualCompletionDate
  CompletedByUser
  CreatedAtTimestamp
  CreatedByUser
  CustomAttributeData
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  NextTestDate
  OriginatingItemId
  SequentialId
  StartDate
  Summary
  TargetCompletionDate
  Title
  Status
  Outcome
}`) as any;
export type GetLatestInternalAuditReportTestResultsByControlIdQuery = any;
export type GetLatestInternalAuditReportTestResultsByControlIdQueryVariables = any;
export type GetGetLatestInternalAuditReportTestResultsByControlIdQuery = any;
export type getLatestInternalAuditReportTestResultsByControlIdQuery = any;
export type getLatestInternalAuditReportTestResultsByControlIdQueryVariables = any;

export const GetObligationInternalAuditResultByIdDocument = parse(`query getObligationInternalAuditResultById(\$Id: uuid!) {
  obligation_internal_audit_result(where: { Id: { _eq: \$Id } }) {
    ...ObligationInternalAuditResultParts
    parents {
      obligation {
        Id
        Title
      }
      internalAuditReport {
        Id
        Title
      }
    }
    files {
      ...RelationFileParts
    }
  }
}

fragment ObligationInternalAuditResultParts on obligation_internal_audit_result {
  Id
  Rating
  CustomAttributeData
  Rationale
  TestDate
}

fragment RelationFileParts on relation_file {
  ParentId
  ChangeRequestFileOperation
  file {
    ...FileParts
  }
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}`) as any;
export type GetObligationInternalAuditResultByIdQuery = any;
export type GetObligationInternalAuditResultByIdQueryVariables = any;
export type GetGetObligationInternalAuditResultByIdQuery = any;
export type getObligationInternalAuditResultByIdQuery = any;
export type getObligationInternalAuditResultByIdQueryVariables = any;

export const GetRiskInternalAuditResultByIdDocument = parse(`query getRiskInternalAuditResultById(\$Id: uuid!) {
  risk_controlled_internal_audit_result(where: { Id: { _eq: \$Id } }) {
    ...RiskControlledInternalAuditResultParts
    parents {
      risk {
        Id
        Title
      }
      internalAuditReport {
        Id
        Title
      }
    }
    files {
      ...RelationFileParts
    }
  }
  risk_uncontrolled_internal_audit_result(where: { Id: { _eq: \$Id } }) {
    ...RiskUncontrolledInternalAuditResultParts
    parents {
      risk {
        Id
        Title
      }
      internalAuditReport {
        Id
        Title
      }
    }
    files {
      ...RelationFileParts
    }
  }
}

fragment RiskControlledInternalAuditResultParts on risk_controlled_internal_audit_result {
  Id
  Likelihood
  Impact
  Rating
  CustomAttributeData
  Rationale
  TestDate
}

fragment RelationFileParts on relation_file {
  ParentId
  ChangeRequestFileOperation
  file {
    ...FileParts
  }
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}

fragment RiskUncontrolledInternalAuditResultParts on risk_uncontrolled_internal_audit_result {
  Id
  Likelihood
  Impact
  Rating
  CustomAttributeData
  Rationale
  TestDate
}`) as any;
export type GetRiskInternalAuditResultByIdQuery = any;
export type GetRiskInternalAuditResultByIdQueryVariables = any;
export type GetGetRiskInternalAuditResultByIdQuery = any;
export type getRiskInternalAuditResultByIdQuery = any;
export type getRiskInternalAuditResultByIdQueryVariables = any;

export const InsertInternalAuditTestResultDocument = parse(`mutation insertInternalAuditTestResult(
  \$Description: String
  \$DesignEffectiveness: Int
  \$OverallEffectiveness: Int
  \$ControlIds: [uuid!]!
  \$PerformanceEffectiveness: Int
  \$InternalAuditReportId: uuid!
  \$Submitter: String
  \$TestDate: timestamptz
  \$TestType: String
  \$Title: String
  \$CustomAttributeData: jsonb
) {
  insertChildControlTestInternalAuditResult(
    Description: \$Description
    DesignEffectiveness: \$DesignEffectiveness
    OverallEffectiveness: \$OverallEffectiveness
    ControlIds: \$ControlIds
    PerformanceEffectiveness: \$PerformanceEffectiveness
    Submitter: \$Submitter
    TestDate: \$TestDate
    TestType: \$TestType
    Title: \$Title
    InternalAuditReportId: \$InternalAuditReportId
    CustomAttributeData: \$CustomAttributeData
  ) {
    Ids
  }
}`) as any;
export type InsertInternalAuditTestResultMutation = any;
export type InsertInternalAuditTestResultMutationVariables = any;
export type insertInternalAuditTestResultMutation = any;
export type insertInternalAuditTestResultMutationVariables = any;

export const InsertDocumentInternalAuditResultDocument = parse(`mutation insertDocumentInternalAuditResult(
  \$Rating: Int
  \$InternalAuditReportId: uuid!
  \$DocumentIds: [uuid!]!
  \$CustomAttributeData: jsonb
  \$TestDate: timestamptz
  \$Rationale: String
) {
  insertChildDocumentInternalAuditResult(
    Rating: \$Rating
    InternalAuditReportId: \$InternalAuditReportId
    DocumentIds: \$DocumentIds
    CustomAttributeData: \$CustomAttributeData
    TestDate: \$TestDate
    Rationale: \$Rationale
  ) {
    Ids
  }
}`) as any;
export type InsertDocumentInternalAuditResultMutation = any;
export type InsertDocumentInternalAuditResultMutationVariables = any;
export type insertDocumentInternalAuditResultMutation = any;
export type insertDocumentInternalAuditResultMutationVariables = any;

export const InsertInternalAuditImpactRatingDocument = parse(`mutation insertInternalAuditImpactRating(
  \$Ratings: [InsertImpactRatingPairInput!]!
  \$TestDate: timestamptz!
  \$InternalAuditReportId: uuid!
  \$RatedItemId: uuid!
  \$CustomAttributeData: jsonb
  \$CompletedBy: String
  \$Likelihood: Int
) {
  insertChildImpactInternalAuditRating(
    InternalAuditReportId: \$InternalAuditReportId
    Ratings: \$Ratings
    TestDate: \$TestDate
    RatedItemId: \$RatedItemId
    CustomAttributeData: \$CustomAttributeData
    CompletedBy: \$CompletedBy
    Likelihood: \$Likelihood
  ) {
    Ids
  }
}`) as any;
export type InsertInternalAuditImpactRatingMutation = any;
export type InsertInternalAuditImpactRatingMutationVariables = any;
export type insertInternalAuditImpactRatingMutation = any;
export type insertInternalAuditImpactRatingMutationVariables = any;

export const InsertObligationInternalAuditResultDocument = parse(`mutation insertObligationInternalAuditResult(
  \$Rating: Int
  \$InternalAuditReportId: uuid!
  \$ObligationIds: [uuid!]!
  \$CustomAttributeData: jsonb
  \$TestDate: timestamptz
  \$Rationale: String
) {
  insertChildObligationInternalAuditResult(
    Rating: \$Rating
    InternalAuditReportId: \$InternalAuditReportId
    ObligationIds: \$ObligationIds
    CustomAttributeData: \$CustomAttributeData
    TestDate: \$TestDate
    Rationale: \$Rationale
  ) {
    Ids
  }
}`) as any;
export type InsertObligationInternalAuditResultMutation = any;
export type InsertObligationInternalAuditResultMutationVariables = any;
export type insertObligationInternalAuditResultMutation = any;
export type insertObligationInternalAuditResultMutationVariables = any;

export const InsertRiskInternalAuditResultDocument = parse(`mutation insertRiskInternalAuditResult(
  \$Rating: Int
  \$Likelihood: Int
  \$Impact: Int
  \$ControlType: risk_assessment_result_control_type_enum
  \$InternalAuditReportId: uuid!
  \$RiskIds: [uuid!]!
  \$CustomAttributeData: jsonb
  \$TestDate: timestamptz
  \$Rationale: String
) {
  insertChildRiskInternalAuditResult(
    Rating: \$Rating
    InternalAuditReportId: \$InternalAuditReportId
    RiskIds: \$RiskIds
    Impact: \$Impact
    Likelihood: \$Likelihood
    ControlType: \$ControlType
    CustomAttributeData: \$CustomAttributeData
    TestDate: \$TestDate
    Rationale: \$Rationale
  ) {
    Ids
  }
}`) as any;
export type InsertRiskInternalAuditResultMutation = any;
export type InsertRiskInternalAuditResultMutationVariables = any;
export type insertRiskInternalAuditResultMutation = any;
export type insertRiskInternalAuditResultMutationVariables = any;

export const UpdateControlTestInternalAuditResultDocument = parse(`mutation updateControlTestInternalAuditResult(\$object: UpdateTestResultInput) {
  updateControlTestInternalAuditResultApi(object: \$object) {
    Id
  }
}`) as any;
export type UpdateControlTestInternalAuditResultMutation = any;
export type UpdateControlTestInternalAuditResultMutationVariables = any;
export type updateControlTestInternalAuditResultMutation = any;
export type updateControlTestInternalAuditResultMutationVariables = any;

export const UpdateDocumentInternalAuditResultDocument = parse(`mutation updateDocumentInternalAuditResult(
  \$Id: uuid!
  \$Rating: Int
  \$Rationale: String
  \$TestDate: timestamptz
  \$CustomAttributeData: jsonb
) {
  update_document_internal_audit_result(
    where: { Id: { _eq: \$Id } }
    _set: {
      CustomAttributeData: \$CustomAttributeData
      Rating: \$Rating
      Rationale: \$Rationale
      TestDate: \$TestDate
    }
  ) {
    affected_rows
  }
}`) as any;
export type UpdateDocumentInternalAuditResultMutation = any;
export type UpdateDocumentInternalAuditResultMutationVariables = any;
export type updateDocumentInternalAuditResultMutation = any;
export type updateDocumentInternalAuditResultMutationVariables = any;

export const UpdateObligationInternalAuditResultDocument = parse(`mutation updateObligationInternalAuditResult(
  \$Id: uuid!
  \$Rating: Int
  \$Rationale: String
  \$TestDate: timestamptz
  \$CustomAttributeData: jsonb
) {
  update_obligation_internal_audit_result(
    where: { Id: { _eq: \$Id } }
    _set: {
      CustomAttributeData: \$CustomAttributeData
      Rating: \$Rating
      Rationale: \$Rationale
      TestDate: \$TestDate
    }
  ) {
    affected_rows
  }
}`) as any;
export type UpdateObligationInternalAuditResultMutation = any;
export type UpdateObligationInternalAuditResultMutationVariables = any;
export type updateObligationInternalAuditResultMutation = any;
export type updateObligationInternalAuditResultMutationVariables = any;

export const UpdateControlledRiskInternalAuditResultDocument = parse(`mutation updateControlledRiskInternalAuditResult(
  \$Id: uuid!
  \$Impact: Int
  \$Likelihood: Int
  \$Rating: Int
  \$Rationale: String
  \$TestDate: timestamptz
  \$CustomAttributeData: jsonb
) {
  update_risk_controlled_internal_audit_result(
    where: { Id: { _eq: \$Id } }
    _set: {
      CustomAttributeData: \$CustomAttributeData
      Rating: \$Rating
      Rationale: \$Rationale
      TestDate: \$TestDate
      Likelihood: \$Likelihood
      Impact: \$Impact
    }
  ) {
    affected_rows
  }
}`) as any;
export type UpdateControlledRiskInternalAuditResultMutation = any;
export type UpdateControlledRiskInternalAuditResultMutationVariables = any;
export type updateControlledRiskInternalAuditResultMutation = any;
export type updateControlledRiskInternalAuditResultMutationVariables = any;

export const UpdateUncontrolledRiskInternalAuditResultDocument = parse(`mutation updateUncontrolledRiskInternalAuditResult(
  \$Id: uuid!
  \$Impact: Int
  \$Likelihood: Int
  \$Rating: Int
  \$Rationale: String
  \$TestDate: timestamptz
  \$CustomAttributeData: jsonb
) {
  update_risk_uncontrolled_internal_audit_result(
    where: { Id: { _eq: \$Id } }
    _set: {
      CustomAttributeData: \$CustomAttributeData
      Rating: \$Rating
      Rationale: \$Rationale
      TestDate: \$TestDate
      Likelihood: \$Likelihood
      Impact: \$Impact
    }
  ) {
    affected_rows
  }
}`) as any;
export type UpdateUncontrolledRiskInternalAuditResultMutation = any;
export type UpdateUncontrolledRiskInternalAuditResultMutationVariables = any;
export type updateUncontrolledRiskInternalAuditResultMutation = any;
export type updateUncontrolledRiskInternalAuditResultMutationVariables = any;

export const DeleteIssuesDocument = parse(`mutation deleteIssues(\$Ids: [uuid!]!) {
  deleteIssuesById(Ids: \$Ids) {
    affected_rows
  }
}`) as any;
export type DeleteIssuesMutation = any;
export type DeleteIssuesMutationVariables = any;
export type deleteIssuesMutation = any;
export type deleteIssuesMutationVariables = any;

export const GetIssueAuditByIdDocument = parse(`query getIssueAuditById(\$Id: uuid!) {
  issue_audit(where: {Id: {_eq: \$Id}}) {
    RaisedAtTimestamp
    DateIdentified
    DateOccurred
    Details
    Id
    ImpactsCustomer
    IsExternalIssue
    CreatedAtTimestamp
    ModifiedAtTimestamp
    Title
    CreatedByUser
    ModifiedByUser
    SequentialId
    CustomAttributeData
  }
}`) as any;
export type GetIssueAuditByIdQuery = any;
export type GetIssueAuditByIdQueryVariables = any;
export type GetGetIssueAuditByIdQuery = any;
export type getIssueAuditByIdQuery = any;
export type getIssueAuditByIdQueryVariables = any;

export const GetIssueByIdDocument = parse(`query getIssueById(\$_eq: uuid!) {
  issue(where: { Id: { _eq: \$_eq } }) {
    ...IssueParts
    tags {
      ...TagParts
    }
    departments {
      ...DepartmentParts
    }
    files {
      ...RelationFileParts
    }
    owners {
      ...OwnerParts
    }
    contributors {
      ...ContributorParts
    }
    ownerGroups {
      ...OwnerGroupParts
    }
    contributorGroups {
      ...ContributorGroupParts
    }
    ancestorContributors {
      ...AncestorContributorParts
    }
  }
}

fragment IssueParts on issue {
  RaisedAtTimestamp
  DateIdentified
  DateOccurred
  Details
  Id
  ImpactsCustomer
  IsExternalIssue
  CreatedAtTimestamp
  ModifiedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  SequentialId
  CustomAttributeData
  Meta
  Type
}

fragment TagParts on tag {
  type {
    Description
    Name
  }
  ParentId
  TagTypeId
}

fragment DepartmentParts on department {
  type {
    Description
    Name
  }
  ParentId
  DepartmentTypeId
}

fragment RelationFileParts on relation_file {
  ParentId
  ChangeRequestFileOperation
  file {
    ...FileParts
  }
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}

fragment OwnerParts on owner {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment ContributorParts on contributor {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment OwnerGroupParts on owner_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment ContributorGroupParts on contributor_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment AncestorContributorParts on ancestor_contributor {
  ContributorType
  UserId
  Id
  AncestorId
  UserGroupId
  user {
    FriendlyName
  }
  user_group {
    Name
  }
}`) as any;
export type GetIssueByIdQuery = any;
export type GetIssueByIdQueryVariables = any;
export type GetGetIssueByIdQuery = any;
export type getIssueByIdQuery = any;
export type getIssueByIdQueryVariables = any;

export const GetIssuesDocument = parse(`query getIssues(
  \$where: issue_bool_exp! = {}
) {
  issue(where: \$where) {
    ...IssueParts
    consequences {
      CostType
      CostValue
      Type
    }
    owners {
      ...OwnerParts
    }
    ownerGroups {
      ...OwnerGroupParts
    }
    contributors {
      ...ContributorParts
    }
    contributorGroups {
      ...ContributorGroupParts
    }
    assessment {
      ...IssueAssessmentParts
      modifiedByUser {
        FriendlyName
      }
      createdByUser {
        FriendlyName
      }
      certifiedIndividual {
        FriendlyName
      }
      departments {
        ...DepartmentParts
      }
    }
    actions_aggregate(where: { action: { Status: { _eq: open } } }) {
      aggregate {
        count
      }
    }
    modifiedByUser {
      FriendlyName
    }
    createdByUser {
      FriendlyName
    }
    departments {
      ...DepartmentParts
    }
    tags {
      ...TagParts
    }
    parents {
      parent {
        Id
        ObjectType
        SequentialId
      }
      obligation {
        Title
      }
      document {
        Title
      }
      control {
        Title
      }
      thirdParty {
        Title
      }
      assessment {
        Title
      }
      internalAuditEntity {
        Title
      }
      internalAuditReport {
        Title
      }
      complianceMonitoringAssessment {
        Title
      }
      risk {
        Title
      }
    }
    issueUpdateSummary {
      Count
      LatestTitle
      LatestDescription
      LatestCreatedAtTimestamp
    }
  }
}

fragment IssueParts on issue {
  RaisedAtTimestamp
  DateIdentified
  DateOccurred
  Details
  Id
  ImpactsCustomer
  IsExternalIssue
  CreatedAtTimestamp
  ModifiedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  SequentialId
  CustomAttributeData
  Meta
  Type
}

fragment OwnerParts on owner {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment OwnerGroupParts on owner_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment ContributorParts on contributor {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment ContributorGroupParts on contributor_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment IssueAssessmentParts on issue_assessment {
  ActualCloseDate
  CertifiedIndividual
  IssueCausedBySystemIssue
  IssueCausedByThirdParty
  IssueType
  ParentIssueId
  PoliciesBreached
  PolicyBreach
  PolicyOwner
  PolicyOwnerCommentary
  Rationale
  RegulatoryBreach
  RegulationsBreached
  Reportable
  Severity
  Status
  SystemResponsible
  TargetCloseDate
  ThirdPartyResponsible
  CreatedAtTimestamp
  ModifiedAtTimestamp
  CreatedByUser
  ModifiedByUser
  Id
  CustomAttributeData
  Type
}

fragment DepartmentParts on department {
  type {
    Description
    Name
  }
  ParentId
  DepartmentTypeId
}

fragment TagParts on tag {
  type {
    Description
    Name
  }
  ParentId
  TagTypeId
}`) as any;
export type GetIssuesQuery = any;
export type GetIssuesQueryVariables = any;
export type GetGetIssuesQuery = any;
export type getIssuesQuery = any;
export type getIssuesQueryVariables = any;

export const GetIssuesByParentIdDocument = parse(`query getIssuesByParentId(\$ParentId: uuid!, \$Type: parent_type_enum!) {
  issue(where: { parents: { ParentId: { _eq: \$ParentId } }, Type: { _eq: \$Type} }) {
    ...IssueParts
    owners {
      ...OwnerParts
    }
    ownerGroups {
      ...OwnerGroupParts
    }
    contributors {
      ...ContributorParts
    }
    contributorGroups {
      ...ContributorGroupParts
    }
    assessment {
      ...IssueAssessmentParts
    }
    tags {
      ...TagParts
    }
    departments {
      ...DepartmentParts
    }
  }
}

fragment IssueParts on issue {
  RaisedAtTimestamp
  DateIdentified
  DateOccurred
  Details
  Id
  ImpactsCustomer
  IsExternalIssue
  CreatedAtTimestamp
  ModifiedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  SequentialId
  CustomAttributeData
  Meta
  Type
}

fragment OwnerParts on owner {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment OwnerGroupParts on owner_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment ContributorParts on contributor {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment ContributorGroupParts on contributor_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment IssueAssessmentParts on issue_assessment {
  ActualCloseDate
  CertifiedIndividual
  IssueCausedBySystemIssue
  IssueCausedByThirdParty
  IssueType
  ParentIssueId
  PoliciesBreached
  PolicyBreach
  PolicyOwner
  PolicyOwnerCommentary
  Rationale
  RegulatoryBreach
  RegulationsBreached
  Reportable
  Severity
  Status
  SystemResponsible
  TargetCloseDate
  ThirdPartyResponsible
  CreatedAtTimestamp
  ModifiedAtTimestamp
  CreatedByUser
  ModifiedByUser
  Id
  CustomAttributeData
  Type
}

fragment TagParts on tag {
  type {
    Description
    Name
  }
  ParentId
  TagTypeId
}

fragment DepartmentParts on department {
  type {
    Description
    Name
  }
  ParentId
  DepartmentTypeId
}`) as any;
export type GetIssuesByParentIdQuery = any;
export type GetIssuesByParentIdQueryVariables = any;
export type GetGetIssuesByParentIdQuery = any;
export type getIssuesByParentIdQuery = any;
export type getIssuesByParentIdQueryVariables = any;

export const GetOldestOpenIssueDateDocument = parse(`query GetOldestOpenIssueDate(\$where: issue_bool_exp) {
  issue(order_by: { CreatedAtTimestamp: asc }, where: \$where, limit: 1) {
    CreatedAtTimestamp
  }
}`) as any;
export type GetOldestOpenIssueDateQuery = any;
export type GetOldestOpenIssueDateQueryVariables = any;
export type GetGetOldestOpenIssueDateQuery = any;

export const GetWidgetIssueCausesDocument = parse(`query getWidgetIssueCauses(\$where: issue_bool_exp!) {
  issue(where: \$where) {
    causes {
      Title
    }
  }
}`) as any;
export type GetWidgetIssueCausesQuery = any;
export type GetWidgetIssueCausesQueryVariables = any;
export type GetGetWidgetIssueCausesQuery = any;
export type getWidgetIssueCausesQuery = any;
export type getWidgetIssueCausesQueryVariables = any;

export const GetWidgetIssuesByTypeDocument = parse(`query getWidgetIssuesByType(\$where: issue_assessment_bool_exp!) {
  issue_assessment(where: \$where) {
    IssueType
  }
}`) as any;
export type GetWidgetIssuesByTypeQuery = any;
export type GetWidgetIssuesByTypeQueryVariables = any;
export type GetGetWidgetIssuesByTypeQuery = any;
export type getWidgetIssuesByTypeQuery = any;
export type getWidgetIssuesByTypeQueryVariables = any;

export const InsertChildIssueDocument = parse(`mutation insertChildIssue(\$object: InsertIssueInput!) {
  insertChildIssue(object: \$object) {
    Id
    SequentialId
  }
}`) as any;
export type InsertChildIssueMutation = any;
export type InsertChildIssueMutationVariables = any;
export type insertChildIssueMutation = any;
export type insertChildIssueMutationVariables = any;

export const IssuePartsDocument = parse(`fragment IssueParts on issue {
  RaisedAtTimestamp
  DateIdentified
  DateOccurred
  Details
  Id
  ImpactsCustomer
  IsExternalIssue
  CreatedAtTimestamp
  ModifiedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  SequentialId
  CustomAttributeData
  Meta
  Type
}`) as any;
export type IssuePartsFragment = any;

export const SimplifiedIssuePartsDocument = parse(`fragment SimplifiedIssueParts on issue {
  Id
  Title
}`) as any;
export type SimplifiedIssuePartsFragment = any;

export const BreachedIssuesPartsDocument = parse(`fragment BreachedIssuesParts on issue_parent {
  issue {
    ...SimplifiedIssueParts
  }
}

fragment SimplifiedIssueParts on issue {
  Id
  Title
}`) as any;
export type BreachedIssuesPartsFragment = any;

export const GetOpenIssueAssessmentCountDocument = parse(`query GetOpenIssueAssessmentCount(\$where: issue_assessment_bool_exp) {
  issue_assessment_aggregate(where: \$where) {
    aggregate {
      count
    }
  }
}`) as any;
export type GetOpenIssueAssessmentCountQuery = any;
export type GetOpenIssueAssessmentCountQueryVariables = any;
export type GetGetOpenIssueAssessmentCountQuery = any;

export const UpdateIssueDocument = parse(`mutation updateIssue(\$object: UpdateIssueInput!) {
  updateIssueApi(object: \$object) {
    affected_rows
  }
}`) as any;
export type UpdateIssueMutation = any;
export type UpdateIssueMutationVariables = any;
export type updateIssueMutation = any;
export type updateIssueMutationVariables = any;

export const GetIssueAssessmentAuditByIdDocument = parse(`query getIssueAssessmentAuditById(\$Id: uuid!) {
  issue_assessment_audit(where: { Id: { _eq: \$Id } }) {
    ActualCloseDate
    CertifiedIndividual
    IssueCausedBySystemIssue
    IssueCausedByThirdParty
    IssueType
    ParentIssueId
    PoliciesBreached
    PolicyBreach
    PolicyOwner
    PolicyOwnerCommentary
    Rationale
    RegulatoryBreach
    RegulationsBreached
    Reportable
    Severity
    Status
    SystemResponsible
    TargetCloseDate
    ThirdPartyResponsible
    CreatedAtTimestamp
    ModifiedAtTimestamp
    CreatedByUser
    ModifiedByUser
    Id
    Type
    CustomAttributeData
  }
}`) as any;
export type GetIssueAssessmentAuditByIdQuery = any;
export type GetIssueAssessmentAuditByIdQueryVariables = any;
export type GetGetIssueAssessmentAuditByIdQuery = any;
export type getIssueAssessmentAuditByIdQuery = any;
export type getIssueAssessmentAuditByIdQueryVariables = any;

export const GetIssueAssessmentByParentIdDocument = parse(`query getIssueAssessmentByParentId(\$parentIssueId: uuid!) {
  issue_assessment(where: { ParentIssueId: { _eq: \$parentIssueId } }) {
    ...IssueAssessmentParts
    policyOwner {
      FriendlyName
    }
    certifiedIndividual {
      FriendlyName
    }
    departments {
      ...DepartmentParts
    }
  }

  # Get ancestorContributors separately as assessment may not have been created yet.
  issue(where: { Id: { _eq: \$parentIssueId } }) {
    owners {
      ...OwnerParts
    }
    tags {
      ...TagParts
    }
  }

  # Get parents separately as an assessment may not have been created yet.
  issue_parent(where: { IssueId: { _eq: \$parentIssueId } }) {
    IssueId
    ParentId
    obligation {
      Id
      Title
    }
    parent {
      ObjectType
      SequentialId
    }
  }
}

fragment IssueAssessmentParts on issue_assessment {
  ActualCloseDate
  CertifiedIndividual
  IssueCausedBySystemIssue
  IssueCausedByThirdParty
  IssueType
  ParentIssueId
  PoliciesBreached
  PolicyBreach
  PolicyOwner
  PolicyOwnerCommentary
  Rationale
  RegulatoryBreach
  RegulationsBreached
  Reportable
  Severity
  Status
  SystemResponsible
  TargetCloseDate
  ThirdPartyResponsible
  CreatedAtTimestamp
  ModifiedAtTimestamp
  CreatedByUser
  ModifiedByUser
  Id
  CustomAttributeData
  Type
}

fragment DepartmentParts on department {
  type {
    Description
    Name
  }
  ParentId
  DepartmentTypeId
}

fragment OwnerParts on owner {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment TagParts on tag {
  type {
    Description
    Name
  }
  ParentId
  TagTypeId
}`) as any;
export type GetIssueAssessmentByParentIdQuery = any;
export type GetIssueAssessmentByParentIdQueryVariables = any;
export type GetGetIssueAssessmentByParentIdQuery = any;
export type getIssueAssessmentByParentIdQuery = any;
export type getIssueAssessmentByParentIdQueryVariables = any;

export const InsertIssueAssessmentDocument = parse(`mutation insertIssueAssessment(
  \$ActualCloseDate: timestamptz
  \$ThirdPartyResponsible: String
  \$TargetCloseDate: timestamptz
  \$PolicyOwnerCommentary: String
  \$CertifiedIndividual: String
  \$IssueCausedBySystemIssue: Boolean
  \$IssueCausedByThirdParty: Boolean
  \$IssueType: String
  \$ParentIssueId: uuid!
  \$PoliciesBreached: String
  \$PolicyOwner: String
  \$PolicyBreach: Boolean
  \$Rationale: String
  \$RegulatoryBreach: Boolean
  \$RegulationsBreached: String
  \$Reportable: Boolean
  \$Severity: Int
  \$Status: issue_assessment_status_enum
  \$SystemResponsible: String
  \$TagTypeIds: [uuid!]!
  \$DepartmentTypeIds: [uuid!]!
  \$CustomAttributeData: jsonb
  \$RegulationsBreachedIds: [uuid!]!
  \$AssociatedControlIds: [uuid!]!
  \$PoliciesBreachedIds: [uuid!]!
) {
  insertChildIssueAssessment(
    ActualCloseDate: \$ActualCloseDate
    ThirdPartyResponsible: \$ThirdPartyResponsible
    TargetCloseDate: \$TargetCloseDate
    PolicyOwnerCommentary: \$PolicyOwnerCommentary
    CertifiedIndividual: \$CertifiedIndividual
    IssueCausedBySystemIssue: \$IssueCausedBySystemIssue
    IssueCausedByThirdParty: \$IssueCausedByThirdParty
    IssueType: \$IssueType
    ParentIssueId: \$ParentIssueId
    PoliciesBreached: \$PoliciesBreached
    PolicyOwner: \$PolicyOwner
    PolicyBreach: \$PolicyBreach
    Rationale: \$Rationale
    RegulatoryBreach: \$RegulatoryBreach
    RegulationsBreached: \$RegulationsBreached
    Reportable: \$Reportable
    Severity: \$Severity
    Status: \$Status
    SystemResponsible: \$SystemResponsible
    TagTypeIds: \$TagTypeIds
    DepartmentTypeIds: \$DepartmentTypeIds
    CustomAttributeData: \$CustomAttributeData
    AssociatedControlIds: \$AssociatedControlIds
    RegulationsBreachedIds: \$RegulationsBreachedIds
    PoliciesBreachedIds: \$PoliciesBreachedIds
  ) {
    Id
  }
}`) as any;
export type InsertIssueAssessmentMutation = any;
export type InsertIssueAssessmentMutationVariables = any;
export type insertIssueAssessmentMutation = any;
export type insertIssueAssessmentMutationVariables = any;

export const IssueAssessmentPartsDocument = parse(`fragment IssueAssessmentParts on issue_assessment {
  ActualCloseDate
  CertifiedIndividual
  IssueCausedBySystemIssue
  IssueCausedByThirdParty
  IssueType
  ParentIssueId
  PoliciesBreached
  PolicyBreach
  PolicyOwner
  PolicyOwnerCommentary
  Rationale
  RegulatoryBreach
  RegulationsBreached
  Reportable
  Severity
  Status
  SystemResponsible
  TargetCloseDate
  ThirdPartyResponsible
  CreatedAtTimestamp
  ModifiedAtTimestamp
  CreatedByUser
  ModifiedByUser
  Id
  CustomAttributeData
  Type
}`) as any;
export type IssueAssessmentPartsFragment = any;

export const UpdateIssueAssessmentDocument = parse(`mutation updateIssueAssessment(
  \$ActualCloseDate: timestamptz
  \$ThirdPartyResponsible: String
  \$TargetCloseDate: timestamptz
  \$PolicyOwnerCommentary: String
  \$CertifiedIndividual: String
  \$IssueCausedBySystemIssue: Boolean
  \$IssueCausedByThirdParty: Boolean
  \$IssueType: String
  \$PoliciesBreached: String
  \$PolicyOwner: String
  \$PolicyBreach: Boolean
  \$Rationale: String
  \$RegulatoryBreach: Boolean
  \$RegulationsBreached: String
  \$Reportable: Boolean
  \$Severity: Int
  \$Status: issue_assessment_status_enum
  \$SystemResponsible: String
  \$OriginalTimestamp: timestamptz!
  \$Id: uuid!
  \$CustomAttributeData: jsonb
  \$TagTypeIds: [uuid!]!
  \$DepartmentTypeIds: [uuid!]!
  \$RegulationsBreachedIds: [uuid!]!
  \$PoliciesBreachedIds: [uuid!]!
  \$AssociatedControlIds: [uuid!]!
) {
  updateChildIssueAssessment(
    Id: \$Id
    OriginalTimestamp: \$OriginalTimestamp
    ActualCloseDate: \$ActualCloseDate
    ThirdPartyResponsible: \$ThirdPartyResponsible
    TargetCloseDate: \$TargetCloseDate
    PolicyOwnerCommentary: \$PolicyOwnerCommentary
    CertifiedIndividual: \$CertifiedIndividual
    IssueCausedBySystemIssue: \$IssueCausedBySystemIssue
    IssueCausedByThirdParty: \$IssueCausedByThirdParty
    IssueType: \$IssueType
    PoliciesBreached: \$PoliciesBreached
    PolicyOwner: \$PolicyOwner
    PolicyBreach: \$PolicyBreach
    Rationale: \$Rationale
    RegulatoryBreach: \$RegulatoryBreach
    RegulationsBreached: \$RegulationsBreached
    Reportable: \$Reportable
    Severity: \$Severity
    Status: \$Status
    SystemResponsible: \$SystemResponsible
    CustomAttributeData: \$CustomAttributeData
    AssociatedControlIds: \$AssociatedControlIds
    RegulationsBreachedIds: \$RegulationsBreachedIds
    PoliciesBreachedIds: \$PoliciesBreachedIds
    TagTypeIds: \$TagTypeIds
    DepartmentTypeIds: \$DepartmentTypeIds
  ) {
    Id
  }
}`) as any;
export type UpdateIssueAssessmentMutation = any;
export type UpdateIssueAssessmentMutationVariables = any;
export type updateIssueAssessmentMutation = any;
export type updateIssueAssessmentMutationVariables = any;

export const GetIssueAssessmentHistoryDocument = parse(`query getIssueAssessmentHistory(\$where: issue_assessment_audit_bool_exp) {
  issue_assessment_audit(
    where: \$where
    order_by: { ModifiedAtTimestamp: asc }
  ) {
    Status
    ParentIssueId
    ModifiedAtTimestamp
    Action
  }
}`) as any;
export type GetIssueAssessmentHistoryQuery = any;
export type GetIssueAssessmentHistoryQueryVariables = any;
export type GetGetIssueAssessmentHistoryQuery = any;
export type getIssueAssessmentHistoryQuery = any;
export type getIssueAssessmentHistoryQueryVariables = any;

export const DeleteIssueUpdatesDocument = parse(`mutation deleteIssueUpdates(\$Ids: [uuid!]) {
  delete_file(where: { relationFile: { ParentId: { _in: \$Ids } } }) {
    affected_rows
  }

  delete_relation_file(where: { ParentId: { _in: \$Ids } }) {
    affected_rows
  }

  delete_issue_update(where: { Id: { _in: \$Ids } }) {
    affected_rows
  }
}`) as any;
export type DeleteIssueUpdatesMutation = any;
export type DeleteIssueUpdatesMutationVariables = any;
export type deleteIssueUpdatesMutation = any;
export type deleteIssueUpdatesMutationVariables = any;

export const GetIssueUpdateAuditByIdDocument = parse(`query getIssueUpdateAuditById(\$Id: uuid!) {
  issue_update_audit(where: { Id: { _eq: \$Id } }) {
    Description
    Id
    ParentIssueId
    CreatedAtTimestamp
    ModifiedAtTimestamp
    Title
    CreatedByUser
    ModifiedByUser
    CustomAttributeData
  }
}`) as any;
export type GetIssueUpdateAuditByIdQuery = any;
export type GetIssueUpdateAuditByIdQueryVariables = any;
export type GetGetIssueUpdateAuditByIdQuery = any;
export type getIssueUpdateAuditByIdQuery = any;
export type getIssueUpdateAuditByIdQueryVariables = any;

export const GetIssueUpdateByIdDocument = parse(`query getIssueUpdateById(\$_eq: uuid!) {
  issue_update(where: { Id: { _eq: \$_eq } }) {
    ...IssueUpdateParts
    files {
      ...RelationFileParts
    }
  }
}

fragment IssueUpdateParts on issue_update {
  Description
  Id
  ParentIssueId
  CreatedAtTimestamp
  ModifiedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  CustomAttributeData
}

fragment RelationFileParts on relation_file {
  ParentId
  ChangeRequestFileOperation
  file {
    ...FileParts
  }
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}`) as any;
export type GetIssueUpdateByIdQuery = any;
export type GetIssueUpdateByIdQueryVariables = any;
export type GetGetIssueUpdateByIdQuery = any;
export type getIssueUpdateByIdQuery = any;
export type getIssueUpdateByIdQueryVariables = any;

export const GetIssueUpdatesByParentIssueIdDocument = parse(`query getIssueUpdatesByParentIssueId(\$_eq: uuid!) {
  issue_update(where: { ParentIssueId: { _eq: \$_eq } }) {
    ...IssueUpdateParts
    createdByUser {
      FriendlyName
    }
    files {
      ...RelationFileParts
    }
  }
}

fragment IssueUpdateParts on issue_update {
  Description
  Id
  ParentIssueId
  CreatedAtTimestamp
  ModifiedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  CustomAttributeData
}

fragment RelationFileParts on relation_file {
  ParentId
  ChangeRequestFileOperation
  file {
    ...FileParts
  }
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}`) as any;
export type GetIssueUpdatesByParentIssueIdQuery = any;
export type GetIssueUpdatesByParentIssueIdQueryVariables = any;
export type GetGetIssueUpdatesByParentIssueIdQuery = any;
export type getIssueUpdatesByParentIssueIdQuery = any;
export type getIssueUpdatesByParentIssueIdQueryVariables = any;

export const InsertIssueUpdateDocument = parse(`mutation insertIssueUpdate(
  \$ParentIssueId: uuid!
  \$Description: String!
  \$Title: String!
  \$CustomAttributeData: jsonb
) {
  insert_issue_update_one(
    object: {
      Description: \$Description
      ParentIssueId: \$ParentIssueId
      Title: \$Title
      CustomAttributeData: \$CustomAttributeData
    }
  ) {
    Id
  }
}`) as any;
export type InsertIssueUpdateMutation = any;
export type InsertIssueUpdateMutationVariables = any;
export type insertIssueUpdateMutation = any;
export type insertIssueUpdateMutationVariables = any;

export const IssueUpdatePartsDocument = parse(`fragment IssueUpdateParts on issue_update {
  Description
  Id
  ParentIssueId
  CreatedAtTimestamp
  ModifiedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  CustomAttributeData
}`) as any;
export type IssueUpdatePartsFragment = any;

export const UpdateIssueUpdateDocument = parse(`mutation updateIssueUpdate(
  \$ParentIssueId: uuid!
  \$Description: String!
  \$Title: String!
  \$Id: uuid!
  \$OriginalTimestamp: timestamptz!
  \$CustomAttributeData: jsonb
) {
  update_issue_update(
    where: {
      Id: { _eq: \$Id }
      ModifiedAtTimestamp: { _eq: \$OriginalTimestamp }
    }
    _set: {
      Description: \$Description
      ParentIssueId: \$ParentIssueId
      Title: \$Title
      CustomAttributeData: \$CustomAttributeData
    }
  ) {
    affected_rows
  }
}`) as any;
export type UpdateIssueUpdateMutation = any;
export type UpdateIssueUpdateMutationVariables = any;
export type updateIssueUpdateMutation = any;
export type updateIssueUpdateMutationVariables = any;

export const DeleteLinkedItemsDocument = parse(`mutation deleteLinkedItems(\$Ids: [uuid!]!) {
  unlinkItems(Ids: \$Ids) {
    Ids
  }
}`) as any;
export type DeleteLinkedItemsMutation = any;
export type DeleteLinkedItemsMutationVariables = any;
export type deleteLinkedItemsMutation = any;
export type deleteLinkedItemsMutationVariables = any;

export const GetLinkedItemAuditDocument = parse(`query getLinkedItemAudit(
  \$Id: uuid!
) {
  risksmart_linked_item_audit(where: { Id: { _eq: \$Id } }) {
    Id
    Source
    Target
    ModifiedAtTimestamp
    ModifiedByUser
    CreatedAtTimestamp
    CreatedByUser
  }
}`) as any;
export type GetLinkedItemAuditQuery = any;
export type GetLinkedItemAuditQueryVariables = any;
export type GetGetLinkedItemAuditQuery = any;
export type getLinkedItemAuditQuery = any;
export type getLinkedItemAuditQueryVariables = any;

export const GetLinkedItemRisksDocument = parse(`query getLinkedItemRisks(\$Id: uuid!) {
  linked_item(where: { Source: { _eq: \$Id }, TargetType: { _eq: "risk" } }) {
    Id
    Source
    Target
    target_risk {
      ...RiskParts
    }
  }
}

fragment RiskParts on risk {
  Id
  Title
  Tier
  Description
  ParentRiskId
  CreatedByUser
  Treatment
  Status
  ModifiedByUser
  CreatedAtTimestamp
  ModifiedAtTimestamp
  CustomAttributeData
  SequentialId
  schedule {
    ...ScheduleParts
  }
}

fragment ScheduleParts on schedule {
  Id
  Frequency
  ManualDueDate
  StartDate
  TimeToCompleteValue
  TimeToCompleteUnit
}`) as any;
export type GetLinkedItemRisksQuery = any;
export type GetLinkedItemRisksQueryVariables = any;
export type GetGetLinkedItemRisksQuery = any;
export type getLinkedItemRisksQuery = any;
export type getLinkedItemRisksQueryVariables = any;

export const GetLinkedItemsDocument = parse(`query getLinkedItems(
  \$Id: uuid!
  \$IncludeInternalAudit: Boolean!
  \$IncludeCompliance: Boolean!
) {
  linked_item(where: { Source: { _eq: \$Id } }) {
    Id
    Source
    Target
    RelationshipType
    target_node {
      ObjectType
      SequentialId
    }
    target_control {
      ...ControlParts
      owners {
        ...OwnerParts
      }
      contributors {
        ...ContributorParts
      }
      ownerGroups {
        ...OwnerGroupParts
      }
      contributorGroups {
        ...ContributorGroupParts
      }
    }
    target_control_group {
      ...ControlGroupParts
    }
    target_obligation {
      ...ObligationParts
      owners {
        ...OwnerParts
      }
      contributors {
        ...ContributorParts
      }
      ownerGroups {
        ...OwnerGroupParts
      }
      contributorGroups {
        ...ContributorGroupParts
      }
    }
    target_obligation_change {
      Id
      SequentialId
      DescriptionBefore
      DescriptionAfter
      Rationale
      ObligationId
      ExternalId
      EffectiveDate
      CreatedAtTimestamp
      ModifiedAtTimestamp
      CreatedByUser
      ModifiedByUser
      obligation {
        Reference
        Title
        regulatorySource {
          RegulatorName
        }
      }
      owners {
        ...OwnerParts
      }
      contributors {
        ...ContributorParts
      }
      ownerGroups {
        ...OwnerGroupParts
      }
      contributorGroups {
        ...ContributorGroupParts
      }
    }
    target_document {
      ...DocumentParts
      owners {
        ...OwnerParts
      }
      contributors {
        ...ContributorParts
      }
      ownerGroups {
        ...OwnerGroupParts
      }
      contributorGroups {
        ...ContributorGroupParts
      }
    }
    target_risk {
      ...RiskParts
      enterpriseRiskInstance {
        EntityId
        entity {
          Id
          Name
          ParentId
        }
      }
      owners {
        ...OwnerParts
      }
      contributors {
        ...ContributorParts
      }
      ownerGroups {
        ...OwnerGroupParts
      }
      contributorGroups {
        ...ContributorGroupParts
      }
    }
    target_assessment_activity {
      ...AssessmentActivityParts
      parentInternalAuditReport @include(if: \$IncludeInternalAudit) {
        Id
      }
      parentAssessment {
        Id
      }
      parentComplianceMonitoringAssessment @include(if: \$IncludeCompliance) {
        Id
      }
    }
    target_assessment {
      ...AssessmentParts
      owners {
        ...OwnerParts
      }
      contributors {
        ...ContributorParts
      }
      ownerGroups {
        ...OwnerGroupParts
      }
      contributorGroups {
        ...ContributorGroupParts
      }
    }
    target_internal_audit_report @include(if: \$IncludeInternalAudit) {
      ...InternalAuditReportParts
      owners {
        ...OwnerParts
      }
      contributors {
        ...ContributorParts
      }
      ownerGroups {
        ...OwnerGroupParts
      }
      contributorGroups {
        ...ContributorGroupParts
      }
    }
    target_internal_audit_entity @include(if: \$IncludeInternalAudit) {
      ...InternalAuditEntityParts
      owners {
        ...OwnerParts
      }
      contributors {
        ...ContributorParts
      }
      ownerGroups {
        ...OwnerGroupParts
      }
      contributorGroups {
        ...ContributorGroupParts
      }
    }
    target_impact {
      ...ImpactParts
      owners {
        ...OwnerParts
      }
      ownerGroups {
        ...OwnerGroupParts
      }
    }
    target_obligation_impact {
      Id
      Description
      ParentObligationId
    }
    target_impact_rating {
      Id
      impact {
        ...ImpactParts
        owners {
          ...OwnerParts
        }
        ownerGroups {
          ...OwnerGroupParts
        }
      }
    }
    target_action {
      ...ActionParts
      owners {
        ...OwnerParts
      }
      contributors {
        ...ContributorParts
      }
      ownerGroups {
        ...OwnerGroupParts
      }
      contributorGroups {
        ...ContributorGroupParts
      }
    }
    target_indicator {
      ...IndicatorParts
      owners {
        ...OwnerParts
      }
      contributors {
        ...ContributorParts
      }
      ownerGroups {
        ...OwnerGroupParts
      }
      contributorGroups {
        ...ContributorGroupParts
      }
    }
    target_acceptance {
      ...AcceptanceParts
    }
    target_appetite {
      ...AppetiteParts
    }
    target_issue {
      ...IssueParts
      owners {
        ...OwnerParts
      }
      contributors {
        ...ContributorParts
      }
      ownerGroups {
        ...OwnerGroupParts
      }
      contributorGroups {
        ...ContributorGroupParts
      }
    }
    target_consequence {
      ...ConsequenceParts
    }
    target_cause {
      ...CauseParts
    }
    target_test_result {
      ...TestResultParts
    }
    target_action_update {
      ...ActionUpdateParts
    }
    target_issue_update {
      ...IssueUpdateParts
      issue {
        Type
      }
    }
    target_third_party {
      ...ThirdPartyParts
      owners {
        ...OwnerParts
      }
      contributors {
        ...ContributorParts
      }
      ownerGroups {
        ...OwnerGroupParts
      }
      contributorGroups {
        ...ContributorGroupParts
      }
    }
  }
}

fragment ControlParts on control {
  CreatedByUser
  ModifiedByUser
  Description
  Id
  CreatedAtTimestamp
  ModifiedAtTimestamp
  Title
  Type
  CustomAttributeData
  SequentialId
  schedule {
    ...ScheduleParts
  }
}

fragment ScheduleParts on schedule {
  Id
  Frequency
  ManualDueDate
  StartDate
  TimeToCompleteValue
  TimeToCompleteUnit
}

fragment OwnerParts on owner {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment ContributorParts on contributor {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment OwnerGroupParts on owner_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment ContributorGroupParts on contributor_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment ControlGroupParts on control_group {
  Description
  Id
  Owner
  ModifiedAtTimestamp
  CreatedAtTimestamp
  Title
  ModifiedByUser
  CreatedByUser
  CustomAttributeData
}

fragment ObligationParts on obligation {
  Adherence
  Description
  Id
  Interpretation
  ParentId
  Title
  Type
  CustomAttributeData
  SequentialId
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
  ExternalId
  RegulatorySourceId
  ExternalSyncedAt
  Reference
  SourceUrl
  schedule {
    ...ScheduleParts
  }
}

fragment DocumentParts on document {
  Id
  Title
  DocumentType
  Purpose
  ParentDocument
  CreatedByUser
  ModifiedByUser
  CreatedAtTimestamp
  ModifiedAtTimestamp
  CustomAttributeData
  SequentialId
  schedule {
    ...ScheduleParts
  }
}

fragment RiskParts on risk {
  Id
  Title
  Tier
  Description
  ParentRiskId
  CreatedByUser
  Treatment
  Status
  ModifiedByUser
  CreatedAtTimestamp
  ModifiedAtTimestamp
  CustomAttributeData
  SequentialId
  schedule {
    ...ScheduleParts
  }
}

fragment AssessmentActivityParts on assessment_activity {
  Title
  Id
  ParentId
  Summary
  Status
  ActivityType
  CompletionDate
  AssignedUser
  CreatedByUser
  CreatedAtTimestamp
  ModifiedByUser
  ModifiedAtTimestamp
  CustomAttributeData
  ownerGroups {
    UserGroupId
    group {
      Name
      users{
        UserId
      }
    }
  }
  owners {
    UserId
    user {
      FriendlyName
    }
  }
  createdByUser {
    FriendlyName
  }
  modifiedByUser {
    FriendlyName
  }
  IsRCSA
  RiskId
}

fragment AssessmentParts on assessment {
  ActualCompletionDate
  CompletedByUser
  CreatedAtTimestamp
  CreatedByUser
  CustomAttributeData
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  NextTestDate
  OriginatingItemId
  SequentialId
  StartDate
  Summary
  TargetCompletionDate
  Title
  Status
  Outcome
}

fragment InternalAuditReportParts on internal_audit_report {
  ActualCompletionDate
  CompletedByUser
  CreatedAtTimestamp
  CreatedByUser
  CustomAttributeData
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  NextTestDate
  OriginatingItemId
  SequentialId
  StartDate
  Summary
  TargetCompletionDate
  Title
  Status
  Outcome
}

fragment InternalAuditEntityParts on internal_audit_entity {
  Id
  SequentialId
  Title
  Description
  CreatedByUser
  ModifiedByUser
  CreatedAtTimestamp
  ModifiedAtTimestamp
  CustomAttributeData
  businessArea {
    Title
    SequentialId
    Id
  }
}

fragment ImpactParts on impact {
  CreatedAtTimestamp
  CreatedByUser
  Rationale
  RatingGuidance
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  Name
  CustomAttributeData
  SequentialId
  LikelihoodAppetite
}

fragment ActionParts on action {
  DateDue
  DateRaised
  Description
  Id
  Priority
  Status
  ModifiedAtTimestamp
  CreatedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  ClosedDate
  CustomAttributeData
  SequentialId
}

fragment IndicatorParts on indicator {
  SequentialId
  Type
  UpperToleranceNum
  Unit
  Title
  TargetValueTxt
  LowerToleranceNum
  Id
  Description
  CustomAttributeData
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
  LowerAppetiteNum
  UpperAppetiteNum
  schedule {
    ...ScheduleParts
  }
}

fragment AcceptanceParts on acceptance {
  DateAcceptedFrom
  DateAcceptedTo
  Details
  Id
  Status
  ModifiedAtTimestamp
  CreatedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  ApprovedByUser
  ApprovedByUserGroup
  RequestedByUser
  RequestedByUserGroup
  CustomAttributeData
  SequentialId
}

fragment AppetiteParts on appetite {
  Id
  LowerAppetite
  UpperAppetite
  ImpactAppetite
  LikelihoodAppetite
  Statement
  EffectiveDate
  AppetiteType
  CreatedAtTimestamp
  ModifiedAtTimestamp
  CreatedByUser
  ModifiedByUser
  CustomAttributeData
  SequentialId
  ImpactId
}

fragment IssueParts on issue {
  RaisedAtTimestamp
  DateIdentified
  DateOccurred
  Details
  Id
  ImpactsCustomer
  IsExternalIssue
  CreatedAtTimestamp
  ModifiedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  SequentialId
  CustomAttributeData
  Meta
  Type
}

fragment ConsequenceParts on consequence {
  CostType
  CostValue
  Criticality
  Description
  Id
  ParentIssueId
  ModifiedAtTimestamp
  CreatedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  CustomAttributeData
  Type
}

fragment CauseParts on cause {
  ModifiedByUser
  CreatedByUser
  Title
  ModifiedAtTimestamp
  CreatedAtTimestamp
  Significance
  ParentIssueId
  Id
  Description
  CustomAttributeData
}

fragment TestResultParts on test_result {
  Description
  DesignEffectiveness
  Id
  OverallEffectiveness
  ParentControlId
  PerformanceEffectiveness
  Submitter
  TestDate
  TestType
  CreatedAtTimestamp
  ModifiedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  CustomAttributeData
  SequentialId
}

fragment ActionUpdateParts on action_update {
  Description
  Id
  ParentActionId
  CreatedAtTimestamp
  ModifiedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  CustomAttributeData
}

fragment IssueUpdateParts on issue_update {
  Description
  Id
  ParentIssueId
  CreatedAtTimestamp
  ModifiedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  CustomAttributeData
}

fragment ThirdPartyParts on third_party {
  Id
  SequentialId
  Title
  Description
  CompanyName
  CompaniesHouseNumber
  Address
  CityTown
  Postcode
  Country
  PrimaryContactName
  ContactName
  ContactEmail
  CompanyDomain
  Type
  Status
  Criticality
  CreatedByUser
  CustomAttributeData
  ModifiedByUser
  CreatedAtTimestamp
  ModifiedAtTimestamp
}`) as any;
export type GetLinkedItemsQuery = any;
export type GetLinkedItemsQueryVariables = any;
export type GetGetLinkedItemsQuery = any;
export type getLinkedItemsQuery = any;
export type getLinkedItemsQueryVariables = any;

export const LinkItemsDocument = parse(`mutation linkItems(\$Source: uuid!, \$Targets: [uuid!]!) {
  linkItems(Source: \$Source, Targets: \$Targets) {
    Links {
      Source
      Target
      RelationshipType
    }
  }
}`) as any;
export type LinkItemsMutation = any;
export type LinkItemsMutationVariables = any;
export type linkItemsMutation = any;
export type linkItemsMutationVariables = any;

export const GetModulesDocument = parse(`query getModules {
  organisation_module {
    ModuleSettings
  }
}`) as any;
export type GetModulesQuery = any;
export type GetModulesQueryVariables = any;
export type GetGetModulesQuery = any;
export type getModulesQuery = any;
export type getModulesQueryVariables = any;

export const UpdateModulesDocument = parse(`mutation updateModules(\$ModuleSettings: jsonb!) {
  insert_organisation_module(
    objects: [{ ModuleSettings: \$ModuleSettings }]
    on_conflict: {
      constraint: organisation_module_pkey
      update_columns: [ModuleSettings]
    }
  ) {
    affected_rows
  }
}`) as any;
export type UpdateModulesMutation = any;
export type UpdateModulesMutationVariables = any;
export type updateModulesMutation = any;
export type updateModulesMutationVariables = any;

export const GetMyDueItemsDocument = parse(`query getMyDueItems(
  \$userId: String!
  \$date: timestamptz!
  \$riskFilterConditions: risk_bool_exp!
  \$actionFilterConditions: action_bool_exp!
  \$assessmentFilterConditions: assessment_bool_exp!
  \$controlFilterConditions: control_bool_exp!
  \$issueFilterConditions: issue_bool_exp!
  \$assessmentActivityFilterConditions: assessment_activity_bool_exp!
  \$documentFilterConditions: document_bool_exp!
  \$indicatorFilterConditions: indicator_bool_exp!
  \$obligationFilterConditions: obligation_bool_exp!
) {
  change_request {
    ...MyItemsChangeRequestParts
  }

  risk(
    where: {
      _or: [\$riskFilterConditions]
      _and: [{ scheduleState: { DueDate: { _lte: \$date } } }]
    }
  ) {
    Id
    Title
    scheduleState {
      DueDate
      OverdueDate
    }
    ownerGroups {
      ...MyItemsOwnerGroupParts
    }
    contributorGroups {
      ...MyItemsContributorGroupParts
    }
  }

  action(
    where: {
      _or: [\$actionFilterConditions]
      _and: [{ Status: { _neq: closed } }, { DateDue: { _lte: \$date } }]
    }
  ) {
    Id
    DateDue
    Title
    Status
    ownerGroups {
      ...MyItemsOwnerGroupParts
    }
    contributorGroups {
      ...MyItemsContributorGroupParts
    }
  }

  assessment(
    where: {
      _or: [\$assessmentFilterConditions]
      _and: [
        { Status: { _neq: complete } }
        { TargetCompletionDate: { _lte: \$date } }
      ]
    }
  ) {
    Id
    Title
    TargetCompletionDate
    Status
    ownerGroups {
      ...MyItemsOwnerGroupParts
    }
    contributorGroups {
      ...MyItemsContributorGroupParts
    }
  }

  control(
    where: {
      _or: [\$controlFilterConditions]
      _and: { scheduleState: { DueDate: { _lte: \$date } } }
    }
  ) {
    Id
    Title
    scheduleState {
      DueDate
      OverdueDate
    }
    ownerGroups {
      ...MyItemsOwnerGroupParts
    }
    contributorGroups {
      ...MyItemsContributorGroupParts
    }
  }

  issue(
    where: {
      _or: [\$issueFilterConditions]
      _and: {
        assessment: {
          Status: { _neq: closed }
          TargetCloseDate: { _lte: \$date }
        }
      }
    }
  ) {
    Id
    Title
    assessment {
      TargetCloseDate
      Status
    }
    ownerGroups {
      ...MyItemsOwnerGroupParts
    }
    contributorGroups {
      ...MyItemsContributorGroupParts
    }
  }

  assessment_activity(
    where: {
      _or: [\$assessmentActivityFilterConditions]
      _and: [
        { IsRCSA: { _eq: true } }
        { Status: { _neq: complete } }
        { parentRisk: { scheduleState: { DueDate: { _lte: \$date } } } }
      ]
    }
  ) {
    Id
    Title
    RiskId
    parentRisk {
      scheduleState {
        DueDate
      }
    }
    Status
  }

  attestation_record(
    where: {
      _and: [
        { UserId: { _eq: \$userId } }
        { AttestationStatus: { _eq: pending } }
        { ExpiresAt: { _lte: \$date } }
      ]
    }
  ) {
    ExpiresAt
    AttestationStatus
    attestationRecordStatus {
      Status
    }
    node {
      documentFile {
        parent {
          Id
          Title
        }
      }
    }
  }

  document(
    where: {
      _or: [\$documentFilterConditions]
      _and: [{ scheduleState: { DueDate: { _lte: \$date } } }]
    }
  ) {
    Id
    Title
    scheduleState {
      DueDate
      OverdueDate
    }
    ownerGroups {
      ...MyItemsOwnerGroupParts
    }
    contributorGroups {
      ...MyItemsContributorGroupParts
    }
  }

  indicator(
    where: {
      _or: [\$indicatorFilterConditions]
      _and: [{ scheduleState: { DueDate: { _lte: \$date } } }]
    }
  ) {
    Id
    Title
    scheduleState {
      DueDate
      OverdueDate
    }
    ownerGroups {
      ...MyItemsOwnerGroupParts
    }
    contributorGroups {
      ...MyItemsContributorGroupParts
    }
  }

  obligation(
    where: {
      _or: [\$obligationFilterConditions]
      _and: [{ scheduleState: { DueDate: { _lte: \$date } } }]
    }
  ) {
    Id
    Title
    scheduleState {
      DueDate
      OverdueDate
    }
    ownerGroups {
      ...MyItemsOwnerGroupParts
    }
    contributorGroups {
      ...MyItemsContributorGroupParts
    }
  }
}

fragment MyItemsChangeRequestParts on change_request {
  ChangeRequestStatus
  CreatedAtTimestamp
  Id
  responses {
    Approved
    approver {
      OwnerApprover
      level {
        Id
        ApprovalRuleType
      }
      group {
        users {
          UserId
        }
      }
      user {
        Id
      }
    }
  }
  parent {
    Id
    SequentialId
    ObjectType
    risk {
      Id
      Title
    }

    documentFile {
      Version
      parent {
        Id
        Title
      }
    }

    action {
      Id
      Title
    }

    issue_assessment {
      parent {
        Id
        Title
      }
    }

    acceptance {
      Id
      Title
    }

    control {
      Id
      Title
    }

    issue {
      Id
      Title
    }
  }
  currentUserOwnerList: parentOwnerAndContributors(
    where: { ContributorType: { _eq: "owner" }, UserId: { _eq: \$userId } }
    distinct_on: [UserId]
  ) {
    UserId
  }
}

fragment MyItemsOwnerGroupParts on owner_group {
  UserGroupId
  group {
    users {
      UserId
    }
  }
}

fragment MyItemsContributorGroupParts on contributor_group {
  UserGroupId
  group {
    users {
      UserId
    }
  }
}`) as any;
export type GetMyDueItemsQuery = any;
export type GetMyDueItemsQueryVariables = any;
export type GetGetMyDueItemsQuery = any;
export type getMyDueItemsQuery = any;
export type getMyDueItemsQueryVariables = any;

export const GetMyItemsDocument = parse(`query getMyItems(\$userId: String!) {
  obligation(where: { ancestorContributors: { UserId: { _eq: \$userId } } }) {
    Id
    Title
    Description
    owners {
      ...OwnerParts
    }
    ownerGroups {
      ...OwnerGroupParts
    }
    contributors {
      ...ContributorParts
    }
    contributorGroups {
      ...ContributorGroupParts
    }
    tags {
      ...TagParts
    }
    departments {
      ...DepartmentParts
    }
  }

  risk(where: { ancestorContributors: { UserId: { _eq: \$userId } } }) {
    Id
    Title
    Description
    owners {
      ...OwnerParts
    }
    ownerGroups {
      ...OwnerGroupParts
    }
    contributors {
      ...ContributorParts
    }
    contributorGroups {
      ...ContributorGroupParts
    }
    tags {
      ...TagParts
    }
    departments {
      ...DepartmentParts
    }
  }

  action(where: { ancestorContributors: { UserId: { _eq: \$userId } } }) {
    Id
    Title
    Description
    owners {
      ...OwnerParts
    }
    ownerGroups {
      ...OwnerGroupParts
    }
    contributors {
      ...ContributorParts
    }
    contributorGroups {
      ...ContributorGroupParts
    }
    tags {
      ...TagParts
    }
    departments {
      ...DepartmentParts
    }
  }

  control(where: { ancestorContributors: { UserId: { _eq: \$userId } } }) {
    Id
    Title
    Description
    owners {
      ...OwnerParts
    }
    ownerGroups {
      ...OwnerGroupParts
    }
    contributors {
      ...ContributorParts
    }
    contributorGroups {
      ...ContributorGroupParts
    }
    tags {
      ...TagParts
    }
    departments {
      ...DepartmentParts
    }
  }

  indicator(where: { ancestorContributors: { UserId: { _eq: \$userId } } }) {
    Id
    Title
    Description
    owners {
      ...OwnerParts
    }
    ownerGroups {
      ...OwnerGroupParts
    }
    contributors {
      ...ContributorParts
    }
    contributorGroups {
      ...ContributorGroupParts
    }
    tags {
      ...TagParts
    }
    departments {
      ...DepartmentParts
    }
  }

  issue(where: { ancestorContributors: { UserId: { _eq: \$userId } } }) {
    Id
    Title
    Details
    owners {
      ...OwnerParts
    }
    ownerGroups {
      ...OwnerGroupParts
    }
    contributors {
      ...ContributorParts
    }
    contributorGroups {
      ...ContributorGroupParts
    }
    tags {
      ...TagParts
    }
    departments {
      ...DepartmentParts
    }
  }

  document(where: { ancestorContributors: { UserId: { _eq: \$userId } } }) {
    Id
    Title
    Purpose
    owners {
      ...OwnerParts
    }
    ownerGroups {
      ...OwnerGroupParts
    }
    contributors {
      ...ContributorParts
    }
    contributorGroups {
      ...ContributorGroupParts
    }
    tags {
      ...TagParts
    }
    departments {
      ...DepartmentParts
    }
  }

  assessment(where: { ancestorContributors: { UserId: { _eq: \$userId } } }) {
    Id
    Title
    Summary
    owners {
      ...OwnerParts
    }
    ownerGroups {
      ...OwnerGroupParts
    }
    contributors {
      ...ContributorParts
    }
    contributorGroups {
      ...ContributorGroupParts
    }

    tags {
      ...TagParts
    }
    departments {
      ...DepartmentParts
    }
  }
}

fragment OwnerParts on owner {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment OwnerGroupParts on owner_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment ContributorParts on contributor {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment ContributorGroupParts on contributor_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment TagParts on tag {
  type {
    Description
    Name
  }
  ParentId
  TagTypeId
}

fragment DepartmentParts on department {
  type {
    Description
    Name
  }
  ParentId
  DepartmentTypeId
}`) as any;
export type GetMyItemsQuery = any;
export type GetMyItemsQueryVariables = any;
export type GetGetMyItemsQuery = any;
export type getMyItemsQuery = any;
export type getMyItemsQueryVariables = any;

export const GetAcceptanceCountDocument = parse(`query getAcceptanceCount(\$where: acceptance_bool_exp! = {}) {
  acceptance_aggregate(where: \$where) {
    aggregate {
      count
    }
  }
}`) as any;
export type GetAcceptanceCountQuery = any;
export type GetAcceptanceCountQueryVariables = any;
export type GetGetAcceptanceCountQuery = any;
export type getAcceptanceCountQuery = any;
export type getAcceptanceCountQueryVariables = any;

export const GetAppetiteCountDocument = parse(`query getAppetiteCount(\$where: risk_bool_exp! = {}) {
  risk_aggregate(where: \$where) {
    aggregate {
      count
    }
  }
}`) as any;
export type GetAppetiteCountQuery = any;
export type GetAppetiteCountQueryVariables = any;
export type GetGetAppetiteCountQuery = any;
export type getAppetiteCountQuery = any;
export type getAppetiteCountQueryVariables = any;

export const GetAssessmentActivityCountDocument = parse(`query getAssessmentActivityCount {
  assessment_activity_aggregate(
    where: { parentAssessment: {} }
  ) {
    aggregate {
      count
    }
  }
}`) as any;
export type GetAssessmentActivityCountQuery = any;
export type GetAssessmentActivityCountQueryVariables = any;
export type GetGetAssessmentActivityCountQuery = any;
export type getAssessmentActivityCountQuery = any;
export type getAssessmentActivityCountQueryVariables = any;

export const GetAssessmentCountDocument = parse(`query getAssessmentCount {
  assessment_aggregate {
    aggregate {
      count
    }
  }
}`) as any;
export type GetAssessmentCountQuery = any;
export type GetAssessmentCountQueryVariables = any;
export type GetGetAssessmentCountQuery = any;
export type getAssessmentCountQuery = any;
export type getAssessmentCountQueryVariables = any;

export const GetAssessmentResultCountDocument = parse(`query getAssessmentResultCount {
  risk_assessment_result_aggregate(where: { parents: { assessment: {} } }) {
    aggregate {
      count
    }
  }
  document_assessment_result_aggregate(where: { parents: { assessment: {} } }) {
    aggregate {
      count
    }
  }
  obligation_assessment_result_aggregate(
    where: { parents: { assessment: {} } }
  ) {
    aggregate {
      count
    }
  }
}`) as any;
export type GetAssessmentResultCountQuery = any;
export type GetAssessmentResultCountQueryVariables = any;
export type GetGetAssessmentResultCountQuery = any;
export type getAssessmentResultCountQuery = any;
export type getAssessmentResultCountQueryVariables = any;

export const GetCauseCountDocument = parse(`query getCauseCount(\$where: cause_bool_exp! = {}) {
  cause_aggregate(where: \$where) {
    aggregate {
      count
    }
  }
}`) as any;
export type GetCauseCountQuery = any;
export type GetCauseCountQueryVariables = any;
export type GetGetCauseCountQuery = any;
export type getCauseCountQuery = any;
export type getCauseCountQueryVariables = any;

export const GetComplianceMonitoringAssessmentCountDocument = parse(`query getComplianceMonitoringAssessmentCount {
  compliance_monitoring_assessment_aggregate {
    aggregate {
      count
    }
  }
}`) as any;
export type GetComplianceMonitoringAssessmentCountQuery = any;
export type GetComplianceMonitoringAssessmentCountQueryVariables = any;
export type GetGetComplianceMonitoringAssessmentCountQuery = any;
export type getComplianceMonitoringAssessmentCountQuery = any;
export type getComplianceMonitoringAssessmentCountQueryVariables = any;

export const GetComplianceMonitoringAssessmentResultCountDocument = parse(`query getComplianceMonitoringAssessmentResultCount {
  risk_controlled_second_line_result_aggregate {
    aggregate {
      count
    }
  }
  risk_uncontrolled_second_line_result_aggregate {
    aggregate {
      count
    }
  }
  document_second_line_result_aggregate {
    aggregate {
      count
    }
  }
  obligation_second_line_result_aggregate {
    aggregate {
      count
    }
  }
}`) as any;
export type GetComplianceMonitoringAssessmentResultCountQuery = any;
export type GetComplianceMonitoringAssessmentResultCountQueryVariables = any;
export type GetGetComplianceMonitoringAssessmentResultCountQuery = any;
export type getComplianceMonitoringAssessmentResultCountQuery = any;
export type getComplianceMonitoringAssessmentResultCountQueryVariables = any;

export const GetConsequenceCountDocument = parse(`query getConsequenceCount(\$where: consequence_bool_exp! = {}) {
  consequence_aggregate(where: \$where) {
    aggregate {
      count
    }
  }
}`) as any;
export type GetConsequenceCountQuery = any;
export type GetConsequenceCountQueryVariables = any;
export type GetGetConsequenceCountQuery = any;
export type getConsequenceCountQuery = any;
export type getConsequenceCountQueryVariables = any;

export const GetControlCountDocument = parse(`query getControlCount(\$where: control_bool_exp! = {}) {
  control_aggregate(where: \$where) {
    aggregate {
      count
    }
  }
}`) as any;
export type GetControlCountQuery = any;
export type GetControlCountQueryVariables = any;
export type GetGetControlCountQuery = any;
export type getControlCountQuery = any;
export type getControlCountQueryVariables = any;

export const GetControlGroupCountDocument = parse(`query getControlGroupCount {
  control_group_aggregate {
    aggregate {
      count
    }
  }
}`) as any;
export type GetControlGroupCountQuery = any;
export type GetControlGroupCountQueryVariables = any;
export type GetGetControlGroupCountQuery = any;
export type getControlGroupCountQuery = any;
export type getControlGroupCountQueryVariables = any;

export const GetInternalAuditReportCountDocument = parse(`query getInternalAuditReportCount {
  internal_audit_report_aggregate {
    aggregate {
      count
    }
  }
}`) as any;
export type GetInternalAuditReportCountQuery = any;
export type GetInternalAuditReportCountQueryVariables = any;
export type GetGetInternalAuditReportCountQuery = any;
export type getInternalAuditReportCountQuery = any;
export type getInternalAuditReportCountQueryVariables = any;

export const GetInternalAuditReportResultCountDocument = parse(`query getInternalAuditReportResultCount {
  risk_controlled_internal_audit_result_aggregate(
    where: { parents: { internalAuditReport: {} } }
  ) {
    aggregate {
      count
    }
  }
  risk_uncontrolled_internal_audit_result_aggregate(
    where: { parents: { internalAuditReport: {} } }
  ) {
    aggregate {
      count
    }
  }
  document_internal_audit_result_aggregate(
    where: { parents: { internalAuditReport: {} } }
  ) {
    aggregate {
      count
    }
  }
  obligation_internal_audit_result_aggregate(
    where: { parents: { internalAuditReport: {} } }
  ) {
    aggregate {
      count
    }
  }
}`) as any;
export type GetInternalAuditReportResultCountQuery = any;
export type GetInternalAuditReportResultCountQueryVariables = any;
export type GetGetInternalAuditReportResultCountQuery = any;
export type getInternalAuditReportResultCountQuery = any;
export type getInternalAuditReportResultCountQueryVariables = any;

export const GetIssueCountDocument = parse(`query getIssueCount(\$where: issue_bool_exp! = {}) {
  issue_aggregate(where: \$where) {
    aggregate {
      count
    }
  }
}`) as any;
export type GetIssueCountQuery = any;
export type GetIssueCountQueryVariables = any;
export type GetGetIssueCountQuery = any;
export type getIssueCountQuery = any;
export type getIssueCountQueryVariables = any;

export const GetRiskCountDocument = parse(`query getRiskCount(\$where: risk_bool_exp! = {}) {
  risk_aggregate(where: \$where) {
    aggregate {
      count
    }
  }
}`) as any;
export type GetRiskCountQuery = any;
export type GetRiskCountQueryVariables = any;
export type GetGetRiskCountQuery = any;
export type getRiskCountQuery = any;
export type getRiskCountQueryVariables = any;

export const GetTestResultCountDocument = parse(`query getTestResultCount(\$where: test_result_bool_exp! = {}) {
  test_result_aggregate(where: \$where) {
    aggregate {
      count
    }
  }
}`) as any;
export type GetTestResultCountQuery = any;
export type GetTestResultCountQueryVariables = any;
export type GetGetTestResultCountQuery = any;
export type getTestResultCountQuery = any;
export type getTestResultCountQueryVariables = any;

export const GetObjectTypeByIdDocument = parse(`query getObjectTypeById(\$Id: uuid!) {
  node: node_by_pk(Id: \$Id) {
    ObjectType
  }
}`) as any;
export type GetObjectTypeByIdQuery = any;
export type GetObjectTypeByIdQueryVariables = any;
export type GetGetObjectTypeByIdQuery = any;
export type getObjectTypeByIdQuery = any;
export type getObjectTypeByIdQueryVariables = any;

export const DisconnectSlackDocument = parse(`mutation disconnectSlack {
  disconnectSlack {
    message
  }
}`) as any;
export type DisconnectSlackMutation = any;
export type DisconnectSlackMutationVariables = any;
export type disconnectSlackMutation = any;
export type disconnectSlackMutationVariables = any;

export const GetNotificationListDetailsDocument = parse(`query getNotificationListDetails(
  \$issueIds: [uuid!]!
  \$actionIds: [uuid!]!
  \$riskIds: [uuid!]!
  \$controlIds: [uuid!]!
  \$documentFileIds: [uuid!]!
  \$documentIds: [uuid!]!
  \$indicatorIds: [uuid!]!
) {
  action(where: { Id: { _in: \$actionIds } }) {
    Id
    SequentialId
    Title
  }

  issue(where: { Id: { _in: \$issueIds } }) {
    Id
    SequentialId
    Title
  }

  risk(where: { Id: { _in: \$riskIds } }) {
    Id
    SequentialId
    Title
  }

  control(where: { Id: { _in: \$controlIds } }) {
    Id
    SequentialId
    Title
  }

  document_file(where: { Id: { _in: \$documentFileIds } }) {
    Id
    ParentDocumentId
  }

  document(where: { Id: { _in: \$documentIds } }) {
    Id
    SequentialId
    Title
  }

  indicator(where: { Id: { _in: \$indicatorIds } }) {
    Id
    SequentialId
    Title
  }
}`) as any;
export type GetNotificationListDetailsQuery = any;
export type GetNotificationListDetailsQueryVariables = any;
export type GetGetNotificationListDetailsQuery = any;
export type getNotificationListDetailsQuery = any;
export type getNotificationListDetailsQueryVariables = any;

export const GetNotificationPreferencesDocument = parse(`query getNotificationPreferences {
  notificationPreferences {
    categories
    channel_types
    id
    workflows
  }
  slackNotificationConnection {
    connected
  }
}`) as any;
export type GetNotificationPreferencesQuery = any;
export type GetNotificationPreferencesQueryVariables = any;
export type GetGetNotificationPreferencesQuery = any;
export type getNotificationPreferencesQuery = any;
export type getNotificationPreferencesQueryVariables = any;

export const UpdateNotificationPreferencesDocument = parse(`mutation updateNotificationPreferences(
  \$preferenceSet: UpdateNotificationPreferencesInput!
) {
  updateNotificationPreferences(preferenceSet: \$preferenceSet) {
    message
  }
}`) as any;
export type UpdateNotificationPreferencesMutation = any;
export type UpdateNotificationPreferencesMutationVariables = any;
export type updateNotificationPreferencesMutation = any;
export type updateNotificationPreferencesMutationVariables = any;

export const DeleteObligationDocument = parse(`mutation deleteObligation(\$id: uuid!) {
  delete_obligation_impact(where: { ParentObligationId: { _eq: \$id } }) {
    affected_rows
  }

  delete_obligation(where: { Id: { _eq: \$id } }) {
    affected_rows
  }
}`) as any;
export type DeleteObligationMutation = any;
export type DeleteObligationMutationVariables = any;
export type deleteObligationMutation = any;
export type deleteObligationMutationVariables = any;

export const GetObligationAuditByIdDocument = parse(`query getObligationAuditById(\$Id: uuid!) {
  obligation_audit(where: { Id: { _eq: \$Id } }) {
    Adherence
    Description
    Id
    Interpretation
    ParentId
    Title
    Type
    CustomAttributeData
    SequentialId
    CreatedAtTimestamp
    CreatedByUser
    ModifiedAtTimestamp
    ModifiedByUser
  }
}`) as any;
export type GetObligationAuditByIdQuery = any;
export type GetObligationAuditByIdQueryVariables = any;
export type GetGetObligationAuditByIdQuery = any;
export type getObligationAuditByIdQuery = any;
export type getObligationAuditByIdQueryVariables = any;

export const GetObligationByIdDocument = parse(`query getObligationById(\$_eq: uuid!) {
  obligation(where: { Id: { _eq: \$_eq } }) {
    ...ObligationParts
    scheduleState {
      LatestDate
    }
    CreatedBy: createdBy {
      FriendlyName
    }
    ModifiedBy: modifiedBy {
      FriendlyName
    }
    Parent: parent {
      Id
      Title
    }
    parentNode {
      Id
      ObjectType
      SequentialId
    }
    owners {
      ...OwnerParts
    }
    contributors {
      ...ContributorParts
    }
    ownerGroups {
      ...OwnerGroupParts
    }
    contributorGroups {
      ...ContributorGroupParts
    }
    tags {
      ...TagParts
    }
    departments {
      ...DepartmentParts
    }
    ancestorContributors {
      ...AncestorContributorParts
    }
  }
}

fragment ObligationParts on obligation {
  Adherence
  Description
  Id
  Interpretation
  ParentId
  Title
  Type
  CustomAttributeData
  SequentialId
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
  ExternalId
  RegulatorySourceId
  ExternalSyncedAt
  Reference
  SourceUrl
  schedule {
    ...ScheduleParts
  }
}

fragment ScheduleParts on schedule {
  Id
  Frequency
  ManualDueDate
  StartDate
  TimeToCompleteValue
  TimeToCompleteUnit
}

fragment OwnerParts on owner {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment ContributorParts on contributor {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment OwnerGroupParts on owner_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment ContributorGroupParts on contributor_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment TagParts on tag {
  type {
    Description
    Name
  }
  ParentId
  TagTypeId
}

fragment DepartmentParts on department {
  type {
    Description
    Name
  }
  ParentId
  DepartmentTypeId
}

fragment AncestorContributorParts on ancestor_contributor {
  ContributorType
  UserId
  Id
  AncestorId
  UserGroupId
  user {
    FriendlyName
  }
  user_group {
    Name
  }
}`) as any;
export type GetObligationByIdQuery = any;
export type GetObligationByIdQueryVariables = any;
export type GetGetObligationByIdQuery = any;
export type getObligationByIdQuery = any;
export type getObligationByIdQueryVariables = any;

export const GetObligationListDocument = parse(`query getObligationList {
  # Note: Query is must faster for standard users when obligations are queried separately to nodes
  obligation {
    Id
    Title
    SequentialId
  }
  # Get obligation nodes so we have IDs for even controls we don't have access to
  node(where: { ObjectType: { _eq: obligation } }) {
    Id
    SequentialId
  }
}`) as any;
export type GetObligationListQuery = any;
export type GetObligationListQueryVariables = any;
export type GetGetObligationListQuery = any;
export type getObligationListQuery = any;
export type getObligationListQueryVariables = any;

export const GetObligationsDocument = parse(`query getObligations(
  \$where: obligation_bool_exp! = {}
  \$obligationAssessmentResultsWhere: obligation_assessment_result_bool_exp = {}
  \$includeAssessmentResultsHistory: Boolean = false
) {
  obligation(where: \$where) {
    ...ObligationParts
    scheduleState {
      LatestDate
      DueDate
      OverdueDate
    }
    CreatedAtTimestamp
    CreatedByUser
    ModifiedAtTimestamp
    ModifiedByUser
    CreatedBy: createdBy {
      FriendlyName
    }
    ModifiedBy: modifiedBy {
      FriendlyName
    }

    Parent: parent {
      Id
      Title
    }
    parentNode {
      Id
      ObjectType
      SequentialId
    }
    owners {
      ...OwnerParts
    }
    ownerGroups {
      ...OwnerGroupParts
    }
    contributors {
      ...ContributorParts
    }
    contributorGroups {
      ...ContributorGroupParts
    }
    tags {
      ...TagParts
    }
    departments {
      ...DepartmentParts
    }
    controls_aggregate {
      aggregate {
        count
      }
    }
    BreachedIssues: issues(
      where: {
        issue: {
          assessment: {
            Status: { _in: [open, pending] }
            RegulatoryBreach: { _eq: true }
          }
        }
      }
    ) {
      ...BreachedIssuesParts
    }
    assessmentResults(
      where: {
        obligationAssessmentResult: {
          _and: [
            { RatingType: { _in: ["assessment", "rating"] } }
            \$obligationAssessmentResultsWhere
          ]
        }
      }
      order_by: [
        { obligationAssessmentResult: { TestDate: desc_nulls_last } }
        { obligationAssessmentResult: { CreatedAtTimestamp: desc_nulls_last } }
      ]
    ) @include(if: \$includeAssessmentResultsHistory) {
      ParentId
      obligationAssessmentResult {
        Id
        Rating
        TestDate
        CreatedAtTimestamp
      }
    }
  }
  assessment_result_parent(
    where: {
      obligationAssessmentResult: {
        RatingType: { _in: ["assessment", "rating"] }
      }
    }
    distinct_on: [ParentId]
    order_by: [
      { ParentId: desc }
      {
        obligationAssessmentResult: {
          TestDate: desc_nulls_last
          CreatedAtTimestamp: desc_nulls_last
        }
      }
    ]
  ) {
    obligationAssessmentResult {
      parents {
        ParentId
      }
      Id
      Rating
      CustomAttributeData
    }
  }
}

fragment ObligationParts on obligation {
  Adherence
  Description
  Id
  Interpretation
  ParentId
  Title
  Type
  CustomAttributeData
  SequentialId
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
  ExternalId
  RegulatorySourceId
  ExternalSyncedAt
  Reference
  SourceUrl
  schedule {
    ...ScheduleParts
  }
}

fragment ScheduleParts on schedule {
  Id
  Frequency
  ManualDueDate
  StartDate
  TimeToCompleteValue
  TimeToCompleteUnit
}

fragment OwnerParts on owner {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment OwnerGroupParts on owner_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment ContributorParts on contributor {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment ContributorGroupParts on contributor_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment TagParts on tag {
  type {
    Description
    Name
  }
  ParentId
  TagTypeId
}

fragment DepartmentParts on department {
  type {
    Description
    Name
  }
  ParentId
  DepartmentTypeId
}

fragment BreachedIssuesParts on issue_parent {
  issue {
    ...SimplifiedIssueParts
  }
}

fragment SimplifiedIssueParts on issue {
  Id
  Title
}`) as any;
export type GetObligationsQuery = any;
export type GetObligationsQueryVariables = any;
export type GetGetObligationsQuery = any;
export type getObligationsQuery = any;
export type getObligationsQueryVariables = any;

export const GetObligationsByTypeDocument = parse(`query getObligationsByType(\$type: obligation_type_enum!) {
  obligation(where: { Type: { _eq: \$type } }) {
    Title
    SequentialId
    Id
  }
}`) as any;
export type GetObligationsByTypeQuery = any;
export type GetObligationsByTypeQueryVariables = any;
export type GetGetObligationsByTypeQuery = any;
export type getObligationsByTypeQuery = any;
export type getObligationsByTypeQueryVariables = any;

export const InsertObligationDocument = parse(`mutation insertObligation(\$object: InsertChildObligationInput) {
  insertChildObligation(object: \$object) {
    Id
  }
}`) as any;
export type InsertObligationMutation = any;
export type InsertObligationMutationVariables = any;
export type insertObligationMutation = any;
export type insertObligationMutationVariables = any;

export const ObligationPartsDocument = parse(`fragment ObligationParts on obligation {
  Adherence
  Description
  Id
  Interpretation
  ParentId
  Title
  Type
  CustomAttributeData
  SequentialId
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
  ExternalId
  RegulatorySourceId
  ExternalSyncedAt
  Reference
  SourceUrl
  schedule {
    ...ScheduleParts
  }
}

fragment ScheduleParts on schedule {
  Id
  Frequency
  ManualDueDate
  StartDate
  TimeToCompleteValue
  TimeToCompleteUnit
}`) as any;
export type ObligationPartsFragment = any;

export const UpdateObligationDocument = parse(`mutation updateObligation(\$object: UpdateChildObligationInput) {
  updateChildObligation(object: \$object) {
    Id
  }
}`) as any;
export type UpdateObligationMutation = any;
export type UpdateObligationMutationVariables = any;
export type updateObligationMutation = any;
export type updateObligationMutationVariables = any;

export const GetObligationChangeByIdDocument = parse(`query getObligationChangeById(\$_eq: uuid!) {
  obligation_change(where: { Id: { _eq: \$_eq } }) {
    Id
    SequentialId
    DescriptionBefore
    DescriptionAfter
    Rationale
    ObligationId
    ExternalId
    EffectiveDate
    CreatedAtTimestamp
    ModifiedAtTimestamp
    CreatedByUser
    ModifiedByUser
    obligation {
      Id
      Title
      Description
      Reference
      regulatorySource {
        RegulatorName
      }
    }
    createdBy {
      Id
      FriendlyName
    }
    modifiedBy {
      Id
      FriendlyName
    }
    owners {
      ...OwnerParts
    }
    ownerGroups {
      ...OwnerGroupParts
    }
    contributors {
      ...ContributorParts
    }
    contributorGroups {
      ...ContributorGroupParts
    }
    attestations {
      UserId
    }
    actions {
      action {
        Id
        Title
        SequentialId
      }
    }
  }
}

fragment OwnerParts on owner {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment OwnerGroupParts on owner_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment ContributorParts on contributor {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment ContributorGroupParts on contributor_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}`) as any;
export type GetObligationChangeByIdQuery = any;
export type GetObligationChangeByIdQueryVariables = any;
export type GetGetObligationChangeByIdQuery = any;
export type getObligationChangeByIdQuery = any;
export type getObligationChangeByIdQueryVariables = any;

export const GetObligationChangesDocument = parse(`query getObligationChanges {
  obligation_change {
    Id
    SequentialId
    DescriptionBefore
    DescriptionAfter
    Rationale
    ObligationId
    ExternalId
    EffectiveDate
    CreatedAtTimestamp
    ModifiedAtTimestamp
    CreatedByUser
    ModifiedByUser
    obligation {
      Id
      Title
      Reference
      regulatorySource {
        RegulatorName
      }
    }
    createdBy {
      Id
      FriendlyName
    }
    modifiedBy {
      Id
      FriendlyName
    }
    owners {
      ...OwnerParts
    }
    ownerGroups {
      ...OwnerGroupParts
    }
    contributors {
      ...ContributorParts
    }
    contributorGroups {
      ...ContributorGroupParts
    }
    attestations {
      UserId
    }
    actions {
      action {
        Id
        Title
        SequentialId
      }
    }
  }
}

fragment OwnerParts on owner {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment OwnerGroupParts on owner_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment ContributorParts on contributor {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment ContributorGroupParts on contributor_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}`) as any;
export type GetObligationChangesQuery = any;
export type GetObligationChangesQueryVariables = any;
export type GetGetObligationChangesQuery = any;
export type getObligationChangesQuery = any;
export type getObligationChangesQueryVariables = any;

export const DeleteObligationChangeAttestationDocument = parse(`mutation DeleteObligationChangeAttestation(
  \$object: DeleteChildObligationChangeAttestationInput!
) {
  deleteChildObligationChangeAttestation(object: \$object) {
    Id
  }
}`) as any;
export type DeleteObligationChangeAttestationMutation = any;
export type DeleteObligationChangeAttestationMutationVariables = any;

export const InsertObligationChangeAttestationOneDocument = parse(`mutation InsertObligationChangeAttestationOne(
  \$object: InsertChildObligationChangeAttestationInput!
) {
  insertChildObligationChangeAttestation(object: \$object) {
    Id
  }
}`) as any;
export type InsertObligationChangeAttestationOneMutation = any;
export type InsertObligationChangeAttestationOneMutationVariables = any;

export const DeleteImpactsDocument = parse(`mutation deleteImpacts(\$Ids: [uuid!]) {
  delete_obligation_impact(where: { Id: { _in: \$Ids } }) {
    affected_rows
  }
}`) as any;
export type DeleteImpactsMutation = any;
export type DeleteImpactsMutationVariables = any;
export type deleteImpactsMutation = any;
export type deleteImpactsMutationVariables = any;

export const GetObligationImpactAuditByIdDocument = parse(`query getObligationImpactAuditById(\$id: uuid!) {
  obligation_impact_audit(where: { Id: { _eq: \$id } }) {
    Id
    Description
    ImpactRating
    CustomAttributeData
    CreatedByUser
    CreatedAtTimestamp
    ModifiedByUser
    ModifiedAtTimestamp
  }
}`) as any;
export type GetObligationImpactAuditByIdQuery = any;
export type GetObligationImpactAuditByIdQueryVariables = any;
export type GetGetObligationImpactAuditByIdQuery = any;
export type getObligationImpactAuditByIdQuery = any;
export type getObligationImpactAuditByIdQueryVariables = any;

export const GetObligationImpactByIdDocument = parse(`query getObligationImpactById(\$id: uuid!) {
  obligation_impact(where: { Id: { _eq: \$id } }) {
    Id
    Description
    ImpactRating
    CustomAttributeData
  }
}`) as any;
export type GetObligationImpactByIdQuery = any;
export type GetObligationImpactByIdQueryVariables = any;
export type GetGetObligationImpactByIdQuery = any;
export type getObligationImpactByIdQuery = any;
export type getObligationImpactByIdQueryVariables = any;

export const GetObligationImpactsByParentIdDocument = parse(`query getObligationImpactsByParentId(\$_eq: uuid!) {
  obligation_impact(where: { ParentObligationId: { _eq: \$_eq } }) {
    CreatedAtTimestamp
    CreatedByUser
    Description
    Id
    ImpactRating
    ModifiedAtTimestamp
    ModifiedByUser
    ParentObligationId
    CustomAttributeData
    parent {
      Title
      Id
    }
    createdBy {
      FriendlyName
    }
    modifiedBy {
      FriendlyName
    }
  }
}`) as any;
export type GetObligationImpactsByParentIdQuery = any;
export type GetObligationImpactsByParentIdQueryVariables = any;
export type GetGetObligationImpactsByParentIdQuery = any;
export type getObligationImpactsByParentIdQuery = any;
export type getObligationImpactsByParentIdQueryVariables = any;

export const InsertObligationImpactDocument = parse(`mutation insertObligationImpact(
  \$Description: String!
  \$ImpactRating: smallint!
  \$ParentObligationId: uuid!
  \$CustomAttributeData: jsonb
) {
  insert_obligation_impact_one(
    object: {
      Description: \$Description
      ImpactRating: \$ImpactRating
      ParentObligationId: \$ParentObligationId
      CustomAttributeData: \$CustomAttributeData
    }
  ) {
    Id
  }
}`) as any;
export type InsertObligationImpactMutation = any;
export type InsertObligationImpactMutationVariables = any;
export type insertObligationImpactMutation = any;
export type insertObligationImpactMutationVariables = any;

export const UpdateObligationImpactDocument = parse(`mutation updateObligationImpact(
  \$id: uuid!
  \$ImpactRating: smallint!
  \$Description: String!
  \$CustomAttributeData: jsonb
) {
  update_obligation_impact(
    where: { Id: { _eq: \$id } }
    _set: {
      Description: \$Description
      ImpactRating: \$ImpactRating
      CustomAttributeData: \$CustomAttributeData
    }
  ) {
    affected_rows
  }
}`) as any;
export type UpdateObligationImpactMutation = any;
export type UpdateObligationImpactMutationVariables = any;
export type updateObligationImpactMutation = any;
export type updateObligationImpactMutationVariables = any;

export const GetOrganisationDocument = parse(`query getOrganisation {
  auth_organisation {
    Meta
    ScimEnabled
  }
}`) as any;
export type GetOrganisationQuery = any;
export type GetOrganisationQueryVariables = any;
export type GetGetOrganisationQuery = any;
export type getOrganisationQuery = any;
export type getOrganisationQueryVariables = any;

export const UpdateOrganisationDocument = parse(`mutation updateOrganisation(\$OrgKey: String, \$ScimEnabled: Boolean) {
  update_auth_organisation(
    where: { OrgKey: { _eq: \$OrgKey } }
    _set: { ScimEnabled: \$ScimEnabled }
  ) {
    affected_rows
  }
}`) as any;
export type UpdateOrganisationMutation = any;
export type UpdateOrganisationMutationVariables = any;
export type updateOrganisationMutation = any;
export type updateOrganisationMutationVariables = any;

export const GetQuestionnaireInvitesDocument = parse(`query getQuestionnaireInvites(\$thirdPartyId: uuid!) {
  questionnaire_invite(where: { ThirdPartyId: { _eq: \$thirdPartyId } }) {
    Id
    UserEmail
    CreatedAtTimestamp
    ModifiedAtTimestamp
    parent {
      Id
      Status
      StartDate
      ExpiresAt
      ResponseData
    }
    thirdParty {
      Id
      Title
    }
    createdByUser {
      FriendlyName
    }
    modifiedByUser {
      FriendlyName
    }
    questionnaireTemplateVersion {
      Id
      Version
      parent {
        Title
      }
    }
  }
}`) as any;
export type GetQuestionnaireInvitesQuery = any;
export type GetQuestionnaireInvitesQueryVariables = any;
export type GetGetQuestionnaireInvitesQuery = any;
export type getQuestionnaireInvitesQuery = any;
export type getQuestionnaireInvitesQueryVariables = any;

export const InsertQuestionnaireInvitesDocument = parse(`mutation insertQuestionnaireInvites(
  \$thirdPartyId: uuid!
  \$users: [String!]!
  \$message: String
  \$questionnaires: [uuid!]!
) {
  insertQuestionnaireInvites(
    ThirdPartyId: \$thirdPartyId
    UserEmails: \$users
    Message: \$message
    QuestionnaireTemplateVersionIds: \$questionnaires
  ) {
    affected_rows
  }
}`) as any;
export type InsertQuestionnaireInvitesMutation = any;
export type InsertQuestionnaireInvitesMutationVariables = any;
export type insertQuestionnaireInvitesMutation = any;
export type insertQuestionnaireInvitesMutationVariables = any;

export const DeleteQuestionnaireTemplateVersionsDocument = parse(`mutation deleteQuestionnaireTemplateVersions(\$questionnaireTemplateVersionIds: [uuid!]!) {
  delete_questionnaire_template_version(where: { Id: { _in: \$questionnaireTemplateVersionIds } }) {
    affected_rows
  }
}`) as any;
export type DeleteQuestionnaireTemplateVersionsMutation = any;
export type DeleteQuestionnaireTemplateVersionsMutationVariables = any;
export type deleteQuestionnaireTemplateVersionsMutation = any;
export type deleteQuestionnaireTemplateVersionsMutationVariables = any;

export const GetLatestQuestionnaireTemplateVersionDocument = parse(`query getLatestQuestionnaireTemplateVersion(\$where: questionnaire_template_version_bool_exp) {
  questionnaire_template_version(
    where: \$where
    order_by: { CreatedAtTimestamp: desc }
    limit: 1
  ) {
    Id
    Version
    Status
    ParentId
    Schema
    UISchema
    CreatedByUser
    createdByUser {
      Id
      FriendlyName
    }
    ModifiedByUser
    modifiedByUser {
      Id
      FriendlyName
    }
    CreatedAtTimestamp
    ModifiedAtTimestamp
    parent {
      Id
      Title
    }
    CustomAttributeData
  }
}`) as any;
export type GetLatestQuestionnaireTemplateVersionQuery = any;
export type GetLatestQuestionnaireTemplateVersionQueryVariables = any;
export type GetGetLatestQuestionnaireTemplateVersionQuery = any;
export type getLatestQuestionnaireTemplateVersionQuery = any;
export type getLatestQuestionnaireTemplateVersionQueryVariables = any;

export const GetQuestionnaireTemplateVersionByIdDocument = parse(`query getQuestionnaireTemplateVersionById(\$Id: uuid!) {
  questionnaire_template_version: questionnaire_template_version_by_pk(Id:\$Id) {
    Id
    Version
    Status
    ParentId
    Schema
    UISchema
    CreatedByUser
    createdByUser {
      Id
      FriendlyName
    }
    ModifiedByUser
    modifiedByUser {
      Id
      FriendlyName
    }
    parent {
      Id
      Title
    }
    CreatedAtTimestamp
    ModifiedAtTimestamp
    CustomAttributeData
  }
}`) as any;
export type GetQuestionnaireTemplateVersionByIdQuery = any;
export type GetQuestionnaireTemplateVersionByIdQueryVariables = any;
export type GetGetQuestionnaireTemplateVersionByIdQuery = any;
export type getQuestionnaireTemplateVersionByIdQuery = any;
export type getQuestionnaireTemplateVersionByIdQueryVariables = any;

export const GetQuestionnaireTemplateVersionsByQuestionnaireTemplateIdDocument = parse(`query getQuestionnaireTemplateVersionsByQuestionnaireTemplateId(\$questionnaireTemplateId: uuid!) {
  questionnaire_template_version(where: { ParentId: { _eq: \$questionnaireTemplateId } }) {
    Id
    Version
    Status
    ParentId
    Schema
    UISchema
    CreatedByUser
    createdByUser {
      Id
      FriendlyName
    }
    ModifiedByUser
    modifiedByUser {
      Id
      FriendlyName
    }
    CreatedAtTimestamp
    ModifiedAtTimestamp
    CustomAttributeData
  }
}`) as any;
export type GetQuestionnaireTemplateVersionsByQuestionnaireTemplateIdQuery = any;
export type GetQuestionnaireTemplateVersionsByQuestionnaireTemplateIdQueryVariables = any;
export type GetGetQuestionnaireTemplateVersionsByQuestionnaireTemplateIdQuery = any;
export type getQuestionnaireTemplateVersionsByQuestionnaireTemplateIdQuery = any;
export type getQuestionnaireTemplateVersionsByQuestionnaireTemplateIdQueryVariables = any;

export const InsertQuestionnaireTemplateVersionDocument = parse(`mutation insertQuestionnaireTemplateVersion(\$object: questionnaire_template_version_insert_input!) {
  insert_questionnaire_template_version_one(object: \$object) {
    Id
  }
}`) as any;
export type InsertQuestionnaireTemplateVersionMutation = any;
export type InsertQuestionnaireTemplateVersionMutationVariables = any;
export type insertQuestionnaireTemplateVersionMutation = any;
export type insertQuestionnaireTemplateVersionMutationVariables = any;

export const PublishQuestionnaireTemplateVersionDocument = parse(`mutation publishQuestionnaireTemplateVersion(
  \$questionnaireTemplateId: uuid!
  \$questionnaireTemplateVersionId: uuid!
) {
  publishQuestionnaireTemplateVersion(
    QuestionnaireTemplateId: \$questionnaireTemplateId,
    QuestionnaireTemplateVersionId: \$questionnaireTemplateVersionId) {
    affected_rows
  }
}`) as any;
export type PublishQuestionnaireTemplateVersionMutation = any;
export type PublishQuestionnaireTemplateVersionMutationVariables = any;
export type publishQuestionnaireTemplateVersionMutation = any;
export type publishQuestionnaireTemplateVersionMutationVariables = any;

export const UpdateQuestionnaireTemplateVersionDocument = parse(`mutation updateQuestionnaireTemplateVersion(\$Id: uuid!, \$object: questionnaire_template_version_set_input!) {
  update_questionnaire_template_version_by_pk(pk_columns: { Id: \$Id }, _set: \$object) {
    Id
  }
}`) as any;
export type UpdateQuestionnaireTemplateVersionMutation = any;
export type UpdateQuestionnaireTemplateVersionMutationVariables = any;
export type updateQuestionnaireTemplateVersionMutation = any;
export type updateQuestionnaireTemplateVersionMutationVariables = any;

export const DeleteQuestionnaireTemplateDocument = parse(`mutation deleteQuestionnaireTemplate(\$Id: uuid!) {
  delete_questionnaire_template_version(where: { ParentId: { _eq: \$Id } }) {
    affected_rows
  }

  delete_questionnaire_template_by_pk(Id: \$Id) {
    Id
  }
}`) as any;
export type DeleteQuestionnaireTemplateMutation = any;
export type DeleteQuestionnaireTemplateMutationVariables = any;
export type deleteQuestionnaireTemplateMutation = any;
export type deleteQuestionnaireTemplateMutationVariables = any;

export const GetQuestionnaireTemplateByIdDocument = parse(`query getQuestionnaireTemplateById(\$Id: uuid!) {
  questionnaire_template: questionnaire_template_by_pk(Id: \$Id) {
    ...QuestionnaireTemplateParts
    owners {
      ...OwnerParts
    }
    contributors {
      ...ContributorParts
    }
    ownerGroups {
      ...OwnerGroupParts
    }
    contributorGroups {
      ...ContributorGroupParts
    }
    ancestorContributors {
      ...AncestorContributorParts
    }
    tags {
      ...TagParts
    }
    departments {
      ...DepartmentParts
    }
    draftVersions: versions(
      where: { Status: { _eq: draft } }
      order_by: { CreatedAtTimestamp: desc }
      limit: 1
    ) {
      Id
      Version
      Status
    }
    nonDraftVersions: versions(
      where: { Status: { _neq: draft } }
      order_by: { CreatedAtTimestamp: desc }
      limit: 1
    ) {
      Id
      Version
      Status
    }
    publishedVersion: versions(
      where: { Status: { _eq: published } }
      order_by: { CreatedAtTimestamp: desc }
      limit: 1
    ) {
      Id
      Version
      Status
    }
  }
}

fragment QuestionnaireTemplateParts on questionnaire_template {
  Id
  Title
  Description
  CreatedByUser
  ModifiedByUser
  CreatedAtTimestamp
  ModifiedAtTimestamp
  CustomAttributeData
}

fragment OwnerParts on owner {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment ContributorParts on contributor {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment OwnerGroupParts on owner_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment ContributorGroupParts on contributor_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment AncestorContributorParts on ancestor_contributor {
  ContributorType
  UserId
  Id
  AncestorId
  UserGroupId
  user {
    FriendlyName
  }
  user_group {
    Name
  }
}

fragment TagParts on tag {
  type {
    Description
    Name
  }
  ParentId
  TagTypeId
}

fragment DepartmentParts on department {
  type {
    Description
    Name
  }
  ParentId
  DepartmentTypeId
}`) as any;
export type GetQuestionnaireTemplateByIdQuery = any;
export type GetQuestionnaireTemplateByIdQueryVariables = any;
export type GetGetQuestionnaireTemplateByIdQuery = any;
export type getQuestionnaireTemplateByIdQuery = any;
export type getQuestionnaireTemplateByIdQueryVariables = any;

export const GetQuestionnaireTemplatesDocument = parse(`query getQuestionnaireTemplates(\$where: questionnaire_template_bool_exp) {
  questionnaire_template(where: \$where) {
    ...QuestionnaireTemplateParts
    owners {
      ...OwnerParts
    }
    contributors {
      ...ContributorParts
    }
    ownerGroups {
      ...OwnerGroupParts
    }
    contributorGroups {
      ...ContributorGroupParts
    }
    ancestorContributors {
      ...AncestorContributorParts
    }
    tags {
      ...TagParts
    }
    departments {
      ...DepartmentParts
    }
    createdByUser {
      Id
      FriendlyName
    }
    modifiedByUser {
      Id
      FriendlyName
    }
    draftVersions: versions(
      where: { Status: { _eq: draft } }
      order_by: { CreatedAtTimestamp: desc }
      limit: 1
    ) {
      Id
      Version
      Status
    }
    nonDraftVersions: versions(
      where: { Status: { _neq: draft } }
      order_by: { CreatedAtTimestamp: desc }
      limit: 1
    ) {
      Id
      Version
      Status
    }
    publishedVersion: versions(
      where: { Status: { _eq: published } }
      order_by: { CreatedAtTimestamp: desc }
      limit: 1
    ) {
      Id
      Version
      Status
    }
  }
}

fragment QuestionnaireTemplateParts on questionnaire_template {
  Id
  Title
  Description
  CreatedByUser
  ModifiedByUser
  CreatedAtTimestamp
  ModifiedAtTimestamp
  CustomAttributeData
}

fragment OwnerParts on owner {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment ContributorParts on contributor {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment OwnerGroupParts on owner_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment ContributorGroupParts on contributor_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment AncestorContributorParts on ancestor_contributor {
  ContributorType
  UserId
  Id
  AncestorId
  UserGroupId
  user {
    FriendlyName
  }
  user_group {
    Name
  }
}

fragment TagParts on tag {
  type {
    Description
    Name
  }
  ParentId
  TagTypeId
}

fragment DepartmentParts on department {
  type {
    Description
    Name
  }
  ParentId
  DepartmentTypeId
}`) as any;
export type GetQuestionnaireTemplatesQuery = any;
export type GetQuestionnaireTemplatesQueryVariables = any;
export type GetGetQuestionnaireTemplatesQuery = any;
export type getQuestionnaireTemplatesQuery = any;
export type getQuestionnaireTemplatesQueryVariables = any;

export const InsertQuestionnaireTemplateDocument = parse(`mutation insertQuestionnaireTemplate(
  \$object: InsertQuestionnaireTemplateInput
) {
  insertQuestionnaireTemplateApi(object: \$object) {
    Id
  }
}`) as any;
export type InsertQuestionnaireTemplateMutation = any;
export type InsertQuestionnaireTemplateMutationVariables = any;
export type insertQuestionnaireTemplateMutation = any;
export type insertQuestionnaireTemplateMutationVariables = any;

export const QuestionnaireTemplatePartsDocument = parse(`fragment QuestionnaireTemplateParts on questionnaire_template {
  Id
  Title
  Description
  CreatedByUser
  ModifiedByUser
  CreatedAtTimestamp
  ModifiedAtTimestamp
  CustomAttributeData
}`) as any;
export type QuestionnaireTemplatePartsFragment = any;

export const UpdateQuestionnaireTemplateDocument = parse(`mutation updateQuestionnaireTemplate(
  \$object: UpdateQuestionnaireTemplateInput
) {
  updateQuestionnaireTemplateApi(object: \$object) {
    Id
  }
}`) as any;
export type UpdateQuestionnaireTemplateMutation = any;
export type UpdateQuestionnaireTemplateMutationVariables = any;
export type updateQuestionnaireTemplateMutation = any;
export type updateQuestionnaireTemplateMutationVariables = any;

export const RelationFilePartsDocument = parse(`fragment RelationFileParts on relation_file {
  ParentId
  ChangeRequestFileOperation
  file {
    ...FileParts
  }
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}`) as any;
export type RelationFilePartsFragment = any;

export const GetReportingDataDocument = parse(`query getReportingData(\$Input: ReportingDataInput!) {
  reportingData(Input: \$Input) {
    value
    meta
  }
}`) as any;
export type GetReportingDataQuery = any;
export type GetReportingDataQueryVariables = any;
export type GetGetReportingDataQuery = any;
export type getReportingDataQuery = any;
export type getReportingDataQueryVariables = any;

export const GetReportingFilterOptionsDocument = parse(`query getReportingFilterOptions(\$Input: ReportingFilterOptionsInput!) {
  reportingFilterOptions(Input: \$Input) {
    value
  }
}`) as any;
export type GetReportingFilterOptionsQuery = any;
export type GetReportingFilterOptionsQueryVariables = any;
export type GetGetReportingFilterOptionsQuery = any;
export type getReportingFilterOptionsQuery = any;
export type getReportingFilterOptionsQueryVariables = any;

export const DeleteRiskDocument = parse(`mutation deleteRisk(\$id: uuid!) {
  deleteRiskById(Id: \$id) {
    affected_rows
  }
}`) as any;
export type DeleteRiskMutation = any;
export type DeleteRiskMutationVariables = any;
export type deleteRiskMutation = any;
export type deleteRiskMutationVariables = any;

export const EnterpriseRiskInstanceWithEntityHierarchyPartsDocument = parse(`fragment EnterpriseRiskInstanceWithEntityHierarchyParts on enterprise_risk_instance {
  EntityId
  EnterpriseRiskId
  entity {
    Id
    Name
    ParentId
  }
}`) as any;
export type EnterpriseRiskInstanceWithEntityHierarchyPartsFragment = any;

export const GetRiskAuditByIdDocument = parse(`query getRiskAuditById(\$Id: uuid) {
  risk_audit(where: { Id: { _eq: \$Id } }) {
    Id
    Title
    Tier
    Description
    ParentRiskId
    CreatedByUser
    Treatment
    Status
    ModifiedByUser
    CreatedAtTimestamp
    ModifiedAtTimestamp
    CustomAttributeData
    SequentialId
  }
}`) as any;
export type GetRiskAuditByIdQuery = any;
export type GetRiskAuditByIdQueryVariables = any;
export type GetGetRiskAuditByIdQuery = any;
export type getRiskAuditByIdQuery = any;
export type getRiskAuditByIdQueryVariables = any;

export const GetRiskByIdDocument = parse(`query getRiskById(\$_eq: uuid) {
  risk(where: { Id: { _eq: \$_eq } }) {
    ...RiskParts
    scheduleState {
      LatestDate
    }
    parent {
      Id
      Title
    }
    parentNode {
      Id
      ObjectType
      SequentialId
    }
    assessmentResults(
      where: {
        riskAssessmentResult: { RatingType: { _in: ["assessment", "rating"] } }
      }
    ) {
      riskAssessmentResult {
        ControlType
        Rating
      }
    }
    tags {
      ...TagParts
    }
    departments {
      ...DepartmentParts
    }
    owners {
      ...OwnerParts
    }
    contributors {
      ...ContributorParts
    }
    ownerGroups {
      ...OwnerGroupParts
    }
    contributorGroups {
      UserGroupId
      group {
        Name
        users {
          UserId
        }
      }
    }
    ancestorContributors {
      ...AncestorContributorParts
    }
    enterpriseRiskInstance {
      EnterpriseRiskId
      EntityId
    }
  }
}

fragment RiskParts on risk {
  Id
  Title
  Tier
  Description
  ParentRiskId
  CreatedByUser
  Treatment
  Status
  ModifiedByUser
  CreatedAtTimestamp
  ModifiedAtTimestamp
  CustomAttributeData
  SequentialId
  schedule {
    ...ScheduleParts
  }
}

fragment ScheduleParts on schedule {
  Id
  Frequency
  ManualDueDate
  StartDate
  TimeToCompleteValue
  TimeToCompleteUnit
}

fragment TagParts on tag {
  type {
    Description
    Name
  }
  ParentId
  TagTypeId
}

fragment DepartmentParts on department {
  type {
    Description
    Name
  }
  ParentId
  DepartmentTypeId
}

fragment OwnerParts on owner {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment ContributorParts on contributor {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment OwnerGroupParts on owner_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment AncestorContributorParts on ancestor_contributor {
  ContributorType
  UserId
  Id
  AncestorId
  UserGroupId
  user {
    FriendlyName
  }
  user_group {
    Name
  }
}`) as any;
export type GetRiskByIdQuery = any;
export type GetRiskByIdQueryVariables = any;
export type GetGetRiskByIdQuery = any;
export type getRiskByIdQuery = any;
export type getRiskByIdQueryVariables = any;

export const GetRiskListDocument = parse(`query getRiskList {
  # Note: Query is must faster for standard users when risks are queried separately to nodes
  risk {
    Id
    Title
    SequentialId
  }
  # Get risks nodes so we have IDs for even controls we don't have access to
  node(where: { ObjectType: { _eq: risk } }) {
    Id
    SequentialId
  }
}`) as any;
export type GetRiskListQuery = any;
export type GetRiskListQueryVariables = any;
export type GetGetRiskListQuery = any;
export type getRiskListQuery = any;
export type getRiskListQueryVariables = any;

export const GetRiskListOnlyOptimizedDocument = parse(`query getRiskListOnlyOptimized {
  risk {
    Id
    Title
    SequentialId
  }
}`) as any;
export type GetRiskListOnlyOptimizedQuery = any;
export type GetRiskListOnlyOptimizedQueryVariables = any;
export type GetGetRiskListOnlyOptimizedQuery = any;
export type getRiskListOnlyOptimizedQuery = any;
export type getRiskListOnlyOptimizedQueryVariables = any;

export const GetRiskListOnlyWithEntitiesOptimizedDocument = parse(`query getRiskListOnlyWithEntitiesOptimized {
  risk {
    Id
    Title
    SequentialId
    enterpriseRiskInstance {
      ...EnterpriseRiskInstanceWithEntityHierarchyParts
    }
  }
}

fragment EnterpriseRiskInstanceWithEntityHierarchyParts on enterprise_risk_instance {
  EntityId
  EnterpriseRiskId
  entity {
    Id
    Name
    ParentId
  }
}`) as any;
export type GetRiskListOnlyWithEntitiesOptimizedQuery = any;
export type GetRiskListOnlyWithEntitiesOptimizedQueryVariables = any;
export type GetGetRiskListOnlyWithEntitiesOptimizedQuery = any;
export type getRiskListOnlyWithEntitiesOptimizedQuery = any;
export type getRiskListOnlyWithEntitiesOptimizedQueryVariables = any;

export const GetRiskListOptimizedDocument = parse(`query getRiskListOptimized {
  # Note: Query is much faster for standard users when risks are queried separately to nodes
  risk {
    Id
    Title
    SequentialId
  }
  # Get risks nodes so we have IDs for even controls we don't have access to
  node(where: { ObjectType: { _eq: risk } }) {
    Id
    SequentialId
  }
}`) as any;
export type GetRiskListOptimizedQuery = any;
export type GetRiskListOptimizedQueryVariables = any;
export type GetGetRiskListOptimizedQuery = any;
export type getRiskListOptimizedQuery = any;
export type getRiskListOptimizedQueryVariables = any;

export const GetRiskListWithEntitiesDocument = parse(`query getRiskListWithEntities {
  # Enhanced risk query including entity information for multi-entity support
  risk {
    Id
    Title
    SequentialId
    enterpriseRiskInstance {
      ...EnterpriseRiskInstanceWithEntityHierarchyParts
    }
  }
  # Get risks nodes so we have IDs for even controls we don't have access to
  node(where: { ObjectType: { _eq: risk } }) {
    Id
    SequentialId
  }
}

fragment EnterpriseRiskInstanceWithEntityHierarchyParts on enterprise_risk_instance {
  EntityId
  EnterpriseRiskId
  entity {
    Id
    Name
    ParentId
  }
}`) as any;
export type GetRiskListWithEntitiesQuery = any;
export type GetRiskListWithEntitiesQueryVariables = any;
export type GetGetRiskListWithEntitiesQuery = any;
export type getRiskListWithEntitiesQuery = any;
export type getRiskListWithEntitiesQueryVariables = any;

export const GetRiskWithOwnContributionsDocument = parse(`query getRiskWithOwnContributions(\$currentUserId: String!) {
  risk {
    Id
    SequentialId
    Title
    ancestorContributors(where: { UserId: { _eq: \$currentUserId } }) {
      ...AncestorContributorParts
    }
  }
}

fragment AncestorContributorParts on ancestor_contributor {
  ContributorType
  UserId
  Id
  AncestorId
  UserGroupId
  user {
    FriendlyName
  }
  user_group {
    Name
  }
}`) as any;
export type GetRiskWithOwnContributionsQuery = any;
export type GetRiskWithOwnContributionsQueryVariables = any;
export type GetGetRiskWithOwnContributionsQuery = any;
export type getRiskWithOwnContributionsQuery = any;
export type getRiskWithOwnContributionsQueryVariables = any;

export const GetRisksByTierDocument = parse(`query getRisksByTier(\$where: risk_bool_exp!) {
  risk(where: \$where, order_by: { Title: asc }) {
    Id
    Title
    SequentialId
    enterpriseRiskInstance {
      EnterpriseRiskId
      EntityId
      entity {
        Id
        Name
      }
    }
  }
}`) as any;
export type GetRisksByTierQuery = any;
export type GetRisksByTierQueryVariables = any;
export type GetGetRisksByTierQuery = any;
export type getRisksByTierQuery = any;
export type getRisksByTierQueryVariables = any;

export const GetRisksFlatDocument = parse(`query getRisksFlat(
  \$where: risk_bool_exp! = {}
  \$riskAssessmentResultsWhere: risk_assessment_result_bool_exp! = {}
) {
  risk(where: \$where) {
    ...RiskParts
    scheduleState {
      LatestDate
      DueDate
      OverdueDate
    }
    createdByUser {
      FriendlyName
    }
    parent {
      Title
    }
    parentNode {
      Id
      ObjectType
      SequentialId
    }
    owners {
      ...OwnerParts
    }
    ownerGroups {
      ...OwnerGroupParts
    }
    contributors {
      ...ContributorParts
    }
    contributorGroups {
      ...ContributorGroupParts
    }
    appetites(
      limit: 1
      where: { appetite: { AppetiteType: { _eq: risk } } }
      order_by: [
        { appetite: { EffectiveDate: desc_nulls_last } }
        { appetite: { CreatedAtTimestamp: desc_nulls_last } }
      ]
    ) {
      appetite {
        LowerAppetite
        UpperAppetite
      }
    }
    impactRatings(
      where: { RatingType: { _in: ["assessment", "rating"] } }
      distinct_on: [ImpactId]
      order_by: [{ ImpactId: desc }, { TestDate: desc }]
    ) {
      ImpactId
      Rating
    }
    impactRatingsForTrend: impactRatings(
      where: { RatingType: { _in: ["assessment", "rating"] } }
      order_by: [{ TestDate: desc }, { CreatedAtTimestamp: desc }]
      limit: 10
    ) {
      ImpactId
      Rating
      TestDate
    }
    assessmentResults(
      where: {
        riskAssessmentResult: {
          _and: [
            { RatingType: { _in: ["assessment", "rating"] } }
            \$riskAssessmentResultsWhere
          ]
        }
      }
      order_by: [
        { riskAssessmentResult: { TestDate: desc_nulls_last } }
        { riskAssessmentResult: { CreatedAtTimestamp: desc_nulls_last } }
      ]
    ) {
      ParentId
      riskAssessmentResult {
        Id
        Rating
        ControlType
        Likelihood
        Impact
        CustomAttributeData
        CreatedAtTimestamp
        TestDate
      }
    }
    controls_aggregate {
      aggregate {
        count
      }
    }
    indicators_aggregate {
      aggregate {
        count
      }
    }
    actions_aggregate {
      aggregate {
        count
      }
    }
    tags {
      ...TagParts
    }
    departments {
      ...DepartmentParts
    }
    enterpriseRiskInstance {
      entity {
        Id
        Name
      }
      enterpriseRisk {
        Id
        Title
      }
    }
  }
}

fragment RiskParts on risk {
  Id
  Title
  Tier
  Description
  ParentRiskId
  CreatedByUser
  Treatment
  Status
  ModifiedByUser
  CreatedAtTimestamp
  ModifiedAtTimestamp
  CustomAttributeData
  SequentialId
  schedule {
    ...ScheduleParts
  }
}

fragment ScheduleParts on schedule {
  Id
  Frequency
  ManualDueDate
  StartDate
  TimeToCompleteValue
  TimeToCompleteUnit
}

fragment OwnerParts on owner {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment OwnerGroupParts on owner_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment ContributorParts on contributor {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment ContributorGroupParts on contributor_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment TagParts on tag {
  type {
    Description
    Name
  }
  ParentId
  TagTypeId
}

fragment DepartmentParts on department {
  type {
    Description
    Name
  }
  ParentId
  DepartmentTypeId
}`) as any;
export type GetRisksFlatQuery = any;
export type GetRisksFlatQueryVariables = any;
export type GetGetRisksFlatQuery = any;
export type getRisksFlatQuery = any;
export type getRisksFlatQueryVariables = any;

export const GetRisksWithAncestorContributorsDocument = parse(`query getRisksWithAncestorContributors {
  risk {
    ...RiskParts
    ancestorContributors {
      ...AncestorContributorParts
    }
  }
}

fragment RiskParts on risk {
  Id
  Title
  Tier
  Description
  ParentRiskId
  CreatedByUser
  Treatment
  Status
  ModifiedByUser
  CreatedAtTimestamp
  ModifiedAtTimestamp
  CustomAttributeData
  SequentialId
  schedule {
    ...ScheduleParts
  }
}

fragment ScheduleParts on schedule {
  Id
  Frequency
  ManualDueDate
  StartDate
  TimeToCompleteValue
  TimeToCompleteUnit
}

fragment AncestorContributorParts on ancestor_contributor {
  ContributorType
  UserId
  Id
  AncestorId
  UserGroupId
  user {
    FriendlyName
  }
  user_group {
    Name
  }
}`) as any;
export type GetRisksWithAncestorContributorsQuery = any;
export type GetRisksWithAncestorContributorsQueryVariables = any;
export type GetGetRisksWithAncestorContributorsQuery = any;
export type getRisksWithAncestorContributorsQuery = any;
export type getRisksWithAncestorContributorsQueryVariables = any;

export const GetRisksWithAncestorContributorsAndEntitiesDocument = parse(`query getRisksWithAncestorContributorsAndEntities {
  risk {
    ...RiskParts
    enterpriseRiskInstance {
      ...EnterpriseRiskInstanceWithEntityHierarchyParts
    }
    ancestorContributors {
      ...AncestorContributorParts
    }
  }
}

fragment RiskParts on risk {
  Id
  Title
  Tier
  Description
  ParentRiskId
  CreatedByUser
  Treatment
  Status
  ModifiedByUser
  CreatedAtTimestamp
  ModifiedAtTimestamp
  CustomAttributeData
  SequentialId
  schedule {
    ...ScheduleParts
  }
}

fragment ScheduleParts on schedule {
  Id
  Frequency
  ManualDueDate
  StartDate
  TimeToCompleteValue
  TimeToCompleteUnit
}

fragment EnterpriseRiskInstanceWithEntityHierarchyParts on enterprise_risk_instance {
  EntityId
  EnterpriseRiskId
  entity {
    Id
    Name
    ParentId
  }
}

fragment AncestorContributorParts on ancestor_contributor {
  ContributorType
  UserId
  Id
  AncestorId
  UserGroupId
  user {
    FriendlyName
  }
  user_group {
    Name
  }
}`) as any;
export type GetRisksWithAncestorContributorsAndEntitiesQuery = any;
export type GetRisksWithAncestorContributorsAndEntitiesQueryVariables = any;
export type GetGetRisksWithAncestorContributorsAndEntitiesQuery = any;
export type getRisksWithAncestorContributorsAndEntitiesQuery = any;
export type getRisksWithAncestorContributorsAndEntitiesQueryVariables = any;

export const InsertRiskDocument = parse(`mutation insertRisk(\$object: InsertChildRiskInput) {
  insertChildRisk(object: \$object) {
    Id
  }
}`) as any;
export type InsertRiskMutation = any;
export type InsertRiskMutationVariables = any;
export type insertRiskMutation = any;
export type insertRiskMutationVariables = any;

export const RiskPartsDocument = parse(`fragment RiskParts on risk {
  Id
  Title
  Tier
  Description
  ParentRiskId
  CreatedByUser
  Treatment
  Status
  ModifiedByUser
  CreatedAtTimestamp
  ModifiedAtTimestamp
  CustomAttributeData
  SequentialId
  schedule {
    ...ScheduleParts
  }
}

fragment ScheduleParts on schedule {
  Id
  Frequency
  ManualDueDate
  StartDate
  TimeToCompleteValue
  TimeToCompleteUnit
}`) as any;
export type RiskPartsFragment = any;

export const UpdateRiskDocument = parse(`mutation updateRisk(\$object: UpdateChildRiskInput) {
  updateChildRisk(object: \$object) {
    Id
  }
}`) as any;
export type UpdateRiskMutation = any;
export type UpdateRiskMutationVariables = any;
export type updateRiskMutation = any;
export type updateRiskMutationVariables = any;

export const GetLatestRiskAssessmentResultConfigDocument = parse(`query getLatestRiskAssessmentResultConfig {
  risk_assessment_result_config(where: { IsLatest: { _eq: true } }, limit: 1) {
    Id
    Version
    Config
    IsLatest
    ModifiedAtTimestamp
  }
}`) as any;
export type GetLatestRiskAssessmentResultConfigQuery = any;
export type GetLatestRiskAssessmentResultConfigQueryVariables = any;
export type GetGetLatestRiskAssessmentResultConfigQuery = any;
export type getLatestRiskAssessmentResultConfigQuery = any;
export type getLatestRiskAssessmentResultConfigQueryVariables = any;

export const GetRiskAssessmentResultConfigAuditByIdDocument = parse(`query getRiskAssessmentResultConfigAuditById(\$id: uuid!) {
  risk_assessment_result_config_audit(where: { Id: { _eq: \$id } }) {
    Id
    Version
    Config
    IsLatest
    CreatedByUser
    CreatedAtTimestamp
    ModifiedByUser
    ModifiedAtTimestamp
  }
}`) as any;
export type GetRiskAssessmentResultConfigAuditByIdQuery = any;
export type GetRiskAssessmentResultConfigAuditByIdQueryVariables = any;
export type GetGetRiskAssessmentResultConfigAuditByIdQuery = any;
export type getRiskAssessmentResultConfigAuditByIdQuery = any;
export type getRiskAssessmentResultConfigAuditByIdQueryVariables = any;

export const GetRiskAssessmentResultConfigByVersionsDocument = parse(`query getRiskAssessmentResultConfigByVersions(\$versions: [Int!]!) {
  risk_assessment_result_config(where: { Version: { _in: \$versions } }) {
    Id
    Version
    Config
    IsLatest
  }
}`) as any;
export type GetRiskAssessmentResultConfigByVersionsQuery = any;
export type GetRiskAssessmentResultConfigByVersionsQueryVariables = any;
export type GetGetRiskAssessmentResultConfigByVersionsQuery = any;
export type getRiskAssessmentResultConfigByVersionsQuery = any;
export type getRiskAssessmentResultConfigByVersionsQueryVariables = any;

export const InsertRiskAssessmentResultConfigDocument = parse(`mutation InsertRiskAssessmentResultConfig(\$Config: jsonb!) {
  insertRiskAssessmentResultConfigApi(Config: \$Config) {
    Id
    Version
    IsLatest
  }
}`) as any;
export type InsertRiskAssessmentResultConfigMutation = any;
export type InsertRiskAssessmentResultConfigMutationVariables = any;

export const UpdateRiskAssessmentResultConfigDocument = parse(`mutation UpdateRiskAssessmentResultConfig(
  \$Id: uuid!
  \$Config: jsonb!
  \$OriginalTimestamp: timestamptz!
) {
  updateRiskAssessmentResultConfigApi(
    Id: \$Id
    Config: \$Config
    OriginalTimestamp: \$OriginalTimestamp
  ) {
    Id
    Version
    IsLatest
  }
}`) as any;
export type UpdateRiskAssessmentResultConfigMutation = any;
export type UpdateRiskAssessmentResultConfigMutationVariables = any;

export const GetRiskAssessmentResultImpactAuditByIdDocument = parse(`query getRiskAssessmentResultImpactAuditById(\$id: uuid!) {
  risk_assessment_result_impact_audit(where: { Id: { _eq: \$id } }) {
    Id
    RiskAssessmentResultId
    Label
    Value
    CreatedByUser
    CreatedAtTimestamp
    ModifiedByUser
    ModifiedAtTimestamp
  }
}`) as any;
export type GetRiskAssessmentResultImpactAuditByIdQuery = any;
export type GetRiskAssessmentResultImpactAuditByIdQueryVariables = any;
export type GetGetRiskAssessmentResultImpactAuditByIdQuery = any;
export type getRiskAssessmentResultImpactAuditByIdQuery = any;
export type getRiskAssessmentResultImpactAuditByIdQueryVariables = any;

export const GetRoleAccessDocument = parse(`query getRoleAccess {
  role_access {
    AccessType
    ContributorType
    ObjectType
  }
}`) as any;
export type GetRoleAccessQuery = any;
export type GetRoleAccessQueryVariables = any;
export type GetGetRoleAccessQuery = any;
export type getRoleAccessQuery = any;
export type getRoleAccessQueryVariables = any;

export const GetAvailableRolesDocument = parse(`query GetAvailableRoles {
  available_roles {
    id
    name
    description
  }
}`) as any;
export type GetAvailableRolesQuery = any;
export type GetAvailableRolesQueryVariables = any;
export type GetGetAvailableRolesQuery = any;

export const GetDefaultRolesDocument = parse(`query getDefaultRoles {
  auth_role_type {
    RoleKey
    Description
    Name
    Category
    resourceTypes {
      resourceType {
        ResourceType
      }
    }
  }
}`) as any;
export type GetDefaultRolesQuery = any;
export type GetDefaultRolesQueryVariables = any;
export type GetGetDefaultRolesQuery = any;
export type getDefaultRolesQuery = any;
export type getDefaultRolesQueryVariables = any;

export const SchedulePartsDocument = parse(`fragment ScheduleParts on schedule {
  Id
  Frequency
  ManualDueDate
  StartDate
  TimeToCompleteValue
  TimeToCompleteUnit
}`) as any;
export type SchedulePartsFragment = any;

export const DeleteScimDomainDocument = parse(`mutation deleteScimDomain(\$domain: String!) {
  delete_scim_domain(domain: \$domain) {
    updatedDomains {
      domain
      createdOn
    }
  }
}`) as any;
export type DeleteScimDomainMutation = any;
export type DeleteScimDomainMutationVariables = any;
export type deleteScimDomainMutation = any;
export type deleteScimDomainMutationVariables = any;

export const DeleteScimTokenDocument = parse(`mutation deleteScimToken(\$keyId: String!) {
  delete_scim_token(keyId: \$keyId) {
    keyId
  }
}`) as any;
export type DeleteScimTokenMutation = any;
export type DeleteScimTokenMutationVariables = any;
export type deleteScimTokenMutation = any;
export type deleteScimTokenMutationVariables = any;

export const GetScimConfigDocument = parse(`query getScimConfig {
  getScimConfig {
    domains {
      domain
      createdOn
    }
    tokens {
      keyId
      orgKey
      token
      createdOn
      expiresOn
      status
    }
    legacyTokens
  }
}`) as any;
export type GetScimConfigQuery = any;
export type GetScimConfigQueryVariables = any;
export type GetGetScimConfigQuery = any;
export type getScimConfigQuery = any;
export type getScimConfigQueryVariables = any;

export const InsertScimDomainDocument = parse(`mutation insertScimDomain(\$domain: String!) {
  insert_scim_domain(domain: \$domain) {
    domain
    createdOn
  }
}`) as any;
export type InsertScimDomainMutation = any;
export type InsertScimDomainMutationVariables = any;
export type insertScimDomainMutation = any;
export type insertScimDomainMutationVariables = any;

export const InsertScimTokenDocument = parse(`mutation insertScimToken(\$expireInMonths: String!) {
  insert_scim_token(expireInMonths: \$expireInMonths) {
    keyId
    orgKey
    token
    createdOn
    expiresOn
    status
  }
}`) as any;
export type InsertScimTokenMutation = any;
export type InsertScimTokenMutationVariables = any;
export type insertScimTokenMutation = any;
export type insertScimTokenMutationVariables = any;

export const DeleteSecondLineResultsDocument = parse(`mutation deleteSecondLineResults(\$Ids: [uuid!]!) {
  delete_document_second_line_result(where: { Id: { _in: \$Ids } }) {
    affected_rows
  }

  delete_obligation_second_line_result(where: { Id: { _in: \$Ids } }) {
    affected_rows
  }

  delete_risk_controlled_second_line_result(where: { Id: { _in: \$Ids } }) {
    affected_rows
  }

  delete_risk_uncontrolled_second_line_result(where: { Id: { _in: \$Ids } }) {
    affected_rows
  }

  delete_control_test_second_line_result(where: { Id: { _in: \$Ids } }) {
    affected_rows
  }

  delete_control_test_second_line_result(where: { Id: { _in: \$Ids } }) {
    affected_rows
  }

  delete_impact_second_line_rating(where: { Id: { _in: \$Ids } }) {
    affected_rows
  }
}`) as any;
export type DeleteSecondLineResultsMutation = any;
export type DeleteSecondLineResultsMutationVariables = any;
export type deleteSecondLineResultsMutation = any;
export type deleteSecondLineResultsMutationVariables = any;

export const GetAllComplianceMonitoringAssessmentResultsDocument = parse(`query getAllComplianceMonitoringAssessmentResults {
  document_second_line_result(order_by: { CreatedByUser: asc }) {
    ...DocumentSecondLineResultParts
    complianceMonitoringAssessments: parents(
      where: { ParentType: { _eq: compliance_monitoring_assessment } }
    ) {
      complianceMonitoringAssessment {
        Id
        Title
        ActualCompletionDate
        StartDate
        Status
        completedByUser {
          FriendlyName
        }
      }
    }
    documents: parents(where: { ParentType: { _eq: document } }) {
      document {
        Id
        Title
      }
      node {
        Id
        SequentialId
        ObjectType
      }
    }
    files {
      ...RelationFileParts
    }
  }

  obligation_second_line_result(order_by: { CreatedByUser: asc }) {
    ...ObligationSecondLineResultParts
    complianceMonitoringAssessments: parents(
      where: { ParentType: { _eq: compliance_monitoring_assessment } }
    ) {
      complianceMonitoringAssessment {
        Id
        Title
        ActualCompletionDate
        StartDate
        Status
        completedByUser {
          FriendlyName
        }
      }
    }
    obligations: parents(where: { ParentType: { _eq: obligation } }) {
      obligation {
        Id
        Title
      }
      node {
        Id
        SequentialId
        ObjectType
      }
    }
    files {
      ...RelationFileParts
    }
  }

  risk_controlled_second_line_result(order_by: { CreatedByUser: asc }) {
    ...RiskControlledSecondLineResultParts
    complianceMonitoringAssessments: parents(
      where: { ParentType: { _eq: compliance_monitoring_assessment } }
    ) {
      complianceMonitoringAssessment {
        Id
        Title
        ActualCompletionDate
        StartDate
        Status
        completedByUser {
          FriendlyName
        }
      }
    }
    risks: parents(where: { ParentType: { _eq: risk } }) {
      risk {
        Id
        Title
      }
      node {
        Id
        SequentialId
        ObjectType
      }
    }
    files {
      ...RelationFileParts
    }
  }

  risk_uncontrolled_second_line_result(order_by: { CreatedByUser: asc }) {
    ...RiskUncontrolledSecondLineResultParts
    complianceMonitoringAssessments: parents(
      where: { ParentType: { _eq: compliance_monitoring_assessment } }
    ) {
      complianceMonitoringAssessment {
        Id
        Title
        ActualCompletionDate
        StartDate
        Status
        completedByUser {
          FriendlyName
        }
      }
    }
    risks: parents(where: { ParentType: { _eq: risk } }) {
      risk {
        Id
        Title
      }
      node {
        Id
        SequentialId
        ObjectType
      }
    }
    files {
      ...RelationFileParts
    }
  }
}

fragment DocumentSecondLineResultParts on document_second_line_result {
  Id
  Rating
  CustomAttributeData
  Rationale
  TestDate
}

fragment RelationFileParts on relation_file {
  ParentId
  ChangeRequestFileOperation
  file {
    ...FileParts
  }
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}

fragment ObligationSecondLineResultParts on obligation_second_line_result {
  Id
  Rating
  CustomAttributeData
  Rationale
  TestDate
}

fragment RiskControlledSecondLineResultParts on risk_controlled_second_line_result {
  Id
  Likelihood
  Impact
  Rating
  CustomAttributeData
  Rationale
  TestDate
}

fragment RiskUncontrolledSecondLineResultParts on risk_uncontrolled_second_line_result {
  Id
  Likelihood
  Impact
  Rating
  CustomAttributeData
  Rationale
  TestDate
}`) as any;
export type GetAllComplianceMonitoringAssessmentResultsQuery = any;
export type GetAllComplianceMonitoringAssessmentResultsQueryVariables = any;
export type GetGetAllComplianceMonitoringAssessmentResultsQuery = any;
export type getAllComplianceMonitoringAssessmentResultsQuery = any;
export type getAllComplianceMonitoringAssessmentResultsQueryVariables = any;

export const GetComplianceMonitoringAssessmentTestResultsByControlIdDocument = parse(`query getComplianceMonitoringAssessmentTestResultsByControlId(
  \$controlId: uuid
) {
  control_test_second_line_result(
    where: { ParentControlId: { _eq: \$controlId } }
  ) {
    ...ControlTestSecondLineResultParts
    submitter {
      FriendlyName
    }
    files {
      ...RelationFileParts
    }
    parents(where: { ParentType: { _eq: compliance_monitoring_assessment } }) {
      complianceMonitoringAssessment {
        ...ComplianceMonitoringAssessmentParts
        completedByUser {
          FriendlyName
        }
      }
    }
  }
}

fragment ControlTestSecondLineResultParts on control_test_second_line_result {
  Description
  DesignEffectiveness
  Id
  OverallEffectiveness
  ParentControlId
  PerformanceEffectiveness
  Submitter
  TestDate
  TestType
  CreatedAtTimestamp
  ModifiedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  CustomAttributeData
  SequentialId
}

fragment RelationFileParts on relation_file {
  ParentId
  ChangeRequestFileOperation
  file {
    ...FileParts
  }
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}

fragment ComplianceMonitoringAssessmentParts on compliance_monitoring_assessment {
  ActualCompletionDate
  CompletedByUser
  CreatedAtTimestamp
  CreatedByUser
  CustomAttributeData
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  NextTestDate
  OriginatingItemId
  SequentialId
  StartDate
  Summary
  TargetCompletionDate
  Title
  Status
  Outcome
}`) as any;
export type GetComplianceMonitoringAssessmentTestResultsByControlIdQuery = any;
export type GetComplianceMonitoringAssessmentTestResultsByControlIdQueryVariables = any;
export type GetGetComplianceMonitoringAssessmentTestResultsByControlIdQuery = any;
export type getComplianceMonitoringAssessmentTestResultsByControlIdQuery = any;
export type getComplianceMonitoringAssessmentTestResultsByControlIdQueryVariables = any;

export const GetComplianceMonitoringAssessmentDocumentAssessmentResultsByDocumentIdDocument = parse(`query getComplianceMonitoringAssessmentDocumentAssessmentResultsByDocumentId(
  \$ParentId: uuid!
) {
  document_second_line_result(
    where: { parents: { ParentId: { _eq: \$ParentId } } }
  ) {
    ...DocumentSecondLineResultParts
    files {
      ...RelationFileParts
    }
    parents(where: { ParentType: { _eq: compliance_monitoring_assessment } }) {
      complianceMonitoringAssessment {
        ...ComplianceMonitoringAssessmentParts
        completedByUser {
          FriendlyName
        }
      }
    }
  }
}

fragment DocumentSecondLineResultParts on document_second_line_result {
  Id
  Rating
  CustomAttributeData
  Rationale
  TestDate
}

fragment RelationFileParts on relation_file {
  ParentId
  ChangeRequestFileOperation
  file {
    ...FileParts
  }
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}

fragment ComplianceMonitoringAssessmentParts on compliance_monitoring_assessment {
  ActualCompletionDate
  CompletedByUser
  CreatedAtTimestamp
  CreatedByUser
  CustomAttributeData
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  NextTestDate
  OriginatingItemId
  SequentialId
  StartDate
  Summary
  TargetCompletionDate
  Title
  Status
  Outcome
}`) as any;
export type GetComplianceMonitoringAssessmentDocumentAssessmentResultsByDocumentIdQuery = any;
export type GetComplianceMonitoringAssessmentDocumentAssessmentResultsByDocumentIdQueryVariables = any;
export type GetGetComplianceMonitoringAssessmentDocumentAssessmentResultsByDocumentIdQuery = any;
export type getComplianceMonitoringAssessmentDocumentAssessmentResultsByDocumentIdQuery = any;
export type getComplianceMonitoringAssessmentDocumentAssessmentResultsByDocumentIdQueryVariables = any;

export const GetComplianceMonitoringAssessmentObligationAssessmentResultsByObligationIdDocument = parse(`query getComplianceMonitoringAssessmentObligationAssessmentResultsByObligationId(
  \$ObligationId: uuid!
) {
  obligation_second_line_result(
    where: { parents: { ParentId: { _eq: \$ObligationId } } }
  ) {
    ...ObligationSecondLineResultParts
    files {
      ...RelationFileParts
    }
    parents(where: { ParentType: { _eq: compliance_monitoring_assessment } }) {
      complianceMonitoringAssessment {
        ...ComplianceMonitoringAssessmentParts
        completedByUser {
          FriendlyName
        }
      }
    }
  }
}

fragment ObligationSecondLineResultParts on obligation_second_line_result {
  Id
  Rating
  CustomAttributeData
  Rationale
  TestDate
}

fragment RelationFileParts on relation_file {
  ParentId
  ChangeRequestFileOperation
  file {
    ...FileParts
  }
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}

fragment ComplianceMonitoringAssessmentParts on compliance_monitoring_assessment {
  ActualCompletionDate
  CompletedByUser
  CreatedAtTimestamp
  CreatedByUser
  CustomAttributeData
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  NextTestDate
  OriginatingItemId
  SequentialId
  StartDate
  Summary
  TargetCompletionDate
  Title
  Status
  Outcome
}`) as any;
export type GetComplianceMonitoringAssessmentObligationAssessmentResultsByObligationIdQuery = any;
export type GetComplianceMonitoringAssessmentObligationAssessmentResultsByObligationIdQueryVariables = any;
export type GetGetComplianceMonitoringAssessmentObligationAssessmentResultsByObligationIdQuery = any;
export type getComplianceMonitoringAssessmentObligationAssessmentResultsByObligationIdQuery = any;
export type getComplianceMonitoringAssessmentObligationAssessmentResultsByObligationIdQueryVariables = any;

export const GetComplianceMonitoringAssessmentRiskAssessmentResultsByRiskIdDocument = parse(`query getComplianceMonitoringAssessmentRiskAssessmentResultsByRiskId(
  \$RiskId: uuid!
) {
  risk_controlled_second_line_result(
    where: { parents: { ParentId: { _eq: \$RiskId } } }
    order_by: [{ CreatedAtTimestamp: desc }]
  ) {
    ...RiskControlledSecondLineResultParts
    parents(where: { ParentType: { _eq: compliance_monitoring_assessment } }) {
      complianceMonitoringAssessment {
        ...ComplianceMonitoringAssessmentParts
        completedByUser {
          FriendlyName
        }
      }
    }
  }

  risk_uncontrolled_second_line_result(
    where: { parents: { ParentId: { _eq: \$RiskId } } }
    order_by: [{ CreatedAtTimestamp: desc }]
  ) {
    ...RiskUncontrolledSecondLineResultParts
    parents(where: { ParentType: { _eq: compliance_monitoring_assessment } }) {
      complianceMonitoringAssessment {
        ...ComplianceMonitoringAssessmentParts
        completedByUser {
          FriendlyName
        }
      }
    }
  }
}

fragment RiskControlledSecondLineResultParts on risk_controlled_second_line_result {
  Id
  Likelihood
  Impact
  Rating
  CustomAttributeData
  Rationale
  TestDate
}

fragment ComplianceMonitoringAssessmentParts on compliance_monitoring_assessment {
  ActualCompletionDate
  CompletedByUser
  CreatedAtTimestamp
  CreatedByUser
  CustomAttributeData
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  NextTestDate
  OriginatingItemId
  SequentialId
  StartDate
  Summary
  TargetCompletionDate
  Title
  Status
  Outcome
}

fragment RiskUncontrolledSecondLineResultParts on risk_uncontrolled_second_line_result {
  Id
  Likelihood
  Impact
  Rating
  CustomAttributeData
  Rationale
  TestDate
}`) as any;
export type GetComplianceMonitoringAssessmentRiskAssessmentResultsByRiskIdQuery = any;
export type GetComplianceMonitoringAssessmentRiskAssessmentResultsByRiskIdQueryVariables = any;
export type GetGetComplianceMonitoringAssessmentRiskAssessmentResultsByRiskIdQuery = any;
export type getComplianceMonitoringAssessmentRiskAssessmentResultsByRiskIdQuery = any;
export type getComplianceMonitoringAssessmentRiskAssessmentResultsByRiskIdQueryVariables = any;

export const GetDocumentSecondLineResultByIdDocument = parse(`query getDocumentSecondLineResultById(\$Id: uuid!) {
  document_second_line_result(where: { Id: { _eq: \$Id } }) {
    ...DocumentSecondLineResultParts
    parents {
      document {
        Id
        Title
      }
      complianceMonitoringAssessment {
        Id
        Title
      }
    }
    files {
      ...RelationFileParts
    }
  }
}

fragment DocumentSecondLineResultParts on document_second_line_result {
  Id
  Rating
  CustomAttributeData
  Rationale
  TestDate
}

fragment RelationFileParts on relation_file {
  ParentId
  ChangeRequestFileOperation
  file {
    ...FileParts
  }
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}`) as any;
export type GetDocumentSecondLineResultByIdQuery = any;
export type GetDocumentSecondLineResultByIdQueryVariables = any;
export type GetGetDocumentSecondLineResultByIdQuery = any;
export type getDocumentSecondLineResultByIdQuery = any;
export type getDocumentSecondLineResultByIdQueryVariables = any;

export const GetLatestComplianceMonitoringAssessmentDocumentAssessmentResultByDocumentIdDocument = parse(`query getLatestComplianceMonitoringAssessmentDocumentAssessmentResultByDocumentId(
  \$DocumentId: uuid!
) {
  document_second_line_result(
    where: { parents: { ParentId: { _eq: \$DocumentId } } }
    order_by: [{ TestDate: desc_nulls_last }, { CreatedAtTimestamp: desc }]
    limit: 1
  ) {
    ...DocumentSecondLineResultParts
    ancestorContributors {
      ...AncestorContributorParts
    }
    parents(where: { ParentType: { _eq: compliance_monitoring_assessment } }) {
      complianceMonitoringAssessment {
        ...ComplianceMonitoringAssessmentParts
        completedByUser {
          FriendlyName
        }
      }
    }
  }
}

fragment DocumentSecondLineResultParts on document_second_line_result {
  Id
  Rating
  CustomAttributeData
  Rationale
  TestDate
}

fragment AncestorContributorParts on ancestor_contributor {
  ContributorType
  UserId
  Id
  AncestorId
  UserGroupId
  user {
    FriendlyName
  }
  user_group {
    Name
  }
}

fragment ComplianceMonitoringAssessmentParts on compliance_monitoring_assessment {
  ActualCompletionDate
  CompletedByUser
  CreatedAtTimestamp
  CreatedByUser
  CustomAttributeData
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  NextTestDate
  OriginatingItemId
  SequentialId
  StartDate
  Summary
  TargetCompletionDate
  Title
  Status
  Outcome
}`) as any;
export type GetLatestComplianceMonitoringAssessmentDocumentAssessmentResultByDocumentIdQuery = any;
export type GetLatestComplianceMonitoringAssessmentDocumentAssessmentResultByDocumentIdQueryVariables = any;
export type GetGetLatestComplianceMonitoringAssessmentDocumentAssessmentResultByDocumentIdQuery = any;
export type getLatestComplianceMonitoringAssessmentDocumentAssessmentResultByDocumentIdQuery = any;
export type getLatestComplianceMonitoringAssessmentDocumentAssessmentResultByDocumentIdQueryVariables = any;

export const GetLatestComplianceMonitoringAssessmentObligationAssessmentResultByObligationIdDocument = parse(`query getLatestComplianceMonitoringAssessmentObligationAssessmentResultByObligationId(
  \$ObligationId: uuid!
) {
  obligation_second_line_result(
    where: { parents: { ParentId: { _eq: \$ObligationId } } }
    order_by: [
      { TestDate: desc_nulls_last }
      { CreatedAtTimestamp: desc_nulls_last }
    ]
    limit: 1
  ) {
    ...ObligationSecondLineResultParts
    ancestorContributors {
      ...AncestorContributorParts
    }
    parents(where: { ParentType: { _eq: compliance_monitoring_assessment } }) {
      complianceMonitoringAssessment {
        ...ComplianceMonitoringAssessmentParts
        completedByUser {
          FriendlyName
        }
      }
    }
  }
}

fragment ObligationSecondLineResultParts on obligation_second_line_result {
  Id
  Rating
  CustomAttributeData
  Rationale
  TestDate
}

fragment AncestorContributorParts on ancestor_contributor {
  ContributorType
  UserId
  Id
  AncestorId
  UserGroupId
  user {
    FriendlyName
  }
  user_group {
    Name
  }
}

fragment ComplianceMonitoringAssessmentParts on compliance_monitoring_assessment {
  ActualCompletionDate
  CompletedByUser
  CreatedAtTimestamp
  CreatedByUser
  CustomAttributeData
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  NextTestDate
  OriginatingItemId
  SequentialId
  StartDate
  Summary
  TargetCompletionDate
  Title
  Status
  Outcome
}`) as any;
export type GetLatestComplianceMonitoringAssessmentObligationAssessmentResultByObligationIdQuery = any;
export type GetLatestComplianceMonitoringAssessmentObligationAssessmentResultByObligationIdQueryVariables = any;
export type GetGetLatestComplianceMonitoringAssessmentObligationAssessmentResultByObligationIdQuery = any;
export type getLatestComplianceMonitoringAssessmentObligationAssessmentResultByObligationIdQuery = any;
export type getLatestComplianceMonitoringAssessmentObligationAssessmentResultByObligationIdQueryVariables = any;

export const GetLatestComplianceMonitoringAssessmentRiskAssessmentResultsByRiskIdDocument = parse(`query getLatestComplianceMonitoringAssessmentRiskAssessmentResultsByRiskId(
  \$RiskId: uuid!
) {
  uncontrolled: risk_uncontrolled_second_line_result(
    where: { parents: { ParentId: { _eq: \$RiskId } } }
    order_by: [{ TestDate: desc_nulls_last }, { CreatedAtTimestamp: desc }]
    limit: 1
  ) {
    ...RiskUncontrolledSecondLineResultParts
    ancestorContributors {
      ...AncestorContributorParts
    }
    parents(where: { ParentType: { _eq: compliance_monitoring_assessment } }) {
      complianceMonitoringAssessment {
        ...ComplianceMonitoringAssessmentParts
        completedByUser {
          FriendlyName
        }
      }
    }
  }
  controlled: risk_controlled_second_line_result(
    where: { parents: { ParentId: { _eq: \$RiskId } } }
    order_by: [{ TestDate: desc_nulls_last }, { CreatedAtTimestamp: desc }]
    limit: 1
  ) {
    ...RiskControlledSecondLineResultParts
    ancestorContributors {
      ...AncestorContributorParts
    }
    parents(where: { ParentType: { _eq: compliance_monitoring_assessment } }) {
      complianceMonitoringAssessment {
        ...ComplianceMonitoringAssessmentParts
        completedByUser {
          FriendlyName
        }
      }
    }
  }
}

fragment RiskUncontrolledSecondLineResultParts on risk_uncontrolled_second_line_result {
  Id
  Likelihood
  Impact
  Rating
  CustomAttributeData
  Rationale
  TestDate
}

fragment AncestorContributorParts on ancestor_contributor {
  ContributorType
  UserId
  Id
  AncestorId
  UserGroupId
  user {
    FriendlyName
  }
  user_group {
    Name
  }
}

fragment ComplianceMonitoringAssessmentParts on compliance_monitoring_assessment {
  ActualCompletionDate
  CompletedByUser
  CreatedAtTimestamp
  CreatedByUser
  CustomAttributeData
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  NextTestDate
  OriginatingItemId
  SequentialId
  StartDate
  Summary
  TargetCompletionDate
  Title
  Status
  Outcome
}

fragment RiskControlledSecondLineResultParts on risk_controlled_second_line_result {
  Id
  Likelihood
  Impact
  Rating
  CustomAttributeData
  Rationale
  TestDate
}`) as any;
export type GetLatestComplianceMonitoringAssessmentRiskAssessmentResultsByRiskIdQuery = any;
export type GetLatestComplianceMonitoringAssessmentRiskAssessmentResultsByRiskIdQueryVariables = any;
export type GetGetLatestComplianceMonitoringAssessmentRiskAssessmentResultsByRiskIdQuery = any;
export type getLatestComplianceMonitoringAssessmentRiskAssessmentResultsByRiskIdQuery = any;
export type getLatestComplianceMonitoringAssessmentRiskAssessmentResultsByRiskIdQueryVariables = any;

export const GetLatestComplianceMonitoringAssessmentTestResultsByControlIdDocument = parse(`query getLatestComplianceMonitoringAssessmentTestResultsByControlId(
  \$controlId: uuid
) {
  control_test_second_line_result(
    where: { ParentControlId: { _eq: \$controlId } }
    order_by: [{ TestDate: desc_nulls_last }, { CreatedAtTimestamp: desc }]
    limit: 1
  ) {
    ...ControlTestSecondLineResultParts
    submitter {
      FriendlyName
    }
    files {
      ...RelationFileParts
    }
    parents(where: { ParentType: { _eq: compliance_monitoring_assessment } }) {
      complianceMonitoringAssessment {
        ...ComplianceMonitoringAssessmentParts
        completedByUser {
          FriendlyName
        }
      }
    }
  }
}

fragment ControlTestSecondLineResultParts on control_test_second_line_result {
  Description
  DesignEffectiveness
  Id
  OverallEffectiveness
  ParentControlId
  PerformanceEffectiveness
  Submitter
  TestDate
  TestType
  CreatedAtTimestamp
  ModifiedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  CustomAttributeData
  SequentialId
}

fragment RelationFileParts on relation_file {
  ParentId
  ChangeRequestFileOperation
  file {
    ...FileParts
  }
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}

fragment ComplianceMonitoringAssessmentParts on compliance_monitoring_assessment {
  ActualCompletionDate
  CompletedByUser
  CreatedAtTimestamp
  CreatedByUser
  CustomAttributeData
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  NextTestDate
  OriginatingItemId
  SequentialId
  StartDate
  Summary
  TargetCompletionDate
  Title
  Status
  Outcome
}`) as any;
export type GetLatestComplianceMonitoringAssessmentTestResultsByControlIdQuery = any;
export type GetLatestComplianceMonitoringAssessmentTestResultsByControlIdQueryVariables = any;
export type GetGetLatestComplianceMonitoringAssessmentTestResultsByControlIdQuery = any;
export type getLatestComplianceMonitoringAssessmentTestResultsByControlIdQuery = any;
export type getLatestComplianceMonitoringAssessmentTestResultsByControlIdQueryVariables = any;

export const GetObligationSecondLineResultByIdDocument = parse(`query getObligationSecondLineResultById(\$Id: uuid!) {
  obligation_second_line_result(where: { Id: { _eq: \$Id } }) {
    ...ObligationSecondLineResultParts
    parents {
      obligation {
        Id
        Title
      }
      complianceMonitoringAssessment {
        Id
        Title
      }
    }
    files {
      ...RelationFileParts
    }
  }
}

fragment ObligationSecondLineResultParts on obligation_second_line_result {
  Id
  Rating
  CustomAttributeData
  Rationale
  TestDate
}

fragment RelationFileParts on relation_file {
  ParentId
  ChangeRequestFileOperation
  file {
    ...FileParts
  }
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}`) as any;
export type GetObligationSecondLineResultByIdQuery = any;
export type GetObligationSecondLineResultByIdQueryVariables = any;
export type GetGetObligationSecondLineResultByIdQuery = any;
export type getObligationSecondLineResultByIdQuery = any;
export type getObligationSecondLineResultByIdQueryVariables = any;

export const GetRiskSecondLineResultByIdDocument = parse(`query getRiskSecondLineResultById(\$Id: uuid!) {
  risk_controlled_second_line_result(where: { Id: { _eq: \$Id } }) {
    ...RiskControlledSecondLineResultParts
    parents {
      risk {
        Id
        Title
      }
      complianceMonitoringAssessment {
        Id
        Title
      }
    }
    files {
      ...RelationFileParts
    }
  }
  risk_uncontrolled_second_line_result(where: { Id: { _eq: \$Id } }) {
    ...RiskUncontrolledSecondLineResultParts
    parents {
      risk {
        Id
        Title
      }
      complianceMonitoringAssessment {
        Id
        Title
      }
    }
    files {
      ...RelationFileParts
    }
  }
}

fragment RiskControlledSecondLineResultParts on risk_controlled_second_line_result {
  Id
  Likelihood
  Impact
  Rating
  CustomAttributeData
  Rationale
  TestDate
}

fragment RelationFileParts on relation_file {
  ParentId
  ChangeRequestFileOperation
  file {
    ...FileParts
  }
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}

fragment RiskUncontrolledSecondLineResultParts on risk_uncontrolled_second_line_result {
  Id
  Likelihood
  Impact
  Rating
  CustomAttributeData
  Rationale
  TestDate
}`) as any;
export type GetRiskSecondLineResultByIdQuery = any;
export type GetRiskSecondLineResultByIdQueryVariables = any;
export type GetGetRiskSecondLineResultByIdQuery = any;
export type getRiskSecondLineResultByIdQuery = any;
export type getRiskSecondLineResultByIdQueryVariables = any;

export const GetSecondLineResultByIdDocument = parse(`query getSecondLineResultById(\$Id: uuid!) {
  second_line_result_parent(where: { Id: { _eq: \$Id } }) {
    Id
    ParentId
    ResultType
    ParentType
    obligationAssessmentResult {
      ...ObligationSecondLineResultParts
    }
    documentAssessmentResult {
      ...DocumentSecondLineResultParts
    }
    controlledRiskAssessmentResult {
      ...RiskControlledSecondLineResultParts
    }
    uncontrolledRiskAssessmentResult {
      ...RiskUncontrolledSecondLineResultParts
    }
    testResult {
      ...ControlTestSecondLineResultParts
    }
    impactRating {
      ...ImpactSecondLineRatingParts
    }
  }
}

fragment ObligationSecondLineResultParts on obligation_second_line_result {
  Id
  Rating
  CustomAttributeData
  Rationale
  TestDate
}

fragment DocumentSecondLineResultParts on document_second_line_result {
  Id
  Rating
  CustomAttributeData
  Rationale
  TestDate
}

fragment RiskControlledSecondLineResultParts on risk_controlled_second_line_result {
  Id
  Likelihood
  Impact
  Rating
  CustomAttributeData
  Rationale
  TestDate
}

fragment RiskUncontrolledSecondLineResultParts on risk_uncontrolled_second_line_result {
  Id
  Likelihood
  Impact
  Rating
  CustomAttributeData
  Rationale
  TestDate
}

fragment ControlTestSecondLineResultParts on control_test_second_line_result {
  Description
  DesignEffectiveness
  Id
  OverallEffectiveness
  ParentControlId
  PerformanceEffectiveness
  Submitter
  TestDate
  TestType
  CreatedAtTimestamp
  ModifiedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  CustomAttributeData
  SequentialId
}

fragment ImpactSecondLineRatingParts on impact_second_line_rating {
  CreatedAtTimestamp
  CreatedByUser
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  CustomAttributeData
  SequentialId
  Rating
  RatedItemId
  ImpactId
  TestDate
  CompletedBy
  Likelihood
}`) as any;
export type GetSecondLineResultByIdQuery = any;
export type GetSecondLineResultByIdQueryVariables = any;
export type GetGetSecondLineResultByIdQuery = any;
export type getSecondLineResultByIdQuery = any;
export type getSecondLineResultByIdQueryVariables = any;

export const GetSecondLineResultsByParentIdDocument = parse(`query getSecondLineResultsByParentId(\$ParentId: uuid!) {
  document_second_line_result(
    where: { parents: { ParentId: { _eq: \$ParentId } } }
    order_by: [{ TestDate: desc_nulls_last }, { CreatedAtTimestamp: desc }]
  ) {
    ...DocumentSecondLineResultParts
    parents(where: { ParentType: { _eq: document } }) {
      document {
        Id
        Title
      }
      node {
        Id
        SequentialId
        ObjectType
      }
    }
    files {
      ...RelationFileParts
    }
    ancestorContributors {
      ...AncestorContributorParts
    }
  }

  obligation_second_line_result(
    where: { parents: { ParentId: { _eq: \$ParentId } } }
    order_by: [{ TestDate: desc_nulls_last }, { CreatedAtTimestamp: desc }]
  ) {
    ...ObligationSecondLineResultParts
    parents(where: { ParentType: { _eq: obligation } }) {
      obligation {
        Id
        Title
      }
      node {
        Id
        SequentialId
        ObjectType
      }
    }
    files {
      ...RelationFileParts
    }
    ancestorContributors {
      ...AncestorContributorParts
    }
  }

  risk_controlled_second_line_result(
    where: { parents: { ParentId: { _eq: \$ParentId } } }
    order_by: [{ TestDate: desc_nulls_last }, { CreatedAtTimestamp: desc }]
  ) {
    ...RiskControlledSecondLineResultParts
    parents(where: { ParentType: { _eq: risk } }) {
      risk {
        Id
        Title
      }
      node {
        Id
        SequentialId
        ObjectType
      }
    }
    files {
      ...RelationFileParts
    }
    ancestorContributors {
      ...AncestorContributorParts
    }
  }

  risk_uncontrolled_second_line_result(
    where: { parents: { ParentId: { _eq: \$ParentId } } }
    order_by: [{ TestDate: desc_nulls_last }, { CreatedAtTimestamp: desc }]
  ) {
    ...RiskUncontrolledSecondLineResultParts
    parents(where: { ParentType: { _eq: risk } }) {
      risk {
        Id
        Title
      }
      node {
        Id
        SequentialId
        ObjectType
      }
    }
    files {
      ...RelationFileParts
    }
    ancestorContributors {
      ...AncestorContributorParts
    }
  }

  control_test_second_line_result(
    where: { parents: { ParentId: { _eq: \$ParentId } } }
    order_by: [{ TestDate: desc_nulls_last }, { CreatedAtTimestamp: desc }]
  ) {
    ...ControlTestSecondLineResultParts
    parent {
      ...ControlParts
    }
    files {
      ...RelationFileParts
    }
  }

  impact_second_line_rating(
    where: { parents: { ParentId: { _eq: \$ParentId } } }
  ) {
    ...ImpactSecondLineRatingParts
    createdByUser {
      FriendlyName
    }
    completedBy {
      FriendlyName
    }
    impact {
      Id
      Name
    }
    ratedItem {
      risk {
        Title
      }
      ObjectType
    }
  }

  issue(where: { parents: { ParentId: { _eq: \$ParentId } } }) {
    ...IssueParts
    consequences {
      CostType
      CostValue
      Type
    }
    owners {
      ...OwnerParts
    }
    ownerGroups {
      ...OwnerGroupParts
    }
    contributors {
      ...ContributorParts
    }
    contributorGroups {
      ...ContributorGroupParts
    }
    ancestorContributors {
      ...AncestorContributorParts
    }
    assessment {
      ...IssueAssessmentParts
      modifiedByUser {
        FriendlyName
      }
      createdByUser {
        FriendlyName
      }
      certifiedIndividual {
        FriendlyName
      }
      departments {
        ...DepartmentParts
      }
    }
    actions_aggregate(where: { action: { Status: { _eq: open } } }) {
      aggregate {
        count
      }
    }
    modifiedByUser {
      FriendlyName
    }
    createdByUser {
      FriendlyName
    }
    departments {
      ...DepartmentParts
    }
    tags {
      ...TagParts
    }
    parents {
      obligation {
        Title
        Id
      }
      document {
        Title
        Id
      }
      control {
        Title
        Id
      }
      assessment {
        Title
        Id
      }
    }
  }

  impact(where: { parents: { ParentId: { _eq: \$ParentId } } }) {
    ...ImpactParts
    createdByUser {
      FriendlyName
    }
    owners {
      ...OwnerParts
    }
    ownerGroups {
      ...OwnerGroupParts
    }
    ratings(
      distinct_on: [RatedItemId]
      order_by: [{ RatedItemId: desc }, { TestDate: desc }]
    ) {
      Rating
      RatedItemId
      ratedItem {
        risk {
          Id
          Title
        }
      }
    }
    appetites(
      order_by: [
        { EffectiveDate: desc_nulls_last }
        { CreatedAtTimestamp: desc_nulls_last }
      ]
    ) {
      ...AppetiteParts
      ImpactId
      parents {
        risk {
          Id
        }
      }
    }
  }

  action(where: { parents: { ParentId: { _eq: \$ParentId } } }) {
    ...ActionParts
    parents {
      parent {
        Id
        ObjectType
        SequentialId
      }
      obligation {
        Title
        Id
      }
      risk {
        Title
        Id
      }
      control {
        Title
        Id
      }
      issue {
        Title
        Id
        Type
      }
      document {
        Title
        Id
      }
      assessment {
        Title
        Id
      }
    }
    updates(order_by: { CreatedAtTimestamp: desc }, limit: 1) {
      ...ActionUpdateParts
    }
    updates_aggregate {
      aggregate {
        count
      }
    }
    owners {
      ...OwnerParts
    }
    ownerGroups {
      ...OwnerGroupParts
    }
    contributors {
      ...ContributorParts
    }
    contributorGroups {
      ...ContributorGroupParts
    }
    ancestorContributors {
      ...AncestorContributorParts
    }
    modifiedByUser {
      FriendlyName
    }
    createdByUser {
      FriendlyName
    }
    tags {
      ...TagParts
    }
    departments {
      ...DepartmentParts
    }
  }
}

fragment DocumentSecondLineResultParts on document_second_line_result {
  Id
  Rating
  CustomAttributeData
  Rationale
  TestDate
}

fragment RelationFileParts on relation_file {
  ParentId
  ChangeRequestFileOperation
  file {
    ...FileParts
  }
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}

fragment AncestorContributorParts on ancestor_contributor {
  ContributorType
  UserId
  Id
  AncestorId
  UserGroupId
  user {
    FriendlyName
  }
  user_group {
    Name
  }
}

fragment ObligationSecondLineResultParts on obligation_second_line_result {
  Id
  Rating
  CustomAttributeData
  Rationale
  TestDate
}

fragment RiskControlledSecondLineResultParts on risk_controlled_second_line_result {
  Id
  Likelihood
  Impact
  Rating
  CustomAttributeData
  Rationale
  TestDate
}

fragment RiskUncontrolledSecondLineResultParts on risk_uncontrolled_second_line_result {
  Id
  Likelihood
  Impact
  Rating
  CustomAttributeData
  Rationale
  TestDate
}

fragment ControlTestSecondLineResultParts on control_test_second_line_result {
  Description
  DesignEffectiveness
  Id
  OverallEffectiveness
  ParentControlId
  PerformanceEffectiveness
  Submitter
  TestDate
  TestType
  CreatedAtTimestamp
  ModifiedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  CustomAttributeData
  SequentialId
}

fragment ControlParts on control {
  CreatedByUser
  ModifiedByUser
  Description
  Id
  CreatedAtTimestamp
  ModifiedAtTimestamp
  Title
  Type
  CustomAttributeData
  SequentialId
  schedule {
    ...ScheduleParts
  }
}

fragment ScheduleParts on schedule {
  Id
  Frequency
  ManualDueDate
  StartDate
  TimeToCompleteValue
  TimeToCompleteUnit
}

fragment ImpactSecondLineRatingParts on impact_second_line_rating {
  CreatedAtTimestamp
  CreatedByUser
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  CustomAttributeData
  SequentialId
  Rating
  RatedItemId
  ImpactId
  TestDate
  CompletedBy
  Likelihood
}

fragment IssueParts on issue {
  RaisedAtTimestamp
  DateIdentified
  DateOccurred
  Details
  Id
  ImpactsCustomer
  IsExternalIssue
  CreatedAtTimestamp
  ModifiedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  SequentialId
  CustomAttributeData
  Meta
  Type
}

fragment OwnerParts on owner {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment OwnerGroupParts on owner_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment ContributorParts on contributor {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment ContributorGroupParts on contributor_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment IssueAssessmentParts on issue_assessment {
  ActualCloseDate
  CertifiedIndividual
  IssueCausedBySystemIssue
  IssueCausedByThirdParty
  IssueType
  ParentIssueId
  PoliciesBreached
  PolicyBreach
  PolicyOwner
  PolicyOwnerCommentary
  Rationale
  RegulatoryBreach
  RegulationsBreached
  Reportable
  Severity
  Status
  SystemResponsible
  TargetCloseDate
  ThirdPartyResponsible
  CreatedAtTimestamp
  ModifiedAtTimestamp
  CreatedByUser
  ModifiedByUser
  Id
  CustomAttributeData
  Type
}

fragment DepartmentParts on department {
  type {
    Description
    Name
  }
  ParentId
  DepartmentTypeId
}

fragment TagParts on tag {
  type {
    Description
    Name
  }
  ParentId
  TagTypeId
}

fragment ImpactParts on impact {
  CreatedAtTimestamp
  CreatedByUser
  Rationale
  RatingGuidance
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  Name
  CustomAttributeData
  SequentialId
  LikelihoodAppetite
}

fragment AppetiteParts on appetite {
  Id
  LowerAppetite
  UpperAppetite
  ImpactAppetite
  LikelihoodAppetite
  Statement
  EffectiveDate
  AppetiteType
  CreatedAtTimestamp
  ModifiedAtTimestamp
  CreatedByUser
  ModifiedByUser
  CustomAttributeData
  SequentialId
  ImpactId
}

fragment ActionParts on action {
  DateDue
  DateRaised
  Description
  Id
  Priority
  Status
  ModifiedAtTimestamp
  CreatedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  ClosedDate
  CustomAttributeData
  SequentialId
}

fragment ActionUpdateParts on action_update {
  Description
  Id
  ParentActionId
  CreatedAtTimestamp
  ModifiedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  CustomAttributeData
}`) as any;
export type GetSecondLineResultsByParentIdQuery = any;
export type GetSecondLineResultsByParentIdQueryVariables = any;
export type GetGetSecondLineResultsByParentIdQuery = any;
export type getSecondLineResultsByParentIdQuery = any;
export type getSecondLineResultsByParentIdQueryVariables = any;

export const GetSecondLineTestResultByIdDocument = parse(`query getSecondLineTestResultById(\$Id: uuid) {
  control_test_second_line_result(where: { Id: { _eq: \$Id } }) {
    ...ControlTestSecondLineResultParts
    files {
      ...RelationFileParts
    }
  }
}

fragment ControlTestSecondLineResultParts on control_test_second_line_result {
  Description
  DesignEffectiveness
  Id
  OverallEffectiveness
  ParentControlId
  PerformanceEffectiveness
  Submitter
  TestDate
  TestType
  CreatedAtTimestamp
  ModifiedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  CustomAttributeData
  SequentialId
}

fragment RelationFileParts on relation_file {
  ParentId
  ChangeRequestFileOperation
  file {
    ...FileParts
  }
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}`) as any;
export type GetSecondLineTestResultByIdQuery = any;
export type GetSecondLineTestResultByIdQueryVariables = any;
export type GetGetSecondLineTestResultByIdQuery = any;
export type getSecondLineTestResultByIdQuery = any;
export type getSecondLineTestResultByIdQueryVariables = any;

export const InsertDocumentSecondLineResultDocument = parse(`mutation insertDocumentSecondLineResult(
  \$Rating: Int
  \$ComplianceMonitoringAssessmentId: uuid!
  \$DocumentIds: [uuid!]!
  \$CustomAttributeData: jsonb
  \$TestDate: timestamptz
  \$Rationale: String
) {
  insertChildDocumentSecondLineResult(
    Rating: \$Rating
    ComplianceMonitoringAssessmentId: \$ComplianceMonitoringAssessmentId
    DocumentIds: \$DocumentIds
    CustomAttributeData: \$CustomAttributeData
    TestDate: \$TestDate
    Rationale: \$Rationale
  ) {
    Ids
  }
}`) as any;
export type InsertDocumentSecondLineResultMutation = any;
export type InsertDocumentSecondLineResultMutationVariables = any;
export type insertDocumentSecondLineResultMutation = any;
export type insertDocumentSecondLineResultMutationVariables = any;

export const InsertObligationSecondLineResultDocument = parse(`mutation insertObligationSecondLineResult(
  \$Rating: Int
  \$ComplianceMonitoringAssessmentId: uuid!
  \$ObligationIds: [uuid!]!
  \$CustomAttributeData: jsonb
  \$TestDate: timestamptz
  \$Rationale: String
) {
  insertChildObligationSecondLineResult(
    Rating: \$Rating
    ComplianceMonitoringAssessmentId: \$ComplianceMonitoringAssessmentId
    ObligationIds: \$ObligationIds
    CustomAttributeData: \$CustomAttributeData
    TestDate: \$TestDate
    Rationale: \$Rationale
  ) {
    Ids
  }
}`) as any;
export type InsertObligationSecondLineResultMutation = any;
export type InsertObligationSecondLineResultMutationVariables = any;
export type insertObligationSecondLineResultMutation = any;
export type insertObligationSecondLineResultMutationVariables = any;

export const InsertChildRiskSecondLineResultDocument = parse(`mutation insertChildRiskSecondLineResult(
  \$Rating: Int
  \$Likelihood: Int
  \$Impact: Int
  \$ControlType: risk_assessment_result_control_type_enum
  \$ComplianceMonitoringAssessmentId: uuid!
  \$RiskIds: [uuid!]!
  \$CustomAttributeData: jsonb
  \$TestDate: timestamptz
  \$Rationale: String
) {
  insertChildRiskSecondLineResult(
    Rating: \$Rating
    ComplianceMonitoringAssessmentId: \$ComplianceMonitoringAssessmentId
    RiskIds: \$RiskIds
    Impact: \$Impact
    Likelihood: \$Likelihood
    ControlType: \$ControlType
    CustomAttributeData: \$CustomAttributeData
    TestDate: \$TestDate
    Rationale: \$Rationale
  ) {
    Ids
  }
}`) as any;
export type InsertChildRiskSecondLineResultMutation = any;
export type InsertChildRiskSecondLineResultMutationVariables = any;
export type insertChildRiskSecondLineResultMutation = any;
export type insertChildRiskSecondLineResultMutationVariables = any;

export const InsertSecondLineControlTestResultDocument = parse(`mutation insertSecondLineControlTestResult(
  \$Description: String
  \$DesignEffectiveness: Int
  \$OverallEffectiveness: Int
  \$ControlIds: [uuid!]!
  \$PerformanceEffectiveness: Int
  \$ComplianceMonitoringAssessmentId: uuid!
  \$Submitter: String
  \$TestDate: timestamptz
  \$TestType: String
  \$Title: String
  \$CustomAttributeData: jsonb
) {
  insertChildControlTestSecondLineResult(
    Description: \$Description
    DesignEffectiveness: \$DesignEffectiveness
    OverallEffectiveness: \$OverallEffectiveness
    ControlIds: \$ControlIds
    PerformanceEffectiveness: \$PerformanceEffectiveness
    Submitter: \$Submitter
    TestDate: \$TestDate
    TestType: \$TestType
    Title: \$Title
    ComplianceMonitoringAssessmentId: \$ComplianceMonitoringAssessmentId
    CustomAttributeData: \$CustomAttributeData
  ) {
    Ids
  }
}`) as any;
export type InsertSecondLineControlTestResultMutation = any;
export type InsertSecondLineControlTestResultMutationVariables = any;
export type insertSecondLineControlTestResultMutation = any;
export type insertSecondLineControlTestResultMutationVariables = any;

export const InsertSecondLineImpactRatingDocument = parse(`mutation insertSecondLineImpactRating(
  \$Ratings: [InsertImpactRatingPairInput!]!
  \$TestDate: timestamptz!
  \$ComplianceMonitoringAssessmentId: uuid!
  \$RatedItemId: uuid!
  \$CustomAttributeData: jsonb
  \$CompletedBy: String
  \$Likelihood: Int
) {
  insertChildImpactSecondLineRating(
    ComplianceMonitoringAssessmentId: \$ComplianceMonitoringAssessmentId
    Ratings: \$Ratings
    TestDate: \$TestDate
    RatedItemId: \$RatedItemId
    CustomAttributeData: \$CustomAttributeData
    CompletedBy: \$CompletedBy
    Likelihood: \$Likelihood
  ) {
    Ids
  }
}`) as any;
export type InsertSecondLineImpactRatingMutation = any;
export type InsertSecondLineImpactRatingMutationVariables = any;
export type insertSecondLineImpactRatingMutation = any;
export type insertSecondLineImpactRatingMutationVariables = any;

export const UpdateControlTestSecondLineResultApiDocument = parse(`mutation updateControlTestSecondLineResultApi(\$object: UpdateTestResultInput) {
  updateControlTestSecondLineResultApi(object: \$object) {
    Id
  }
}`) as any;
export type UpdateControlTestSecondLineResultApiMutation = any;
export type UpdateControlTestSecondLineResultApiMutationVariables = any;
export type updateControlTestSecondLineResultApiMutation = any;
export type updateControlTestSecondLineResultApiMutationVariables = any;

export const UpdateDocumentSecondLineResultDocument = parse(`mutation updateDocumentSecondLineResult(
  \$Id: uuid!
  \$Rating: Int
  \$Rationale: String
  \$TestDate: timestamptz
  \$CustomAttributeData: jsonb
) {
  update_document_second_line_result(
    where: { Id: { _eq: \$Id } }
    _set: {
      CustomAttributeData: \$CustomAttributeData
      Rating: \$Rating
      Rationale: \$Rationale
      TestDate: \$TestDate
    }
  ) {
    affected_rows
  }
}`) as any;
export type UpdateDocumentSecondLineResultMutation = any;
export type UpdateDocumentSecondLineResultMutationVariables = any;
export type updateDocumentSecondLineResultMutation = any;
export type updateDocumentSecondLineResultMutationVariables = any;

export const UpdateObligationSecondLineResultDocument = parse(`mutation updateObligationSecondLineResult(
  \$Id: uuid!
  \$Rating: Int
  \$Rationale: String
  \$TestDate: timestamptz
  \$CustomAttributeData: jsonb
) {
  update_obligation_second_line_result(
    where: { Id: { _eq: \$Id } }
    _set: {
      CustomAttributeData: \$CustomAttributeData
      Rating: \$Rating
      Rationale: \$Rationale
      TestDate: \$TestDate
    }
  ) {
    affected_rows
  }
}`) as any;
export type UpdateObligationSecondLineResultMutation = any;
export type UpdateObligationSecondLineResultMutationVariables = any;
export type updateObligationSecondLineResultMutation = any;
export type updateObligationSecondLineResultMutationVariables = any;

export const UpdateControlledRiskSecondLineResultDocument = parse(`mutation updateControlledRiskSecondLineResult(
  \$Id: uuid!
  \$Impact: Int
  \$Likelihood: Int
  \$Rating: Int
  \$Rationale: String
  \$TestDate: timestamptz
  \$CustomAttributeData: jsonb
) {
  update_risk_controlled_second_line_result(
    where: { Id: { _eq: \$Id } }
    _set: {
      CustomAttributeData: \$CustomAttributeData
      Rating: \$Rating
      Rationale: \$Rationale
      TestDate: \$TestDate
      Likelihood: \$Likelihood
      Impact: \$Impact
    }
  ) {
    affected_rows
  }
}`) as any;
export type UpdateControlledRiskSecondLineResultMutation = any;
export type UpdateControlledRiskSecondLineResultMutationVariables = any;
export type updateControlledRiskSecondLineResultMutation = any;
export type updateControlledRiskSecondLineResultMutationVariables = any;

export const UpdateUncontrolledRiskSecondLineResultDocument = parse(`mutation updateUncontrolledRiskSecondLineResult(
  \$Id: uuid!
  \$Impact: Int
  \$Likelihood: Int
  \$Rating: Int
  \$Rationale: String
  \$TestDate: timestamptz
  \$CustomAttributeData: jsonb
) {
  update_risk_uncontrolled_second_line_result(
    where: { Id: { _eq: \$Id } }
    _set: {
      CustomAttributeData: \$CustomAttributeData
      Rating: \$Rating
      Rationale: \$Rationale
      TestDate: \$TestDate
      Likelihood: \$Likelihood
      Impact: \$Impact
    }
  ) {
    affected_rows
  }
}`) as any;
export type UpdateUncontrolledRiskSecondLineResultMutation = any;
export type UpdateUncontrolledRiskSecondLineResultMutationVariables = any;
export type updateUncontrolledRiskSecondLineResultMutation = any;
export type updateUncontrolledRiskSecondLineResultMutationVariables = any;

export const DeleteSsoConfigurationByConnectionIdDocument = parse(`mutation DeleteSsoConfigurationByConnectionId(\$connectionId: String!) {
  delete_sso_configuration(where: { ConnectionId: { _eq: \$connectionId } }) {
    returning {
      Id
      ConnectionId
    }
  }
}`) as any;
export type DeleteSsoConfigurationByConnectionIdMutation = any;
export type DeleteSsoConfigurationByConnectionIdMutationVariables = any;

export const GetSsoConfigurationsDocument = parse(`query getSsoConfigurations {
  sso_configuration(order_by: { CreatedAtTimestamp: desc }) {
    Id
    Name
    Strategy
    ClientId
    ConnectionId
    Domain
    DomainAliases
    IsActive
    IsRestApiEnabled
    IsOrganizationConnected
    CreatedAtTimestamp
    CreatedByUser
    ModifiedAtTimestamp
    ModifiedByUser
  }
}`) as any;
export type GetSsoConfigurationsQuery = any;
export type GetSsoConfigurationsQueryVariables = any;
export type GetGetSsoConfigurationsQuery = any;
export type getSsoConfigurationsQuery = any;
export type getSsoConfigurationsQueryVariables = any;

export const InsertSsoConfigDocument = parse(`mutation insertSsoConfig(\$object: InsertSsoConfigInput!) {
  insertSsoConfig(object: \$object) {
    Id
    Name
    Strategy
    Enabled
    IsOrgConnected
    Action
    Options {
        Domain
        DomainAliases
    }
  }
}`) as any;
export type InsertSsoConfigMutation = any;
export type InsertSsoConfigMutationVariables = any;
export type insertSsoConfigMutation = any;
export type insertSsoConfigMutationVariables = any;

export const InsertSsoConfigurationDocument = parse(`mutation insertSsoConfiguration(\$object: sso_configuration_insert_input!) {
  insert_sso_configuration_one(object: \$object) {
    Id
    Name
    Strategy
    ClientId
    ConnectionId
    IsActive
    IsRestApiEnabled
    IsOrganizationConnected
    CreatedAtTimestamp
    ModifiedAtTimestamp
  }
}`) as any;
export type InsertSsoConfigurationMutation = any;
export type InsertSsoConfigurationMutationVariables = any;
export type insertSsoConfigurationMutation = any;
export type insertSsoConfigurationMutationVariables = any;

export const UpdateSsoConfigurationByConnectionIdDocument = parse(`mutation UpdateSsoConfigurationByConnectionId(
  \$connectionId: String!
  \$set: sso_configuration_set_input!
) {
  update_sso_configuration(
    where: { ConnectionId: { _eq: \$connectionId } }
    _set: \$set
  ) {
    returning {
      Id
      Name
      Strategy
      ClientId
      ConnectionId
      IsActive
      IsRestApiEnabled
      IsOrganizationConnected
      ModifiedAtTimestamp
    }
  }
}`) as any;
export type UpdateSsoConfigurationByConnectionIdMutation = any;
export type UpdateSsoConfigurationByConnectionIdMutationVariables = any;

export const GetDefaultTabsDocument = parse(`query getDefaultTabs {
  tab {
    ParentType
    Tabs
  }

  organisation_tab_preference {
    ObjectType
    Preferences
  }

  user_tab_preference {
    ObjectType
    Preferences
  }
}`) as any;
export type GetDefaultTabsQuery = any;
export type GetDefaultTabsQueryVariables = any;
export type GetGetDefaultTabsQuery = any;
export type getDefaultTabsQuery = any;
export type getDefaultTabsQueryVariables = any;

export const GetOrganisationTabPreferencesDocument = parse(`query getOrganisationTabPreferences {
  organisation_tab_preference {
    ObjectType
    Preferences
  }
}`) as any;
export type GetOrganisationTabPreferencesQuery = any;
export type GetOrganisationTabPreferencesQueryVariables = any;
export type GetGetOrganisationTabPreferencesQuery = any;
export type getOrganisationTabPreferencesQuery = any;
export type getOrganisationTabPreferencesQueryVariables = any;

export const GetUserTabPreferencesDocument = parse(`query getUserTabPreferences {
  user_tab_preference {
    ObjectType
    Preferences
  }
}`) as any;
export type GetUserTabPreferencesQuery = any;
export type GetUserTabPreferencesQueryVariables = any;
export type GetGetUserTabPreferencesQuery = any;
export type getUserTabPreferencesQuery = any;
export type getUserTabPreferencesQueryVariables = any;

export const ResetTabPreferencesDocument = parse(`mutation resetTabPreferences(\$ObjectType: parent_type_enum!) {
  delete_organisation_tab_preference(
    where: { ObjectType: { _eq: \$ObjectType } }
  ) {
    affected_rows
  }
  delete_user_tab_preference(where: { ObjectType: { _eq: \$ObjectType } }) {
    affected_rows
  }
}`) as any;
export type ResetTabPreferencesMutation = any;
export type ResetTabPreferencesMutationVariables = any;
export type resetTabPreferencesMutation = any;
export type resetTabPreferencesMutationVariables = any;

export const UpdateOrganisationTabPreferencesDocument = parse(`mutation updateOrganisationTabPreferences(
  \$ObjectType: parent_type_enum!
  \$Preferences: jsonb!
) {
  insert_organisation_tab_preference(
    objects: [{ ObjectType: \$ObjectType, Preferences: \$Preferences }]
    on_conflict: {
      constraint: organisation_tab_preference_pkey
      update_columns: [Preferences]
    }
  ) {
    affected_rows
  }

  delete_user_tab_preference(where: { ObjectType: { _eq: \$ObjectType } }) {
    affected_rows
  }
}`) as any;
export type UpdateOrganisationTabPreferencesMutation = any;
export type UpdateOrganisationTabPreferencesMutationVariables = any;
export type updateOrganisationTabPreferencesMutation = any;
export type updateOrganisationTabPreferencesMutationVariables = any;

export const UpdateUserTabPreferencesDocument = parse(`mutation updateUserTabPreferences(
  \$ObjectType: parent_type_enum!
  \$Preferences: jsonb!
) {
  insert_user_tab_preference(
    objects: [{ ObjectType: \$ObjectType, Preferences: \$Preferences }]
    on_conflict: {
      constraint: user_tab_preference_pkey
      update_columns: [Preferences]
    }
  ) {
    affected_rows
  }
}`) as any;
export type UpdateUserTabPreferencesMutation = any;
export type UpdateUserTabPreferencesMutationVariables = any;
export type updateUserTabPreferencesMutation = any;
export type updateUserTabPreferencesMutationVariables = any;

export const DeleteTagTypesDocument = parse(`mutation deleteTagTypes(\$Ids: [uuid!]!) {
  deleteTagTypeApi(Ids: \$Ids) {
    affected_rows
  }
}`) as any;
export type DeleteTagTypesMutation = any;
export type DeleteTagTypesMutationVariables = any;
export type deleteTagTypesMutation = any;
export type deleteTagTypesMutationVariables = any;

export const GetTagTypeByIdDocument = parse(`query GetTagTypeById(\$Id: uuid) {
  tag_type(where: { TagTypeId: { _eq: \$Id } }) {
    TagTypeId
    Name
    Description
    ModifiedAtTimestamp
    TagTypeGroupId
    tag_type_group {
      Id
      Name
    }
  }
}`) as any;
export type GetTagTypeByIdQuery = any;
export type GetTagTypeByIdQueryVariables = any;
export type GetGetTagTypeByIdQuery = any;

export const GetTagTypesByNameDocument = parse(`query getTagTypesByName(\$Name: String!) {
  tag_type(where: { Name: { _eq: \$Name } }) {
    Name
    TagTypeId
  }
}`) as any;
export type GetTagTypesByNameQuery = any;
export type GetTagTypesByNameQueryVariables = any;
export type GetGetTagTypesByNameQuery = any;
export type getTagTypesByNameQuery = any;
export type getTagTypesByNameQueryVariables = any;

export const GetTagTypeGroupsDocument = parse(`query getTagTypeGroups {
  tag_type_group(order_by: { Name: asc }) {
    Id
    Name
  }
}`) as any;
export type GetTagTypeGroupsQuery = any;
export type GetTagTypeGroupsQueryVariables = any;
export type GetGetTagTypeGroupsQuery = any;
export type getTagTypeGroupsQuery = any;
export type getTagTypeGroupsQueryVariables = any;

export const GetTagsDocument = parse(`query getTags {
  tag_type(order_by: { Name: asc }) {
    TagTypeId
    Name
    Description
    CreatedAtTimestamp
    ModifiedAtTimestamp
    createdByUser {
      FriendlyName
    }
    modifiedByUser {
      FriendlyName
    }
    tag_type_group {
      Id
      Name
    }
  }
}`) as any;
export type GetTagsQuery = any;
export type GetTagsQueryVariables = any;
export type GetGetTagsQuery = any;
export type getTagsQuery = any;
export type getTagsQueryVariables = any;

export const InsertTagTypeGroupByNameDocument = parse(`mutation InsertTagTypeGroupByName(\$Name: String) {
  insert_tag_type_group_one(
    object: { Name: \$Name }
    on_conflict: {
      constraint: TagTypeGroup_pkey
      update_columns: Name
      where: { Name: { _eq: \$Name } }
    }
  ) {
    Id
  }
}`) as any;
export type InsertTagTypeGroupByNameMutation = any;
export type InsertTagTypeGroupByNameMutationVariables = any;

export const InsertTagTypeWithGroupNameDocument = parse(`mutation insertTagTypeWithGroupName(
  \$Name: String!
  \$Description: String
  \$TagGroupName: String
) {
  insert_tag_type_one(
    object: {
      Name: \$Name
      Description: \$Description
      tag_type_group: {
        data: { Name: \$TagGroupName }
        on_conflict: { constraint: TagTypeGroup_pkey, update_columns: Name }
      }
    }
  ) {
    TagTypeId
  }
}`) as any;
export type InsertTagTypeWithGroupNameMutation = any;
export type InsertTagTypeWithGroupNameMutationVariables = any;
export type insertTagTypeWithGroupNameMutation = any;
export type insertTagTypeWithGroupNameMutationVariables = any;

export const InsertTagTypeWithOptionalGroupIdDocument = parse(`mutation insertTagTypeWithOptionalGroupId(
  \$Name: String!
  \$Description: String
  \$TagTypeGroupId: uuid
) {
  insert_tag_type_one(
    object: {
      Name: \$Name
      Description: \$Description
      TagTypeGroupId: \$TagTypeGroupId
    }
  ) {
    TagTypeId
  }
}`) as any;
export type InsertTagTypeWithOptionalGroupIdMutation = any;
export type InsertTagTypeWithOptionalGroupIdMutationVariables = any;
export type insertTagTypeWithOptionalGroupIdMutation = any;
export type insertTagTypeWithOptionalGroupIdMutationVariables = any;

export const TagPartsDocument = parse(`fragment TagParts on tag {
  type {
    Description
    Name
  }
  ParentId
  TagTypeId
}`) as any;
export type TagPartsFragment = any;

export const UpdateTagTypeDocument = parse(`mutation UpdateTagType(
  \$TagTypeId: uuid!
  \$Name: String
  \$Description: String
  \$TagTypeGroupId: uuid
  \$OriginalTimestamp: timestamptz
) {
  update_tag_type(
    where: {
      TagTypeId: { _eq: \$TagTypeId }
      _and: { ModifiedAtTimestamp: { _eq: \$OriginalTimestamp } }
    }
    _set: {
      Name: \$Name
      Description: \$Description
      TagTypeGroupId: \$TagTypeGroupId
    }
  ) {
    affected_rows
  }
}`) as any;
export type UpdateTagTypeMutation = any;
export type UpdateTagTypeMutationVariables = any;

export const DeleteTaxonomyOrgDocument = parse(`mutation deleteTaxonomyOrg(\$TaxonomyId: uuid!, \$OrgKey: String!) {
  delete_taxonomy_org(
    where: { TaxonomyId: { _eq: \$TaxonomyId }, OrgKey: { _eq: \$OrgKey } }
  ) {
    affected_rows
  }

  delete_taxonomy(
    where: {
      Id: { _eq: \$TaxonomyId }
      organisations_aggregate: { count: { predicate: { _eq: 0 } } }
    }
  ) {
    affected_rows
  }
}`) as any;
export type DeleteTaxonomyOrgMutation = any;
export type DeleteTaxonomyOrgMutationVariables = any;
export type deleteTaxonomyOrgMutation = any;
export type deleteTaxonomyOrgMutationVariables = any;

export const GetTaxonomyByLocaleAndOrgDocument = parse(`query getTaxonomyByLocaleAndOrg(\$Locale: String!, \$OrgKey: String!) {
  taxonomy_org(where: { Locale: { _eq: \$Locale }, OrgKey: { _eq: \$OrgKey } }) {
    Id
    Locale
    OrgName
    TaxonomyId
    taxonomy {
      Common
      Description
      ModifiedAtTimestamp
      Id
      Library
      Rating
      Taxonomy
      InternalAuditRating
      organisations_aggregate {
        aggregate {
          count
        }
      }
    }
  }
}`) as any;
export type GetTaxonomyByLocaleAndOrgQuery = any;
export type GetTaxonomyByLocaleAndOrgQueryVariables = any;
export type GetGetTaxonomyByLocaleAndOrgQuery = any;
export type getTaxonomyByLocaleAndOrgQuery = any;
export type getTaxonomyByLocaleAndOrgQueryVariables = any;

export const InsertTaxonomyDocument = parse(`mutation InsertTaxonomy {
  insert_taxonomy_one(
    object: {
      Description: "Description"
      Common: {}
      Library: {}
      Taxonomy: {}
      Rating: {}
      InternalAuditRating: {}
      organisations: { data: { Locale: "en", OrgName: "" } }
    }
  ) {
    Id
  }
}`) as any;
export type InsertTaxonomyMutation = any;
export type InsertTaxonomyMutationVariables = any;

export const UpdateTaxonomyDocument = parse(`mutation updateTaxonomy(
  \$Id: uuid!
  \$Common: jsonb!
  \$Library: jsonb!
  \$Rating: jsonb!
  \$Taxonomy: jsonb!
  \$InternalAuditRating: jsonb!
  \$OriginalTimestamp: timestamptz
) {
  update_taxonomy(
    where: {
      Id: { _eq: \$Id }
      ModifiedAtTimestamp: { _eq: \$OriginalTimestamp }
    }
    _set: {
      Common: \$Common
      Library: \$Library
      Rating: \$Rating
      Taxonomy: \$Taxonomy
      InternalAuditRating: \$InternalAuditRating
    }
  ) {
    affected_rows
  }
}`) as any;
export type UpdateTaxonomyMutation = any;
export type UpdateTaxonomyMutationVariables = any;
export type updateTaxonomyMutation = any;
export type updateTaxonomyMutationVariables = any;

export const GetTaxonomyAuditDocument = parse(`query getTaxonomyAudit(\$Locale: String!, \$OrgKey: String!) {
  taxonomy_audit(
    where: {
      organisations: { Locale: { _eq: \$Locale }, OrgKey: { _eq: \$OrgKey } }
    }
    order_by: { ModifiedAtTimestamp: desc }
  ) {
    Description
    Id
    Common
    Library
    Rating
    Taxonomy
    InternalAuditRating
    ModifiedAtTimestamp
    organisations_aggregate {
      aggregate {
        count
      }
    }
  }
}`) as any;
export type GetTaxonomyAuditQuery = any;
export type GetTaxonomyAuditQueryVariables = any;
export type GetGetTaxonomyAuditQuery = any;
export type getTaxonomyAuditQuery = any;
export type getTaxonomyAuditQueryVariables = any;

export const DeleteTestResultsDocument = parse(`mutation deleteTestResults(\$Ids: [uuid!]) {
  delete_relation_file(where: { ParentId: { _in: \$Ids } }) {
    affected_rows
  }

  delete_test_result(where: { Id: { _in: \$Ids } }) {
    affected_rows
  }
}`) as any;
export type DeleteTestResultsMutation = any;
export type DeleteTestResultsMutationVariables = any;
export type deleteTestResultsMutation = any;
export type deleteTestResultsMutationVariables = any;

export const GetLatestTestResultsByControlIdDocument = parse(`query getLatestTestResultsByControlId(\$controlId: uuid) {
  test_result(
    where: {
      ParentControlId: { _eq: \$controlId }
      RatingType: { _in: ["assessment", "rating"] }
    }
    order_by: [{ TestDate: desc_nulls_last }, { CreatedAtTimestamp: desc }]
    limit: 1
  ) {
    ...TestResultParts
    submitter {
      FriendlyName
    }
    files {
      ...RelationFileParts
    }
    assessmentParents(where: { ParentType: { _eq: assessment } }) {
      assessment {
        ...AssessmentParts
        completedByUser {
          FriendlyName
        }
      }
    }
  }
}

fragment TestResultParts on test_result {
  Description
  DesignEffectiveness
  Id
  OverallEffectiveness
  ParentControlId
  PerformanceEffectiveness
  Submitter
  TestDate
  TestType
  CreatedAtTimestamp
  ModifiedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  CustomAttributeData
  SequentialId
}

fragment RelationFileParts on relation_file {
  ParentId
  ChangeRequestFileOperation
  file {
    ...FileParts
  }
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}

fragment AssessmentParts on assessment {
  ActualCompletionDate
  CompletedByUser
  CreatedAtTimestamp
  CreatedByUser
  CustomAttributeData
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  NextTestDate
  OriginatingItemId
  SequentialId
  StartDate
  Summary
  TargetCompletionDate
  Title
  Status
  Outcome
}`) as any;
export type GetLatestTestResultsByControlIdQuery = any;
export type GetLatestTestResultsByControlIdQueryVariables = any;
export type GetGetLatestTestResultsByControlIdQuery = any;
export type getLatestTestResultsByControlIdQuery = any;
export type getLatestTestResultsByControlIdQueryVariables = any;

export const GetTestResultAuditByIdDocument = parse(`query getTestResultAuditById(\$Id: uuid) {
  test_result_audit(where: { Id: { _eq: \$Id } }) {
    Description
    DesignEffectiveness
    Id
    OverallEffectiveness
    ParentControlId
    PerformanceEffectiveness
    Submitter
    TestDate
    TestType
    CreatedAtTimestamp
    ModifiedAtTimestamp
    Title
    CreatedByUser
    ModifiedByUser
    CustomAttributeData
    SequentialId
  }
}`) as any;
export type GetTestResultAuditByIdQuery = any;
export type GetTestResultAuditByIdQueryVariables = any;
export type GetGetTestResultAuditByIdQuery = any;
export type getTestResultAuditByIdQuery = any;
export type getTestResultAuditByIdQueryVariables = any;

export const GetTestResultByIdDocument = parse(`query getTestResultById(\$Id: uuid) {
  test_result(where: { Id: { _eq: \$Id } }) {
    ...TestResultParts
    files {
      ...RelationFileParts
    }
  }
}

fragment TestResultParts on test_result {
  Description
  DesignEffectiveness
  Id
  OverallEffectiveness
  ParentControlId
  PerformanceEffectiveness
  Submitter
  TestDate
  TestType
  CreatedAtTimestamp
  ModifiedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  CustomAttributeData
  SequentialId
}

fragment RelationFileParts on relation_file {
  ParentId
  ChangeRequestFileOperation
  file {
    ...FileParts
  }
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}`) as any;
export type GetTestResultByIdQuery = any;
export type GetTestResultByIdQueryVariables = any;
export type GetGetTestResultByIdQuery = any;
export type getTestResultByIdQuery = any;
export type getTestResultByIdQueryVariables = any;

export const GetTestResultsDocument = parse(`query getTestResults(
  \$where: test_result_bool_exp! = {
    RatingType: { _in: ["assessment", "rating"] }
  }
) {
  test_result(where: \$where) {
    ...TestResultParts
    submitter {
      FriendlyName
    }
    parent {
      Id
      Title
      SequentialId
      tags {
        ...TagParts
      }
      departments {
        ...DepartmentParts
      }
      schedule {
        ManualDueDate
      }
    }
    createdByUser {
      FriendlyName
    }
    files_aggregate {
      aggregate {
        count
      }
    }
  }
}

fragment TestResultParts on test_result {
  Description
  DesignEffectiveness
  Id
  OverallEffectiveness
  ParentControlId
  PerformanceEffectiveness
  Submitter
  TestDate
  TestType
  CreatedAtTimestamp
  ModifiedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  CustomAttributeData
  SequentialId
}

fragment TagParts on tag {
  type {
    Description
    Name
  }
  ParentId
  TagTypeId
}

fragment DepartmentParts on department {
  type {
    Description
    Name
  }
  ParentId
  DepartmentTypeId
}`) as any;
export type GetTestResultsQuery = any;
export type GetTestResultsQueryVariables = any;
export type GetGetTestResultsQuery = any;
export type getTestResultsQuery = any;
export type getTestResultsQueryVariables = any;

export const GetTestResultsByControlIdDocument = parse(`query getTestResultsByControlId(\$controlId: uuid) {
  test_result(
    where: {
      ParentControlId: { _eq: \$controlId }
      RatingType: { _in: ["assessment", "rating"] }
    }
  ) {
    ...TestResultParts
    submitter {
      FriendlyName
    }
    files {
      ...RelationFileParts
    }
    assessmentParents(where: { ParentType: { _eq: assessment } }) {
      assessment {
        ...AssessmentParts
        completedByUser {
          FriendlyName
        }
      }
    }
  }
}

fragment TestResultParts on test_result {
  Description
  DesignEffectiveness
  Id
  OverallEffectiveness
  ParentControlId
  PerformanceEffectiveness
  Submitter
  TestDate
  TestType
  CreatedAtTimestamp
  ModifiedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  CustomAttributeData
  SequentialId
}

fragment RelationFileParts on relation_file {
  ParentId
  ChangeRequestFileOperation
  file {
    ...FileParts
  }
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}

fragment AssessmentParts on assessment {
  ActualCompletionDate
  CompletedByUser
  CreatedAtTimestamp
  CreatedByUser
  CustomAttributeData
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  NextTestDate
  OriginatingItemId
  SequentialId
  StartDate
  Summary
  TargetCompletionDate
  Title
  Status
  Outcome
}`) as any;
export type GetTestResultsByControlIdQuery = any;
export type GetTestResultsByControlIdQueryVariables = any;
export type GetGetTestResultsByControlIdQuery = any;
export type getTestResultsByControlIdQuery = any;
export type getTestResultsByControlIdQueryVariables = any;

export const GetWidgetTestResultsDocument = parse(`query getWidgetTestResults(
  \$where: test_result_bool_exp!
  \$controlWhere: control_bool_exp
) {
  control(where: \$controlWhere) {
    testResults(where: \$where) {
      ...TestResultParts
      submitter {
        FriendlyName
      }
      parent {
        Id
        Title
        tags {
          ...TagParts
        }
        departments {
          ...DepartmentParts
        }
        schedule {
          ManualDueDate
        }
      }
      createdByUser {
        FriendlyName
      }
      files_aggregate {
        aggregate {
          count
        }
      }
    }
  }
}

fragment TestResultParts on test_result {
  Description
  DesignEffectiveness
  Id
  OverallEffectiveness
  ParentControlId
  PerformanceEffectiveness
  Submitter
  TestDate
  TestType
  CreatedAtTimestamp
  ModifiedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  CustomAttributeData
  SequentialId
}

fragment TagParts on tag {
  type {
    Description
    Name
  }
  ParentId
  TagTypeId
}

fragment DepartmentParts on department {
  type {
    Description
    Name
  }
  ParentId
  DepartmentTypeId
}`) as any;
export type GetWidgetTestResultsQuery = any;
export type GetWidgetTestResultsQueryVariables = any;
export type GetGetWidgetTestResultsQuery = any;
export type getWidgetTestResultsQuery = any;
export type getWidgetTestResultsQueryVariables = any;

export const InsertControlTestResultDocument = parse(`mutation insertControlTestResult(
  \$Description: String
  \$DesignEffectiveness: Int
  \$OverallEffectiveness: Int
  \$ControlIds: [uuid!]!
  \$PerformanceEffectiveness: Int
  \$AssessmentId: uuid
  \$Submitter: String
  \$TestDate: timestamptz
  \$TestType: String
  \$Title: String
  \$CustomAttributeData: jsonb
) {
  insertControlTestResult(
    Description: \$Description
    DesignEffectiveness: \$DesignEffectiveness
    OverallEffectiveness: \$OverallEffectiveness
    ControlIds: \$ControlIds
    PerformanceEffectiveness: \$PerformanceEffectiveness
    Submitter: \$Submitter
    TestDate: \$TestDate
    TestType: \$TestType
    Title: \$Title
    AssessmentId: \$AssessmentId
    CustomAttributeData: \$CustomAttributeData
  ) {
    Ids
  }
}`) as any;
export type InsertControlTestResultMutation = any;
export type InsertControlTestResultMutationVariables = any;
export type insertControlTestResultMutation = any;
export type insertControlTestResultMutationVariables = any;

export const TestResultPartsDocument = parse(`fragment TestResultParts on test_result {
  Description
  DesignEffectiveness
  Id
  OverallEffectiveness
  ParentControlId
  PerformanceEffectiveness
  Submitter
  TestDate
  TestType
  CreatedAtTimestamp
  ModifiedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  CustomAttributeData
  SequentialId
}`) as any;
export type TestResultPartsFragment = any;

export const ControlTestInternalAuditResultPartsDocument = parse(`fragment ControlTestInternalAuditResultParts on control_test_internal_audit_result {
  Description
  DesignEffectiveness
  Id
  OverallEffectiveness
  ParentControlId
  PerformanceEffectiveness
  Submitter
  TestDate
  TestType
  CreatedAtTimestamp
  ModifiedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  CustomAttributeData
  SequentialId
}`) as any;
export type ControlTestInternalAuditResultPartsFragment = any;

export const ControlTestSecondLineResultPartsDocument = parse(`fragment ControlTestSecondLineResultParts on control_test_second_line_result {
  Description
  DesignEffectiveness
  Id
  OverallEffectiveness
  ParentControlId
  PerformanceEffectiveness
  Submitter
  TestDate
  TestType
  CreatedAtTimestamp
  ModifiedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  CustomAttributeData
  SequentialId
}`) as any;
export type ControlTestSecondLineResultPartsFragment = any;

export const UpdateTestResultDocument = parse(`mutation updateTestResult(\$object: UpdateTestResultInput) {
  updateTestResultApi(object: \$object) {
    Id
  }
}`) as any;
export type UpdateTestResultMutation = any;
export type UpdateTestResultMutationVariables = any;
export type updateTestResultMutation = any;
export type updateTestResultMutationVariables = any;

export const TppGetResponseByIdDocument = parse(`subscription tppGetResponseById(\$Id: uuid!) {
  third_party_response_by_pk(Id: \$Id) {
    ...TppThirdPartyResponseParts

    questionnaireTemplateVersion {
      Id
      Version
      Schema
      UISchema

      parent {
        Id
        Title
      }
    }

    files {
      file {
        ContentType
        FileName
        FileSize
        Id
        CreatedAtTimestamp
        CreatedByUser
        ModifiedAtTimestamp
        ModifiedByUser
        Meta
      }
    }
  }
}

fragment TppThirdPartyResponseParts on third_party_response {
  Id
  Status
  ResponseData
  ParentId
  StartDate
  ExpiresAt
  QuestionnaireTemplateVersionId
  ModifiedByUser
  ModifiedAtTimestamp
  CreatedByUser
  CreatedAtTimestamp
}`) as any;
export type TppGetResponseByIdSubscription = any;
export type TppGetResponseByIdSubscriptionVariables = any;

export const TppGetResponsesDocument = parse(`subscription tppGetResponses {
  third_party_response {
    ...TppThirdPartyResponseParts

    questionnaireTemplateVersion {
      Id
      Version

      parent {
        Id
        Title
      }
    }
  }
}

fragment TppThirdPartyResponseParts on third_party_response {
  Id
  Status
  ResponseData
  ParentId
  StartDate
  ExpiresAt
  QuestionnaireTemplateVersionId
  ModifiedByUser
  ModifiedAtTimestamp
  CreatedByUser
  CreatedAtTimestamp
}`) as any;
export type TppGetResponsesSubscription = any;
export type TppGetResponsesSubscriptionVariables = any;

export const TppThirdPartyResponsePartsDocument = parse(`fragment TppThirdPartyResponseParts on third_party_response {
  Id
  Status
  ResponseData
  ParentId
  StartDate
  ExpiresAt
  QuestionnaireTemplateVersionId
  ModifiedByUser
  ModifiedAtTimestamp
  CreatedByUser
  CreatedAtTimestamp
}`) as any;
export type TppThirdPartyResponsePartsFragment = any;

export const TppUpdateThirdPartyResponseDocument = parse(`mutation tppUpdateThirdPartyResponse(\$Id: uuid!, \$response: jsonb!, \$status: third_party_response_status_enum!) {
  update_third_party_response_by_pk(pk_columns: { Id: \$Id }, _set: { ResponseData: \$response, Status: \$status }) {
    Id
  }
}`) as any;
export type TppUpdateThirdPartyResponseMutation = any;
export type TppUpdateThirdPartyResponseMutationVariables = any;
export type tppUpdateThirdPartyResponseMutation = any;
export type tppUpdateThirdPartyResponseMutationVariables = any;

export const CreateThirdPartyDocument = parse(`mutation createThirdParty(\$object: InsertThirdPartyInput!) {
  insertThirdPartyApi(object: \$object) {
    Id
  }
}`) as any;
export type CreateThirdPartyMutation = any;
export type CreateThirdPartyMutationVariables = any;
export type createThirdPartyMutation = any;
export type createThirdPartyMutationVariables = any;

export const DeleteThirdPartyDocument = parse(`mutation deleteThirdParty(\$Id: uuid!) {
  delete_questionnaire_invite(where: { ThirdPartyId: { _eq: \$Id } }) {
    affected_rows
  }
  delete_third_party_response(where: { ParentId: { _eq: \$Id } }) {
    affected_rows
  }
  delete_third_party_by_pk(Id: \$Id) {
    Id
  }
}`) as any;
export type DeleteThirdPartyMutation = any;
export type DeleteThirdPartyMutationVariables = any;
export type deleteThirdPartyMutation = any;
export type deleteThirdPartyMutationVariables = any;

export const GetThirdPartiesDocument = parse(`query getThirdParties(\$where: third_party_bool_exp! = {}) {
  third_party(where: \$where) {
    ...ThirdPartyParts
    owners {
      ...OwnerParts
    }
    contributors {
      ...ContributorParts
    }
    ownerGroups {
      ...OwnerGroupParts
    }
    contributorGroups {
      ...ContributorGroupParts
    }
    tags {
      ...TagParts
    }
    departments {
      ...DepartmentParts
    }
  }
}

fragment ThirdPartyParts on third_party {
  Id
  SequentialId
  Title
  Description
  CompanyName
  CompaniesHouseNumber
  Address
  CityTown
  Postcode
  Country
  PrimaryContactName
  ContactName
  ContactEmail
  CompanyDomain
  Type
  Status
  Criticality
  CreatedByUser
  CustomAttributeData
  ModifiedByUser
  CreatedAtTimestamp
  ModifiedAtTimestamp
}

fragment OwnerParts on owner {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment ContributorParts on contributor {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment OwnerGroupParts on owner_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment ContributorGroupParts on contributor_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment TagParts on tag {
  type {
    Description
    Name
  }
  ParentId
  TagTypeId
}

fragment DepartmentParts on department {
  type {
    Description
    Name
  }
  ParentId
  DepartmentTypeId
}`) as any;
export type GetThirdPartiesQuery = any;
export type GetThirdPartiesQueryVariables = any;
export type GetGetThirdPartiesQuery = any;
export type getThirdPartiesQuery = any;
export type getThirdPartiesQueryVariables = any;

export const GetThirdPartyByIdDocument = parse(`query getThirdPartyById(\$Id: uuid!) {
  third_party: third_party_by_pk(Id: \$Id) {
    ...ThirdPartyParts
    owners {
      ...OwnerParts
    }
    contributors {
      ...ContributorParts
    }
    ownerGroups {
      ...OwnerGroupParts
    }
    contributorGroups {
      ...ContributorGroupParts
    }
    ancestorContributors {
      ...AncestorContributorParts
    }
    tags {
      ...TagParts
    }
    departments {
      ...DepartmentParts
    }
    files {
      ...RelationFileParts
    }
  }
}

fragment ThirdPartyParts on third_party {
  Id
  SequentialId
  Title
  Description
  CompanyName
  CompaniesHouseNumber
  Address
  CityTown
  Postcode
  Country
  PrimaryContactName
  ContactName
  ContactEmail
  CompanyDomain
  Type
  Status
  Criticality
  CreatedByUser
  CustomAttributeData
  ModifiedByUser
  CreatedAtTimestamp
  ModifiedAtTimestamp
}

fragment OwnerParts on owner {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment ContributorParts on contributor {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment OwnerGroupParts on owner_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment ContributorGroupParts on contributor_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment AncestorContributorParts on ancestor_contributor {
  ContributorType
  UserId
  Id
  AncestorId
  UserGroupId
  user {
    FriendlyName
  }
  user_group {
    Name
  }
}

fragment TagParts on tag {
  type {
    Description
    Name
  }
  ParentId
  TagTypeId
}

fragment DepartmentParts on department {
  type {
    Description
    Name
  }
  ParentId
  DepartmentTypeId
}

fragment RelationFileParts on relation_file {
  ParentId
  ChangeRequestFileOperation
  file {
    ...FileParts
  }
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}`) as any;
export type GetThirdPartyByIdQuery = any;
export type GetThirdPartyByIdQueryVariables = any;
export type GetGetThirdPartyByIdQuery = any;
export type getThirdPartyByIdQuery = any;
export type getThirdPartyByIdQueryVariables = any;

export const GetThirdPartyResponseByIdDocument = parse(`query getThirdPartyResponseById(\$Id: uuid!) {
  third_party_response_by_pk(Id: \$Id) {
    ResponseData
    Status
    CreatedByUser
    ModifiedByUser
    CreatedAtTimestamp
    ModifiedAtTimestamp
    QuestionnaireTemplateVersionId
    ParentId
    StartDate
    ExpiresAt

    invitees {
      UserId
      UserEmail
      user {
        Email
      }
    }

    thirdParty {
      Id
      Title
      ancestorContributors {
        ...AncestorContributorParts
      }
    }

    questionnaireTemplateVersion {
      Id
      Version
      Status
      Schema
      UISchema
      parent {
        Title
      }
    }

    files {
      file {
        ContentType
        FileName
        FileSize
        Id
        CreatedAtTimestamp
        CreatedByUser
        ModifiedAtTimestamp
        ModifiedByUser
        Meta
      }
    }
  }
}

fragment AncestorContributorParts on ancestor_contributor {
  ContributorType
  UserId
  Id
  AncestorId
  UserGroupId
  user {
    FriendlyName
  }
  user_group {
    Name
  }
}`) as any;
export type GetThirdPartyResponseByIdQuery = any;
export type GetThirdPartyResponseByIdQueryVariables = any;
export type GetGetThirdPartyResponseByIdQuery = any;
export type getThirdPartyResponseByIdQuery = any;
export type getThirdPartyResponseByIdQueryVariables = any;

export const GetThirdPartyResponseSubscriptionByIdDocument = parse(`subscription getThirdPartyResponseSubscriptionById(\$Id: uuid!) {
  third_party_response_by_pk(Id: \$Id) {
    ResponseData
    Status
    CreatedByUser
    ModifiedByUser
    CreatedAtTimestamp
    ModifiedAtTimestamp
    QuestionnaireTemplateVersionId
    ParentId
    StartDate
    ExpiresAt

    invitees {
      UserId
      UserEmail
      user {
        Email
      }
    }

    thirdParty {
      Id
      Title
      ancestorContributors {
        ...AncestorContributorParts
      }
    }

    questionnaireTemplateVersion {
      Id
      Version
      Status
      Schema
      UISchema
      parent {
        Title
      }
    }

    files {
      file {
        ContentType
        FileName
        FileSize
        Id
        CreatedAtTimestamp
        CreatedByUser
        ModifiedAtTimestamp
        ModifiedByUser
        Meta
      }
    }
  }
}

fragment AncestorContributorParts on ancestor_contributor {
  ContributorType
  UserId
  Id
  AncestorId
  UserGroupId
  user {
    FriendlyName
  }
  user_group {
    Name
  }
}`) as any;
export type GetThirdPartyResponseSubscriptionByIdSubscription = any;
export type GetThirdPartyResponseSubscriptionByIdSubscriptionVariables = any;

export const GetThirdPartyResponsesDocument = parse(`subscription getThirdPartyResponses {
  third_party_response {
    Id
    ResponseData
    Status
    CreatedByUser
    ModifiedByUser
    CreatedAtTimestamp
    ModifiedAtTimestamp
    QuestionnaireTemplateVersionId
    ParentId
    StartDate
    ExpiresAt
    invitees {
      UserId
      UserEmail
      user {
        Email
      }
    }
    thirdParty {
      Id
      Title
    }
    questionnaireTemplateVersion {
      Id
      Version
      Status
      parent {
        Title
      }
    }
  }
}`) as any;
export type GetThirdPartyResponsesSubscription = any;
export type GetThirdPartyResponsesSubscriptionVariables = any;

export const GetThirdPartyResponsesByThirdPartyDocument = parse(`subscription getThirdPartyResponsesByThirdParty(\$ThirdPartyId: uuid!) {
  third_party_response(where: { ParentId: { _eq: \$ThirdPartyId } }) {
    ...ThirdPartyResponseParts
    invitees {
      UserEmail
      UserId
      user {
        FriendlyName
      }
    }
    createdByUser {
      FriendlyName
    }
    modifiedByUser {
      FriendlyName
    }
    questionnaireTemplateVersion {
      Id
      Version
      parent {
        Title
      }
    }
  }
}

fragment ThirdPartyResponseParts on third_party_response {
  Id
  CreatedAtTimestamp
  ModifiedAtTimestamp
  ParentId
  QuestionnaireTemplateVersionId
  Status
  ResponseData
  StartDate
  ExpiresAt
}`) as any;
export type GetThirdPartyResponsesByThirdPartySubscription = any;
export type GetThirdPartyResponsesByThirdPartySubscriptionVariables = any;

export const ThirdPartyPartsDocument = parse(`fragment ThirdPartyParts on third_party {
  Id
  SequentialId
  Title
  Description
  CompanyName
  CompaniesHouseNumber
  Address
  CityTown
  Postcode
  Country
  PrimaryContactName
  ContactName
  ContactEmail
  CompanyDomain
  Type
  Status
  Criticality
  CreatedByUser
  CustomAttributeData
  ModifiedByUser
  CreatedAtTimestamp
  ModifiedAtTimestamp
}`) as any;
export type ThirdPartyPartsFragment = any;

export const ThirdPartyResponsePartsDocument = parse(`fragment ThirdPartyResponseParts on third_party_response {
  Id
  CreatedAtTimestamp
  ModifiedAtTimestamp
  ParentId
  QuestionnaireTemplateVersionId
  Status
  ResponseData
  StartDate
  ExpiresAt
}`) as any;
export type ThirdPartyResponsePartsFragment = any;

export const UpdateThirdPartyDocument = parse(`mutation updateThirdParty(\$object: UpdateThirdPartyInput!) {
  updateThirdPartyApi(object: \$object) {
    Id
  }
}`) as any;
export type UpdateThirdPartyMutation = any;
export type UpdateThirdPartyMutationVariables = any;
export type updateThirdPartyMutation = any;
export type updateThirdPartyMutationVariables = any;

export const UpdateThirdPartyResponseDocument = parse(`mutation updateThirdPartyResponse(
  \$Id: uuid!
  \$Status: third_party_response_status_enum!
) {
  update_third_party_response_by_pk(pk_columns: { Id: \$Id }, _set: { Status: \$Status }) {
    Id
  }
}`) as any;
export type UpdateThirdPartyResponseMutation = any;
export type UpdateThirdPartyResponseMutationVariables = any;
export type updateThirdPartyResponseMutation = any;
export type updateThirdPartyResponseMutationVariables = any;

export const UpdateThirdPartyResponseStatusDocument = parse(`mutation updateThirdPartyResponseStatus(
  \$Action: third_party_response_enum_action!
  \$ResponseIds: [uuid!]!
  \$Reason: String
  \$RequestType: String
  \$ShareWithRespondents: Boolean
  \$ThirdPartyId: uuid!
) {
  updateThirdPartyResponseStatusAction(
    Action: \$Action
    ResponseIds: \$ResponseIds
    Reason: \$Reason
    RequestType: \$RequestType
    ShareWithRespondents: \$ShareWithRespondents
    ThirdPartyId: \$ThirdPartyId
  ) {
    affected_rows
  }
}`) as any;
export type UpdateThirdPartyResponseStatusMutation = any;
export type UpdateThirdPartyResponseStatusMutationVariables = any;
export type updateThirdPartyResponseStatusMutation = any;
export type updateThirdPartyResponseStatusMutationVariables = any;

export const GetThirdPartyContactsByThirdPartyIdDocument = parse(`query getThirdPartyContactsByThirdPartyId(\$ThirdPartyId: uuid!) {
  third_party_contact(
    where: { ThirdPartyId: { _eq: \$ThirdPartyId } }
    order_by: { CreatedAtTimestamp: desc }
  ) {
    Id
    ThirdPartyId
    Email
    Name
    JobTitle
    IsRevoked
    PasswordSetAtTimestamp
    user {
      LastSeen
    }
  }
}`) as any;
export type GetThirdPartyContactsByThirdPartyIdQuery = any;
export type GetThirdPartyContactsByThirdPartyIdQueryVariables = any;
export type GetGetThirdPartyContactsByThirdPartyIdQuery = any;
export type getThirdPartyContactsByThirdPartyIdQuery = any;
export type getThirdPartyContactsByThirdPartyIdQueryVariables = any;

export const GetActiveThirdPartyContactsDocument = parse(`query getActiveThirdPartyContacts(\$ThirdPartyId: uuid!) {
  third_party_contact(
    where: { ThirdPartyId: { _eq: \$ThirdPartyId }, IsRevoked: { _eq: false } }
    order_by: { Name: asc_nulls_last, Email: asc }
  ) {
    Id
    Email
    Name
    JobTitle
  }
}`) as any;
export type GetActiveThirdPartyContactsQuery = any;
export type GetActiveThirdPartyContactsQueryVariables = any;
export type GetGetActiveThirdPartyContactsQuery = any;
export type getActiveThirdPartyContactsQuery = any;
export type getActiveThirdPartyContactsQueryVariables = any;

export const InsertThirdPartyContactApiDocument = parse(`mutation insertThirdPartyContactApi(
  \$ThirdPartyId: uuid!
  \$Email: String!
  \$Name: String
  \$JobTitle: String
) {
  insertThirdPartyContactApi(
    ThirdPartyId: \$ThirdPartyId
    Email: \$Email
    Name: \$Name
    JobTitle: \$JobTitle
  ) {
    Id
  }
}`) as any;
export type InsertThirdPartyContactApiMutation = any;
export type InsertThirdPartyContactApiMutationVariables = any;
export type insertThirdPartyContactApiMutation = any;
export type insertThirdPartyContactApiMutationVariables = any;

export const RevokeThirdPartyContactAccessDocument = parse(`mutation RevokeThirdPartyContactAccess(\$ContactIds: [uuid!]!) {
  revokeThirdPartyContactAccess(ContactIds: \$ContactIds) {
    results {
      Id
      IsRevoked
      Message
    }
  }
}`) as any;
export type RevokeThirdPartyContactAccessMutation = any;
export type RevokeThirdPartyContactAccessMutationVariables = any;

export const ContributorGroupPartsDocument = parse(`fragment ContributorGroupParts on contributor_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}`) as any;
export type ContributorGroupPartsFragment = any;

export const DeleteUserGroupUsersDocument = parse(`mutation DeleteUserGroupUsers(
  \$UserIds: [String!] = ""
  \$UserGroupId: uuid = ""
) {
  delete_user_group_user(
    where: { UserId: { _in: \$UserIds }, UserGroupId: { _eq: \$UserGroupId } }
  ) {
    affected_rows
  }
}`) as any;
export type DeleteUserGroupUsersMutation = any;
export type DeleteUserGroupUsersMutationVariables = any;

export const DeleteUserGroupsDocument = parse(`mutation deleteUserGroups(\$UserGroupIds: [uuid!]!) {
  deleteUserGroups(Ids: \$UserGroupIds){
    affected_rows
  }
}`) as any;
export type DeleteUserGroupsMutation = any;
export type DeleteUserGroupsMutationVariables = any;
export type deleteUserGroupsMutation = any;
export type deleteUserGroupsMutationVariables = any;

export const GetUserGroupByIdDocument = parse(`query GetUserGroupById(\$Id: uuid!) {
  user_group(where: { Id: { _eq: \$Id } }) {
    Id
    Name
    Description
    Email
    OwnerContributor
    ModifiedAtTimestamp
    approvers_aggregate {
      aggregate {
        count
      }
    }
  }
}`) as any;
export type GetUserGroupByIdQuery = any;
export type GetUserGroupByIdQueryVariables = any;
export type GetGetUserGroupByIdQuery = any;

export const GetUserGroupsDocument = parse(`query getUserGroups {
  user_group(order_by: { Name: asc }) {
    Id
    Name
    Email
    Description
    OwnerContributor
    createdByUser {
      FriendlyName
    }
    CreatedAtTimestamp
    modifiedByUser {
      FriendlyName
    }
    ModifiedAtTimestamp
    users_aggregate {
      aggregate {
        count
      }
    }
  }
}`) as any;
export type GetUserGroupsQuery = any;
export type GetUserGroupsQueryVariables = any;
export type GetGetUserGroupsQuery = any;
export type getUserGroupsQuery = any;
export type getUserGroupsQueryVariables = any;

export const GetUserGroupsWithApproversDocument = parse(`query getUserGroupsWithApprovers {
  user_group(order_by: { Name: asc }) {
    Id
    Name
    Email
    Description
    OwnerContributor
    createdByUser {
      FriendlyName
    }
    CreatedAtTimestamp
    modifiedByUser {
      FriendlyName
    }
    ModifiedAtTimestamp
    users_aggregate {
      aggregate {
        count
      }
    }
    approvers_aggregate {
      aggregate {
        count
      }
    }
  }
}`) as any;
export type GetUserGroupsWithApproversQuery = any;
export type GetUserGroupsWithApproversQueryVariables = any;
export type GetGetUserGroupsWithApproversQuery = any;
export type getUserGroupsWithApproversQuery = any;
export type getUserGroupsWithApproversQueryVariables = any;

export const GetUsersByGroupIdDocument = parse(`query GetUsersByGroupId(\$GroupId: uuid!) {
  user_group(where: { Id: { _eq: \$GroupId } }) {
    users(order_by: { CreatedAtTimestamp: desc }) {
      authUsers {
        Id
        FirstName
        LastName
        Email
        RoleKey
        Status
        FriendlyName
        organisationusers {
          Status
        }
      }
      CreatedAtTimestamp
      createdByUser {
        FriendlyName
      }
    }
  }
}`) as any;
export type GetUsersByGroupIdQuery = any;
export type GetUsersByGroupIdQueryVariables = any;
export type GetGetUsersByGroupIdQuery = any;

export const InsertUserGroupDocument = parse(`mutation InsertUserGroup(
  \$Name: String!
  \$Email: String
  \$Description: String
  \$OwnerContributor: Boolean
) {
  insert_user_group_one(
    object: {
      Name: \$Name
      Email: \$Email
      Description: \$Description
      OwnerContributor: \$OwnerContributor
    }
  ) {
    Id
  }
}`) as any;
export type InsertUserGroupMutation = any;
export type InsertUserGroupMutationVariables = any;

export const InsertUserGroupUsersDocument = parse(`mutation InsertUserGroupUsers(\$objects: [user_group_user_insert_input!]!) {
  insert_user_group_user(
    objects: \$objects
    on_conflict: { constraint: user_group_user_pkey, update_columns: [] }
  ) {
    affected_rows
  }
}`) as any;
export type InsertUserGroupUsersMutation = any;
export type InsertUserGroupUsersMutationVariables = any;

export const OwnerGroupPartsDocument = parse(`fragment OwnerGroupParts on owner_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}`) as any;
export type OwnerGroupPartsFragment = any;

export const UpdateUserGroupDocument = parse(`mutation UpdateUserGroup(
  \$Id: uuid!
  \$OriginalTimestamp: timestamptz!
  \$Name: String
  \$Email: String
  \$Description: String
  \$OwnerContributor: Boolean
) {
  update_user_group(
    where: {
      Id: { _eq: \$Id }
      ModifiedAtTimestamp: { _eq: \$OriginalTimestamp }
    }
    _set: {
      Name: \$Name
      Email: \$Email
      Description: \$Description
      OwnerContributor: \$OwnerContributor
    }
  ) {
    affected_rows
  }
}`) as any;
export type UpdateUserGroupMutation = any;
export type UpdateUserGroupMutationVariables = any;

export const GetUserSearchPreferencesDocument = parse(`query getUserSearchPreferences {
  user_search_preferences {
    RecentUserIds
    ShowGroups
    FilterByActivePlatformUsers
    ShowUserPlatformRole
    ShowUserJobTitle
    ShowDirectoryDepartment
    ShowUserLocation
    ShowUserEmail
    ShowArchivedUsers
    ShowInheritedContributors
  }
}`) as any;
export type GetUserSearchPreferencesQuery = any;
export type GetUserSearchPreferencesQueryVariables = any;
export type GetGetUserSearchPreferencesQuery = any;
export type getUserSearchPreferencesQuery = any;
export type getUserSearchPreferencesQueryVariables = any;

export const GetUserSearchPreferencesAuditByIdDocument = parse(`query getUserSearchPreferencesAuditById(\$Id: String!) {
  user_search_preferences_audit(where: {
    CreatedByUser: {
      _eq: \$Id
    }
  }) {
    RecentUserIds
    ShowGroups
    FilterByActivePlatformUsers
    ShowUserPlatformRole
    ShowUserJobTitle
    ShowDirectoryDepartment
    ShowUserLocation
    ShowUserEmail
    ShowArchivedUsers
    CreatedByUser
    CreatedAtTimestamp
    ModifiedByUser
    ModifiedAtTimestamp
  }
}`) as any;
export type GetUserSearchPreferencesAuditByIdQuery = any;
export type GetUserSearchPreferencesAuditByIdQueryVariables = any;
export type GetGetUserSearchPreferencesAuditByIdQuery = any;
export type getUserSearchPreferencesAuditByIdQuery = any;
export type getUserSearchPreferencesAuditByIdQueryVariables = any;

export const UpsertRecentUsersDocument = parse(`mutation upsertRecentUsers(\$RecentUserIds: [String!]!) {
  insert_user_search_preferences(
    objects: [{ RecentUserIds: \$RecentUserIds }]
    on_conflict: {
      constraint: recent_users_pkey
      update_columns: [RecentUserIds]
    }
  ) {
    affected_rows
  }
}`) as any;
export type UpsertRecentUsersMutation = any;
export type UpsertRecentUsersMutationVariables = any;
export type upsertRecentUsersMutation = any;
export type upsertRecentUsersMutationVariables = any;

export const UpsertUserSearchPreferencesDocument = parse(`mutation upsertUserSearchPreferences(
  \$ShowGroups: Boolean!
  \$FilterByActivePlatformUsers: Boolean!
  \$ShowUserPlatformRole: Boolean!
  \$ShowUserJobTitle: Boolean!
  \$ShowDirectoryDepartment: Boolean!
  \$ShowUserLocation: Boolean!
  \$ShowUserEmail: Boolean!
  \$ShowArchivedUsers: Boolean!
  \$ShowInheritedContributors: Boolean!
) {
  insert_user_search_preferences(
    objects: [
      {
        ShowGroups: \$ShowGroups
        FilterByActivePlatformUsers: \$FilterByActivePlatformUsers
        ShowUserPlatformRole: \$ShowUserPlatformRole
        ShowUserJobTitle: \$ShowUserJobTitle
        ShowDirectoryDepartment: \$ShowDirectoryDepartment
        ShowUserLocation: \$ShowUserLocation
        ShowUserEmail: \$ShowUserEmail
        ShowArchivedUsers: \$ShowArchivedUsers
        ShowInheritedContributors: \$ShowInheritedContributors
      }
    ]
    on_conflict: {
      constraint: recent_users_pkey
      update_columns: [
        ShowGroups
        FilterByActivePlatformUsers
        ShowUserPlatformRole
        ShowUserJobTitle
        ShowDirectoryDepartment
        ShowUserLocation
        ShowUserEmail
        ShowArchivedUsers
        ShowInheritedContributors
      ]
    }
  ) {
    affected_rows
  }
}`) as any;
export type UpsertUserSearchPreferencesMutation = any;
export type UpsertUserSearchPreferencesMutationVariables = any;
export type upsertUserSearchPreferencesMutation = any;
export type upsertUserSearchPreferencesMutationVariables = any;

export const GetUserTablePreferencesDocument = parse(`query getUserTablePreferences(\$TableId: String!) {
  user_table_preferences(where: { TableId: { _eq: \$TableId } }) {
    Preferences
  }
}`) as any;
export type GetUserTablePreferencesQuery = any;
export type GetUserTablePreferencesQueryVariables = any;
export type GetGetUserTablePreferencesQuery = any;
export type getUserTablePreferencesQuery = any;
export type getUserTablePreferencesQueryVariables = any;

export const UpsertUserTablePreferencesDocument = parse(`mutation upsertUserTablePreferences(\$Preferences: jsonb!, \$TableId: String!) {
  insert_user_table_preferences(
    objects: [{ TableId: \$TableId, Preferences: \$Preferences }]
    on_conflict: {
      constraint: user_table_preferences_pkey
      update_columns: [Preferences]
    }
  ) {
    affected_rows
  }
}`) as any;
export type UpsertUserTablePreferencesMutation = any;
export type UpsertUserTablePreferencesMutationVariables = any;
export type upsertUserTablePreferencesMutation = any;
export type upsertUserTablePreferencesMutationVariables = any;

export const ContributorPartsDocument = parse(`fragment ContributorParts on contributor {
  UserId
  user {
    FriendlyName
    Id
  }
}`) as any;
export type ContributorPartsFragment = any;

export const GetAuthUserByIdDocument = parse(`query GetAuthUserById(\$Id: String!) {
  auth_user_by_pk(Id: \$Id) {
    Id
    FirstName
    LastName
    FriendlyName
    Email
    Status
    CreatedOn
    DisplayName
    JobTitle
    Department
    OfficeLocation
    RoleKey
    organisationusers {
      RoleKey
      LastSeen
      External_Id
    }
  }
}`) as any;
export type GetAuthUserByIdQuery = any;
export type GetAuthUserByIdQueryVariables = any;
export type GetGetAuthUserByIdQuery = any;

export const GetAuthUserByIdWithRolesDocument = parse(`query GetAuthUserByIdWithRoles(\$Id: String!) {
  auth_user_by_pk(Id: \$Id) {
    Id
    FirstName
    LastName
    FriendlyName
    Email
    Status
    CreatedOn
    DisplayName
    JobTitle
    Department
    OfficeLocation
    RoleKey
    organisationusers {
      RoleKey
      LastSeen
      External_Id
    }
    customRoles {
      role {
        RoleName
        Id
        Description
      }
    }
  }
}`) as any;
export type GetAuthUserByIdWithRolesQuery = any;
export type GetAuthUserByIdWithRolesQueryVariables = any;
export type GetGetAuthUserByIdWithRolesQuery = any;

export const GetAuthUsersDocument = parse(`query GetAuthUsers(
  \$limit: Int
  \$offset: Int
  \$orderBy: [auth_user_order_by!]
  \$where: auth_user_bool_exp
) {
  auth_user(limit: \$limit, offset: \$offset, order_by: \$orderBy, where: \$where) {
    Id
    FirstName
    LastName
    FriendlyName
    Email
    RoleKey
    Status
    CreatedOn
    LastSeen
    DisplayName
    JobTitle
    Department
    OfficeLocation
    CreatedByUser
    ModifiedByUser
    ModifiedAtTimestamp
    organisationusers {
      RoleKey
      LastSeen
      Status
    }
    userGroupUsers {
      userGroups {
        Id
        Name
      }
    }
    customRoles {
      role {
        RoleName
        Id
        Description
      }
    }
    IsCustomerSupport
  }
  auth_user_aggregate(where: \$where) {
    aggregate {
      count
    }
  }
}`) as any;
export type GetAuthUsersQuery = any;
export type GetAuthUsersQueryVariables = any;
export type GetGetAuthUsersQuery = any;

export const OwnerPartsDocument = parse(`fragment OwnerParts on owner {
  UserId
  user {
    FriendlyName
    Id
  }
}`) as any;
export type OwnerPartsFragment = any;

export const UpdateUserRolesDocument = parse(`mutation UpdateUserRoles(\$userId: String!, \$roleIds: [String!]!) {
  update_user_roles(userId: \$userId, roleIds: \$roleIds) {
    roles {
      id
      name
      description
    }
  }
}`) as any;
export type UpdateUserRolesMutation = any;
export type UpdateUserRolesMutationVariables = any;

export const DeleteWizardDocument = parse(`mutation deleteWizard(\$RiskId: uuid!) {
  deleteWizardById(RiskId: \$RiskId) {
    affected_rows
  }
}`) as any;
export type DeleteWizardMutation = any;
export type DeleteWizardMutationVariables = any;
export type deleteWizardMutation = any;
export type deleteWizardMutationVariables = any;

export const GetWizardByIdDocument = parse(`query getWizardById(\$RiskId: uuid!) {
  wizard(where: { RiskId: { _eq: \$RiskId } }) {
    RiskId
    CurrentStep
    AssessmentId
    ActivityId
    Status
  }
}`) as any;
export type GetWizardByIdQuery = any;
export type GetWizardByIdQueryVariables = any;
export type GetGetWizardByIdQuery = any;
export type getWizardByIdQuery = any;
export type getWizardByIdQueryVariables = any;

export const GetWizardsDocument = parse(`query getWizards {
  wizard {
    RiskId
  }
}`) as any;
export type GetWizardsQuery = any;
export type GetWizardsQueryVariables = any;
export type GetGetWizardsQuery = any;
export type getWizardsQuery = any;
export type getWizardsQueryVariables = any;

export const InsertWizardDocument = parse(`mutation insertWizard(\$object: InsertWizardInput) {
  insertChildWizard(object: \$object) {
    RiskId
  }
}`) as any;
export type InsertWizardMutation = any;
export type InsertWizardMutationVariables = any;
export type insertWizardMutation = any;
export type insertWizardMutationVariables = any;

export const UpdateWizardDocument = parse(`mutation updateWizard(\$object: UpdateWizardInput) {
  updateWizardById(object: \$object) {
    affected_rows
  }
}`) as any;
export type UpdateWizardMutation = any;
export type UpdateWizardMutationVariables = any;
export type updateWizardMutation = any;
export type updateWizardMutationVariables = any;

export const Action_Status_Enum: any = new Proxy({}, { get: (_, key) => typeof key === 'string' ? key.toLowerCase() : undefined });
export type Action_Status_Enum = string;
export const Attestation_Record_Status_Enum: any = new Proxy({}, { get: (_, key) => typeof key === 'string' ? key.toLowerCase() : undefined });
export type Attestation_Record_Status_Enum = string;
export const Approval_Status_Enum: any = new Proxy({}, { get: (_, key) => typeof key === 'string' ? key.toLowerCase() : undefined });
export type Approval_Status_Enum = string;
export const Parent_Type_Enum: any = new Proxy({}, { get: (_, key) => typeof key === 'string' ? key.toLowerCase() : undefined });
export type Parent_Type_Enum = string;
export const Access_Type_Enum: any = new Proxy({}, { get: (_, key) => typeof key === 'string' ? key.toLowerCase() : undefined });
export type Access_Type_Enum = string;
export const Contributor_Type_Enum: any = new Proxy({}, { get: (_, key) => typeof key === 'string' ? key.toLowerCase() : undefined });
export type Contributor_Type_Enum = string;
export const Issue_Assessment_Status_Enum: any = new Proxy({}, { get: (_, key) => typeof key === 'string' ? key.toLowerCase() : undefined });
export type Issue_Assessment_Status_Enum = string;
export const Version_Status_Enum: any = new Proxy({}, { get: (_, key) => typeof key === 'string' ? key.toLowerCase() : undefined });
export type Version_Status_Enum = string;
export const Document_File_Type_Enum: any = new Proxy({}, { get: (_, key) => typeof key === 'string' ? key.toLowerCase() : undefined });
export type Document_File_Type_Enum = string;
export const Change_Request_File_Operation_Enum: any = new Proxy({}, { get: (_, key) => typeof key === 'string' ? key.toLowerCase() : undefined });
export type Change_Request_File_Operation_Enum = string;
export const Assessment_Activity_Status_Enum: any = new Proxy({}, { get: (_, key) => typeof key === 'string' ? key.toLowerCase() : undefined });
export type Assessment_Activity_Status_Enum = string;
export const Assessment_Activity_Type_Enum: any = new Proxy({}, { get: (_, key) => typeof key === 'string' ? key.toLowerCase() : undefined });
export type Assessment_Activity_Type_Enum = string;
export const Assessment_Status_Enum: any = new Proxy({}, { get: (_, key) => typeof key === 'string' ? key.toLowerCase() : undefined });
export type Assessment_Status_Enum = string;
export const Appetite_Model_Enum: any = new Proxy({}, { get: (_, key) => typeof key === 'string' ? key.toLowerCase() : undefined });
export type Appetite_Model_Enum = string;
export const Risk_Scoring_Model_Enum: any = new Proxy({}, { get: (_, key) => typeof key === 'string' ? key.toLowerCase() : undefined });
export type Risk_Scoring_Model_Enum = string;
export const Acceptance_Status_Enum: any = new Proxy({}, { get: (_, key) => typeof key === 'string' ? key.toLowerCase() : undefined });
export type Acceptance_Status_Enum = string;
export const Appetite_Type_Enum: any = new Proxy({}, { get: (_, key) => typeof key === 'string' ? key.toLowerCase() : undefined });
export type Appetite_Type_Enum = string;
export const Appetite_Status_Enum: any = new Proxy({}, { get: (_, key) => typeof key === 'string' ? key.toLowerCase() : undefined });
export type Appetite_Status_Enum = string;
export const Obligation_Type_Enum: any = new Proxy({}, { get: (_, key) => typeof key === 'string' ? key.toLowerCase() : undefined });
export type Obligation_Type_Enum = string;
export const Risk_Assessment_Result_Control_Type_Enum: any = new Proxy({}, { get: (_, key) => typeof key === 'string' ? key.toLowerCase() : undefined });
export type Risk_Assessment_Result_Control_Type_Enum = string;
export const Cost_Type_Enum: any = new Proxy({}, { get: (_, key) => typeof key === 'string' ? key.toLowerCase() : undefined });
export type Cost_Type_Enum = string;
export const Test_Frequency_Enum: any = new Proxy({}, { get: (_, key) => typeof key === 'string' ? key.toLowerCase() : undefined });
export type Test_Frequency_Enum = string;
export const Unit_Of_Time_Enum: any = new Proxy({}, { get: (_, key) => typeof key === 'string' ? key.toLowerCase() : undefined });
export type Unit_Of_Time_Enum = string;
export const Control_Type_Enum: any = new Proxy({}, { get: (_, key) => typeof key === 'string' ? key.toLowerCase() : undefined });
export type Control_Type_Enum = string;
export const Dashboard_Sharing_Type_Enum: any = new Proxy({}, { get: (_, key) => typeof key === 'string' ? key.toLowerCase() : undefined });
export type Dashboard_Sharing_Type_Enum = string;
export const Data_Import_Status_Enum: any = new Proxy({}, { get: (_, key) => typeof key === 'string' ? key.toLowerCase() : undefined });
export type Data_Import_Status_Enum = string;
export const Risk_Treatment_Type_Enum: any = new Proxy({}, { get: (_, key) => typeof key === 'string' ? key.toLowerCase() : undefined });
export type Risk_Treatment_Type_Enum = string;
export const Indicator_Type_Enum: any = new Proxy({}, { get: (_, key) => typeof key === 'string' ? key.toLowerCase() : undefined });
export type Indicator_Type_Enum = string;
export const Consequence_Type_Enum: any = new Proxy({}, { get: (_, key) => typeof key === 'string' ? key.toLowerCase() : undefined });
export type Consequence_Type_Enum = string;
export const Questionnaire_Template_Version_Status_Enum: any = new Proxy({}, { get: (_, key) => typeof key === 'string' ? key.toLowerCase() : undefined });
export type Questionnaire_Template_Version_Status_Enum = string;
export const Risk_Status_Type_Enum: any = new Proxy({}, { get: (_, key) => typeof key === 'string' ? key.toLowerCase() : undefined });
export type Risk_Status_Type_Enum = string;
export const Approval_Rule_Type_Enum: any = new Proxy({}, { get: (_, key) => typeof key === 'string' ? key.toLowerCase() : undefined });
export type Approval_Rule_Type_Enum = string;
export const Approval_In_Flight_Edit_Rule_Enum: any = new Proxy({}, { get: (_, key) => typeof key === 'string' ? key.toLowerCase() : undefined });
export type Approval_In_Flight_Edit_Rule_Enum = string;
export const Third_Party_Response_Status_Enum: any = new Proxy({}, { get: (_, key) => typeof key === 'string' ? key.toLowerCase() : undefined });
export type Third_Party_Response_Status_Enum = string;

export type Department_Type = any;
export const Department_Type: any = undefined;
export type Tag_Type = any;
export const Tag_Type: any = undefined;
export type Acceptance_Bool_Exp = any;
export const Acceptance_Bool_Exp: any = undefined;
export type Cause_Bool_Exp = any;
export const Cause_Bool_Exp: any = undefined;
export type Consequence_Bool_Exp = any;
export const Consequence_Bool_Exp: any = undefined;
export type Control_Bool_Exp = any;
export const Control_Bool_Exp: any = undefined;
export type Issue_Bool_Exp = any;
export const Issue_Bool_Exp: any = undefined;
export type Risk_Bool_Exp = any;
export const Risk_Bool_Exp: any = undefined;
export type Test_Result_Bool_Exp = any;
export const Test_Result_Bool_Exp: any = undefined;
export type FormFieldOption = any;
export const FormFieldOption: any = undefined;
export type InputMaybe = any;
export const InputMaybe: any = undefined;
export type InsertAssessmentInput = any;
export const InsertAssessmentInput: any = undefined;
export type UpdateAssessmentInput = any;
export const UpdateAssessmentInput: any = undefined;
export type InsertChildControlInput = any;
export const InsertChildControlInput: any = undefined;
export type UpdateChildIndicatorInput = any;
export const UpdateChildIndicatorInput: any = undefined;
export type InsertIssueInput = any;
export const InsertIssueInput: any = undefined;
export type UpdateIssueInput = any;
export const UpdateIssueInput: any = undefined;
export type InsertChildObligationInput = any;
export const InsertChildObligationInput: any = undefined;
export type InsertChildRiskInput = any;
export const InsertChildRiskInput: any = undefined;
export type UpdateChildRiskInput = any;
export const UpdateChildRiskInput: any = undefined;
export type UpdateTestResultInput = any;
export const UpdateTestResultInput: any = undefined;
export type Action_Bool_Exp = any;
export const Action_Bool_Exp: any = undefined;
export type Appetite_Parent_Bool_Exp = any;
export const Appetite_Parent_Bool_Exp: any = undefined;
export type Assessment_Bool_Exp = any;
export const Assessment_Bool_Exp: any = undefined;
export type GetAssessmentRcsaActivitiesByParentIdQuery = any;
export const GetAssessmentRcsaActivitiesByParentIdQuery: any = undefined;
export type GetAssessmentRcsaActivitiesByParentIdDocument = any;
export const GetAssessmentRcsaActivitiesByParentIdDocument: any = undefined;
export type Attestation_Record_Bool_Exp = any;
export const Attestation_Record_Bool_Exp: any = undefined;
export type Enterprise_Risk_Bool_Exp = any;
export const Enterprise_Risk_Bool_Exp: any = undefined;
export type Indicator_Bool_Exp = any;
export const Indicator_Bool_Exp: any = undefined;
export type Internal_Audit_Entity_Bool_Exp = any;
export const Internal_Audit_Entity_Bool_Exp: any = undefined;
export type Questionnaire_Template_Bool_Exp = any;
export const Questionnaire_Template_Bool_Exp: any = undefined;
export type Third_Party_Bool_Exp = any;
export const Third_Party_Bool_Exp: any = undefined;
export type ReportingDataInput = any;
export const ReportingDataInput: any = undefined;
export type CustomDatasourceField = any;
export const CustomDatasourceField: any = undefined;
export type DataSource = any;
export const DataSource: any = undefined;
export type SelectedDatasourceField = any;
export const SelectedDatasourceField: any = undefined;
export type GroupBy = any;
export const GroupBy: any = undefined;
export type Assessment_Activity_Bool_Exp = any;
export const Assessment_Activity_Bool_Exp: any = undefined;
export type Ancestor_Contributor_Bool_Exp = any;
export const Ancestor_Contributor_Bool_Exp: any = undefined;
export type Document_Bool_Exp = any;
export const Document_Bool_Exp: any = undefined;
export type Obligation_Bool_Exp = any;
export const Obligation_Bool_Exp: any = undefined;
export type Document_Assessment_Result_Bool_Exp = any;
export const Document_Assessment_Result_Bool_Exp: any = undefined;
export type Document_File_Bool_Exp = any;
export const Document_File_Bool_Exp: any = undefined;
export type Indicator_Result_Bool_Exp = any;
export const Indicator_Result_Bool_Exp: any = undefined;
export type Obligation_Assessment_Result_Bool_Exp = any;
export const Obligation_Assessment_Result_Bool_Exp: any = undefined;
export type Risk_Assessment_Result_Bool_Exp = any;
export const Risk_Assessment_Result_Bool_Exp: any = undefined;
export type Issue_Assessment_Audit_Bool_Exp = any;
export const Issue_Assessment_Audit_Bool_Exp: any = undefined;
export type Audit_Log_View_Bool_Exp = any;
export const Audit_Log_View_Bool_Exp: any = undefined;
export type Audit_Log_View_Order_By = any;
export const Audit_Log_View_Order_By: any = undefined;
export type Third_Party_Response_Enum_Action = any;
export const Third_Party_Response_Enum_Action: any = undefined;
export type ReportingFilterOptionsInput = any;
export const ReportingFilterOptionsInput: any = undefined;
export type CacheFieldName = any;
export const CacheFieldName: any = undefined;
export type Order_By = any;
export const Order_By: any = undefined;

export const namedOperations: any = new Proxy({}, {
  get: () => new Proxy({}, { get: (_, key) => String(key) }),
});
