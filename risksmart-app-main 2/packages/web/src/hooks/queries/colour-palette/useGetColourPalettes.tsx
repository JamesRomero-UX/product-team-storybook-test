import type { ColourPaletteResponseRow } from '@risksmart-app/trpc/src/types';
import type { GetColourPalettesQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetColourPalettesDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

type UseGetColourPalettesArgs = Record<string, never>;

export const useGetColourPalettes = createQueryHook<
  UseGetColourPalettesArgs,
  ColourPaletteResponseRow[],
  GetColourPalettesQuery
>({
  trpcQueryOptions: (trpc) =>
    trpc.frontend.colourPalette.getColourPalettes.queryOptions(),
  mapTrpcDataToGraphQL: (data) => ({
    colour_palette: data,
  }),
  graphqlDocument: GetColourPalettesDocument,
  graphqlFetchPolicy: 'no-cache',
});
