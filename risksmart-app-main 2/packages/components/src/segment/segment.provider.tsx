import type { JSX, ReactNode } from 'react';

import { AmplitudeProvider } from './AmplitudeProvider';
import { SegmentProvider } from './SegmentProvider';

interface AnalyticsProviderProps {
  writeKey: string;
  amplitudeKey: string;
  children: ReactNode;
}

export const AnalyticsProvider = (
  props: AnalyticsProviderProps
): JSX.Element => {
  return (
    <SegmentProvider writeKey={props.writeKey}>
      <AmplitudeProvider apiKey={props.amplitudeKey}>
        {props.children}
      </AmplitudeProvider>
    </SegmentProvider>
  );
};
