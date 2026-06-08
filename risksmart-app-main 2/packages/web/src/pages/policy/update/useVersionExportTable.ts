import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import type { ContentTable } from 'pdfmake/interfaces';
import { useTranslation } from 'react-i18next';
import type { GetStandardFormFieldLabel } from 'src/hooks/forms/useFormCustomisation';
import { useGetDocumentFilesByDocumentId } from 'src/hooks/queries';

import { toLocalDate } from '@/utils/dateUtils';
import { createTable, tableHeaders } from '@/utils/pdf/table';

const useVersionExportTable = (
  documentId: string,
  getStandardFieldLabel: GetStandardFormFieldLabel
): [() => Promise<ContentTable>, boolean] => {
  const { getLabel: getVersionTypeLabel } = useRating('document_file_type');
  const { getLabel: geVersionStatusLabel } = useRating('document_file_status');
  const { refetch, loading } = useGetDocumentFilesByDocumentId({
    queryArgs: { documentId },
    shouldSkip: true,
  });

  const { t: columns } = useTranslation(['common'], {
    keyPrefix: 'columns',
  });

  const createExportTable = async () => {
    const { data: versionsData } = await refetch();
    const versionsTableData = (versionsData?.document_file ?? []).map((au) => [
      au.Version,
      getVersionTypeLabel(au.Type),
      geVersionStatusLabel(au.Status),
      toLocalDate(au.ReviewDate),
      au.reviewedBy?.FriendlyName ?? '-',
      toLocalDate(au.NextReviewDate),
      toLocalDate(au.CreatedAtTimestamp),
    ]);

    return createTable({
      widths: '*',
      body: [
        tableHeaders([
          getStandardFieldLabel('document_file', 'Version'),
          getStandardFieldLabel('document_file', 'Type'),
          getStandardFieldLabel('document_file', 'Status'),
          getStandardFieldLabel('document_file', 'ReviewDate'),
          getStandardFieldLabel('document_file', 'ReviewedBy'),
          getStandardFieldLabel('document_file', 'ReviewDate'),
          columns('created_on'),
        ]),
        ...versionsTableData,
      ],
    });
  };

  return [createExportTable, loading];
};

export default useVersionExportTable;
