import { useContext } from 'react';

import { AmplitudeContext } from './AmplitudeContext';

export const useAmplitude = () => {
  const context = useContext(AmplitudeContext);
  if (!context) {
    throw new Error('useAmplitude must be used within AmplitudeProvider');
  }

  return context;
};
