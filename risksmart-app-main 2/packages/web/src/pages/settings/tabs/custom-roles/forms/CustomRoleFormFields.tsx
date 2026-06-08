import Table from '@risk-smart/themed-cloudscape-components/table';
import Toggle from '@risk-smart/themed-cloudscape-components/toggle';
import type { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import ControlledGroupAndUserMultiSelect from 'src/components/form/controlled-group-and-user-multi-select';
import ControlledInput from 'src/components/form/controlled-input';
import useEntityInfo from 'src/hooks/getEntityInfo';
import { toTitleCase } from 'src/utils';

import type { CustomRoleFormFields as CustomRoleFormFieldsType } from './customRoleSchema';

interface Props {
  readOnly?: boolean;
  availableRoles: {
    roleKey: string;
    name: string;
    groupKey: Parent_Type_Enum;
    category: 'Manager' | 'Viewer';
  }[];
}

type GroupedRole = [Parent_Type_Enum, Props['availableRoles']];

const CustomRoleFormFields: FC<Props> = ({ readOnly, availableRoles }) => {
  const { control, watch, setValue } =
    useFormContext<CustomRoleFormFieldsType>();
  const { t: tc } = useTranslation(['common'], {
    keyPrefix: 'customRoles',
  });
  const getEntityInfo = useEntityInfo();

  const selectedRoleKeys = watch('RoleKeys') || [];

  // Group roles by groupKey and filter out Standard roles and groups without exactly 2 roles
  const groupedRoles: GroupedRole[] = Object.entries(
    availableRoles.reduce(
      (groups, role) => {
        const groupKey = role.groupKey;
        if (!groups[groupKey]) {
          groups[groupKey] = [];
        }
        groups[groupKey].push(role);

        return groups;
      },
      {} as Record<Parent_Type_Enum, Props['availableRoles']>
    )
  )
    .filter(([_, roles]) => roles.length > 0)
    .map(([groupKey, roles]) => [groupKey as Parent_Type_Enum, roles]);

  const handleToggleChange = (roleKey: string, checked: boolean) => {
    const currentRoleKeys = selectedRoleKeys;
    if (checked) {
      // Add role if not already present
      if (!currentRoleKeys.includes(roleKey)) {
        setValue('RoleKeys', [...currentRoleKeys, roleKey]);
      }
    } else {
      // Remove role if present
      setValue(
        'RoleKeys',
        currentRoleKeys.filter((key) => key !== roleKey)
      );
    }
  };

  return (
    <>
      <ControlledInput
        key={'Name'}
        testId={'name'}
        forceRequired={true}
        name={'Name'}
        label={tc('fields.roleName')}
        placeholder={tc('fields.roleName_placeholder')}
        control={control}
        disabled={readOnly}
      />
      <ControlledInput
        testId={'description'}
        key={'Description'}
        name={'Description'}
        label={tc('fields.description')}
        placeholder={tc('fields.description_placeholder')}
        control={control}
        disabled={readOnly}
      />
      <Table
        items={groupedRoles}
        columnDefinitions={[
          {
            id: 'groupName',
            header: tc('fields.permission'),
            cell: ([groupKey]: GroupedRole) => {
              return toTitleCase(getEntityInfo(groupKey).plural);
            },
            width: 200,
          },
          {
            id: 'managerRole',
            header: tc('fields.managerRole'),
            cell: ([, roles]: GroupedRole) => {
              const managerRole = roles.find(
                (role) => role.category === 'Manager'
              );
              if (!managerRole) {
                return null;
              }

              return (
                <Toggle
                  checked={selectedRoleKeys.includes(managerRole.roleKey)}
                  onChange={({ detail }) =>
                    handleToggleChange(managerRole.roleKey, detail.checked)
                  }
                  disabled={readOnly}
                />
              );
            },
            width: 150,
          },
          {
            id: 'viewerRole',
            header: tc('fields.viewerRole'),
            cell: ([, roles]: GroupedRole) => {
              const viewerRole = roles.find(
                (role) => role.category === 'Viewer'
              );
              if (!viewerRole) {
                return null;
              }

              return (
                <Toggle
                  checked={selectedRoleKeys.includes(viewerRole.roleKey)}
                  onChange={({ detail }) =>
                    handleToggleChange(viewerRole.roleKey, detail.checked)
                  }
                  disabled={readOnly}
                />
              );
            },
            width: 150,
          },
        ]}
        variant={'borderless'}
        wrapLines
      />
      <ControlledGroupAndUserMultiSelect
        key={'UserIds'}
        control={control}
        label={tc('fields.assignedUsers')}
        includeGroups={false}
        description={tc('fields.assignedUsers_help')}
        testId={'assignedUsers'}
        name={'UserIds'}
        disabled={readOnly}
      />
    </>
  );
};

export default CustomRoleFormFields;
