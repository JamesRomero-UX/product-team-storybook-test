import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { CustomisableForm } from 'src/components/form/form/CustomisableForm';
import type { FormContextProps } from 'src/components/form/form/types';
import ActionFormFields from 'src/pages/actions/update/forms/ActionFormFields';
import type { ActionFormFieldData } from 'src/pages/actions/update/forms/actionsSchema';
import {
  ActionFormSchema,
  defaultValues,
} from 'src/pages/actions/update/forms/actionsSchema';
import { getContributors, getOwners } from 'src/rbac/contributorHelper';
import type { FileOrRelation } from 'src/schemas/global';

type Props = Omit<
  FormContextProps<ActionFormFieldData>,
  'defaultValues' | 'formId' | 'i18n' | 'parentType' | 'schema'
> & { beforeFieldsSlot?: ReactNode };

const ActionForm: FC<Props> = ({ beforeFieldsSlot, ...props }) => {
  const { t } = useTranslation('common');

  return (
    <CustomisableForm
      {...props}
      schema={ActionFormSchema}
      defaultValues={defaultValues}
      i18n={t('actions')}
      formId={'action-form'}
      parentType={Parent_Type_Enum.Action}
      mapPreviewedChanges={(
        current: ActionFormFieldData | undefined,
        incomingChanges:
          | (ActionFormFieldData & {
              Owners: { UserId: string }[];
              OwnerGroups: { UserGroupId: string }[];
              Contributors: { UserId: string }[];
              ContributorGroups: { UserGroupId: string }[];
            })
          | null
          | undefined,
        incomingFiles: FileOrRelation[] | undefined
      ): ActionFormFieldData => {
        return {
          ...defaultValues,
          ...current,
          ...incomingChanges,
          Owners: incomingChanges
            ? getOwners({
                owners: incomingChanges.Owners,
                ownerGroups: incomingChanges.OwnerGroups,
              })
            : (current?.Owners ?? []),
          Contributors: incomingChanges
            ? getContributors({
                contributors: incomingChanges.Contributors,
                contributorGroups: incomingChanges.ContributorGroups,
              })
            : (current?.Contributors ?? []),
          files: [...(current?.files ?? []), ...(incomingFiles ?? [])],
        };
      }}
    >
      {beforeFieldsSlot}
      <ActionFormFields readonly={props.readOnly} />
    </CustomisableForm>
  );
};

export default ActionForm;
