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
  documents: ['src/**/*.graphql'],
  overwrite: true,
  generates: {
    'src/generated/graphql.ts': {
      plugins: ['typescript', 'typescript-operations', 'typed-document-node'],
      config: {
        onlyOperationTypes: true,
        scalars: {
          smallint: 'number',
          numeric: 'number',
          number: 'float',
          uuid: 'string',
          timestamptz: 'string',
        },
        maybeValue: 'T | null',
        federation: true,
        namingConvention: {
          typeNames: 'change-case-all#pascalCase',
          transformUnderscore: true,
        },
      },
    },
  },
};

export default config;
