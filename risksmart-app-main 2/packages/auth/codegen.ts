import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: [
    {
      'http://localhost:8080/v1/graphql': {
        headers: {
          'x-hasura-admin-secret': 'myadminsecretkey',
        },
      },
    },
  ],
  documents: ['**/code.ts'],
  overwrite: true,
  generates: {
    './generated/graphql.ts': {
      plugins: [
        'typescript',
        'typescript-operations',
        'typed-document-node',
        'named-operations-object',
      ],
      config: {
        onlyOperationTypes: true,
        scalars: {
          smallint: 'number',
          numeric: 'number',
          number: 'float',
          uuid: 'string',
          timestamptz: 'string',
        },
        identifierName: 'namedOperations',
        avoidOptionals: false,
        maybeValue: 'T | null | undefined',
        federation: true,
        enumsAsConst: true,
      },
    },
  },
};

export default config;
