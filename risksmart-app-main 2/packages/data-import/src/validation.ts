import type { Readable } from 'node:stream';

import type { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import type { VariablesOf } from '@graphql-typed-document-node/core';

import type {
  AuthOrganisationuserInsertInput,
  InsertAllDocument,
  UpdateAllDocument,
} from '../generated/graphql';
import { writeSheet } from './services/csvWriter';
import { SheetsProcessor } from './services/sheetProcessor';
import type { CsvFile } from './sheets';
import sheets from './sheets';
import type { Sheet } from './sheets/Sheet';
import type { NodeLookup, SchemaLookup } from './sheets/types';
import type { CsvLineErrorType } from './utils/logging';

const mapOrganisationUsers = (
  id: string,
  orgKey: string
): AuthOrganisationuserInsertInput => {
  return {
    OrgKey: orgKey,
    User_Id: id,
  };
};

export const processStreamsForInsert = async (
  streams: { [name in CsvFile]?: Readable },
  orgKey: string,
  schemaLookup: SchemaLookup,
  nodeLookup: NodeLookup,
  client: ApolloClient<NormalizedCacheObject>
): Promise<{
  result: VariablesOf<typeof InsertAllDocument>;
  errors: CsvLineErrorType[];
}> => {
  const sheetProcessor = new SheetsProcessor(
    nodeLookup,
    schemaLookup,
    orgKey,
    client
  );

  const users = await sheetProcessor.processSheetForInsert({
    sheet: sheets['users.csv'],
    stream: streams['users.csv'],
  });

  const result: VariablesOf<typeof InsertAllDocument> = {
    users,
    userGroups: await sheetProcessor.processSheetForInsert({
      sheet: sheets['userGroups.csv'],
      stream: streams['userGroups.csv'],
    }),
    organisationUsers: users.map((u) => mapOrganisationUsers(u.Id!, orgKey)),
    controlGroups: await sheetProcessor.processSheetForInsert({
      stream: streams['controlGroups.csv'],
      sheet: sheets['controlGroups.csv'],
    }),
    thirdParties: await sheetProcessor.processSheetForInsert({
      stream: streams['thirdParties.csv'],
      sheet: sheets['thirdParties.csv'],
    }),
    risks: await sheetProcessor.processSheetForInsert({
      sheet: sheets['risks.csv'],
      stream: streams['risks.csv'],
    }),
    obligations: await sheetProcessor.processSheetForInsert({
      sheet: sheets['obligations.csv'],
      stream: streams['obligations.csv'],
    }),
    controls: await sheetProcessor.processSheetForInsert({
      sheet: sheets['controls.csv'],
      stream: streams['controls.csv'],
    }),
    acceptances: await sheetProcessor.processSheetForInsert({
      sheet: sheets['acceptances.csv'],
      stream: streams['acceptances.csv'],
    }),
    appetites: await sheetProcessor.processSheetForInsert({
      sheet: sheets['appetites.csv'],
      stream: streams['appetites.csv'],
    }),
    testResults: await sheetProcessor.processSheetForInsert({
      sheet: sheets['testResults.csv'],
      stream: streams['testResults.csv'],
    }),
    issue: await sheetProcessor.processSheetForInsert({
      sheet: sheets['issue.csv'],
      stream: streams['issue.csv'],
    }),
    issueBreachLog: await sheetProcessor.processSheetForInsert({
      sheet: sheets['issue_breach_log.csv'],
      stream: streams['issue_breach_log.csv'],
    }),
    issueConsumerDuty: await sheetProcessor.processSheetForInsert({
      sheet: sheets['issue_consumer_duty.csv'],
      stream: streams['issue_consumer_duty.csv'],
    }),
    issueCustomerTrust: await sheetProcessor.processSheetForInsert({
      sheet: sheets['issue_customer_trust.csv'],
      stream: streams['issue_customer_trust.csv'],
    }),
    issueGdprBreachLog: await sheetProcessor.processSheetForInsert({
      sheet: sheets['issue_gdpr_breach_log.csv'],
      stream: streams['issue_gdpr_breach_log.csv'],
    }),
    issueSarLog: await sheetProcessor.processSheetForInsert({
      sheet: sheets['issue_sar_log.csv'],
      stream: streams['issue_sar_log.csv'],
    }),
    issuePciBreachLog: await sheetProcessor.processSheetForInsert({
      sheet: sheets['issue_pci_breach_log.csv'],
      stream: streams['issue_pci_breach_log.csv'],
    }),
    issueRiskEvent: await sheetProcessor.processSheetForInsert({
      sheet: sheets['issue_risk_event.csv'],
      stream: streams['issue_risk_event.csv'],
    }),
    actions: await sheetProcessor.processSheetForInsert({
      sheet: sheets['actions.csv'],
      stream: streams['actions.csv'],
    }),
    indicators: await sheetProcessor.processSheetForInsert({
      sheet: sheets['indicators.csv'],
      stream: streams['indicators.csv'],
    }),
    indicatorResults: await sheetProcessor.processSheetForInsert({
      sheet: sheets['indicatorResults.csv'],
      stream: streams['indicatorResults.csv'],
    }),
    causes: await sheetProcessor.processSheetForInsert({
      sheet: sheets['causes.csv'],
      stream: streams['causes.csv'],
    }),
    consequences: await sheetProcessor.processSheetForInsert({
      sheet: sheets['consequences.csv'],
      stream: streams['consequences.csv'],
    }),
    actionUpdates: await sheetProcessor.processSheetForInsert({
      sheet: sheets['actionUpdates.csv'],
      stream: streams['actionUpdates.csv'],
    }),
    issueUpdates: await sheetProcessor.processSheetForInsert({
      sheet: sheets['issueUpdates.csv'],
      stream: streams['issueUpdates.csv'],
    }),
    issueAssessment: await sheetProcessor.processSheetForInsert({
      sheet: sheets['issue_assessment.csv'],
      stream: streams['issue_assessment.csv'],
    }),
    issueAssessmentBreachLog: await sheetProcessor.processSheetForInsert({
      sheet: sheets['issue_assessment_breach_log.csv'],
      stream: streams['issue_assessment_breach_log.csv'],
    }),
    issueAssessmentConsumerDuty: await sheetProcessor.processSheetForInsert({
      sheet: sheets['issue_assessment_consumer_duty.csv'],
      stream: streams['issue_assessment_consumer_duty.csv'],
    }),
    issueAssessmentCustomerTrust: await sheetProcessor.processSheetForInsert({
      sheet: sheets['issue_assessment_customer_trust.csv'],
      stream: streams['issue_assessment_customer_trust.csv'],
    }),
    issueAssessmentGdprBreachLog: await sheetProcessor.processSheetForInsert({
      sheet: sheets['issue_assessment_gdpr_breach_log.csv'],
      stream: streams['issue_assessment_gdpr_breach_log.csv'],
    }),
    issueAssessmentPciBreachLog: await sheetProcessor.processSheetForInsert({
      sheet: sheets['issue_assessment_pci_breach_log.csv'],
      stream: streams['issue_assessment_pci_breach_log.csv'],
    }),
    issueAssessmentRiskEvent: await sheetProcessor.processSheetForInsert({
      sheet: sheets['issue_assessment_risk_event.csv'],
      stream: streams['issue_assessment_risk_event.csv'],
    }),
    issueAssessmentSarLog: await sheetProcessor.processSheetForInsert({
      sheet: sheets['issue_assessment_sar_log.csv'],
      stream: streams['issue_assessment_sar_log.csv'],
    }),
    assessments: await sheetProcessor.processSheetForInsert({
      sheet: sheets['assessments.csv'],
      stream: streams['assessments.csv'],
    }),
    obligationAssessmentResults: await sheetProcessor.processSheetForInsert({
      stream: streams['obligationAssessmentResults.csv'],
      sheet: sheets['obligationAssessmentResults.csv'],
    }),
    controlledRiskAssessmentResults: await sheetProcessor.processSheetForInsert(
      {
        sheet: sheets['controlledRiskAssessmentResults.csv'],
        stream: streams['controlledRiskAssessmentResults.csv'],
      }
    ),
    uncontrolledRiskAssessmentResults:
      await sheetProcessor.processSheetForInsert({
        sheet: sheets['uncontrolledRiskAssessmentResults.csv'],
        stream: streams['uncontrolledRiskAssessmentResults.csv'],
      }),
    tagTypes: await sheetProcessor.processSheetForInsert({
      sheet: sheets['tagTypes.csv'],
      stream: streams['tagTypes.csv'],
    }),
    tags: await sheetProcessor.processSheetForInsert({
      sheet: sheets['tags.csv'],
      stream: streams['tags.csv'],
    }),
    departmentTypes: await sheetProcessor.processSheetForInsert({
      sheet: sheets['departmentTypes.csv'],
      stream: streams['departmentTypes.csv'],
    }),
    departments: await sheetProcessor.processSheetForInsert({
      sheet: sheets['departments.csv'],
      stream: streams['departments.csv'],
    }),
    owners: await sheetProcessor.processSheetForInsert({
      sheet: sheets['owners.csv'],
      stream: streams['owners.csv'],
    }),
    contributors: await sheetProcessor.processSheetForInsert({
      sheet: sheets['contributors.csv'],
      stream: streams['contributors.csv'],
    }),
    controlParents: await sheetProcessor.processSheetForInsert({
      sheet: sheets['controlParents.csv'],
      stream: streams['controlParents.csv'],
    }),
    appetiteParents: await sheetProcessor.processSheetForInsert({
      sheet: sheets['appetiteParents.csv'],
      stream: streams['appetiteParents.csv'],
    }),
    actionParents: await sheetProcessor.processSheetForInsert({
      sheet: sheets['actionParents.csv'],
      stream: streams['actionParents.csv'],
    }),
    issueParents: await sheetProcessor.processSheetForInsert({
      sheet: sheets['issueParents.csv'],
      stream: streams['issueParents.csv'],
    }),
    ownerGroups: await sheetProcessor.processSheetForInsert({
      sheet: sheets['ownerGroups.csv'],
      stream: streams['ownerGroups.csv'],
    }),
    contributorGroups: await sheetProcessor.processSheetForInsert({
      sheet: sheets['contributorGroups.csv'],
      stream: streams['contributorGroups.csv'],
    }),
    indicatorParents: await sheetProcessor.processSheetForInsert({
      sheet: sheets['indicatorParents.csv'],
      stream: streams['indicatorParents.csv'],
    }),
    schedules: await sheetProcessor.processSheetForInsert({
      sheet: sheets['schedules.csv'],
      stream: streams['schedules.csv'],
    }),
    entities: await sheetProcessor.processSheetForInsert({
      sheet: sheets['entities.csv'],
      stream: streams['entities.csv'],
    }),
    enterpriseRisks: await sheetProcessor.processSheetForInsert({
      sheet: sheets['enterpriseRisks.csv'],
      stream: streams['enterpriseRisks.csv'],
    }),
    enterpriseRiskInstances: await sheetProcessor.processSheetForInsert({
      sheet: sheets['enterpriseRiskInstances.csv'],
      stream: streams['enterpriseRiskInstances.csv'],
    }),
  };

  return { result, errors: sheetProcessor.errors };
};

export const processStreamsForUpdate = async (
  streams: { [name in CsvFile]?: Readable },
  orgKey: string,
  schemaLookup: SchemaLookup,
  nodeLookup: NodeLookup,
  client: ApolloClient<NormalizedCacheObject>
): Promise<{
  result: VariablesOf<typeof UpdateAllDocument>;
  errors: CsvLineErrorType[];
}> => {
  const sheetProcessor = new SheetsProcessor(
    nodeLookup,
    schemaLookup,
    orgKey,
    client
  );

  const result = {
    risks: await sheetProcessor.processSheetForUpdate({
      sheet: sheets['risks.csv'],
      stream: streams['risks.csv'],
    }),
    obligations: await sheetProcessor.processSheetForUpdate({
      sheet: sheets['obligations.csv'],
      stream: streams['obligations.csv'],
    }),
    controls: await sheetProcessor.processSheetForUpdate({
      sheet: sheets['controls.csv'],
      stream: streams['controls.csv'],
    }),
    actions: await sheetProcessor.processSheetForUpdate({
      sheet: sheets['actions.csv'],
      stream: streams['actions.csv'],
    }),
    controlledRiskAssessmentResults: await sheetProcessor.processSheetForUpdate(
      {
        sheet: sheets['controlledRiskAssessmentResults.csv'],
        stream: streams['controlledRiskAssessmentResults.csv'],
      }
    ),
    uncontrolledRiskAssessmentResults:
      await sheetProcessor.processSheetForUpdate({
        sheet: sheets['uncontrolledRiskAssessmentResults.csv'],
        stream: streams['uncontrolledRiskAssessmentResults.csv'],
      }),
  };

  return { result, errors: sheetProcessor.errors };
};

export const generateFiles = async (dir: string) => {
  for (const name in sheets) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sheet: Sheet<any, any, any> = sheets[name as keyof typeof sheets];
    writeSheet(dir, sheet);
  }
};
