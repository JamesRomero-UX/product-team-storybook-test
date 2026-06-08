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
  documents: ['graphql/**/*.graphql', 'src/**/*.graphql'],
  overwrite: true,
  generates: {
    './generated/graphql.ts': {
      plugins: [
        'typescript',
        'typescript-operations',
        'typed-document-node',
        'typescript-msw',
      ],
      config: {
        enumsAsConst: true,
        scalars: {
          float8: 'number',
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
    './generated/graphql2.ts': {
      plugins: [
        'typescript',
        'typescript-operations',
        'typescript-generic-sdk',
      ],
      config: {
        enumsAsConst: true,
        scalars: {
          float8: 'number',
          smallint: 'number',
          numeric: 'number',
          number: 'float',
          uuid: 'string',
          timestamptz: 'string',
        },
        identifierName: 'namedOperations',
        maybeValue: 'T | null',
        withHooks: true,
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
