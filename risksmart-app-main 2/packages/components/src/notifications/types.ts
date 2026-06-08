import type * as React from 'react';

export type NotificationDetail =
  | {
      type: 'promise';
      promise: Promise<unknown>;
      successMessage: React.ReactNode;
      errorMessage: React.ReactNode;
      loadingMessage?: React.ReactNode;
    }
  | {
      type?: 'error' | 'success';
      content: React.ReactNode;
    };
