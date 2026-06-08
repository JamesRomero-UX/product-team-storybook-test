import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: [
    {
      'http://localhost:8080/v1/graphql': {
        headers: {
          'x-hasura-admin-secret': 'myadminsecretkey',
          'x-hasura-role': 'CustomerSupport',
        },
      },
    },
  ],
  documents: ['./graphql/**/*.graphql'],
  overwrite: true,
  generates: {
    './generated/graphql.ts': {
      plugins: ['typescript', 'typescript-operations', 'typed-document-node', 'named-operations-object', './plugins/cache-field-names.js'],
      config: {
        onlyOperationTypes: true,
        scalars: {
          float8: 'number',
          smallint: 'number',
          numeric: 'number',
          number: 'float',
          uuid: 'string',
          timestamptz: 'string',
        },
        identifierName: 'namedOperations',
        avoidOptionals: false,
        maybeValue: 'T | null | undefined',
        enumsAsConst: true,
        federation: true,
      },
    },
  },
};

export default config;
