import {
  buildQuestionnaireTemplate,
  buildQuestionnaireTemplateVersion,
  insertQuestionnaireTemplate,
  insertQuestionnaireTemplateVersion,
} from '@risksmart-app/test-data';
import { afterAll, describe, expect, it } from 'vitest';

import { createTestContext } from '../../utils/test-context';

describe('Questionnaire Template Version', () => {
  const contexts: Awaited<ReturnType<typeof createTestContext>>[] = [];

  afterAll(async () => {
    await Promise.all(contexts.map((c) => c.cleanup()));
  });

  it('getById query should return correct data', async () => {
    const ctx = await createTestContext();
    contexts.push(ctx);
    const { orgKey, userId, trpcClient } = ctx;

    const template = await insertQuestionnaireTemplate(
      buildQuestionnaireTemplate(orgKey, userId)
    );

    const { OrgKey, ...insertedProps } = buildQuestionnaireTemplateVersion({
      orgKey,
      userId,
      parentId: template!.Id,
    });
    await insertQuestionnaireTemplateVersion({ OrgKey, ...insertedProps });

    const response =
      await trpcClient.frontend.questionnaireTemplateVersion.getById.query({
        id: insertedProps.Id!,
      });

    expect(response.questionnaire_template_version).toEqual(
      expect.objectContaining({
        Id: insertedProps.Id,
        Version: insertedProps.Version,
        Status: insertedProps.Status,
        ParentId: insertedProps.ParentId,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        parent: expect.objectContaining({
          Id: template!.Id,
          Title: template!.Title,
        }),
      })
    );
  });

  it('getById query should return null for non-existent id', async () => {
    const ctx = await createTestContext();
    contexts.push(ctx);
    const { trpcClient } = ctx;

    const response =
      await trpcClient.frontend.questionnaireTemplateVersion.getById.query({
        id: '00000000-0000-0000-0000-000000000000',
      });

    expect(response.questionnaire_template_version).toBeNull();
  });

  it('getByParentId query should return versions for a template', async () => {
    const ctx = await createTestContext();
    contexts.push(ctx);
    const { orgKey, userId, trpcClient } = ctx;

    const template = await insertQuestionnaireTemplate(
      buildQuestionnaireTemplate(orgKey, userId)
    );

    const version1 = buildQuestionnaireTemplateVersion({
      orgKey,
      userId,
      parentId: template!.Id,
      overrides: { Version: '1.0' },
    });
    const version2 = buildQuestionnaireTemplateVersion({
      orgKey,
      userId,
      parentId: template!.Id,
      overrides: { Version: '2.0' },
    });
    await insertQuestionnaireTemplateVersion(version1);
    await insertQuestionnaireTemplateVersion(version2);

    const response =
      await trpcClient.frontend.questionnaireTemplateVersion.getByParentId.query(
        { parentId: template!.Id }
      );

    expect(response.questionnaire_template_version.length).toEqual(2);
  });

  it('getByParentId query should return empty array for non-existent parent', async () => {
    const ctx = await createTestContext();
    contexts.push(ctx);
    const { trpcClient } = ctx;

    const response =
      await trpcClient.frontend.questionnaireTemplateVersion.getByParentId.query(
        { parentId: '00000000-0000-0000-0000-000000000000' }
      );

    expect(response.questionnaire_template_version).toEqual([]);
  });

  it('getLatest query should return the most recently created version', async () => {
    const ctx = await createTestContext();
    contexts.push(ctx);
    const { orgKey, userId, trpcClient } = ctx;

    const template = await insertQuestionnaireTemplate(
      buildQuestionnaireTemplate(orgKey, userId)
    );

    await insertQuestionnaireTemplateVersion(
      buildQuestionnaireTemplateVersion({
        orgKey,
        userId,
        parentId: template!.Id,
        overrides: { Version: '1.0' },
      })
    );

    const laterVersion = buildQuestionnaireTemplateVersion({
      orgKey,
      userId,
      parentId: template!.Id,
      overrides: { Version: '2.0' },
    });
    await insertQuestionnaireTemplateVersion(laterVersion);

    const response =
      await trpcClient.frontend.questionnaireTemplateVersion.getLatest.query({
        parentId: template!.Id,
      });

    expect(response.questionnaire_template_version).toEqual(
      expect.objectContaining({
        Id: laterVersion.Id,
        Version: '2.0',
        ParentId: template!.Id,
      })
    );
  });

  it('getLatest query should return null for non-existent parent', async () => {
    const ctx = await createTestContext();
    contexts.push(ctx);
    const { trpcClient } = ctx;

    const response =
      await trpcClient.frontend.questionnaireTemplateVersion.getLatest.query({
        parentId: '00000000-0000-0000-0000-000000000000',
      });

    expect(response.questionnaire_template_version).toBeNull();
  });
});
