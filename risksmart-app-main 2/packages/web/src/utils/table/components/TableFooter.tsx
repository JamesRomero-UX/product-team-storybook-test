import type { FormConfigurationPartsFragment } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import useEntityInfo from 'src/hooks/getEntityInfo';

import { useFormConfigRegistry } from '../hooks/form/useFormConfigRegistry';
import { getColumnHeader } from '../hooks/getColumnHeader';
import type {
  CsvFieldType,
  TableFields,
  TablePreferences,
  TableRecord,
} from '../types';

type Props<T extends TableRecord> = {
  tableFields: TableFields<T>;
  items: readonly T[];
  tablePreferences: TablePreferences<T>;
  formConfigurations: FormConfigurationPartsFragment[] | null;
};

function TableFooter<T extends TableRecord>({
  tableFields,
  items,
  tablePreferences,
  formConfigurations,
}: Props<T>) {
  const getEntityInfo = useEntityInfo();
  const formRegistry = useFormConfigRegistry();
  const visibleColumns =
    tablePreferences.contentDisplay
      ?.filter((c) => c.visible)
      .map((c) => c.id) || Object.keys(tableFields);
  const footerCells = visibleColumns.filter((c) => tableFields[c].footerVal);
  const includeFooter = footerCells.length > 0;
  if (!includeFooter) {
    return null;
  }

  return (
    <SimpleTableFooter
      items={footerCells.map((f) => ({
        header:
          tableFields[f].footerLabel ||
          getColumnHeader(
            { formRegistry, formConfigurations, getEntityInfo },
            tableFields[f]
          ),
        value: tableFields[f].footerVal?.(items),
      }))}
    />
  );
}

export default TableFooter;

type SimpleTableFooterProps = {
  items: { header: string; value: CsvFieldType | undefined }[];
};

export const SimpleTableFooter: FC<SimpleTableFooterProps> = ({ items }) => {
  const { t } = useTranslation(['common'], { keyPrefix: 'tables' });

  return (
    <div className={'flex'}>
      <div className={'font-bold grow'}>{t('totals')}</div>
      <div className={'flex space-x-4'}>
        {items.map((item) => (
          <div key={item.header}>
            {item.header}
            {': '}
            <span className={'font-bold'}>{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
