import type { VariablesOf } from '@graphql-typed-document-node/core';

import type {
  QuestionnaireTemplateVersionBoolExp,
  QuestionnaireTemplateVersionOrderBy,
} from '../../../generated/graphql';
import {
  ArchivePublishedQuestionnaireTemplateVersionDocument,
  GetQuestionnaireTemplateVersionsDocument,
} from '../../../generated/graphql';
import { getHasuraBackendClient } from '../../backendGraphqlClient';
import type { FindOptions, RepositoryOptions } from '../types';

export type OrderBy = QuestionnaireTemplateVersionOrderBy;
export type Where = QuestionnaireTemplateVersionBoolExp;
export type ArchivePublishedInput = VariablesOf<
  typeof ArchivePublishedQuestionnaireTemplateVersionDocument
>;

export const QuestionnaireTemplateVersionRepository = (
  repoOptions: RepositoryOptions
) => {
  const client = getHasuraBackendClient(
    repoOptions.tenant,
    repoOptions.orgKey,
    repoOptions.userId,
    repoOptions.userRole
  );

  return {
    async findWhere(where: Where, options?: FindOptions<OrderBy>) {
      const { data, errors } = await client.query({
        query: GetQuestionnaireTemplateVersionsDocument,
        variables: { where, ...options },
      });
      if (errors) {
        throw errors[0];
      }

      return data.questionnaire_template_version;
    },

    async archivePublish(vars: ArchivePublishedInput) {
      const { data, errors } = await client.mutate({
        mutation: ArchivePublishedQuestionnaireTemplateVersionDocument,
        variables: { ...vars },
      });

      if (!data?.publish?.affected_rows || errors) {
        throw new Error(JSON.stringify(errors));
      }

      if (data.publish.affected_rows < 1) {
        throw new Error('No rows published');
      }

      return data.publish.affected_rows;
    },
  };
};
