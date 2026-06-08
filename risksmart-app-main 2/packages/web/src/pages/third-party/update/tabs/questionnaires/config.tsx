import Button from '@risksmart-app/components/src/button';
import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import SimpleRatingBadge from 'src/components/simple-rating-badge';
import { Permission } from 'src/rbac/Permission';

import Link from '@/components/link';
import type { UseGetTablePropsOptions } from '@/utils/table/hooks/useGetStatelessTableProps';
import { useGetTableProps } from '@/utils/table/hooks/useGetTableProps';
import type { TableFields, TablePropsWithActions } from '@/utils/table/types';
import { dateColumnFromConfig } from '@/utils/table/utils/dateColumn';
import {
  createQuestionnaireInviteUrl,
  questionnaireResponseDetailsUrl,
} from '@/utils/urls';

import type {
  ThirdPartyResponseFields,
  ThirdPartyResponseRegisterFields,
} from './types';
import { useLabelledFields } from './useLabelledFields';

const useGetFieldConfig = (): TableFields<ThirdPartyResponseRegisterFields> => {
  const { t } = useTranslation(['common'], { keyPrefix: 'columns' });
  const { t: ct } = useTranslation(['common'], {
    keyPrefix: 'third_party_responses.columns',
  });
  const { getByValue } = useRating('third_party_response_status');

  return {
    Questionnaire: {
      header: ct('response'),
      cell: (item) => (
        <Link
          variant={'secondary'}
          href={questionnaireResponseDetailsUrl(item.Id, item.ParentId)}
        >
          {item.Questionnaire}
        </Link>
      ),
    },
    QuestionnaireVersion: {
      header: ct('version'),
      cell: (item) => item.QuestionnaireVersion,
    },
    UserEmail: {
      header: ct('userEmail'),
    },
    StartDate: dateColumnFromConfig({
      header: { header: ct('startDate') },
      dateField: 'StartDate',
    }),
    Status: {
      header: ct('status'),
      cell: (item) => <SimpleRatingBadge rating={getByValue(item.Status)} />,
    },
    ExpiresAt: dateColumnFromConfig({
      header: { header: ct('expireBy') },
      dateField: 'ExpiresAt',
    }),
    CreatedAtTimestamp: dateColumnFromConfig({
      header: { header: t('created_on') },
      dateField: 'CreatedAtTimestamp',
    }),
    ModifiedAtTimestamp: dateColumnFromConfig({
      header: { header: t('updated_on') },
      dateField: 'ModifiedAtTimestamp',
    }),
    CreatedByFriendlyName: {
      header: t('created_by_username'),
    },
    ModifiedByFriendlyName: {
      header: t('updated_by_username'),
    },
  };
};

export const useGetQuestionnaireTemplatesTableProps = (
  records: ThirdPartyResponseFields[] | undefined,
  thirdPartyId?: string
): UseGetTablePropsOptions<ThirdPartyResponseRegisterFields> => {
  const { t: st } = useTranslation(['common'], {
    keyPrefix: 'questionnaire_invite',
  });
  const data = useLabelledFields(records);
  const fields = useGetFieldConfig();

  return useMemo(() => {
    return {
      data,
      fields,
      customAttributeFormIds: [],
      entityLabel: st('entity_name'),
      emptyCollectionAction: (
        <Permission permission={'update:third_party'}>
          <Button href={createQuestionnaireInviteUrl(thirdPartyId ?? '')}>
            {st('create_new_button')}
          </Button>
        </Permission>
      ),
      enableFiltering: true,
      initialColumns: [
        'Questionnaire',
        'QuestionnaireVersion',
        'Status',
        'UserEmail',
      ],
      preferencesStorageKey: 'QuestionnaireInvitesTable-PreferencesV1',
    };
  }, [st, data, fields, thirdPartyId]);
};

export const useGetCollectionTableProps = (
  records: ThirdPartyResponseFields[] | undefined,
  thirdPartyId?: string
): TablePropsWithActions<ThirdPartyResponseRegisterFields> => {
  const props = useGetQuestionnaireTemplatesTableProps(records, thirdPartyId);

  return useGetTableProps(props);
};
