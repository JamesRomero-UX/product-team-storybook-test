import { BadRequest } from 'http-errors';
import type { InsertInput } from 'src/repositories/questionnaire-invite/questionnaire-invite.repository';
import { QuestionnaireInviteRepository } from 'src/repositories/questionnaire-invite/questionnaire-invite.repository';

import type { ServiceOptions } from '../types';

export const QuestionnaireInviteService = (opts: ServiceOptions) => {
  const questionnaireInviteRepository = QuestionnaireInviteRepository(opts);

  return {
    async findById(id: string) {
      const questionnaireInvite = await questionnaireInviteRepository.findWhere(
        {
          Id: { _eq: id },
        },
        { limit: 1 }
      );

      if (!questionnaireInvite[0]) {
        throw new BadRequest('Questionnaire invite not found');
      }

      return questionnaireInvite[0];
    },

    async insert(objects: InsertInput) {
      return questionnaireInviteRepository.insert(objects);
    },

    async setUser(userId: string, questionnaireInviteId: string) {
      return questionnaireInviteRepository.update(questionnaireInviteId, {
        UserId: userId,
      });
    },
  };
};
