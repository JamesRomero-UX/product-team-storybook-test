import { useMutation } from '@apollo/client';
import { useGetGuidParam } from '@risksmart-app/components/src/routes/routes.utils';
import type { GetControlByIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import {
  Parent_Type_Enum,
  UpdateControlGroupDocument,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { PageForm } from 'src/components/form/form/PageForm';
import { useI18NSummaryHelpContent } from 'src/components/help-panel/useSummaryHelpContent';
import {
  useGetControlGroupById,
  useGetControlGroupsRegister,
} from 'src/hooks/queries';
import type { ControlGroupFormFieldData } from 'src/pages/control-groups/update/forms/controlGroupSchema';
import {
  defaultValues,
  useControlGroupSchema,
} from 'src/pages/control-groups/update/forms/controlGroupSchema';
import { useHasPermissionQuery } from 'src/rbac/useHasPermission';

import { evictField } from '@/utils/graphqlUtils';

import ControlGroupFormFields from '../../forms/ControlGroupFormFields';

type Props = {
  control?: GetControlByIdQuery['control'][0];
};

const Tab: FC<Props> = () => {
  useI18NSummaryHelpContent('controlGroups.detailsHelp');
  const controlGroupId = useGetGuidParam('controlGroupId');
  const navigate = useNavigate();
  const { t } = useTranslation(['common']);
  const ControlGroupSchema = useControlGroupSchema(controlGroupId);
  const {
    hasPermission: canEditControlGroup,
    loading: canEditControlGroupLoading,
  } = useHasPermissionQuery('update:control_group');

  const { data, error, refetch } = useGetControlGroupById({
    queryArgs: { controlGroupId },
  });
  const { refetch: refetchRegister } = useGetControlGroupsRegister({
    queryArgs: {},
  });

  if (error) {
    throw error;
  }

  const initialValues = data?.control_group[0];

  const [mutate] = useMutation(UpdateControlGroupDocument, {
    update: (cache) => {
      evictField(cache, 'control_group');
    },
  });

  const onSave = async (data: ControlGroupFormFieldData) => {
    if (!initialValues) {
      throw new Error('Control group not found');
    }
    await mutate({
      variables: {
        ...data,
        OriginalTimestamp: initialValues.ModifiedAtTimestamp,
        Id: initialValues.Id,
        Owner: data.Owner.value,
      },
    });
    await refetch();
    await refetchRegister();
  };

  return (
    <PageForm
      formId={'control-group-form'}
      defaultValues={defaultValues}
      values={
        initialValues
          ? {
              ...initialValues,
              Owner: { value: initialValues.Owner, type: 'user' },
            }
          : undefined
      }
      i18n={t('controlGroups')}
      onSave={onSave}
      onDismiss={() => navigate(-1)}
      schema={ControlGroupSchema}
      readOnly={!canEditControlGroup || canEditControlGroupLoading}
      parentType={Parent_Type_Enum.ControlGroup}
      header={t('details')}
    >
      <ControlGroupFormFields
        readOnly={!canEditControlGroup || canEditControlGroupLoading}
      />
    </PageForm>
  );
};

export default Tab;
