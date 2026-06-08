import type { MockedResponse } from '@apollo/client/testing';
import type {
  GetObjectTypeByIdQuery,
  GetObjectTypeByIdQueryVariables,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import {
  GetObjectTypeByIdDocument,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';

export const mockedGetObjectTypeByIdResponse: MockedResponse<
  GetObjectTypeByIdQuery,
  GetObjectTypeByIdQueryVariables
> = {
  request: {
    query: GetObjectTypeByIdDocument,
    variables: {
      Id: 'parent-id',
    },
  },
  result: {
    data: {
      node: {
        ObjectType: Parent_Type_Enum.DocumentFile,
      },
    },
  },
};
