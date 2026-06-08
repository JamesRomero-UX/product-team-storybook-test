import {
  buildQuestionnaireTemplate,
  insertQuestionnaireTemplate,
} from '@risksmart-app/test-data';
import { afterAll, describe, expect, it } from 'vitest';

import { createTestContext } from '../../utils/test-context';

describe('Questionnaire Template', () => {
  const contexts: Awaited<ReturnType<typeof createTestContext>>[] = [];

  afterAll(async () => {
    await Promise.all(contexts.map((c) => c.cleanup()));
  });

  it('register query should return correct data', async () => {
    const ctx = await createTestContext();
    contexts.push(ctx);
    const { orgKey, userId, trpcClient } = ctx;

    const { OrgKey, ...insertedProps } = buildQuestionnaireTemplate(
      orgKey,
      userId
    );
    await insertQuestionnaireTemplate({ OrgKey, ...insertedProps });
    await insertQuestionnaireTemplate(
      buildQuestionnaireTemplate(orgKey, userId)
    );

    const response =
      await trpcClient.frontend.questionnaireTemplate.register.query();

    expect(response.questionnaire_template.length).toEqual(2);
    expect(response.questionnaire_template).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          ...insertedProps,
          ancestorContributors: [],
          contributorGroups: [],
          contributors: [],
          departments: [],
          draftVersions: [],
          nonDraftVersions: [],
          ownerGroups: [],
          owners: [],
          publishedVersion: [],
          tags: [],
        }),
      ])
    );
  });

  it('register query should return empty array when no templates exist', async () => {
    const ctx = await createTestContext();
    contexts.push(ctx);
    const { trpcClient } = ctx;

    const response =
      await trpcClient.frontend.questionnaireTemplate.register.query();

    expect(response.questionnaire_template).toEqual([]);
  });

  it('getById query should return correct data', async () => {
    const ctx = await createTestContext();
    contexts.push(ctx);
    const { orgKey, userId, trpcClient } = ctx;

    const { OrgKey, ...insertedProps } = buildQuestionnaireTemplate(
      orgKey,
      userId
    );
    await insertQuestionnaireTemplate({ OrgKey, ...insertedProps });

    const response =
      await trpcClient.frontend.questionnaireTemplate.getById.query({
        id: insertedProps.Id!,
      });

    expect(response.questionnaire_template).toEqual(
      expect.objectContaining({
        ...insertedProps,
        ancestorContributors: [],
        contributorGroups: [],
        contributors: [],
        departments: [],
        draftVersions: [],
        nonDraftVersions: [],
        ownerGroups: [],
        owners: [],
        publishedVersion: [],
        tags: [],
      })
    );
  });

  it('getById query should throw for non-existent id', async () => {
    const ctx = await createTestContext();
    contexts.push(ctx);
    const { trpcClient } = ctx;

    await expect(
      trpcClient.frontend.questionnaireTemplate.getById.query({
        id: '00000000-0000-0000-0000-000000000000',
      })
    ).rejects.toThrow();
  });
});
