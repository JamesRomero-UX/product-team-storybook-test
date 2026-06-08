import type {
  Department,
  Department_Type,
  Tag,
  Tag_Type,
} from '@risksmart-app/web-graphql-client/derived-types';

import { UNRATED } from '../types';

type DepartmentGetterOptions = {
  includeNoDepartments?: boolean;
};

type TagGetterOptions = {
  includeNoTags?: boolean;
};

export type DepartmentFields = Pick<Department, 'DepartmentTypeId'> & {
  type?: null | Pick<Department_Type, 'Name'>;
};

export type TagFields = Pick<Tag, 'TagTypeId'> & {
  type?: null | Pick<Tag_Type, 'Name'>;
};

export const departmentGetter = <T extends { departments: DepartmentFields[] }>(
  options?: DepartmentGetterOptions
) => {
  return (item: T) => {
    const noDepartment = options?.includeNoDepartments
      ? { key: UNRATED, label: 'No department' }
      : null;

    const departments = item.departments.map((d) =>
      d?.DepartmentTypeId && d?.type?.Name
        ? { key: d.DepartmentTypeId, label: d.type.Name }
        : noDepartment
    );
    if (departments.length > 0) {
      return departments;
    }

    return noDepartment;
  };
};

export const tagGetter = <T extends { tags: TagFields[] }>(
  options?: TagGetterOptions
) => {
  return (item: T) => {
    const noTag = options?.includeNoTags
      ? { key: UNRATED, label: 'No tags' }
      : null;

    const tags = item.tags.map((d) =>
      d?.TagTypeId && d?.type?.Name
        ? { key: d.TagTypeId, label: d.type.Name }
        : noTag
    );
    if (tags.length > 0) {
      return tags;
    }

    return noTag;
  };
};
