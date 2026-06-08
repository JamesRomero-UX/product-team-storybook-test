import Checkbox from '@risk-smart/themed-cloudscape-components/checkbox';
import FormField from '@risk-smart/themed-cloudscape-components/form-field';
import Select from '@risk-smart/themed-cloudscape-components/select';
import Button from '@risksmart-app/components/src/button';
import type { DataSourceRequest } from '@risksmart-app/shared/reporting/api/schema';
import {
  getDataSources,
  getRelatedDataSources,
  getSharedDatasets,
} from '@risksmart-app/shared/reporting/datasets/index';
import type { DataSourceType } from '@risksmart-app/shared/reporting/schema';
import type { GetFormCustomisationQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { type FC, useState } from 'react';
import type { UseFieldArrayRemove } from 'react-hook-form';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useIsModuleEnabledLazy } from 'src/hooks/useIsModuleEnabled';

import type { TreeDataSource } from './customDatasourceSchema';
import { FieldSelectionForm } from './field-selection/FieldSelectionForm';
import type { CustomAttributeSchemaLookup } from './types';

export type DatasourceProps = {
  rootName: string;
  index?: number;
  name: string;
  parentDatasourceType?: DataSourceType;
  onRemove?: UseFieldArrayRemove;
  // Using type as a quick and dirty way to check the type of change, and so how to create to update in the fields multiselect.
  // Ideally we'd compare the before/after state of the whole datasources
  onChange: (type: 'add' | 'remove' | 'update') => void;
  testId?: string;
  disabled?: boolean;
  customAttributeSchemaLookup: CustomAttributeSchemaLookup;
  formFieldConfigurations:
    | GetFormCustomisationQuery['form_field_configuration']
    | null;
};

const DatasourceTree: FC<DatasourceProps> = ({
  index,
  name,
  onRemove,
  parentDatasourceType,
  testId,
  onChange,
  disabled,
  rootName,
  customAttributeSchemaLookup,
  formFieldConfigurations,
}) => {
  const [fieldsVisible, setFieldsVisible] = useState(false);
  const { t } = useTranslation(['common'], {
    keyPrefix: 'customDatasources',
  });
  const { control, watch, setValue, trigger } =
    useFormContext<TreeDataSource>();
  const {
    remove,
    append,

    fields: childDatasources,
  } = useFieldArray({
    control,
    name: (name + '.children') as unknown as 'children',
  });
  const isModuleEnabled = useIsModuleEnabledLazy();

  const typeName = (name + '.type') as unknown as 'type';
  const relationshipToParentIndexName = (name +
    '.relationshipToParentIndex') as unknown as 'relationshipToParentIndex';
  const joinTypeName = (name + '.joinType') as unknown as 'joinType';
  const latestName = (name + '.latest') as unknown as 'latest';
  const fieldsName = (name + '.fields') as unknown as 'fields';
  const type = watch(typeName);
  const relationshipToParentIndex = watch(relationshipToParentIndexName);
  const joinType = watch(joinTypeName);
  const latest = watch(latestName);
  const fields = watch(fieldsName);
  const sharedDatasets = getSharedDatasets();
  const dataSourceOptions = parentDatasourceType
    ? getRelatedDataSources(parentDatasourceType, isModuleEnabled)
    : getDataSources(isModuleEnabled);
  const selectedDatasource = sharedDatasets[type] ?? null;
  const parentDatasource = parentDatasourceType
    ? (sharedDatasets[parentDatasourceType] ?? null)
    : null;

  const selectedOption = dataSourceOptions.find(
    (ds) =>
      ds.type === type &&
      ds.relationshipToParentIndex === relationshipToParentIndex
  );

  return (
    <>
      <div>
        <FormField
          label={t('fields.dataSource')}
          data-testid={'form-field-' + testId}
          errorText={control.getFieldState(typeName).error?.message}
          stretch={true}
        >
          <div className={'flex items-center gap-2'}>
            <div className={'min-w-[200px]'}>
              <Select
                filteringType={'auto'}
                data-testid={`${testId}-select`}
                placeholder={t('fields.dataSource_placeholder')}
                selectedOption={selectedOption ?? null}
                disabled={disabled || childDatasources.length > 0}
                onChange={(e) => {
                  const datasourceOption = e.detail
                    .selectedOption as DataSourceRequest;

                  const type = selectedDatasource === null ? 'add' : 'update';
                  setValue(typeName, datasourceOption.type, {
                    shouldTouch: true,
                  });

                  setValue(
                    relationshipToParentIndexName,
                    datasourceOption.relationshipToParentIndex ?? null,
                    { shouldTouch: true }
                  );

                  setValue(fieldsName, []);
                  onChange(type);
                }}
                options={dataSourceOptions}
              />
            </div>
            {selectedDatasource &&
              getRelatedDataSources(type, isModuleEnabled).length > 0 && (
                <>
                  <Button
                    data-testid={`${testId}-add`}
                    disabled={disabled}
                    iconName={'add-plus'}
                    variant={'inline-icon'}
                    onClick={() => {
                      append({
                        type: null as unknown as DataSourceType,
                        joinType: 'inner',
                        fields: [],
                        children: [],
                      });
                      onChange('add');
                    }}
                  />
                </>
              )}
            {selectedDatasource && (
              <Button
                data-testid={`${testId}-edit-columns`}
                iconName={'edit'}
                variant={'inline-icon'}
                onClick={() => {
                  setFieldsVisible(true);
                }}
              />
            )}
            {index !== undefined && onRemove && (
              <>
                <Button
                  data-testid={`${testId}-remove`}
                  disabled={disabled}
                  iconName={'remove'}
                  variant={'inline-icon'}
                  onClick={() => {
                    onRemove(index);
                    onChange('remove');
                  }}
                />
                {selectedDatasource && (
                  <>
                    {selectedDatasource.supportedLatest &&
                      relationshipToParentIndex === 'child' && (
                        <Checkbox
                          data-testid={`${testId}-latestOnly`}
                          checked={!!latest}
                          onChange={(e) => {
                            setValue(latestName, e.detail.checked);
                          }}
                        >
                          {t('latestOnly')}
                        </Checkbox>
                      )}
                    <Checkbox
                      data-testid={`${testId}-leftJoin`}
                      checked={joinType === 'left'}
                      disabled={relationshipToParentIndex === 'parent'}
                      onChange={(e) => {
                        setValue(
                          joinTypeName,
                          e.detail.checked ? 'left' : 'inner'
                        );
                      }}
                    >
                      {t('joinTypes.leftJoin', {
                        parents: parentDatasource?.label,
                        children: selectedDatasource.label,
                      })}
                    </Checkbox>
                  </>
                )}
              </>
            )}
          </div>
        </FormField>
        {childDatasources.length > 0 && (
          <ul className={'relative block pl-[16px] mt-0'}>
            {childDatasources.map((f, nestedIndex) => (
              <li key={f.id} className={'block relative'}>
                {nestedIndex < childDatasources.length - 1 && (
                  <div
                    className={
                      'bottom-0 absolute w-3 top-0 left-[-8px] border-b-0 border-t-0 border-r-0 border-solid border-[1.5px]'
                    }
                  />
                )}
                <div className={'pt-3 relative'}>
                  <div
                    className={
                      'absolute w-3 h-[51px]  top-0 left-[-8px] border-l-1 border-b-1 border-t-0 border-r-0 border-solid border-[1.5px]'
                    }
                  />
                  <DatasourceTree
                    customAttributeSchemaLookup={customAttributeSchemaLookup}
                    formFieldConfigurations={formFieldConfigurations}
                    onChange={onChange}
                    testId={`${testId}-${nestedIndex}`}
                    onRemove={remove}
                    disabled={disabled}
                    index={nestedIndex}
                    parentDatasourceType={type}
                    rootName={name}
                    name={`${name}.children.${nestedIndex}`}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      {fieldsVisible && (
        <FieldSelectionForm
          customAttributeSchemaLookup={customAttributeSchemaLookup}
          formFieldConfigurations={formFieldConfigurations}
          hasParent={!!parentDatasourceType}
          dataSourceType={type}
          onDismiss={async () => {
            // field validation is on the root, so need to trigger manually
            trigger(rootName as unknown as 'type');
            setFieldsVisible(false);
          }}
          readOnly={!!disabled}
          values={{ fields }}
          onSave={async (data) => {
            setValue(fieldsName, data.fields);
          }}
        />
      )}
    </>
  );
};

export default DatasourceTree;
