import { useQuery } from '@apollo/client';
import { GetImpactRatingByIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { ModalWrapper } from 'src/components/form/form/ModalWrapper';

import ImpactRatingForm from './forms/impact-rating-form';
import type { ImpactRatingFormFieldData } from './forms/impact-rating-form/impactRatingFormSchema';

type Props = {
  onDismiss: () => void;
  onSaving: (action: ImpactRatingFormFieldData) => Promise<void>;
  impactRatingId?: string;
  ratedItemId?: string;
  impactId?: string;
};

const ImpactRatingModal: FC<Props> = ({
  onDismiss,
  onSaving,
  impactRatingId,
  impactId,
  ratedItemId,
}) => {
  const { data } = useQuery(GetImpactRatingByIdDocument, {
    variables: { id: impactRatingId! },
    skip: !impactRatingId,
  });
  const impactRating = data?.impact_rating?.[0];

  return (
    <ImpactRatingForm
      ratedItemId={ratedItemId}
      impactId={impactId}
      values={
        impactRating
          ? {
              ...impactRating,
              CompletedBy: impactRating.CompletedBy
                ? { value: impactRating.CompletedBy, type: 'user' }
                : null,
            }
          : undefined
      }
      readOnly={!!impactRatingId}
      onSave={onSaving}
      onDismiss={onDismiss}
      renderTemplate={(renderProps) => (
        <ModalWrapper {...renderProps} visible={true} />
      )}
    />
  );
};

export default ImpactRatingModal;
