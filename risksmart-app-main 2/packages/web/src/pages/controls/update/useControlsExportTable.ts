import { useLazyQuery } from '@apollo/client';
import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import { GetControlsDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { ContentTable } from 'pdfmake/interfaces';
import { useTranslation } from 'react-i18next';
import type { GetStandardFormFieldLabel } from 'src/hooks/forms/useFormCustomisation';

import { getOwnerValue } from '@/utils/pdf/ownerValue';
import { createTable, tableHeaders } from '@/utils/pdf/table';
import { getTagsValue } from '@/utils/pdf/tagsValue';

import { calculateOverallEffectiveness } from '../calculateEffectiveness';

const useControlsExportTable = (
  parentId: string,
  getStandardFieldLabel: GetStandardFormFieldLabel
): [() => Promise<ContentTable>, boolean] => {
  const [getControls, getControlsResult] = useLazyQuery(GetControlsDocument, {
    variables: {
      where: {
        parents: {
          ParentId: {
            _eq: parentId,
          },
        },
      },
    },
  });
  const { getLabel: getEffectivenessLabel } = useRating('effectiveness');

  const { t: controlsColumns } = useTranslation(['common'], {
    keyPrefix: 'controls.columns',
  });
  const createExportTable = async () => {
    const { data: controlData } = await getControls();
    const controlsTableData = (controlData?.control ?? []).map((i) => [
      i.Title,
      i.Type ?? '',
      getOwnerValue(i),
      getEffectivenessLabel(calculateOverallEffectiveness(i)),
      getTagsValue(i),
    ]);

    return createTable({
      widths: '*',
      body: [
        tableHeaders([
          getStandardFieldLabel('control', 'Title'),
          getStandardFieldLabel('control', 'Type'),
          getStandardFieldLabel('control', 'Owners'),
          controlsColumns('effectiveness'),
          getStandardFieldLabel('control', 'tags'),
        ]),
        ...controlsTableData,
      ],
    });
  };

  return [createExportTable, getControlsResult.loading];
};

export default useControlsExportTable;
