# GraphQL-to-tRPC Migration Tracker

<!-- AUTO-GENERATED — do not edit by hand -->
<!-- Updated: 2026-03-13 -->
<!-- Run: `node scripts/audit-graphql-migrations.mjs` to regenerate -->

## How to use

Each `⬜ PENDING` row is a GraphQL operation that needs migrating to the tRPC stack.
Pass the **Operation** name directly to the migration skill:

```
/migrate-graphql-to-trpc <OperationName>
```

**Status key:**
- `✅ MIGRATED` — a tRPC-aware web hook wrapping this operation already exists
- `⬜ PENDING` — only the GraphQL path exists; migration not yet started

---

## Summary

| Metric | Count |
|--------|-------|
| Total operations | 535 |
| ✅ Migrated | 170 |
| ⬜ Pending | 365 |
| Queries | 310 |
| Mutations | 225 |
| Progress | 32% |

---

## Operations by Entity

> Legend: ✅ all migrated · 🔄 partially migrated · ⬜ not started

### acceptances ✅ 7/7

| Operation | Type | Status |
|-----------|------|--------|
| `deleteAcceptances` | mutation | ✅ MIGRATED |
| `getAcceptanceAuditById` | query | ✅ MIGRATED |
| `getAcceptanceById` | query | ✅ MIGRATED |
| `getAcceptances` | query | ✅ MIGRATED |
| `getAcceptancesByParentRiskId` | query | ✅ MIGRATED |
| `insertAcceptance` | mutation | ✅ MIGRATED |
| `updateAcceptance` | mutation | ✅ MIGRATED |

### action 🔄 4/8

| Operation | Type | Status |
|-----------|------|--------|
| `getActionAuditById` | query | ✅ MIGRATED |
| `getActionById` | query | ✅ MIGRATED |
| `getActions` | query | ✅ MIGRATED |
| `insertChildAction` | mutation | ✅ MIGRATED |
| `deleteActions` | mutation | ⬜ PENDING |
| `GetOverdueActionCount` | query | ⬜ PENDING |
| `getWidgetActionsByPriority` | query | ⬜ PENDING |
| `updateAction` | mutation | ⬜ PENDING |

### actionUpdate 🔄 4/6

| Operation | Type | Status |
|-----------|------|--------|
| `deleteActionUpdates` | mutation | ✅ MIGRATED |
| `getActionUpdateById` | query | ✅ MIGRATED |
| `getActionUpdatesByParentActionId` | query | ✅ MIGRATED |
| `insertActionUpdate` | mutation | ✅ MIGRATED |
| `getActionUpdateAuditById` | query | ⬜ PENDING |
| `updateActionUpdate` | mutation | ⬜ PENDING |

### aggregation 🔄 1/2

| Operation | Type | Status |
|-----------|------|--------|
| `getAggregationSettingsForOrg` | query | ✅ MIGRATED |
| `updateAggregationSettingsForOrg` | mutation | ⬜ PENDING |

### appetite 🔄 8/10

| Operation | Type | Status |
|-----------|------|--------|
| `deleteAppetites` | mutation | ✅ MIGRATED |
| `getActiveAppetitesByParentId` | query | ✅ MIGRATED |
| `getActiveRiskAppetites` | query | ✅ MIGRATED |
| `getAppetiteById` | query | ✅ MIGRATED |
| `getAppetitesByRiskId` | query | ✅ MIGRATED |
| `getAppetitesGroupedByImpact` | query | ✅ MIGRATED |
| `insertAppetite` | mutation | ✅ MIGRATED |
| `updateAppetite` | mutation | ✅ MIGRATED |
| `getAppetiteAuditById` | query | ⬜ PENDING |
| `getAppetites` | query | ⬜ PENDING |

### approvals 🔄 1/7

| Operation | Type | Status |
|-----------|------|--------|
| `getGlobalApprovals` | query | ✅ MIGRATED |
| `deleteApproval` | mutation | ⬜ PENDING |
| `getApprovalAuditById` | query | ⬜ PENDING |
| `getApprovalById` | query | ⬜ PENDING |
| `getChangeRequestsByApproval` | query | ⬜ PENDING |
| `insertApproval` | mutation | ⬜ PENDING |
| `updateApproval` | mutation | ⬜ PENDING |

### assessmentActivity 🔄 2/8

| Operation | Type | Status |
|-----------|------|--------|
| `getAssessmentActivities` | query | ✅ MIGRATED |
| `getAssessmentActivitiesByParentId` | query | ✅ MIGRATED |
| `deleteAssessmentActivities` | mutation | ⬜ PENDING |
| `getAssessmentActivityAuditById` | query | ⬜ PENDING |
| `getAssessmentActivityById` | query | ⬜ PENDING |
| `getAssessmentRCSAActivitiesByParentId` | query | ⬜ PENDING |
| `insertAssessmentActivityWithLinkedItems` | mutation | ⬜ PENDING |
| `updateAssessmentActivityWithLinkedItems` | mutation | ⬜ PENDING |

### assessmentResults 🔄 7/28

| Operation | Type | Status |
|-----------|------|--------|
| `getAllAssessmentResults` | query | ✅ MIGRATED |
| `getAssessmentResultById` | query | ✅ MIGRATED |
| `getDocumentAssessmentResultsByParentId` | query | ✅ MIGRATED |
| `getLatestDocumentAssessmentResultByDocumentId` | query | ✅ MIGRATED |
| `getRiskAssessmentResultsByRiskId` | query | ✅ MIGRATED |
| `getRiskScoresByRiskId` | query | ✅ MIGRATED |
| `insertRiskAssessmentResults` | mutation | ✅ MIGRATED |
| `deleteAssessmentResults` | mutation | ⬜ PENDING |
| `getAssessmentResultParentAuditById` | query | ⬜ PENDING |
| `getAssessmentResultsByParentId` | query | ⬜ PENDING |
| `getDocumentAssessmentResultAuditById` | query | ⬜ PENDING |
| `getDocumentAssessmentResultById` | query | ⬜ PENDING |
| `getLatestDocumentAssessmentResults` | query | ⬜ PENDING |
| `getLatestObligationAssessmentResultByObligationId` | query | ⬜ PENDING |
| `getLatestObligationAssessmentResults` | query | ⬜ PENDING |
| `getObligationAssessmentResultAuditById` | query | ⬜ PENDING |
| `getObligationAssessmentResultById` | query | ⬜ PENDING |
| `getObligationAssessmentResultsByObligationId` | query | ⬜ PENDING |
| `getRiskAssessmentResultAuditById` | query | ⬜ PENDING |
| `getRiskAssessmentResultById` | query | ⬜ PENDING |
| `getRiskAssessmentResultsByControlType` | query | ⬜ PENDING |
| `getRiskAssessmentResultsByRiskIdAndControlType` | query | ⬜ PENDING |
| `insertChildImpactRating` | mutation | ⬜ PENDING |
| `insertDocumentAssessmentResult` | mutation | ⬜ PENDING |
| `insertObligationAssessmentResult` | mutation | ⬜ PENDING |
| `updateDocumentAssessmentResult` | mutation | ⬜ PENDING |
| `updateObligationAssessmentResult` | mutation | ⬜ PENDING |
| `updateRiskAssessmentResult` | mutation | ⬜ PENDING |

### assessments 🔄 5/6

| Operation | Type | Status |
|-----------|------|--------|
| `deleteAssessments` | mutation | ✅ MIGRATED |
| `getAssessmentById` | query | ✅ MIGRATED |
| `getAssessments` | query | ✅ MIGRATED |
| `insertAssessment` | mutation | ✅ MIGRATED |
| `updateAssessment` | mutation | ✅ MIGRATED |
| `getAssessmentAuditById` | query | ⬜ PENDING |

### attestationConfig 🔄 1/3

| Operation | Type | Status |
|-----------|------|--------|
| `GetAttestationConfig` | query | ✅ MIGRATED |
| `getGlobalUsersAndGroups` | query | ⬜ PENDING |
| `insertAttestationConfig` | mutation | ⬜ PENDING |

### attestationCycle 🔄 2/4

| Operation | Type | Status |
|-----------|------|--------|
| `getAttestationCycleRegister` | query | ✅ MIGRATED |
| `getAttestationCycles` | query | ✅ MIGRATED |
| `getActiveAttestationCycle` | query | ⬜ PENDING |
| `insertAttestationCycle` | mutation | ⬜ PENDING |

### attestations 🔄 2/5

| Operation | Type | Status |
|-----------|------|--------|
| `getAttestationStatus` | query | ✅ MIGRATED |
| `getPolicyAttestationRecords` | query | ✅ MIGRATED |
| `attest` | mutation | ⬜ PENDING |
| `attestationNotRequired` | mutation | ⬜ PENDING |
| `getPolicyAttestationRecordsForDocument` | query | ⬜ PENDING |

### auditLogs ⬜ 0/1

| Operation | Type | Status |
|-----------|------|--------|
| `getAuditLogs` | query | ⬜ PENDING |

### businessArea ✅ 1/1

| Operation | Type | Status |
|-----------|------|--------|
| `getBusinessAreas` | query | ✅ MIGRATED |

### cause 🔄 6/7

| Operation | Type | Status |
|-----------|------|--------|
| `deleteCauses` | mutation | ✅ MIGRATED |
| `getCauseById` | query | ✅ MIGRATED |
| `getCauses` | query | ✅ MIGRATED |
| `getCausesByParentIssueId` | query | ✅ MIGRATED |
| `insertCause` | mutation | ✅ MIGRATED |
| `updateCause` | mutation | ✅ MIGRATED |
| `getCauseAuditById` | query | ⬜ PENDING |

### changeRequests 🔄 2/7

| Operation | Type | Status |
|-----------|------|--------|
| `getChangeRequests` | query | ✅ MIGRATED |
| `getPendingChangeRequests` | query | ✅ MIGRATED |
| `getApprovalLevels` | query | ⬜ PENDING |
| `getChangeRequestAuditById` | query | ⬜ PENDING |
| `getMostRecentNonPendingChangeRequest` | query | ⬜ PENDING |
| `overrideChangeRequestById` | mutation | ⬜ PENDING |
| `updateApproverResponses` | mutation | ⬜ PENDING |

### colourPalettes 🔄 1/3

| Operation | Type | Status |
|-----------|------|--------|
| `getColourPalettes` | query | ✅ MIGRATED |
| `InsertColourPalette` | mutation | ⬜ PENDING |
| `UpdateColourPalette` | mutation | ⬜ PENDING |

### comments ⬜ 0/10

| Operation | Type | Status |
|-----------|------|--------|
| `deleteComment` | mutation | ⬜ PENDING |
| `deleteConversation` | mutation | ⬜ PENDING |
| `deleteConversations` | mutation | ⬜ PENDING |
| `getCommentAuditById` | query | ⬜ PENDING |
| `getCommentsByConversationId` | query | ⬜ PENDING |
| `getConversationAuditById` | query | ⬜ PENDING |
| `insertComment` | mutation | ⬜ PENDING |
| `insertConversation` | mutation | ⬜ PENDING |
| `resolveConversation` | mutation | ⬜ PENDING |
| `updateComment` | mutation | ⬜ PENDING |

### complianceMonitoringAssessments ⬜ 0/6

| Operation | Type | Status |
|-----------|------|--------|
| `deleteComplianceMonitoringAssessments` | mutation | ⬜ PENDING |
| `getAllComplianceMonitoringAssessments` | query | ⬜ PENDING |
| `getComplianceMonitoringAssessmentById` | query | ⬜ PENDING |
| `getComplianceMonitoringAssessments` | query | ⬜ PENDING |
| `insertComplianceMonitoringAssessment` | mutation | ⬜ PENDING |
| `updateComplianceMonitoringAssessment` | mutation | ⬜ PENDING |

### consequence ✅ 7/7

| Operation | Type | Status |
|-----------|------|--------|
| `deleteConsequences` | mutation | ✅ MIGRATED |
| `getConsequenceAuditById` | query | ✅ MIGRATED |
| `getConsequenceById` | query | ✅ MIGRATED |
| `getConsequences` | query | ✅ MIGRATED |
| `getConsequencesByParentIssueId` | query | ✅ MIGRATED |
| `insertConsequence` | mutation | ✅ MIGRATED |
| `updateConsequence` | mutation | ✅ MIGRATED |

### control 🔄 5/10

| Operation | Type | Status |
|-----------|------|--------|
| `getControlById` | query | ✅ MIGRATED |
| `getControls` | query | ✅ MIGRATED |
| `getControlsBasic` | query | ✅ MIGRATED |
| `getControlsByUser` | query | ✅ MIGRATED |
| `insertChildControl` | mutation | ✅ MIGRATED |
| `addControlParents` | mutation | ⬜ PENDING |
| `deleteControls` | mutation | ⬜ PENDING |
| `getControlAuditById` | query | ⬜ PENDING |
| `removeParentControls` | mutation | ⬜ PENDING |
| `updateControl` | mutation | ⬜ PENDING |

### controlGroups 🔄 6/8

| Operation | Type | Status |
|-----------|------|--------|
| `deleteControlGroup` | mutation | ✅ MIGRATED |
| `getControlGroupById` | query | ✅ MIGRATED |
| `getControlGroups` | query | ✅ MIGRATED |
| `getControlGroupsByTitle` | query | ✅ MIGRATED |
| `getControlGroupsFlat` | query | ✅ MIGRATED |
| `insertControlGroup` | mutation | ✅ MIGRATED |
| `getControlGroupAuditById` | query | ⬜ PENDING |
| `updateControlGroup` | mutation | ⬜ PENDING |

### customAttributeSchemas ⬜ 0/1

| Operation | Type | Status |
|-----------|------|--------|
| `getCustomAttributeSchemaAuditById` | query | ⬜ PENDING |

### customDatasource ⬜ 0/5

| Operation | Type | Status |
|-----------|------|--------|
| `deleteCustomDatasource` | mutation | ⬜ PENDING |
| `getCustomDatasourceById` | query | ⬜ PENDING |
| `getCustomDatasources` | query | ⬜ PENDING |
| `insertCustomDataSource` | mutation | ⬜ PENDING |
| `updateCustomDatasource` | mutation | ⬜ PENDING |

### customRibbonItem ⬜ 0/4

| Operation | Type | Status |
|-----------|------|--------|
| `getCustomRibbonAuditById` | query | ⬜ PENDING |
| `getRibbonItemsByParentType` | query | ⬜ PENDING |
| `insertRibbonItemsByParentType` | mutation | ⬜ PENDING |
| `updateRibbonItemsByParentType` | mutation | ⬜ PENDING |

### customRoles ⬜ 0/5

| Operation | Type | Status |
|-----------|------|--------|
| `deleteCustomRole` | mutation | ⬜ PENDING |
| `getCustomRoleById` | query | ⬜ PENDING |
| `getCustomRoles` | query | ⬜ PENDING |
| `insertCustomRole` | mutation | ⬜ PENDING |
| `updateCustomRole` | mutation | ⬜ PENDING |

### customRoleUser ⬜ 0/1

| Operation | Type | Status |
|-----------|------|--------|
| `customRoleUserUpdate` | mutation | ⬜ PENDING |

### dashboard ⬜ 0/7

| Operation | Type | Status |
|-----------|------|--------|
| `deleteDashboard` | mutation | ⬜ PENDING |
| `getDashboardAuditById` | query | ⬜ PENDING |
| `getDashboardById` | query | ⬜ PENDING |
| `getDashboards` | query | ⬜ PENDING |
| `getMyItemsDashboard` | query | ⬜ PENDING |
| `insertDashboard` | mutation | ⬜ PENDING |
| `updateDashboard` | mutation | ⬜ PENDING |

### dataExport ⬜ 0/3

| Operation | Type | Status |
|-----------|------|--------|
| `dataExportCreateSchedule` | mutation | ⬜ PENDING |
| `dataExportOneOffExport` | query | ⬜ PENDING |
| `dataExportTestSchedule` | mutation | ⬜ PENDING |

### dataImport ⬜ 0/7

| Operation | Type | Status |
|-----------|------|--------|
| `dataImportStartImport` | mutation | ⬜ PENDING |
| `dataImportValidate` | mutation | ⬜ PENDING |
| `deleteDataImportById` | mutation | ⬜ PENDING |
| `getDataImportById` | query | ⬜ PENDING |
| `getDataImportErrors` | query | ⬜ PENDING |
| `getDataImports` | query | ⬜ PENDING |
| `insertDataImport` | mutation | ⬜ PENDING |

### departments 🔄 1/10

| Operation | Type | Status |
|-----------|------|--------|
| `getDepartments` | query | ✅ MIGRATED |
| `deleteDepartmentTypes` | mutation | ⬜ PENDING |
| `getDepartmentAuditById` | query | ⬜ PENDING |
| `GetDepartmentTypeById` | query | ⬜ PENDING |
| `getDepartmentTypeGroups` | query | ⬜ PENDING |
| `getDepartmentTypesByName` | query | ⬜ PENDING |
| `InsertDepartmentTypeGroupByName` | mutation | ⬜ PENDING |
| `insertDepartmentTypeWithGroupName` | mutation | ⬜ PENDING |
| `insertDepartmentTypeWithOptionalGroupId` | mutation | ⬜ PENDING |
| `UpdateDepartmentType` | mutation | ⬜ PENDING |

### document 🔄 3/7

| Operation | Type | Status |
|-----------|------|--------|
| `getDocumentById` | query | ✅ MIGRATED |
| `getDocumentList` | query | ✅ MIGRATED |
| `getDocuments` | query | ✅ MIGRATED |
| `deleteDocument` | mutation | ⬜ PENDING |
| `getDocumentAuditById` | query | ⬜ PENDING |
| `insertDocument` | mutation | ⬜ PENDING |
| `updateDocument` | mutation | ⬜ PENDING |

### documentFiles 🔄 5/9

| Operation | Type | Status |
|-----------|------|--------|
| `getDocumentFile` | query | ✅ MIGRATED |
| `getDocumentFileById` | query | ✅ MIGRATED |
| `getDocumentFilesByDocumentId` | query | ✅ MIGRATED |
| `getLatestPublicDocumentFileByDocumentId` | query | ✅ MIGRATED |
| `getPublicDocumentFiles` | query | ✅ MIGRATED |
| `deleteDocumentFiles` | mutation | ⬜ PENDING |
| `getDocumentFileAuditById` | query | ⬜ PENDING |
| `insertDocumentVersion` | mutation | ⬜ PENDING |
| `updateDocumentVersion` | mutation | ⬜ PENDING |

### enterpriseRisk 🔄 3/9

| Operation | Type | Status |
|-----------|------|--------|
| `getEnterpriseRiskById` | query | ✅ MIGRATED |
| `getEnterpriseRisksByTier` | query | ✅ MIGRATED |
| `getEnterpriseRisksFlat` | query | ✅ MIGRATED |
| `addRiskToEnterpriseRisk` | mutation | ⬜ PENDING |
| `deleteEnterpriseRisk` | mutation | ⬜ PENDING |
| `getEnterpriseRisks` | query | ⬜ PENDING |
| `insertEnterpriseRisk` | mutation | ⬜ PENDING |
| `instatiateEnterpriseRisk` | mutation | ⬜ PENDING |
| `updateEnterpriseRisk` | mutation | ⬜ PENDING |

### entities 🔄 2/5

| Operation | Type | Status |
|-----------|------|--------|
| `getEntities` | query | ✅ MIGRATED |
| `getEntityById` | query | ✅ MIGRATED |
| `deleteEntity` | mutation | ⬜ PENDING |
| `insertEntity` | mutation | ⬜ PENDING |
| `updateEntity` | mutation | ⬜ PENDING |

### files ⬜ 0/3

| Operation | Type | Status |
|-----------|------|--------|
| `deleteRelationFileById` | mutation | ⬜ PENDING |
| `getFileAuditById` | query | ⬜ PENDING |
| `getFileById` | query | ⬜ PENDING |

### formConfiguration 🔄 1/3

| Operation | Type | Status |
|-----------|------|--------|
| `getFormConfigurationByParentType` | query | ✅ MIGRATED |
| `getFormConfiguration` | query | ⬜ PENDING |
| `getFormConfigurationAudit` | query | ⬜ PENDING |

### formField ✅ 3/3

| Operation | Type | Status |
|-----------|------|--------|
| `deleteFormField` | mutation | ✅ MIGRATED |
| `insertFormField` | mutation | ✅ MIGRATED |
| `updateFormField` | mutation | ✅ MIGRATED |

### formFields 🔄 2/7

| Operation | Type | Status |
|-----------|------|--------|
| `getFormCustomisation` | query | ✅ MIGRATED |
| `getFormFieldOptionsByParentType` | query | ✅ MIGRATED |
| `getAllFormsCustomisation` | query | ⬜ PENDING |
| `getFormFieldConfigurationAuditByParentType` | query | ⬜ PENDING |
| `getFormFieldOrderingAuditById` | query | ⬜ PENDING |
| `insertFormFieldPositions` | mutation | ⬜ PENDING |
| `updateFormFieldPositions` | mutation | ⬜ PENDING |

### graphql ⬜ 0/2

| Operation | Type | Status |
|-----------|------|--------|
| `getOwnersAndContributors` | query | ⬜ PENDING |
| `getUsers` | query | ⬜ PENDING |

### impactRatings 🔄 1/13

| Operation | Type | Status |
|-----------|------|--------|
| `getLatestImpactRatingsForRatedImpactsByRatedItemId` | query | ✅ MIGRATED |
| `deleteImpactRating` | mutation | ⬜ PENDING |
| `deleteImpactRatings` | mutation | ⬜ PENDING |
| `getImpactRatingAuditById` | query | ⬜ PENDING |
| `getImpactRatingById` | query | ⬜ PENDING |
| `getImpactRatingCount` | query | ⬜ PENDING |
| `getImpactRatings` | query | ⬜ PENDING |
| `getImpactRatingsByImpactId` | query | ⬜ PENDING |
| `getImpactRatingsByRatedItemId` | query | ⬜ PENDING |
| `getImpactRatingsWithAppetites` | query | ⬜ PENDING |
| `getInternalAuditImpactRatingById` | query | ⬜ PENDING |
| `getSecondLineImpactRatingById` | query | ⬜ PENDING |
| `insertChildImpactRatings` | mutation | ⬜ PENDING |

### impacts ⬜ 0/8

| Operation | Type | Status |
|-----------|------|--------|
| `deleteImpact` | mutation | ⬜ PENDING |
| `getImpactAuditById` | query | ⬜ PENDING |
| `getImpactById` | query | ⬜ PENDING |
| `getImpactCount` | query | ⬜ PENDING |
| `getImpactList` | query | ⬜ PENDING |
| `getImpacts` | query | ⬜ PENDING |
| `insertImpact` | mutation | ⬜ PENDING |
| `updateImpact` | mutation | ⬜ PENDING |

### indicatorResults 🔄 4/6

| Operation | Type | Status |
|-----------|------|--------|
| `deleteIndicatorResults` | mutation | ✅ MIGRATED |
| `getIndicatorResultsByIndicatorId` | query | ✅ MIGRATED |
| `insertIndicatorResult` | mutation | ✅ MIGRATED |
| `updateIndicatorResult` | mutation | ✅ MIGRATED |
| `getIndicatorResultAuditById` | query | ⬜ PENDING |
| `getIndicatorResultById` | query | ⬜ PENDING |

### indicators 🔄 5/8

| Operation | Type | Status |
|-----------|------|--------|
| `deleteIndicators` | mutation | ✅ MIGRATED |
| `getIndicatorById` | query | ✅ MIGRATED |
| `getIndicators` | query | ✅ MIGRATED |
| `getIndicatorsByParentId` | query | ✅ MIGRATED |
| `updateIndicator` | mutation | ✅ MIGRATED |
| `getIndicatorAuditById` | query | ⬜ PENDING |
| `getIndicatorTitlesByParentId` | query | ⬜ PENDING |
| `insertIndicator` | mutation | ⬜ PENDING |

### ingestionConfig 🔄 1/4

| Operation | Type | Status |
|-----------|------|--------|
| `getIngestionConfigs` | query | ✅ MIGRATED |
| `deleteIngestionConfig` | mutation | ⬜ PENDING |
| `insertIngestionConfig` | mutation | ⬜ PENDING |
| `updateIngestionConfig` | mutation | ⬜ PENDING |

### internalAudit 🔄 3/6

| Operation | Type | Status |
|-----------|------|--------|
| `getInternalAuditById` | query | ✅ MIGRATED |
| `getInternalAudits` | query | ✅ MIGRATED |
| `getLinkedRisksByInternalAuditId` | query | ✅ MIGRATED |
| `deleteInternalAudits` | mutation | ⬜ PENDING |
| `insertInternalAudit` | mutation | ⬜ PENDING |
| `updateInternalAudit` | mutation | ⬜ PENDING |

### internalAuditReports 🔄 3/6

| Operation | Type | Status |
|-----------|------|--------|
| `getInternalAuditReportById` | query | ✅ MIGRATED |
| `getInternalAuditReports` | query | ✅ MIGRATED |
| `getInternalAuditReportsByOriginatingItemId` | query | ✅ MIGRATED |
| `deleteInternalAuditReports` | mutation | ⬜ PENDING |
| `insertInternalAuditReport` | mutation | ⬜ PENDING |
| `updateInternalAuditReport` | mutation | ⬜ PENDING |

### internalAuditResults 🔄 8/26

| Operation | Type | Status |
|-----------|------|--------|
| `getInternalAuditReportRiskAssessmentResultsByRiskId` | query | ✅ MIGRATED |
| `getInternalAuditReportTestResultsByControlId` | query | ✅ MIGRATED |
| `getInternalAuditResultById` | query | ✅ MIGRATED |
| `getInternalAuditResultsByParentId` | query | ✅ MIGRATED |
| `getInternalAuditTestResultById` | query | ✅ MIGRATED |
| `getLatestInternalAuditReportDocumentAssessmentResultByDocumentId` | query | ✅ MIGRATED |
| `getLatestInternalAuditReportRiskAssessmentResultsByRiskId` | query | ✅ MIGRATED |
| `getLatestInternalAuditReportTestResultsByControlId` | query | ✅ MIGRATED |
| `deleteInternalAuditResults` | mutation | ⬜ PENDING |
| `getAllInternalAuditReportResults` | query | ⬜ PENDING |
| `getDocumentInternalAuditResultById` | query | ⬜ PENDING |
| `getInternalAuditReportDocumentAssessmentResultsByDocumentId` | query | ⬜ PENDING |
| `getInternalAuditReportObligationAssessmentResultsByObligationId` | query | ⬜ PENDING |
| `getLatestInternalAuditReportObligationAssessmentResultByObligationId` | query | ⬜ PENDING |
| `getObligationInternalAuditResultById` | query | ⬜ PENDING |
| `getRiskInternalAuditResultById` | query | ⬜ PENDING |
| `insertDocumentInternalAuditResult` | mutation | ⬜ PENDING |
| `insertInternalAuditImpactRating` | mutation | ⬜ PENDING |
| `insertInternalAuditTestResult` | mutation | ⬜ PENDING |
| `insertObligationInternalAuditResult` | mutation | ⬜ PENDING |
| `insertRiskInternalAuditResult` | mutation | ⬜ PENDING |
| `updateControlledRiskInternalAuditResult` | mutation | ⬜ PENDING |
| `updateControlTestInternalAuditResult` | mutation | ⬜ PENDING |
| `updateDocumentInternalAuditResult` | mutation | ⬜ PENDING |
| `updateObligationInternalAuditResult` | mutation | ⬜ PENDING |
| `updateUncontrolledRiskInternalAuditResult` | mutation | ⬜ PENDING |

### issue 🔄 4/11

| Operation | Type | Status |
|-----------|------|--------|
| `getIssueById` | query | ✅ MIGRATED |
| `getIssues` | query | ✅ MIGRATED |
| `getIssuesByParentId` | query | ✅ MIGRATED |
| `insertChildIssue` | mutation | ✅ MIGRATED |
| `deleteIssues` | mutation | ⬜ PENDING |
| `getIssueAuditById` | query | ⬜ PENDING |
| `GetOldestOpenIssueDate` | query | ⬜ PENDING |
| `GetOpenIssueAssessmentCount` | query | ⬜ PENDING |
| `getWidgetIssueCauses` | query | ⬜ PENDING |
| `getWidgetIssuesByType` | query | ⬜ PENDING |
| `updateIssue` | mutation | ⬜ PENDING |

### issueAssessment 🔄 2/4

| Operation | Type | Status |
|-----------|------|--------|
| `getIssueAssessmentByParentId` | query | ✅ MIGRATED |
| `insertIssueAssessment` | mutation | ✅ MIGRATED |
| `getIssueAssessmentAuditById` | query | ⬜ PENDING |
| `updateIssueAssessment` | mutation | ⬜ PENDING |

### issueAssessmentAudits ⬜ 0/1

| Operation | Type | Status |
|-----------|------|--------|
| `getIssueAssessmentHistory` | query | ⬜ PENDING |

### issueUpdate 🔄 5/6

| Operation | Type | Status |
|-----------|------|--------|
| `deleteIssueUpdates` | mutation | ✅ MIGRATED |
| `getIssueUpdateAuditById` | query | ✅ MIGRATED |
| `getIssueUpdateById` | query | ✅ MIGRATED |
| `getIssueUpdatesByParentIssueId` | query | ✅ MIGRATED |
| `insertIssueUpdate` | mutation | ✅ MIGRATED |
| `updateIssueUpdate` | mutation | ⬜ PENDING |

### linkedItems 🔄 2/5

| Operation | Type | Status |
|-----------|------|--------|
| `getLinkedItemRisks` | query | ✅ MIGRATED |
| `getLinkedItems` | query | ✅ MIGRATED |
| `deleteLinkedItems` | mutation | ⬜ PENDING |
| `getLinkedItemAudit` | query | ⬜ PENDING |
| `linkItems` | mutation | ⬜ PENDING |

### modules ⬜ 0/2

| Operation | Type | Status |
|-----------|------|--------|
| `getModules` | query | ⬜ PENDING |
| `updateModules` | mutation | ⬜ PENDING |

### myItems ⬜ 0/2

| Operation | Type | Status |
|-----------|------|--------|
| `getMyDueItems` | query | ⬜ PENDING |
| `getMyItems` | query | ⬜ PENDING |

### navigation ⬜ 0/16

| Operation | Type | Status |
|-----------|------|--------|
| `getAcceptanceCount` | query | ⬜ PENDING |
| `getAppetiteCount` | query | ⬜ PENDING |
| `getAssessmentActivityCount` | query | ⬜ PENDING |
| `getAssessmentCount` | query | ⬜ PENDING |
| `getAssessmentResultCount` | query | ⬜ PENDING |
| `getCauseCount` | query | ⬜ PENDING |
| `getComplianceMonitoringAssessmentCount` | query | ⬜ PENDING |
| `getComplianceMonitoringAssessmentResultCount` | query | ⬜ PENDING |
| `getConsequenceCount` | query | ⬜ PENDING |
| `getControlCount` | query | ⬜ PENDING |
| `getControlGroupCount` | query | ⬜ PENDING |
| `getInternalAuditReportCount` | query | ⬜ PENDING |
| `getInternalAuditReportResultCount` | query | ⬜ PENDING |
| `getIssueCount` | query | ⬜ PENDING |
| `getRiskCount` | query | ⬜ PENDING |
| `getTestResultCount` | query | ⬜ PENDING |

### node ⬜ 0/1

| Operation | Type | Status |
|-----------|------|--------|
| `getObjectTypeById` | query | ⬜ PENDING |

### notifications ⬜ 0/4

| Operation | Type | Status |
|-----------|------|--------|
| `disconnectSlack` | mutation | ⬜ PENDING |
| `getNotificationListDetails` | query | ⬜ PENDING |
| `getNotificationPreferences` | query | ⬜ PENDING |
| `updateNotificationPreferences` | mutation | ⬜ PENDING |

### obligation 🔄 3/8

| Operation | Type | Status |
|-----------|------|--------|
| `getObligationById` | query | ✅ MIGRATED |
| `getObligations` | query | ✅ MIGRATED |
| `insertObligation` | mutation | ✅ MIGRATED |
| `deleteObligation` | mutation | ⬜ PENDING |
| `getObligationAuditById` | query | ⬜ PENDING |
| `getObligationList` | query | ⬜ PENDING |
| `getObligationsByType` | query | ⬜ PENDING |
| `updateObligation` | mutation | ⬜ PENDING |

### obligationChange ✅ 2/2

| Operation | Type | Status |
|-----------|------|--------|
| `getObligationChangeById` | query | ✅ MIGRATED |
| `getObligationChanges` | query | ✅ MIGRATED |

### obligationChangeAttestation ⬜ 0/2

| Operation | Type | Status |
|-----------|------|--------|
| `DeleteObligationChangeAttestation` | mutation | ⬜ PENDING |
| `InsertObligationChangeAttestationOne` | mutation | ⬜ PENDING |

### obligationImpact 🔄 3/6

| Operation | Type | Status |
|-----------|------|--------|
| `deleteImpacts` | mutation | ✅ MIGRATED |
| `getObligationImpactsByParentId` | query | ✅ MIGRATED |
| `insertObligationImpact` | mutation | ✅ MIGRATED |
| `getObligationImpactAuditById` | query | ⬜ PENDING |
| `getObligationImpactById` | query | ⬜ PENDING |
| `updateObligationImpact` | mutation | ⬜ PENDING |

### organisation ⬜ 0/2

| Operation | Type | Status |
|-----------|------|--------|
| `getOrganisation` | query | ⬜ PENDING |
| `updateOrganisation` | mutation | ⬜ PENDING |

### questionnaireInvites ⬜ 0/2

| Operation | Type | Status |
|-----------|------|--------|
| `getQuestionnaireInvites` | query | ⬜ PENDING |
| `insertQuestionnaireInvites` | mutation | ⬜ PENDING |

### questionnaireTemplates 🔄 2/5

| Operation | Type | Status |
|-----------|------|--------|
| `getQuestionnaireTemplateById` | query | ✅ MIGRATED |
| `getQuestionnaireTemplates` | query | ✅ MIGRATED |
| `deleteQuestionnaireTemplate` | mutation | ⬜ PENDING |
| `insertQuestionnaireTemplate` | mutation | ⬜ PENDING |
| `updateQuestionnaireTemplate` | mutation | ⬜ PENDING |

### questionnaireTemplateVersions 🔄 3/7

| Operation | Type | Status |
|-----------|------|--------|
| `getLatestQuestionnaireTemplateVersion` | query | ✅ MIGRATED |
| `getQuestionnaireTemplateVersionById` | query | ✅ MIGRATED |
| `getQuestionnaireTemplateVersionsByQuestionnaireTemplateId` | query | ✅ MIGRATED |
| `deleteQuestionnaireTemplateVersions` | mutation | ⬜ PENDING |
| `insertQuestionnaireTemplateVersion` | mutation | ⬜ PENDING |
| `publishQuestionnaireTemplateVersion` | mutation | ⬜ PENDING |
| `updateQuestionnaireTemplateVersion` | mutation | ⬜ PENDING |

### reporting ⬜ 0/2

| Operation | Type | Status |
|-----------|------|--------|
| `getReportingData` | query | ⬜ PENDING |
| `getReportingFilterOptions` | query | ⬜ PENDING |

### risk 🔄 7/15

| Operation | Type | Status |
|-----------|------|--------|
| `deleteRisk` | mutation | ✅ MIGRATED |
| `getRiskById` | query | ✅ MIGRATED |
| `getRiskListOnlyOptimized` | query | ✅ MIGRATED |
| `getRiskListOnlyWithEntitiesOptimized` | query | ✅ MIGRATED |
| `getRisksFlat` | query | ✅ MIGRATED |
| `insertRisk` | mutation | ✅ MIGRATED |
| `updateRisk` | mutation | ✅ MIGRATED |
| `getRiskAuditById` | query | ⬜ PENDING |
| `getRiskList` | query | ⬜ PENDING |
| `getRiskListOptimized` | query | ⬜ PENDING |
| `getRiskListWithEntities` | query | ⬜ PENDING |
| `getRisksByTier` | query | ⬜ PENDING |
| `getRisksWithAncestorContributors` | query | ⬜ PENDING |
| `getRisksWithAncestorContributorsAndEntities` | query | ⬜ PENDING |
| `getRiskWithOwnContributions` | query | ⬜ PENDING |

### riskAssessmentResultConfig 🔄 1/4

| Operation | Type | Status |
|-----------|------|--------|
| `getRiskAssessmentResultConfigAuditById` | query | ✅ MIGRATED |
| `getLatestRiskAssessmentResultConfig` | query | ⬜ PENDING |
| `InsertRiskAssessmentResultConfig` | mutation | ⬜ PENDING |
| `UpdateRiskAssessmentResultConfig` | mutation | ⬜ PENDING |

### riskAssessmentResultImpact ✅ 1/1

| Operation | Type | Status |
|-----------|------|--------|
| `getRiskAssessmentResultImpactAuditById` | query | ✅ MIGRATED |

### rolePermissions ⬜ 0/1

| Operation | Type | Status |
|-----------|------|--------|
| `getRoleAccess` | query | ⬜ PENDING |

### roles ⬜ 0/2

| Operation | Type | Status |
|-----------|------|--------|
| `GetAvailableRoles` | query | ⬜ PENDING |
| `getDefaultRoles` | query | ⬜ PENDING |

### scim ⬜ 0/5

| Operation | Type | Status |
|-----------|------|--------|
| `deleteScimDomain` | mutation | ⬜ PENDING |
| `deleteScimToken` | mutation | ⬜ PENDING |
| `getScimConfig` | query | ⬜ PENDING |
| `insertScimDomain` | mutation | ⬜ PENDING |
| `insertScimToken` | mutation | ⬜ PENDING |

### secondLineResults 🔄 4/26

| Operation | Type | Status |
|-----------|------|--------|
| `getComplianceMonitoringAssessmentRiskAssessmentResultsByRiskId` | query | ✅ MIGRATED |
| `getComplianceMonitoringAssessmentTestResultsByControlId` | query | ✅ MIGRATED |
| `getLatestComplianceMonitoringAssessmentRiskAssessmentResultsByRiskId` | query | ✅ MIGRATED |
| `getLatestComplianceMonitoringAssessmentTestResultsByControlId` | query | ✅ MIGRATED |
| `deleteSecondLineResults` | mutation | ⬜ PENDING |
| `getAllComplianceMonitoringAssessmentResults` | query | ⬜ PENDING |
| `getComplianceMonitoringAssessmentDocumentAssessmentResultsByDocumentId` | query | ⬜ PENDING |
| `getComplianceMonitoringAssessmentObligationAssessmentResultsByObligationId` | query | ⬜ PENDING |
| `getDocumentSecondLineResultById` | query | ⬜ PENDING |
| `getLatestComplianceMonitoringAssessmentDocumentAssessmentResultByDocumentId` | query | ⬜ PENDING |
| `getLatestComplianceMonitoringAssessmentObligationAssessmentResultByObligationId` | query | ⬜ PENDING |
| `getObligationSecondLineResultById` | query | ⬜ PENDING |
| `getRiskSecondLineResultById` | query | ⬜ PENDING |
| `getSecondLineResultById` | query | ⬜ PENDING |
| `getSecondLineResultsByParentId` | query | ⬜ PENDING |
| `getSecondLineTestResultById` | query | ⬜ PENDING |
| `insertChildRiskSecondLineResult` | mutation | ⬜ PENDING |
| `insertDocumentSecondLineResult` | mutation | ⬜ PENDING |
| `insertObligationSecondLineResult` | mutation | ⬜ PENDING |
| `insertSecondLineControlTestResult` | mutation | ⬜ PENDING |
| `insertSecondLineImpactRating` | mutation | ⬜ PENDING |
| `updateControlledRiskSecondLineResult` | mutation | ⬜ PENDING |
| `updateControlTestSecondLineResultApi` | mutation | ⬜ PENDING |
| `updateDocumentSecondLineResult` | mutation | ⬜ PENDING |
| `updateObligationSecondLineResult` | mutation | ⬜ PENDING |
| `updateUncontrolledRiskSecondLineResult` | mutation | ⬜ PENDING |

### sso ⬜ 0/5

| Operation | Type | Status |
|-----------|------|--------|
| `DeleteSsoConfigurationByConnectionId` | mutation | ⬜ PENDING |
| `getSsoConfigurations` | query | ⬜ PENDING |
| `insertSsoConfig` | mutation | ⬜ PENDING |
| `insertSsoConfiguration` | mutation | ⬜ PENDING |
| `UpdateSsoConfigurationByConnectionId` | mutation | ⬜ PENDING |

### tabs ⬜ 0/6

| Operation | Type | Status |
|-----------|------|--------|
| `getDefaultTabs` | query | ⬜ PENDING |
| `getOrganisationTabPreferences` | query | ⬜ PENDING |
| `getUserTabPreferences` | query | ⬜ PENDING |
| `resetTabPreferences` | mutation | ⬜ PENDING |
| `updateOrganisationTabPreferences` | mutation | ⬜ PENDING |
| `updateUserTabPreferences` | mutation | ⬜ PENDING |

### tags 🔄 1/9

| Operation | Type | Status |
|-----------|------|--------|
| `getTags` | query | ✅ MIGRATED |
| `deleteTagTypes` | mutation | ⬜ PENDING |
| `GetTagTypeById` | query | ⬜ PENDING |
| `getTagTypeGroups` | query | ⬜ PENDING |
| `getTagTypesByName` | query | ⬜ PENDING |
| `InsertTagTypeGroupByName` | mutation | ⬜ PENDING |
| `insertTagTypeWithGroupName` | mutation | ⬜ PENDING |
| `insertTagTypeWithOptionalGroupId` | mutation | ⬜ PENDING |
| `UpdateTagType` | mutation | ⬜ PENDING |

### taxonomy ⬜ 0/4

| Operation | Type | Status |
|-----------|------|--------|
| `deleteTaxonomyOrg` | mutation | ⬜ PENDING |
| `getTaxonomyByLocaleAndOrg` | query | ⬜ PENDING |
| `InsertTaxonomy` | mutation | ⬜ PENDING |
| `updateTaxonomy` | mutation | ⬜ PENDING |

### taxonomyAudit ⬜ 0/1

| Operation | Type | Status |
|-----------|------|--------|
| `getTaxonomyAudit` | query | ⬜ PENDING |

### testResult 🔄 7/9

| Operation | Type | Status |
|-----------|------|--------|
| `deleteTestResults` | mutation | ✅ MIGRATED |
| `getLatestTestResultsByControlId` | query | ✅ MIGRATED |
| `getTestResultById` | query | ✅ MIGRATED |
| `getTestResults` | query | ✅ MIGRATED |
| `getTestResultsByControlId` | query | ✅ MIGRATED |
| `insertControlTestResult` | mutation | ✅ MIGRATED |
| `updateTestResult` | mutation | ✅ MIGRATED |
| `getTestResultAuditById` | query | ⬜ PENDING |
| `getWidgetTestResults` | query | ⬜ PENDING |

### third-party-portal ⬜ 0/1

| Operation | Type | Status |
|-----------|------|--------|
| `tppUpdateThirdPartyResponse` | mutation | ⬜ PENDING |

### thirdParty 🔄 2/8

| Operation | Type | Status |
|-----------|------|--------|
| `getThirdParties` | query | ✅ MIGRATED |
| `getThirdPartyById` | query | ✅ MIGRATED |
| `createThirdParty` | mutation | ⬜ PENDING |
| `deleteThirdParty` | mutation | ⬜ PENDING |
| `getThirdPartyResponseById` | query | ⬜ PENDING |
| `updateThirdParty` | mutation | ⬜ PENDING |
| `updateThirdPartyResponse` | mutation | ⬜ PENDING |
| `updateThirdPartyResponseStatus` | mutation | ⬜ PENDING |

### thirdPartyContact 🔄 1/4

| Operation | Type | Status |
|-----------|------|--------|
| `getThirdPartyContactsByThirdPartyId` | query | ✅ MIGRATED |
| `getActiveThirdPartyContacts` | query | ⬜ PENDING |
| `insertThirdPartyContactApi` | mutation | ⬜ PENDING |
| `RevokeThirdPartyContactAccess` | mutation | ⬜ PENDING |

### userGroups 🔄 3/9

| Operation | Type | Status |
|-----------|------|--------|
| `GetUserGroupById` | query | ✅ MIGRATED |
| `getUserGroupsWithApprovers` | query | ✅ MIGRATED |
| `GetUsersByGroupId` | query | ✅ MIGRATED |
| `deleteUserGroups` | mutation | ⬜ PENDING |
| `DeleteUserGroupUsers` | mutation | ⬜ PENDING |
| `getUserGroups` | query | ⬜ PENDING |
| `InsertUserGroup` | mutation | ⬜ PENDING |
| `InsertUserGroupUsers` | mutation | ⬜ PENDING |
| `UpdateUserGroup` | mutation | ⬜ PENDING |

### users ⬜ 0/4

| Operation | Type | Status |
|-----------|------|--------|
| `GetAuthUserById` | query | ⬜ PENDING |
| `GetAuthUserByIdWithRoles` | query | ⬜ PENDING |
| `GetAuthUsers` | query | ⬜ PENDING |
| `UpdateUserRoles` | mutation | ⬜ PENDING |

### userSearchPreferences ⬜ 0/4

| Operation | Type | Status |
|-----------|------|--------|
| `getUserSearchPreferences` | query | ⬜ PENDING |
| `getUserSearchPreferencesAuditById` | query | ⬜ PENDING |
| `upsertRecentUsers` | mutation | ⬜ PENDING |
| `upsertUserSearchPreferences` | mutation | ⬜ PENDING |

### userTablePreferences ⬜ 0/2

| Operation | Type | Status |
|-----------|------|--------|
| `getUserTablePreferences` | query | ⬜ PENDING |
| `upsertUserTablePreferences` | mutation | ⬜ PENDING |

### wizard ⬜ 0/5

| Operation | Type | Status |
|-----------|------|--------|
| `deleteWizard` | mutation | ⬜ PENDING |
| `getWizardById` | query | ⬜ PENDING |
| `getWizards` | query | ⬜ PENDING |
| `insertWizard` | mutation | ⬜ PENDING |
| `updateWizard` | mutation | ⬜ PENDING |
