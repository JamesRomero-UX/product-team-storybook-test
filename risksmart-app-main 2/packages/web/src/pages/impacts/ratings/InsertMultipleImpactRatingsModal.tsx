import { useQuery } from '@apollo/client';
import { GetImpactListDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import _ from 'lodash';
import type { FC } from 'react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ModalWrapper } from 'src/components/form/form/ModalWrapper';

import MultipleImpactRatingsForm from './forms/multiple-impact-ratings-form/MultipleImpactRatingsForm';
import type { ImpactRatingsFormFieldData } from './forms/multiple-impact-ratings-form/MultipleImpactRatingsFormSchema';
import { useDefaultValues } from './forms/multiple-impact-ratings-form/MultipleImpactRatingsFormSchema';

type Props = {
  onDismiss: () => void;
  onSaving: (action: ImpactRatingsFormFieldData) => Promise<void>;
  impactRatingId?: string;
  impactId?: string;
};

const InsertMultipleImpactRatingsModal: FC<Props> = ({
  onDismiss,
  onSaving,
}) => {
  const { data: impacts, loading } = useQuery(GetImpactListDocument);
  const { t } = useTranslation();
  const defaultValues = useDefaultValues();
  const sortedImpacts = useMemo(
    () => _.sortBy(impacts?.impact ?? [], 'SequentialId'),
    [impacts?.impact]
  );
  if (loading) {
    return;
  }

  return (
    <MultipleImpactRatingsForm
      defaultValues={{
        ...defaultValues,
        Ratings:
          sortedImpacts.map((impact) => {
            return {
              ImpactId: impact.Id,
              Rating: -1,
            };
          }) ?? [],
      }}
      onSave={onSaving}
      onDismiss={onDismiss}
      renderTemplate={(renderProps) => (
        <ModalWrapper
          {...renderProps}
          visible={true}
          size={'max'}
          i18n={t('impactRatingsMultiple')}
        />
      )}
    />
  );
};

export default InsertMultipleImpactRatingsModal;
