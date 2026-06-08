import type { BadgeListFieldDefinition } from './badgeList';
import type { CommonLookupFieldDefinition } from './commonLookup';
import type { DateFieldDefinition } from './date';
import type { DepartmentsFieldDefinition } from './departments';
import type { DetailsLinkFieldDefinition } from './detailsLink';
import type { IssueVariantNameFieldDefinition } from './issueVariantName';
import type { LinkFieldDefinition } from './link';
import type { MetaRatingFieldDefinition } from './metaRating';
import type { MultiOptionsFieldDefinition } from './multiOptions';
import type { NumberFieldDefinition } from './number';
import type { OptionsFieldDefinition } from './options';
import type { RatingFieldDefinition } from './rating';
import type { TagsFieldDefinition } from './tags';
import type { TextFieldDefinition } from './text';
import type { UsersFieldDefinition } from './users';

export type FieldTypeDefinition =
  | BadgeListFieldDefinition
  | CommonLookupFieldDefinition
  | DateFieldDefinition
  | DetailsLinkFieldDefinition
  | IssueVariantNameFieldDefinition
  | LinkFieldDefinition
  | MetaRatingFieldDefinition
  | NumberFieldDefinition
  | OptionsFieldDefinition
  | RatingFieldDefinition
  | TextFieldDefinition
  | MultiOptionsFieldDefinition
  | UsersFieldDefinition
  | TagsFieldDefinition
  | DepartmentsFieldDefinition;
