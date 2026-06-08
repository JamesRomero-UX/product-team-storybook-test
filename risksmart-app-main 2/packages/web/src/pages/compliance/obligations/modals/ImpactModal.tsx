import { useMutation, useQuery } from '@apollo/client';
import {
  GetObligationImpactByIdDocument,
  Parent_Type_Enum,
  UpdateObligationImpactDocument,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { ModalForm } from 'src/components/form/form/ModalForm';
import { useInsertObligationImpact } from 'src/hooks/mutations';
import { useHasPermissionQuery } from 'src/rbac/useHasPermission';
import type { ImpactFormFields } from 'src/schemas/impacts';
import { defaultValues, ImpactSchema } from 'src/schemas/impacts';

import { useGetObligationById } from '@/hooks/queries';
import { evictField } from '@/utils/graphqlUtils';

import ImpactDetailsForm from '../forms/ImpactDetailsForm';

type Props = {
  onDismiss: (saved: boolean) => void;
  parentObligationId: string;
  Id?: string;
};

const ImpactModel: FC<Props> = ({ onDismiss, parentObligationId, Id }) => {
  const { t } = useTranslation('common');
  const { data: obligationData } = useGetObligationById({
    queryArgs: { id: parentObligationId },
  });
  const obligation = obligationData?.obligation[0];

  const { insertObligationImpact } = useInsertObligationImpact();

  const [update] = useMutation(UpdateObligationImpactDocument, {
    update: (cache) => {
      evictField(cache, 'obligation_impact');
      evictField(cache, 'obligation');
    },
  });
  const { data, loading, error } = useQuery(GetObligationImpactByIdDocument, {
    variables: { id: Id! },
    skip: !Id,
    fetchPolicy: 'no-cache',
  });
  if (error) {
    throw error;
  }
  const { hasPermission: userCanEdit, loading: userCanEditLoading } =
    useHasPermissionQuery('update:obligation_impact', obligation);
  const { hasPermission: userCanCreate, loading: userCanCreateLoading } =
    useHasPermissionQuery('insert:obligation_impact', obligation);
  const impact = data?.obligation_impact[0];
  const userCanModify = impact
    ? userCanEdit && !userCanEditLoading
    : userCanCreate && !userCanCreateLoading;

  const onSave = async (data: ImpactFormFields) => {
    if (impact) {
      await update({
        variables: {
          ...data,
          CustomAttributeData: data.CustomAttributeData ?? null,
          id: impact.Id,
        },
      });
    } else {
      await insertObligationImpact({
        ...data,
        CustomAttributeData: data.CustomAttributeData ?? null,
        ParentObligationId: parentObligationId,
      });
    }
  };

  if (loading) {
    return null;
  }
  const formId = 'obligation-impact-form';

  return (
    <ModalForm
      testId={'obligationImpactModal'}
      i18n={t('impacts')}
      values={impact}
      defaultValues={defaultValues}
      schema={ImpactSchema}
      onSave={onSave}
      onDismiss={onDismiss}
      formId={formId}
      visible={true}
      readOnly={!userCanModify}
      parentType={Parent_Type_Enum.ObligationImpact}
    >
      <ImpactDetailsForm readOnly={!userCanModify} />
    </ModalForm>
  );
};

export default ImpactModel;
