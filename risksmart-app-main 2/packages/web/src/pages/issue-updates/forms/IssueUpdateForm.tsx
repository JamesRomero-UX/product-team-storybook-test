import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ControlledFileUpload } from 'src/components/form/controlled-file-upload/ControlledFileUpload';
import ControlledInput from 'src/components/form/controlled-input';
import ControlledTextarea from 'src/components/form/controlled-textarea';
import CustomisableFieldWrapper from 'src/components/form/form/customisable-form/CustomisableFieldWrapper';
import type { IssueUpdatesFields } from 'src/schemas/issueUpdates';
import { useFormConfig } from 'src/utils/table/hooks/form/useFormConfig';

type Props = {
  readOnly?: boolean;
};

const IssueUpdateForm: FC<Props> = ({ readOnly }) => {
  const { control } = useFormContext<IssueUpdatesFields>();

  const { t: st } = useTranslation(['common'], { keyPrefix: 'actionUpdates' });
  const { t } = useTranslation(['common']);
  const formConfig = useFormConfig(Parent_Type_Enum.IssueUpdate);

  return (
    <CustomisableFieldWrapper readOnly={readOnly}>
      <ControlledInput
        key={'title'}
        testId={'title'}
        forceRequired={true}
        name={formConfig.Title.fieldId}
        label={formConfig.Title.formLabel}
        control={control}
        placeholder={st('fields.Title_placeholder') ?? ''}
        disabled={readOnly}
      />

      <ControlledTextarea
        testId={'description'}
        key={'description'}
        defaultRequired={true}
        name={formConfig.Description.fieldId}
        label={formConfig.Description.formLabel}
        placeholder={st('fields.Description_placeholder') ?? ''}
        control={control}
        disabled={readOnly}
      />
      <ControlledFileUpload
        testId={'attachFiles'}
        key={'attachFiles'}
        label={formConfig.files.formLabel}
        description={t('fields.newFiles_help')}
        control={control}
        name={formConfig.files.fieldId}
        disabled={readOnly}
      />
    </CustomisableFieldWrapper>
  );
};

export default IssueUpdateForm;
