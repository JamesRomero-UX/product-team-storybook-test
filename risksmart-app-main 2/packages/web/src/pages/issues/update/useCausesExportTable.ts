import { useLazyQuery } from '@apollo/client';
import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import { GetCausesByParentIssueIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { ContentTable } from 'pdfmake/interfaces';
import type { GetStandardFormFieldLabel } from 'src/hooks/forms/useFormCustomisation';

import { createTable, tableHeaders } from '@/utils/pdf/table';

const useCausesExportTable = (
  issueId: string,
  getStandardFieldLabel: GetStandardFormFieldLabel
): [() => Promise<ContentTable>, boolean] => {
  const { getLabel: getSignificanceLabel } = useRating('significance');
  const [getCauses, getCausesResult] = useLazyQuery(
    GetCausesByParentIssueIdDocument,
    {
      variables: {
        _eq: issueId,
      },
    }
  );

  const createExportTable = async () => {
    const { data: causesData } = await getCauses();
    const causesTableData = (causesData?.cause ?? []).map((i) => [
      i.Title,
      getSignificanceLabel(i.Significance),
      i.Description ?? '',
    ]);

    return createTable({
      widths: '*',
      body: [
        tableHeaders([
          getStandardFieldLabel('cause', 'Title'),
          getStandardFieldLabel('cause', 'Significance'),
          getStandardFieldLabel('cause', 'Description'),
        ]),
        ...causesTableData,
      ],
    });
  };

  return [createExportTable, getCausesResult.loading];
};

export default useCausesExportTable;
