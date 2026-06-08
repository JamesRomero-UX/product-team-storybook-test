import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import {
  Document_File_Type_Enum,
  Parent_Type_Enum,
  Version_Status_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC, MutableRefObject } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import ControlledAutosuggest from 'src/components/form/controlled-autosuggest';
import ControlledDatePicker from 'src/components/form/controlled-date-picker';
import { ControlledFileUpload } from 'src/components/form/controlled-file-upload/ControlledFileUpload';
import ControlledGroupAndUserSelect from 'src/components/form/controlled-group-and-user-select';
import ControlledInput from 'src/components/form/controlled-input';
import ControlledLinkInput from 'src/components/form/controlled-link-input';
import ControlledRadioGroup from 'src/components/form/controlled-radio-group';
import { noTransform } from 'src/components/form/controlled-radio-group/radioGroupUtils';
import ControlledSelect from 'src/components/form/controlled-select';
import ControlledTextarea from 'src/components/form/controlled-textarea';
import Editor from 'src/components/form/editor';
import ConditionalField from 'src/components/form/form/customisable-form/ConditionalField';
import CustomisableFieldWrapper from 'src/components/form/form/customisable-form/CustomisableFieldWrapper';
import { useHasPermissionQuery } from 'src/rbac/useHasPermission';
import { useFormConfig } from 'src/utils/table/hooks/form/useFormConfig';
import type { Editor as TinyEditor } from 'tinymce';

import { useIsModuleEnabled } from '@/hooks/useIsModuleEnabled';

import type { DocumentVersionFormFieldData } from './documentFileSchema';

type DocumentVersionFormFieldsProps = {
  readonly?: boolean;
  isCreatingNewEntity: boolean;
  savedStatus: Version_Status_Enum;
  editorRef: MutableRefObject<null | TinyEditor>;
  parentId: string;
  disableStatus: boolean;
};

const DocumentVersionFormFields: FC<DocumentVersionFormFieldsProps> = ({
  readonly,
  savedStatus,
  editorRef,
  parentId,
  isCreatingNewEntity,
  disableStatus,
}) => {
  const { control, watch } = useFormContext<DocumentVersionFormFieldData>();
  const {
    hasPermission: canUpdateAnyVersion,
    loading: canUpdateAnyVersionLoading,
  } = useHasPermissionQuery('update:document_file');
  const { getByValue } = useRating('document_file_status');
  const approversEnabled = useIsModuleEnabled('approval');

  // TODO: change based on current status
  const statusOptions = [
    {
      label: getByValue(Version_Status_Enum.Archived)?.label,
      value: Version_Status_Enum.Archived,
    },
    {
      label: getByValue(Version_Status_Enum.Draft)?.label,
      value: Version_Status_Enum.Draft,
    },
    {
      label: getByValue(Version_Status_Enum.Published)?.label,
      value: Version_Status_Enum.Published,
    },
  ];

  const { options: documentFileTypeOptions } = useRating('document_file_type');
  const fileTypeOptions = documentFileTypeOptions.map((option) => ({
    ...option,
    value: String(option.value),
  }));
  const status = watch('Status');
  const type = watch('Type');
  const { t: st } = useTranslation(['common'], {
    keyPrefix: 'documentFiles.fields',
  });
  const { t } = useTranslation(['common']);

  const reasonForReviewOptions = t('documentFiles.reviewReasons').map((rr) => ({
    value: rr,
  }));
  const isArchived = savedStatus === Version_Status_Enum.Archived;
  const isPublished = savedStatus === Version_Status_Enum.Published;
  const versionContentIsDisabled = readonly || isArchived || isPublished;
  const versionMetaIsDisabled =
    canUpdateAnyVersionLoading ||
    readonly ||
    ((isArchived || isPublished) && !canUpdateAnyVersion);
  const showReviewOptions =
    approversEnabled || status === Version_Status_Enum.Published || isArchived;

  const reviewFieldsDisabled = approversEnabled
    ? versionMetaIsDisabled
    : canUpdateAnyVersionLoading ||
      readonly ||
      (isArchived && !canUpdateAnyVersion);
  const formConfig = useFormConfig(Parent_Type_Enum.DocumentFile);

  return (
    <CustomisableFieldWrapper readOnly={readonly}>
      <ControlledInput
        key={'version'}
        name={formConfig.Version.fieldId}
        label={formConfig.Version.formLabel}
        forceRequired={true}
        description={st('Version_help')}
        control={control}
        placeholder={st('Version_placeholder')}
        testId={'version'}
        disabled={versionContentIsDisabled}
      />
      <ControlledSelect
        key={'versionStatus'}
        name={formConfig.Status.fieldId}
        forceRequired={true}
        label={formConfig.Status.formLabel}
        description={st('Status_help')}
        control={control}
        disabled={
          versionContentIsDisabled || !isCreatingNewEntity || disableStatus
        }
        options={statusOptions}
        testId={'status'}
      />
      <ControlledTextarea
        key={'summary'}
        name={formConfig.Summary.fieldId}
        label={formConfig.Summary.formLabel}
        description={st('Summary_help')}
        control={control}
        disabled={versionMetaIsDisabled}
        testId={'summary'}
      />
      <ControlledRadioGroup
        key={'type'}
        label={formConfig.Type.formLabel}
        description={st('Type_help')}
        name={formConfig.Type.fieldId}
        testId={'type'}
        control={control}
        items={fileTypeOptions}
        transform={noTransform}
        disabled={versionContentIsDisabled}
      />
      <ConditionalField
        condition={type === Document_File_Type_Enum.Html}
        key={'content'}
      >
        <Editor
          label={formConfig.Content.formLabel}
          name={formConfig.Content.fieldId}
          control={control}
          editorRef={editorRef}
          disabled={versionContentIsDisabled}
          enableComments={!versionContentIsDisabled}
          parentId={parentId}
          testId={'content'}
          // Need to remove comments if we're basing content of a previous version (i.e. not editing existing version)
          // as editing comments in one version would change the other
          removeInitialComments={!isCreatingNewEntity}
        />
      </ConditionalField>
      <ConditionalField
        condition={type === Document_File_Type_Enum.Link}
        key={'link'}
      >
        <ControlledLinkInput
          name={formConfig.Link.fieldId}
          label={formConfig.Link.formLabel}
          description={st('Link_help')}
          control={control}
          forceRequired={true}
          testId={'link'}
          inputMode={'url'}
          disabled={versionContentIsDisabled}
        />
      </ConditionalField>
      <ConditionalField
        condition={type === Document_File_Type_Enum.File}
        key={'files'}
      >
        <ControlledFileUpload
          testId={'attachFiles'}
          label={formConfig.files.formLabel}
          description={st('newFile_help')}
          control={control}
          name={formConfig.files.fieldId}
          forceRequired={true}
          disabled={versionContentIsDisabled}
          multiple={false}
        />
      </ConditionalField>
      <ConditionalField condition={showReviewOptions} key={'reasonForReview'}>
        <ControlledAutosuggest
          name={formConfig.ReasonForReview.fieldId}
          testId={'reasonForReview'}
          label={formConfig.ReasonForReview.formLabel}
          description={st('ReasonForReview_help')}
          control={control}
          options={reasonForReviewOptions}
          disabled={reviewFieldsDisabled}
        />
      </ConditionalField>
      <ConditionalField condition={showReviewOptions} key={'reviewedBy'}>
        <ControlledGroupAndUserSelect
          control={control}
          addEmptyOption={true}
          name={formConfig.ReviewedBy.fieldId}
          label={formConfig.ReviewedBy.formLabel}
          description={st('ReviewedBy_help')}
          testId={'reviewedBy'}
          disabled={reviewFieldsDisabled}
          includeGroups={false}
        />
      </ConditionalField>
      <ConditionalField condition={showReviewOptions} key={'reviewDate'}>
        <ControlledDatePicker
          name={formConfig.ReviewDate.fieldId}
          label={formConfig.ReviewDate.formLabel}
          description={st('ReviewDate_help')}
          control={control}
          testId={'reviewDate'}
          disabled={reviewFieldsDisabled}
        />
      </ConditionalField>
      <ConditionalField condition={showReviewOptions} key={'nextReviewDate'}>
        <ControlledDatePicker
          name={formConfig.NextReviewDate.fieldId}
          label={formConfig.NextReviewDate.formLabel}
          description={st('NextReviewDate_help')}
          control={control}
          testId={'nextReviewDate'}
          disabled={reviewFieldsDisabled}
        />
      </ConditionalField>
    </CustomisableFieldWrapper>
  );
};

export default DocumentVersionFormFields;
