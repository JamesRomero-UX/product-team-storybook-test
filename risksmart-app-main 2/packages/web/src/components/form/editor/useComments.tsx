import { useLazyQuery, useMutation } from '@apollo/client';
import useRisksmartUser from '@risksmart-app/components/src/hooks/useRisksmartUser';
import {
  DeleteCommentDocument,
  DeleteConversationDocument,
  DeleteConversationsDocument,
  GetCommentsByConversationIdDocument,
  InsertCommentDocument,
  InsertConversationDocument,
  ResolveConversationDocument,
  UpdateCommentDocument,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { MutableRefObject } from 'react';
import type { Editor as TinyEditor } from 'tinymce';

import { isPermissionError } from '@/utils/graphqlUtils';

import type {
  ConversationLookupResponse,
  ConversationRequest,
  CreateRequest,
  CreateResponse,
  DeleteCommentRequest,
  DeleteResponse,
  DoneFunc,
  EditCommentRequest,
  EditCommentResponse,
  FailFunc,
  ReplyRequest,
  ReplyResponse,
  ResolveRequest,
  ResolveResponse,
} from './TinyTypes';

export const useComments = (
  editorRef: MutableRefObject<null | TinyEditor> | undefined,
  { ParentId }: { ParentId?: string }
) => {
  const { user } = useRisksmartUser();

  const [insertConversation] = useMutation(InsertConversationDocument);
  const [insertComment] = useMutation(InsertCommentDocument);
  const [deleteComment] = useMutation(DeleteCommentDocument);
  const [resolveConversation] = useMutation(ResolveConversationDocument);
  const [deleteConversation] = useMutation(DeleteConversationDocument);
  const [deleteConversations] = useMutation(DeleteConversationsDocument);
  const [updateComment] = useMutation(UpdateCommentDocument);
  const [getCommentsByConversationId] = useLazyQuery(
    GetCommentsByConversationIdDocument,
    {
      fetchPolicy: 'no-cache',
    }
  );

  return {
    tinycomments_mode: 'callback',

    tinycomments_create: async (
      req: CreateRequest,
      done: DoneFunc<CreateResponse>,
      fail: FailFunc
    ) => {
      if (!ParentId) {
        return;
      }
      try {
        const result = await insertConversation({
          variables: {
            Content: req.content,
            ParentId,
          },
        });
        const response = {
          conversationUid: result.data!.insert_conversation_one!.Id,
        };
        done(response);
      } catch (e) {
        fail(e);
      }
    },

    tinycomments_reply: async (
      req: ReplyRequest,
      done: DoneFunc<ReplyResponse>,
      fail: FailFunc
    ) => {
      try {
        const response = await insertComment({
          variables: {
            Content: req.content,
            ConversationId: req.conversationUid,
          },
        });
        done({
          commentUid: response.data!.insert_comment_one!.Id,
        });
      } catch (e) {
        fail(e);
      }
    },

    tinycomments_edit_comment: async (
      req: EditCommentRequest,
      done: DoneFunc<EditCommentResponse>,
      fail: FailFunc
    ) => {
      try {
        await updateComment({
          variables: {
            Id: req.commentUid,
            Content: req.content,
          },
        });
        done({
          canEdit: true,
        });
      } catch (e) {
        if (isPermissionError(e)) {
          done({
            canEdit: false,
          });

          return;
        }

        fail(e);
      }
    },

    tinycomments_delete: async (
      req: ConversationRequest,
      done: DoneFunc<DeleteResponse>,
      fail: FailFunc
    ) => {
      try {
        await deleteConversation({
          variables: {
            Id: req.conversationUid,
          },
        });
        done({ canDelete: true });
      } catch (ex) {
        fail(ex);
      }
    },
    tinycomments_resolve: async (
      req: ResolveRequest,
      done: DoneFunc<ResolveResponse>,
      fail: FailFunc
    ) => {
      try {
        await resolveConversation({
          variables: {
            Id: req.conversationUid,
          },
        });
        done({ canResolve: true });
      } catch (e) {
        fail(e);
      }
    },

    tinycomments_delete_all: async (
      req: unknown,
      done: DoneFunc<DeleteResponse>,
      fail: FailFunc
    ) => {
      if (!editorRef?.current) {
        return;
      }
      const conversations = editorRef.current.annotator.getAll('tinycomments');
      const conversationIds = Object.entries(conversations).map(
        ([conversationId]) => conversationId
      );
      try {
        await deleteConversations({
          variables: {
            Ids: conversationIds,
          },
        });
        done({ canDelete: true });
      } catch (e) {
        fail(e);
      }
    },

    tinycomments_delete_comment: async (
      req: DeleteCommentRequest,
      done: DoneFunc<DeleteResponse>,
      fail: FailFunc
    ) => {
      try {
        await deleteComment({
          variables: {
            Id: req.commentUid,
          },
        });
        done({
          canDelete: true,
        });
      } catch (e) {
        fail(e);
      }
    },

    tinycomments_lookup: async (
      req: ConversationRequest,
      done: DoneFunc<ConversationLookupResponse>,
      fail: FailFunc
    ) => {
      try {
        const result = await getCommentsByConversationId({
          variables: {
            ConversationId: req.conversationUid,
          },
        });
        const response = {
          conversation: {
            uid: req.conversationUid,
            comments:
              result.data?.comment.map((c) => ({
                author: c.CreatedByUser,
                authorName: c.createdByUser?.FriendlyName || '-',
                createdAt: c.CreatedAtTimestamp,
                content: c.Content,
                modifiedAt: c.ModifiedAtTimestamp,
                uid: c.Id,
              })) || [],
          },
        };
        done(response);
      } catch (e) {
        fail(e);
      }
    },
    tinycomments_author: user?.userId,
    tinycomments_author_name: user?.claims_username,
  };
};
