import { useMutation } from '@apollo/client';
import type {
  GetCustomRoleByIdQuery,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { UpdateCustomRoleDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useNavigate } from 'react-router';

import { settingsCustomRolesUrl } from '@/utils/urls';

import CustomRoleForm from '../../../forms/CustomRoleForm';
import type { CustomRoleFormFields } from '../../../forms/customRoleSchema';

type Props = {
  customRole: GetCustomRoleByIdQuery['custom_role'][number];
  availableRoles: {
    roleKey: string;
    name: string;
    groupKey: Parent_Type_Enum;
    category: 'Manager' | 'Viewer';
  }[];
};

const Tab: FC<Props> = ({ customRole, availableRoles }) => {
  const navigate = useNavigate();
  const [update] = useMutation(UpdateCustomRoleDocument);

  const customRoleValues = {
    Name: customRole.RoleName,
    Description: customRole.Description ?? undefined,
    RoleKeys: customRole.customRoleAssignments.map((cra) => cra.RoleTypeKey),
    UserIds: customRole.customRoleUsers.map((cru) => ({
      type: 'user' as const,
      value: cru.UserId,
    })),
  };

  const onSave = async (data: CustomRoleFormFields) => {
    const result = await update({
      variables: {
        input: {
          Id: customRole.Id,
          Name: data.Name,
          Description: data.Description,
          RoleKeys: data.RoleKeys,
          UserIds: data.UserIds.map((c) => c.value),
        },
      },
    });
    if (result.data?.customRoleUpdate?.affected_rows !== 1) {
      throw new Error(
        'Records not updated. Record may have been updated by another user'
      );
    }
    navigate(settingsCustomRolesUrl());
  };

  const onDismiss = () => navigate(settingsCustomRolesUrl());

  return (
    <CustomRoleForm
      readOnly={false}
      onSave={onSave}
      onDismiss={onDismiss}
      values={customRoleValues}
      availableRoles={availableRoles}
    />
  );
};

export default Tab;
