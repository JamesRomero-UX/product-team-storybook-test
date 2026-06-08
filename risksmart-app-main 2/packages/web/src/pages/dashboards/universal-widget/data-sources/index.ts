import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';

import acceptance from './acceptance';
import action from './action';
import assessment from './assessment';
import attestations from './attestations';
import cause from './cause';
import changeRequests from './changeRequests';
import consequence from './consequence';
import control from './control';
import controlTest from './controlTest';
import document from './document';
import enterpriseRisk from './enterpriseRisk';
import indicator from './indicator';
import internalAudits from './internalAudits';
import issue from './issue';
import { myOverdueItems7Days, myOverdueItems30Days } from './myOverdueItems';
import obligation from './obligation';
import risk from './risk';
import thirdParty from './thirdParty';

export const dataSources = {
  risk,
  issue: issue(Parent_Type_Enum.Issue),
  breachLog: issue(Parent_Type_Enum.IssueBreachLog),
  consumerDuty: issue(Parent_Type_Enum.IssueConsumerDuty),
  customerTrust: issue(Parent_Type_Enum.IssueCustomerTrust),
  gdprBreachLog: issue(Parent_Type_Enum.IssueGdprBreachLog),
  pciBreachLog: issue(Parent_Type_Enum.IssuePciBreachLog),
  riskEvent: issue(Parent_Type_Enum.IssueRiskEvent),
  sarLog: issue(Parent_Type_Enum.IssueSarLog),
  action,
  control,
  controlTest,
  document,
  cause,
  assessment,
  consequence,
  obligation,
  indicator,
  acceptance,
  thirdParty,
  internalAudits,
  changeRequests,
  attestations,
  myOverdueItems7Days,
  myOverdueItems30Days,
  enterpriseRisk,
};
