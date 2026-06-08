import { randomUUID } from 'node:crypto';

import { type AscentRule, ascentRuleSchema } from 'src/adaptors/ascent/types';
import type { TypesafeTransform } from 'src/adaptors/types';

export type AscentRuleBuilder = (item: AscentRule) => AscentRule;

const getDefaultValue = (): AscentRule =>
  ascentRuleSchema.parse({
    id: randomUUID(),
    type: 'rule',
    attributes: {
      number: '3.Ins-AoR 3A.1',
      title: 'Prescribed Responsibilities: UK Branches',
      content:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
      position: 14,
      startsAt: '2018-12-10',
      endsAt: null,
      publishedDate: '2018-12-10',
      createdAt: '2022-07-25T20:16:31+00:00',
      modifiedAt: '2022-07-25T20:16:31+00:00',
      hierarchy: [
        {
          id: '2802ec33-66a5-4e30-9136-3e9d6c4538a2',
          type: 'section',
          name: 'Insurance - Allocation of Responsibilities',
          position: 15,
        },
        {
          id: '6a62275a-e7ca-4570-8a1b-bee8409da9ff',
          type: 'section',
          name: '3 SII Firms',
          position: 3,
        },
        {
          id: '17736181-46a8-4b3d-8f92-da5f5c809177',
          type: 'regulator',
          name: 'Prudential Regulation Authority Rulebook (PRA)',
        },
      ],
      links: {
        app: 'https://risksmart-7443.ascentregtech.com/rules/a3e4b775-b7c1-45d0-86f5-bbe7234fca21',
      },
    },
  } satisfies TypesafeTransform<typeof ascentRuleSchema>);

export const buildAscentRule = (
  ...builders: AscentRuleBuilder[]
): AscentRule => {
  const item = builders.reduce(
    (acc, builder) => builder(acc),
    getDefaultValue()
  );

  return item;
};

export const withId = (id: string): AscentRuleBuilder => {
  return (item) => ({
    ...item,
    id,
  });
};

export const withRegulatorId = (id: string): AscentRuleBuilder => {
  return (item) => ({
    ...item,
    attributes: {
      ...item.attributes,
      hierarchy: [
        item.attributes.hierarchy[0]!,
        item.attributes.hierarchy[1]!,
        { ...item.attributes.hierarchy[2]!, id },
      ],
    },
  });
};

export const withStandardId = (id: string): AscentRuleBuilder => {
  return (item) => ({
    ...item,
    attributes: {
      ...item.attributes,
      hierarchy: [
        item.attributes.hierarchy[0]!,
        { ...item.attributes.hierarchy[1]!, id },
        item.attributes.hierarchy[2]!,
      ],
    },
  });
};

export const withChapterId = (id: string): AscentRuleBuilder => {
  return (item) => ({
    ...item,
    attributes: {
      ...item.attributes,
      hierarchy: [
        { ...item.attributes.hierarchy[0]!, id },
        item.attributes.hierarchy[1]!,
        item.attributes.hierarchy[2]!,
      ],
    },
  });
};
