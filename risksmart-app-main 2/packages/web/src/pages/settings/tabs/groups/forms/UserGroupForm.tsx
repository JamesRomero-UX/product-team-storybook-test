import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { CustomisableForm } from 'src/components/form/form/CustomisableForm';
import { PageWrapper } from 'src/components/form/form/PageWrapper';
import type { FormContextProps } from 'src/components/form/form/types';

import UserGroupFormFields from './UserGroupFormFields';
import type { UserGroupFormFieldsSchema } from './userGroupSchema';
import { UserGroupSchema } from './userGroupSchema';

type Props = Omit<
  FormContextProps<UserGroupFormFieldsSchema>,
  | 'defaultValues'
  | 'formId'
  | 'i18n'
  | 'parentType'
  | 'renderTemplate'
  | 'schema'
> & {
  initialTier?: number;
  riskId?: string;
};

const UserGroupForm: FC<Props> = (props) => {
  const { t } = useTranslation(['common']);
  const defaultValues = {
    Name: props.values?.Name ?? '',
    Description: props.values?.Description ?? '',
    Email: props.values?.Email ?? '',
    OwnerContributor: props.values?.OwnerContributor ?? true,
  };

  return (
    <CustomisableForm
      {...props}
      header={t('details')}
      formId={'update-user-group-form'}
      defaultValues={defaultValues}
      i18n={t('userGroups')}
      schema={UserGroupSchema}
      renderTemplate={(renderProps) => <PageWrapper {...renderProps} />}
    >
      <UserGroupFormFields />
    </CustomisableForm>
  );
};

export default UserGroupForm;
