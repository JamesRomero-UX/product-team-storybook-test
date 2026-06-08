import type * as amplitude from '@amplitude/analytics-browser';
import { createContext } from 'react';

export type AmplitudeClient = typeof amplitude;

export const AmplitudeContext = createContext<AmplitudeClient>(undefined!);
