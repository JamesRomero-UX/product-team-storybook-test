import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { PageForm } from 'src/components/form/form/PageForm';
import type { CommonProps } from 'src/components/form/form/types';

import TaxonomyFormFields from './TaxonomyFormFields';
import type { TaxonomyDataFields } from './taxonomySchema';
import { defaultValues, TaxonomySchema } from './taxonomySchema';

// TODO: possible change for Pick or just create new props
type Props = Omit<
  CommonProps<TaxonomyDataFields>,
  'defaultValues' | 'formId' | 'parentType' | 'schema'
> & { selectedTaxonomy: string };

const TaxonomyForm: FC<Props> = (props) => {
  const { t } = useTranslation('common');

  return (
    <PageForm
      {...props}
      schema={TaxonomySchema}
      defaultValues={defaultValues}
      i18n={t('taxonomy')}
      formId={'taxonomy'}
    >
      <TaxonomyFormFields
        readOnly={props.readOnly}
        selectedTaxonomy={props.selectedTaxonomy}
      />
    </PageForm>
  );
};

export default TaxonomyForm;
