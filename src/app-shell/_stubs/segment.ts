// Stub for @risksmart-app/components/src/segment — production hook needs
// a SegmentProvider; storybook doesn't render one. Returns no-ops.
import type { ReactNode } from 'react';

export const useSegment = () => ({
  track: (..._args: any[]) => {},
  identify: (..._args: any[]) => {},
  page: (..._args: any[]) => {},
  group: (..._args: any[]) => {},
  reset: () => {},
});

export const useBaseTracking = () => {};

export const SegmentProvider = ({ children }: { children: ReactNode }) =>
  children as any;

export default useSegment;
