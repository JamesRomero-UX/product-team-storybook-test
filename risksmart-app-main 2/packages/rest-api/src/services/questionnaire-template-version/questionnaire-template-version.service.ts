import { BadRequest } from 'http-errors';

import {
  OrderBy,
  QuestionnaireTemplateVersionStatusEnum,
} from '../../../generated/graphql';
import type { ArchivePublishedInput } from '../../repositories/questionnaire-template-version/questionnaire-template-version.repository';
import { QuestionnaireTemplateVersionRepository } from '../../repositories/questionnaire-template-version/questionnaire-template-version.repository';
import type { ServiceOptions } from '../types';

export const QuestionnaireTemplateVersionService = (opts: ServiceOptions) => {
  const questionnaireTemplateVersionRepo =
    QuestionnaireTemplateVersionRepository(opts);

  return {
    async findById(id: string) {
      const questionnaireTemplateVersion =
        await questionnaireTemplateVersionRepo.findWhere(
          {
            Id: { _eq: id },
          },
          { limit: 1 }
        );

      if (!questionnaireTemplateVersion[0]) {
        throw new BadRequest('Questionnaire template version not found');
      }

      return questionnaireTemplateVersion[0];
    },

    async findLatestPublishedByParentId(parentId: string) {
      const questionnaireTemplateVersions =
        await questionnaireTemplateVersionRepo.findWhere(
          {
            ParentId: { _eq: parentId },
            Status: { _eq: QuestionnaireTemplateVersionStatusEnum.Published },
          },
          { limit: 1, orderBy: [{ CreatedAtTimestamp: OrderBy.Desc }] }
        );

      if (!questionnaireTemplateVersions[0]) {
        return null;
      }

      return questionnaireTemplateVersions[0];
    },

    async archivePublish(id: string, payload: ArchivePublishedInput) {
      const current = (
        await questionnaireTemplateVersionRepo.findWhere(
          { Id: { _eq: id } },
          { limit: 1 }
        )
      )[0];

      if (!current) {
        throw new BadRequest('Questionnaire template version not found');
      }

      switch (current.Status) {
        case QuestionnaireTemplateVersionStatusEnum.Published:
          throw new BadRequest('Version is already published');
        case QuestionnaireTemplateVersionStatusEnum.Archived:
          throw new BadRequest('Version is archived');
      }
      await questionnaireTemplateVersionRepo.archivePublish(payload);
    },
  };
};
