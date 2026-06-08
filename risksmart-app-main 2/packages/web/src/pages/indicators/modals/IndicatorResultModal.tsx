import { useQuery } from '@apollo/client';
import { useFileUpdate } from '@risksmart-app/components/src/file/useFileUpdate';
import {
  GetIndicatorResultByIdDocument,
  Indicator_Type_Enum,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { ModalForm } from 'src/components/form/form/ModalForm';
import {
  useInsertIndicatorResult,
  useUpdateIndicatorResult,
} from 'src/hooks/mutations';
import type { IndicatorResultFormFields } from 'src/pages/indicators/forms/indicatorResultSchema';
import {
  defaultValues,
  indicatorResultSchema,
} from 'src/pages/indicators/forms/indicatorResultSchema';
import type { ObjectWithContributors } from 'src/rbac/Permission';
import { useHasPermissionQuery } from 'src/rbac/useHasPermission';

import IndicatorResultsForm from '../forms/IndicatorResultsForm';

type Props = {
  onDismiss: (saved: boolean) => void;
  parentIndicatorId: string;
  parentIndicatorType: Indicator_Type_Enum;
  Id?: string;
  indicator: ObjectWithContributors;
};

const IndicatorResultModel: FC<Props> = ({
  onDismiss,
  parentIndicatorId,
  Id,
  parentIndicatorType,
  indicator,
}) => {
  const { t } = useTranslation('common');
  const { updateFiles } = useFileUpdate();
  const { insertIndicatorResult } = useInsertIndicatorResult();
  const { updateIndicatorResult } = useUpdateIndicatorResult();
  const { data, loading, error } = useQuery(GetIndicatorResultByIdDocument, {
    variables: { id: Id! },
    skip: !Id,
    fetchPolicy: 'no-cache',
  });
  if (error) {
    throw error;
  }

  const { hasPermission: userCanEdit, loading: userCanEditLoading } =
    useHasPermissionQuery('update:indicator_result', indicator);
  const { hasPermission: userCanCreate, loading: userCanCreateLoading } =
    useHasPermissionQuery('insert:indicator_result', indicator);
  const indicatorResult = data?.indicator_result[0];
  const userCanModify = indicatorResult
    ? userCanEdit && !userCanEditLoading
    : userCanCreate && !userCanCreateLoading;

  const onSave = async (data: IndicatorResultFormFields) => {
    const { files, ...rest } = data;
    let indicatorResultId: string | undefined = indicatorResult?.Id;
    if (indicatorResult) {
      const updatePayload = {
        ...rest,
        id: indicatorResult.Id,
        CustomAttributeData: data.CustomAttributeData || undefined,
      };
      // Ensure only relevant target value is sent based on indicator type
      // See https://linear.app/risksmart/issue/RSP-3902/updating-indicator-results-sends-invalid-mixed-data-for-text-and
      if (indicatorResult.parent?.Type === Indicator_Type_Enum.Number) {
        updatePayload.TargetValueTxt = null;
      }
      if (indicatorResult.parent?.Type === Indicator_Type_Enum.Text) {
        updatePayload.TargetValueNum = null;
      }
      await updateIndicatorResult(updatePayload);
    } else {
      const insertPayload = {
        ...rest,
        IndicatorId: parentIndicatorId,
        CustomAttributeData: data.CustomAttributeData || undefined,
      };
      if (parentIndicatorType === Indicator_Type_Enum.Number) {
        insertPayload.TargetValueTxt = null;
      }
      if (parentIndicatorType === Indicator_Type_Enum.Text) {
        insertPayload.TargetValueNum = null;
      }
      const result = await insertIndicatorResult(insertPayload);
      indicatorResultId = result.insert_indicator_result_one?.Id;
    }
    if (!indicatorResultId) {
      throw new Error('indicatorResultId is missing');
    }
    await updateFiles({
      parentType: Parent_Type_Enum.IndicatorResult,
      parentId: indicatorResultId,
      originalFiles: indicatorResult?.files.map((f) => f.file) ?? [],
      selectedFiles: files,
    });
  };

  if (loading) {
    return null;
  }
  const formId = 'indicator-result-form';

  return (
    <ModalForm
      i18n={t('indicator_results')}
      values={
        indicatorResult
          ? {
              ...defaultValues,
              ...indicatorResult,
              files: indicatorResult?.files.map((f) => f.file) ?? [],
            }
          : undefined
      }
      defaultValues={defaultValues}
      schema={indicatorResultSchema}
      onSave={onSave}
      onDismiss={onDismiss}
      formId={formId}
      visible={true}
      readOnly={!userCanModify}
      parentType={Parent_Type_Enum.IndicatorResult}
    >
      <IndicatorResultsForm
        indicatorType={parentIndicatorType}
        readOnly={!userCanModify}
      />
    </ModalForm>
  );
};

export default IndicatorResultModel;
