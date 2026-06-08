import { AxiosError, AxiosHeaders } from 'axios';

import { getErrorMessage } from '@/utils/errorUtils';

describe('errorUtils', () => {
  describe('getErrorMessage', () => {
    it('parses error message', () => {
      const result = getErrorMessage(new AxiosError('New error from Axios'));
      expect(result).toBe('New error from Axios');
    });
    it('parses error object', () => {
      const result = getErrorMessage(
        new AxiosError(undefined, undefined, undefined, undefined, {
          data: { message: 'New error from Axios' },
          status: 404,
          statusText: 'Not Found',
          headers: {},
          config: {
            headers: new AxiosHeaders({}),
          },
        })
      );
      expect(result).toBe('New error from Axios');
    });
  });
});
