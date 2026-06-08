import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import SimpleRatingBadge from 'src/components/simple-rating-badge';
import { dateColumnFromConfig } from 'src/utils/table/utils/dateColumn';

import Link from '@/components/link';
import type { UseGetTablePropsOptions } from '@/utils/table/hooks/useGetStatelessTableProps';
import { useGetTableProps } from '@/utils/table/hooks/useGetTableProps';
import { exportStyleFromValue } from '@/utils/table/pdfExportStyles';
import type { TableFields, TablePropsWithActions } from '@/utils/table/types';
import {
  questionnaireResponseDetailsUrl,
  thirdPartyDetailsUrl,
} from '@/utils/urls';

import type {
  ThirdPartyResponseFields,
  ThirdPartyResponseRegisterFields,
} from './types';
import { useLabelledFields } from './useLabelledFields';

const useGetFieldConfig = (): TableFields<ThirdPartyResponseRegisterFields> => {
  const { t } = useTranslation(['common'], { keyPrefix: 'columns' });
  const { t: st } = useTranslation(['common'], {
    keyPrefix: 'third_party_responses.columns',
  });

  const getStatus = useRating('third_party_response_status');

  return {
    QuestionnaireTitle: {
      header: st('response'),
      cell: (item) => {
        return (
          <Link
            variant={'secondary'}
            href={questionnaireResponseDetailsUrl(item.Id, item.thirdParty!.Id)}
          >
            {item.QuestionnaireTitle}
          </Link>
        );
      },
    },
    ThirdPartyName: {
      header: st('thirdPartyTitle'),
      cell: (item) => (
        <Link
          variant={'secondary'}
          href={thirdPartyDetailsUrl(item.thirdParty!.Id)}
        >
          {item.ThirdPartyName}
        </Link>
      ),
    },
    QuestionnaireVersion: {
      header: st('questionnaireVersion'),
    },
    StatusLabelled: {
      id: 'statusLabelled',
      header: t('status'),
      cell: (item) => (
        <SimpleRatingBadge rating={getStatus.getByValue(item.Status)} />
      ),
      sortingField: 'Status',
      exportCellStyle: exportStyleFromValue(
        (item) => item.Status,
        getStatus.getByValue
      ),
    },
    Respondents: {
      header: st('respondent'),
      cell: (item) => item.Respondents,
    },
    CreatedByUser: {
      header: t('created_by_id'),
    },
    ModifiedByUser: {
      header: t('updated_by_id'),
    },
    ModifiedAtTimestamp: dateColumnFromConfig({
      header: { header: t('updated_on') },
      dateField: 'ModifiedAtTimestamp',
    }),
  };
};

export const useGetThirdPartyTableProps = (
  records: ThirdPartyResponseFields[] | undefined
): UseGetTablePropsOptions<ThirdPartyResponseRegisterFields> => {
  const { t: st } = useTranslation(['common'], {
    keyPrefix: 'third_party_responses',
  });
  const fields = useGetFieldConfig();
  const data = useLabelledFields(records);

  return useMemo(() => {
    return {
      data,
      tableId: 'thirdPartyResponseRegister',
      fields,
      customAttributeFormIds: [],
      entityLabel: st('entity_name'),
      enableFiltering: true,
      initialColumns: [
        'QuestionnaireTitle',
        'ThirdPartyName',
        'QuestionnaireVersion',
        'StatusLabelled',
        'Respondents',
      ],
      preferencesStorageKey: 'ThirdPartyResponseTable-Preferences',
    };
  }, [st, data, fields]);
};

export const useGetCollectionTableProps = (
  records: ThirdPartyResponseFields[] | undefined
): TablePropsWithActions<ThirdPartyResponseRegisterFields> => {
  const props = useGetThirdPartyTableProps(records);

  return useGetTableProps(props);
};
