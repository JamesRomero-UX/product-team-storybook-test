import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { MAX_COL_WIDTH } from 'src/App.config';
import SimpleRatingBadge from 'src/components/simple-rating-badge';

import Link from '@/components/link';
import { useGetContributorsFieldConfig } from '@/utils/table/hooks/useGetContributorsFieldConfig';
import { useGetDepartmentFieldConfig } from '@/utils/table/hooks/useGetDepartmentFieldConfig';
import { useGetOwnersFieldConfig } from '@/utils/table/hooks/useGetOwnersFieldConfig';
import type {
  StatefulTableOptions,
  UseGetTablePropsOptions,
} from '@/utils/table/hooks/useGetStatelessTableProps';
import { useGetStatelessTableProps } from '@/utils/table/hooks/useGetStatelessTableProps';
import { useGetTableProps } from '@/utils/table/hooks/useGetTableProps';
import { useGetTablePropsWithoutUrlHash } from '@/utils/table/hooks/useGetTablePropsWithoutUrlHash';
import { useGetTagFieldConfig } from '@/utils/table/hooks/useGetTagFieldConfig';
import type {
  DefaultSortingState,
  TableFields,
  TablePropsWithActions,
} from '@/utils/table/types';
import { dateColumnFromConfig } from '@/utils/table/utils/dateColumn';
import { acceptanceDetailUrl } from '@/utils/urls';

import type { AcceptanceFlatFields, AcceptanceTableFields } from './types';
import { useLabelledFields } from './useLabelledFields';

const useGetFieldConfig = ({
  useAbsoluteUrls,
}: {
  useAbsoluteUrls?: boolean;
}): TableFields<AcceptanceTableFields> => {
  const allOwners = useGetOwnersFieldConfig<AcceptanceTableFields>({
    formId: 'risk',
    fieldId: 'Owners',
    includeFromTypePostfix: true,
  });
  const tagField = useGetTagFieldConfig<AcceptanceTableFields>({
    formId: 'risk',
    fieldId: 'tags',
    includeFromTypePostfix: true,
  });
  const departmentField = useGetDepartmentFieldConfig<AcceptanceTableFields>(
    (r) => r.departments,
    {
      formId: 'risk',
      fieldId: 'departments',
      includeFromTypePostfix: true,
    }
  );
  const allContributors = useGetContributorsFieldConfig<AcceptanceTableFields>({
    formId: 'risk',
    fieldId: 'Contributors',
    includeFromTypePostfix: true,
  });
  const status = useRating('acceptance_status');
  const { t: st } = useTranslation(['common'], {
    keyPrefix: 'acceptances.columns',
  });
  const { t } = useTranslation(['common'], {
    keyPrefix: 'columns',
  });

  return useMemo(
    () => ({
      Title: {
        formId: 'acceptance',
        fieldId: 'Title',
        cell: (acceptance) => (
          <Link
            variant={'secondary'}
            href={
              useAbsoluteUrls
                ? acceptanceDetailUrl(acceptance.Id)
                : acceptance.Id
            }
            isRelativeUrl={!useAbsoluteUrls}
          >
            {acceptance.Title}
          </Link>
        ),
        isRowHeader: true,
        maxWidth: MAX_COL_WIDTH,
      },
      Details: {
        formId: 'acceptance',
        fieldId: 'Details',
        maxWidth: MAX_COL_WIDTH,
      },
      ParentTitle: { header: st('associations'), maxWidth: MAX_COL_WIDTH },
      Tier: { formId: 'risk', fieldId: 'Tier', includeFromTypePostfix: true },
      allOwners,
      allContributors,
      DateAcceptedFrom: dateColumnFromConfig({
        header: {
          formId: 'acceptance',
          fieldId: 'DateAcceptedFrom',
        },
        dateField: 'DateAcceptedFrom',
      }),
      DateAcceptedTo: dateColumnFromConfig({
        header: {
          formId: 'acceptance',
          fieldId: 'DateAcceptedTo',
        },
        dateField: 'DateAcceptedTo',
      }),
      StatusLabelled: {
        formId: 'acceptance',
        fieldId: 'Status',
        cell: (item) => {
          const rating = status.getByValue(item.Status);

          return (
            <SimpleRatingBadge rating={rating}>
              {item.StatusLabelled}
            </SimpleRatingBadge>
          );
        },
      },
      Id: { header: t('guid') },
      SequentialIdLabel: { header: t('id'), sortingField: 'SequentialId' },
      ModifiedAtTimestamp: dateColumnFromConfig({
        header: { header: t('updated_on') },
        dateField: 'ModifiedAtTimestamp',
      }),
      ModifiedByUser: { header: t('updated_by_id') },
      ModifiedByUserName: { header: t('updated_by_username') },
      requestedBy: { formId: 'acceptance', fieldId: 'requestedBy' },
      approvedBy: { formId: 'acceptance', fieldId: 'approvedBy' },
      tags: tagField,
      departments: departmentField,
    }),
    [
      allContributors,
      allOwners,
      departmentField,
      st,
      status,
      t,
      tagField,
      useAbsoluteUrls,
    ]
  );
};

const useGetAcceptancesTableProps = (
  records: AcceptanceFlatFields[] | undefined,
  defaultSortingState?: DefaultSortingState<AcceptanceTableFields>,
  useAbsoluteUrls?: boolean
): UseGetTablePropsOptions<AcceptanceTableFields> => {
  const { t: st } = useTranslation(['common'], { keyPrefix: 'acceptances' });

  const labelledFields = useLabelledFields(records);
  const fields = useGetFieldConfig({ useAbsoluteUrls });

  return useMemo(
    () => ({
      tableId: 'acceptanceRegister',
      data: labelledFields,
      entityLabel: st('entity_name'),
      emptyCollectionAction: <></>,
      preferencesStorageKey: 'AcceptanceRegisterTable-PreferencesV1',
      enableFiltering: true,
      initialColumns: [
        'Title',
        'Details',
        'ParentTitle',
        'Tier',
        'allOwners',
        'DateAcceptedFrom',
        'DateAcceptedTo',
        'StatusLabelled',
      ],
      fields,
      defaultSortingState,
      customAttributeFormIds: ['acceptance'],
    }),
    [labelledFields, st, fields, defaultSortingState]
  );
};

export const useGetCollectionTableProps = (
  records: AcceptanceFlatFields[] | undefined,
  defaultSortingState?: DefaultSortingState<AcceptanceTableFields>
): TablePropsWithActions<AcceptanceTableFields> => {
  const tableProps = useGetAcceptancesTableProps(
    records,
    defaultSortingState,
    true
  );

  return useGetTableProps(tableProps);
};

export const useGetCollectionStatelessTableProps = (
  records: AcceptanceFlatFields[] | undefined,
  defaultSortingState?: DefaultSortingState<AcceptanceTableFields>
): TablePropsWithActions<AcceptanceTableFields> => {
  const tableProps = useGetAcceptancesTableProps(records, defaultSortingState);

  return useGetTablePropsWithoutUrlHash(tableProps);
};

export const useGetAcceptanceSmartWidgetTableProps = (
  records: AcceptanceFlatFields[] | undefined,
  statefulTableOptions: StatefulTableOptions<AcceptanceTableFields>
): TablePropsWithActions<AcceptanceTableFields> => {
  const props = useGetAcceptancesTableProps(records, undefined, true);

  return useGetStatelessTableProps<AcceptanceTableFields>({
    ...props,
    ...statefulTableOptions,
    enableFiltering: false,
  });
};
