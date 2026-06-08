import { QuestionnaireTemplateVersionStatus } from '@risksmart-app/domain/src/types/consts/questionnaire-template-version-status';
import type { DrizzleClient } from '@risksmart-app/drizzle/src/db';
import { createDrizzleClient } from '@risksmart-app/drizzle/src/db';
import { getQuestionnaireTemplatesQueryConfig } from '@risksmart-app/drizzle/src/queries/questionnaire-template.query';
import { questionnaire_template_version } from '@risksmart-app/drizzle/src/schema';
import { filter } from '@risksmart-app/permitio/src/permit';
import { and, desc, eq, inArray, not } from 'drizzle-orm';

import type { QuestionnaireTemplateRow } from '../../types/index';
import type {
  QuestionnaireTemplateService,
  ServiceContext,
} from '../service.types';

const FIRST_ONE_ONLY = 1;

const getVersions = async (
  db: DrizzleClient,
  templates: QuestionnaireTemplateRow[],
  limit?: number
) => {
  const publishedVersion = await db.org((tx) => {
    return tx
      .selectDistinctOn([questionnaire_template_version.ParentId])
      .from(questionnaire_template_version)
      .where(
        and(
          inArray(
            questionnaire_template_version.ParentId,
            templates.map((item) => item.Id)
          ),
          eq(
            questionnaire_template_version.Status,
            QuestionnaireTemplateVersionStatus.Published
          )
        )
      )
      .orderBy(
        desc(questionnaire_template_version.ParentId),
        desc(questionnaire_template_version.CreatedAtTimestamp)
      )
      .limit(limit || (null as unknown as number));
  });

  const nonDraftVersions = await db.org((tx) => {
    return tx
      .selectDistinctOn([questionnaire_template_version.ParentId])
      .from(questionnaire_template_version)
      .where(
        and(
          inArray(
            questionnaire_template_version.ParentId,
            templates.map((item) => item.Id)
          ),
          not(
            eq(
              questionnaire_template_version.Status,
              QuestionnaireTemplateVersionStatus.Draft
            )
          )
        )
      )
      .orderBy(
        desc(questionnaire_template_version.ParentId),
        desc(questionnaire_template_version.CreatedAtTimestamp)
      )
      .limit(limit || (null as unknown as number));
  });

  const draftVersions = await db.org((tx) => {
    return tx
      .selectDistinctOn([questionnaire_template_version.ParentId])
      .from(questionnaire_template_version)
      .where(
        and(
          inArray(
            questionnaire_template_version.ParentId,
            templates.map((item) => item.Id)
          ),
          eq(
            questionnaire_template_version.Status,
            QuestionnaireTemplateVersionStatus.Draft
          )
        )
      )
      .orderBy(
        desc(questionnaire_template_version.ParentId),
        desc(questionnaire_template_version.CreatedAtTimestamp)
      )
      .limit(limit || (null as unknown as number));
  });

  return {
    publishedVersion,
    nonDraftVersions,
    draftVersions,
  };
};

export class QuestionnaireTemplateServiceImpl implements QuestionnaireTemplateService {
  async getQuestionnaireTemplatesRegister(ctx: ServiceContext) {
    const db = await createDrizzleClient(ctx);

    // Query questionnaire templates with comprehensive relationships
    const data = await db.org((tx) => {
      return tx.query.questionnaire_template.findMany({
        ...getQuestionnaireTemplatesQueryConfig,
      });
    });

    const filteredQuestionnaireTemplates =
      await filter<QuestionnaireTemplateRow>(
        data,
        'rs_node',
        (entity: QuestionnaireTemplateRow) => entity.Id,
        ctx.userId,
        ctx.orgId
      );

    const { publishedVersion, nonDraftVersions, draftVersions } =
      await getVersions(db, filteredQuestionnaireTemplates);

    return {
      questionnaire_template: filteredQuestionnaireTemplates.map((t) => ({
        ...t,
        draftVersions: draftVersions.filter((v) => v.ParentId === t.Id),
        nonDraftVersions: nonDraftVersions.filter((v) => v.ParentId === t.Id),
        publishedVersion: publishedVersion.filter((v) => v.ParentId === t.Id),
      })),
    };
  }

  async getQuestionnaireTemplateById(ctx: ServiceContext, id: string) {
    const db = await createDrizzleClient(ctx);

    // Query questionnaire template by Id with comprehensive relationships
    const data = await db.org((tx) => {
      return tx.query.questionnaire_template.findFirst({
        ...getQuestionnaireTemplatesQueryConfig,
        where: { Id: id },
      });
    });

    if (!data) {
      throw new Error('Questionnaire Template not found');
    }

    const hasAccess = await filter<QuestionnaireTemplateRow>(
      [data],
      'rs_node',
      (entity: QuestionnaireTemplateRow) => entity.Id,
      ctx.userId,
      ctx.orgId
    );

    if (hasAccess.length === 0) {
      throw new Error('Access denied to the requested Questionnaire Template');
    }

    const { publishedVersion, nonDraftVersions, draftVersions } =
      await getVersions(db, [data], FIRST_ONE_ONLY);

    return {
      questionnaire_template: {
        ...data,
        draftVersions: draftVersions.filter((v) => v.ParentId === data.Id),
        nonDraftVersions: nonDraftVersions.filter(
          (v) => v.ParentId === data.Id
        ),
        publishedVersion: publishedVersion.filter(
          (v) => v.ParentId === data.Id
        ),
      },
    };
  }
}
