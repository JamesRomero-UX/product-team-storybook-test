import type { FC } from 'react';
import { useFormContext } from 'react-hook-form';
import { ControlledJsonEditor } from 'src/components/form/controlled-json-editor/ControlledJsonEditor';

import type { TaxonomyDataFields } from './taxonomySchema';

interface Props {
  readOnly?: boolean;
  selectedTaxonomy: string;
}

const TaxonomyFormFields: FC<Props> = ({ readOnly, selectedTaxonomy }) => {
  const { control } = useFormContext<TaxonomyDataFields>();

  return (
    <>
      {selectedTaxonomy === 'Common' && (
        <ControlledJsonEditor
          key={'Common'}
          forceRequired={true}
          name={'Common'}
          label={''}
          placeholder={''}
          control={control}
          disabled={readOnly}
        />
      )}
      {selectedTaxonomy === 'Rating' && (
        <ControlledJsonEditor
          key={'Rating'}
          forceRequired={true}
          name={'Rating'}
          label={''}
          placeholder={''}
          control={control}
          disabled={readOnly}
        />
      )}
      {selectedTaxonomy === 'Taxonomy' && (
        <ControlledJsonEditor
          key={'Taxonomy'}
          forceRequired={true}
          name={'Taxonomy'}
          label={''}
          placeholder={''}
          control={control}
          disabled={readOnly}
        />
      )}
      {selectedTaxonomy === 'Library' && (
        <ControlledJsonEditor
          key={'Library'}
          forceRequired={true}
          name={'Library'}
          label={''}
          placeholder={''}
          control={control}
          disabled={readOnly}
        />
      )}
      {selectedTaxonomy === 'InternalAuditRating' && (
        <ControlledJsonEditor
          key={'InternalAuditRating'}
          forceRequired={true}
          name={'InternalAuditRating'}
          label={''}
          placeholder={''}
          control={control}
          disabled={readOnly}
        />
      )}
    </>
  );
};

export default TaxonomyFormFields;
