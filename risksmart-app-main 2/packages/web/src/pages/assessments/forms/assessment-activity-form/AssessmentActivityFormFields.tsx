import Button from '@risksmart-app/components/src/button';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import ControlledDatePicker from 'src/components/form/controlled-date-picker';
import { ControlledFileUpload } from 'src/components/form/controlled-file-upload/ControlledFileUpload';
import ControlledGroupAndUserSelect from 'src/components/form/controlled-group-and-user-select';
import ControlledInput from 'src/components/form/controlled-input';
import ControlledRadioGroup from 'src/components/form/controlled-radio-group';
import { noTransform } from 'src/components/form/controlled-radio-group/radioGroupUtils';
import ControlledSelect from 'src/components/form/controlled-select';
import ControlledTextarea from 'src/components/form/controlled-textarea';
import CustomisableFieldWrapper from 'src/components/form/form/customisable-form/CustomisableFieldWrapper';
import Tokens from 'src/components/tokens';
import { useFormConfig } from 'src/utils/table/hooks/form/useFormConfig';

import useEntityInfo from '@/hooks/getEntityInfo';

import type { TLinkedItem as ModalLinkedItem } from '../modals/LinkItemModal';
import { LinkItemModal } from '../modals/LinkItemModal';
import type { AssessmentActivityFormDataFields } from './assessmentActivitySchema';

interface Props {
  readOnly?: boolean;
}

enum TestIds {
  ActivityType = 'ActivityType',
  ActivityUser = 'ActivityUser',
  Status = 'Status',
}

const AssessmentActivityFormFields = ({ readOnly }: Props) => {
  const getEntityInfo = useEntityInfo();
  const { control, watch, setValue } =
    useFormContext<AssessmentActivityFormDataFields>();
  const LinkedItemIds = watch('LinkedItemIds');
  const [showLinkModal, setShowLinkModal] = useState(false);

  const { t } = useTranslation(['common'], {
    keyPrefix: 'assessmentActivities',
  });
  const { t: st } = useTranslation(['common'], {
    keyPrefix: 'assessmentActivities.fields',
  });
  const statusTypes = t('status', { returnObjects: true });
  const statusTypesOptions = Object.keys(statusTypes).map((key) => ({
    value: key,
    label: statusTypes[key as keyof typeof statusTypes],
  }));
  const activityTypes = t('type', { returnObjects: true });
  const activityTypesOptions = Object.keys(activityTypes)
    .filter((key) => key !== 'rcsa')
    .map((key) => ({
      value: key,
      label: activityTypes[key as keyof typeof activityTypes],
    }));
  const onSelectLinked = (selected: ModalLinkedItem[]) => {
    const items = LinkedItemIds;
    items.push(
      ...selected.map((c) => ({
        Id: c.Id,
        Type: c.Type,
        Label: c.Label,
      }))
    );
    setValue('LinkedItemIds', items, { shouldDirty: true });
  };
  const onLinkItemClicked = () => {
    setShowLinkModal(true);
  };

  const onLinkItemModalDismiss = () => {
    setShowLinkModal(false);
  };

  const removeToken = (s: string) => {
    const currentItems = LinkedItemIds;
    const items = currentItems.filter((c) => c.Id !== s);

    setValue('LinkedItemIds', items, { shouldDirty: true });
  };
  const formConfig = useFormConfig(Parent_Type_Enum.AssessmentActivity);

  return (
    <CustomisableFieldWrapper readOnly={readOnly}>
      <ControlledInput
        key={'title'}
        testId={'title'}
        forceRequired={true}
        disabled={readOnly}
        name={formConfig.Title.fieldId}
        label={st('Title')}
        description={st('Title_help')}
        placeholder={st('Title_placeholder')}
        control={control}
      />
      <ControlledSelect
        key={'activityType'}
        filteringType={'auto'}
        label={st('ActivityType')}
        description={st('ActivityType_help')}
        name={formConfig.ActivityType.fieldId}
        forceRequired={true}
        control={control}
        options={activityTypesOptions}
        disabled={readOnly}
        testId={TestIds.ActivityType}
      />
      <ControlledTextarea
        key={'summary'}
        testId={'summary'}
        disabled={readOnly}
        defaultRequired={true}
        name={formConfig.Summary.fieldId}
        label={st('Summary')}
        description={st('Summary_help')}
        placeholder={st('Summary_placeholder')}
        control={control}
      />
      <div key={'linked-items'}>
        <Button
          disabled={readOnly}
          variant={'normal'}
          onClick={onLinkItemClicked}
        >
          {t('link_item_button')}
        </Button>
        <Tokens
          disabled={readOnly}
          onRemove={removeToken}
          tokens={LinkedItemIds.map((c) => ({
            value: c.Id,
            label: c.Label,
            url: getEntityInfo(c.Type).url(c.Id),
          }))}
        />
      </div>
      <ControlledRadioGroup
        key={'status'}
        forceRequired={true}
        label={st('Status')}
        description={st('Status_help')}
        name={formConfig.Status.fieldId}
        control={control}
        items={statusTypesOptions}
        transform={noTransform}
        disabled={readOnly}
        testId={TestIds.Status}
      />
      <ControlledGroupAndUserSelect
        key={'assigned-user'}
        disabled={readOnly}
        addEmptyOption={true}
        name={formConfig.AssignedUser.fieldId}
        label={st('AssignedUser')}
        description={st('AssignedUser_help')}
        includeGroups={false}
        control={control}
        testId={TestIds.ActivityUser}
      />
      <ControlledDatePicker
        key={'completion-date'}
        testId={'completionDate'}
        disabled={readOnly}
        name={formConfig.CompletionDate.fieldId}
        label={st('CompletionDate')}
        description={st('CompletionDate_help')}
        control={control}
      />
      <ControlledFileUpload
        key={'newFiles'}
        testId={'attachFiles'}
        label={st('NewFiles')}
        control={control}
        name={formConfig.files.fieldId}
        disabled={readOnly}
      />
      {showLinkModal && (
        <LinkItemModal
          key={'link-modal'}
          onDismiss={onLinkItemModalDismiss}
          onSelect={onSelectLinked}
          excludeIds={LinkedItemIds.map((c) => c.Id)}
        />
      )}
    </CustomisableFieldWrapper>
  );
};

export default AssessmentActivityFormFields;
