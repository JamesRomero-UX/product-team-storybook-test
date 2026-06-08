import {
  createDrizzleClient,
  type DrizzleClient,
} from '@risksmart-app/drizzle/src/db';

let sharedClient: DrizzleClient | null = null;

export const getSharedDb = async (): Promise<DrizzleClient> => {
  if (!sharedClient) {
    sharedClient = await createDrizzleClient({
      orgId: '',
      tenant: '',
      userId: '',
    });
  }

  return sharedClient;
};
