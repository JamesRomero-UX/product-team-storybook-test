import type { FC } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { ControlledSwitch } from '../form/controlled-switch/ControlledSwitch';
import type { UserSearchPreferencesSchemaFieldData } from './userSearchPreferencesSchema';

type Props = {
  showJobTitleToggle: boolean;
  showDirectoryDepartmentsToggle: boolean;
  showUserLocationToggle: boolean;
  showInheritedContributorsToggle: boolean;
};

const UserSearchPreferencesFormFields: FC<Props> = ({
  showDirectoryDepartmentsToggle,
  showJobTitleToggle,
  showUserLocationToggle,
  showInheritedContributorsToggle,
}) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'userSearchPreferences',
  });
  const { control } = useFormContext<UserSearchPreferencesSchemaFieldData>();

  return (
    <div>
      <h3>{t('headings.sections')}</h3>
      <ControlledSwitch
        name={'ShowGroups'}
        label={t('fields.showGroups')}
        control={control}
      />
      <ControlledSwitch
        name={'FilterByActivePlatformUsers'}
        label={t('fields.filterByActivePlatformUsers')}
        control={control}
      />
      <ControlledSwitch
        name={'ShowArchivedUsers'}
        label={t('fields.showArchivedUsers')}
        control={control}
      />
      {showInheritedContributorsToggle && (
        <ControlledSwitch
          name={'ShowInheritedContributors'}
          label={t('fields.showInheritedContributors')}
          control={control}
        />
      )}
      <h3>{t('headings.attributes')}</h3>
      <ControlledSwitch
        name={'ShowUserPlatformRole'}
        label={t('fields.showUserPlatformRole')}
        control={control}
      />
      {showJobTitleToggle && (
        <ControlledSwitch
          name={'ShowUserJobTitle'}
          label={t('fields.showUserJobTitle')}
          control={control}
        />
      )}
      {showDirectoryDepartmentsToggle && (
        <ControlledSwitch
          name={'ShowDirectoryDepartment'}
          label={t('fields.showDirectoryDepartments')}
          control={control}
        />
      )}
      {showUserLocationToggle && (
        <ControlledSwitch
          name={'ShowUserLocation'}
          label={t('fields.showUserLocation')}
          control={control}
        />
      )}
      <ControlledSwitch
        name={'ShowUserEmail'}
        label={t('fields.showUserEmail')}
        control={control}
      />
    </div>
  );
};

export default UserSearchPreferencesFormFields;
