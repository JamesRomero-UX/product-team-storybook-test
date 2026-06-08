import { useFileUpdate } from '@risksmart-app/components/src/file/useFileUpdate';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useMemo } from 'react';
import { useNavigate } from 'react-router';
import Loading from 'src/components/loading';
import { useAggregation } from 'src/hooks/useAggregation';
import { useHasPermissionQuery } from 'src/rbac/useHasPermission';

import {
  useInsertAppetite,
  useUpdateAppetite,
} from '@/hooks/mutations/appetite';
import { useGetAppetiteById, useGetRiskById } from '@/hooks/queries';

import AppetiteForm from '../forms/AppetiteForm';
import type { AppetiteFormFieldsData } from '../forms/appetiteSchema';

type Props = {
  Id?: string;
  ParentId?: string;
};

const Tab: FC<Props> = ({ Id, ParentId }) => {
  const { updateFiles } = useFileUpdate();
  const { appetiteAggregation, loading: aggregationLoading } = useAggregation();
  const { data: riskData, loading: risksLoading } = useGetRiskById({
    queryArgs: { riskId: ParentId ?? '' },
    shouldSkip: !ParentId,
  });
  const navigate = useNavigate();
  const onDismiss = () => navigate(-1);
  const parentRisk = riskData?.risk[0];

  const { insertAppetite: insert } = useInsertAppetite();
  const { updateAppetite: update } = useUpdateAppetite();

  const {
    data: appetiteData,
    loading,
    error,
  } = useGetAppetiteById({
    queryArgs: { id: Id ?? '' },
    shouldSkip: !Id,
  });
  if (error) {
    throw error;
  }
  const appetite = appetiteData?.appetite[0];

  const values = useMemo(() => {
    if (!appetite) {
      return undefined;
    }

    const fields = {
      ...appetite,
      files: appetite?.files.map((rf) => rf.file),
      ImpactId: appetite.impact?.Id,
      AppetiteType: appetite.AppetiteType,
    };

    return fields;
  }, [appetite]);

  const onSave = async (data: AppetiteFormFieldsData) => {
    const { files, ...rest } = data;
    if (values) {
      const result = await update({
        ...rest,
        Id: values.Id,
        OriginalTimestamp: values.ModifiedAtTimestamp,
        CustomAttributeData: data.CustomAttributeData || undefined,
      });
      if (result.update_appetite?.affected_rows !== 1) {
        throw new Error(
          'Records not updated. Record may have been updated by another user'
        );
      }
    } else {
      if (!parentRisk) {
        throw new Error('Cannot insert acceptance without a parent risk');
      }

      const result = await insert({
        ...rest,
        ParentIds: [parentRisk.Id],
        CustomAttributeData: data.CustomAttributeData || undefined,
      });
      Id = result.insertChildAppetite?.Id;
    }
    if (!Id) {
      throw new Error('Missing id');
    }
    await updateFiles({
      parentType: Parent_Type_Enum.Appetite,
      parentId: Id,
      originalFiles: values?.files,
      selectedFiles: files,
    });
  };

  const { hasPermission: canEditAppetite, loading: isLoadingEditAppetite } =
    useHasPermissionQuery('update:appetite', appetite);
  const { hasPermission: canCreateAppetite, loading: isLoadingCreateAppetite } =
    useHasPermissionQuery('insert:appetite', parentRisk);
  const loadingPermissions = isLoadingEditAppetite || isLoadingCreateAppetite;
  const { enableTierTwoCascading } = useAggregation();

  const canModify = appetite ? canEditAppetite : canCreateAppetite;

  if (loadingPermissions || loading || aggregationLoading || risksLoading) {
    return <Loading />;
  }

  const isTierThree = parentRisk?.Tier === 3;
  const isTierTwo = parentRisk?.Tier === 2;

  return (
    <>
      <AppetiteForm
        appetiteAggregation={appetiteAggregation}
        onSave={onSave}
        values={values}
        onDismiss={onDismiss}
        readOnly={
          !canModify ||
          (appetiteAggregation !== 'default' &&
            (isTierThree || (isTierTwo && !enableTierTwoCascading)))
        }
      />
    </>
  );
};

export default Tab;
