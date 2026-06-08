import { PageNotFound } from '@risksmart-app/components/src/errors/errors';
import { useFileDownload } from '@risksmart-app/components/src/file/useFileDownload';
import type { GetDocumentFileQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { Version_Status_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useEffect, useState } from 'react';

import { useGetLatestDocumentFile } from '@/hooks/queries';

const escapeFileVersion = (version?: string) =>
  version ? version.replaceAll(/\./g, '_') : '';

export type PublicDocumentData = (
  | {
      type: 'file';
      fileName: string;
      blob?: Blob;
    }
  | {
      type: 'html';
      content: string;
    }
  | {
      type: 'link';
      link: string;
    }
) & {
  documentFile: GetDocumentFileQuery['document_file'][0];
};

type UsePublicDocumentResult =
  | {
      loading: false;
      error: false;
      data: PublicDocumentData;
    }
  | {
      loading: false;
      error: true;
      data?: undefined;
    }
  | {
      loading: true;
      error: false;
      data?: undefined;
    };

export const usePublicDocument = (
  documentId: string,
  fileId: 'latest' | string
): UsePublicDocumentResult => {
  const [blob, setBlob] = useState<Blob>();
  const downloadFile = useFileDownload();

  const { data, loading, error } = useGetLatestDocumentFile({
    queryArgs: {
      parentDocumentId: documentId,
      fileId: fileId !== 'latest' ? fileId : undefined,
      status: Version_Status_Enum.Published,
    },
  });

  const documentFile = data?.document_file[0];
  const title = documentFile?.parent?.Title;
  const version = documentFile?.Version;
  const fileName = `${title}_${escapeFileVersion(version)}`;

  useEffect(() => {
    (async () => {
      if (documentFile && documentFile.FileId && version && !blob) {
        setBlob(
          await downloadFile(
            {
              fileId: documentFile.FileId,
              fileName: `${title}_${escapeFileVersion(version)}`,
            },
            false
          )
        );
      }
    })();
  }, [documentFile, downloadFile, title, version, blob]);

  if (error && !loading) {
    return { loading, error: !!error };
  }
  if (!error && loading) {
    return { loading, error: !!error };
  }
  if (!documentFile) {
    throw new PageNotFound(`Document version with id ${fileId} not found`);
  }

  switch (documentFile.Type) {
    case 'html':
      return {
        loading: false,
        error: false,
        data: {
          documentFile,
          type: 'html',
          content: documentFile.Content ?? '',
        },
      };
    case 'link':
      return {
        loading: false,
        error: false,
        data: {
          documentFile,
          type: 'link',
          link: documentFile.Link ?? '',
        },
      };
    case 'file':
      return blob || documentFile
        ? {
            loading: false,
            error: false,
            data: {
              documentFile,
              type: 'file',
              fileName: fileName,
              blob: blob,
            },
          }
        : {
            loading: true,
            error: false,
          };
    default:
      return { loading: false, error: true };
  }
};
