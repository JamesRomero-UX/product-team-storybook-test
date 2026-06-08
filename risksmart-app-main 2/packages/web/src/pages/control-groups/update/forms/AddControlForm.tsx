import type { FC } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import ControlledControlMultiSelect from 'src/components/form/controlled-control-multi-select';

import type { AddControlFields } from './addControlFormSchema';

type Props = {
  excludedControlIds?: string[];
};

const AddControlForm: FC<Props> = ({ excludedControlIds }) => {
  const { t: st } = useTranslation(['common'], {
    keyPrefix: 'addControl',
  });

  const { control } = useFormContext<AddControlFields>();
  const { watch } = useFormContext();
  const controls = watch('ControlIds');
  const count = controls.length;

  const placeholder =
    count === 0
      ? st('fields.title_placeholder')
      : st(
          count === 1 ? 'control_count_one_label' : 'control_count_other_label',
          { count }
        );

  return (
    <div>
      <ControlledControlMultiSelect
        control={control}
        name={'ControlIds'}
        label={st('fields.title')}
        placeholder={placeholder}
        excludedIds={excludedControlIds}
      />
    </div>
  );
};

export default AddControlForm;
