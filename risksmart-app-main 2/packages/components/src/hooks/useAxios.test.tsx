import { render } from '@testing-library/react';

import {
  useAxiosStore,
  useInterceptAxiosResponsesWithSentry,
} from './useAxios';

describe('useAxiosStore', () => {
  it('should create authorised and unauthorised axios instances with correct baseURL', () => {
    const { authorisedAxiosInstance, unauthorisedAxiosInstance } =
      useAxiosStore.getState();
    expect(authorisedAxiosInstance).toBeDefined();
    expect(unauthorisedAxiosInstance).toBeDefined();
    expect(authorisedAxiosInstance.defaults.baseURL).toBeDefined();
    expect(unauthorisedAxiosInstance.defaults.baseURL).toBeDefined();
  });
});

describe('useInterceptAxiosResponsesWithSentry', () => {
  const TestWrapper = () => {
    useInterceptAxiosResponsesWithSentry();

    return <></>;
  };

  it('should attach error interceptors to both axios instances', () => {
    const spyAuth = vitest.spyOn(
      useAxiosStore.getState().authorisedAxiosInstance.interceptors.response,
      'use'
    );
    const spyUnauth = vitest.spyOn(
      useAxiosStore.getState().unauthorisedAxiosInstance.interceptors.response,
      'use'
    );

    render(<TestWrapper />);

    expect(spyAuth).toHaveBeenCalled();
    expect(spyUnauth).toHaveBeenCalled();
    spyAuth.mockRestore();
    spyUnauth.mockRestore();
  });
});
