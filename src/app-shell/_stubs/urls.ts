// Stub — every URL helper returns a sensible href. Production code uses
// these for hrefs only; storybook never navigates so the values just need
// to exist.
const id = (suffix = '') => (..._args: any[]) => `#${suffix}`;

export const logoutUrl = () => '/logout';
export const dashboardUrl = id('/dashboard');
export const addRiskUrl = id('/risks/new');
export const riskDashboardUrl = id('/risks/dashboard');
export const riskRegisterUrl = id('/risks');
export const internalAuditDashboardUrl = id('/internal-audits/dashboard');
export const internalAuditRegisterUrl = id('/internal-audits');
export const internalAuditReportRegisterUrl = id('/internal-audits/reports');
export const internalAuditReportResultsRegisterUrl = id('/internal-audits/findings');
export const policyRegisterUrl = id('/policy');
export const publicPoliciesUrl = id('/public-policies');
export const reportAnIssueUrl = id('/report-an-issue');
export const complianceDashboardUrl = id('/compliance/dashboard');
export const complianceMonitoringAssessmentRegisterUrl = id('/compliance/monitoring');
export const complianceMonitoringAssessmentResultsRegisterUrl = id('/compliance/findings');
export const obligationChangesRegisterUrl = id('/compliance/changes');
export const issueRegisterUrl = id('/issues');
export const causesRegisterUrl = id('/issues/causes');
export const consequencesRegisterUrl = id('/issues/consequences');
export const actionRegisterUrl = id('/actions');
export const assessmentRegisterUrl = id('/assessments');
export const assessmentActivitiesRegisterPageUrl = id('/assessments/activities');
export const assessmentResultsRegisterUrl = id('/assessments/findings');
export const attestationRegisterUrl = id('/attestations');
export const automationsUrl = id('/automations');
export const customDatasourcesUrl = id('/reports');
export const impactsUrl = id('/impacts');
export const impactRatingsUrl = id('/impacts/ratings');

// Fallback Proxy — any URL helper not explicitly named just returns '#'.
const helpers: Record<string, any> = {
  logoutUrl,
  dashboardUrl,
  addRiskUrl,
  riskDashboardUrl,
  riskRegisterUrl,
  internalAuditDashboardUrl,
  internalAuditRegisterUrl,
  internalAuditReportRegisterUrl,
  internalAuditReportResultsRegisterUrl,
  policyRegisterUrl,
  publicPoliciesUrl,
  reportAnIssueUrl,
  complianceDashboardUrl,
  complianceMonitoringAssessmentRegisterUrl,
  complianceMonitoringAssessmentResultsRegisterUrl,
  obligationChangesRegisterUrl,
  issueRegisterUrl,
  causesRegisterUrl,
  consequencesRegisterUrl,
  actionRegisterUrl,
  assessmentRegisterUrl,
  assessmentActivitiesRegisterPageUrl,
  assessmentResultsRegisterUrl,
  attestationRegisterUrl,
  automationsUrl,
  customDatasourcesUrl,
  impactsUrl,
  impactRatingsUrl,
};

const proxy = new Proxy(helpers, {
  get(target, prop: string) {
    if (prop in target) return target[prop];
    return id();
  },
});

export default proxy;
