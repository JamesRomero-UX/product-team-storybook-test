import { faker } from '@faker-js/faker';

import { ParentTypeEnum } from '../../generated/graphql';
import { generateConfig } from '../generateConfig';
import type { TParentTypePlus } from '../sheets/types';
export const mockTitle = () => faker.word.words({ count: { min: 2, max: 4 } });

export const mockDescription = (minWords = 10, maxWords = 50) =>
  faker.word.words({ count: { min: minWords, max: maxWords } });

export const mockId = (objectType: keyof typeof generateConfig) =>
  faker.number.int({ min: 1, max: generateConfig[objectType] }).toString();

export const mockIdWithParentType = (objectType: TParentTypePlus) => {
  switch (objectType) {
    case ParentTypeEnum.Risk:
      return mockId('riskCount');
    case ParentTypeEnum.Indicator:
      return mockId('indicatorCount');
    case ParentTypeEnum.Issue:
      return mockId('issueCount');
    case ParentTypeEnum.Obligation:
      return mockId('obligationsCount');
    case ParentTypeEnum.Control:
      return mockId('controlCount');
    case ParentTypeEnum.Action:
      return mockId('actionCount');
    case 'user':
      return mockId('userCount');
    case 'userGroup':
      return mockId('userGroupCount');
    case 'tag_type':
      return mockId('tagTypeCount');
    case ParentTypeEnum.DepartmentType:
      return mockId('departmentTypeCount');
    default:
      throw new Error(`Unsupported object type ${objectType}`);
  }
};

export const mockUniqueCompositeId = () => {
  const usedIds = new Set();

  return (
    childObjectType: TParentTypePlus,
    parentObjectType: TParentTypePlus
  ) => {
    for (let i = 0; i <= 1000; i++) {
      const childId = mockIdWithParentType(childObjectType);
      const parentId = mockIdWithParentType(parentObjectType);
      const compositeKey = `${childId}|${parentId}`;
      if (!usedIds.has(compositeKey)) {
        usedIds.add(compositeKey);

        return {
          childId,
          parentId,
        };
      }
    }
    throw new Error('Could not generate unique composite key');
  };
};

export const mockUser = () => mockId('userCount');

export const mockPastDate = () => faker.date.past().toISOString();
