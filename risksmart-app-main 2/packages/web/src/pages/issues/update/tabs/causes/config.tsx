import Button from '@risksmart-app/components/src/button';
import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import Link from '@risksmart-app/components/src/link';
import type { GetCausesByParentIssueIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import SimpleRatingBadge from 'src/components/simple-rating-badge';
import type { ObjectWithContributors } from 'src/rbac/Permission';
import { Permission } from 'src/rbac/Permission';
import type { UseGetTablePropsOptions } from 'src/utils/table/hooks/useGetStatelessTableProps';
import { useGetTableProps } from 'src/utils/table/hooks/useGetTableProps';
import { exportStyleFromOption } from 'src/utils/table/pdfExportStyles';
import type { TableFields, TablePropsWithActions } from 'src/utils/table/types';

export type CausesFields = GetCausesByParentIssueIdQuery['cause'][0];

const useGetFieldConfig = (
  onCauseClick?: (cause: CausesFields) => void
): TableFields<CausesFields> => {
  const { getByValue } = useRating('significance');

  return useMemo<TableFields<CausesFields>>(
    () => ({
      Title: {
        formId: 'cause',
        fieldId: 'Title',
        custom: false,
        cell: (item) => (
          <Link href={'#'} onFollow={() => onCauseClick?.(item)}>
            {item.Title}
          </Link>
        ),
        isRowHeader: true,
      },
      Significance: {
        formId: 'cause',
        fieldId: 'Significance',
        cell: (item: CausesFields) => (
          <SimpleRatingBadge rating={getByValue(item.Significance)} />
        ),
        exportCellStyle: exportStyleFromOption((item: CausesFields) =>
          getByValue(item.Significance)
        ),
      },
      Description: {
        formId: 'cause',
        fieldId: 'Description',
      },
    }),
    [onCauseClick, getByValue]
  );
};

const useGetCauseTableProps = (
  data: CausesFields[] | undefined,
  onCauseClick: (consequence: CausesFields) => void,
  handleCauseModalOpen: () => void,
  parent: ObjectWithContributors | null | undefined
): UseGetTablePropsOptions<CausesFields> => {
  const { t } = useTranslation(['common']);
  const { t: st } = useTranslation(['common'], {
    keyPrefix: 'causes',
  });
  const fields = useGetFieldConfig(onCauseClick);

  return useMemo(
    () => ({
      data,
      tableId: 'causesTab',
      customAttributeFormIds: [],
      entityLabel: t('cause_one'),
      emptyCollectionAction: (
        <Permission permission={'insert:cause'} parentObject={parent}>
          <Button formAction={'none'} onClick={handleCauseModalOpen}>
            {st('add_button')}
          </Button>
        </Permission>
      ),
      preferencesStorageKey: 'CausesTabTable-PreferencesV1',
      enableFiltering: false,
      initialColumns: ['Title', 'Significance', 'Description'],
      fields,
    }),
    [data, fields, t, parent, handleCauseModalOpen, st]
  );
};

export const useGetRegisterTableProps = (
  records: CausesFields[] | undefined,
  onCauseClick: (consequence: CausesFields) => void,
  handleCauseModalOpen: () => void,
  parent: ObjectWithContributors | null | undefined
): TablePropsWithActions<CausesFields> => {
  const props = useGetCauseTableProps(
    records,
    onCauseClick,
    handleCauseModalOpen,
    parent
  );

  return useGetTableProps(props);
};
