import { createHmac, timingSafeEqual } from 'crypto';
import { Config } from 'sst/node/config';

// Secret for signing task tokens fall back to Hybiscus key in dev.
const RAW_SECRET = Config.HYBISCUS_API_KEY || 'dev-only-token-secret';

const DEFAULT_TTL_SECONDS = 10 * 60; // 10 minutes
const ALLOWED_SKEW_SECONDS = 2 * 60; // 2 minutes skew allowance

function getKey(): Buffer {
  return Buffer.from(RAW_SECRET);
}

export function signTaskToken(
  taskId: string,
  orgKey: string,
  expEpochSeconds?: number
): { sig: string; exp: number } {
  const exp =
    typeof expEpochSeconds === 'number' && Number.isFinite(expEpochSeconds)
      ? Math.floor(expEpochSeconds)
      : Math.floor(Date.now() / 1000) + DEFAULT_TTL_SECONDS;
  const payload = `${taskId}.${orgKey}.${exp}`;
  const sig = createHmac('sha256', getKey()).update(payload).digest('hex');

  return { sig, exp };
}

export function verifyTaskToken(params: {
  taskId: string;
  orgKey: string;
  sig?: string | null;
  exp?: string | number | null;
}): boolean {
  const { taskId, orgKey, sig, exp } = params;
  if (!sig || typeof sig !== 'string') {
    return false;
  }

  const expNum = typeof exp === 'string' ? Number(exp) : (exp as number);
  if (!Number.isFinite(expNum)) {
    return false;
  }

  const now = Math.floor(Date.now() / 1000);
  // Basic expiry checks with small skew allowance
  if (expNum + ALLOWED_SKEW_SECONDS < now) {
    // expired
    return false;
  }
  if (expNum > now + DEFAULT_TTL_SECONDS + ALLOWED_SKEW_SECONDS) {
    // far future
    return false;
  }

  const expected = signTaskToken(taskId, orgKey, expNum).sig;
  try {
    // constant-time compare
    return timingSafeEqual(Buffer.from(expected), Buffer.from(sig));
  } catch {
    return false;
  }
}
