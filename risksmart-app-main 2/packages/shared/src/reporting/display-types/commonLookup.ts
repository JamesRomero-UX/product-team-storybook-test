import type { KeyPrefix } from 'i18next';

export interface CommonLookupFieldDefinition {
  displayType: 'commonLookup';
  i18nKey: KeyPrefix<'common'>;
}
