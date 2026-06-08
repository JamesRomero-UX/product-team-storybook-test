import { useLazyQuery } from '@apollo/client';
import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import type { ParentIssueType } from '@risksmart-app/domain/src/types/consts';
import {
  GetIssueAssessmentByParentIdDocument,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import _ from 'lodash';
import type { Content } from 'pdfmake/interfaces';
import { useTranslation } from 'react-i18next';
import type { GetStandardFormFieldLabel } from 'src/hooks/forms/useFormCustomisation';
import { useGetControlsBasic } from 'src/hooks/queries';

import { toLocalDate } from '@/utils/dateUtils';
import { getFriendlyId } from '@/utils/friendlyId';
import { IssueTypeMapping } from '@/utils/issueVariantUtils';
import { getDepartmentsValue } from '@/utils/pdf/departmentValue';
import { createField, createYesNoField } from '@/utils/pdf/field';
import { createSubHeading2 } from '@/utils/pdf/headings';
import { getTagsValue } from '@/utils/pdf/tagsValue';
import { twoColumns } from '@/utils/pdf/twoColumns';
import useCustomAttributeDataForExport from '@/utils/pdf/useCustomAttributeDataForExport';

import { getAssociatedControlIds } from './tabs/assessments/assessmentUtils';

const useExportAssessmentDetails = (
  issueId: string,
  issueType: ParentIssueType,
  getStandardFieldLabel: GetStandardFormFieldLabel
): [() => Promise<Content[]>, boolean] => {
  const issueTypeMap = IssueTypeMapping[issueType];
  const { data: controls } = useGetControlsBasic({ queryArgs: {} });
  const { getLabel: getStatusLabel } = useRating('issue_assessment_status');
  const { getLabel: getSeverityLabel } = useRating('severity');
  const { t } = useTranslation(['common']);

  const [getCustomAttribute, customAttributesLoading] =
    useCustomAttributeDataForExport(issueTypeMap.assessmentType);

  const { t: st } = useTranslation(['common'], {
    keyPrefix: issueTypeMap.assessmentTaxonomy,
  });

  const [getIssueAssessment, getIssueAssessmentResult] = useLazyQuery(
    GetIssueAssessmentByParentIdDocument,
    {
      variables: {
        parentIssueId: issueId,
      },
    }
  );

  const createDetails = async () => {
    const issueTypes = t(issueTypeMap.assessmentRatingTypeTaxonomy);
    const { data: assessmentData } = await getIssueAssessment();
    const assessment = assessmentData?.issue_assessment?.[0];
    const issue = assessmentData?.issue?.[0];
    if (!issue || !assessment || !controls) {
      return [twoColumns([])];
    }
    const associatedControlIds = getAssociatedControlIds(assessmentData);

    const controlsById = _.keyBy(controls?.control, 'Id');
    const controlNodesById = _.keyBy(controls?.node, 'Id');

    const detailFields = [
      createField(
        getStandardFieldLabel(issueTypeMap.assessmentType, 'IssueType'),
        assessment?.IssueType
          ? issueTypes[assessment.IssueType as keyof typeof issueTypes]
          : '-'
      ),
      createField(
        getStandardFieldLabel(issueTypeMap.assessmentType, 'Severity'),
        getSeverityLabel(assessment?.Severity)
      ),
      createField(
        getStandardFieldLabel(issueTypeMap.assessmentType, 'Status'),
        getStatusLabel(assessment?.Status)
      ),
      createField(
        getStandardFieldLabel(issueTypeMap.assessmentType, 'TargetCloseDate'),
        toLocalDate(assessment?.TargetCloseDate)
      ),
      createField(
        getStandardFieldLabel(issueTypeMap.assessmentType, 'ActualCloseDate'),
        toLocalDate(assessment?.ActualCloseDate)
      ),

      createField(
        getStandardFieldLabel(
          issueTypeMap.assessmentType,
          'AssociatedControlIds'
        ),
        associatedControlIds
          .map(
            (id) =>
              controlsById[id].Title ||
              getFriendlyId(
                Parent_Type_Enum.Control,
                controlNodesById[id].SequentialId
              )
          )
          .join(', ')
      ),

      createField(
        getStandardFieldLabel(
          issueTypeMap.assessmentType,
          'CertifiedIndividual'
        ),
        assessment.certifiedIndividual?.FriendlyName ?? '-'
      ),

      createField(
        getStandardFieldLabel(issueTypeMap.assessmentType, 'tags'),
        getTagsValue(issue)
      ),
      createField(
        getStandardFieldLabel(issueTypeMap.assessmentType, 'departments'),
        getDepartmentsValue(assessment)
      ),
      ...(assessment ? await getCustomAttribute(assessment) : []),
    ];

    const regulationFields = [
      createYesNoField(
        getStandardFieldLabel(issueTypeMap.assessmentType, 'RegulatoryBreach'),
        assessment?.RegulatoryBreach
      ),
      createField(
        getStandardFieldLabel(
          issueTypeMap.assessmentType,
          'RegulationsBreached'
        ),
        assessmentData?.issue_parent
          ?.filter((parent) => parent.obligation)
          ?.map((parent) => parent.obligation?.Title)
          .join(', ') ?? '-'
      ),

      createYesNoField(
        getStandardFieldLabel(issueTypeMap.assessmentType, 'Reportable'),
        assessment?.Reportable
      ),

      createField(
        getStandardFieldLabel(issueTypeMap.assessmentType, 'Rationale'),
        assessment?.Rationale
      ),
    ];
    const thirdPartyFields = [
      createYesNoField(
        getStandardFieldLabel(
          issueTypeMap.assessmentType,
          'IssueCausedByThirdParty'
        ),
        assessment?.IssueCausedByThirdParty
      ),
      createField(
        getStandardFieldLabel(
          issueTypeMap.assessmentType,
          'ThirdPartyResponsible'
        ),
        assessment?.ThirdPartyResponsible
      ),
    ];

    const systemFields = [
      createYesNoField(
        getStandardFieldLabel(
          issueTypeMap.assessmentType,
          'IssueCausedBySystemIssue'
        ),
        assessment?.IssueCausedBySystemIssue
      ),
      createField(
        getStandardFieldLabel(issueTypeMap.assessmentType, 'SystemResponsible'),
        assessment?.SystemResponsible
      ),
    ];

    const policyFields = [
      createYesNoField(
        getStandardFieldLabel(issueTypeMap.assessmentType, 'PolicyBreach'),
        assessment?.PolicyBreach
      ),
      createField(
        getStandardFieldLabel(issueTypeMap.assessmentType, 'PoliciesBreached'),
        assessment?.PoliciesBreached
      ),
      createField(
        getStandardFieldLabel(issueTypeMap.assessmentType, 'PolicyOwner'),
        assessment?.policyOwner?.FriendlyName ?? '-'
      ),
      createField(
        getStandardFieldLabel(
          issueTypeMap.assessmentType,
          'PolicyOwnerCommentary'
        ),
        assessment?.PolicyOwnerCommentary
      ),
    ];

    return [
      twoColumns(detailFields),
      createSubHeading2(st('headings.regulation')),
      twoColumns(regulationFields),
      createSubHeading2(st('headings.thirdParty')),
      twoColumns(thirdPartyFields),
      createSubHeading2(st('headings.system')),
      twoColumns(systemFields),
      createSubHeading2(st('headings.policy')),
      twoColumns(policyFields),
    ];
  };

  return [
    createDetails,
    getIssueAssessmentResult.loading || customAttributesLoading,
  ];
};

export default useExportAssessmentDetails;
