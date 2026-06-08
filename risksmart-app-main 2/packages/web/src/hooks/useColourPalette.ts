import { genericChartColours } from '@risksmart-app/components/src/utils/colours';
import { useCallback } from 'react';

import { useGetColourPalettes } from './queries/colour-palette/useGetColourPalettes';

export const useColourPalette = () => {
  const { data, loading, error, refetch } = useGetColourPalettes({
    queryArgs: {},
  });

  let colours = genericChartColours;
  let paletteId;

  if (
    !loading &&
    !error &&
    data?.colour_palette &&
    data.colour_palette.length > 0
  ) {
    colours = data.colour_palette[0].Settings?.colours || genericChartColours;
    paletteId = data.colour_palette[0].Id;
  }

  const genericCategoricalPalette = useCallback(
    (index: number) => {
      return colours.length > 0
        ? colours[index % colours.length]
        : genericChartColours[index % genericChartColours.length];
    },
    [colours]
  );

  return {
    loading,
    error,
    refetch,
    colours,
    paletteId,
    genericCategoricalPalette,
  };
};
