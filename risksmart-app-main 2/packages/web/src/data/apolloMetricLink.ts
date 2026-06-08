import type { Operation } from '@apollo/client';
import { ApolloLink } from '@apollo/client';
import * as Sentry from '@sentry/react';
import { Kind, OperationTypeNode } from 'graphql';

const isSubscription = (operation: Operation) =>
  !!operation.query.definitions.find(
    (d) =>
      d.kind === Kind.OPERATION_DEFINITION &&
      d.operation == OperationTypeNode.SUBSCRIPTION
  );

const isMutation = (operation: Operation) =>
  !!operation.query.definitions.find(
    (d) =>
      d.kind === Kind.OPERATION_DEFINITION &&
      d.operation == OperationTypeNode.MUTATION
  );

const timeStartLink = new ApolloLink((operation, forward) => {
  const querySpan = !isSubscription(operation)
    ? Sentry.startInactiveSpan({
        name: operation.operationName,
        op: isMutation(operation)
          ? 'http.graphql.mutation'
          : 'http.graphql.query',
      })
    : null;
  operation.setContext({ start: performance.now(), querySpan });

  return forward(operation);
});

const logTimeLink = new ApolloLink((operation, forward) => {
  return forward(operation).map((data) => {
    if (!isSubscription(operation)) {
      const context = operation.getContext();
      if (context.querySpan) {
        context.querySpan.end();
      }
    }

    return data;
  });
});

const apolloMetricLink = timeStartLink.concat(logTimeLink);

export default apolloMetricLink;
