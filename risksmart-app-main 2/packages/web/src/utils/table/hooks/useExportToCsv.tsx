import {
  arrayToCsv,
  downloadBlob,
} from '@risksmart-app/components/src/file/fileUtils';
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import type { FormConfigurationPartsFragment } from '@risksmart-app/web-graphql-client/generated/graphql';
import dayjs from 'dayjs';
import type { ParseKeys } from 'i18next';
import { useTranslation } from 'react-i18next';
import useEntityInfo from 'src/hooks/getEntityInfo';

import { handleError } from '@/utils/errorUtils';
import { recordsToExportArray } from '@/utils/table/utils/tableExport';

import type { TableFields, TablePreferences, TableRecord } from '../types';
import { useFormConfigRegistry } from './form/useFormConfigRegistry';

interface UseExportToCsvProps<T extends TableRecord> {
  tableFields: TableFields<T>;
  allPageItems: readonly (T & unknown)[];
  preferences: TablePreferences<T>;
  entityLabel: ParseKeys<'common'> | string;
  labelFormConfigurations?: FormConfigurationPartsFragment[] | null;
}

interface UseExportToCsvReturn {
  exportToCsvString: () => string;
  exportToCsv: () => void;
}

export const useExportToCsv = <T extends TableRecord>({
  tableFields,
  allPageItems,
  preferences,
  entityLabel,
  labelFormConfigurations,
}: UseExportToCsvProps<T>): UseExportToCsvReturn => {
  const { addNotification } = useNotifications();
  const { t } = useTranslation(['common']);
  const getEntityInfo = useEntityInfo();
  const formRegistry = useFormConfigRegistry();
  const exportToCsvString = (): string => {
    try {
      const data = recordsToExportArray(
        allPageItems,
        tableFields,
        preferences?.contentDisplay?.filter((c) => c.visible).map((c) => c.id),
        {
          formConfigurations: labelFormConfigurations ?? null,
          formRegistry,
          getEntityInfo,
        }
      );

      return arrayToCsv(data);
    } catch (e) {
      handleError(e);
      addNotification({
        type: 'error',
        content: t('export.export_failed_message'),
      });

      return '';
    }
  };

  const exportToCsv = (): void => {
    try {
      // '\ufeff' is the utc-8 BOM so characters appear correctly in excel
      const blob = new Blob(['\ufeff', exportToCsvString()], {
        type: 'text/csv;charset=utf-8',
      });

      downloadBlob(`${entityLabel}-${dayjs().toISOString()}.csv`, blob);
    } catch (e) {
      handleError(e);
      addNotification({
        type: 'error',
        content: t('export.export_failed_message'),
      });
    }
  };

  return {
    exportToCsvString,
    exportToCsv,
  };
};
