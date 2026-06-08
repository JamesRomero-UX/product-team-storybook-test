// rate limit tiers, lower number is more restrictive.
export type RateLimitTier = 't1' | 't2' | 't3' | 't4';
export type RateLimiterName = 'tier1' | 'tier2' | 'tier3' | 'tier4';
export type RateLimitProfile = 'chill' | 'cruise' | 'turbo' | 'fullSend';
export interface RateLimitPolicy {
  readonly name: RateLimiterName;
  readonly points: number;
  readonly durationSec: number;
  readonly keyPrefix: RateLimitTier;
}
export type RateLimitTiers = RateLimitPolicy[];
export type ProfileRateLimits = Record<RateLimitTier, RateLimitPolicy>;
export type RateLimitProfiles = Record<RateLimitProfile, ProfileRateLimits>;

const DEFAULT_TIER_DURATION_SEC = 60;
export const DEFAULT_CONSUME_POINTS = 1;
export const DEFAULT_RATE_LIMIT_PROFILE: RateLimitProfile = 'cruise';

export const rateLimitProfiles: RateLimitProfiles = {
  // Limited profile for rate abusers or sandbox environments.
  chill: {
    t1: {
      name: 'tier1',
      points: 5,
      durationSec: DEFAULT_TIER_DURATION_SEC,
      keyPrefix: 't1',
    },
    t2: {
      name: 'tier2',
      points: 5,
      durationSec: DEFAULT_TIER_DURATION_SEC,
      keyPrefix: 't2',
    },
    t3: {
      name: 'tier3',
      points: 10,
      durationSec: DEFAULT_TIER_DURATION_SEC,
      keyPrefix: 't3',
    },
    t4: {
      name: 'tier4',
      points: 20,
      durationSec: DEFAULT_TIER_DURATION_SEC,
      keyPrefix: 't4',
    },
  },
  // Standard profile, should fit most consumer requirements (default fallback).
  cruise: {
    t1: {
      name: 'tier1',
      points: 10,
      durationSec: DEFAULT_TIER_DURATION_SEC,
      keyPrefix: 't1',
    },
    t2: {
      name: 'tier2',
      points: 60,
      durationSec: DEFAULT_TIER_DURATION_SEC,
      keyPrefix: 't2',
    },
    t3: {
      name: 'tier3',
      points: 300,
      durationSec: DEFAULT_TIER_DURATION_SEC,
      keyPrefix: 't3',
    },
    t4: {
      name: 'tier4',
      points: 1500,
      durationSec: DEFAULT_TIER_DURATION_SEC,
      keyPrefix: 't4',
    },
  },
  // High performance profile, for consumers that have a higher demand requirement.
  turbo: {
    t1: {
      name: 'tier1',
      points: 10,
      durationSec: DEFAULT_TIER_DURATION_SEC,
      keyPrefix: 't1',
    },
    t2: {
      name: 'tier2',
      points: 120,
      durationSec: DEFAULT_TIER_DURATION_SEC,
      keyPrefix: 't2',
    },
    t3: {
      name: 'tier3',
      points: 600,
      durationSec: DEFAULT_TIER_DURATION_SEC,
      keyPrefix: 't3',
    },
    t4: {
      name: 'tier4',
      points: 3000,
      durationSec: DEFAULT_TIER_DURATION_SEC,
      keyPrefix: 't4',
    },
  },
  // Api go brrrrr (use sparingly).
  fullSend: {
    t1: {
      name: 'tier1',
      points: 10,
      durationSec: DEFAULT_TIER_DURATION_SEC,
      keyPrefix: 't1',
    },
    t2: {
      name: 'tier2',
      points: 360,
      durationSec: DEFAULT_TIER_DURATION_SEC,
      keyPrefix: 't2',
    },
    t3: {
      name: 'tier3',
      points: 1800,
      durationSec: DEFAULT_TIER_DURATION_SEC,
      keyPrefix: 't3',
    },
    t4: {
      name: 'tier4',
      points: 9000,
      durationSec: DEFAULT_TIER_DURATION_SEC,
      keyPrefix: 't4',
    },
  },
};
