import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';

import type { EntityInfo } from '@/hooks/getEntityInfo';

import type { IndicatorFlatFields } from './types';

export const parentTitleFromLinkedParents = (
  data: IndicatorFlatFields,
  getEntityInfo: (type: Parent_Type_Enum) => EntityInfo
) => {
  const titles = data.parents.map((parent) => {
    if (!parent.parent) {
      return '-';
    }
    const type = parent.parent.ObjectType;
    if (parent.control) {
      return parent.control?.Title
        ? `${parent.control?.Title} (${getEntityInfo(type).singular})`
        : '';
    }
    if (parent.risk) {
      return parent.risk?.Title
        ? `${parent.risk?.Title} (${getEntityInfo(type).singular})`
        : '';
    }

    return null;
  });

  return titles.filter((t) => t).join(', ');
};
export const parentTypesFromLinkedParents = (
  data: IndicatorFlatFields,
  getEntityInfo: (type: Parent_Type_Enum) => EntityInfo
): string[] => {
  const types: string[] = [];
  if (data.parents.filter((p) => p.control).length > 0) {
    types.push(getEntityInfo(Parent_Type_Enum.Control).singular);
  }
  if (data.parents.filter((p) => p.risk).length > 0) {
    types.push(getEntityInfo(Parent_Type_Enum.Risk).singular);
  }

  return types;
};
