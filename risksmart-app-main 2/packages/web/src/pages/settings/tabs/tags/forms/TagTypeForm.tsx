import type { FC } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import ControlledAutosuggest from 'src/components/form/controlled-autosuggest';
import ControlledInput from 'src/components/form/controlled-input';

import type { TagTypeFormFields } from './tagTypeSchema';

interface Props {
  tagGroupOptions: {
    value: string;
  }[];
  readOnly?: boolean;
}

const TagTypeForm: FC<Props> = ({ tagGroupOptions, readOnly }) => {
  const { control } = useFormContext<TagTypeFormFields>();
  const { t } = useTranslation(['common'], {
    keyPrefix: 'tags',
  });

  return (
    <>
      <ControlledInput
        key={'name'}
        testId={'name'}
        forceRequired={true}
        name={'Name'}
        label={t('fields.nameField')}
        placeholder={t('fields.placeholders.name')}
        control={control}
        disabled={readOnly}
      />
      <ControlledInput
        testId={'description'}
        key={'description'}
        name={'Description'}
        label={t('fields.descriptionField')}
        placeholder={t('fields.placeholders.description')}
        control={control}
        disabled={readOnly}
      />
      <ControlledAutosuggest
        testId={'tagGroupName'}
        key={'tagGroupName'}
        name={'TagGroupName'}
        label={t('fields.groupField')}
        placeholder={t('fields.placeholders.group')}
        control={control}
        options={tagGroupOptions}
        enableVirtualScroll={true}
        disabled={readOnly}
      />
    </>
  );
};

export default TagTypeForm;
