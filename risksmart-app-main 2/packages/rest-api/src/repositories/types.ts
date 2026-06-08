export interface FindOptions<TOrderBy> {
  orderBy?: TOrderBy[];
  limit?: number;
}

export type Repository = {
  findWhere(where: unknown, options?: FindOptions<unknown>): Promise<unknown[]>;
  create?(data: unknown): Promise<unknown>;
  update?(where: unknown, data: Partial<unknown>): Promise<unknown>;
  updateByPk?(pk: unknown, data: Partial<unknown>): Promise<unknown>;
  delete?(where: unknown): Promise<void>;
} & {
  [key: string]: unknown;
};

export const CUSTOMER_SUPPORT_ROLE = 'CustomerSupport' as const;

/**
 * Warning, this role does NOT filter data by organisation
 */
export const SYSTEM_ADMIN_ROLE = 'admin' as const;
export const SYSTEM_USER = 'SYSTEM' as const;

export interface RepositoryOptions {
  tenant: string;
  orgKey: string;
  userId: string;
  userRole: string;
}
