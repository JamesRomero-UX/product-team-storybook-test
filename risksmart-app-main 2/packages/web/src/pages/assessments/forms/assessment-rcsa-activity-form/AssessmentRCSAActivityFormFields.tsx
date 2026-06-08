import { useQuery } from '@apollo/client';
import { useGetGuidParam } from '@risksmart-app/components/src/routes/routes.utils';
import type {
  GetRisksWithAncestorContributorsQuery,
  GetUserGroupsQuery,
  GetUsersQuery,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import {
  Contributor_Type_Enum,
  GetWizardsDocument,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import ControlledDatePicker from 'src/components/form/controlled-date-picker';
import { ControlledFileUpload } from 'src/components/form/controlled-file-upload/ControlledFileUpload';
import ControlledGroupAndUserContributorMultiSelect from 'src/components/form/controlled-group-and-user-contributor-multi-select';
import ControlledInput from 'src/components/form/controlled-input';
import ControlledRiskWithAncestorsMultiSelect from 'src/components/form/controlled-risk-with-ancestors-multi-select';
import ControlledTextarea from 'src/components/form/controlled-textarea';
import CustomisableFieldWrapper from 'src/components/form/form/customisable-form/CustomisableFieldWrapper';
import type { Filter } from 'src/components/user-search-preferences/useGroupAndUserOptions';

import { useGetRiskById } from '@/hooks/queries';
import { useGetAssessmentById } from '@/hooks/queries/assessment/useGetAssessmentById';

import type { AssessmentRCSAActivityFormDataFields } from './assessmentRCSAActivitySchema';
import { useGetAssessmentContributorGroups } from './useGetAssessmentContributorGroups';
import { useGetAssessmentContributors } from './useGetAssessmentContributors';

interface Props {
  readOnly?: boolean;
  disableRiskSelect?: boolean;
  isUpdate?: boolean;
}

enum TestIds {
  ActivityType = 'ActivityType',
  ActivityUser = 'ActivityUser',
  Status = 'Status',
}

const AssessmentRCSAActivityFormFields = ({
  readOnly,
  disableRiskSelect,
  isUpdate,
}: Props) => {
  const { control, formState, watch } =
    useFormContext<AssessmentRCSAActivityFormDataFields>();

  const riskId = formState.defaultValues?.RiskIds
    ? formState.defaultValues?.RiskIds[0]?.value
    : '';

  const defaultOwners =
    formState.defaultValues?.Owners?.map((user) => user?.value) || [];

  const { data: risk } = useGetRiskById({
    queryArgs: { riskId: riskId ?? '' },
    shouldSkip: !riskId,
  });

  const owners = watch('Owners');

  const assessmentId = useGetGuidParam('assessmentId');

  const { t: st } = useTranslation(['common'], {
    keyPrefix: 'assessmentActivities.fields',
  });

  const { data } = useQuery(GetWizardsDocument, { fetchPolicy: 'no-cache' });
  const { data: assessmentData } = useGetAssessmentById({
    queryArgs: { Id: assessmentId },
  });

  const riskContributorsFilter: Filter<
    GetRisksWithAncestorContributorsQuery['risk'][number]
  > = (risk) => {
    return (
      owners.every((owner) => {
        return risk?.ancestorContributors.some(
          (contributor) =>
            owner.value === contributor.UserId ||
            owner.value === contributor.UserGroupId
        );
      }) && owners.length > 0
    );
  };

  const assessmentContributors = useGetAssessmentContributors(
    assessmentData,
    risk,
    isUpdate
  );

  const contributorsFilter: Filter<GetUsersQuery['user'][number]> = (user) => {
    return (
      (assessmentContributors?.includes(user.Id) ||
        (isUpdate && defaultOwners.includes(user.Id ?? ''))) ??
      false
    );
  };

  const assessmentContributorGroups = useGetAssessmentContributorGroups(
    assessmentData,
    risk,
    isUpdate
  );

  const contributorGroupsFilter: Filter<
    GetUserGroupsQuery['user_group'][number]
  > = (userGroup) => {
    return (
      (assessmentContributorGroups?.includes(userGroup.Id) ||
        (isUpdate && defaultOwners.includes(userGroup.Id ?? ''))) ??
      false
    );
  };

  const disabledRisks = data?.wizard.map((wizard) => ({
    riskId: wizard.RiskId,
    reason: 'RCSA is already in progress for this risk',
  }));

  return (
    <CustomisableFieldWrapper readOnly={readOnly}>
      <ControlledInput
        key={'title'}
        forceRequired={true}
        disabled={readOnly}
        name={'Title'}
        label={'RCSA Activity Title'}
        description={st('Title_help')}
        placeholder={st('Title_placeholder')}
        control={control}
      />
      <ControlledTextarea
        key={'summary'}
        disabled={readOnly}
        defaultRequired={true}
        name={'Summary'}
        label={'RCSA Activity Summary'}
        description={st('Summary_help')}
        placeholder={st('Summary_placeholder')}
        control={control}
      />
      <ControlledGroupAndUserContributorMultiSelect
        key={'assigned-user-multi'}
        forceRequired={true}
        includeGroups={true}
        testId={TestIds.ActivityUser}
        control={control}
        label={'RCSA Owner'}
        inheritedContributorsName={'Owners'}
        contributorType={Contributor_Type_Enum.Owner}
        name={'Owners'}
        description={st('AssignedUser_help')}
        disabled={readOnly}
        userFilter={contributorsFilter}
        groupFilter={contributorGroupsFilter}
      />
      <ControlledRiskWithAncestorsMultiSelect
        defaultRequired={true}
        key={'risk'}
        control={control}
        label={'Link Risk'}
        disabled={readOnly || disableRiskSelect}
        name={'RiskIds'}
        placeholder={'Select risk'}
        disabledOptions={disabledRisks}
        riskFilter={riskContributorsFilter}
      />
      <ControlledDatePicker
        key={'completion-date'}
        testId={'completionDate'}
        disabled={readOnly}
        name={'CompletionDate'}
        label={st('CompletionDate')}
        description={st('CompletionDate_help')}
        control={control}
      />
      <ControlledFileUpload
        key={'newFiles'}
        testId={'attachFiles'}
        label={st('NewFiles')}
        control={control}
        name={'files'}
        disabled={readOnly}
      />
    </CustomisableFieldWrapper>
  );
};

export default AssessmentRCSAActivityFormFields;
