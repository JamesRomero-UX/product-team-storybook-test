import type { DB } from 'generated-db/db';

/**
 * Query info required to retrieve a array of strings for an object based on a many to many relationship.
 * This allows reporting to return an array of owners name, tag names etc within the same row as their parent e.g. a risk
 */
export type LateralJoinFieldQueryInfo<
  OT extends keyof DB,
  M2M extends keyof DB,
> =
  | {
      tableFunctionName: string;
      functionQueryCol: string;
      objectPk: string;
    }
  | {
      objectTable: OT;
      objectTableQueryCol: keyof DB[OT];
      objectPk: keyof DB[OT];
    }
  | {
      objectTable: OT;
      manyToManyTable: M2M;
      objectTableJoinCol: keyof DB[OT];
      objectTableQueryCol: keyof DB[OT];
      manyToManyJoinCol: keyof DB[M2M];
      manyToManyPk: keyof DB[M2M];
    };

/**
 * help function to create type without needing to explicity specific generics
 * @param queryInfo
 * @returns
 */
export const createLateralJoinArrayFieldQueryInfo = <
  OT extends keyof DB,
  M2M extends keyof DB,
>(
  queryInfo: LateralJoinFieldQueryInfo<OT, M2M>
): LateralJoinFieldQueryInfo<OT, M2M> => {
  return queryInfo;
};
