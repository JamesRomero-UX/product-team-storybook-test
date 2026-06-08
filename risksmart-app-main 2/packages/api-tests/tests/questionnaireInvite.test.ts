import { createServer } from '@mswjs/http-middleware';
import type { DefaultBodyType } from 'msw';
import { http, HttpResponse } from 'msw';
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { apiClient } from '../clients/apiClient';
import { insertQuestionnaireTemplate } from '../clients/questionnaireTemplateClient';
import { buildOwner } from '../data/owner';
import { buildQuestionnaireInvite } from '../data/questionnaireInvite';
import { buildQuestionnaireTemplate } from '../data/questionnaireTemplate';
import { buildQuestionnaireTemplateVersion } from '../data/questionnaireTemplateVersion';
import { buildThirdParty } from '../data/thirdParty';
import { buildThirdPartyResponse } from '../data/thirdPartyResponse';
import {
  internalAuditUser1,
  readOnlyUser1,
  riskManagerUser1,
  setup,
  standardEnhancedUser1,
  standardUser1,
  teardown,
  thirdPartyRespondent1,
} from '../initialData';

const mockedDefaults = vi.hoisted(() => {
  return {
    getDefaultOrgId: vi.fn(),
    getAnotherOrgId: vi.fn(),
    getDefaultUserId: vi.fn(),
  };
});

vi.mock('../clients/defaults', () => mockedDefaults);

const requests: { id: string; body: DefaultBodyType }[] = [];

export const handlers = [
  http.post('/*', async ({ params, request }) => {
    requests.push({
      id: JSON.stringify(params),
      body: await request.json(),
    });

    return HttpResponse.json({ success: true }, { status: 200 });
  }),
];

const httpServer = createServer({}, ...handlers);

describe('Questionnaire Invite', () => {
  beforeAll(() => {
    httpServer.listen(9091);
  });

  beforeEach(async () => {
    await setup(mockedDefaults);
  });
  afterEach(async () => {
    await teardown();
  });

  describe('query', () => {
    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 0 },
      { ...readOnlyUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 0 },
      { ...internalAuditUser1, expectedRecords: 1 },
      { ...thirdPartyRespondent1, expectedRecords: 0 },
    ])(
      '$RoleKey should see $expectedRecords invitations when they are not an owner or contributor of the parent',
      async ({ expectedRecords, ...user }) => {
        const version = buildQuestionnaireTemplateVersion();
        const thirdParty = buildThirdParty();
        const response = buildThirdPartyResponse({
          ParentId: thirdParty.Id,
          QuestionnaireTemplateVersionId: version.Id,
        });

        await insertQuestionnaireTemplate(
          buildQuestionnaireTemplate({
            versions: {
              data: [version],
            },
          })
        );
        await apiClient.insertThirdParty({
          objects: thirdParty,
        });
        await apiClient.insertThirdPartyResponse({
          objects: [response],
        });
        await apiClient.insertQuestionnaireInvite({
          objects: [
            buildQuestionnaireInvite({
              ThirdPartyId: thirdParty.Id,
              QuestionnaireTemplateVersionId: version.Id,
              ParentId: response.Id,
            }),
          ],
        });

        const invites = await apiClient.getQuestionnaireInvite(
          {
            where: {},
          },
          { user }
        );
        expect(invites.questionnaire_invite.length).toBe(expectedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...readOnlyUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
      { ...thirdPartyRespondent1, expectedRecords: 0 },
    ])(
      '$RoleKey should see $expectedRecords versions when they are an owner',
      async ({ expectedRecords, ...user }) => {
        const version = buildQuestionnaireTemplateVersion();
        const thirdParty = buildThirdParty({
          owners: {
            data: [buildOwner({ UserId: user.Id })],
          },
        });
        const response = buildThirdPartyResponse({
          ParentId: thirdParty.Id,
          QuestionnaireTemplateVersionId: version.Id,
        });

        await insertQuestionnaireTemplate(
          buildQuestionnaireTemplate({
            versions: {
              data: [version],
            },
          })
        );
        await apiClient.insertThirdParty({
          objects: thirdParty,
        });
        await apiClient.insertThirdPartyResponse({
          objects: [response],
        });
        await apiClient.insertQuestionnaireInvite({
          objects: [
            buildQuestionnaireInvite({
              ThirdPartyId: thirdParty.Id,
              QuestionnaireTemplateVersionId: version.Id,
              ParentId: response.Id,
            }),
          ],
        });

        const invites = await apiClient.getQuestionnaireInvite(
          {
            where: {},
          },
          { user }
        );
        expect(invites.questionnaire_invite.length).toBe(expectedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...readOnlyUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
      { ...thirdPartyRespondent1, expectedRecords: 0 },
    ])(
      '$RoleKey should see $expectedRecords versions when they are a contributor',
      async ({ expectedRecords, ...user }) => {
        const version = buildQuestionnaireTemplateVersion();
        const thirdParty = buildThirdParty({
          contributors: {
            data: [buildOwner({ UserId: user.Id })],
          },
        });
        const response = buildThirdPartyResponse({
          ParentId: thirdParty.Id,
          QuestionnaireTemplateVersionId: version.Id,
        });

        await insertQuestionnaireTemplate(
          buildQuestionnaireTemplate({
            versions: {
              data: [version],
            },
          })
        );
        await apiClient.insertThirdParty({
          objects: thirdParty,
        });
        await apiClient.insertThirdPartyResponse({
          objects: [response],
        });
        await apiClient.insertQuestionnaireInvite({
          objects: [
            buildQuestionnaireInvite({
              ThirdPartyId: thirdParty.Id,
              QuestionnaireTemplateVersionId: version.Id,
              ParentId: response.Id,
            }),
          ],
        });

        const invites = await apiClient.getQuestionnaireInvite(
          {
            where: {},
          },
          { user }
        );
        expect(invites.questionnaire_invite.length).toBe(expectedRecords);
      }
    );
  });

  describe('Insert action', () => {
    it.each([
      { ...standardUser1, expectedRecords: 0 },
      { ...readOnlyUser1, expectedRecords: 0 },
      { ...standardEnhancedUser1, expectedRecords: 0 },
      { ...internalAuditUser1, expectedRecords: 0 },
      { ...thirdPartyRespondent1, expectedRecords: 0 },
      { ...riskManagerUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should be able to insert $expectedRecords invitations when they are not an owner or contributor of the parent',
      async ({ expectedRecords, ...user }) => {
        const version = buildQuestionnaireTemplateVersion();
        const thirdParty = buildThirdParty();
        const response = buildThirdPartyResponse({
          ParentId: thirdParty.Id,
          QuestionnaireTemplateVersionId: version.Id,
        });

        await insertQuestionnaireTemplate(
          buildQuestionnaireTemplate({
            versions: {
              data: [version],
            },
          })
        );
        await apiClient.insertThirdParty({
          objects: thirdParty,
        });
        await apiClient.insertThirdPartyResponse({
          objects: [response],
        });

        if (expectedRecords === 0) {
          await expect(
            apiClient.inviteThirdParty(
              {
                ThirdPartyId: thirdParty.Id!,
                QuestionnaireTemplateVersionIds: [version.Id!],
                UserEmails: [
                  thirdPartyRespondent1.Email ?? 'supplier1@user.com',
                ],
                Message: 'Hello world',
              },
              { user }
            )
          ).rejects.toThrowError(
            'You do not have permission to perform this action'
          );
        } else {
          const { insertQuestionnaireInvites } =
            await apiClient.inviteThirdParty(
              {
                ThirdPartyId: thirdParty.Id!,
                QuestionnaireTemplateVersionIds: [version.Id!],
                UserEmails: [
                  thirdPartyRespondent1.Email ?? 'supplier1@user.com',
                ],
                Message: 'Hello world',
              },
              { user }
            );

          expect(insertQuestionnaireInvites.affected_rows).toBe(
            expectedRecords
          );
        }
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...readOnlyUser1, expectedRecords: 0 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
      { ...thirdPartyRespondent1, expectedRecords: 0 },
    ])(
      '$RoleKey should be able to insert $expectedRecords invitations when they are an owner or contributor of the parent',
      async ({ expectedRecords, ...user }) => {
        const version = buildQuestionnaireTemplateVersion();
        const thirdParty = buildThirdParty({
          owners: {
            data: [buildOwner({ UserId: user.Id })],
          },
        });
        const response = buildThirdPartyResponse({
          ParentId: thirdParty.Id,
          QuestionnaireTemplateVersionId: version.Id,
        });

        await insertQuestionnaireTemplate(
          buildQuestionnaireTemplate({
            versions: {
              data: [version],
            },
          })
        );
        await apiClient.insertThirdParty({
          objects: thirdParty,
        });
        await apiClient.insertThirdPartyResponse({
          objects: [response],
        });

        if (expectedRecords === 0) {
          await expect(
            apiClient.inviteThirdParty(
              {
                ThirdPartyId: thirdParty.Id!,
                QuestionnaireTemplateVersionIds: [version.Id!],
                UserEmails: [
                  thirdPartyRespondent1.Email ?? 'supplier1@user.com',
                ],
                Message: 'Hello world',
              },
              { user }
            )
          ).rejects.toThrowError(
            'You do not have permission to perform this action'
          );
        } else {
          const { insertQuestionnaireInvites } =
            await apiClient.inviteThirdParty(
              {
                ThirdPartyId: thirdParty.Id!,
                QuestionnaireTemplateVersionIds: [version.Id!],
                UserEmails: [
                  thirdPartyRespondent1.Email ?? 'supplier1@user.com',
                ],
                Message: 'Hello world',
              },
              { user }
            );

          expect(insertQuestionnaireInvites.affected_rows).toBe(
            expectedRecords
          );
        }
      }
    );
  });
});
