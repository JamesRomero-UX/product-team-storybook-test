import { ApprovalStatus } from '@risksmart-app/domain/src/types/consts/approval-status';
import type { createDrizzleClient } from '@risksmart-app/drizzle/src/db';
import { change_request } from '@risksmart-app/drizzle/src/schema';
import { asc, desc, inArray } from 'drizzle-orm';

function isApprovalStatus(value: unknown): value is ApprovalStatus {
  const approvalStatusValues = new Set<string>(Object.values(ApprovalStatus));

  return typeof value === 'string' && approvalStatusValues.has(value);
}

export interface ChangeRequestResult {
  ChangeRequestStatus: ApprovalStatus;
  ModifiedAtTimestamp: string;
}

/**
 * Raw change request data shape used for grouping and merging operations.
 */
interface RawChangeRequestResult {
  ChangeRequestStatus: string | null;
  ModifiedAtTimestamp: Date | string | null;
}

/**
 * Converts a timestamp value to ISO string format.
 * Handles Date objects, ISO strings, and null values.
 */
function formatTimestamp(value: Date | string | null): string {
  if (value === null) {
    return '';
  }
  if (value instanceof Date) {
    return value.toISOString();
  }

  return value;
}

/**
 * Groups change requests by parent ID for efficient lookup.
 * Exported for unit testing - the primary entry point is `attachChangeRequests`.
 *
 * @param changeRequests - Array of change requests with ParentId
 * @returns Map of ParentId to array of change requests (without ParentId)
 */
export function groupChangeRequestsByParentId<
  T extends {
    ParentId: string;
    ChangeRequestStatus: string | null;
    ModifiedAtTimestamp: Date | string | null;
  },
>(changeRequests: T[]): Map<string, RawChangeRequestResult[]> {
  const map = new Map<string, RawChangeRequestResult[]>();

  for (const cr of changeRequests) {
    if (!map.has(cr.ParentId)) {
      map.set(cr.ParentId, []);
    }
    map.get(cr.ParentId)!.push({
      ChangeRequestStatus: cr.ChangeRequestStatus,
      ModifiedAtTimestamp: cr.ModifiedAtTimestamp,
    });
  }

  return map;
}

/**
 * Merges change requests into entities based on their Id.
 * Exported for unit testing - the primary entry point is `attachChangeRequests`.
 *
 * @param data - Array of entities with Id property
 * @param changeRequestMap - Map of ParentId to change requests
 * @returns Array of entities with changeRequests attached
 */
export function mergeChangeRequestsIntoEntities<T extends { Id: string }>(
  data: T[],
  changeRequestMap: Map<string, RawChangeRequestResult[]>
): (T & { changeRequests: ChangeRequestResult[] })[] {
  return data.map((item) => ({
    ...item,
    changeRequests: (changeRequestMap.get(item.Id) ?? [])
      .filter(
        (
          cr
        ): cr is RawChangeRequestResult & {
          ChangeRequestStatus: ApprovalStatus;
        } => isApprovalStatus(cr.ChangeRequestStatus)
      )
      .map((cr) => ({
        ChangeRequestStatus: cr.ChangeRequestStatus,
        ModifiedAtTimestamp: formatTimestamp(cr.ModifiedAtTimestamp),
      })),
  }));
}

/**
 * Attaches change requests to a list of entities by their Id.
 * Performs a distinct-on query to get the latest change request per status for each parent.
 *
 * @param db - Drizzle database client
 * @param data - Array of entities with Id property
 * @returns Array of entities with changeRequests attached
 */
export async function attachChangeRequests<T extends { Id: string }>(
  db: Awaited<ReturnType<typeof createDrizzleClient>>,
  data: T[]
): Promise<(T & { changeRequests: ChangeRequestResult[] })[]> {
  if (data.length === 0) {
    return [];
  }

  // Fetch changeRequests with distinct_on at database level
  // GraphQL query: distinct_on: [ChangeRequestStatus], order_by: [{ ChangeRequestStatus: asc }, { ModifiedAtTimestamp: desc }]
  // Note: We include ParentId in distinctOn to get distinct status per parent (not globally)
  const changeRequests = await db.org((tx) => {
    return tx
      .selectDistinctOn(
        [change_request.ParentId, change_request.ChangeRequestStatus],
        {
          ChangeRequestStatus: change_request.ChangeRequestStatus,
          ModifiedAtTimestamp: change_request.ModifiedAtTimestamp,
          ParentId: change_request.ParentId,
        }
      )
      .from(change_request)
      .where(
        inArray(
          change_request.ParentId,
          data.map((item) => item.Id)
        )
      )
      .orderBy(
        asc(change_request.ParentId),
        asc(change_request.ChangeRequestStatus),
        desc(change_request.ModifiedAtTimestamp)
      );
  });

  const changeRequestsByParentId =
    groupChangeRequestsByParentId(changeRequests);

  return mergeChangeRequestsIntoEntities(data, changeRequestsByParentId);
}
