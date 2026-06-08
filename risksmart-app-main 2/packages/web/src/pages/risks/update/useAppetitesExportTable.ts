import { useLazyQuery } from '@apollo/client';
import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import { GetAppetitesByRiskIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { ContentTable } from 'pdfmake/interfaces';
import { useTranslation } from 'react-i18next';
import type { GetStandardFormFieldLabel } from 'src/hooks/forms/useFormCustomisation';

import { toLocalDate } from '@/utils/dateUtils';
import { createTable, tableHeaders } from '@/utils/pdf/table';

const useAppetitesExportTable = (
  riskId: string,
  getStandardFieldLabel: GetStandardFormFieldLabel
): [() => Promise<ContentTable>, boolean] => {
  const { getLabel: getRatingLabel } = useRating('risk_appetite');
  const [getAppetites, getAppetitesResult] = useLazyQuery(
    GetAppetitesByRiskIdDocument,
    {
      variables: {
        riskId,
      },
    }
  );

  const { t: appetitesColumns } = useTranslation(['common'], {
    keyPrefix: 'appetites.columns',
  });
  const createExportTable = async () => {
    const { data: appetiteData } = await getAppetites();
    const appetiteTableData = (appetiteData?.appetite_parent ?? []).map((i) => [
      toLocalDate(i.appetite?.CreatedAtTimestamp),
      getRatingLabel(i.appetite?.LowerAppetite),
      getRatingLabel(i.appetite?.UpperAppetite),
    ]);

    return createTable({
      widths: [80, 80, 80],
      body: [
        tableHeaders([
          appetitesColumns('dateSet'),
          getStandardFieldLabel('appetite', 'LowerAppetite'),
          getStandardFieldLabel('appetite', 'UpperAppetite'),
        ]),
        ...appetiteTableData,
      ],
    });
  };

  return [createExportTable, getAppetitesResult.loading];
};

export default useAppetitesExportTable;
