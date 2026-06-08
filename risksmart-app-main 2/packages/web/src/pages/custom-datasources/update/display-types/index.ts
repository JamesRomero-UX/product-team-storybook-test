import type { DisplayType } from '@risksmart-app/shared/reporting/datasets/types';

import { badgeList } from './badgeList';
import { commonLookup } from './commonLookup';
import { date } from './date';
import { departments } from './departments';
import { detailsLink } from './detailsLink';
import { issueVariantName } from './issueVariantName';
import { link } from './link';
import { metaRating } from './metaRating';
import { multiOptions } from './multiOptions';
import { number } from './number';
import { options } from './options';
import { rating } from './rating';
import { tags } from './tags';
import { text } from './text';
import type { ReportFieldType } from './types';
import { users } from './users';

// TODO: move to a shared location between forms and reporting
export const displayTypes: { [type in DisplayType]: ReportFieldType } = {
  rating,
  commonLookup,
  text,
  options,
  metaRating,
  badgeList,
  date,
  number,
  link,
  detailsLink,
  issueVariantName,
  multiOptions,
  users,
  tags,
  departments,
};
