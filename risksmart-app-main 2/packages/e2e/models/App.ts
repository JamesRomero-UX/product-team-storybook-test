import { type Page } from '@playwright/test';

import { AcceptanceScenarios } from '../scenarios/acceptanceScenarios';
import { ActionScenarios } from '../scenarios/actionScenarios';
import { AppetiteScenarios } from '../scenarios/appetiteScenarios';
import { AssessmentFindingScenarios } from '../scenarios/assessmentFindingScenarios';
import { AssessmentScenarios } from '../scenarios/assessmentScenarios';
import { ComplianceAssessmentFindingScenarios } from '../scenarios/complianceAssessmentFindingScenarios';
import { ControlScenarios } from '../scenarios/controlScenarios';
import { CustomAttributeScenarios } from '../scenarios/customAttributeScenarios';
import { CustomDatasourceScenarios } from '../scenarios/customDatasourceScenarios';
import { DashboardScenarios } from '../scenarios/dashboardScenarios';
import { EnterpriseRiskScenarios } from '../scenarios/enterpriseRiskScenarios';
import { GroupScenarios } from '../scenarios/groupScenarios';
import { ImpactRatingScenarios } from '../scenarios/impactRatingsScenarios';
import { ImpactScenarios } from '../scenarios/impactScenarios';
import { IndicatorScenarios } from '../scenarios/indicatorScenarios';
import { InternalAuditFindingScenarios } from '../scenarios/internalAuditFindingScenarios';
import { InternalAuditScenarios } from '../scenarios/internalAuditScenarios';
import { IssueAssessmentScenarios } from '../scenarios/issueAssessmentScenarios';
import { IssueScenarios } from '../scenarios/issueScenarios';
import { ObligationScenarios } from '../scenarios/obligationScenarios';
import { PolicyScenarios } from '../scenarios/policyScenarios';
import { RiskRatingScenarios } from '../scenarios/riskRatingScenarios';
import { RiskScenarios } from '../scenarios/riskScenarios';
import { TaxonomyScenarios } from '../scenarios/taxonomyScenarios';
import { TestResultScenarios } from '../scenarios/testResultScenarios';
import { ThirdPartyQuestionnaireScenarios } from '../scenarios/thirdPartyQuestionnaireScenarios';
import { ThirdPartyQuestionnaireVersionScenarios } from '../scenarios/thirdPartyQuestionnaireVersionScenarios';
import { ThirdPartyScenarios } from '../scenarios/thirdPartyScenarios';
import { AcceptanceDetailsPage } from './AcceptanceDetailsPage';
import { AcceptancesRegisterPage } from './AcceptancesRegisterPage';
import { ActionDetailsPage } from './ActionDetailsPage';
import { ActionsRegisterPage } from './ActionsRegisterPage';
import { AddAssessmentPage } from './AddAssessmentPage';
import { AddComplianceAssessmentPage } from './AddComplianceAssessmentPage';
import { AddDocumentPage } from './AddDocumentPage';
import { AddInternalAuditPage } from './AddInternalAuditPage';
import { AddInternalAuditReportPage } from './AddInternalAuditReportPage';
import { AddRiskPage } from './AddRiskPage';
import { AppetiteDetailsPage } from './AppetiteDetailsPage';
import { AppetitesRegisterPage } from './AppetitesRegisterPage';
import { AssessmentDetailsPage } from './AssessmentDetailsPage';
import { AssessmentFindingsRegisterPage } from './AssessmentFindingsRegisterPage';
import { AssessmentRegisterPage } from './AssessmentRegisterPage';
import { AutomationsPage } from './AutomationsPage';
import { CausesRegisterPage } from './CausesRegisterPage';
import { ComplianceAssessmentDetailsPage } from './ComplianceAssessmentDetailsPage';
import { ComplianceAssessmentRegisterPage } from './ComplianceAssessmentRegisterPage';
import { ComplianceMonitoringFindingsRegisterPage } from './ComplianceMonitoringFindingsRegisterPage';
import { ComplianceRegisterPage } from './ComplianceRegisterPage';
import { ConsequencesRegisterPage } from './ConsequencesRegisterPage';
import { ControlDetailsPage } from './ControlDetailsPage';
import { ControlGroupRegisterPage } from './ControlGroupRegisterPage';
import { ControlRegisterPage } from './ControlRegisterPage';
import { CustomDatasourceDetailsPage } from './CustomDatasourceDetailsPage';
import { CustomDatasourcesPage } from './CustomDatasourcesPage';
import { CustomDatasourceUpdatePage } from './CustomDatasourceUpdatePage';
import { DashboardPage } from './DashboardPage';
import { DataImportDetailsPage } from './DataImportDetailsPage';
import { DocumentDetailsPage } from './DocumentDetailsPage';
import { DocumentVersionPage } from './DocumentVersionPage';
import { EnterpriseRiskDetailsPage } from './EnterpriseRiskDetailsPage';
import { EnterpriseRiskRegisterPage } from './EnterpriseRiskRegisterPage';
import { FindingPage } from './FindingPage';
import { GroupPage } from './GroupPage';
import { ImpactRatingsRegisterPage } from './ImpactRatingsRegisterPage';
import { ImpactsRegisterPage } from './ImpactsRegisterPage';
import { IndicatorDetailsPage } from './IndicatorDetailsPage';
import { IndicatorsRegisterPage } from './IndicatorsRegisterPage';
import { InternalAuditDetailsPage } from './InternalAuditDetailsPage';
import { InternalAuditFindingsRegisterPage } from './InternalAuditFindingsRegisterPage';
import { InternalAuditRegisterPage } from './InternalAuditRegisterPage';
import { InternalAuditReportDetailsPage } from './InternalAuditReportDetailsPage';
import { InternalAuditReportRegisterPage } from './InternalAuditReportRegisterPage';
import { IssueReportedPage } from './IssueReportedPage';
import { AddCustomFieldModal } from './modals/AddCustomFieldModal';
import { CustomisableFieldModal } from './modals/CustomisableFieldModal';
import { EditFieldModal } from './modals/EditFieldModal';
import { ObligationDetailsPage } from './ObligationDetailsPage';
import { IssueDetailsPage } from './pages/IssueDetailsPage';
import { IssueRegisterPage } from './pages/IssueRegisterPage';
import { PolicyRegisterPage } from './PolicyRegisterPage';
import { QuestionnaireDetailsPage } from './QuestionnaireDetailsPage';
import { QuestionnaireRegister } from './QuestionnaireRegister';
import { QuestionnaireVersionDetailsPage } from './QuestionnaireVersionDetailsPage';
import { ReportAnIssuePage } from './ReportAnIssuePage';
import { RequestsPage } from './RequestsPage';
import { RiskDashboardPage } from './RiskDashboardPage';
import { RiskDetailsPage } from './RiskDetailsPage';
import { RiskRegisterPage } from './RiskRegisterPage';
import { SettingsPage } from './SettingsPage';
import { TestRegisterPage } from './TestRegisterPage';
import { ThirdPartyDetailsPage } from './ThirdPartyDetailsPage';
import { ThirdPartyRegisterPage } from './ThirdPartyRegisterPage';

export class App {
  // Pages
  acceptanceDetailsPage: AcceptanceDetailsPage;
  appetiteDetailsPage: AppetiteDetailsPage;
  automationsPage: AutomationsPage;
  acceptancesRegisterPage: AcceptancesRegisterPage;
  actionDetailsPage: ActionDetailsPage;
  actionsRegisterPage: ActionsRegisterPage;
  addAssessmentPage: AddAssessmentPage;
  addComplianceAssessmentPage: AddComplianceAssessmentPage;
  addDocumentPage: AddDocumentPage;
  addInternalAuditPage: AddInternalAuditPage;
  addInternalAuditReportPage: AddInternalAuditReportPage;
  addRiskPage: AddRiskPage;
  appetitesRegisterPage: AppetitesRegisterPage;
  assessmentDetailsPage: AssessmentDetailsPage;
  assessmentFindingsRegisterPage: AssessmentFindingsRegisterPage;
  assessmentRegisterPage: AssessmentRegisterPage;
  causesRegisterPage: CausesRegisterPage;
  complianceAssessmentDetailsPage: ComplianceAssessmentDetailsPage;
  complianceAssessmentRegisterPage: ComplianceAssessmentRegisterPage;
  complianceMonitoringFindingsRegisterPage: ComplianceMonitoringFindingsRegisterPage;
  complianceRegisterPage: ComplianceRegisterPage;
  consequencesRegisterPage: ConsequencesRegisterPage;
  controlDetailsPage: ControlDetailsPage;
  controlGroupRegisterPage: ControlGroupRegisterPage;
  controlRegisterPage: ControlRegisterPage;
  customDatasourceDetailsPage: CustomDatasourceDetailsPage;
  customDatasourcesPage: CustomDatasourcesPage;
  customDatasourceUpdatePage: CustomDatasourceUpdatePage;
  dashboardPage: DashboardPage;
  dataImportDetailsPage: DataImportDetailsPage;
  documentDetailsPage: DocumentDetailsPage;
  documentVersionPage: DocumentVersionPage;
  enterpriseRiskDetailsPage: EnterpriseRiskDetailsPage;
  enterpriseRiskRegisterPage: EnterpriseRiskRegisterPage;
  findingPage: FindingPage;
  groupPage: GroupPage;
  impactRatingsRegisterPage: ImpactRatingsRegisterPage;
  impactsRegisterPage: ImpactsRegisterPage;
  indicatorDetailsPage: IndicatorDetailsPage;
  indicatorsRegisterPage: IndicatorsRegisterPage;
  internalAuditFindingsRegisterPage: InternalAuditFindingsRegisterPage;
  internalAuditDetailsPage: InternalAuditDetailsPage;
  internalAuditRegisterPage: InternalAuditRegisterPage;
  internalAuditReportDetailsPage: InternalAuditReportDetailsPage;
  internalAuditReportRegisterPage: InternalAuditReportRegisterPage;
  issueDetailsPage: IssueDetailsPage;
  issueRegisterPage: IssueRegisterPage;
  issueReportedPage: IssueReportedPage;
  obligationDetailsPage: ObligationDetailsPage;
  policyRegisterPage: PolicyRegisterPage;
  questionnaireDetailsPage: QuestionnaireDetailsPage;
  questionnaireRegister: QuestionnaireRegister;
  questionnaireVersionDetailsPage: QuestionnaireVersionDetailsPage;
  reportAnIssuePage: ReportAnIssuePage;
  requestsPage: RequestsPage;
  riskDashboardPage: RiskDashboardPage;
  riskDetailsPage: RiskDetailsPage;
  riskRegisterPage: RiskRegisterPage;
  settingsPage: SettingsPage;
  testRegisterPage: TestRegisterPage;
  thirdPartyDetails: ThirdPartyDetailsPage;
  thirdPartyRegisterPage: ThirdPartyRegisterPage;

  // Modals
  addCustomFieldModal: AddCustomFieldModal;
  customisableFieldModal: CustomisableFieldModal;
  editFieldModal: EditFieldModal;

  // Scenarios
  acceptanceScenarios: AcceptanceScenarios;
  actionScenarios: ActionScenarios;
  appetiteScenarios: AppetiteScenarios;
  assessmentFindingScenarios: AssessmentFindingScenarios;
  assessmentScenarios: AssessmentScenarios;
  complianceAssessmentFindingScenarios: ComplianceAssessmentFindingScenarios;
  controlScenarios: ControlScenarios;
  customAttributeScenarios: CustomAttributeScenarios;
  customDatasourceScenarios: CustomDatasourceScenarios;
  dashboardScenarios: DashboardScenarios;
  enterpriseRiskScenarios: EnterpriseRiskScenarios;
  groupScenarios: GroupScenarios;
  impactRatingScenarios: ImpactRatingScenarios;
  impactScenarios: ImpactScenarios;
  indicatorScenarios: IndicatorScenarios;
  internalAuditFindingScenarios: InternalAuditFindingScenarios;
  internalAuditScenarios: InternalAuditScenarios;
  issueAssessmentScenarios: IssueAssessmentScenarios;
  issueScenarios: IssueScenarios;
  obligationScenarios: ObligationScenarios;
  policyScenarios: PolicyScenarios;
  riskRatingScenarios: RiskRatingScenarios;
  riskScenarios: RiskScenarios;
  testResultScenarios: TestResultScenarios;
  thirdPartyQuestionnaireScenarios: ThirdPartyQuestionnaireScenarios;
  thirdPartyQuestionnaireVersionScenarios: ThirdPartyQuestionnaireVersionScenarios;
  thirdPartyScenarios: ThirdPartyScenarios;
  taxonomyScenarios: TaxonomyScenarios;

  constructor(page: Page) {
    // Pages
    this.appetiteDetailsPage = new AppetiteDetailsPage(page);
    this.acceptanceDetailsPage = new AcceptanceDetailsPage(page);
    this.automationsPage = new AutomationsPage(page);
    this.acceptancesRegisterPage = new AcceptancesRegisterPage(page);
    this.actionDetailsPage = new ActionDetailsPage(page);
    this.actionsRegisterPage = new ActionsRegisterPage(page);
    this.addAssessmentPage = new AddAssessmentPage(page);
    this.addComplianceAssessmentPage = new AddComplianceAssessmentPage(page);
    this.addDocumentPage = new AddDocumentPage(page);
    this.addInternalAuditPage = new AddInternalAuditPage(page);
    this.addInternalAuditReportPage = new AddInternalAuditReportPage(page);
    this.addRiskPage = new AddRiskPage(page);
    this.appetitesRegisterPage = new AppetitesRegisterPage(page);
    this.assessmentDetailsPage = new AssessmentDetailsPage(page);
    this.assessmentFindingsRegisterPage = new AssessmentFindingsRegisterPage(
      page
    );
    this.assessmentRegisterPage = new AssessmentRegisterPage(page);
    this.causesRegisterPage = new CausesRegisterPage(page);
    this.complianceAssessmentDetailsPage = new ComplianceAssessmentDetailsPage(
      page
    );
    this.complianceAssessmentRegisterPage =
      new ComplianceAssessmentRegisterPage(page);
    this.complianceMonitoringFindingsRegisterPage =
      new ComplianceMonitoringFindingsRegisterPage(page);
    this.complianceRegisterPage = new ComplianceRegisterPage(page);
    this.consequencesRegisterPage = new ConsequencesRegisterPage(page);
    this.controlDetailsPage = new ControlDetailsPage(page);
    this.controlGroupRegisterPage = new ControlGroupRegisterPage(page);
    this.controlRegisterPage = new ControlRegisterPage(page);
    this.customDatasourceDetailsPage = new CustomDatasourceDetailsPage(page);
    this.customDatasourcesPage = new CustomDatasourcesPage(page);
    this.customDatasourceUpdatePage = new CustomDatasourceUpdatePage(page);
    this.dashboardPage = new DashboardPage(page);
    this.dataImportDetailsPage = new DataImportDetailsPage(page);
    this.documentDetailsPage = new DocumentDetailsPage(page);
    this.documentVersionPage = new DocumentVersionPage(page);
    this.enterpriseRiskDetailsPage = new EnterpriseRiskDetailsPage(page);
    this.enterpriseRiskRegisterPage = new EnterpriseRiskRegisterPage(page);
    this.findingPage = new FindingPage(page);
    this.groupPage = new GroupPage(page);
    this.impactRatingsRegisterPage = new ImpactRatingsRegisterPage(page);
    this.impactsRegisterPage = new ImpactsRegisterPage(page);
    this.indicatorDetailsPage = new IndicatorDetailsPage(page);
    this.indicatorsRegisterPage = new IndicatorsRegisterPage(page);
    this.internalAuditFindingsRegisterPage =
      new InternalAuditFindingsRegisterPage(page);
    this.internalAuditDetailsPage = new InternalAuditDetailsPage(page);
    this.internalAuditRegisterPage = new InternalAuditRegisterPage(page);
    this.internalAuditReportDetailsPage = new InternalAuditReportDetailsPage(
      page
    );
    this.internalAuditReportRegisterPage = new InternalAuditReportRegisterPage(
      page
    );
    this.issueDetailsPage = new IssueDetailsPage(page);
    this.issueRegisterPage = new IssueRegisterPage(page);
    this.issueReportedPage = new IssueReportedPage(page);
    this.obligationDetailsPage = new ObligationDetailsPage(page);
    this.policyRegisterPage = new PolicyRegisterPage(page);
    this.questionnaireDetailsPage = new QuestionnaireDetailsPage(page);
    this.questionnaireRegister = new QuestionnaireRegister(page);
    this.questionnaireVersionDetailsPage = new QuestionnaireVersionDetailsPage(
      page
    );
    this.reportAnIssuePage = new ReportAnIssuePage(page);
    this.requestsPage = new RequestsPage(page);
    this.riskDashboardPage = new RiskDashboardPage(page);
    this.riskDetailsPage = new RiskDetailsPage(page);
    this.riskRegisterPage = new RiskRegisterPage(page);
    this.settingsPage = new SettingsPage(page);
    this.testRegisterPage = new TestRegisterPage(page);
    this.thirdPartyDetails = new ThirdPartyDetailsPage(page);
    this.thirdPartyRegisterPage = new ThirdPartyRegisterPage(page);

    // Modals
    this.addCustomFieldModal = new AddCustomFieldModal(page);
    this.customisableFieldModal = new CustomisableFieldModal(page);
    this.editFieldModal = new EditFieldModal(page);

    // Scenarios
    this.acceptanceScenarios = new AcceptanceScenarios(page);
    this.actionScenarios = new ActionScenarios(page);
    this.appetiteScenarios = new AppetiteScenarios(page);
    this.assessmentFindingScenarios = new AssessmentFindingScenarios(page);
    this.assessmentScenarios = new AssessmentScenarios(page);
    this.complianceAssessmentFindingScenarios =
      new ComplianceAssessmentFindingScenarios(page);
    this.controlScenarios = new ControlScenarios(page);
    this.customAttributeScenarios = new CustomAttributeScenarios(page);
    this.customDatasourceScenarios = new CustomDatasourceScenarios(page);
    this.dashboardScenarios = new DashboardScenarios(page);
    this.enterpriseRiskScenarios = new EnterpriseRiskScenarios(page);
    this.groupScenarios = new GroupScenarios(page);
    this.impactRatingScenarios = new ImpactRatingScenarios(page);
    this.impactScenarios = new ImpactScenarios(page);
    this.indicatorScenarios = new IndicatorScenarios(page);
    this.internalAuditFindingScenarios = new InternalAuditFindingScenarios(
      page
    );
    this.internalAuditScenarios = new InternalAuditScenarios(page);
    this.issueAssessmentScenarios = new IssueAssessmentScenarios(page);
    this.issueScenarios = new IssueScenarios(page);
    this.obligationScenarios = new ObligationScenarios(page);
    this.policyScenarios = new PolicyScenarios(page);
    this.riskRatingScenarios = new RiskRatingScenarios(page);
    this.riskScenarios = new RiskScenarios(page);
    this.testResultScenarios = new TestResultScenarios(page);
    this.thirdPartyQuestionnaireScenarios =
      new ThirdPartyQuestionnaireScenarios(page);
    this.thirdPartyQuestionnaireVersionScenarios =
      new ThirdPartyQuestionnaireVersionScenarios(page);
    this.thirdPartyScenarios = new ThirdPartyScenarios(page);
    this.taxonomyScenarios = new TaxonomyScenarios(page);
  }
}
