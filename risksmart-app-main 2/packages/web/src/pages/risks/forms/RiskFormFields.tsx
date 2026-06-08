import { useQuery } from '@apollo/client';
import type { SelectProps } from '@risk-smart/themed-cloudscape-components/select';
import { useEntityFilter } from '@risksmart-app/components/src/contexts/entityFilterContext';
import { PromptId } from '@risksmart-app/shared/ai/PromptId';
import type {
  GetLinkedItemRisksQuery,
  Risk_Bool_Exp,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import {
  Contributor_Type_Enum,
  GetRisksByTierDocument,
  Parent_Type_Enum,
  Risk_Status_Type_Enum,
  Risk_Treatment_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { useCallback, useEffect, useMemo } from 'react';
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
import FormRow from 'src/components/form/form/FormRow';
import TagSelector from 'src/components/form/tag-selector';
import { useGetLinkedItemRisks } from 'src/hooks/queries';
import { useGetEnterpriseRiskByTier } from 'src/hooks/queries/enterprise-risk/useGetEnterpriseRisksByTier';
import TestScheduleFields from 'src/pages/controls/update/forms/TestScheduleFields';
import type { RiskFormDataFields } from 'src/pages/risks/forms/riskSchema';
import { useHasPermissionQuery } from 'src/rbac/useHasPermission';
import { useFormConfig } from 'src/utils/table/hooks/form/useFormConfig';

import { useIsModuleEnabled } from '@/hooks/useIsModuleEnabled';
import { useLibrary } from '@/hooks/useLibrary';
import { getFriendlyId } from '@/utils/friendlyId';

import { TestIds } from './RiskFormFieldsTestIds';

interface Props {
  riskId?: string;
  readOnly?: boolean;
  parentRiskNode?: {
    Id: string;
    SequentialId?: null | number | undefined;
    ObjectType: Parent_Type_Enum;
  } | null;
  latestTestDate?: string;
  enterpriseRisk?: boolean;
}

const RiskFormFields = ({
  riskId,
  readOnly,
  parentRiskNode,
  latestTestDate,
  enterpriseRisk,
}: Props) => {
  const { control, watch, setValue, formState } =
    useFormContext<RiskFormDataFields>();

  const { t } = useTranslation(['common']);
  const { t: st } = useTranslation(['common'], { keyPrefix: 'risks.fields' });
  const { hasPermission: canInsertTier1Risks, loading: canInsertTier1Loading } =
    useHasPermissionQuery('insert:risk_tier_1');
  const isEnterpriseRiskEnabled = useIsModuleEnabled('enterprise_risk');
  const { entityIds } = useEntityFilter();
  const { hasPermission: canUpdateRisk, loading: canUpdateRiskLoading } =
    useHasPermissionQuery('update:risk');
  const riskTierAndParentEnabled =
    (canUpdateRisk && !canUpdateRiskLoading) || !riskId;
  const tiers = t('tiers', { returnObjects: true });
  const tierKeys = Object.keys(tiers) as (keyof typeof tiers)[];
  const tierOptions = tierKeys
    .map((key) => ({
      value: key,
      label: tiers[key],
    }))
    .filter(
      (t) =>
        t.value !== '1' ||
        (canInsertTier1Risks && !canInsertTier1Loading) ||
        riskId
    );
  const treatments = t('treatments', { returnObjects: true });

  const treatmentOptions = useMemo(
    () =>
      Object.values(Risk_Treatment_Type_Enum).map((treatment) => ({
        value: treatment,
        label: treatments[treatment],
      })) ?? [],
    [treatments]
  );

  const statuses = t('statuses', { returnObjects: true });

  const statusOptions = useMemo(
    () =>
      Object.values(Risk_Status_Type_Enum).map((status) => ({
        value: status,
        label: statuses[status],
      })) ?? [],
    [statuses]
  );

  const riskLibrary = useLibrary('risks');

  const titleOptions = riskLibrary?.map((risk) => ({ value: risk.title }));

  const tier: number = watch('Tier') || 1;
  const title = watch('Title');
  useEffect(() => {
    if (formState.defaultValues?.Description) {
      return;
    }
    const description = riskLibrary.find(
      (risk) => risk.title === title
    )?.description;

    if (description) {
      setValue('Description', description);
    }
  }, [title, riskLibrary, setValue, formState.defaultValues?.Description]);

  const where: Risk_Bool_Exp = { Tier: { _eq: tier - 1 } };
  if (entityIds?.length > 0) {
    where['enterpriseRiskInstance'] = { EntityId: { _in: entityIds } };
  }

  const { data: linkedItemRisks, loading: loadingLinkedItemRisks } =
    useGetLinkedItemRisks({
      queryArgs: { id: riskId ?? '' },
      shouldSkip: !riskId,
    });

  const { data: risks, loading: loadingRisks } = useQuery(
    GetRisksByTierDocument,
    {
      variables: {
        where,
      },
      skip: enterpriseRisk || tier === 1,
    }
  );

  const { data: enterpriseRisks, loading: loadingEnterpriseRisks } =
    useGetEnterpriseRiskByTier({
      queryArgs: { tier: tier - 1 },
      shouldSkip: !enterpriseRisk || tier === 1,
    });

  const showParentRisk = tier > 1;

  const getDisabledStateForRisk = useCallback(
    (
      riskId: string,
      linkedItemRisksData: GetLinkedItemRisksQuery | undefined
    ) => {
      const isDisabled = linkedItemRisksData?.linked_item.some(
        (linkedItem) => linkedItem.target_risk?.Id === riskId
      );

      return {
        disabled: isDisabled,
        disabledReason: isDisabled
          ? st('parent_risk_disabled_reason_linked_item')
          : '',
      };
    },
    [st]
  );

  const parentRisks = useMemo<SelectProps.Options | undefined>(() => {
    const parents = risks?.risk.filter((r) => r.Id !== riskId);
    if (parentRiskNode) {
      if (!parents?.find((p) => p.Id === parentRiskNode.Id)) {
        parents?.push({
          Title: getFriendlyId(
            Parent_Type_Enum.Risk,
            parentRiskNode.SequentialId
          ),
          SequentialId: parentRiskNode.SequentialId || 0,
          Id: parentRiskNode?.Id || '',
        });
      }
    }

    const options = parents?.map((risk) => ({
      value: risk.Id,
      label: risk.Title,
      tags: [getFriendlyId(Parent_Type_Enum.Risk, risk.SequentialId)],
      description: risk.enterpriseRiskInstance?.entity?.Name,
      ...getDisabledStateForRisk(risk.Id, linkedItemRisks),
    }));

    if (!isEnterpriseRiskEnabled) {
      return options?.map(
        ({ value, label, tags, disabled, disabledReason }) => ({
          value,
          label,
          tags,
          disabled,
          disabledReason,
        })
      );
    } else {
      return options;
    }
  }, [
    risks?.risk,
    parentRiskNode,
    isEnterpriseRiskEnabled,
    riskId,
    getDisabledStateForRisk,
    linkedItemRisks,
  ]);

  const parentEnterpriseRisks = useMemo<SelectProps.Options | undefined>(() => {
    const parents = enterpriseRisks?.enterprise_risk.filter(
      (r) => r.Id !== riskId
    );
    if (parentRiskNode) {
      if (!parents?.find((p) => p.Id === parentRiskNode.Id)) {
        parents?.push({
          Title: getFriendlyId(
            Parent_Type_Enum.EnterpriseRisk,
            parentRiskNode.SequentialId
          ),
          SequentialId: parentRiskNode.SequentialId || 0,
          Id: parentRiskNode?.Id || '',
        });
      }
    }

    return parents?.map((risk) => ({
      value: risk.Id,
      label: risk.Title,
      tags: [getFriendlyId(Parent_Type_Enum.EnterpriseRisk, risk.SequentialId)],
      ...getDisabledStateForRisk(risk.Id, linkedItemRisks),
    }));
  }, [
    enterpriseRisks?.enterprise_risk,
    parentRiskNode,
    riskId,
    getDisabledStateForRisk,
    linkedItemRisks,
  ]);

  const riskFormConfig = useFormConfig(Parent_Type_Enum.Risk);

  return (
    <CustomisableFieldWrapper readOnly={readOnly || formState.isSubmitting}>
      <ControlledAutosuggest
        key={'title'}
        forceRequired={true}
        allowDefaultValue={true}
        testId={TestIds.Name}
        name={riskFormConfig.Title.fieldId}
        disabled={readOnly || formState.isSubmitting}
        label={riskFormConfig.Title.formLabel}
        description={st('title_help')}
        placeholder={st('title_placeholder')}
        control={control}
        options={titleOptions}
      />
      <ControlledTextarea
        testId={TestIds.Description}
        key={'description'}
        disabled={readOnly || formState.isSubmitting}
        defaultRequired={true}
        name={riskFormConfig.Description.fieldId}
        label={riskFormConfig.Description.formLabel}
        placeholder={st('description_placeholder')}
        control={control}
        description={st('description_help')}
        additionalPrompts={[
          {
            id: PromptId.GenerateARiskDescription,
            text: t('textInference.general.generateARiskDescription'),
            altPromptText: title,
          },
        ]}
      />

      <FieldGroup key={'tierAndParent'}>
        <ControlledRadioGroup<RiskFormDataFields, number>
          forceRequired={true}
          key={'tier'}
          description={st('tier_help')}
          testId={TestIds.Tier}
          disabled={
            readOnly || !riskTierAndParentEnabled || formState.isSubmitting
          }
          control={control}
          label={riskFormConfig.Tier.formLabel}
          name={riskFormConfig.Tier.fieldId}
          onChange={() => {
            setValue('ParentRiskId', null);
          }}
          transform={{
            input: (value) =>
              isNaN(value) || value === 0 ? '' : value.toString(),
            output: (e) => {
              const output = parseInt(e, 10);

              return isNaN(output) ? 0 : output;
            },
          }}
          items={tierOptions}
        />

        <ConditionalField condition={showParentRisk} key={'parentRiskId'}>
          <FormRow>
            <ControlledSelect
              forceRequired={true}
              filteringType={'auto'}
              statusType={
                loadingRisks || loadingEnterpriseRisks || loadingLinkedItemRisks
                  ? 'loading'
                  : 'finished'
              }
              disabled={readOnly || !riskTierAndParentEnabled}
              name={riskFormConfig.ParentRiskId.fieldId}
              label={riskFormConfig.ParentRiskId.formLabel}
              description={st('parent_help')}
              placeholder={'Select'}
              testId={TestIds.ParentRiskId}
              control={control}
              options={enterpriseRisk ? parentEnterpriseRisks : parentRisks}
            />
          </FormRow>
        </ConditionalField>
      </FieldGroup>

      <ControlledSelect<RiskFormDataFields>
        key={'treatment'}
        testId={TestIds.Treatment}
        statusType={'finished'}
        disabled={readOnly || formState.isSubmitting}
        control={control}
        addEmptyOption={true}
        allowDefaultValue={true}
        label={riskFormConfig.Treatment.formLabel}
        placeholder={st('treatment_placeholder')}
        description={st('treatment_help')}
        name={riskFormConfig.Treatment.fieldId}
        options={treatmentOptions}
      />

      {!enterpriseRisk && (
        <ControlledSelect<RiskFormDataFields>
          key={'status'}
          testId={TestIds.Status}
          statusType={'finished'}
          disabled={readOnly || formState.isSubmitting}
          control={control}
          label={riskFormConfig.Status.formLabel}
          description={st('status_help')}
          placeholder={st('status_placeholder')}
          name={riskFormConfig.Status.fieldId}
          options={statusOptions}
        />
      )}

      {!enterpriseRisk && (
        <FormRow key={'owners'}>
          <ControlledGroupAndUserContributorMultiSelect
            forceRequired={true}
            control={control}
            includeGroups={true}
            inheritedContributorsName={'ancestorContributors'}
            label={riskFormConfig.Owners.formLabel}
            name={riskFormConfig.Owners.fieldId}
            description={st('owner_help')}
            testId={TestIds.Owners}
            placeholder={t('fields.Owner_placeholder')}
            disabled={readOnly || formState.isSubmitting}
            contributorType={Contributor_Type_Enum.Owner}
          />
        </FormRow>
      )}

      {!enterpriseRisk && (
        <FormRow key={'contributors'}>
          <ControlledGroupAndUserContributorMultiSelect
            key={'contributors'}
            control={control}
            includeGroups={true}
            inheritedContributorsName={'ancestorContributors'}
            label={riskFormConfig.Contributors.formLabel}
            name={riskFormConfig.Contributors.fieldId}
            description={st('Contributor_help')}
            testId={TestIds.Contributors}
            placeholder={t('fields.Contributor_placeholder')}
            disabled={readOnly || formState.isSubmitting}
            contributorType={Contributor_Type_Enum.Contributor}
          />
        </FormRow>
      )}

      {!enterpriseRisk && (
        <FormRow size={'xl'} key={'tags'}>
          <TagSelector
            testId={TestIds.Tags}
            disabled={readOnly || formState.isSubmitting}
            description={st('tagsHelp')}
            label={riskFormConfig.tags.formLabel}
            name={riskFormConfig.tags.fieldId}
            control={control}
          />
        </FormRow>
      )}

      {!enterpriseRisk && (
        <DepartmentSelector
          testId={TestIds.Departments}
          key={'departments'}
          description={st('departmentsHelp')}
          label={riskFormConfig.departments.formLabel}
          disabled={readOnly || formState.isSubmitting}
          name={riskFormConfig.departments.fieldId}
          control={control}
        />
      )}

      {!enterpriseRisk && (
        <TestScheduleFields
          key={'testConfigFields'}
          control={control}
          readOnly={readOnly || formState.isSubmitting}
          latestTestDate={latestTestDate ?? null}
          manualNextTestDueName={'schedule.ManualDueDate'}
          testFrequencyName={'schedule.Frequency'}
          testTimeToCompleteValueName={'schedule.TimeToCompleteValue'}
          testScheduleStartDateName={'schedule.StartDate'}
          testTimeToCompleteUnitName={'schedule.TimeToCompleteUnit'}
        />
      )}
    </CustomisableFieldWrapper>
  );
};

export default RiskFormFields;
