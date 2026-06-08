import { useMutation, useQuery } from '@apollo/client';
import type {
  PropertyFilterOption,
  PropertyFilterProperty,
  PropertyFilterQuery,
  PropertyFilterToken,
} from '@cloudscape-design/collection-hooks';
import { DndContext } from '@dnd-kit/core';
import Button from '@risk-smart/themed-cloudscape-components/button';
import Container from '@risk-smart/themed-cloudscape-components/container';
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import type { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import {
  GetRibbonItemsByParentTypeDocument,
  InsertRibbonItemsByParentTypeDocument,
  namedOperations,
  UpdateRibbonItemsByParentTypeDocument,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ModalForm } from 'src/components/form/form/ModalForm';
import type { SaveAction } from 'src/components/form/form/types';
import { FilterPropertyDashboardItem } from 'src/components/register-dashboard/FilterPropertyDashboardItem';
import { sanitiseTokens } from 'src/pages/dashboards/universal-widget/sanitiseSettings';
import { useHasPermissionQuery } from 'src/rbac/useHasPermission';

import CustomisableRibbonForm from '@/components/customisable-ribbon/CustomisableRibbonForm';
import { evictField } from '@/utils/graphqlUtils';

import type {
  CustomisableRibbonModalFields,
  FilterModal,
} from './customisableRibbonModalSchema';
import { CustomisableRibbonFormSchema } from './customisableRibbonModalSchema';

export interface Props<T> {
  items: readonly T[] | undefined;
  propertyFilterQuery: PropertyFilterQuery;
  onFilterQueryChanged: (query: PropertyFilterQuery) => void;
  filteringProperties: readonly PropertyFilterProperty[];
  filteringOptions: readonly PropertyFilterOption[] | undefined;
  parentType: Parent_Type_Enum;
  defaultFilters: FilterModal[];
  onFiltersChange?: (filters: FilterModal[]) => void;
}

// For more information see the docs at: docs/customisable-ribbon.md
const CustomisableRibbon = <T extends object>({
  items,
  propertyFilterQuery,
  onFilterQueryChanged,
  filteringProperties,
  filteringOptions,
  parentType,
  defaultFilters,
  onFiltersChange,
}: Props<T>) => {
  const { t } = useTranslation(['common'], {
    keyPrefix: 'customisableRibbons',
  });
  const [showEditRibbonModal, setShowEditRibbonModal] = useState(false);
  const { addNotification } = useNotifications();

  const [insertRibbonItemsByParentType] = useMutation(
    InsertRibbonItemsByParentTypeDocument,
    {
      update: (cache) => {
        evictField(cache, 'custom_ribbon');
      },
      refetchQueries: [namedOperations.Query.getRibbonItemsByParentType],
    }
  );

  const [updateRibbonItemsByParentType] = useMutation(
    UpdateRibbonItemsByParentTypeDocument,
    {
      update: (cache) => {
        evictField(cache, 'custom_ribbon');
      },
      refetchQueries: [namedOperations.Query.getRibbonItemsByParentType],
    }
  );

  const {
    data: responseData,
    loading,
    error,
  } = useQuery(GetRibbonItemsByParentTypeDocument, {
    variables: {
      parentType,
    },
  });

  if (error) {
    throw error;
  }

  const { hasPermission: userCanEdit, loading: isLoadingUserCanEdit } =
    useHasPermissionQuery('update:custom_ribbon', undefined);
  const { hasPermission: userCanCreate, loading: isLoadingUserCanCreate } =
    useHasPermissionQuery('insert:custom_ribbon', undefined);
  const isLoading = isLoadingUserCanEdit || isLoadingUserCanCreate || loading;
  const filterResult = responseData?.custom_ribbon[0]?.Filters as
    | FilterModal[]
    | undefined;
  const filters = useMemo<FilterModal[]>(() => {
    if (!filterResult?.length) {
      return defaultFilters;
    }

    return filterResult.map((filter) => {
      return {
        ...filter,
        itemFilterQuery: {
          ...filter.itemFilterQuery,
          tokens: sanitiseTokens(
            filter.itemFilterQuery.tokens as PropertyFilterToken[]
          ),
        },
      };
    });
  }, [defaultFilters, filterResult]);

  // Notify parent component when filters are loaded/changed
  const filtersSignature = useMemo(() => {
    try {
      return JSON.stringify(
        filters.map((f) => ({
          title: f.title,
          itemFilterQuery: f.itemFilterQuery,
        }))
      );
    } catch {
      return String(filters?.length ?? 0);
    }
  }, [filters]);

  useEffect(() => {
    onFiltersChange?.(filters);
    // only re-run when the meaningful content changes (avoid id/reference churn)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersSignature, onFiltersChange]);

  const onSave: SaveAction<CustomisableRibbonModalFields> = async (
    dataToSave
  ) => {
    const { Filters } = dataToSave;

    if (filterResult?.length) {
      const result = await updateRibbonItemsByParentType({
        variables: {
          id: responseData?.custom_ribbon[0]?.Id,
          parentType: parentType,
          filters: Filters,
          originalTimestamp:
            responseData?.custom_ribbon[0]?.ModifiedAtTimestamp ||
            'no valid timestamp',
        },
      });

      if (result.data?.update_custom_ribbon?.affected_rows !== 1) {
        addNotification({
          type: 'error',
          content: <>{t('record_updated_by_another_user')}</>,
        });

        throw new Error(
          'Records not updated. Record may have been updated by another user'
        );
      }
    } else {
      await insertRibbonItemsByParentType({
        variables: {
          parentType: parentType,
          filters: Filters,
        },
      });
    }
  };

  if (isLoading) {
    return null;
  }

  return (
    <Container disableContentPaddings={false}>
      <div className={'flex gap-6 flex-grow overflow-x-auto'}>
        {filters.map((filter, index) => (
          <div key={filter.id} className={'flex flex-1 justify-between'}>
            <FilterPropertyDashboardItem
              title={filter.title}
              tableFilterQuery={propertyFilterQuery}
              itemFilterQuery={{
                tokens: [...filter.itemFilterQuery.tokens],
                tokenGroups: filter.itemFilterQuery.tokenGroups
                  ? [...filter.itemFilterQuery.tokenGroups]
                  : undefined,
                operation: filter.itemFilterQuery.operation,
              }}
              items={items ?? []}
              filteringProperties={filteringProperties}
              onClick={onFilterQueryChanged}
            />
            {index !== filters.length - 1 ? (
              <div className={'w-1 h-full bg-grey200'} />
            ) : null}
          </div>
        ))}
        {userCanEdit && userCanCreate && (
          <div className={'flex items-start'}>
            <Button
              data-testid={'edit-ribbon-button'}
              iconName={'ellipsis'}
              variant={'icon'}
              ariaLabel={t('editRibbon')}
              onClick={() => setShowEditRibbonModal(true)}
            />
          </div>
        )}
      </div>
      {showEditRibbonModal && !loading && (
        <DndContext>
          <ModalForm<CustomisableRibbonModalFields>
            formId={'edit-ribbon-form'}
            header={t('editRibbon')}
            size={'max'}
            onDismiss={() => setShowEditRibbonModal(false)}
            onSave={onSave}
            visible={true}
            i18n={{
              edit_modal_title: t('editRibbon'),
              entity_name: 'Ribbon',
            }}
            schema={CustomisableRibbonFormSchema}
            defaultValues={{
              Filters: defaultFilters,
            }}
            values={{ Filters: filters }}
          >
            <CustomisableRibbonForm
              defaultFilters={defaultFilters}
              filteringProperties={filteringProperties}
              filteringOptions={filteringOptions}
              items={items}
            />
          </ModalForm>
        </DndContext>
      )}
    </Container>
  );
};

export default CustomisableRibbon;
