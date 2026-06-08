import { useFileUpdate } from '@risksmart-app/components/src/file/useFileUpdate';
import type { GetIndicatorByIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { ownerAndContributorIds } from 'src/components/form';
import { PageWrapper } from 'src/components/form/form/PageWrapper';
import { useI18NSummaryHelpContent } from 'src/components/help-panel/useSummaryHelpContent';
import { useUpdateIndicator } from 'src/hooks/mutations';
import IndicatorsDetailsForm from 'src/pages/indicators/forms/IndicatorDetailsForm';
import type { IndicatorFormDataFields } from 'src/pages/indicators/forms/indicatorSchema';
import { defaultValues } from 'src/pages/indicators/forms/indicatorSchema';
import { getContributors, getOwners } from 'src/rbac/contributorHelper';
import { useHasPermissionQuery } from 'src/rbac/useHasPermission';

type Props = {
  indicator: GetIndicatorByIdQuery['indicator'][0];
};

const Tab: FC<Props> = ({ indicator }) => {
  useI18NSummaryHelpContent('indicators.detailsHelp');
  const { updateFiles } = useFileUpdate();
  const {
    hasPermission: canUpdateIndicator,
    loading: canUpdateIndicatorLoading,
  } = useHasPermissionQuery('update:indicator', indicator);
  const { t } = useTranslation(['common']);
  const navigate = useNavigate();
  const { updateIndicator } = useUpdateIndicator();
  const onSave = async (data: IndicatorFormDataFields) => {
    if (!indicator) {
      throw new Error('Missing indicator data');
    }
    const { files, ...rest } = data;
    await updateIndicator({
      Id: indicator.Id,
      CustomAttributeData: data.CustomAttributeData || undefined,
      DepartmentTypeIds: rest.departments?.map((d) => d.DepartmentTypeId) || [],
      TagTypeIds: rest.tags?.map((t) => t.TagTypeId) || [],
      Description: rest.Description,
      LowerAppetiteNum:
        rest.Type == 'number' ? rest.LowerAppetiteNum : undefined,
      LowerToleranceNum:
        rest.Type == 'number' ? rest.LowerToleranceNum : undefined,
      TargetValueTxt: rest.Type === 'text' ? rest.TargetValueTxt : undefined,
      Title: rest.Title,
      Type: rest.Type,
      Unit: rest.Unit,
      UpperAppetiteNum:
        rest.Type == 'number' ? rest.UpperAppetiteNum : undefined,
      UpperToleranceNum:
        rest.Type == 'number' ? rest.UpperToleranceNum : undefined,
      schedule: rest.schedule,
      ...ownerAndContributorIds(data),
    });

    await updateFiles({
      parentType: Parent_Type_Enum.Indicator,
      parentId: indicator?.Id,
      originalFiles: indicator?.files.map((f) => f.file),
      selectedFiles: files,
    });
  };

  const onDismiss = () => navigate(-1);
  const indicatorValue: IndicatorFormDataFields = {
    ...defaultValues,
    ...indicator,
    files: indicator?.files.map((f) => f.file),
    Owners: getOwners(indicator),
    Contributors: getContributors(indicator),
    ancestorContributors: indicator?.ancestorContributors ?? [],
  } as IndicatorFormDataFields;

  return (
    <IndicatorsDetailsForm
      values={indicatorValue}
      onSave={onSave}
      onDismiss={onDismiss}
      readOnly={!canUpdateIndicator || canUpdateIndicatorLoading}
      header={t('details')}
      isUpdate={true}
      latestTestDate={indicator.scheduleState?.LatestDate || undefined}
      renderTemplate={(renderProps) => <PageWrapper {...renderProps} />}
    />
  );
};

export default Tab;
