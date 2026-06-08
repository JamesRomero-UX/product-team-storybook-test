import { Dashboard_Sharing_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import ControlledGroupAndUserMultiSelect from 'src/components/form/controlled-group-and-user-multi-select';
import ControlledInput from 'src/components/form/controlled-input';
import ControlledSelect from 'src/components/form/controlled-select';
import ControlledTextarea from 'src/components/form/controlled-textarea';
import { useHasPermissionQuery } from 'src/rbac/useHasPermission';

import type { DashboardFormFieldData } from './dashboardSchema';

export const DashboardFormFields: FC = () => {
  const { control, watch } = useFormContext<DashboardFormFieldData>();
  const { t } = useTranslation(['common'], { keyPrefix: 'dashboard' });
  const {
    hasPermission: hasOrganisationDashboardPermission,
    loading: hasOrganisationDashboardPermissionLoading,
  } = useHasPermissionQuery('insert:organisation_dashboard');
  const sharing = watch('sharing');

  return (
    <div>
      <ControlledInput
        control={control}
        name={'name'}
        label={t('name_label')}
      />

      <ControlledSelect
        control={control}
        name={'sharing'}
        testId={'dashboardSharing'}
        label={t('sharing_label')}
        options={[
          {
            value: Dashboard_Sharing_Type_Enum.UserOnly,
            label: t('sharing_user_only'),
          },
          ...(hasOrganisationDashboardPermission &&
          !hasOrganisationDashboardPermissionLoading
            ? [
                {
                  value: Dashboard_Sharing_Type_Enum.Organisation,
                  label: t('sharing_organisation'),
                },
              ]
            : []),
          {
            value: Dashboard_Sharing_Type_Enum.Custom,
            label: t('sharing_custom'),
          },
        ]}
      />

      {sharing === Dashboard_Sharing_Type_Enum.Custom && (
        <ControlledGroupAndUserMultiSelect
          includeGroups={true}
          label={'Shared with'}
          control={control}
          name={'Contributors'}
        />
      )}

      <ControlledTextarea
        control={control}
        name={'description'}
        label={t('description_label')}
      />
    </div>
  );
};
