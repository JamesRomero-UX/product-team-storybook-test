import type { MockedResponse } from '@apollo/client/testing';
import type {
  GetReportingFilterOptionsQuery,
  GetReportingFilterOptionsQueryVariables,
  ReportingFilterOptionsInput,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetReportingFilterOptionsDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { vi } from 'vitest';

export const mockedGetReportingFilterOptions = (
  input: ReportingFilterOptionsInput,
  response: GetReportingFilterOptionsQuery = {
    reportingFilterOptions: [],
  }
): MockedResponse<
  GetReportingFilterOptionsQuery,
  GetReportingFilterOptionsQueryVariables
> => ({
  request: {
    query: GetReportingFilterOptionsDocument,
    variables: { Input: input },
  },
  newData: vi.fn(() => ({
    data: response,
  })),
});
