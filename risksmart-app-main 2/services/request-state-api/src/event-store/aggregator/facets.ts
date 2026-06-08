import { Facet } from 'src/event-store/db';
import { EventDB } from 'src/event-store/db/db';
import { Event } from 'src/event-store/db/processor';
import { dynamoClient, getTableName } from 'src/utils/dynamo-client';

import { REQUEST_STATE_FACET } from '../../constants/facets';
import { processor } from './engine';
import type { InputEventTypes } from './inputs';
import type { OutputEventTypes } from './outputs';
import type { DomainEvent, RequestState } from './types';

// Cache Facet instances per tenant with TTL to avoid stale connections
const FACET_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface CachedFacet {
  facet: Facet<RequestState, InputEventTypes, OutputEventTypes>;
  createdAt: number;
}

const facetCache = new Map<string, CachedFacet>();

const isCacheEntryValid = (entry: CachedFacet): boolean => {
  return Date.now() - entry.createdAt < FACET_CACHE_TTL_MS;
};

export const createFacet = (tenant: string) => {
  const cachedEntry = facetCache.get(tenant);
  if (cachedEntry) {
    if (isCacheEntryValid(cachedEntry)) {
      return cachedEntry.facet;
    }

    // Clear expired entry
    facetCache.delete(tenant);
  }

  const dynamoTable = getTableName(tenant);

  const db = new EventDB<RequestState, InputEventTypes, OutputEventTypes>(
    dynamoClient,
    dynamoTable,
    REQUEST_STATE_FACET
  );

  const facet = new Facet<RequestState, InputEventTypes, OutputEventTypes>(
    REQUEST_STATE_FACET,
    db,
    processor
  );

  facetCache.set(tenant, { facet, createdAt: Date.now() });

  return facet;
};

export const appendToRequest = async (
  id: string,
  tenant: string,
  ...events: DomainEvent[]
): Promise<void> => {
  const facet = createFacet(tenant);
  await facet.append(id, ...events.map((e) => new Event(e.eventName, e.event)));
};
