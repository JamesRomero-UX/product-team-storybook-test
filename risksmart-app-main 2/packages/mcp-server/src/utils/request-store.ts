import { AsyncLocalStorage } from 'node:async_hooks';

export interface RequestStore {
  correlationId: string;
}

export const requestStore = new AsyncLocalStorage<RequestStore>();
