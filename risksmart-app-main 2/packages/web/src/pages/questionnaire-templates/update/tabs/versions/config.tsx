import Button from '@risksmart-app/components/src/button';
import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import SimpleRatingBadge from 'src/components/simple-rating-badge';
import { Permission } from 'src/rbac/Permission';

import Link from '@/components/link';
import type { UseGetTablePropsOptions } from '@/utils/table/hooks/useGetStatelessTableProps';
import { useGetTableProps } from '@/utils/table/hooks/useGetTableProps';
import type { TableFields, TablePropsWithActions } from '@/utils/table/types';

import type {
  QuestionnaireTemplateFields,
  QuestionnaireTemplateVersionFields,
  QuestionnaireTemplateVersionRegisterFields,
} from '../../../types';
import { useLabelledFields } from './useLabelledFields';

export const useGetFieldConfig =
  (): TableFields<QuestionnaireTemplateVersionRegisterFields> => {
    const { t: st } = useTranslation(['common'], {
      keyPrefix: 'questionnaire_template_versions.columns',
    });

    const getStatus = useRating('questionnaire_template_version_status');

    return useMemo(
      () => ({
        Version: {
          id: 'version',
          header: st('version'),
          cell: (item) => (
            <Link
              variant={'secondary'}
              href={`update/${item.Id}`}
              isRelativeUrl
            >
              {item.Version}
            </Link>
          ),
          sortingField: 'Version',
          isRowHeader: true,
        },
        StatusLabelled: {
          id: 'statusLabelled',
          header: st('status'),
          cell: (item) => {
            return (
              <SimpleRatingBadge rating={getStatus.getByValue(item.Status)} />
            );
          },
          sortingField: 'Status',
        },
      }),
      [st, getStatus]
    );
  };

const useGetQuestionnaireTemplateVersionTableProps = (
  records: QuestionnaireTemplateVersionFields[] | undefined,
  parentObject: null | QuestionnaireTemplateFields | undefined
): UseGetTablePropsOptions<QuestionnaireTemplateVersionRegisterFields> => {
  const { t: st } = useTranslation(['common'], {
    keyPrefix: 'questionnaire_template_versions',
  });
  const navigate = useNavigate();

  const fields = useGetFieldConfig();
  const labelledFields = useLabelledFields(records);

  return useMemo(
    () => ({
      customAttributeFormIds: [],
      data: labelledFields,
      entityLabel: st('entity_name'),
      emptyCollectionAction: (
        <Permission
          permission={'insert:questionnaire_template_version'}
          parentObject={parentObject}
          canHaveAccessAsContributor={true}
        >
          <Button formAction={'none'} onClick={() => navigate('create')}>
            {st('add_button')}
          </Button>
        </Permission>
      ),
      preferencesStorageKey:
        'QuestionnaireTemplateVersionRegisterTable-Preferences',
      enableFiltering: true,
      initialColumns: ['Version', 'StatusLabelled'],
      fields,
      defaultSortingState: {
        sortingColumn: 'Version',
        sortingDirection: 'desc',
      },
    }),
    [fields, labelledFields, st, parentObject, navigate]
  );
};

export const useGetCollectionTableProps = (
  records: QuestionnaireTemplateVersionFields[] | undefined,
  parentObject: null | QuestionnaireTemplateFields | undefined
): TablePropsWithActions<QuestionnaireTemplateVersionRegisterFields> => {
  const props = useGetQuestionnaireTemplateVersionTableProps(
    records,
    parentObject
  );

  return useGetTableProps(props);
};
