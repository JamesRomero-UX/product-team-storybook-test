import { useMutation } from '@apollo/client';
import Loading from '@risksmart-app/components/src/loading';
import {
  InsertColourPaletteDocument,
  UpdateColourPaletteDocument,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { type FC } from 'react';
import { useTranslation } from 'react-i18next';
import TabHeader from 'src/components/tab-header';
import { useColourPalette } from 'src/hooks/useColourPalette';

import { ColourPaletteForm } from './ColourPaletteForm';
import type { ColourPaletteFormData } from './colourPaletteSchema';

const ColoursTab: FC = () => {
  const { t } = useTranslation('common', { keyPrefix: 'colours' });
  const { colours, loading, error, paletteId, refetch } = useColourPalette();
  const [insertColourPalette] = useMutation(InsertColourPaletteDocument);
  const [updateColourPalette] = useMutation(UpdateColourPaletteDocument);

  const onSave = async (formData: ColourPaletteFormData) => {
    if (paletteId) {
      await updateColourPalette({
        variables: {
          Id: paletteId,
          Name: 'Default',
          Settings: formData,
        },
      });
    } else {
      await insertColourPalette({
        variables: {
          Name: 'Default',
          Settings: formData,
        },
      });
    }
    await refetch();
  };

  if (error) {
    throw error;
  }

  return (
    <>
      <TabHeader>{t('form_title')}</TabHeader>
      {loading ? (
        <Loading testId={'loading-colours'} />
      ) : (
        <ColourPaletteForm values={{ colours }} onSave={onSave} />
      )}
    </>
  );
};

export default ColoursTab;
