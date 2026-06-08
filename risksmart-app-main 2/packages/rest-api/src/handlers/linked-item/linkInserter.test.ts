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
import { vi } from 'vitest';
import { mock } from 'vitest-mock-extended';

import { deleteParentChildLink, insertParentChildLink } from './linkInserter';

vi.mock('src/backendGraphqlClient');
vi.mock('src/services/control/controlService');
vi.mock('src/services/action/actionService');
vi.mock('src/services/issue/issueService');
vi.mock('src/services/indicator/indicatorService');
vi.mock('src/services/acceptance/acceptanceService');
vi.mock('src/services/appetite/appetiteService');

const insertControlParentMock = vi.mocked(insertControlParent);
const insertActionParentMock = vi.mocked(insertActionParent);
const insertIssueParentMock = vi.mocked(insertIssueParent);
const insertIndicatorParentMock = vi.mocked(insertIndicatorParent);
const insertAcceptanceParentMock = vi.mocked(insertAcceptanceParent);
const insertAppetiteParentMock = vi.mocked(insertAppetiteParent);
const deleteControlParentMock = vi.mocked(deleteControlParent);
const deleteActionParentMock = vi.mocked(deleteActionParent);
const deleteIssueParentMock = vi.mocked(deleteIssueParent);
const deleteIndicatorParentMock = vi.mocked(deleteIndicatorParent);
const deleteAcceptanceParentMock = vi.mocked(deleteAcceptanceParent);
const deleteAppetiteParentMock = vi.mocked(deleteAppetiteParent);
const hasuraMock = mock<ApolloClient<NormalizedCacheObject>>();

describe('link inserter', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it.each`
    parent                                                  | child                                                 | expectToThrow
    ${{ Id: 'a', ObjectType: ParentTypeEnum.Risk }}         | ${{ Id: 'b', ObjectType: ParentTypeEnum.Control }}    | ${false}
    ${{ Id: 'a', ObjectType: ParentTypeEnum.Risk }}         | ${{ Id: 'b', ObjectType: ParentTypeEnum.Action }}     | ${false}
    ${{ Id: 'a', ObjectType: ParentTypeEnum.Risk }}         | ${{ Id: 'b', ObjectType: ParentTypeEnum.Issue }}      | ${false}
    ${{ Id: 'a', ObjectType: ParentTypeEnum.ControlGroup }} | ${{ Id: 'b', ObjectType: ParentTypeEnum.Control }}    | ${false}
    ${{ Id: 'a', ObjectType: ParentTypeEnum.Risk }}         | ${{ Id: 'b', ObjectType: ParentTypeEnum.Indicator }}  | ${false}
    ${{ Id: 'a', ObjectType: ParentTypeEnum.Risk }}         | ${{ Id: 'b', ObjectType: ParentTypeEnum.Acceptance }} | ${false}
    ${{ Id: 'a', ObjectType: ParentTypeEnum.Risk }}         | ${{ Id: 'b', ObjectType: ParentTypeEnum.Appetite }}   | ${false}
    ${{ Id: 'a', ObjectType: ParentTypeEnum.Risk }}         | ${{ Id: 'b', ObjectType: ParentTypeEnum.Assessment }} | ${true}
    ${{ Id: 'a', ObjectType: ParentTypeEnum.Assessment }}   | ${{ Id: 'b', ObjectType: ParentTypeEnum.Issue }}      | ${false}
    ${{ Id: 'a', ObjectType: ParentTypeEnum.Assessment }}   | ${{ Id: 'b', ObjectType: ParentTypeEnum.Action }}     | ${false}
  `(
    'inserting $parent.ObjectType => $child.ObjectType is expected to throw : $expectToThrow',
    async ({ parent, child, expectToThrow }) => {
      if (expectToThrow) {
        await expect(
          insertParentChildLink(hasuraMock, parent, child)
        ).rejects.toThrowError(
          `linking {${parent.ObjectType}} to {${child.ObjectType}} is not supported`
        );
      } else {
        await expect(
          insertParentChildLink(hasuraMock, parent, child)
        ).resolves.not.toThrow();
      }
    }
  );

  it.each`
    parent                                                  | child                                                 | expectToThrow
    ${{ Id: 'a', ObjectType: ParentTypeEnum.Risk }}         | ${{ Id: 'b', ObjectType: ParentTypeEnum.Control }}    | ${false}
    ${{ Id: 'a', ObjectType: ParentTypeEnum.Risk }}         | ${{ Id: 'b', ObjectType: ParentTypeEnum.Action }}     | ${false}
    ${{ Id: 'a', ObjectType: ParentTypeEnum.Risk }}         | ${{ Id: 'b', ObjectType: ParentTypeEnum.Issue }}      | ${false}
    ${{ Id: 'a', ObjectType: ParentTypeEnum.ControlGroup }} | ${{ Id: 'b', ObjectType: ParentTypeEnum.Control }}    | ${false}
    ${{ Id: 'a', ObjectType: ParentTypeEnum.Risk }}         | ${{ Id: 'b', ObjectType: ParentTypeEnum.Indicator }}  | ${false}
    ${{ Id: 'a', ObjectType: ParentTypeEnum.Risk }}         | ${{ Id: 'b', ObjectType: ParentTypeEnum.Acceptance }} | ${false}
    ${{ Id: 'a', ObjectType: ParentTypeEnum.Risk }}         | ${{ Id: 'b', ObjectType: ParentTypeEnum.Appetite }}   | ${false}
    ${{ Id: 'a', ObjectType: ParentTypeEnum.Risk }}         | ${{ Id: 'b', ObjectType: ParentTypeEnum.Assessment }} | ${true}
    ${{ Id: 'a', ObjectType: ParentTypeEnum.Assessment }}   | ${{ Id: 'b', ObjectType: ParentTypeEnum.Issue }}      | ${false}
    ${{ Id: 'a', ObjectType: ParentTypeEnum.Assessment }}   | ${{ Id: 'b', ObjectType: ParentTypeEnum.Action }}     | ${false}
  `(
    'deleting $parent.ObjectType => $child.ObjectType is expected to throw : $expectToThrow',
    async ({ parent, child, expectToThrow }) => {
      if (expectToThrow) {
        await expect(
          deleteParentChildLink(hasuraMock, parent, child)
        ).rejects.toThrow(
          `removing link between {${parent.ObjectType}} and {${child.ObjectType}} is not supported`
        );
      } else {
        await expect(
          deleteParentChildLink(hasuraMock, parent, child)
        ).resolves.not.toThrow();
      }
    }
  );

  it.each`
    parent                                                  | child                                                 | expectedInsertFn              | expectedArgs
    ${{ Id: 'a', ObjectType: ParentTypeEnum.Risk }}         | ${{ Id: 'b', ObjectType: ParentTypeEnum.Control }}    | ${insertControlParentMock}    | ${{ ControlId: 'b', ParentId: 'a' }}
    ${{ Id: 'a', ObjectType: ParentTypeEnum.Risk }}         | ${{ Id: 'b', ObjectType: ParentTypeEnum.Action }}     | ${insertActionParentMock}     | ${{ ActionId: 'b', ParentId: 'a', ParentType: ParentTypeEnum.Risk }}
    ${{ Id: 'a', ObjectType: ParentTypeEnum.Risk }}         | ${{ Id: 'b', ObjectType: ParentTypeEnum.Issue }}      | ${insertIssueParentMock}      | ${{ IssueId: 'b', ParentId: 'a', ParentType: ParentTypeEnum.Risk }}
    ${{ Id: 'a', ObjectType: ParentTypeEnum.Risk }}         | ${{ Id: 'b', ObjectType: ParentTypeEnum.Indicator }}  | ${insertIndicatorParentMock}  | ${{ IndicatorId: 'b', ParentId: 'a' }}
    ${{ Id: 'a', ObjectType: ParentTypeEnum.ControlGroup }} | ${{ Id: 'b', ObjectType: ParentTypeEnum.Control }}    | ${insertControlParentMock}    | ${{ ControlId: 'b', ParentId: 'a' }}
    ${{ Id: 'a', ObjectType: ParentTypeEnum.Risk }}         | ${{ Id: 'b', ObjectType: ParentTypeEnum.Acceptance }} | ${insertAcceptanceParentMock} | ${{ objects: [{ Id: 'b', ParentId: 'a' }] }}
    ${{ Id: 'a', ObjectType: ParentTypeEnum.Risk }}         | ${{ Id: 'b', ObjectType: ParentTypeEnum.Appetite }}   | ${insertAppetiteParentMock}   | ${{ AppetiteId: 'b', ParentId: 'a' }}
  `(
    'Insert parent record for $parent.ObjectType -> $child.ObjectType relationship',
    async ({ parent, child, expectedInsertFn, expectedArgs }) => {
      await expect(
        insertParentChildLink(hasuraMock, parent, child)
      ).resolves.not.toThrow();
      expect(expectedInsertFn).toHaveBeenCalledWith(hasuraMock, expectedArgs);
    }
  );

  it.each`
    parent                                                  | child                                                 | expectedDeleteFn              | expectedArgs
    ${{ Id: 'a', ObjectType: ParentTypeEnum.Risk }}         | ${{ Id: 'b', ObjectType: ParentTypeEnum.Control }}    | ${deleteControlParentMock}    | ${{ ControlId: 'b', ParentId: 'a' }}
    ${{ Id: 'a', ObjectType: ParentTypeEnum.Risk }}         | ${{ Id: 'b', ObjectType: ParentTypeEnum.Action }}     | ${deleteActionParentMock}     | ${{ ActionId: 'b', ParentId: 'a' }}
    ${{ Id: 'a', ObjectType: ParentTypeEnum.Risk }}         | ${{ Id: 'b', ObjectType: ParentTypeEnum.Issue }}      | ${deleteIssueParentMock}      | ${{ IssueId: 'b', ParentId: 'a' }}
    ${{ Id: 'a', ObjectType: ParentTypeEnum.Risk }}         | ${{ Id: 'b', ObjectType: ParentTypeEnum.Indicator }}  | ${deleteIndicatorParentMock}  | ${{ IndicatorId: 'b', ParentId: 'a' }}
    ${{ Id: 'a', ObjectType: ParentTypeEnum.ControlGroup }} | ${{ Id: 'b', ObjectType: ParentTypeEnum.Control }}    | ${deleteControlParentMock}    | ${{ ControlId: 'b', ParentId: 'a' }}
    ${{ Id: 'a', ObjectType: ParentTypeEnum.Risk }}         | ${{ Id: 'b', ObjectType: ParentTypeEnum.Acceptance }} | ${deleteAcceptanceParentMock} | ${{ AcceptanceId: 'b', ParentId: 'a' }}
    ${{ Id: 'a', ObjectType: ParentTypeEnum.Risk }}         | ${{ Id: 'b', ObjectType: ParentTypeEnum.Appetite }}   | ${deleteAppetiteParentMock}   | ${{ AppetiteId: 'b', ParentId: 'a' }}
  `(
    'Delete parent record for $parent.ObjectType -> $child.ObjectType relationship',
    async ({ parent, child, expectedDeleteFn, expectedArgs }) => {
      await expect(
        deleteParentChildLink(hasuraMock, parent, child)
      ).resolves.not.toThrow();
      expect(expectedDeleteFn).toHaveBeenCalledWith(hasuraMock, expectedArgs);
    }
  );
});
