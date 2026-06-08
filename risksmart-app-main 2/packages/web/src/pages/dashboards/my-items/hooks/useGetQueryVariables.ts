import useRisksmartUser from '@risksmart-app/components/src/hooks/useRisksmartUser';
import type { Assessment_Activity_Bool_Exp } from '@risksmart-app/web-graphql-client/generated/graphql';
import {
  type Action_Bool_Exp,
  type Ancestor_Contributor_Bool_Exp,
  type Assessment_Bool_Exp,
  type Control_Bool_Exp,
  type Document_Bool_Exp,
  type Indicator_Bool_Exp,
  type Internal_Audit_Entity_Bool_Exp,
  type Issue_Bool_Exp,
  type Obligation_Bool_Exp,
  Parent_Type_Enum,
  type Risk_Bool_Exp,
  type Third_Party_Bool_Exp,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { useMemo } from 'react';

import useEntityWhereFilter from '@/hooks/useEntityWhereFilter';

import type { MyItemsFilter } from '../../useDashboardStore';
import { useDashboardStore } from '../../useDashboardStore';

export const getQueryVariables = (
  {
    owner,
    contributor,
    groupOwner,
    groupContributor,
    inheritedOwner,
    inheritedContributor,
    inheritedGroupOwner,
    inheritedGroupContributor,
  }: MyItemsFilter,
  userId?: string
) => {
  const getAncestorContributorsConditions = (
    contributorType: 'contributor' | 'owner',
    isNull: boolean
  ): Ancestor_Contributor_Bool_Exp => ({
    _and: [
      { UserId: { _eq: userId } },
      { ContributorType: { _eq: contributorType } },
      { UserGroupId: { _is_null: isNull } },
    ],
  });

  const itemFilterConditions: Risk_Bool_Exp = { _or: [] };
  // assessment activities are only filtered by owners and ownerGroups
  const assessmentActivityFilterConditions: Assessment_Activity_Bool_Exp = {
    _or: [],
  };

  if (owner) {
    itemFilterConditions._or?.push({
      owners: { UserId: { _eq: userId } },
    });

    assessmentActivityFilterConditions._or?.push({
      owners: { UserId: { _eq: userId } },
    });
  }

  if (contributor) {
    itemFilterConditions._or?.push({
      contributors: { UserId: { _eq: userId } },
    });
  }

  if (groupOwner) {
    itemFilterConditions._or?.push({
      ownerGroups: { group: { users: { UserId: { _eq: userId } } } },
    });

    assessmentActivityFilterConditions._or?.push({
      ownerGroups: { group: { users: { UserId: { _eq: userId } } } },
    });
  }

  if (groupContributor) {
    itemFilterConditions._or?.push({
      contributorGroups: {
        group: { users: { UserId: { _eq: userId } } },
      },
    });
  }

  if (inheritedOwner) {
    itemFilterConditions._or?.push({
      _and: [
        { _not: { owners: { UserId: { _eq: userId } } } },
        {
          ancestorContributors: getAncestorContributorsConditions(
            'owner',
            true
          ),
        },
      ],
    });
  }

  if (inheritedGroupOwner) {
    itemFilterConditions._or?.push({
      _and: [
        {
          _not: {
            ownerGroups: { group: { users: { UserId: { _eq: userId } } } },
          },
        },
        {
          ancestorContributors: getAncestorContributorsConditions(
            'owner',
            false
          ),
        },
      ],
    });
  }

  if (inheritedContributor) {
    itemFilterConditions._or?.push({
      _and: [
        {
          _not: { contributors: { UserId: { _eq: userId } } },
        },
        {
          ancestorContributors: getAncestorContributorsConditions(
            'contributor',
            true
          ),
        },
      ],
    });
  }

  if (inheritedGroupContributor) {
    itemFilterConditions._or?.push({
      _and: [
        {
          _not: {
            contributorGroups: {
              group: { users: { UserId: { _eq: userId } } },
            },
          },
        },
        {
          ancestorContributors: getAncestorContributorsConditions(
            'contributor',
            false
          ),
        },
      ],
    });
  }

  return {
    userId: userId ?? '',
    riskFilterConditions: itemFilterConditions,
    actionFilterConditions: itemFilterConditions as Action_Bool_Exp,
    indicatorFilterConditions: itemFilterConditions as Indicator_Bool_Exp,
    documentFilterConditions: itemFilterConditions as Document_Bool_Exp,
    assessmentFilterConditions: itemFilterConditions as Assessment_Bool_Exp,
    issueFilterConditions: itemFilterConditions as Issue_Bool_Exp,
    internalAuditFilterConditions:
      itemFilterConditions as Internal_Audit_Entity_Bool_Exp,
    obligationFilterConditions: itemFilterConditions as Obligation_Bool_Exp,
    thirdPartyFilterConditions: itemFilterConditions as Third_Party_Bool_Exp,
    controlFilterConditions: itemFilterConditions as Control_Bool_Exp,
    assessmentActivityFilterConditions,
  };
};

/**
 * Builds up the gql filtering conditions based on the current filters set on the dashboard,
 * as well as any global entity filters that are set
 * @returns getQueryVariables function
 */
export const useGetQueryVariables = () => {
  const { myItemsFilters } = useDashboardStore();
  const { user } = useRisksmartUser();

  const vars = useMemo(
    () => getQueryVariables(myItemsFilters, user!.userId),
    [myItemsFilters, user]
  );

  return {
    ...vars,
    riskFilterConditions: useEntityWhereFilter<Risk_Bool_Exp>(
      Parent_Type_Enum.Risk,
      vars.riskFilterConditions
    ),
    actionFilterConditions: useEntityWhereFilter<Action_Bool_Exp>(
      Parent_Type_Enum.Action,
      vars.actionFilterConditions
    ),
    indicatorFilterConditions: useEntityWhereFilter<Indicator_Bool_Exp>(
      Parent_Type_Enum.Indicator,
      vars.indicatorFilterConditions
    ),
    documentFilterConditions: useEntityWhereFilter<Document_Bool_Exp>(
      Parent_Type_Enum.Document,
      vars.documentFilterConditions
    ),
    assessmentFilterConditions: useEntityWhereFilter<Assessment_Bool_Exp>(
      Parent_Type_Enum.Assessment,
      vars.assessmentFilterConditions
    ),
    issueFilterConditions: useEntityWhereFilter<Issue_Bool_Exp>(
      Parent_Type_Enum.Issue,
      vars.issueFilterConditions
    ),
    internalAuditFilterConditions:
      useEntityWhereFilter<Internal_Audit_Entity_Bool_Exp>(
        Parent_Type_Enum.InternalAuditEntity,
        vars.internalAuditFilterConditions
      ),
    obligationFilterConditions: useEntityWhereFilter<Obligation_Bool_Exp>(
      Parent_Type_Enum.Obligation,
      vars.obligationFilterConditions
    ),
    thirdPartyFilterConditions: useEntityWhereFilter<Third_Party_Bool_Exp>(
      Parent_Type_Enum.ThirdParty,
      vars.thirdPartyFilterConditions
    ),
    controlFilterConditions: useEntityWhereFilter<Control_Bool_Exp>(
      Parent_Type_Enum.Control,
      vars.controlFilterConditions
    ),
  };
};
