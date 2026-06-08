import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { ModalForm } from 'src/components/form/form/ModalForm';
import { useInsertControlGroup } from 'src/hooks/mutations';
import { useGetControlGroupsRegister } from 'src/hooks/queries';
import type { ControlGroupFormFieldData } from 'src/pages/control-groups/update/forms/controlGroupSchema';
import {
  defaultValues,
  useControlGroupSchema,
} from 'src/pages/control-groups/update/forms/controlGroupSchema';

import ControlGroup from './update/forms/ControlGroupFormFields';

type Props = {
  onDismiss: (updated?: boolean) => void;
};

const ControlGroupModal: FC<Props> = ({ onDismiss }) => {
  const { t } = useTranslation('common');
  const ControlGroupSchema = useControlGroupSchema();

  const { refetch } = useGetControlGroupsRegister({ queryArgs: {} });
  const { insertControlGroup } = useInsertControlGroup();

  const onSave = async (data: ControlGroupFormFieldData) => {
    await insertControlGroup({ ...data, Owner: data.Owner.value });
    await refetch();
  };

  return (
    <ModalForm
      onSave={onSave}
      defaultValues={defaultValues}
      i18n={t('controlGroups')}
      onDismiss={onDismiss}
      schema={ControlGroupSchema}
      formId={'control-group-form'}
      visible={true}
      parentType={Parent_Type_Enum.ControlGroup}
    >
      <ControlGroup />
    </ModalForm>
  );
};

export default ControlGroupModal;
