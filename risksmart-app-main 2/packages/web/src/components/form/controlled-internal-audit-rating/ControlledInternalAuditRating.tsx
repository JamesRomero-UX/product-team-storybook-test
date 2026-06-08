import type { SelectProps } from '@risk-smart/themed-cloudscape-components/select';
import type { FieldValues } from 'react-hook-form';
import type { RatingKeys } from 'src/ratings/ratings';

import ControlledRating from '../controlled-rating';
import type { ControlledBaseProps } from '../types';

interface ControlledInternalAuditRatingProps<
  T extends FieldValues,
> extends ControlledBaseProps<T> {
  type: RatingKeys;
  filteringType?: SelectProps.FilteringType;
  addEmptyOption?: boolean;
  disabled?: boolean;
  onChange?: (value: null | number) => void;
  testId: string;
  showValue?: boolean;
}

/**
 * A wrapper around ControlledRating that automatically uses the internal audit taxonomy.
 * This component ensures that rating options are pulled from the internal_audit_ratings.json
 * taxonomy file instead of the standard ratings.json file.
 */
const ControlledInternalAuditRating = <T extends FieldValues>(
  props: ControlledInternalAuditRatingProps<T>
) => {
  return <ControlledRating {...props} ratingContext={'internal_audit'} />;
};

export default ControlledInternalAuditRating;
