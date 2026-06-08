import type { AxiosInstance } from 'axios';
import axios from 'axios';
import { create } from 'zustand/index';

import { getEnv } from '../utils/environment';
import { handleError } from '../utils/errorUtils';

interface AxiosStore {
  authorisedAxiosInstance: AxiosInstance;
  unauthorisedAxiosInstance: AxiosInstance;
}

const sentryErrorHandler = (error: unknown) => {
  handleError(error);

  return Promise.reject(error);
};

export const useAxiosStore = create<AxiosStore>(() => ({
  // Used for all requests that require authentication
  authorisedAxiosInstance: axios.create({
    baseURL: getEnv('REACT_APP_REST_API_URL'),
  }),

  // Used for uploads requiring presigned urls
  unauthorisedAxiosInstance: axios.create({
    baseURL: getEnv('REACT_APP_REST_API_URL'),
  }),
}));

export const useInterceptAxiosResponsesWithSentry = () => {
  const { authorisedAxiosInstance, unauthorisedAxiosInstance } =
    useAxiosStore();

  authorisedAxiosInstance.interceptors.response.use(
    (response) => response,
    sentryErrorHandler
  );

  unauthorisedAxiosInstance.interceptors.response.use(
    (response) => response,
    sentryErrorHandler
  );
};
