import type {
  PropertyFilterOption,
  PropertyFilterProperty,
} from '@cloudscape-design/collection-hooks';
import Box from '@risk-smart/themed-cloudscape-components/box';
import Button from '@risk-smart/themed-cloudscape-components/button';
import Container from '@risk-smart/themed-cloudscape-components/container';
import { defaultPropertyFilterI18nStrings } from '@risksmart-app/components/src/table/propertyFilterI18nStrings';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import ControlledInput from 'src/components/form/controlled-input';
import PropertyFilterPanel from 'src/components/property-filter-panel';
import { DashboardItem } from 'src/components/register-dashboard/DashboardItem';

import { processItems } from '../../../node_modules/@cloudscape-design/collection-hooks/mjs/operations';
import type { CustomisableRibbonModalFields } from './customisableRibbonModalSchema';

type Props<T> = {
  index: number;
  items: readonly T[] | undefined;
  filteringProperties: readonly PropertyFilterProperty[];
  filteringOptions: readonly PropertyFilterOption[] | undefined;
};

const CustomisableRibbonFormFields = <T extends object>({
  index,
  items,
  filteringProperties,
  filteringOptions,
}: Props<T>) => {
  const { t } = useTranslation(['common'], {
    keyPrefix: 'customisableRibbons',
  });

  const { control, watch, clearErrors } =
    useFormContext<CustomisableRibbonModalFields>();

  const { remove } = useFieldArray({
    control,
    name: 'Filters',
  });

  const itemFilterQuery = watch(`Filters.${index}.itemFilterQuery`);
  const editableTitle = watch(`Filters.${index}.title`);

  const filteredItems = processItems(
    items ?? [],
    {
      propertyFilteringQuery: itemFilterQuery,
    },
    { propertyFiltering: { filteringProperties: filteringProperties ?? [] } }
  );

  const handleRemoveFilter = () => {
    remove(index);
    clearErrors();
  };

  return (
    <div className={'flex flex-row flex-grow gap-x-[80px]'}>
      <div className={'min-w-8 flex-grow'}>
        <ControlledInput
          name={`Filters.${index}.title`}
          label={'Label'}
          control={control}
        />
        <Controller
          name={`Filters.${index}.itemFilterQuery`}
          control={control}
          render={({ field: { value, onChange } }) => {
            return (
              <div className={'flex grow w-full'}>
                <PropertyFilterPanel
                  i18nStrings={{
                    ...defaultPropertyFilterI18nStrings,
                  }}
                  enableTokenGroups={true}
                  query={value}
                  filteringProperties={filteringProperties}
                  filteringOptions={filteringOptions}
                  onChange={(e) => onChange({ ...e.detail })}
                  hideOperations={false}
                  virtualScroll={true}
                />
              </div>
            );
          }}
        />
      </div>
      <div className={'flex gap-x-6 items-start'}>
        <Box>
          <Box padding={{ bottom: 'xxs' }}>
            <span className={'text-grey500'}>{'Preview:'}</span>
          </Box>
          <Container disableContentPaddings={true}>
            <div className={'w-[220px] p-4 '}>
              <DashboardItem
                title={editableTitle}
                value={filteredItems.filteredItemsCount ?? 0}
                selected={false}
              />
            </div>
          </Container>
        </Box>
        <Button
          data-testid={`delete-ribbon-filter-button-${index}`}
          iconName={'remove'}
          variant={'icon'}
          ariaLabel={t('removeFilterButton')}
          onClick={handleRemoveFilter}
        />
      </div>
    </div>
  );
};

export default CustomisableRibbonFormFields;
