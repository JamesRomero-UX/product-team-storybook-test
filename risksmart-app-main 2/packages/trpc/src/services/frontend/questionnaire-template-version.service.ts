import { createDrizzleClient } from '@risksmart-app/drizzle/src/db';
import { getQuestionnaireTemplateVersionByIdQueryConfig } from '@risksmart-app/drizzle/src/queries/questionnaire-template-version.query';
import { filter } from '@risksmart-app/permitio/src/permit';
import { desc } from 'drizzle-orm';

import type {
  QuestionnaireTemplateVersionById,
  QuestionnaireTemplateVersionByIdResponse,
  QuestionnaireTemplateVersionByParentIdResponse,
} from '../../types/index';
import type {
  QuestionnaireTemplateVersionService,
  ServiceContext,
} from '../service.types';

export class QuestionnaireTemplateVersionServiceImpl implements QuestionnaireTemplateVersionService {
  async getLatestQuestionnaireTemplateVersionByParentId(
    ctx: ServiceContext,
    parentId: string
  ): Promise<QuestionnaireTemplateVersionByIdResponse> {
    const db = await createDrizzleClient(ctx);

    const data = await db.org((tx) => {
      return tx.query.questionnaire_template_version.findFirst({
        ...getQuestionnaireTemplateVersionByIdQueryConfig,
        where: { ParentId: parentId },
        orderBy: (table) => desc(table.CreatedAtTimestamp),
      });
    });

    const filtered = data
      ? await filter(
          [data],
          'rs_node',
          (entity: QuestionnaireTemplateVersionById) => entity.Id,
          ctx.userId,
          ctx.orgId
        )
      : [];

    return {
      questionnaire_template_version: filtered[0] ?? null,
    };
  }
  async getQuestionnaireTemplateVersionsByParentId(
    ctx: ServiceContext,
    parentId: string
  ): Promise<QuestionnaireTemplateVersionByParentIdResponse> {
    const db = await createDrizzleClient(ctx);

    const data = await db.org((tx) => {
      return tx.query.questionnaire_template_version.findMany({
        ...getQuestionnaireTemplateVersionByIdQueryConfig,
        where: { ParentId: parentId },
      });
    });

    const filtered = await filter<QuestionnaireTemplateVersionById>(
      data,
      'rs_node',
      (entity: QuestionnaireTemplateVersionById) => entity.Id,
      ctx.userId,
      ctx.orgId
    );

    return {
      questionnaire_template_version: filtered,
    };
  }

  async getQuestionnaireTemplateVersionById(
    ctx: ServiceContext,
    id: string
  ): Promise<QuestionnaireTemplateVersionByIdResponse> {
    const db = await createDrizzleClient(ctx);

    const data = await db.org((tx) => {
      return tx.query.questionnaire_template_version.findFirst({
        ...getQuestionnaireTemplateVersionByIdQueryConfig,
        where: { Id: id },
      });
    });

    const filtered = data
      ? await filter(
          [data],
          'rs_node',
          (entity: QuestionnaireTemplateVersionById) => entity.Id,
          ctx.userId,
          ctx.orgId
        )
      : [];

    return {
      questionnaire_template_version: filtered[0] ?? null,
    };
  }
}
