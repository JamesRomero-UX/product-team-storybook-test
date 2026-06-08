import { useMutation, useQuery } from '@apollo/client';
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import {
  CustomRoleUserUpdateDocument,
  GetAuthUserByIdWithRolesDocument,
  GetAvailableRolesDocument,
  GetCustomRolesDocument,
  UpdateUserRolesDocument,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { ModalForm } from 'src/components/form/form/ModalForm';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';

import UserDetailsForm from './forms/UserDetailsForm';
import type {
  UserDetailsFormFields,
  UserDetailsFormFieldsMultiRole,
} from './forms/UserDetailsSchema';
import {
  UserDetailsSchema,
  UserDetailsSchemaMultiRole,
} from './forms/UserDetailsSchema';

type Props = {
  onDismiss: () => void;
  id: string;
};

const UserDetailsModal: FC<Props> = ({ onDismiss, id }) => {
  const { addNotification } = useNotifications();
  const { t } = useTranslation();
  const [update] = useMutation(UpdateUserRolesDocument);
  const [updateCustomRoles] = useMutation(CustomRoleUserUpdateDocument);

  // Check if the new granular role system (trpc feature) is enabled
  const isMultiRoleEnabled = useIsFeatureFlagEnabled('trpc');

  const { data: getUserResponse, loading: loadingUser } = useQuery(
    GetAuthUserByIdWithRolesDocument,
    {
      variables: {
        Id: id,
      },
      skip: !id,
      fetchPolicy: 'no-cache',
      onError: (error) => {
        addNotification({
          type: 'error',
          content: <>{error.message}</>,
        });
      },
    }
  );
  const user = getUserResponse?.auth_user_by_pk;
  const userOrg = user?.organisationusers[0];

  // Prepare form values based on whether multi-role mode is enabled
  const userValues: UserDetailsFormFields | UserDetailsFormFieldsMultiRole =
    isMultiRoleEnabled
      ? {
          UserId: user?.Id ?? '',
          // Map user's existing roles to the format expected by the form
          Roles:
            user?.customRoles?.map((cr) => ({
              label: cr.role.RoleName,
              value: cr.role.Id,
              description: cr.role.Description ?? '',
            })) ?? [],
        }
      : {
          UserId: user?.Id ?? '',
          Role: userOrg?.RoleKey ?? user?.RoleKey ?? '',
        };

  const { data: getRolesResponse, loading: loadingRoles } = useQuery(
    GetAvailableRolesDocument,
    {
      onError: (error) => {
        addNotification({
          type: 'error',
          content: <>{error.message}</>,
        });
      },
      skip: isMultiRoleEnabled,
    }
  );
  const { data: getCustomRolesData, loading: loadingCustomRoles } = useQuery(
    GetCustomRolesDocument,
    {
      onError: (error) => {
        addNotification({
          type: 'error',
          content: <>{error.message}</>,
        });
      },
      fetchPolicy: 'no-cache',
      skip: !isMultiRoleEnabled,
    }
  );
  const availableRoles = getRolesResponse?.available_roles ?? [];
  const roleOptions = !isMultiRoleEnabled
    ? availableRoles
        .map((role) => ({
          id: role.id,
          value: role.name,
          description: role.description,
        }))
        .sort((a, b) => a.value.localeCompare(b.value))
    : (getCustomRolesData?.custom_role ?? [])
        .map((role) => ({
          id: role.Id,
          value: role.RoleName,
          description: role.Description ?? undefined,
        }))
        .sort((a, b) => a.value.localeCompare(b.value)) || [];

  const onSave = async (
    values: UserDetailsFormFields | UserDetailsFormFieldsMultiRole
  ) => {
    if (isMultiRoleEnabled && 'Roles' in values) {
      // Multi-role mode: extract role IDs from option objects
      const { UserId, Roles } = values;
      const roleIds = Roles.map((role) => role.value);
      await updateCustomRoles({
        variables: {
          input: {
            UserId: UserId,
            CustomRoleIds: roleIds,
          },
        },
      });
    } else if (!isMultiRoleEnabled && 'Role' in values) {
      // Single role mode: convert to array for backward compatibility
      const { UserId, Role } = values;
      const roleIds = availableRoles
        .filter((role) => role.name === Role)
        .map((role) => role.id);

      await update({
        variables: {
          userId: UserId,
          roleIds,
        },
      });
    }
  };

  if (loadingUser || loadingRoles || loadingCustomRoles) {
    return null;
  }

  const formId = 'user-form';
  const isReadOnly = false;

  return (
    <ModalForm
      i18n={t('userSettings')}
      values={userValues}
      defaultValues={isMultiRoleEnabled ? { Roles: [] } : { Role: '' }}
      schema={
        isMultiRoleEnabled ? UserDetailsSchemaMultiRole : UserDetailsSchema
      }
      onSave={onSave}
      onDismiss={onDismiss}
      formId={formId}
      visible={true}
      readOnly={isReadOnly}
    >
      <UserDetailsForm
        roleOptions={roleOptions}
        readOnly={isReadOnly}
        multiRoleMode={isMultiRoleEnabled}
      />
    </ModalForm>
  );
};

export default UserDetailsModal;
