import { bulkCheck } from '@risksmart-app/permitio/src/permit';
import { TRPCError } from '@trpc/server';

export const assertReadSettings = async (user: {
  userId: string;
  orgId: string;
}): Promise<void> => {
  const permitted = await bulkCheck(
    [{ resourceName: 'settings', action: 'read' }],
    user.userId,
    user.orgId
  );
  if (!permitted.some((p) => p.action === 'read')) {
    throw new TRPCError({ code: 'FORBIDDEN' });
  }
};

export const assertUpdateSettings = async (user: {
  userId: string;
  orgId: string;
}): Promise<void> => {
  const permitted = await bulkCheck(
    [{ resourceName: 'settings', action: 'update' }],
    user.userId,
    user.orgId
  );
  if (!permitted.some((p) => p.action === 'update')) {
    throw new TRPCError({ code: 'FORBIDDEN' });
  }
};

export const assertReadNode = async (
  user: { userId: string; orgId: string },
  resourceId: string
): Promise<void> => {
  const permitted = await bulkCheck(
    [{ resourceName: 'rs_node', action: 'read', resourceId }],
    user.userId,
    user.orgId
  );
  if (!permitted.some((p) => p.action === 'read')) {
    throw new TRPCError({ code: 'FORBIDDEN' });
  }
};

export const getKnockTenant = (user: { tenant: string }): string => {
  const override = process.env.KNOCK_TENANT_OVERRIDE?.trim();

  return override || user.tenant;
};
