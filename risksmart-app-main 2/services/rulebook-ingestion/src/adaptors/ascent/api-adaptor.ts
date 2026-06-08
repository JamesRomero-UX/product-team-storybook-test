import type {
  NewRawExternalObligation,
  Regulator,
  RegulatorId,
} from 'src/domain/types';
import type { NewRawExternalObligationChange } from 'src/domain/types/obligation-change';
import { getLogger } from 'src/logger';

import { fetchWithBackoff } from '../fetch-with-backoff';
import { RateLimiter } from '../rate-limiter';
import {
  transformRawObligationFromAscentItem,
  transformRawTaskVersionFromAscentItem,
  transformRegulatorFromAscentApi,
} from './transform';
import {
  ascentManyResponseSchema,
  ascentRegulatorSchema,
  ascentRuleSchema,
  ascentTaskSchema,
  ascentTaskVersionSchema,
} from './types';

const logger = getLogger();
export class AscentApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly responseBody?: string
  ) {
    super(message);
    this.name = 'AscentApiError';
  }
}

export class AscentNotFoundError extends AscentApiError {
  constructor() {
    super(`Ascent resource not found`, 404);
    this.name = 'AscentNotFoundError';
  }
}

export class AscentRateLimitError extends AscentApiError {
  constructor() {
    super('Ascent API rate limit exceeded', 429);
    this.name = 'AscentRateLimitError';
  }
}

export interface AscentApiConfig {
  baseUrl: string;
  apiKey: string;
  profileId: string;
}

/**
 * Non-secret reference passed through Step Functions state.
 * Each Lambda resolves the API key from Secrets Manager at runtime.
 */
export interface AscentApiReference {
  secretArn: string;
  baseUrl: string;
  profileId: string;
}

export const createApiAdaptor = (config: AscentApiConfig) => {
  const rateLimiter = new RateLimiter(
    200, // Max 200 tokens
    200 / 60 // Refill rate: 200 tokens per 60 seconds
  );

  const TODAY = new Date().toISOString().slice(0, 10);

  const handleErrorResponse = async (response: Response): Promise<never> => {
    logger.info(`Ascent API error response`, {
      status: response.status,
      statusText: response.statusText,
    });

    if (response.status === 404) {
      throw new AscentNotFoundError();
    }

    if (response.status === 429) {
      throw new AscentRateLimitError();
    }

    const message = await response.text();
    throw new AscentApiError(
      `Ascent API error: ${message}`,
      response.status,
      message
    );
  };

  const getRegulators = async (): Promise<Regulator[]> => {
    await rateLimiter.acquire();

    const response = await fetchWithBackoff(
      `${config.baseUrl}/profiles/${config.profileId}/regulators`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          Accept: 'application/json',
        },
      }
    );

    if (response.ok) {
      const responseData = ascentManyResponseSchema.parse(
        await response.json()
      );

      const parsedResponse = ascentRegulatorSchema
        .array()
        .parse(responseData.data);

      return parsedResponse.flatMap(transformRegulatorFromAscentApi);
    }

    return handleErrorResponse(response);
  };

  const hasExpired = (item: {
    attributes: { endsAt: string | null };
  }): boolean => {
    return item.attributes.endsAt !== null && item.attributes.endsAt < TODAY;
  };

  const hasNotStarted = (item: {
    attributes: { startsAt: string };
  }): boolean => {
    return item.attributes.startsAt > TODAY;
  };

  const isInEffect = (item: {
    id: string;
    attributes: { startsAt: string; endsAt: string | null };
  }): boolean => {
    if (hasExpired(item) || hasNotStarted(item)) {
      return false;
    }

    return true;
  };

  /**
   * Fetches a page of rules for the given regulator from the Ascent API, filtered to items
   * currently in effect.
   *
   * Returns `null` when the raw API page is empty — Ascent has no more pages and pagination should
   * stop. Returns `[]` when the page had items but all were filtered by `isInEffect`; the caller
   * must continue to the next page in this case, as further in-effect items may follow.
   */
  const getRegulatorRules = async (
    regulatorId: RegulatorId,
    pageNumber: number = 1
  ): Promise<NewRawExternalObligation[] | null> => {
    await rateLimiter.acquire();

    const response = await fetchWithBackoff(
      `${config.baseUrl}/profiles/${config.profileId}/regulators/${regulatorId}/rules?page=${pageNumber}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          Accept: 'application/json',
        },
      }
    );

    if (response.ok) {
      const responseData = ascentManyResponseSchema.parse(
        await response.json()
      );

      const parsed = ascentRuleSchema.array().parse(responseData.data);
      if (parsed.length === 0) {
        return null;
      }

      const inEffect = parsed.filter((item) => isInEffect(item));

      return transformRawObligationFromAscentItem(inEffect);
    }

    return handleErrorResponse(response);
  };

  /**
   * Fetches a page of tasks from the Ascent API, filtered to items currently in effect.
   *
   * Returns `null` when the raw API page is empty — Ascent has no more pages and pagination should
   * stop. Returns `[]` when the page had items but all were filtered by `isInEffect`; the caller
   * must continue to the next page in this case, as further in-effect items may follow.
   */
  const getTasks = async (
    pageNumber: number = 1
  ): Promise<NewRawExternalObligation[] | null> => {
    await rateLimiter.acquire();

    const response = await fetchWithBackoff(
      `${config.baseUrl}/profiles/${config.profileId}/tasks?page=${pageNumber}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          Accept: 'application/json',
        },
      }
    );

    if (response.ok) {
      const responseData = ascentManyResponseSchema.parse(
        await response.json()
      );

      const parsed = ascentTaskSchema.array().parse(responseData.data);

      if (parsed.length === 0) {
        return null;
      }

      const inEffect = parsed.filter((item) => isInEffect(item));

      return transformRawObligationFromAscentItem(inEffect);
    }

    return handleErrorResponse(response);
  };

  /**
   * Fetches a page of task versions from the Ascent API.
   *
   * Returns `null` when the raw API page is empty — Ascent has no more pages and pagination should
   * stop. Returns `[]` when the page had items but all were filtered out; the caller must continue
   * to the next page in this case.
   */
  const getTaskVersions = async (
    pageNumber: number = 1
  ): Promise<NewRawExternalObligationChange[] | null> => {
    await rateLimiter.acquire();

    const response = await fetchWithBackoff(
      `${config.baseUrl}/profiles/${config.profileId}/task_versions?page=${pageNumber}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          Accept: 'application/json',
        },
      }
    );

    if (response.ok) {
      const responseData = ascentManyResponseSchema.parse(
        await response.json()
      );

      const parsed = ascentTaskVersionSchema.array().parse(responseData.data);
      if (parsed.length === 0) {
        return null;
      }

      // Do we want to filter here in the same way as rules/tasks?
      // Only return task versions that are in effect in the future?
      const filtered = parsed.filter((item) => !hasExpired(item));

      return transformRawTaskVersionFromAscentItem(filtered);
    }

    return handleErrorResponse(response);
  };

  return { getRegulators, getRegulatorRules, getTasks, getTaskVersions };
};
