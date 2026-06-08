import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import SimpleRatingBadge from 'src/components/simple-rating-badge/SimpleRatingBadge';
import { getFriendlyId } from 'src/utils/friendlyId';

import Link from '@/components/link';
import { useGetOwnersFieldConfig } from '@/utils/table/hooks/useGetOwnersFieldConfig';
import type { UseGetTablePropsOptions } from '@/utils/table/hooks/useGetStatelessTableProps';
import { useGetTableProps } from '@/utils/table/hooks/useGetTableProps';
import type { TableFields, TablePropsWithActions } from '@/utils/table/types';
import { dateColumnFromConfig } from '@/utils/table/utils/dateColumn';
import {
  actionDetailsUrl,
  obligationChangeDetailsUrl,
  obligationDetailsUrl,
} from '@/utils/urls';

import type {
  ObligationChangeFields,
  ObligationChangeRegisterFields,
} from './types';
import { useLabelledFields } from './useLabelledFields';

const useGetFieldConfig = (): TableFields<ObligationChangeRegisterFields> => {
  const { t } = useTranslation('common', {
    keyPrefix: `obligationChanges.columns`,
  });
  const { t: gt } = useTranslation(['common'], { keyPrefix: 'columns' });
  const { t: rt } = useTranslation(['ratings']);
  const statuses = rt('obligation_change_status', { returnObjects: true });
  const allOwners = useGetOwnersFieldConfig<ObligationChangeRegisterFields>();

  return useMemo(
    () => ({
      SequentialIdLabel: {
        header: t('id'),
        sortingField: 'SequentialId',
        cell: (item) => (
          <Link
            variant={'secondary'}
            href={obligationChangeDetailsUrl(item.Id)}
          >
            {item.SequentialIdLabel}
          </Link>
        ),
      },
      ObligationTitle: {
        header: t('obligation'),
        cell: (item) => {
          if (!item.ObligationId || !item.ObligationTitle) {
            return '-';
          }

          return (
            <Link
              variant={'secondary'}
              href={obligationDetailsUrl(item.ObligationId)}
            >
              {item.ObligationTitle}
            </Link>
          );
        },
      },
      EffectiveDate: dateColumnFromConfig({
        header: { header: t('effective_date') },
        dateField: 'EffectiveDate',
      }),
      Regulator: {
        header: t('regulator'),
      },
      Reference: {
        header: t('reference'),
      },
      ExternalId: {
        header: t('external_id'),
      },
      Description: {
        header: t('description'),
      },
      CreatedAtTimestamp: dateColumnFromConfig({
        header: { header: t('created_on') },
        dateField: 'CreatedAtTimestamp',
      }),
      ModifiedAtTimestamp: dateColumnFromConfig({
        header: { header: t('updated_on') },
        dateField: 'ModifiedAtTimestamp',
      }),
      CreatedByUser: {
        header: t('created_by_id'),
      },
      ModifiedByUser: {
        header: t('updated_by_id'),
      },
      Id: {
        header: gt('guid'),
      },
      StatusLabelled: {
        header: t('status'),
        cell: (c) => {
          return (
            <SimpleRatingBadge
              rating={statuses.find((s) => s.value === c.StatusLabelled)}
            />
          );
        },
      },
      ActionsLabelled: {
        header: t('actions'),
        cell: (c) => {
          return c.actions
            .map((a) => a.action)
            .filter((a) => !!a)
            .map((a) => (
              <>
                <Link variant={'secondary'} href={actionDetailsUrl(a.Id)}>
                  {getFriendlyId(Parent_Type_Enum.Action, a.SequentialId)}
                  {': '}
                  {a.Title}
                </Link>
                <br />
              </>
            ));
        },
      },
      allOwners,
    }),
    [allOwners, gt, t, statuses]
  );
};

const useGetProps = (
  records: ObligationChangeFields[] | undefined
): UseGetTablePropsOptions<ObligationChangeRegisterFields> => {
  const { t: at } = useTranslation('common', {
    keyPrefix: 'obligationChanges',
  });
  const fields = useGetFieldConfig();
  const labelledFields = useLabelledFields(records);

  return useMemo(
    () => ({
      tableId: 'obligationChangeRegister',
      data: labelledFields,
      entityLabel: at('entity'),
      emptyCollectionAction: <></>,
      preferencesStorageKey: 'ObligationChangeRegister-Preferences',
      enableFiltering: true,
      initialColumns: [
        'SequentialIdLabel',
        'ObligationTitle',
        'EffectiveDate',
        'Regulator',
        'StatusLabelled',
        'ActionsLabelled',
        'allOwners',
      ],
      fields,
      customAttributeFormIds: [],
    }),
    [at, fields, labelledFields]
  );
};

export const useGetCollectionTableProps = (
  records: ObligationChangeFields[] | undefined
): TablePropsWithActions<ObligationChangeRegisterFields> => {
  const props = useGetProps(records);

  return useGetTableProps(props);
};
