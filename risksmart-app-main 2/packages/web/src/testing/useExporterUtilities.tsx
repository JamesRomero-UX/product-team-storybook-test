import type { MockedResponse } from '@apollo/client/testing/core';
import { renderHook, waitFor } from '@testing-library/react';
import _ from 'lodash';
import type { Content, ContentText } from 'pdfmake/interfaces';
import { act } from 'react';
import { vi } from 'vitest';

import { download } from '@/utils/pdf/downloader';

import { defaultMocks } from './mock-data';
import { getWrapper } from './wrapper';

export const getExportedDocument = async <
  Result extends readonly [() => Promise<void>, { loading: boolean }],
  Props,
>(
  useExporterHook: (initialProps: Props) => Result,
  graphqlMocks: MockedResponse[]
): Promise<Content[]> => {
  const { result } = renderHook(useExporterHook, {
    wrapper: getWrapper(
      [...defaultMocks, ...graphqlMocks],
      'notification',
      'graphql',
      'i18n',
      'router',
      'features'
    ),
  });

  await waitFor(() => result.current);

  const [exportFunc] = result.current;

  await act(async () => await exportFunc());

  return vi.mocked(download).mock.calls[0][0].content as Content[];
};

export const getPdfField = (contentArray: Content[], fieldName: string) => {
  return (
    contentArray.find((item) => {
      if (!Array.isArray(item)) {
        return false;
      }

      return _.isEqual(item[0], { text: `${fieldName}:`, style: 'label' });
    }) as (ContentText | undefined)[]
  )?.[1]?.text;
};
