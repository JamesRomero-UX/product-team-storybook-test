import {
  ApolloClient,
  ApolloLink,
  createHttpLink,
  InMemoryCache,
} from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import type { Feature } from '@risksmart-app/shared/src/organisation/Feature';
import type { Meta } from '@risksmart-app/shared/src/organisation/Meta';
import fetch from 'cross-fetch';

import type {
  AttestationRecordInsertInput,
  DepartmentTypeInsertInput,
  RiskScoringModelEnum,
  TagTypeInsertInput,
} from './generated/graphql';
import {
  DeleteAllDocument,
  DeleteSsoConfigDocument,
  GetChangeRequestByActionTitleDocument,
  GetChangeRequestByDocumentTitleDocument,
  GetDocumentFileByDocumentTitleDocument,
  GetIssueAssessmentChangeRequestByIssueTitleDocument,
  GetIssueChangeRequestByIssueTitleDocument,
  InsertAttestationRecordsDocument,
  InsertDepartmentTypesDocument,
  InsertRiskAssessmentResultConfigDocument,
  InsertTagTypesDocument,
  RecalculateRiskScoresDocument,
  UpdateOrganisationDocument,
  UpsertAggregationDocument,
} from './generated/graphql';
import { getOrganisation } from './organisationPool';
import type { RiskAssessmentResultConfigInput } from './testData/riskAssessmentResultConfig';

// Log any GraphQL errors or network error that occurred
//https://www.apollographql.com/docs/react/api/link/apollo-link-error
const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach((error) => {
      console.error(JSON.stringify(error), operation.operationName);
    });
  }
  if (networkError) {
    console.error(JSON.stringify(networkError), operation.operationName);
  }
});

const getClient = (options?: { orgKey?: string }) => {
  const httpLink = createHttpLink({
    fetch,
    uri: 'http://localhost:8080/v1/graphql',
    headers: {
      'x-hasura-admin-secret': 'myadminsecretkey',
      ...(options?.orgKey ? { 'x-hasura-org-id': options?.orgKey } : {}),
    },
  });

  const client = new ApolloClient({
    cache: new InMemoryCache(),
    link: ApolloLink.from([errorLink, httpLink]),
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

  return client;
};

export const deleteAll = async () => {
  const orgKey = getOrganisation().orgKey;
  await getClient().mutate({
    variables: { OrgKey: orgKey },
    mutation: DeleteAllDocument,
  });
};

const updateOrganisation = async (orgKey: string, meta: Meta) => {
  await getClient().mutate({
    variables: { Meta: meta, OrgKey: orgKey },
    mutation: UpdateOrganisationDocument,
  });
};

export const upsertAggregation = async (
  riskScoreModel: RiskScoringModelEnum
) => {
  const orgKey = getOrganisation().orgKey;
  await getClient().mutate({
    variables: {
      aggregationOrgs: {
        OrgKey: orgKey,
        RiskScoringModel: riskScoreModel,
        CreatedAtTimestamp: new Date().toISOString(),
        ModifiedAtTimestamp: new Date().toISOString(),
      },
    },
    mutation: UpsertAggregationDocument,
  });
};

export const updateOrganisationFeatures = async (features: Feature[]) => {
  const orgKey = getOrganisation().orgKey;
  await updateOrganisation(orgKey, { features: features.join(',') });
};

export const refreshRiskScores = async () => {
  const orgKey = getOrganisation().orgKey;
  await getClient({ orgKey }).mutate({
    mutation: RecalculateRiskScoresDocument,
  });
};

export const deleteSsoConfigurations = async () => {
  const orgKey = getOrganisation().orgKey;
  await getClient({ orgKey }).mutate({
    mutation: DeleteSsoConfigDocument,
    variables: {
      object: {
        clientId: 'rs-e2e-client-id',
      },
    },
  });
};

export const insertTagTypes = async (tagTypes: TagTypeInsertInput[]) => {
  const orgKey = getOrganisation().orgKey;
  const now = new Date().toISOString();
  await getClient({ orgKey }).mutate({
    mutation: InsertTagTypesDocument,
    variables: {
      objects: tagTypes.map((tag) => ({
        ...tag,
        OrgKey: orgKey,
        CreatedAtTimestamp: now,
        ModifiedAtTimestamp: now,
        ModifiedByUser: 'SYSTEM',
        CreatedByUser: 'SYSTEM',
      })),
    },
  });
};

export const insertDepartmentTypes = async (
  departmentTypes: DepartmentTypeInsertInput[]
) => {
  const orgKey = getOrganisation().orgKey;
  const now = new Date().toISOString();
  await getClient({ orgKey }).mutate({
    mutation: InsertDepartmentTypesDocument,
    variables: {
      objects: departmentTypes.map((type) => ({
        ...type,
        OrgKey: orgKey,
        CreatedAtTimestamp: now,
        ModifiedAtTimestamp: now,
        ModifiedByUser: 'SYSTEM',
        CreatedByUser: 'SYSTEM',
      })),
    },
  });
};

export const getChangeRequestByActionTitle = async (actionTitle: string) => {
  const orgKey = getOrganisation().orgKey;
  const { data } = await getClient({ orgKey }).query({
    query: GetChangeRequestByActionTitleDocument,
    variables: { actionTitle: actionTitle },
  });

  return data.change_request[0];
};

export const getChangeRequestByDocumentTitle = async (
  documentTitle: string
) => {
  const orgKey = getOrganisation().orgKey;
  const { data } = await getClient({ orgKey }).query({
    query: GetChangeRequestByDocumentTitleDocument,
    variables: { documentTitle: documentTitle },
  });

  return data.change_request[0];
};

export const getIssueAssessmentChangeRequestByIssueTitle = async (
  issueTitle: string
) => {
  const orgKey = getOrganisation().orgKey;
  const { data } = await getClient({ orgKey }).query({
    query: GetIssueAssessmentChangeRequestByIssueTitleDocument,
    variables: { issueTitle: issueTitle },
  });

  return data.change_request[0];
};

export const getIssueChangeRequestByIssueTitle = async (issueTitle: string) => {
  const orgKey = getOrganisation().orgKey;
  const { data } = await getClient({ orgKey }).query({
    query: GetIssueChangeRequestByIssueTitleDocument,
    variables: { issueTitle: issueTitle },
  });

  return data.change_request[0];
};

export const insertAttestationRecords = async (
  attestationRecords: AttestationRecordInsertInput[]
) => {
  const orgKey = getOrganisation().orgKey;
  const now = new Date().toISOString();
  await getClient({ orgKey }).mutate({
    mutation: InsertAttestationRecordsDocument,
    variables: {
      objects: attestationRecords.map((record) => ({
        ...record,
        OrgKey: orgKey,
        CreatedAtTimestamp: now,
        ModifiedAtTimestamp: now,
        ModifiedByUser: 'SYSTEM',
        CreatedByUser: 'SYSTEM',
      })),
    },
  });
};

export const getDocumentFileByDocumentTitle = async (title: string) => {
  const orgKey = getOrganisation().orgKey;
  const { data } = await getClient({ orgKey }).query({
    query: GetDocumentFileByDocumentTitleDocument,
    variables: { title },
  });

  return data.document_file[0];
};

export const insertScoringSettings = async (
  config: RiskAssessmentResultConfigInput
) => {
  const orgKey = getOrganisation().orgKey;
  const now = new Date().toISOString();
  await getClient({ orgKey }).mutate({
    mutation: InsertRiskAssessmentResultConfigDocument,
    variables: {
      object: {
        Config: config,
        OrgKey: orgKey,
        CreatedAtTimestamp: now,
        ModifiedAtTimestamp: now,
        ModifiedByUser: 'SYSTEM',
        CreatedByUser: 'SYSTEM',
      },
    },
  });
};
