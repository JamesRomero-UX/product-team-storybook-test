import Link from '@risksmart-app/components/src/link';
import i18n from '@risksmart-app/i18n/src/i18n';

import type { CellInfo, ReportFieldType } from './types';

const getText = ({ fieldData, helpers, fieldDef }: CellInfo): string => {
  if (fieldDef.displayType !== 'detailsLink') {
    throw new Error('Unsupported display type');
  }
  const value = fieldData.value;
  const entityInfo = helpers.getEntityInfo(fieldDef.entityInfoParentType);

  return entityInfo.url(value as string);
};

export const detailsLink: ReportFieldType = {
  exportVal: getText,
  getChartLabel: getText,
  cell: (cellData) => {
    if (cellData.fieldDef.displayType !== 'detailsLink') {
      throw new Error('Unsupported display type');
    }
    const url = getText(cellData);
    const entityInfo = cellData.helpers.getEntityInfo(
      cellData.fieldDef.entityInfoParentType
    );

    return (
      <Link href={url}>
        {i18n.t('customDatasources.view_details', {
          entity: entityInfo.singular,
        })}
      </Link>
    );
  },
};
