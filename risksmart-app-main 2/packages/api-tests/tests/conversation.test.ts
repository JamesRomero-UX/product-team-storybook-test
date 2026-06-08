import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from '../clients/apiClient';
import { insertDocument } from '../clients/documentClient';
import { buildContributor } from '../data/contributor';
import { buildConversation } from '../data/conversation';
import { buildDocument } from '../data/document';
import { buildOwner } from '../data/owner';
import {
  internalAuditUser1,
  readOnlyUser1,
  riskManagerUser1,
  setup,
  standardEnhancedUser1,
  standardUser1,
  teardown,
} from '../initialData';

const mockedDefaults = vi.hoisted(() => {
  return {
    getDefaultOrgId: vi.fn(),
    getAnotherOrgId: vi.fn(),
    getDefaultUserId: vi.fn(),
  };
});

vi.mock('../clients/defaults', () => mockedDefaults);

describe('conversation', () => {
  beforeEach(async () => {
    await setup(mockedDefaults);
  });
  afterEach(async () => {
    await teardown();
  });

  describe('query', () => {
    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...readOnlyUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should see $expectedRecords conversations if there is no parent',
      async ({ expectedRecords, ...user }) => {
        await apiClient.insertConversation({
          objects: buildConversation({}),
        });

        const conversations = await apiClient.getConversations(
          {},
          {
            user,
          }
        );
        expect(conversations.conversation.length).toEqual(expectedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 0 },
      { ...readOnlyUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should see $expectedRecords conversations when not an owner/contributor of the parent document',
      async ({ expectedRecords, ...user }) => {
        const document = buildDocument({});
        await insertDocument(document);
        await apiClient.insertConversation({
          objects: buildConversation({
            ParentId: document.Id,
          }),
        });

        const conversations = await apiClient.getConversations(
          {},
          {
            user,
          }
        );
        expect(conversations.conversation.length).toEqual(expectedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...readOnlyUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should see $expectedRecords conversations when an owner of the parent document',
      async ({ expectedRecords, ...user }) => {
        const document = buildDocument({
          owners: {
            data: [buildOwner({ UserId: user.Id })],
          },
        });
        await insertDocument(document);
        await apiClient.insertConversation({
          objects: buildConversation({
            ParentId: document.Id,
          }),
        });

        const conversations = await apiClient.getConversations(
          {},
          {
            user,
          }
        );
        expect(conversations.conversation.length).toEqual(expectedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...readOnlyUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should see $expectedRecords conversations when a contributor of the parent document',
      async ({ expectedRecords, ...user }) => {
        const document = buildDocument({
          contributors: {
            data: [buildContributor({ UserId: user.Id })],
          },
        });
        await insertDocument(document);
        await apiClient.insertConversation({
          objects: buildConversation({
            ParentId: document.Id,
          }),
        });

        const conversations = await apiClient.getConversations(
          {},
          {
            user,
          }
        );
        expect(conversations.conversation.length).toEqual(expectedRecords);
      }
    );
  });

  describe('delete', () => {
    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
      // TODO: enable when we have a single hasura role
      // { ...readOnlyUser1, expectedRecords: 0 },
    ])(
      '$RoleKey should delete $expectedRecords conversations if there is no parent',
      async ({ expectedRecords, ...user }) => {
        const conversation = buildConversation({});
        await apiClient.insertConversation({
          objects: conversation,
        });

        const result = await apiClient.deleteConversation(
          { Id: conversation.Id! },
          {
            user,
          }
        );
        expect(result?.delete_conversation?.affected_rows).toEqual(
          expectedRecords
        );
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 0 },
      { ...standardEnhancedUser1, expectedRecords: 0 },
      { ...internalAuditUser1, expectedRecords: 0 },
      // TODO: enable when we have a single hasura role
      // { ...readOnlyUser1, expectedRecords: 0 },
    ])(
      '$RoleKey should delete $expectedRecords conversations if not the owner/contributor of the parent document',
      async ({ expectedRecords, ...user }) => {
        const document = buildDocument();
        await insertDocument(document);
        const conversation = buildConversation({
          ParentId: document.Id,
        });
        await apiClient.insertConversation({
          objects: conversation,
        });

        const result = await apiClient.deleteConversation(
          { Id: conversation.Id! },
          {
            user,
          }
        );
        expect(result?.delete_conversation?.affected_rows).toEqual(
          expectedRecords
        );
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
      // TODO: enable when we have a single hasura role
      // { ...readOnlyUser1, expectedRecords: 0 },
    ])(
      '$RoleKey should delete $expectedRecords conversations the owner of the parent document',
      async ({ expectedRecords, ...user }) => {
        const document = buildDocument({
          owners: {
            data: [buildOwner({ UserId: user.Id })],
          },
        });
        await insertDocument(document);
        const conversation = buildConversation({
          ParentId: document.Id,
        });
        await apiClient.insertConversation({
          objects: conversation,
        });

        const result = await apiClient.deleteConversation(
          { Id: conversation.Id! },
          {
            user,
          }
        );
        expect(result?.delete_conversation?.affected_rows).toEqual(
          expectedRecords
        );
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
      // TODO: enable when we have a single hasura role
      // { ...readOnlyUser1, expectedRecords: 0 },
    ])(
      '$RoleKey should delete $expectedRecords conversations the contributor of the parent document',
      async ({ expectedRecords, ...user }) => {
        const document = buildDocument({
          contributors: {
            data: [buildContributor({ UserId: user.Id })],
          },
        });
        await insertDocument(document);
        const conversation = buildConversation({
          ParentId: document.Id,
        });
        await apiClient.insertConversation({
          objects: conversation,
        });

        const result = await apiClient.deleteConversation(
          { Id: conversation.Id! },
          {
            user,
          }
        );
        expect(result?.delete_conversation?.affected_rows).toEqual(
          expectedRecords
        );
      }
    );
  });

  describe('update', () => {
    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
      // TODO: enable when we have a single hasura role
      // { ...readOnlyUser1, expectedRecords: 0 },
    ])(
      '$RoleKey should update $expectedRecords conversations without a parent',
      async ({ expectedRecords, ...user }) => {
        const conversation = buildConversation({});
        await apiClient.insertConversation({
          objects: conversation,
        });

        const result = await apiClient.updateConversation(
          {
            Id: conversation.Id!,
            IsResolved: true,
          },
          {
            user,
          }
        );
        expect(result?.update_conversation?.affected_rows).toEqual(
          expectedRecords
        );
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 0 },
      { ...standardEnhancedUser1, expectedRecords: 0 },
      { ...internalAuditUser1, expectedRecords: 0 },
      // TODO: enable when we have a single hasura role
      // { ...readOnlyUser1, expectedRecords: 0 },
    ])(
      '$RoleKey should update $expectedRecords conversations when not the contributor/owner of the parent document',
      async ({ expectedRecords, ...user }) => {
        const document = buildDocument({});
        await insertDocument(document);
        const conversation = buildConversation({
          ParentId: document.Id,
        });
        await apiClient.insertConversation({
          objects: conversation,
        });

        const result = await apiClient.updateConversation(
          {
            Id: conversation.Id!,
            IsResolved: true,
          },
          {
            user,
          }
        );
        expect(result?.update_conversation?.affected_rows).toEqual(
          expectedRecords
        );
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
      // TODO: enable when we have a single hasura role
      // { ...readOnlyUser1, expectedRecords: 0 },
    ])(
      '$RoleKey should update $expectedRecords conversations when the owner of the parent document',
      async ({ expectedRecords, ...user }) => {
        const document = buildDocument({
          owners: {
            data: [buildOwner({ UserId: user.Id })],
          },
        });
        await insertDocument(document);
        const conversation = buildConversation({
          ParentId: document.Id,
        });
        await apiClient.insertConversation({
          objects: conversation,
        });

        const result = await apiClient.updateConversation(
          {
            Id: conversation.Id!,
            IsResolved: true,
          },
          {
            user,
          }
        );
        expect(result?.update_conversation?.affected_rows).toEqual(
          expectedRecords
        );
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
      // TODO: enable when we have a single hasura role
      // { ...readOnlyUser1, expectedRecords: 0 },
    ])(
      '$RoleKey should update $expectedRecords conversations when the contributor of the parent document',
      async ({ expectedRecords, ...user }) => {
        const document = buildDocument({
          contributors: {
            data: [buildContributor({ UserId: user.Id })],
          },
        });
        await insertDocument(document);
        const conversation = buildConversation({
          ParentId: document.Id,
        });
        await apiClient.insertConversation({
          objects: conversation,
        });

        const result = await apiClient.updateConversation(
          {
            Id: conversation.Id!,
            IsResolved: true,
          },
          {
            user,
          }
        );
        expect(result?.update_conversation?.affected_rows).toEqual(
          expectedRecords
        );
      }
    );
  });

  describe('insert', () => {
    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should insert $expectedRecords conversations without a parent',
      async ({ expectedRecords, ...user }) => {
        const result = await apiClient.insertConversation(
          {
            objects: buildConversation({
              CreatedByUser: undefined,
              ModifiedByUser: undefined,
              OrgKey: undefined,
              Id: undefined,
            }),
          },
          {
            user,
          }
        );
        expect(result?.insert_conversation?.affected_rows).toEqual(
          expectedRecords
        );
      }
    );

    it.each([{ ...riskManagerUser1, expectedRecords: 1 }])(
      '$RoleKey should insert $expectedRecords conversations when not the owner/contributor of the parent document',
      async ({ expectedRecords, ...user }) => {
        const document = buildDocument({});
        await insertDocument(document);

        const result = await apiClient.insertConversation(
          {
            objects: buildConversation({
              CreatedByUser: undefined,
              ModifiedByUser: undefined,
              OrgKey: undefined,
              Id: undefined,
              ParentId: document.Id,
            }),
          },
          {
            user,
          }
        );
        expect(result?.insert_conversation?.affected_rows).toEqual(
          expectedRecords
        );
      }
    );

    it.each([standardUser1, standardEnhancedUser1, internalAuditUser1])(
      '$RoleKey fail to insert conversation when not the owner/contributor of the parent document',
      async (user) => {
        const document = buildDocument({});
        await insertDocument(document);

        await expect(
          apiClient.insertConversation(
            {
              objects: buildConversation({
                CreatedByUser: undefined,
                ModifiedByUser: undefined,
                OrgKey: undefined,
                Id: undefined,
                ParentId: document.Id,
              }),
            },
            {
              user,
            }
          )
        ).rejects.toThrow(
          'check constraint of an insert/update permission has failed'
        );
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should insert $expectedRecords conversations when a contributor of the parent document',
      async ({ expectedRecords, ...user }) => {
        const document = buildDocument({
          contributors: {
            data: [
              buildContributor({
                UserId: user.Id,
              }),
            ],
          },
        });
        await insertDocument(document);

        const result = await apiClient.insertConversation(
          {
            objects: buildConversation({
              CreatedByUser: undefined,
              ModifiedByUser: undefined,
              OrgKey: undefined,
              Id: undefined,
              ParentId: document.Id,
            }),
          },
          {
            user,
          }
        );
        expect(result?.insert_conversation?.affected_rows).toEqual(
          expectedRecords
        );
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should insert $expectedRecords conversations when an owner of the parent document',
      async ({ expectedRecords, ...user }) => {
        const document = buildDocument({
          owners: {
            data: [
              buildOwner({
                UserId: user.Id,
              }),
            ],
          },
        });
        await insertDocument(document);

        const result = await apiClient.insertConversation(
          {
            objects: buildConversation({
              CreatedByUser: undefined,
              ModifiedByUser: undefined,
              OrgKey: undefined,
              Id: undefined,
              ParentId: document.Id,
            }),
          },
          {
            user,
          }
        );
        expect(result?.insert_conversation?.affected_rows).toEqual(
          expectedRecords
        );
      }
    );
  });
});
