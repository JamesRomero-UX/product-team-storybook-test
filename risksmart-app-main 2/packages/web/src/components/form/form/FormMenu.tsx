import ButtonDropdown from '@risk-smart/themed-cloudscape-components/button-dropdown';
import type { FormId } from '@risksmart-app/shared/forms/formConfigRegistry';
import type { FC } from 'react';
import { useHasPermissionQuery } from 'src/rbac/useHasPermission';

import { useCanManageFormConfig } from '@/hooks/queries/form-configuration/useCanManageFormConfig';
import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';

import { useEditableFormContext } from './customisable-form/EditableFormContext';
import { useRiskSmartForm } from './customisable-form/RiskSmartFormContext';

interface FormMenuProps {
  parentType: FormId;
}
export const FormMenu: FC<FormMenuProps> = ({ parentType }) => {
  const trpcEnabled = useIsFeatureFlagEnabled('trpc');
  const { canManage, loading: rbacLoading } =
    useCanManageFormConfig(parentType);
  const { hasPermission, loading: legacyLoading } = useHasPermissionQuery(
    'update:custom_attribute_schema'
  );

  const canShowMenu = trpcEnabled ? canManage : hasPermission;
  const loading = trpcEnabled ? rbacLoading : legacyLoading;

  const { toggleEditMode } = useRiskSmartForm();
  const { showEditModal } = useEditableFormContext();
  const onAddAction = () => {
    showEditModal({
      parentType: parentType,
      fieldId: undefined,
      defaultRequired: undefined,
      defaultValueOptions: [],
      allowDefaultValue: true,
      forceRequired: undefined,
    });
  };
  const onEditAction = () => {
    toggleEditMode();
  };

  if (!canShowMenu || loading) {
    return null;
  }

  return (
    <>
      <ButtonDropdown
        data-testid={'form-settings-button'}
        expandToViewport
        ariaLabel={'Form Settings'}
        items={[
          {
            // TODO: translation
            text: 'Add custom field',
            id: 'add',
            disabled: false,
          },
          {
            // TODO: translation
            text: 'Edit form',
            id: 'edit',
            disabled: false,
          },
        ]}
        variant={'icon'}
        onItemClick={(e) => {
          if (e.detail.id === 'add') {
            onAddAction();
          }
          if (e.detail.id === 'edit') {
            onEditAction();
          }
        }}
      >
        {'...'}
      </ButtonDropdown>
    </>
  );
};
