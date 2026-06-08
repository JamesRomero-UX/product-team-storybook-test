export type FailFunc = (e: unknown) => void;

export type DoneFunc<T> = (e: T) => void;

export type ConversationLookupResponse = {
  conversation: {
    uid: string; // the uid of the conversation,
    comments: {
      author: string; // author of first comment
      authorName: string; // optional - Display name to use instead of author. Defaults to using `author` if not specified
      authorAvatar?: string; // optional - URL to the author's avatar. If not provided an automated avatar will be generated
      createdAt: string; // when the first comment was created
      content: string; // content of first comment
      modifiedAt: string; // when the first comment was created/last updated
      uid: string; // the uid of the first comment in the conversation
    }[];
  };
};

export type EditCommentRequest = {
  conversationUid: string; //The uid of the conversation the reply is targeting.
  commentUid: string; //The uid of the comment to edit (it can be the same as conversationUid if editing the first comment in a conversation).
  content: string; //The content of the comment to create.
  modifiedAt: string; //The date the comment was modified.
};

export type EditCommentResponse = {
  canEdit: boolean; // whether or not the Edit succeeded
  reason?: string; // an optional string explaining why the edit was not allowed (if canEdit is false)
};

export type ResolveRequest = {
  conversationUid: string;
};

export type ResolveResponse = {
  canResolve: boolean;
};

export type ConversationRequest = {
  conversationUid: string;
};

export type CreateRequest = {
  content: string;
  createdAt: string;
};

export type CreateResponse = {
  conversationUid: string;
};

export type DeleteResponse = {
  canDelete: boolean; // whether or not the conversation/comment can be deleted
  reason?: string; // an optional string explaining why the delete was not allowed (if canDelete is false)
};

export type DeleteCommentRequest = {
  conversationUid: string; //The uid of the conversation the reply is targeting.
  commentUid: string; //The uid of the comment to delete (cannot be the same as conversationUid).
};

export type ReplyRequest = {
  conversationUid: string; //The uid of the conversation the reply is targeting.
  content: string; //The content of the comment to create.
  createdAt: string; //The date the comment was created.
};

export type ReplyResponse = {
  commentUid: string; // the value of the new comment uid
};
