import { useQuery } from '@apollo/client';
import type { SelectProps } from '@risk-smart/themed-cloudscape-components/select';
import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import {
  Contributor_Type_Enum,
  GetObligationsByTypeDocument,
  Obligation_Type_Enum,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useEffect, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import ControlledAutosuggest from 'src/components/form/controlled-autosuggest';
import ControlledGroupAndUserContributorMultiSelect from 'src/components/form/controlled-group-and-user-contributor-multi-select';
import ControlledRadioGroup from 'src/components/form/controlled-radio-group';
import ControlledSelect from 'src/components/form/controlled-select';
import ControlledTextarea from 'src/components/form/controlled-textarea';
import DepartmentSelector from 'src/components/form/department-selector';
import ConditionalField from 'src/components/form/form/customisable-form/ConditionalField';
import CustomisableFieldWrapper from 'src/components/form/form/customisable-form/CustomisableFieldWrapper';
import FieldGroup from 'src/components/form/form/customisable-form/FieldGroup';
import TagSelector from 'src/components/form/tag-selector';
import TestScheduleFields from 'src/pages/controls/update/forms/TestScheduleFields';
import { useHasPermissionQuery } from 'src/rbac/useHasPermission';
import { useFormConfig } from 'src/utils/table/hooks/form/useFormConfig';

import { useLibrary } from '@/hooks/useLibrary';
import { getFriendlyId } from '@/utils/friendlyId';

import { TestIds } from './ObligationDetailsFormFieldsTestIds';
import type { ObligationFormFieldData } from './obligationSchema';

const getObligationParentType = (type: Obligation_Type_Enum) => {
  switch (type) {
    case Obligation_Type_Enum.Chapter:
      return Obligation_Type_Enum.Standard;
    case Obligation_Type_Enum.Rule:
      return Obligation_Type_Enum.Chapter;
    case Obligation_Type_Enum.Task:
      return Obligation_Type_Enum.Rule;
  }
};

interface Props {
  readOnly?: boolean;
  obligationId?: string;
  parentObligationNode?: {
    Id: string;
    SequentialId?: null | number | undefined;
    ObjectType: Parent_Type_Enum;
  } | null;
  latestTestDate?: null | string;
  external?: boolean;
}

const ObligationDetailsFormFields: FC<Props> = ({
  readOnly,
  obligationId,
  parentObligationNode,
  latestTestDate,
  external,
}) => {
  const { t: st } = useTranslation(['common'], {
    keyPrefix: 'obligations',
  });
  const { t } = useTranslation(['common'], {});
  const { options: adheranceOptions } = useRating('adherence');
  const { control, watch, setValue, formState } =
    useFormContext<ObligationFormFieldData>();
  const {
    hasPermission: canCreateStandardObligations,
    loading: canCreateStandardObligationsLoading,
  } = useHasPermissionQuery('insert:obligation');
  const {
    hasPermission: canUpdateStandardObligations,
    loading: canUpdateStandardObligationsLoading,
  } = useHasPermissionQuery('update:obligation');
  const obligationTypeAndParentEnabled =
    (canUpdateStandardObligations && !canUpdateStandardObligationsLoading) ||
    !obligationId;
  const obligationsLibrary = useLibrary('obligations');

  const obligationType: Obligation_Type_Enum =
    watch('Type') || Obligation_Type_Enum.Standard;

  const obligationTitle: string = watch('Title') || '';
  const obligationTitleOptions = obligationsLibrary?.map((libItem) => ({
    value: libItem.title,
  }));

  useEffect(() => {
    const libItem = obligationsLibrary.find(
      (obligation) => obligation.title === obligationTitle
    );
    if (libItem?.description && !formState.defaultValues?.Description) {
      setValue('Description', libItem?.description);
    }
    if (libItem?.type && !obligationId) {
      setValue('Type', libItem?.type);
    }
  }, [
    obligationTitle,
    formState.defaultValues?.Description,
    obligationsLibrary,
    setValue,
    obligationId,
  ]);

  const parentObligationType = getObligationParentType(obligationType);
  const { data: obligationsByType } = useQuery(GetObligationsByTypeDocument, {
    variables: { type: parentObligationType! },
    skip: !parentObligationType,
  });

  const showParentField = obligationType !== Obligation_Type_Enum.Standard;
  const showDescriptionField =
    obligationType === Obligation_Type_Enum.Rule ||
    obligationType === Obligation_Type_Enum.Task;

  const parentObligations = useMemo<SelectProps.Options | undefined>(() => {
    const parents =
      obligationsByType?.obligation
        .filter((obl) => obl.Id !== obligationId)
        .map((obl) => ({
          value: obl.Id,
          label: obl.Title,
        })) || [];
    if (parentObligationNode) {
      if (!parents?.find((p) => p.value === parentObligationNode.Id)) {
        parents?.push({
          label: getFriendlyId(
            Parent_Type_Enum.Obligation,
            parentObligationNode.SequentialId
          ),

          value: parentObligationNode?.Id || '',
        });
      }
    }

    return parents;
  }, [obligationId, obligationsByType?.obligation, parentObligationNode]);
  const formConfig = useFormConfig(Parent_Type_Enum.Obligation);

  return (
    <CustomisableFieldWrapper readOnly={readOnly}>
      <ControlledAutosuggest
        key={'title'}
        forceRequired={true}
        name={formConfig.Title.fieldId}
        testId={'title'}
        label={formConfig.Title.formLabel}
        placeholder={st('fields.placeholders.Title')}
        description={st('fields.Title_help')}
        control={control}
        options={obligationTitleOptions}
        enableVirtualScroll={true}
        disabled={readOnly || external}
      />

      <FieldGroup key={'typeGroup'}>
        <ControlledRadioGroup
          key={'type'}
          forceRequired={true}
          testId={'type'}
          control={control}
          label={formConfig.Type.formLabel}
          description={st('fields.Type_help')}
          name={formConfig.Type.fieldId}
          onChange={() => {
            setValue('ParentId', null);
          }}
          transform={{
            input: (value) => value ?? Obligation_Type_Enum.Standard,
            output: (value) => value ?? Obligation_Type_Enum.Standard,
          }}
          items={[
            ...((canCreateStandardObligations &&
              !canCreateStandardObligationsLoading) ||
            obligationId
              ? [
                  {
                    value: Obligation_Type_Enum.Standard,
                    label: st('fields.types.standard'),
                  },
                ]
              : []),
            {
              value: Obligation_Type_Enum.Chapter,
              label: st('fields.types.chapter'),
            },
            {
              value: Obligation_Type_Enum.Rule,
              label: st('fields.types.rule'),
            },
            {
              value: Obligation_Type_Enum.Task,
              label: st('fields.types.task'),
            },
          ]}
          disabled={readOnly || !obligationTypeAndParentEnabled || external}
        />

        <ConditionalField condition={showParentField} key={'parentId'}>
          <ControlledSelect
            forceRequired={true}
            control={control}
            name={formConfig.ParentId.fieldId}
            label={formConfig.ParentId.formLabel}
            description={st('fields.ParentId_help')}
            placeholder={st('fields.placeholders.ParentId')}
            options={parentObligations}
            disabled={readOnly || !obligationTypeAndParentEnabled || external}
            testId={TestIds.ParentId}
          />
        </ConditionalField>

        <ConditionalField condition={showDescriptionField} key={'description'}>
          <ControlledTextarea
            name={formConfig.Description.fieldId}
            label={formConfig.Description.formLabel}
            description={st('fields.Description_help')}
            placeholder={st('fields.placeholders.Description')}
            control={control}
            testId={'description'}
            disabled={readOnly || external}
          />
        </ConditionalField>
      </FieldGroup>

      <ControlledTextarea
        key={'interpretation'}
        testId={'interpretation'}
        name={formConfig.Interpretation.fieldId}
        description={st('fields.Interpretation_help')}
        label={formConfig.Interpretation.formLabel}
        placeholder={st('fields.placeholders.Interpretation')}
        control={control}
        disabled={readOnly}
      />

      <ControlledSelect
        key={'adherence'}
        control={control}
        name={formConfig.Adherence.fieldId}
        testId={'adherence'}
        forceRequired={true}
        description={st('fields.Adherence_help')}
        label={formConfig.Adherence.formLabel}
        placeholder={st('fields.placeholders.Adherence')}
        options={adheranceOptions.map((o) => ({
          value: o.value as string,
          label: o.label,
        }))}
        disabled={readOnly}
      />

      <ControlledGroupAndUserContributorMultiSelect
        forceRequired={true}
        key={'owners'}
        testId={'owners'}
        control={control}
        inheritedContributorsName={'ancestorContributors'}
        contributorType={Contributor_Type_Enum.Owner}
        includeGroups={true}
        label={formConfig.Owners.formLabel}
        name={formConfig.Owners.fieldId}
        description={st('fields.Owner_help')}
        placeholder={t('fields.Owner_placeholder')}
        disabled={readOnly}
      />

      <ControlledGroupAndUserContributorMultiSelect
        key={'contributors'}
        testId={'contributors'}
        control={control}
        includeGroups={true}
        inheritedContributorsName={'ancestorContributors'}
        contributorType={Contributor_Type_Enum.Owner}
        label={formConfig.Contributors.formLabel}
        name={formConfig.Contributors.fieldId}
        placeholder={t('fields.Contributor_placeholder')}
        description={st('fields.Contributor_help')}
        disabled={readOnly}
      />

      <TagSelector
        name={formConfig.tags.fieldId}
        label={formConfig.tags.formLabel}
        key={'tags'}
        testId={'tags'}
        control={control}
        disabled={readOnly}
      />
      <DepartmentSelector
        label={formConfig.departments.formLabel}
        key={'departments'}
        name={formConfig.departments.fieldId}
        testId={'departments'}
        control={control}
        disabled={readOnly}
      />

      <TestScheduleFields
        key={'testConfigFields'}
        control={control}
        readOnly={false}
        latestTestDate={latestTestDate ?? null}
        manualNextTestDueName={'schedule.ManualDueDate'}
        testFrequencyName={'schedule.Frequency'}
        testTimeToCompleteValueName={'schedule.TimeToCompleteValue'}
        testScheduleStartDateName={'schedule.StartDate'}
        testTimeToCompleteUnitName={'schedule.TimeToCompleteUnit'}
      />
    </CustomisableFieldWrapper>
  );
};

export default ObligationDetailsFormFields;
