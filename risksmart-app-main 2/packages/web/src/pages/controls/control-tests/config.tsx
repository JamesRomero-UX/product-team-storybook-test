import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { MAX_COL_WIDTH } from 'src/App.config';
import SimpleRatingBadge from 'src/components/simple-rating-badge';

import Link from '@/components/link';
import useEntityInfo from '@/hooks/getEntityInfo';
import { useGetDepartmentFieldConfig } from '@/utils/table/hooks/useGetDepartmentFieldConfig';
import type {
  StatefulTableOptions,
  UseGetTablePropsOptions,
} from '@/utils/table/hooks/useGetStatelessTableProps';
import { useGetStatelessTableProps } from '@/utils/table/hooks/useGetStatelessTableProps';
import { useGetTableProps } from '@/utils/table/hooks/useGetTableProps';
import { useGetTagFieldConfig } from '@/utils/table/hooks/useGetTagFieldConfig';
import { exportStyleFromValue } from '@/utils/table/pdfExportStyles';
import type { TableFields, TablePropsWithActions } from '@/utils/table/types';
import { dateColumnFromConfig } from '@/utils/table/utils/dateColumn';

import type { ControlTestFields, ControlTestTableFields } from './types';
import { useLabelledFields } from './useLabelledFields';

type OnEditFunction = (testResult: ControlTestTableFields) => void;

const useGetFieldConfig = (
  onEdit?: OnEditFunction
): TableFields<ControlTestTableFields> => {
  const { getByValue: getByValueOverallEffectiveness } =
    useRating('effectiveness');
  const { getByValue: getByValueDesignEffectiveness } = useRating(
    'design_effectiveness'
  );
  const { getByValue: getByValuePerformanceEffectiveness } = useRating(
    'performance_effectiveness'
  );
  const tagField = useGetTagFieldConfig<ControlTestTableFields>({
    formId: 'control',
    fieldId: 'tags',
    includeFromTypePostfix: true,
  });
  const departmentField = useGetDepartmentFieldConfig<ControlTestTableFields>(
    (r) => r.departments,
    {
      formId: 'control',
      fieldId: 'departments',
      includeFromTypePostfix: true,
    }
  );
  const { t: stc } = useTranslation(['common'], { keyPrefix: 'columns' });
  const { t: st } = useTranslation(['common'], {
    keyPrefix: 'testResults.columns',
  });
  const getEntityInfo = useEntityInfo();

  return useMemo(
    () => ({
      SequentialId: {
        header: stc('id'),
        sortingField: 'SequentialId',
        cell: (item) => (
          <Link
            variant={'secondary'}
            href={'#'}
            onFollow={() => onEdit?.(item)}
          >
            {item.SequentialId}
          </Link>
        ),
      },
      Title: {
        formId: 'test_result',
        fieldId: 'Title',
        cell: (item) => (
          <Link
            variant={'secondary'}
            href={'#'}
            onFollow={() => onEdit?.(item)}
          >
            {item.Title}
          </Link>
        ),
        maxWidth: MAX_COL_WIDTH,
        isRowHeader: true,
      },
      ParentTitle: {
        formId: 'test_result',
        fieldId: 'ParentControlIds',
        cell: (item) => (
          <Link
            variant={'secondary'}
            href={getEntityInfo(Parent_Type_Enum.Control).url(
              item.ParentControlId
            )}
          >
            {item.ParentTitle}
          </Link>
        ),
        maxWidth: MAX_COL_WIDTH,
      },
      TestTypeLabelled: {
        formId: 'test_result',
        fieldId: 'TestType',
        cell: (item) => item.TestTypeLabelled,
      },
      TestDate: dateColumnFromConfig({
        dateField: 'TestDate',
        header: {
          formId: 'test_result',
          fieldId: 'TestDate',
        },
      }),
      DesignEffectivenessLabelled: {
        formId: 'test_result',
        fieldId: 'DesignEffectiveness',
        cell: (item) => (
          <SimpleRatingBadge
            rating={getByValueDesignEffectiveness(item.DesignEffectiveness)}
          />
        ),
        exportCellStyle: exportStyleFromValue(
          (item) => item.DesignEffectiveness,
          getByValueDesignEffectiveness
        ),
      },
      PerformanceEffectivenessLabelled: {
        formId: 'test_result',
        fieldId: 'PerformanceEffectiveness',
        cell: (item) => (
          <SimpleRatingBadge
            rating={getByValuePerformanceEffectiveness(
              item.PerformanceEffectiveness
            )}
          />
        ),
        exportCellStyle: exportStyleFromValue(
          (item) => item.PerformanceEffectiveness,
          getByValuePerformanceEffectiveness
        ),
      },
      OverallEffectivenessLabelled: {
        formId: 'test_result',
        fieldId: 'OverallEffectiveness',
        cell: (item) => (
          <SimpleRatingBadge
            rating={getByValueOverallEffectiveness(item.OverallEffectiveness)}
          />
        ),
        exportCellStyle: exportStyleFromValue(
          (item) => item.OverallEffectiveness,
          getByValueOverallEffectiveness
        ),
      },
      SubmitterNameLabelled: {
        formId: 'test_result',
        fieldId: 'Submitter',
        cell: (item) => item.SubmitterNameLabelled || '-',
      },
      //------------------
      CreatedAtTimestamp: dateColumnFromConfig({
        header: { header: stc('created_on') },
        dateField: 'CreatedAtTimestamp',
      }),
      Description: {
        formId: 'test_result',
        fieldId: 'Description',
        cell: (item) => item.Description || '-',
        maxWidth: MAX_COL_WIDTH,
      },
      Id: { header: stc('guid') },

      ControlSequentialId: {
        header: st('parent_id'),
        cell: (item) => item.ControlSequentialId,
      },
      ParentControlId: {
        header: st('parent_guid'),
        cell: (item) => item.ParentControlId,
      },
      ModifiedAtTimestamp: dateColumnFromConfig({
        header: { header: stc('updated_on') },
        dateField: 'ModifiedAtTimestamp',
      }),
      CreatedByUser: {
        header: stc('created_by_id'),
      },
      CreatedByUserName: {
        header: stc('created_by_username'),
      },
      FileCount: {
        header: st('associated_files'),
      },
      tags: tagField,
      departments: departmentField,
    }),
    [
      stc,
      st,
      tagField,
      departmentField,
      onEdit,
      getEntityInfo,
      getByValueDesignEffectiveness,
      getByValuePerformanceEffectiveness,
      getByValueOverallEffectiveness,
    ]
  );
};

const useGetControlTableProps = (
  records: ControlTestFields[] | undefined,
  onEdit: OnEditFunction | undefined
): UseGetTablePropsOptions<ControlTestTableFields> => {
  const { t: st } = useTranslation(['common'], { keyPrefix: 'controls' });
  const fields = useGetFieldConfig(onEdit);
  const labelledFields = useLabelledFields(records);

  return useMemo(
    () => ({
      tableId: 'controlTestRegister',
      data: labelledFields,
      entityLabel: st('entity_name'),
      emptyCollectionAction: <></>,
      preferencesStorageKey: 'ControlTestRegisterTable-PreferencesV1',
      enableFiltering: true,
      initialColumns: [
        'SequentialId',
        'Title',
        'ParentTitle',
        'TestTypeLabelled',
        'TestDate',
        'OverallEffectivenessLabelled',
        'SubmitterNameLabelled',
      ],
      fields,
      customAttributeFormIds: ['test_result'],
    }),
    [fields, labelledFields, st]
  );
};

export const useGetCollectionTableProps = (
  records: ControlTestFields[] | undefined,
  onEdit: OnEditFunction
): TablePropsWithActions<ControlTestTableFields> => {
  const props = useGetControlTableProps(records, onEdit);

  return useGetTableProps(props);
};

export const useGetControlTestSmartWidgetTableProps = (
  records: ControlTestFields[] | undefined,
  statefulTableOptions: StatefulTableOptions<ControlTestTableFields>
): TablePropsWithActions<ControlTestTableFields> => {
  const props = useGetControlTableProps(records, undefined);

  return useGetStatelessTableProps<ControlTestTableFields>({
    ...props,
    ...statefulTableOptions,
    enableFiltering: false,
  });
};
