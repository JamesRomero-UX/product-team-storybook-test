import type { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { CustomisableForm } from 'src/components/form/form/CustomisableForm';
import { PageWrapper } from 'src/components/form/form/PageWrapper';
import type { FormContextProps } from 'src/components/form/form/types';

import CustomRoleFormFields from './CustomRoleFormFields';
import type { CustomRoleFormFields as CustomRoleFormFieldsType } from './customRoleSchema';
import { CustomRoleSchema } from './customRoleSchema';

type Props = Omit<
  FormContextProps<CustomRoleFormFieldsType>,
  | 'defaultValues'
  | 'formId'
  | 'i18n'
  | 'parentType'
  | 'renderTemplate'
  | 'schema'
> & {
  readOnly?: boolean;
  availableRoles: {
    roleKey: string;
    name: string;
    groupKey: Parent_Type_Enum;
    category: 'Manager' | 'Viewer';
  }[];
};

const CustomRoleForm: FC<Props> = (props) => {
  const { t } = useTranslation(['common']);

  const defaultValues = {
    Name: props.values?.Name ?? '',
    Description: props.values?.Description ?? '',
    RoleKeys: props.values?.RoleKeys ?? [],
    UserIds: props.values?.UserIds ?? [],
  };

  return (
    <CustomisableForm
      {...props}
      header={t('details')}
      formId={'update-custom-role-form'}
      defaultValues={defaultValues}
      i18n={t('customRoles')}
      schema={CustomRoleSchema}
      renderTemplate={(renderProps) => <PageWrapper {...renderProps} />}
    >
      <CustomRoleFormFields availableRoles={props.availableRoles} />
    </CustomisableForm>
  );
};

export default CustomRoleForm;
