import type { MockedResponse } from '@apollo/client/testing';
import type {
  GetReportingDataQuery,
  GetReportingDataQueryVariables,
  ReportingDataInput,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetReportingDataDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { vi } from 'vitest';

export const mockedGetReportData = (
  input: ReportingDataInput,
  response: GetReportingDataQuery = {
    reportingData: [],
  }
): MockedResponse<GetReportingDataQuery, GetReportingDataQueryVariables> => ({
  request: {
    query: GetReportingDataDocument,
    variables: { Input: input },
  },
  newData: vi.fn(() => ({
    data: response,
  })),
});
