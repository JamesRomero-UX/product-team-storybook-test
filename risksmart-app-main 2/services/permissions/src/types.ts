import type { PermitSDK } from '@risksmart-app/permitio/src/types';
import type { Permit } from 'permitio';

export interface PermitDependencies {
  permit: Permit; //TODO: remove once all functions use permitRsSDK
  permitRsSDK: PermitSDK;
}

export interface ResourceParent {
  parentId: string;
  parentType: string;
}

export interface ResourceChild {
  childId: string;
  childType: string;
}

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export enum PermissionsOperation {
  Delete = 'DELETE',
  Insert = 'INSERT',
  Link = 'LINK',
  Unlink = 'UNLINK',
  Update = 'UPDATE',
}
