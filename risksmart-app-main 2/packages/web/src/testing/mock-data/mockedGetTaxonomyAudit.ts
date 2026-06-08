import type { MockedResponse } from '@apollo/client/testing';
import type {
  GetTaxonomyAuditQuery,
  GetTaxonomyAuditQueryVariables,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetTaxonomyAuditDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { defaultTaxonomy } from 'src/pages/settings/tabs/taxonomy/taxonomyBuilder.testing';

export const mockedGetTaxonomyAudit = (
  variables: GetTaxonomyAuditQueryVariables,
  response: GetTaxonomyAuditQuery = {
    taxonomy_audit: [
      {
        ...defaultTaxonomy,
        __typename: undefined,
      },
    ],
  },
  delay = 0
): MockedResponse<GetTaxonomyAuditQuery, GetTaxonomyAuditQueryVariables> => ({
  delay,
  request: {
    query: GetTaxonomyAuditDocument,
    variables,
  },

  result: {
    data: response,
  },
});
