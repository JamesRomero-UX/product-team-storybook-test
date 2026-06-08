import { useContext } from 'react';

import { SegmentContext } from './SegmentContext';

export const useSegment = () => {
  const context = useContext(SegmentContext);
  if (!context) {
    throw new Error('useSegment must be used within SegmentProvider');
  }

  return context;
};
