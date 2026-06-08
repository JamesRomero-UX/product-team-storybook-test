import { useLazyQuery } from '@apollo/client';
import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import { GetAcceptancesByParentRiskIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { ContentTable } from 'pdfmake/interfaces';
import type { GetStandardFormFieldLabel } from 'src/hooks/forms/useFormCustomisation';

import { toLocalDate } from '@/utils/dateUtils';
import { createTable, tableHeaders } from '@/utils/pdf/table';

const useAcceptancesExportTable = (
  riskId: string,
  getStandardFieldLabel: GetStandardFormFieldLabel
): [() => Promise<ContentTable>, boolean] => {
  const { getLabel: getStatusLabel } = useRating('acceptance_status');
  const [getAcceptances, getAcceptancesResult] = useLazyQuery(
    GetAcceptancesByParentRiskIdDocument,
    {
      variables: {
        ParentId: riskId,
      },
    }
  );

  const createExportTable = async () => {
    const { data: appetiteData } = await getAcceptances();
    const acceptanceTableData = (appetiteData?.acceptance ?? []).map((i) => [
      i.Title,
      i.Details ?? '',
      toLocalDate(i.DateAcceptedFrom),
      toLocalDate(i.DateAcceptedTo),
      getStatusLabel(i.Status),
    ]);

    return createTable({
      widths: '*',
      body: [
        tableHeaders([
          getStandardFieldLabel('acceptance', 'Title'),
          getStandardFieldLabel('acceptance', 'Details'),
          getStandardFieldLabel('acceptance', 'DateAcceptedFrom'),
          getStandardFieldLabel('acceptance', 'DateAcceptedTo'),
          getStandardFieldLabel('acceptance', 'Status'),
        ]),
        ...acceptanceTableData,
      ],
    });
  };

  return [createExportTable, getAcceptancesResult.loading];
};

export default useAcceptancesExportTable;
