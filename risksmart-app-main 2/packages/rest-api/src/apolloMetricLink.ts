import { ApolloLink } from '@apollo/client';

const timeStartLink = new ApolloLink((operation, forward) => {
  operation.setContext({ start: performance.now() });

  return forward(operation);
});

export default timeStartLink;
