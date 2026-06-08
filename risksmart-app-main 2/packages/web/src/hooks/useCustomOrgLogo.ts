import { useAxiosStore } from '@risksmart-app/components/src/hooks/useAxios';
import { useCallback } from 'react';

export const useCustomOrgLogo = () => {
  const { authorisedAxiosInstance } = useAxiosStore();

  return useCallback(async () => {
    const { data } = await authorisedAxiosInstance.get('/logo', {
      responseType: 'blob',
    });

    const blob = new Blob([data], { type: 'image/jpeg' });
    const url = URL.createObjectURL(blob);

    if (!url) {
      throw new Error('Failed to fetch custom logo');
    }

    return url;
  }, [authorisedAxiosInstance]);
};
