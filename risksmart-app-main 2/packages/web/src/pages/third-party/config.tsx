import Button from '@risksmart-app/components/src/button';
import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import SimpleRatingBadge from 'src/components/simple-rating-badge';
import { Permission } from 'src/rbac/Permission';

import Link from '@/components/link';
import { getFriendlyId } from '@/utils/friendlyId';
import { useGetContributorsFieldConfig } from '@/utils/table/hooks/useGetContributorsFieldConfig';
import { useGetDepartmentFieldConfig } from '@/utils/table/hooks/useGetDepartmentFieldConfig';
import { useGetOwnersFieldConfig } from '@/utils/table/hooks/useGetOwnersFieldConfig';
import type {
  StatefulTableOptions,
  UseGetTablePropsOptions,
} from '@/utils/table/hooks/useGetStatelessTableProps';
import { useGetStatelessTableProps } from '@/utils/table/hooks/useGetStatelessTableProps';
import { useGetTableProps } from '@/utils/table/hooks/useGetTableProps';
import { useGetTagFieldConfig } from '@/utils/table/hooks/useGetTagFieldConfig';
import { exportStyleFromValue } from '@/utils/table/pdfExportStyles';
import type { TableFields, TablePropsWithActions } from '@/utils/table/types';
import { addThirdPartyUrl, thirdPartyDetailsUrl } from '@/utils/urls';

import type { ThirdPartyFields, ThirdPartyRegisterFields } from './types';
import { useLabelledFields } from './useLabelledFields';

const useGetFieldConfig = (): TableFields<ThirdPartyRegisterFields> => {
  const { t } = useTranslation(['common'], { keyPrefix: 'columns' });

  const ownersField = useGetOwnersFieldConfig<ThirdPartyRegisterFields>({
    formId: 'third_party',
    fieldId: 'Owners',
  });
  const contributorsField =
    useGetContributorsFieldConfig<ThirdPartyRegisterFields>({
      formId: 'third_party',
      fieldId: 'Contributors',
    });
  const tagField = useGetTagFieldConfig<ThirdPartyRegisterFields>({
    formId: 'third_party',
    fieldId: 'tags',
  });
  const departmentField = useGetDepartmentFieldConfig<ThirdPartyRegisterFields>(
    (r) => r.departments,
    {
      formId: 'third_party',
      fieldId: 'departments',
    }
  );

  const getStatus = useRating('third_party_status');
  const getType = useRating('third_party_type');
  const getCriticality = useRating('third_party_criticality');

  return {
    SequentialId: {
      header: t('id'),
      cell: (item) =>
        item.SequentialId
          ? getFriendlyId(Parent_Type_Enum.ThirdParty, item.SequentialId)
          : '-',
      exportVal: (item) =>
        item.SequentialId
          ? getFriendlyId(Parent_Type_Enum.ThirdParty, item.SequentialId)
          : '-',
    },
    Title: {
      formId: 'third_party',
      fieldId: 'title',
      cell: (item) => (
        <Link variant={'secondary'} href={thirdPartyDetailsUrl(item.Id)}>
          {item.Title}
        </Link>
      ),
    },
    allOwners: ownersField,
    allContributors: contributorsField,
    Description: {
      formId: 'third_party',
      fieldId: 'description',
    },
    CompanyName: {
      formId: 'third_party',
      fieldId: 'companyName',
    },
    CompaniesHouseNumber: {
      formId: 'third_party',
      fieldId: 'companiesHouseNumber',
    },
    Address: {
      formId: 'third_party',
      fieldId: 'address',
    },
    CityTown: {
      formId: 'third_party',
      fieldId: 'cityTown',
    },
    Postcode: {
      formId: 'third_party',
      fieldId: 'postcode',
    },
    Country: {
      formId: 'third_party',
      fieldId: 'country',
    },
    PrimaryContactName: {
      formId: 'third_party',
      fieldId: 'primaryContactName',
    },
    ContactName: {
      formId: 'third_party',
      fieldId: 'contactName',
    },
    ContactEmail: {
      formId: 'third_party',
      fieldId: 'contactEmail',
    },
    CompanyDomain: {
      formId: 'third_party',
      fieldId: 'companyDomain',
    },
    TypeLabelled: {
      formId: 'third_party',
      fieldId: 'type',
      exportCellStyle: exportStyleFromValue(
        (item) => item.Type,
        getType.getByValue
      ),
    },
    StatusLabelled: {
      formId: 'third_party',
      fieldId: 'status',
      cell: (item) => (
        <SimpleRatingBadge rating={getStatus.getByValue(item.Status)} />
      ),
      exportCellStyle: exportStyleFromValue(
        (item) => item.Status,
        getStatus.getByValue
      ),
    },
    CriticalityLabelled: {
      formId: 'third_party',
      fieldId: 'criticality',
      exportCellStyle: exportStyleFromValue(
        (item) => item.Criticality,
        getCriticality.getByValue
      ),
    },
    tags: tagField,
    departments: departmentField,
    CreatedByUser: {
      header: t('created_by_id'),
    },
    ModifiedByUser: {
      header: t('updated_by_id'),
    },
  };
};

export const useGetThirdPartyTableProps = (
  records: ThirdPartyFields[] | undefined
): UseGetTablePropsOptions<ThirdPartyRegisterFields> => {
  const { t: st } = useTranslation(['common'], { keyPrefix: 'third_party' });
  const data = useLabelledFields(records);
  const fields = useGetFieldConfig();

  return useMemo(() => {
    return {
      tableId: 'thirdPartyRegister',
      data,
      fields,
      entityLabel: st('entity_name'),
      emptyCollectionAction: (
        <Permission permission={'insert:third_party'}>
          <Button href={addThirdPartyUrl()}>{st('create_new_button')}</Button>
        </Permission>
      ),
      enableFiltering: true,
      initialColumns: [
        'Title',
        'CompanyName',
        'Description',
        'allOwners',
        'TypeLabelled',
        'StatusLabelled',
        'CriticalityLabelled',
        'tags',
        'departments',
      ],
      preferencesStorageKey: 'ThirdPartyTable-PreferencesV1',
      customAttributeFormIds: ['third_party'],
    };
  }, [st, data, fields]);
};

export const useGetCollectionTableProps = (
  records: ThirdPartyFields[] | undefined
): TablePropsWithActions<ThirdPartyRegisterFields> => {
  const props = useGetThirdPartyTableProps(records);

  return useGetTableProps(props);
};

export const useGetThirdPartySmartWidgetTableProps = (
  records: ThirdPartyFields[] | undefined,
  statefulTableOptions: StatefulTableOptions<ThirdPartyRegisterFields>
): TablePropsWithActions<ThirdPartyRegisterFields> => {
  const props = useGetThirdPartyTableProps(records);

  return useGetStatelessTableProps<ThirdPartyRegisterFields>({
    ...props,
    ...statefulTableOptions,
    enableFiltering: false,
  });
};
