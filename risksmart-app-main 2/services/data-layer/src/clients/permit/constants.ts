import { getEnv } from '@risksmart-app/shared/src/utils/environment';

export const pdpEndpoint = getEnv('PDP_ENDPOINT');
export const secretName = getEnv('PERMIT_SECRET_NAME');
