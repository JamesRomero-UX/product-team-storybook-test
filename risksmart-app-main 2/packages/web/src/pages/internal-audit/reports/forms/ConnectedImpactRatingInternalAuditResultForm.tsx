import { useMutation, useQuery } from '@apollo/client';
import {
  GetInternalAuditImpactRatingByIdDocument,
  InsertInternalAuditImpactRatingDocument,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC, ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { PageWrapper } from 'src/components/form/form/PageWrapper';
import ImpactRatingForm from 'src/pages/impacts/ratings/forms/impact-rating-form';
import type { ImpactRatingFormFieldData } from 'src/pages/impacts/ratings/forms/impact-rating-form/impactRatingFormSchema';
import type { ObjectWithContributors } from 'src/rbac/Permission';

import { evictField } from '@/utils/graphqlUtils';
import { internalAuditReportResultsUrl } from '@/utils/urls';

type Props = {
  readonly: boolean;
  navigateToResults: boolean;
  assessmentId: string;
  assessedItem?: ObjectWithContributors;
  id?: string;
  onDismiss?: (saved: boolean) => void;
  beforeFieldsSlot?: ReactNode;
  header?: string;
};

const ConnectedImpactRatingResultForm: FC<Props> = ({
  readonly,
  assessmentId,
  id,
  onDismiss,
  beforeFieldsSlot,
  navigateToResults,
  header,
}) => {
  const navigate = useNavigate();

  const { data } = useQuery(GetInternalAuditImpactRatingByIdDocument, {
    variables: { id: id! },
    skip: !id,
  });
  const impactRating = data?.impact_internal_audit_rating?.[0];

  const onSave = async (values: ImpactRatingFormFieldData) => {
    const result = await insertImpactRating({
      variables: {
        ...values,
        Ratings: [
          {
            ImpactId: values.ImpactId,
            Rating: values.Rating,
          },
        ],
        CustomAttributeData: values.CustomAttributeData ?? null,
        CompletedBy: values.CompletedBy?.value,
        InternalAuditReportId: assessmentId,
      },
    });

    if (!result.data?.insertChildImpactInternalAuditRating?.Ids) {
      throw new Error('Impact rating result id is missing');
    }

    if (navigateToResults) {
      navigate(internalAuditReportResultsUrl(assessmentId));
    }
  };
  const [insertImpactRating] = useMutation(
    InsertInternalAuditImpactRatingDocument,
    {
      update: (cache) => {
        evictField(cache, 'impact_internal_audit_rating');
        evictField(cache, 'internal_audit_report');
      },
    }
  );

  return (
    <div className={'pb-5'}>
      <ImpactRatingForm
        header={header}
        values={
          impactRating
            ? {
                Rating: impactRating.Rating,
                ImpactId: impactRating.ImpactId,
                RatedItemId: impactRating.RatedItemId,
                TestDate: impactRating.TestDate,
                CustomAttributeData: impactRating.CustomAttributeData,
                CompletedBy: impactRating.CompletedBy
                  ? { value: impactRating.CompletedBy, type: 'user' }
                  : null,
              }
            : undefined
        }
        onSave={onSave}
        readOnly={readonly}
        onDismiss={onDismiss}
        renderTemplate={(renderProps) => <PageWrapper {...renderProps} />}
        beforeFieldsSlot={beforeFieldsSlot}
      />
    </div>
  );
};

export default ConnectedImpactRatingResultForm;
