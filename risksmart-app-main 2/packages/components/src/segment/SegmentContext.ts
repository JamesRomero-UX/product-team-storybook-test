import type { AnalyticsBrowser } from '@segment/analytics-next';
import { createContext } from 'react';

export const SegmentContext = createContext<AnalyticsBrowser>(undefined!);
