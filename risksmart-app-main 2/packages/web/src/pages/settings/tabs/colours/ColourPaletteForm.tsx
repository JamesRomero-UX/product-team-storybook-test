import { useTranslation } from 'react-i18next';
import { CustomisableForm } from 'src/components/form/form/CustomisableForm';
import { PageWrapper } from 'src/components/form/form/PageWrapper';
import type { FormContextProps } from 'src/components/form/form/types';

import { ColourPaletteFormFields } from './ColourPaletteFormFields';
import {
  type ColourPaletteFormData,
  colourPaletteSchema,
  defaultValues,
} from './colourPaletteSchema';

type Props = Omit<
  FormContextProps<ColourPaletteFormData>,
  'defaultValues' | 'formId' | 'i18n' | 'renderTemplate' | 'schema'
>;

export const ColourPaletteForm = ({ ...props }: Props) => {
  const { t } = useTranslation();

  return (
    <CustomisableForm
      {...props}
      values={props.values}
      formId={'colour-palette-form'}
      defaultValues={defaultValues}
      i18n={t('colours')}
      renderTemplate={(renderProps) => <PageWrapper {...renderProps} />}
      schema={colourPaletteSchema}
    >
      <ColourPaletteFormFields />
    </CustomisableForm>
  );
};
