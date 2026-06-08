import type {
  Department_Type,
  Tag_Type,
} from '@risksmart-app/web-graphql-client/generated/graphql';

export type Rating = 'high' | 'low' | 'medium' | undefined;

export type TagType = Pick<Tag_Type, 'Description' | 'Name' | 'TagTypeId'> & {
  TagTypeGroupName?: string;
};

export type Treatments = 'terminate' | 'tolerate' | 'transfer' | 'treat';

export type DepartmentType = Pick<
  Department_Type,
  'DepartmentTypeId' | 'Description' | 'Name'
> & {
  DepartmentTypeGroupName?: string;
};
export interface JSONObject {
  [x: string]: JSONValue;
}

type JSONValue =
  | Array<JSONValue>
  | boolean
  | JSONObject
  | null
  | number
  | string;
