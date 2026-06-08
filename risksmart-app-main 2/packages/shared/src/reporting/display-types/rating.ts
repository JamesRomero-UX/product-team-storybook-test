import type { KeyPrefix } from 'i18next';
type RatingKeys = KeyPrefix<'ratings'>;

export interface RatingFieldDefinition {
  displayType: 'rating';
  ratingKey: RatingKeys;
}
