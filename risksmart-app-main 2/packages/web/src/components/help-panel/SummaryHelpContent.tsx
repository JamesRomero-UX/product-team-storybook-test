import type { ParseKeys } from 'i18next';
import type { FC } from 'react';

import { useI18NSummaryHelpContent } from './useSummaryHelpContent';

export const I18nSummaryHelpContent: FC<{
  translationKey: ParseKeys<'common'>;
}> = ({ translationKey }) => {
  useI18NSummaryHelpContent(translationKey);

  return null;
};
