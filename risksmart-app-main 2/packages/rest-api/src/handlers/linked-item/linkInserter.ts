import type { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import { ParentTypeEnum } from 'generated/graphql';
import {
  deleteAcceptanceParent,
  insertAcceptanceParent,
} from 'src/services/acceptance/acceptanceService';
import {
  deleteActionParent,
  insertActionParent,
} from 'src/services/action/actionService';
import {
  deleteAppetiteParent,
  insertAppetiteParent,
} from 'src/services/appetite/appetiteService';
import {
  deleteControlParent,
  insertControlParent,
} from 'src/services/control/controlService';
import {
  deleteIndicatorParent,
  insertIndicatorParent,
} from 'src/services/indicator/indicatorService';
import {
  deleteIssueParent,
  insertIssueParent,
} from 'src/services/issue/issueService';

export const insertParentChildLink = async (
  hasuraClient: ApolloClient<NormalizedCacheObject>,
  parent: { Id: string; ObjectType: ParentTypeEnum },
  child: { Id: string; ObjectType: ParentTypeEnum }
) => {
  if (child.ObjectType === ParentTypeEnum.Control) {
    await insertControlParent(hasuraClient, {
      ControlId: child.Id,
      ParentId: parent.Id,
    });

    return;
  }

  if (child.ObjectType === ParentTypeEnum.Action) {
    await insertActionParent(hasuraClient, {
      ActionId: child.Id,
      ParentId: parent.Id,
      ParentType: parent.ObjectType,
    });

    return;
  }

  if (child.ObjectType === ParentTypeEnum.Issue) {
    await insertIssueParent(hasuraClient, {
      IssueId: child.Id,
      ParentId: parent.Id,
      ParentType: parent.ObjectType,
    });

    return;
  }

  if (child.ObjectType === ParentTypeEnum.Indicator) {
    await insertIndicatorParent(hasuraClient, {
      IndicatorId: child.Id,
      ParentId: parent.Id,
    });

    return;
  }

  if (child.ObjectType === ParentTypeEnum.Acceptance) {
    await insertAcceptanceParent(hasuraClient, {
      objects: [
        {
          Id: child.Id,
          ParentId: parent.Id,
        },
      ],
    });

    return;
  }

  if (child.ObjectType === ParentTypeEnum.Appetite) {
    await insertAppetiteParent(hasuraClient, {
      AppetiteId: child.Id,
      ParentId: parent.Id,
    });

    return;
  }

  throw new Error(
    `linking {${parent.ObjectType}} to {${child.ObjectType}} is not supported`
  );
};

export const deleteParentChildLink = async (
  hasuraClient: ApolloClient<NormalizedCacheObject>,
  parent: { Id: string; ObjectType: ParentTypeEnum },
  child: { Id: string; ObjectType: ParentTypeEnum }
) => {
  if (child.ObjectType === ParentTypeEnum.Control) {
    await deleteControlParent(hasuraClient, {
      ControlId: child.Id,
      ParentId: parent.Id,
    });

    return;
  }

  if (child.ObjectType === ParentTypeEnum.Action) {
    await deleteActionParent(hasuraClient, {
      ActionId: child.Id,
      ParentId: parent.Id,
    });

    return;
  }

  if (child.ObjectType === ParentTypeEnum.Issue) {
    await deleteIssueParent(hasuraClient, {
      IssueId: child.Id,
      ParentId: parent.Id,
    });

    return;
  }

  if (child.ObjectType === ParentTypeEnum.Indicator) {
    await deleteIndicatorParent(hasuraClient, {
      IndicatorId: child.Id,
      ParentId: parent.Id,
    });

    return;
  }

  if (child.ObjectType === ParentTypeEnum.Acceptance) {
    await deleteAcceptanceParent(hasuraClient, {
      AcceptanceId: child.Id,
      ParentId: parent.Id,
    });

    return;
  }

  if (child.ObjectType === ParentTypeEnum.Appetite) {
    await deleteAppetiteParent(hasuraClient, {
      AppetiteId: child.Id,
      ParentId: parent.Id,
    });

    return;
  }

  throw new Error(
    `removing link between {${parent.ObjectType}} and {${child.ObjectType}} is not supported`
  );
};
