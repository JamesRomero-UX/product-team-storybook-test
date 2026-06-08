import type { OrgFeature } from '@risksmart-app/modules/src/index';
import { createContext } from 'react';

export const FeaturesContext = createContext<OrgFeature[] | null>(null);
