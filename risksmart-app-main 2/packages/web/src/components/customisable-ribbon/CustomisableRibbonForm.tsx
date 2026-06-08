import type {
  PropertyFilterOption,
  PropertyFilterProperty,
} from '@cloudscape-design/collection-hooks';
import Alert from '@risk-smart/themed-cloudscape-components/alert';
import Container from '@risk-smart/themed-cloudscape-components/container';
import Button from '@risksmart-app/components/src/button';
import { Reorder } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';

import CustomisableRibbonFormFields from '@/components/customisable-ribbon/CustomisableRibbonFormFields';
import { DraggableContainer } from '@/components/customisable-ribbon/DraggableContainer';

import type {
  CustomisableRibbonModalFields,
  FilterModal,
} from './customisableRibbonModalSchema';
import { DragConfigSlider } from './DragConfigSlider';
import styles from './style.module.scss';

interface Props<T> {
  filteringProperties: readonly PropertyFilterProperty[];
  items: readonly T[] | undefined;
  filteringOptions: readonly PropertyFilterOption[] | undefined;
  defaultFilters: FilterModal[];
}

const getFilterIds = (filters: FilterModal[]) =>
  filters.map((filter) => filter.id);

const CustomisableRibbonForm = <T extends object>({
  filteringProperties,
  filteringOptions,
  items,
  defaultFilters,
}: Props<T>) => {
  const { t } = useTranslation(['common'], {
    keyPrefix: 'customisableRibbons',
  });

  const { watch, setValue, clearErrors, control } =
    useFormContext<CustomisableRibbonModalFields>();
  const { append } = useFieldArray({
    control,
    name: 'Filters',
  });

  const filters = watch('Filters');
  const defaultDamping = 41;
  const [dragSliderEnabled, setDragSliderEnabled] = useState(false);
  const [bounceDamping, setBounceDamping] = useState(defaultDamping);
  const [elementsOrder, setElementsOrder] = useState<string[]>(
    getFilterIds(filters)
  );

  useEffect(() => {
    setElementsOrder(getFilterIds(filters));
  }, [filters]);

  const addEditableFilter = () => {
    const id = uuidv4();

    append({
      id,
      title: 'All',
      itemFilterQuery: { tokens: [], operation: 'and' },
    });

    setElementsOrder((prev: string[]) => [...prev, id]);
  };

  const handleAddFilter = () => {
    addEditableFilter();
    clearErrors();
  };

  const handleResetFilter = () => {
    setValue('Filters', defaultFilters);
    clearErrors();
  };

  const onReorder = (newOrder: string[]) => {
    setElementsOrder(newOrder);
    setValue(
      'Filters',
      newOrder
        .map((id) => filters.find((filter) => filter.id === id))
        .filter((filter): filter is FilterModal => !!filter)
    );
  };

  return (
    <span className={'flex flex-col gap-5'}>
      <Alert type={'warning'} header={t('ribbon_alert')} />
      {filters.length ? (
        <Reorder.Group
          className={`flex flex-col gap-y-4 m-0 p-0`}
          axis={'y'}
          values={elementsOrder}
          onReorder={onReorder}
        >
          {filters.map((filter, index) => {
            return (
              <DraggableContainer
                key={filter.id}
                value={filter.id}
                bounceDamping={
                  dragSliderEnabled ? bounceDamping : defaultDamping
                }
              >
                <div className={styles.customisableRibbonForm}>
                  <CustomisableRibbonFormFields
                    index={index}
                    items={items}
                    filteringProperties={filteringProperties}
                    filteringOptions={filteringOptions}
                  />
                </div>
              </DraggableContainer>
            );
          })}
        </Reorder.Group>
      ) : (
        <Container>
          <div
            className={
              'flex flex-grow flex-col ' +
              'items-center justify-center ' +
              'max-h-[170px] gap-y-8 m-[40px]'
            }
          >
            <h3 className={'font-normal m-0'}>
              {t('restoreDefaultsDescription')}
            </h3>
            <Button onClick={handleResetFilter}>
              {t('restoreDefaultsButton')}
            </Button>
          </div>
        </Container>
      )}
      <div className={'flex justify-between'}>
        <Button onClick={handleAddFilter}>{t('addFilterButton')}</Button>
        <DragConfigSlider
          bounceDamping={bounceDamping}
          setBounceDamping={setBounceDamping}
          dragSliderEnabled={dragSliderEnabled}
          setDragSliderEnabled={setDragSliderEnabled}
        />
      </div>
    </span>
  );
};

export default CustomisableRibbonForm;
