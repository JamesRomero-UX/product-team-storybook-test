import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from '../clients/apiClient';
import {
  deleteComment,
  getComments,
  insertComment,
  updateComment,
} from '../clients/commentClient';
import { insertDocument } from '../clients/documentClient';
import { buildComment } from '../data/comment';
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

describe('comment', () => {
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
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should see $expectedRecords comments when conversation has no parent',
      async ({ expectedRecords, ...user }) => {
        const conversation = buildConversation({});
        await apiClient.insertConversation({
          objects: conversation,
        });

        await insertComment(
          buildComment({
            ConversationId: conversation.Id!,
          })
        );

        const comments = await getComments({
          user,
        });
        expect(comments.length).toEqual(expectedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 0 },
      { ...readOnlyUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should see $expectedRecords comments when not an owner/contributor of conversation parent document',
      async ({ expectedRecords, ...user }) => {
        const document = buildDocument();
        await insertDocument(document);
        const conversation = buildConversation({
          ParentId: document.Id,
        });
        await apiClient.insertConversation({
          objects: conversation,
        });

        await insertComment(
          buildComment({
            ConversationId: conversation.Id!,
          })
        );

        const comments = await getComments({
          user,
        });
        expect(comments.length).toEqual(expectedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...readOnlyUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should see $expectedRecords comments when an owner of conversation parent document',
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
        const conversation = buildConversation({
          ParentId: document.Id,
        });
        await apiClient.insertConversation({
          objects: conversation,
        });

        await insertComment(
          buildComment({
            ConversationId: conversation.Id!,
          })
        );

        const comments = await getComments({
          user,
        });
        expect(comments.length).toEqual(expectedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...readOnlyUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should see $expectedRecords comments when a contributor of conversation parent document',
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
        const conversation = buildConversation({
          ParentId: document.Id,
        });
        await apiClient.insertConversation({
          objects: conversation,
        });

        await insertComment(
          buildComment({
            ConversationId: conversation.Id!,
          })
        );

        const comments = await getComments({
          user,
        });
        expect(comments.length).toEqual(expectedRecords);
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
      '$RoleKey should delete $expectedRecords comments',
      async ({ expectedRecords, ...user }) => {
        const conversation = buildConversation({});
        await apiClient.insertConversation({
          objects: conversation,
        });

        const comment = buildComment({
          ConversationId: conversation.Id!,
        });
        await insertComment(comment);

        const result = await deleteComment(comment.Id!, {
          user,
        });
        expect(result.data?.delete_comment?.affected_rows).toEqual(
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
      '$RoleKey should delete $expectedRecords comments when not an owner/contributor of parent document',
      async ({ expectedRecords, ...user }) => {
        const document = buildDocument();
        await insertDocument(document);
        const conversation = buildConversation({
          ParentId: document.Id,
        });
        await apiClient.insertConversation({
          objects: conversation,
        });

        const comment = buildComment({
          ConversationId: conversation.Id!,
        });
        await insertComment(comment);

        const result = await deleteComment(comment.Id!, {
          user,
        });
        expect(result.data?.delete_comment?.affected_rows).toEqual(
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
      '$RoleKey should delete $expectedRecords comments when an owner of parent document',
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

        const comment = buildComment({
          ConversationId: conversation.Id!,
        });
        await insertComment(comment);

        const result = await deleteComment(comment.Id!, {
          user,
        });
        expect(result.data?.delete_comment?.affected_rows).toEqual(
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
      '$RoleKey should delete $expectedRecords comments when a contributor of parent document',
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

        const comment = buildComment({
          ConversationId: conversation.Id!,
        });
        await insertComment(comment);

        const result = await deleteComment(comment.Id!, {
          user,
        });
        expect(result.data?.delete_comment?.affected_rows).toEqual(
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
    ])(
      '$RoleKey can update own comments',
      async ({ expectedRecords, ...user }) => {
        const conversation = buildConversation({});
        await apiClient.insertConversation({
          objects: conversation,
        });

        const comment = buildComment({
          ConversationId: conversation.Id!,
          CreatedByUser: undefined,
          ModifiedByUser: undefined,
          OrgKey: undefined,
          Id: undefined,
        });
        await insertComment(comment, {
          user,
        });

        const comments = await getComments({ user });

        const result = await updateComment(
          {
            Id: comments[0].Id,
            Content: 'Updated',
          },
          {
            user,
          }
        );
        expect(result.data?.update_comment?.affected_rows).toEqual(
          expectedRecords
        );
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])('$RoleKey can NOT update comments from other users', async (user) => {
      const conversation = buildConversation({});
      await apiClient.insertConversation({
        objects: conversation,
      });

      const comment = buildComment({
        ConversationId: conversation.Id!,
      });
      await insertComment(comment, {});

      const comments = await getComments({ user });

      await expect(
        updateComment(
          {
            Id: comments[0].Id,
            Content: 'Updated',
          },
          {
            user,
          }
        )
      ).rejects.toThrow(
        'check constraint of an insert/update permission has failed'
      );
    });
  });

  describe('insert', () => {
    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should insert $expectedRecords comments',
      async ({ expectedRecords, ...user }) => {
        const conversation = buildConversation({});
        await apiClient.insertConversation({
          objects: conversation,
        });

        const result = await insertComment(
          buildComment({
            ConversationId: conversation.Id!,
            CreatedByUser: undefined,
            ModifiedByUser: undefined,
            OrgKey: undefined,
            Id: undefined,
          }),
          {
            user,
          }
        );
        expect(result.data?.insert_comment?.affected_rows).toEqual(
          expectedRecords
        );
      }
    );

    it.each([{ ...riskManagerUser1, expectedRecords: 1 }])(
      '$RoleKey should insert $expectedRecords comments when not the owner/contributor of the parent document',
      async ({ expectedRecords, ...user }) => {
        const document = buildDocument({});
        const conversation = buildConversation({
          ParentId: document.Id,
        });
        await insertDocument(document);
        await apiClient.insertConversation({
          objects: conversation,
        });

        const result = await insertComment(
          buildComment({
            ConversationId: conversation.Id!,
            CreatedByUser: undefined,
            ModifiedByUser: undefined,
            OrgKey: undefined,
            Id: undefined,
          }),
          {
            user,
          }
        );
        expect(result.data?.insert_comment?.affected_rows).toEqual(
          expectedRecords
        );
      }
    );

    it.each([standardUser1, standardEnhancedUser1, internalAuditUser1])(
      '$RoleKey should not insert comments when not the owner/contributor of the parent document',
      async (user) => {
        const document = buildDocument({});
        const conversation = buildConversation({
          ParentId: document.Id,
        });
        await insertDocument(document);
        await apiClient.insertConversation({
          objects: conversation,
        });

        await expect(
          insertComment(
            buildComment({
              ConversationId: conversation.Id!,
              CreatedByUser: undefined,
              ModifiedByUser: undefined,
              OrgKey: undefined,
              Id: undefined,
            }),
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
      '$RoleKey should insert $expectedRecords comments when the owner of the parent document',
      async ({ expectedRecords, ...user }) => {
        const document = buildDocument({
          owners: {
            data: [buildOwner({ UserId: user.Id })],
          },
        });
        const conversation = buildConversation({
          ParentId: document.Id,
        });
        await insertDocument(document);
        await apiClient.insertConversation({
          objects: conversation,
        });

        const result = await insertComment(
          buildComment({
            ConversationId: conversation.Id!,
            CreatedByUser: undefined,
            ModifiedByUser: undefined,
            OrgKey: undefined,
            Id: undefined,
          }),
          {
            user,
          }
        );
        expect(result.data?.insert_comment?.affected_rows).toEqual(
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
      '$RoleKey should insert $expectedRecords comments when the contributor of the parent document',
      async ({ expectedRecords, ...user }) => {
        const document = buildDocument({
          contributors: {
            data: [buildContributor({ UserId: user.Id })],
          },
        });
        const conversation = buildConversation({
          ParentId: document.Id,
        });
        await insertDocument(document);
        await apiClient.insertConversation({
          objects: conversation,
        });

        const result = await insertComment(
          buildComment({
            ConversationId: conversation.Id!,
            CreatedByUser: undefined,
            ModifiedByUser: undefined,
            OrgKey: undefined,
            Id: undefined,
          }),
          {
            user,
          }
        );
        expect(result.data?.insert_comment?.affected_rows).toEqual(
          expectedRecords
        );
      }
    );
  });
});
