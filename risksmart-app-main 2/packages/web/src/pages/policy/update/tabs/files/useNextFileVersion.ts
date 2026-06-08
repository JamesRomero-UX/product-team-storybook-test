import { nextFileVersion } from '@risksmart-app/shared/policy/fileVersionUtils';
import { Document_File_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';

import { useGetLatestDocumentFile } from '@/hooks/queries';

export const useNextFileVersion = (
  parentDocumentId: string
): [
  {
    nextVersion: string;
    content: null | string;
    link: null | string;
    type: Document_File_Type_Enum;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    customAttributeData: any;
  },
  { loading: boolean },
] => {
  const { data, loading } = useGetLatestDocumentFile({
    queryArgs: { parentDocumentId },
  });

  const previousVersion =
    data?.document_file.length === 1 ? data?.document_file[0] : undefined;
  const nextVersion = nextFileVersion(previousVersion?.Version);

  return [
    {
      nextVersion,
      content: previousVersion?.Content ?? null,
      link: previousVersion?.Link ?? null,
      type: previousVersion?.Type ?? Document_File_Type_Enum.File,
      customAttributeData: previousVersion?.CustomAttributeData,
    },
    { loading },
  ];
};
