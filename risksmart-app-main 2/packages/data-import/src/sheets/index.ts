import acceptance from './acceptance';
import actionParents from './actionParents';
import actions from './actions';
import actionUpdates from './actionUpdates';
import appetite from './appetite';
import appetiteParents from './appetiteParents';
import assessments from './assessments';
import causes from './cause';
import consequences from './consequences';
import contributorGroups from './contributorGroups';
import contributors from './contributors';
import controls from './control';
import controlGroups from './controlGroup';
import controlledRiskAssessmentResults from './controlledRiskAssessmentResults';
import controlParents from './controlParents';
import departments from './departments';
import departmentTypes from './departmentTypes';
import enterpriseRiskInstances from './enterpriseRiskInstances';
import enterpriseRisks from './enterpriseRisks';
import entities from './entities';
import indicatorParents from './indicatorParents';
import indicatorResults from './indicatorResults';
import indicators from './indicators';
import {
  issue,
  issueBreachLog,
  issueConsumerDuty,
  issueCustomerTrust,
  issueGdprBreachLog,
  issuePciBreachLog,
  issueRiskEvent,
  issueSarLog,
} from './issue';
import {
  issueAssessment,
  issueAssessmentBreachLog,
  issueAssessmentConsumerDuty,
  issueAssessmentCustomerTrust,
  issueAssessmentGdprBreachLog,
  issueAssessmentPciBreachLog,
  issueAssessmentRiskEvent,
  issueAssessmentSarLog,
} from './issueAssessments';
import issueParents from './issueParents';
import issueUpdates from './issueUpdates';
import obligationAssessmentResult from './obligationAssessmentResult';
import obligations from './obligations';
import ownerGroups from './ownerGroups';
import owners from './owners';
import risks from './risk';
import schedule from './schedule';
import tags from './tags';
import tagTypes from './tagTypes';
import testResult from './testResult';
import thirdParty from './thirdParty';
import uncontrolledRiskAssessmentResults from './uncontrolledRiskAssessmentResults';
import users from './users';
import usersGroup from './usersGroup';

const sheets = {
  [thirdParty.name]: thirdParty,
  [risks.name]: risks,
  [controls.name]: controls,
  [causes.name]: causes,
  [issue.name]: issue,
  [issueBreachLog.name]: issueBreachLog,
  [issueConsumerDuty.name]: issueConsumerDuty,
  [issueCustomerTrust.name]: issueCustomerTrust,
  [issueGdprBreachLog.name]: issueGdprBreachLog,
  [issuePciBreachLog.name]: issuePciBreachLog,
  [issueRiskEvent.name]: issueRiskEvent,
  [issueSarLog.name]: issueSarLog,
  [issueAssessment.name]: issueAssessment,
  [issueAssessmentBreachLog.name]: issueAssessmentBreachLog,
  [issueAssessmentConsumerDuty.name]: issueAssessmentConsumerDuty,
  [issueAssessmentCustomerTrust.name]: issueAssessmentCustomerTrust,
  [issueAssessmentGdprBreachLog.name]: issueAssessmentGdprBreachLog,
  [issueAssessmentPciBreachLog.name]: issueAssessmentPciBreachLog,
  [issueAssessmentRiskEvent.name]: issueAssessmentRiskEvent,
  [issueAssessmentSarLog.name]: issueAssessmentSarLog,
  [users.name]: users,
  [usersGroup.name]: usersGroup,
  [controlGroups.name]: controlGroups,
  [actions.name]: actions,
  [obligations.name]: obligations,
  [acceptance.name]: acceptance,
  [appetite.name]: appetite,
  [controlledRiskAssessmentResults.name]: controlledRiskAssessmentResults,
  [uncontrolledRiskAssessmentResults.name]: uncontrolledRiskAssessmentResults,
  [testResult.name]: testResult,
  [assessments.name]: assessments,
  [owners.name]: owners,
  [indicators.name]: indicators,
  [departments.name]: departments,
  [contributors.name]: contributors,
  [controlParents.name]: controlParents,
  [appetiteParents.name]: appetiteParents,
  [actionParents.name]: actionParents,
  [issueParents.name]: issueParents,
  [consequences.name]: consequences,
  [actionUpdates.name]: actionUpdates,
  [issueUpdates.name]: issueUpdates,
  [indicatorResults.name]: indicatorResults,
  [departmentTypes.name]: departmentTypes,
  [ownerGroups.name]: ownerGroups,
  [contributorGroups.name]: contributorGroups,
  [tagTypes.name]: tagTypes,
  [tags.name]: tags,
  [indicatorParents.name]: indicatorParents,
  [obligationAssessmentResult.name]: obligationAssessmentResult,
  [schedule.name]: schedule,
  [enterpriseRisks.name]: enterpriseRisks,
  [enterpriseRiskInstances.name]: enterpriseRiskInstances,
  [entities.name]: entities,
};

export type CsvFile = keyof typeof sheets;

export const csvFiles = Object.keys(sheets);

export default sheets;
