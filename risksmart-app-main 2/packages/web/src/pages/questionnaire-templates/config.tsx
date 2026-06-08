import Button from '@risksmart-app/components/src/button';
import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import SimpleRatingBadge from 'src/components/simple-rating-badge';
import { Permission } from 'src/rbac/Permission';
import { dateColumnFromConfig } from 'src/utils/table/utils/dateColumn';

import Link from '@/components/link';
import type { UseGetTablePropsOptions } from '@/utils/table/hooks/useGetStatelessTableProps';
import { useGetTableProps } from '@/utils/table/hooks/useGetTableProps';
import type { TableFields, TablePropsWithActions } from '@/utils/table/types';
import {
  addQuestionnaireTemplateUrl,
  questionnaireTemplateDetailsUrl,
} from '@/utils/urls';

import type {
  QuestionnaireTemplateFields,
  QuestionnaireTemplateRegisterFields,
} from './types';
import { useLabelledFields } from './useLabelledFields';

export const useGetCollectionTableProps = (
  records: QuestionnaireTemplateFields[] | undefined
): TablePropsWithActions<QuestionnaireTemplateRegisterFields> => {
  const props = useGetQuestionnaireTemplatesTableProps(records);

  return useGetTableProps(props);
};

const useGetFieldConfig =
  (): TableFields<QuestionnaireTemplateRegisterFields> => {
    const { t: ct } = useTranslation(['common'], {
      keyPrefix: 'questionnaire_templates.columns',
    });
    const getStatus = useRating('questionnaire_template_version_status');

    return {
      Title: {
        formId: 'questionnaire_template',
        fieldId: 'Title',
        cell: (item) => (
          <Link
            variant={'secondary'}
            href={questionnaireTemplateDetailsUrl(item.Id)}
          >
            {item.Title}
          </Link>
        ),
      },
      Description: {
        formId: 'questionnaire_template',
        fieldId: 'Description',
      },
      LatestStatus: {
        id: 'latestStatus',
        header: ct('status'),
        cell: (item) => {
          return (
            <SimpleRatingBadge
              rating={getStatus.getByValue(item.LatestStatus)}
            />
          );
        },
        sortingField: 'Status',
      },
      CreatedByFriendlyName: {
        header: ct('created_by'),
      },
      CreatedAtTimestamp: dateColumnFromConfig({
        header: {
          header: ct('created_on'),
        },
        dateField: 'CreatedAtTimestamp',
      }),
      ModifiedByFriendlyName: {
        header: ct('updated_by'),
      },
      ModifiedAtTimestamp: dateColumnFromConfig({
        header: {
          header: ct('updated_on'),
        },
        dateField: 'ModifiedAtTimestamp',
      }),
    };
  };

export const useGetQuestionnaireTemplatesTableProps = (
  records: QuestionnaireTemplateFields[] | undefined
): UseGetTablePropsOptions<QuestionnaireTemplateRegisterFields> => {
  const { t: st } = useTranslation(['common'], {
    keyPrefix: 'questionnaire_templates',
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
        <Permission permission={'insert:questionnaire_template'}>
          <Button href={addQuestionnaireTemplateUrl()}>
            {st('create_new_button')}
          </Button>
        </Permission>
      ),
      enableFiltering: true,
      initialColumns: [
        'Title',
        'Description',
        'LatestStatus',
        'CreatedByFriendlyName',
        'ModifiedByFriendlyName',
      ],
      preferencesStorageKey: 'QuestionnaireTemplatesTable-PreferencesV1',
    };
  }, [st, data, fields]);
};
