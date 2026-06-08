import type { ApolloCache } from '@apollo/client';
import { useMutation } from '@apollo/client';
import { useGetGuidParam } from '@risksmart-app/components/src/routes/routes.utils';
import type { ParentIssueType } from '@risksmart-app/domain/src/types/consts';
import type { GetIssueByIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import {
  Parent_Type_Enum,
  UpdateIssueAssessmentDocument,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { PageForm } from 'src/components/form/form/PageForm';
import { useI18NSummaryHelpContent } from 'src/components/help-panel/useSummaryHelpContent';
import { useInsertIssueAssessment } from 'src/hooks/mutations/issue-assessment/useInsertIssueAssessment';
import { useGetIssueAssessmentsByParentId } from 'src/hooks/queries';
import type { IssueAssessmentFields } from 'src/pages/issues/update/forms/issue-assessment-form/issueAssessmentSchema';
import {
  defaultValues,
  IssueAssessmentSchema,
} from 'src/pages/issues/update/forms/issue-assessment-form/issueAssessmentSchema';
import { useHasPermissionQuery } from 'src/rbac/useHasPermission';

import { evictField } from '@/utils/graphqlUtils';
import { IssueTypeMapping } from '@/utils/issueVariantUtils';

import IssueAssessmentForm from '../../forms/issue-assessment-form/IssueAssessmentForm';
import { getAssociatedControlIds, mapParentsToIds } from './assessmentUtils';
import type { IssueAssessmentRequestedChanges } from './types';

type Props = {
  issue: GetIssueByIdQuery['issue'][number];
  type: ParentIssueType;
};

const Tab: FC<Props> = ({ issue, type }) => {
  const navigate = useNavigate();
  useI18NSummaryHelpContent('issueAssessment.help');
  const issueTypeMapping = IssueTypeMapping[type];
  const { t: st } = useTranslation(['common'], {
    keyPrefix: issueTypeMapping.assessmentTaxonomy,
  });
  const { t } = useTranslation(['common']);
  const issueId = useGetGuidParam('issueId');
  const {
    data,
    refetch,
    loading: loadingIssueAssessment,
  } = useGetIssueAssessmentsByParentId({
    queryArgs: { parentIssueId: issueId },
  });
  const {
    hasPermission: canCreateIssueAssessment,
    loading: canCreateIssueAssessmentLoading,
  } = useHasPermissionQuery('insert:issue_assessment', issue);
  const {
    hasPermission: canEditIssueAssessment,
    loading: canEditIssueAssessmentLoading,
  } = useHasPermissionQuery('update:issue_assessment', issue);
  const assessment = data?.issue_assessment?.[0];
  const obligationIds =
    data?.issue_parent
      .filter((i) => i.parent?.ObjectType === Parent_Type_Enum.Obligation)
      .map((i) => i.ParentId) ?? [];
  const controlIds = getAssociatedControlIds(data);
  const documentIds =
    data?.issue_parent
      .filter((i) => i.parent?.ObjectType === Parent_Type_Enum.Document)
      .map((i) => i.ParentId) ?? [];

  const canModify = assessment
    ? canEditIssueAssessment && !canEditIssueAssessmentLoading
    : canCreateIssueAssessment && !canCreateIssueAssessmentLoading;

  const clearCache = (cache: ApolloCache<unknown>) => {
    evictField(cache, 'issue');
    evictField(cache, 'tag_type');
    evictField(cache, 'issue_assessment');
    evictField(cache, 'issue_parent');
    evictField(cache, 'control');
    evictField(cache, 'issue_assessment_aggregate');
    evictField(cache, 'issue_assessment_audit');
  };

  const [updateIssueAssessment] = useMutation(UpdateIssueAssessmentDocument, {
    update: clearCache,
    refetchQueries: ['getIssueById'],
  });
  const { insertIssueAssessment } = useInsertIssueAssessment();

  const onSave = async (data: IssueAssessmentFields) => {
    const policyBreachVariables: Partial<IssueAssessmentFields> =
      data.PolicyBreach
        ? {}
        : {
            PoliciesBreached: undefined,
            PolicyOwner: undefined,
            PolicyOwnerCommentary: undefined,
          };

    const thirdPartyVariables: Partial<IssueAssessmentFields> =
      data.IssueCausedByThirdParty
        ? {}
        : {
            ThirdPartyResponsible: undefined,
          };

    const systemVariables: Partial<IssueAssessmentFields> =
      data.IssueCausedBySystemIssue
        ? {}
        : {
            SystemResponsible: undefined,
          };

    const regulationVariables: Partial<IssueAssessmentFields> =
      data.RegulatoryBreach
        ? {}
        : {
            Rationale: undefined,
            RegulationsBreached: undefined,
            Reportable: undefined,
          };

    if (assessment) {
      await updateIssueAssessment({
        variables: {
          ...data,
          Id: assessment.Id,
          OriginalTimestamp: assessment.ModifiedAtTimestamp,
          TagTypeIds:
            data.tags?.map((t) => t.TagTypeId) ||
            issue.tags?.map((t) => t.TagTypeId) ||
            [],
          DepartmentTypeIds:
            data.departments?.map((d) => d.DepartmentTypeId) || [],
          ...thirdPartyVariables,
          ...regulationVariables,
          ...systemVariables,
          ...policyBreachVariables,
          AssociatedControlIds: data.AssociatedControlIds.map((a) => a.value),
          RegulationsBreachedIds: data.RegulationsBreachedIds.map(
            (a) => a.value
          ),
          PoliciesBreachedIds: data.PoliciesBreachedIds.map((a) => a.value),
          PolicyOwner: data.PolicyOwner?.value,
          CertifiedIndividual: data.CertifiedIndividual?.value,
        },
      });
    } else {
      await insertIssueAssessment({
        ...data,
        ParentIssueId: issueId,
        TagTypeIds:
          data.tags?.map((t) => t.TagTypeId) ||
          issue.tags?.map((t) => t.TagTypeId) ||
          [],
        DepartmentTypeIds:
          data.departments?.map((d) => d.DepartmentTypeId) || [],
        ...thirdPartyVariables,
        ...regulationVariables,
        ...systemVariables,
        ...policyBreachVariables,
        AssociatedControlIds: data.AssociatedControlIds.map((a) => a.value),
        RegulationsBreachedIds: data.RegulationsBreachedIds.map((a) => a.value),
        PoliciesBreachedIds: data.PoliciesBreachedIds.map((a) => a.value),
        PolicyOwner: data.PolicyOwner?.value,
        CertifiedIndividual: data.CertifiedIndividual?.value,
      });
    }
    await refetch();
  };

  const values: IssueAssessmentFields | undefined = assessment
    ? {
        ...defaultValues,
        ...assessment,
        tags: issue.tags || [],
        AssociatedControlIds: controlIds.map((id) => ({ value: id })) ?? [],
        RegulationsBreachedIds:
          obligationIds.map((id) => ({ value: id })) ?? [],
        PoliciesBreachedIds: documentIds.map((id) => ({ value: id })) ?? [],
        CertifiedIndividual: assessment?.CertifiedIndividual
          ? { value: assessment.CertifiedIndividual, type: 'user' }
          : null,
        PolicyOwner: assessment?.PolicyOwner
          ? { value: assessment.PolicyOwner, type: 'user' }
          : null,
      }
    : {
        ...defaultValues,
        tags: issue.tags || [],
      };

  const mapChanges = (changes: IssueAssessmentRequestedChanges) => {
    return {
      PoliciesBreachedIds: mapParentsToIds(
        changes.parents,
        Parent_Type_Enum.Document
      ),
      AssociatedControlIds: mapParentsToIds(
        changes.parents,
        Parent_Type_Enum.Control
      ),
      RegulationsBreachedIds: mapParentsToIds(
        changes.parents,
        Parent_Type_Enum.Obligation
      ),
      PolicyOwner: changes.PolicyOwner
        ? { value: changes.PolicyOwner, type: 'user' as const }
        : null,
      CertifiedIndividual: changes?.CertifiedIndividual
        ? { value: changes.CertifiedIndividual, type: 'user' as const }
        : null,
    };
  };

  const mapPreviewedChanges = (
    current: IssueAssessmentFields | undefined,
    incomingChanges: IssueAssessmentRequestedChanges
  ) => {
    return {
      ...defaultValues,
      ...current,
      ...incomingChanges,
      ...mapChanges(incomingChanges),
    };
  };

  const mapRequestedChanges = (
    requestedChanges: IssueAssessmentRequestedChanges
  ) => ({
    ...requestedChanges,
    ...mapChanges(requestedChanges),
  });
  const readOnly = !canModify || loadingIssueAssessment;

  return (
    <>
      <PageForm<IssueAssessmentFields>
        formId={'update-issue-assessment-form'}
        values={values}
        defaultValues={defaultValues}
        i18n={t(issueTypeMapping.assessmentTaxonomy)}
        onSave={onSave}
        onDismiss={() => navigate('..')}
        schema={IssueAssessmentSchema}
        readOnly={readOnly}
        header={st('tab_title')}
        parentType={issueTypeMapping.assessmentType}
        approvalConfig={{ object: { Id: assessment?.Id ?? '' } }}
        mapRequestedChanges={mapRequestedChanges}
        mapPreviewedChanges={mapPreviewedChanges}
      >
        <IssueAssessmentForm readOnly={readOnly} type={type} />
      </PageForm>
    </>
  );
};

export default Tab;
