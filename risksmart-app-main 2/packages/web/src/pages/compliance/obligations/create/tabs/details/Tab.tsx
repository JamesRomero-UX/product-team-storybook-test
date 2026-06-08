import { Obligation_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { ownerAndContributorIds } from 'src/components/form';
import type { ObligationFormFieldData } from 'src/pages/compliance/obligations/forms/obligationSchema';
import { defaultValues } from 'src/pages/compliance/obligations/forms/obligationSchema';
import { useHasPermissionQuery } from 'src/rbac/useHasPermission';

import { useInsertObligation } from '@/hooks/mutations/obligation/useInsertObligation';
import { obligationDetailsUrl } from '@/utils/urls';

import ObligationDetailsForm from '../../../forms/ObligationDetailsForm';

const Tab: FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const typeParam = searchParams.get('type') || '';
  const {
    hasPermission: canCreateObligation,
    loading: canCreateObligationLoading,
  } = useHasPermissionQuery('insert:obligation', null, true);
  const { insertObligation } = useInsertObligation();

  const onSave = async ({
    ancestorContributors: _1,
    Contributors,
    Owners,
    departments,
    tags,
    ...data
  }: ObligationFormFieldData) => {
    const result = await insertObligation({
      ...data,
      DepartmentTypeIds: departments?.map((d) => d.DepartmentTypeId) || [],
      TagTypeIds: tags?.map((t) => t.TagTypeId) || [],
      ...ownerAndContributorIds({ Contributors, Owners }),
      CustomAttributeData: data.CustomAttributeData,
    });
    if (result?.insertChildObligation?.Id) {
      navigate(obligationDetailsUrl(result.insertChildObligation.Id), {
        replace: true,
      });
    }
  };
  const onDismiss = (saved?: boolean) => {
    if (!saved) {
      navigate(-1);
    }
  };

  return (
    <>
      <ObligationDetailsForm
        initialType={
          Object.values<string>(Obligation_Type_Enum).includes(typeParam)
            ? (typeParam as Obligation_Type_Enum)
            : undefined
        }
        defaultValues={defaultValues}
        onSave={onSave}
        onDismiss={onDismiss}
        readOnly={!canCreateObligationLoading && !canCreateObligation}
      />
    </>
  );
};

export default Tab;
