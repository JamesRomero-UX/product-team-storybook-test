import type { Dispatch, SetStateAction } from 'react';
import { useCallback, useState } from 'react';

import { handleError } from '../utils/errorUtils';

export type LocalStorageKeys =
  | 'AcceptanceRegisterTable-PreferencesV1'
  | 'ActionsRegisterTable-PreferencesV1'
  | 'AppetiteRegisterTable-PreferencesV2'
  | 'AssessmentActivities-Preferences'
  | 'AssessmentActivitiesRegister-Preferences'
  | 'AssessmentRCSAActivitiesRegister-Preferences'
  | 'AssessmentRegister-Preferences'
  | 'AssessmentResultRegister-Preferences'
  | 'AssessmentResults-Preferences'
  | 'AttestationRegisterTable-PreferencesV1'
  | 'AttestationsByUser-Preferences'
  | 'AuditLogRegisterTable-PreferencesV2'
  | 'AuthUsersRegisterTable-Preferences'
  | 'CausesRegisterTable-PreferencesV1'
  | 'ComplianceMonitoringAssessmentRegister-Preferences'
  | 'ComplianceMonitoringAssessmentResultRegister-Preferences'
  | 'ComplianceMonitoringDocumentRatingRegisterTable-Preferences'
  | 'ComplianceMonitoringObligationRatingRegisterTable-Preferences'
  | 'ComplianceRiskRatingRegisterTable-Preferences'
  | 'ConsequencesRegisterTable-PreferencesV1'
  | 'ConsequencesTab-PreferencesV1'
  | 'ControlComplianceMonitoringPerformanceRegisterTable-Preferences'
  | 'ControlGroupRegisterTable-PreferencesV1'
  | 'ControlInternalAuditPerformanceRegisterTable-Preferences'
  | 'ControlPerformanceRegisterTable-Preferences'
  | 'ControlRegisterTable-PreferencesV2'
  | 'ControlsTab-Preferences'
  | 'ControlTestRegisterTable-PreferencesV1'
  | 'CustomDatasourceRegisterTable-Preferences'
  | 'CustomRolesRegisterTable-Preferences'
  | 'Dashboard-Preferences'
  | 'Dashboard-PreferencesV3'
  | 'DataImportErrorTable-PreferencesV1'
  | 'DataExportExecutionTable-Preferences'
  | 'DataImportsRegisterTable-PreferencesV1'
  | 'DepartmentsSettingsTable-Preferences'
  | 'DocumentAssessmentsRegisterTable-PreferencesV1'
  | 'DocumentRatingRegisterTable-Preferences'
  | 'EnterpriseRisksTable-Preferences'
  | 'EntityRegisterTable-Preferences'
  | 'GlobalApprovalRegisterTable-PreferencesV1'
  | 'GroupMembersSettingsTable-Preferences'
  | 'GroupsSettingsTable-Preferences'
  | 'Impact-PreferencesV1'
  | 'ImpactRatingRegisterTable-Preferences'
  | 'ImpactRatingsTable-Preferences'
  | 'ImpactRegisterTable-Preferences'
  | 'IndicatorTabTable-Preferences'
  | 'IndicatorsRegisterTable-PreferencesV1'
  | 'InternalAuditDocumentRatingRegisterTable-Preferences'
  | 'InternalAuditObligationRatingRegisterTable-Preferences'
  | 'InternalAuditRegister-Preferences'
  | 'InternalAuditReportRegister-Preferences'
  | 'InternalAuditReportResultRegister-Preferences'
  | 'InternalAuditRiskRatingRegisterTable-Preferences'
  | 'IssueBreachLogRegisterTable-PreferencesV1'
  | 'IssueConsumerDutyRegisterTable-PreferencesV1'
  | 'IssueCustomerTrustRegisterTable-PreferencesV1'
  | 'IssueGDPRBreachLogRegisterTable-PreferencesV1'
  | 'IssuePCIBreachLogRegisterTable-PreferencesV1'
  | 'IssueRiskEventsRegisterTable-PreferencesV1'
  | 'IssueSARLogRegisterTable-PreferencesV1'
  | 'IssuesRegisterTable-PreferencesV1'
  | 'LinkedItemsTable-PreferencesV1'
  | 'MyItems-PreferencesV1'
  | 'MyPolicies-Preferences'
  | 'NavMenu-Preferences'
  | 'ObligationAssessmentsRegisterTable-PreferencesV1'
  | 'ObligationRatingRegisterTable-Preferences'
  | 'ObligationRegisterTable-PreferencesV1'
  | 'PolicyRegisterTable-Preferences'
  | 'QuestionnaireInvitesTable-PreferencesV1'
  | 'QuestionnaireTemplatesTable-PreferencesV1'
  | 'QuestionnaireTemplateVersionRegisterTable-Preferences'
  | 'RequestsRegisterTable-PreferencesV1'
  | 'RiskRatingRegisterTable-Preferences'
  | 'RiskRegisterTable-PreferencesV2'
  | 'ScimDomainSettingsTable-Preferences'
  | 'ScimTokenSettingsTable-Preferences'
  | 'TagsSettingsTable-Preferences'
  | 'Temp-PreferencesV1'
  | 'ThirdPartyContactsTable-Preferences'
  | 'ThirdPartyResponseTable-Preferences'
  | 'ThirdPartyTable-PreferencesV1'
  | 'CausesTabTable-PreferencesV1'
  | 'ActionUpdateTab-Preferences'
  | 'IssueUpdateTab-Preferences'
  | 'ObligationImpactTable-Preferences'
  | 'DocumentVersionTab-Preferences'
  | 'ExternalApiClientsSettingsTable-Preferences'
  | 'NotificationHistoryTable-Preferences'
  | 'EntityNotificationHistoryTable-Preferences'
  | 'ObligationChangeRegister-Preferences';

export const useLocalStorage = <T>(
  initialValue: T,
  {
    localStorageKey,
    orgScope,
  }: { localStorageKey?: LocalStorageKeys; orgScope?: null | string }
): [T, Dispatch<SetStateAction<T>>] => {
  // Create a key that is scoped to the organization
  // (non-scoped storageKey is still used as a fallback).
  const orgScopedStorageKey = orgScope
    ? `${localStorageKey}-${orgScope}`
    : null;

  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined' || !localStorageKey) {
      return initialValue;
    }

    try {
      // Get from local storage by key
      const item = orgScopedStorageKey
        ? window.localStorage.getItem(orgScopedStorageKey)
        : window.localStorage.getItem(localStorageKey);

      // Parse stored json or if none return initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      handleError(error);

      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue = useCallback(
    (value: ((arg0: T) => T) | T): void => {
      try {
        // Allow value to be a function, so we have same API as useState
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        // Save state
        setStoredValue(valueToStore);
        // Save to local storage
        if (typeof window !== 'undefined' && localStorageKey) {
          if (orgScopedStorageKey) {
            window.localStorage.setItem(
              orgScopedStorageKey,
              JSON.stringify(valueToStore)
            );
          }

          if (!orgScopedStorageKey && localStorageKey) {
            window.localStorage.setItem(
              localStorageKey,
              JSON.stringify(valueToStore)
            );
          }
        }
      } catch (error) {
        handleError(error);
      }
    },
    [localStorageKey, orgScopedStorageKey, storedValue]
  );

  return [storedValue, setValue];
};
