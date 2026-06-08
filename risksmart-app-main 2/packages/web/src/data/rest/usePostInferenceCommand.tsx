import { useAxiosStore } from '@risksmart-app/components/src/hooks/useAxios';
import { AxiosError } from 'axios';

import { handleError } from '@/utils/errorUtils';

type Response = {
  returnedText: string;
  error: string | null;
  message: string | null;
};

export const usePostInferenceCommand = () => {
  const { authorisedAxiosInstance } = useAxiosStore();

  return async (prompt: string, bodyText: string): Promise<Response> => {
    try {
      const { data } = await authorisedAxiosInstance.post<Response>(
        '/bedrock',
        {
          prompt: prompt,
          bodyText: bodyText,
        }
      );

      if (data.returnedText) {
        return data;
      } else {
        handleError(new Error('No returned text'));

        throw new Error('No returned text');
      }
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 403) {
        handleError(new Error('Request blocked by guardrail'));

        const errorResponse = error.response.data as Response;

        return errorResponse;
      }
      handleError(new Error(`Something went wrong! ${error}`));

      throw new Error(`Something went wrong! ${error}`);
    }
  };
};
