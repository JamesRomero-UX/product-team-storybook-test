import type { NormalizedCacheObject } from '@apollo/client';
import { ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client';
import type { VariablesOf } from '@graphql-typed-document-node/core';

import {
  DeleteOrgDocument,
  ExportIssuesDocument,
  ExportLinkedRiskAndControlNameDocument,
  ExportNormalisedDocument,
  ExportUsersDocument,
  GetFormConfigurationDocument,
  GetLinkedItemsDocument,
  GetNodesDocument,
  GetRisksDocument,
  GetUserByEmailDocument,
  GetUserDocument,
  InsertAcceptancesDocument,
  InsertActionParentsDocument,
  InsertActionsDocument,
  InsertActionUpdatesDocument,
  InsertAllDocument,
  InsertAppetiteParentsDocument,
  InsertAppetitesDocument,
  InsertAssessmentsDocument,
  InsertCausesDocument,
  InsertConsequencesDocument,
  InsertContributorGroupsDocument,
  InsertContributorsDocument,
  InsertControlGroupsDocument,
  InsertControlParentsDocument,
  InsertControlsDocument,
  InsertDepartmentsDocument,
  InsertDepartmentTypesDocument,
  InsertIndicatorResultsDocument,
  InsertIndicatorsDocument,
  InsertIssueAssessmentsDocument,
  InsertIssuesDocument,
  InsertIssueUpdatesDocument,
  InsertObligationsDocument,
  InsertOrganisationUsersDocument,
  InsertOwnerGroupsDocument,
  InsertOwnersDocument,
  InsertRisksDocument,
  InsertTagsDocument,
  InsertTagTypesDocument,
  InsertTestResultsDocument,
  InsertUserGroupsDocument,
  InsertUsersDocument,
  LinkItemsDocument,
  ReassignUserDocument,
  UpdateAllDocument,
} from '../generated/graphql';
import { getEnv } from './utils/environment';

export const getClient = () => {
  const httpLink = createHttpLink({
    uri: `${getEnv('HASURA_ENDPOINT')}/v1/graphql`,
    headers: {
      'x-hasura-admin-secret': getEnv('HASURA_ADMIN_SECRET'),
    },
  });

  return new ApolloClient({
    cache: new InMemoryCache(),
    link: httpLink,
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'no-cache',
        errorPolicy: 'ignore',
      },
      query: {
        fetchPolicy: 'no-cache',
        errorPolicy: 'all',
      },
    },
  });
};

export const getOrgClient = () => {
  const httpLink = createHttpLink({
    uri: `${getEnv('HASURA_ENDPOINT')}/v1/graphql`,
    headers: {
      'x-hasura-user-id': getEnv('USER_ID'),
      'x-hasura-org-id': getEnv('ORG_KEY'),
      'x-hasura-tenant-name': getEnv('TENANT_NAME'),
      'x-hasura-role': getEnv('ROLE_NAME'),
      'x-hasura-admin-secret': getEnv('HASURA_ADMIN_SECRET'),
    },
  });

  return new ApolloClient({
    cache: new InMemoryCache(),
    link: httpLink,
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'no-cache',
        errorPolicy: 'ignore',
      },
      query: {
        fetchPolicy: 'no-cache',
        errorPolicy: 'all',
      },
    },
  });
};

export const exportIssues = async (
  variables: VariablesOf<typeof ExportIssuesDocument>
) =>
  await getClient().query({
    variables,
    query: ExportIssuesDocument,
  });

export const exportNormalised = async (
  variables: VariablesOf<typeof ExportNormalisedDocument>
) =>
  await getClient().query({
    variables,
    query: ExportNormalisedDocument,
  });

export const exportLinkedRisksAndControlNames = async (
  variables: VariablesOf<typeof ExportLinkedRiskAndControlNameDocument>
) =>
  await getClient().query({
    variables,
    query: ExportLinkedRiskAndControlNameDocument,
  });

export const exportUsers = async (
  variables: VariablesOf<typeof ExportUsersDocument>
) =>
  await getClient().query({
    variables,
    query: ExportUsersDocument,
  });

export const insertAll = async (
  variables: VariablesOf<typeof InsertAllDocument>,
  client: ApolloClient<NormalizedCacheObject> = getClient()
) =>
  await client.mutate({
    variables: variables,
    mutation: InsertAllDocument,
  });

export const updateAll = async (
  variables: VariablesOf<typeof UpdateAllDocument>
) =>
  await getClient().mutate({
    variables: variables,
    mutation: UpdateAllDocument,
  });

export const deleteOrgData = async (
  variables: VariablesOf<typeof DeleteOrgDocument>
) =>
  await getOrgClient().mutate({
    variables: variables,
    mutation: DeleteOrgDocument,
  });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const timeFunction = async (name: string, promise: Promise<any>) => {
  console.log('starting ', name);
  console.time(name);
  await promise;
  console.timeEnd(name);
};

export const insertAllTableByTable = async (
  variables: VariablesOf<typeof InsertAllDocument>
) => {
  await timeFunction(
    'Importing users',
    insertUsers({ users: variables.users })
  );
  await timeFunction(
    'Importing organisation users',
    insertOrganisationUsers({
      organisationUsers: variables.organisationUsers,
    })
  );

  await timeFunction(
    'Importing control groups',
    insertControlGroups({ controlGroups: variables.controlGroups })
  );

  await timeFunction(
    'Importing risks',
    insertRisks({ risks: variables.risks })
  );
  await timeFunction(
    'Importing controls',
    insertControls({ controls: variables.controls })
  );
  await timeFunction(
    'Importing acceptances',
    insertAcceptances({ acceptances: variables.acceptances })
  );
  await timeFunction(
    'Importing appetites',
    insertAppetites({ appetites: variables.appetites })
  );
  await timeFunction(
    'Importing appetite parents',
    insertAppetiteParents({ appetiteParents: variables.appetiteParents })
  );
  await timeFunction(
    'Importing issues',
    insertIssues({ issues: variables.issue })
  );
  await timeFunction(
    'Importing actions',
    insertActions({ actions: variables.actions })
  );
  await timeFunction(
    'Importing causes',
    insertCauses({ causes: variables.causes })
  );
  await timeFunction(
    'Importing consequences',
    insertConsequences({ consequences: variables.consequences })
  );

  await timeFunction(
    'Importing action updates',
    insertActionUpdates({ actionUpdates: variables.actionUpdates })
  );

  await timeFunction(
    'Importing issue updates',
    insertIssueUpdates({ issueUpdates: variables.issueUpdates })
  );

  await timeFunction(
    'Importing departments',
    insertDepartments({ departments: variables.departments })
  );
  await timeFunction(
    'Importing issue assessments',
    insertIssueAssessments({
      issueAssessments: variables.issueAssessment,
    })
  );
  await timeFunction(
    'Importing test results',
    insertTestResults({ testResults: variables.testResults })
  );
  await timeFunction(
    'Importing indicators',
    insertIndicators({ indicators: variables.indicators })
  );
  await timeFunction(
    'Importing indicator results',
    insertIndicatorResults({ indicatorResults: variables.indicatorResults })
  );
  await timeFunction(
    'Importing assessments',
    insertAssessments({ assessments: variables.assessments })
  );
  await timeFunction(
    'Importing obligations',
    insertObligations({ obligations: variables.obligations })
  );
  await timeFunction(
    'Importing tag types',
    insertTagTypes({ tagTypes: variables.tagTypes })
  );
  await timeFunction('Importing tags', insertTags({ tags: variables.tags }));
  await timeFunction(
    'Importing department types',
    insertDepartmentTypes({ departmentTypes: variables.departmentTypes })
  );
  await timeFunction(
    'Importing control parents',
    insertControlParents({ controlParents: variables.controlParents })
  );
  await timeFunction(
    'Importing action parents',
    insertActionParents({ actionParents: variables.actionParents })
  );
  await timeFunction(
    'Importing owners',
    insertOwners({ owners: variables.owners })
  );
  await timeFunction(
    'Importing contributors',
    insertContributors({ contributors: variables.contributors })
  );
  await timeFunction(
    'Importing user groups',
    insertUserGroups({ userGroups: variables.userGroups })
  );
  await timeFunction(
    'Importing owner groups',
    insertOwnerGroups({ ownerGroups: variables.ownerGroups })
  );

  await timeFunction(
    'Importing contributor groups',
    insertContributorGroups({ contributorGroups: variables.contributorGroups })
  );
};
const insertConsequences = async (
  variables: VariablesOf<typeof InsertConsequencesDocument>
) =>
  await getClient().mutate({
    variables: variables,
    mutation: InsertConsequencesDocument,
  });
const insertAcceptances = async (
  variables: VariablesOf<typeof InsertAcceptancesDocument>
) =>
  await getClient().mutate({
    variables: variables,
    mutation: InsertAcceptancesDocument,
  });
const insertActions = async (
  variables: VariablesOf<typeof InsertActionsDocument>
) =>
  await getClient().mutate({
    variables: variables,
    mutation: InsertActionsDocument,
  });
const insertActionUpdates = async (
  variables: VariablesOf<typeof InsertActionUpdatesDocument>
) =>
  await getClient().mutate({
    variables: variables,
    mutation: InsertActionUpdatesDocument,
  });
const insertAppetites = async (
  variables: VariablesOf<typeof InsertAppetitesDocument>
) =>
  await getClient().mutate({
    variables: variables,
    mutation: InsertAppetitesDocument,
  });
const insertAppetiteParents = async (
  variables: VariablesOf<typeof InsertAppetiteParentsDocument>
) =>
  await getClient().mutate({
    variables: variables,
    mutation: InsertAppetiteParentsDocument,
  });
const insertCauses = async (
  variables: VariablesOf<typeof InsertCausesDocument>
) =>
  await getClient().mutate({
    variables: variables,
    mutation: InsertCausesDocument,
  });
const insertActionParents = async (
  variables: VariablesOf<typeof InsertActionParentsDocument>
) =>
  await getClient().mutate({
    variables: variables,
    mutation: InsertActionParentsDocument,
  });
const insertOwners = async (
  variables: VariablesOf<typeof InsertOwnersDocument>
) =>
  await getClient().mutate({
    variables: variables,
    mutation: InsertOwnersDocument,
  });
const insertContributors = async (
  variables: VariablesOf<typeof InsertContributorsDocument>
) =>
  await getClient().mutate({
    variables: variables,
    mutation: InsertContributorsDocument,
  });

const insertContributorGroups = async (
  variables: VariablesOf<typeof InsertContributorGroupsDocument>
) =>
  await getClient().mutate({
    variables: variables,
    mutation: InsertContributorGroupsDocument,
  });
const insertOwnerGroups = async (
  variables: VariablesOf<typeof InsertOwnerGroupsDocument>
) =>
  await getClient().mutate({
    variables: variables,
    mutation: InsertOwnerGroupsDocument,
  });
const insertUserGroups = async (
  variables: VariablesOf<typeof InsertUserGroupsDocument>
) =>
  await getClient().mutate({
    variables: variables,
    mutation: InsertUserGroupsDocument,
  });

const insertIndicators = async (
  variables: VariablesOf<typeof InsertIndicatorsDocument>
) =>
  await getClient().mutate({
    variables: variables,
    mutation: InsertIndicatorsDocument,
  });

const insertControlGroups = async (
  variables: VariablesOf<typeof InsertControlGroupsDocument>
) =>
  await getClient().mutate({
    variables: variables,
    mutation: InsertControlGroupsDocument,
  });
const insertControls = async (
  variables: VariablesOf<typeof InsertControlsDocument>
) =>
  await getClient().mutate({
    variables: variables,
    mutation: InsertControlsDocument,
  });

const insertControlParents = async (
  variables: VariablesOf<typeof InsertControlParentsDocument>
) =>
  await getClient().mutate({
    variables: variables,
    mutation: InsertControlParentsDocument,
  });

const insertDepartments = async (
  variables: VariablesOf<typeof InsertDepartmentsDocument>
) =>
  await getClient().mutate({
    variables: variables,
    mutation: InsertDepartmentsDocument,
  });
const insertDepartmentTypes = async (
  variables: VariablesOf<typeof InsertDepartmentTypesDocument>
) =>
  await getClient().mutate({
    variables: variables,
    mutation: InsertDepartmentTypesDocument,
  });

const insertIssueAssessments = async (
  variables: VariablesOf<typeof InsertIssueAssessmentsDocument>
) =>
  await getClient().mutate({
    variables: variables,
    mutation: InsertIssueAssessmentsDocument,
  });
export const insertIssues = async (
  variables: VariablesOf<typeof InsertIssuesDocument>
) =>
  await getClient().mutate({
    variables: variables,
    mutation: InsertIssuesDocument,
  });
const insertIssueUpdates = async (
  variables: VariablesOf<typeof InsertIssueUpdatesDocument>
) =>
  await getClient().mutate({
    variables: variables,
    mutation: InsertIssueUpdatesDocument,
  });
const insertOrganisationUsers = async (
  variables: VariablesOf<typeof InsertOrganisationUsersDocument>
) =>
  await getClient().mutate({
    variables: variables,
    mutation: InsertOrganisationUsersDocument,
  });

const insertRisks = async (
  variables: VariablesOf<typeof InsertRisksDocument>
) =>
  await getClient().mutate({
    variables: variables,
    mutation: InsertRisksDocument,
  });
const insertTags = async (variables: VariablesOf<typeof InsertTagsDocument>) =>
  await getClient().mutate({
    variables: variables,
    mutation: InsertTagsDocument,
  });
const insertTagTypes = async (
  variables: VariablesOf<typeof InsertTagTypesDocument>
) =>
  await getClient().mutate({
    variables: variables,
    mutation: InsertTagTypesDocument,
  });
const insertTestResults = async (
  variables: VariablesOf<typeof InsertTestResultsDocument>
) =>
  await getClient().mutate({
    variables: variables,
    mutation: InsertTestResultsDocument,
  });
const insertUsers = async (
  variables: VariablesOf<typeof InsertUsersDocument>
) =>
  await getClient().mutate({
    variables: variables,
    mutation: InsertUsersDocument,
  });
const insertAssessments = async (
  variables: VariablesOf<typeof InsertAssessmentsDocument>
) =>
  await getClient().mutate({
    variables: variables,
    mutation: InsertAssessmentsDocument,
  });
const insertObligations = async (
  variables: VariablesOf<typeof InsertObligationsDocument>
) =>
  await getClient().mutate({
    variables: variables,
    mutation: InsertObligationsDocument,
  });
const insertIndicatorResults = async (
  variables: VariablesOf<typeof InsertIndicatorResultsDocument>
) =>
  await getClient().mutate({
    variables: variables,
    mutation: InsertIndicatorResultsDocument,
  });

export const getFormConfiguration = async (
  variables: VariablesOf<typeof GetFormConfigurationDocument>
) =>
  await getClient().query({
    variables: variables,
    query: GetFormConfigurationDocument,
  });

export const getUserByEmail = async (
  variables: VariablesOf<typeof GetUserByEmailDocument>,
  client: ApolloClient<NormalizedCacheObject> = getClient()
) =>
  await client.query({
    variables: variables,
    query: GetUserByEmailDocument,
  });

export const getNodes = async (
  variables: VariablesOf<typeof GetNodesDocument>
) =>
  await getClient().query({
    variables: variables,
    query: GetNodesDocument,
  });

export const reassignUser = async (
  variables: VariablesOf<typeof ReassignUserDocument>
) =>
  await getClient().mutate({
    variables: variables,
    mutation: ReassignUserDocument,
  });

export const getUser = async (variables: VariablesOf<typeof GetUserDocument>) =>
  await getClient().query({
    variables: variables,
    query: GetUserDocument,
  });

export const getRisks = async (
  variables: VariablesOf<typeof GetRisksDocument>
) =>
  await getOrgClient().query({
    variables: variables,
    query: GetRisksDocument,
  });

export const getLinkedItems = async (
  variables: VariablesOf<typeof GetLinkedItemsDocument>
) =>
  await getClient().query({
    variables: variables,
    query: GetLinkedItemsDocument,
  });

export const insertLinkedItem = async (
  variables: VariablesOf<typeof LinkItemsDocument>
) =>
  await getOrgClient().mutate({
    variables: variables,
    mutation: LinkItemsDocument,
  });
