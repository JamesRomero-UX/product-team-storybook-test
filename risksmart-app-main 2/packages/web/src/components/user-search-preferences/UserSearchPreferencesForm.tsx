import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { CustomisableForm } from 'src/components/form/form/CustomisableForm';

import { ModalWrapper } from '../form/form/ModalWrapper';
import type { FormContextProps } from '../form/form/types';
import UserSearchPreferencesFormFields from './UserSearchPreferencesFormFields';
import type { UserSearchPreferencesSchemaFieldData } from './userSearchPreferencesSchema';
import {
  defaultValues,
  UserSearchPreferencesSchema,
} from './userSearchPreferencesSchema';

export type Props = Omit<
  FormContextProps<UserSearchPreferencesSchemaFieldData>,
  | 'defaultValues'
  | 'formId'
  | 'i18n'
  | 'parentType'
  | 'renderTemplate'
  | 'schema'
> & {
  showJobTitleToggle: boolean;
  showDirectoryDepartmentsToggle: boolean;
  showUserLocationToggle: boolean;
  showInheritedContributorsToggle: boolean;
};

const UserSearchPreferencesForm: FC<Props> = ({
  showJobTitleToggle,
  showDirectoryDepartmentsToggle,
  showUserLocationToggle,
  showInheritedContributorsToggle,
  ...props
}) => {
  const { t } = useTranslation('common');

  return (
    <CustomisableForm
      {...props}
      schema={UserSearchPreferencesSchema}
      defaultValues={defaultValues}
      i18n={t('userSearchPreferences')}
      formId={'user-search-preferences-form'}
      renderTemplate={(renderProps) => (
        <ModalWrapper {...renderProps} visible={true} />
      )}
    >
      <UserSearchPreferencesFormFields
        showInheritedContributorsToggle={showInheritedContributorsToggle}
        showDirectoryDepartmentsToggle={showDirectoryDepartmentsToggle}
        showJobTitleToggle={showJobTitleToggle}
        showUserLocationToggle={showUserLocationToggle}
      />
    </CustomisableForm>
  );
};

export default UserSearchPreferencesForm;
