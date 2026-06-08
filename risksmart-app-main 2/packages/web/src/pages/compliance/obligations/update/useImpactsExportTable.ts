import { useLazyQuery } from '@apollo/client';
import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import { GetObligationImpactsByParentIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { ContentTable } from 'pdfmake/interfaces';
import type { GetStandardFormFieldLabel } from 'src/hooks/forms/useFormCustomisation';

import { createTable, tableHeaders } from '@/utils/pdf/table';

const useImpactsExportTable = (
  obligationId: string,
  getStandardFieldLabel: GetStandardFormFieldLabel
): [() => Promise<ContentTable>, boolean] => {
  const { getLabel: getImpactLabel } = useRating('impact');
  const [getImpacts, getImpactsResult] = useLazyQuery(
    GetObligationImpactsByParentIdDocument,
    {
      variables: {
        _eq: obligationId,
      },
    }
  );

  const createExportTable = async () => {
    const { data: impactData } = await getImpacts();
    const issuesTableData = (impactData?.obligation_impact ?? []).map((i) => [
      i.Description,
      getImpactLabel(i.ImpactRating),
    ]);

    return createTable({
      widths: '*',
      body: [
        tableHeaders([
          getStandardFieldLabel('obligation_impact', 'Description'),
          getStandardFieldLabel('obligation_impact', 'ImpactRating'),
        ]),
        ...issuesTableData,
      ],
    });
  };

  return [createExportTable, getImpactsResult.loading];
};

export default useImpactsExportTable;
