import { AnalyticsBrowser } from '@segment/analytics-next';
import type { JSX, ReactNode } from 'react';
import { useMemo } from 'react';

import { SegmentContext } from './SegmentContext';

interface SegmentProviderProps {
  writeKey: string;
  children: ReactNode;
}

export const SegmentProvider = (props: SegmentProviderProps): JSX.Element => {
  const segment = useMemo(() => {
    return AnalyticsBrowser.load({ writeKey: props.writeKey });
  }, [props.writeKey]);

  return (
    <SegmentContext.Provider value={segment}>
      {props.children}
    </SegmentContext.Provider>
  );
};
