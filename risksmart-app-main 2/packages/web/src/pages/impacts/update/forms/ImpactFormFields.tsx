import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import ControlledGroupAndUserMultiSelect from 'src/components/form/controlled-group-and-user-multi-select';
import ControlledInput from 'src/components/form/controlled-input';
import ControlledRating from 'src/components/form/controlled-rating';
import ControlledTextarea from 'src/components/form/controlled-textarea';
import Editor from 'src/components/form/editor/Editor';
import CustomisableFieldWrapper from 'src/components/form/form/customisable-form/CustomisableFieldWrapper';
import { useFormConfig } from 'src/utils/table/hooks/form/useFormConfig';

import type { ImpactFormFieldData } from './impactFormSchema';
import styles from './style.module.scss';

type Props = { readOnly?: boolean };

const ImpactFormFields: FC<Props> = (props) => {
  const { control } = useFormContext<ImpactFormFieldData>();
  const { t: st } = useTranslation(['common'], {
    keyPrefix: 'impacts',
  });
  const { t } = useTranslation(['common']);
  const formConfig = useFormConfig(Parent_Type_Enum.Impact);

  return (
    <div className={styles.form}>
      <CustomisableFieldWrapper readOnly={props.readOnly}>
        <ControlledInput
          key={'name'}
          forceRequired={true}
          testId={'name'}
          name={formConfig.Name.fieldId}
          label={formConfig.Name.formLabel}
          description={st('fields.Name_help')}
          control={control}
          placeholder={st('placeholders.Name')}
          disabled={props.readOnly}
        />

        <ControlledTextarea
          key={'rationale'}
          name={formConfig.Rationale.fieldId}
          label={formConfig.Rationale.formLabel}
          description={st('fields.Rationale_help')}
          placeholder={st('placeholders.Rationale') ?? ''}
          control={control}
          testId={'rationale'}
          disabled={props.readOnly}
        />

        <Editor
          key={'ratingGuidance'}
          name={formConfig.RatingGuidance.fieldId}
          label={formConfig.RatingGuidance.formLabel}
          description={st('fields.RatingGuidance_help')}
          control={control}
          disabled={props.readOnly}
          height={240}
        />

        <ControlledGroupAndUserMultiSelect
          key={'owners'}
          control={control}
          label={formConfig.Owners.formLabel}
          includeGroups={true}
          description={st('fields.Owner_help')}
          testId={'owners'}
          name={formConfig.Owners.fieldId}
          placeholder={t('fields.Owner_placeholder')}
          disabled={props.readOnly}
        />
        <ControlledRating
          key={'likelihoodAppetite'}
          control={control}
          testId={'likelihoodAppetite'}
          name={formConfig.LikelihoodAppetite.fieldId}
          label={formConfig.LikelihoodAppetite.formLabel}
          type={formConfig.LikelihoodAppetite.displayType.ratingKey}
          description={st('fields.LikelihoodAppetite_help')}
          disabled={props.readOnly}
          showValue={true}
        />
      </CustomisableFieldWrapper>
    </div>
  );
};

export default ImpactFormFields;
