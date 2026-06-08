import type { ApolloQueryResult, Operation } from '@apollo/client';
import {
  ApolloClient,
  ApolloLink,
  ApolloProvider,
  HttpLink,
  InMemoryCache,
  split,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { useChangeRequestFileUpdate } from '@risksmart-app/components/src/file/useFileUpdate';
import useRisksmartUser from '@risksmart-app/components/src/hooks/useRisksmartUser';
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import { getEnv } from '@risksmart-app/components/src/utils/environment';
import type { GetActionByIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import {
  GetActionByIdDocument,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { GraphQLError } from 'graphql';
import { createClient } from 'graphql-ws';
import type { ReactNode } from 'react';
import { useCallback, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { ConfirmChangeRequestModal } from 'src/components/change-requests-preview/ConfirmChangeRequestModal';

import { handleError } from '@/utils/errorUtils';
import { evictField } from '@/utils/graphqlUtils';

import apolloMetricLink from './apolloMetricLink';

export default function ApolloGraphqlProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { addNotification } = useNotifications();
  const { getAccessTokenSilently, getIdTokenClaims } = useRisksmartUser();
  const [
    confirmChangeRequestModalVisible,
    setConfirmChangeRequestModalVisible,
  ] = useState(false);
  const [approvalOperation, setApprovalOperation] = useState<null | Operation>(
    null
  );

  const errorLink = useMemo(
    () =>
      // Log any GraphQL errors or network error that occurred
      //https://www.apollographql.com/docs/react/api/link/apollo-link-error
      onError(({ graphQLErrors, networkError, operation, forward }) => {
        if (graphQLErrors) {
          // Note: types are not correct, as graphqlErrors appears to be a simple object in some (maybe all cases) rather then an Exception like object
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          graphQLErrors.forEach((error: any) => {
            if (
              error.message.includes(
                'You need to create a change request to perform this action.'
              )
            ) {
              setConfirmChangeRequestModalVisible(true);
              setApprovalOperation(operation);

              return false;
            }

            const captureContext = {
              extra: {
                operationName: operation.operationName,
              },
            };
            if (error instanceof GraphQLError) {
              handleError(error, captureContext, operation.operationName);
            } else if ('message' in error) {
              // Avoids the "Object captured as exception with keys: extensions, message" message in Sentry, and get a unique error message instead
              handleError(
                error.message,
                {
                  extra: {
                    operationName: operation.operationName,
                    ...error,
                  },
                },
                operation.operationName
              );
            } else {
              handleError(error, captureContext, operation.operationName);
            }
          });
        }
        if (networkError) {
          handleError(
            networkError,
            {
              extra: {
                operationName: operation.operationName,
              },
            },
            operation.operationName
          );

          // Retry operation
          return forward(operation);
        }
      }),
    []
  );

  const getAuthHeaders = useCallback(async () => {
    let accessToken = null;
    let claims = null;
    const headers: Record<string, string> = {};

    try {
      accessToken = await getAccessTokenSilently();
      claims = await getIdTokenClaims();
    } catch (error) {
      // Ignore the error if the refresh token is invalid, as this is expected to happen at some point.
      if ((error as Error)?.message !== 'Unknown or invalid refresh token.') {
        throw error;
      }
    } finally {
      // Logout if access token is not available
      if (!accessToken) {
        window.location.href = '/logout';
      }
    }

    if (accessToken) {
      headers.authorization = `Bearer ${accessToken}`;
    }
    if (claims?.claims_tenant) {
      const tenant = claims.claims_tenant;
      headers['x-tenant-name'] = tenant.toLowerCase();
    }

    return { headers };
  }, [getAccessTokenSilently, getIdTokenClaims]);

  const client = useMemo(() => {
    const authLink = setContext(async (_, { headers }) => {
      const { headers: newHeaders } = await getAuthHeaders();
      const combinedHeaders = {
        ...headers,
        ...newHeaders,
      };

      return { headers: combinedHeaders };
    });

    const customUrlFetch = async (
      uri: RequestInfo | URL,
      options: RequestInit | undefined
    ) => {
      uri = getEnv('REACT_APP_TENANT_API_URL') + '/v1/graphql';

      if (options) {
        options.mode = 'cors';
      }

      return fetch(uri, options);
    };

    const httpLink = new HttpLink({
      fetch: customUrlFetch,
    });

    const wsLink = new GraphQLWsLink(
      createClient({
        url: async () => {
          if (getEnv('REACT_APP_ENVIRONMENT', true) === 'dev-local') {
            return getEnv('REACT_APP_WS_TENANT_API_URL');
          }
          const { headers } = await getAuthHeaders();
          const tenantName = headers['x-tenant-name'];
          const hostName = getEnv('REACT_APP_WS_TENANT_API_URL');

          return `${hostName}/${tenantName}/v1/graphql`;
        },
        connectionParams: async () => {
          const { headers } = await getAuthHeaders();

          return { headers };
        },
      })
    );

    const splitLink = split(
      ({ query }) => {
        const definition = getMainDefinition(query);

        return (
          definition.kind === 'OperationDefinition' &&
          definition.operation === 'subscription'
        );
      },
      wsLink,
      httpLink
    );

    return new ApolloClient({
      // uncomment to debug caching issues in dev
      // connectToDevTools: true,
      // link: authLink.concat(httpLink),
      link: ApolloLink.from([apolloMetricLink, errorLink, authLink, splitLink]),
      cache: new InMemoryCache(),
    });
  }, [errorLink, getAuthHeaders]);

  const { updateFiles } = useChangeRequestFileUpdate();

  return (
    <ApolloProvider client={client}>
      {confirmChangeRequestModalVisible && (
        <ConfirmChangeRequestModal
          onDismiss={() => setConfirmChangeRequestModalVisible(false)}
          onConfirm={(requesterComment) => {
            if (!approvalOperation) {
              return;
            }
            toast.dismiss();
            addNotification({
              type: 'promise',
              // TODO: translation
              successMessage: 'Change request confirmed',
              // TODO: translation
              errorMessage: 'Failed to confirm change request',
              promise: (async () => {
                const result = await client.mutate({
                  mutation: approvalOperation.query,
                  variables: approvalOperation.variables,
                  context: {
                    ...approvalOperation.getContext(),
                    headers: {
                      ...approvalOperation.getContext()?.headers,
                      'x-confirm-change-request': 'true',
                      ...(requesterComment
                        ? {
                            'x-requester-comment':
                              encodeURIComponent(requesterComment),
                          }
                        : {}),
                    },
                  },
                });

                const parentId =
                  result?.data?.updateChildAction?.change_request_id;

                if (
                  parentId &&
                  (approvalOperation.operationName === 'updateAction' ||
                    approvalOperation.operationName === 'closeAction')
                ) {
                  const action: ApolloQueryResult<GetActionByIdQuery> =
                    await client.query({
                      query: GetActionByIdDocument,
                      variables: { _eq: approvalOperation.variables.Id },
                      fetchPolicy: 'no-cache',
                    });

                  const originalFiles = action?.data?.action[0]?.files || [];

                  await updateFiles({
                    parentType: Parent_Type_Enum.ChangeRequest,
                    parentId: parentId,
                    originalFiles: originalFiles
                      .map((originalFile) => originalFile.file)
                      .filter((originalFile) => !!originalFile),
                    selectedFiles: approvalOperation?.variables?.files,
                  });
                }

                evictField(client.cache, 'change_request');

                return client.refetchQueries({ include: ['all'] });
              })(),
            });
          }}
        />
      )}
      {children}
    </ApolloProvider>
  );
}
