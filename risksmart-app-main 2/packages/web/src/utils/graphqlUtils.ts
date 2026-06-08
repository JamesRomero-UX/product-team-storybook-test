import type { ApolloCache } from '@apollo/client';
import { isApolloError } from '@apollo/client';
import type { CacheFieldName } from '@risksmart-app/web-graphql-client/generated/graphql';

export type { CacheFieldName };

export const evictField = <T>(
  cache: ApolloCache<T>,
  fieldName: CacheFieldName
) => {
  cache.evict({
    id: 'ROOT_QUERY',
    fieldName: fieldName,
  });
  cache.gc();
};

export const isPermissionError = (e: unknown) => {
  return (
    e instanceof Error &&
    isApolloError(e) &&
    e.graphQLErrors.length > 0 &&
    e.graphQLErrors[0].extensions?.code === 'permission-error'
  );
};

export enum HasuraErrorCodes {
  ConstraintError = 'constraint-violation',
  PermissionError = 'permission-error',
  UnexpectedError = 'unexpected',
  ValidationFailed = 'validation-failed',
}
