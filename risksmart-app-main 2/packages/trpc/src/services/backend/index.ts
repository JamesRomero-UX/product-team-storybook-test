import type {
  AcceptanceBackendService,
  ActionBackendService,
  AppetiteBackendService,
  ApprovalBackendService,
  AssessmentBackendService,
  ControlBackendService,
  DepartmentGroupTypeBackendService,
  DepartmentTypeBackendService,
  DocumentBackendService,
  EnterpriseRiskBackendService,
  FormConfigurationBackendService,
  ImpactBackendService,
  ImpactRatingBackendService,
  IndicatorBackendService,
  IssueBackendService,
  LinkedItemBackendService,
  ObligationBackendService,
  RiskBackendService,
  TagTypeBackendService,
  ThirdPartyBackendService,
  UserBackendService,
  UserGroupBackendService,
} from '../service.types';
import { AcceptanceServiceImpl } from './acceptance.service';
import { ActionServiceImpl } from './action.service';
import { AppetiteServiceImpl } from './appetite.service';
import { ApprovalServiceImpl } from './approval.service';
import { AssessmentServiceImpl } from './assessment.service';
import { ControlServiceImpl } from './control.service';
import { DepartmentGroupTypeServiceImpl } from './department-group-type.service';
import { DepartmentTypeServiceImpl } from './department-type.service';
import { DocumentServiceImpl } from './document.service';
import { EnterpriseRiskServiceImpl } from './enterprise-risk.service';
import { FormConfigurationBackendServiceImpl } from './form-configuration.service';
import { ImpactServiceImpl } from './impact.service';
import { ImpactRatingImpl } from './impact-rating.service';
import { IndicatorServiceImpl } from './indicator.service';
import { IssueServiceImpl } from './issue.service';
import { LinkedItemServiceImpl } from './linked-item.service';
import { ObligationServiceImpl } from './obligation.service';
import { RiskServiceImpl } from './risk.service';
import { TagTypeServiceImpl } from './tag-type.service';
import { ThirdPartyServiceImpl } from './third-party.service';
import { UserServiceImpl } from './user.service';
import { UserGroupServiceImpl } from './user-group.service';

export function createAcceptanceBackendService(): AcceptanceBackendService {
  return new AcceptanceServiceImpl();
}
export function createApprovalBackendService(): ApprovalBackendService {
  return new ApprovalServiceImpl();
}
export function createAppetiteBackendService(): AppetiteBackendService {
  return new AppetiteServiceImpl();
}

export function createRiskBackendService(): RiskBackendService {
  return new RiskServiceImpl();
}
export function createControlBackendService(): ControlBackendService {
  return new ControlServiceImpl();
}

export function createActionBackendService(): ActionBackendService {
  return new ActionServiceImpl();
}

export function createIssueBackendService(): IssueBackendService {
  return new IssueServiceImpl();
}

export function createDocumentBackendService(): DocumentBackendService {
  return new DocumentServiceImpl();
}

export function createObligationBackendService(): ObligationBackendService {
  return new ObligationServiceImpl();
}

export function createThirdPartyBackendService(): ThirdPartyBackendService {
  return new ThirdPartyServiceImpl();
}

export function createUserBackendService(): UserBackendService {
  return new UserServiceImpl();
}

export function createIndicatorBackendService(): IndicatorBackendService {
  return new IndicatorServiceImpl();
}

export function createAssessmentBackendService(): AssessmentBackendService {
  return new AssessmentServiceImpl();
}

export function createEnterpriseRiskBackendService(): EnterpriseRiskBackendService {
  return new EnterpriseRiskServiceImpl();
}

export function createImpactRatingBackendService(): ImpactRatingBackendService {
  return new ImpactRatingImpl();
}

export function createImpactBackendService(): ImpactBackendService {
  return new ImpactServiceImpl();
}

export function createFormConfigurationBackendService(): FormConfigurationBackendService {
  return new FormConfigurationBackendServiceImpl();
}

export function createLinkedItemBackendService(): LinkedItemBackendService {
  return new LinkedItemServiceImpl();
}

export function createUserGroupBackendService(): UserGroupBackendService {
  return new UserGroupServiceImpl();
}
export function createDepartmentTypeBackendService(): DepartmentTypeBackendService {
  return new DepartmentTypeServiceImpl();
}
export const createDepartmentGroupTypeBackendService =
  (): DepartmentGroupTypeBackendService => new DepartmentGroupTypeServiceImpl();
export const createTagTypeBackendService = (): TagTypeBackendService =>
  new TagTypeServiceImpl();
