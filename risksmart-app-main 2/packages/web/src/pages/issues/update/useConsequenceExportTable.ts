import { useLazyQuery } from '@apollo/client';
import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import { GetConsequencesByParentIssueIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { ContentTable } from 'pdfmake/interfaces';
import { useTranslation } from 'react-i18next';
import type { GetStandardFormFieldLabel } from 'src/hooks/forms/useFormCustomisation';

import { createTable, tableHeaders } from '@/utils/pdf/table';

const useConsequenceExportTable = (
  issueId: string,
  getStandardFieldLabel: GetStandardFormFieldLabel
): [() => Promise<ContentTable>, boolean] => {
  const { getLabel: getCriticalityLabel } = useRating('criticality');
  const [getConsequences, getConsequencesResult] = useLazyQuery(
    GetConsequencesByParentIssueIdDocument,
    {
      variables: {
        _eq: issueId,
      },
    }
  );
  const { t: st } = useTranslation(['common'], {
    keyPrefix: 'consequences',
  });

  const createExportTable = async () => {
    const { data: consequencesData } = await getConsequences();
    const consequencesTableData = (consequencesData?.consequence ?? []).map(
      (i) => [
        i.Title,
        st('costType')[i.CostType],
        i.CostValue,
        i.Criticality ? getCriticalityLabel(i.Criticality) : '-',
        i.Description ?? '',
      ]
    );

    return createTable({
      widths: ['*', 60, 40, 70, '*'],
      body: [
        tableHeaders([
          getStandardFieldLabel('consequence', 'Title'),
          getStandardFieldLabel('consequence', 'CostType'),
          getStandardFieldLabel('consequence', 'CostValue'),
          getStandardFieldLabel('consequence', 'Criticality'),
          getStandardFieldLabel('consequence', 'Description'),
        ]),
        ...consequencesTableData,
      ],
    });
  };

  return [createExportTable, getConsequencesResult.loading];
};

export default useConsequenceExportTable;
