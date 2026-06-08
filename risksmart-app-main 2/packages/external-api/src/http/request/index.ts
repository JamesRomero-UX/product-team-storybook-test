import {
  createProcessItemListResponse,
  createProcessItemResponse,
} from '../response/index';
import type { QueryItemRequestConfig } from './item.request';
import { queryItemRequests } from './item.request';
import type { QueryListRequestConfig } from './list.request';
import { queryListRequests } from './list.request';

export const createQueryItemRequestHandler = (config: QueryItemRequestConfig) =>
  queryItemRequests({
    config,
    processItemResponses: createProcessItemResponse(),
  });

export const createQueryItemListRequestHandler = (
  config: QueryListRequestConfig
) =>
  queryListRequests({
    config,
    processListResponses: createProcessItemListResponse(),
  });

export {
  getServiceContext,
  getServiceContextWithActor,
} from './service-context';
