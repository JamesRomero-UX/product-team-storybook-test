import type { VariablesOf } from '@graphql-typed-document-node/core';

import type {
  QuestionnaireInviteBoolExp,
  QuestionnaireInviteOrderBy,
} from '../../../generated/graphql';
import {
  GetQuestionnaireInvitesDocument,
  InsertQuestionnaireInviteDocument,
  UpdateQuestionnaireInviteDocument,
} from '../../../generated/graphql';
import { getHasuraBackendClient } from '../../backendGraphqlClient';
import type { FindOptions, RepositoryOptions } from '../types';

export type OrderBy = QuestionnaireInviteOrderBy;
export type Where = QuestionnaireInviteBoolExp;
export type InsertInput = VariablesOf<
  typeof InsertQuestionnaireInviteDocument
>['objects'];
export type UpdateInput = VariablesOf<
  typeof UpdateQuestionnaireInviteDocument
>['set'];

export const QuestionnaireInviteRepository = (
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
      const { data } = await client.query({
        query: GetQuestionnaireInvitesDocument,
        variables: { where, ...options },
      });

      return data.questionnaire_invite;
    },

    async insert(objects: InsertInput) {
      const { data, errors } = await client.mutate({
        mutation: InsertQuestionnaireInviteDocument,
        variables: { objects },
      });

      if (!data?.insert_questionnaire_invite || errors) {
        throw new Error(JSON.stringify(errors));
      }

      return data.insert_questionnaire_invite.returning;
    },

    async update(pk: string, set: UpdateInput) {
      const { data, errors } = await client.mutate({
        mutation: UpdateQuestionnaireInviteDocument,
        variables: { Id: pk, set },
      });

      if (!data?.update_questionnaire_invite_by_pk || errors) {
        throw new Error(JSON.stringify(errors));
      }

      return data.update_questionnaire_invite_by_pk;
    },
  };
};
