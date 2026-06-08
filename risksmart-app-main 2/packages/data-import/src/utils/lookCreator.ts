import { randomUUID } from 'crypto';

import type { CsvFile } from '../sheets';
import type { NodeLookup, TParentTypePlus } from '../sheets/types';
import { getEnv } from './environment';
import type { CsvLineErrorType } from './logging';

export interface RisksmartIdLookup {
  [thirdPartyId: string]: string;
}

export type KeysWithValuesOfType<T, V> = keyof {
  [P in keyof T as T[P] extends V ? P : never]: P;
} &
  keyof T;

export const createRisksmartIdLookup = <
  T,
  K extends KeysWithValuesOfType<T, string>,
>(
  file: CsvFile,
  records: T[],
  idKey: K,
  generateGuidIds: boolean = getEnv('GENERATE_GUID_IDS') === 'true'
) => {
  const lookup: RisksmartIdLookup = {};
  const errors: CsvLineErrorType[] = [];
  records.forEach((record, i) => {
    const thirdPartyId = record[idKey] as string;
    if (!lookup[thirdPartyId]) {
      if (generateGuidIds) {
        lookup[thirdPartyId] = randomUUID();
      } else {
        lookup[thirdPartyId] = thirdPartyId;
      }
    } else {
      const error: CsvLineErrorType = {
        row: i + 2,
        message: `Duplicate id - ${thirdPartyId}`,
        file,
      };
      errors.push(error);
    }
  });

  return { lookup, errors };
};

/**
 * Adds existing database record ids to our lookups
 *
 * @param lookup
 * @param nodeLookup
 * @param parentType
 * @returns
 */
export const addExistingIdsToLookup = (
  lookup: RisksmartIdLookup,
  nodeLookup: NodeLookup,
  parentType: TParentTypePlus
): RisksmartIdLookup => {
  for (const id in nodeLookup) {
    if (nodeLookup[id] === parentType) {
      lookup[id] = id;
    }
  }

  return lookup;
};
