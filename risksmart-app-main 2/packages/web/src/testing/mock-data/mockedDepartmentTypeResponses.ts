import type { MockedResponse } from '@apollo/client/testing';
import type {
  GetDepartmentsQuery,
  GetDepartmentsQueryVariables,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetDepartmentsDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

export const mockedDepartmentsResponse: MockedResponse<
  GetDepartmentsQuery,
  GetDepartmentsQueryVariables
> = {
  request: {
    query: GetDepartmentsDocument,
  },
  result: {
    data: {
      department_type: [],
    },
  },
};
