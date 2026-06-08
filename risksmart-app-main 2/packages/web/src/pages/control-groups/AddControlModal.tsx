import { useMutation } from '@apollo/client';
import { AddControlParentsDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { ModalForm } from 'src/components/form/form/ModalForm';

import { evictField } from '@/utils/graphqlUtils';

import AddControlForm from './update/forms/AddControlForm';
import type { AddControlFields } from './update/forms/addControlFormSchema';
import {
  AddControlSchema,
  defaultValues,
} from './update/forms/addControlFormSchema';

type Props = {
  onDismiss: () => void;
  controlGroupId: string;
  excludedControlIds?: string[];
};

const AddControlModal: FC<Props> = ({
  onDismiss,
  controlGroupId,
  excludedControlIds,
}) => {
  const [addControlParents] = useMutation(AddControlParentsDocument, {
    update: (cache) => {
      evictField(cache, 'control');
      evictField(cache, 'control_group');
    },
  });
  const { t } = useTranslation();
  const onSave = async (data: AddControlFields) => {
    await addControlParents({
      variables: {
        objects: data.ControlIds.map(({ value }) => ({
          ParentId: controlGroupId,
          ControlId: value,
        })),
      },
    });
  };

  return (
    <ModalForm<AddControlFields>
      defaultValues={defaultValues}
      i18n={t('linkControl')}
      schema={AddControlSchema}
      onSave={onSave}
      onDismiss={onDismiss}
      formId={'add-control-form'}
      visible={true}
      readOnly={false}
    >
      <AddControlForm excludedControlIds={excludedControlIds} />
    </ModalForm>
  );
};

export default AddControlModal;
