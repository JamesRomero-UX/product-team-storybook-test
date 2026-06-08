import { randomUUID } from 'node:crypto';

import type { AscentTask } from 'src/adaptors/ascent/types';
import { ascentTaskSchema } from 'src/adaptors/ascent/types';
import type { TypesafeTransform } from 'src/adaptors/types';

export type AscentTaskBuilder = (item: AscentTask) => AscentTask;

const getDefaultValue = (): AscentTask =>
  ascentTaskSchema.parse({
    id: randomUUID(),
    type: 'task',
    attributes: {
      status: 'enabled',
      createdAt: '2022-07-25T20:16:31+00:00',
      modifiedAt: '2022-07-25T20:16:31+00:00',
      frequency: 'annually',
      preview: 'Annual compliance review required',
      disableReason: null,
      requirementId: 'REQ-001',
      statusChangedAt: '2022-07-25T20:16:31+00:00',
      links: {
        self: 'https://risksmart-7443.ascentregtech.com/tasks/a3e4b775-b7c1-45d0-86f5-bbe7234fca21',
      },
      hierarchy: [
        {
          id: 'a3e4b775-b7c1-45d0-86f5-bbe7234fca21',
          type: 'rule',
          name: 'Prescribed Responsibilities: UK Branches',
          number: '3.Ins-AoR 3A.1',
        },
        {
          id: '2802ec33-66a5-4e30-9136-3e9d6c4538a2',
          type: 'section',
          name: 'Insurance - Allocation of Responsibilities',
        },
        {
          id: '6a62275a-e7ca-4570-8a1b-bee8409da9ff',
          type: 'section',
          name: '3 SII Firms',
        },
        {
          id: '17736181-46a8-4b3d-8f92-da5f5c809177',
          type: 'regulator',
          name: 'Prudential Regulation Authority Rulebook (PRA)',
        },
      ],
      citation: '3.Ins-AoR 3A.1(a)',
      tags: ['compliance', 'annual-review'],
      publishedDate: '2018-12-10',
      startsAt: '2018-12-10',
      endsAt: null,
      content:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
      dueDate: null,
    },
  } satisfies TypesafeTransform<typeof ascentTaskSchema>);

export const buildAscentTask = (
  ...builders: AscentTaskBuilder[]
): AscentTask => {
  const item = builders.reduce(
    (acc, builder) => builder(acc),
    getDefaultValue()
  );

  return item;
};

export const withId = (id: string): AscentTaskBuilder => {
  return (item) => ({
    ...item,
    id,
  });
};

export const withRuleId = (id: string): AscentTaskBuilder => {
  return (item) => ({
    ...item,
    attributes: {
      ...item.attributes,
      hierarchy: [
        { ...item.attributes.hierarchy[0]!, id },
        item.attributes.hierarchy[1]!,
        item.attributes.hierarchy[2]!,
        item.attributes.hierarchy[3]!,
      ],
    },
  });
};

export const withRegulatorId = (id: string): AscentTaskBuilder => {
  return (item) => ({
    ...item,
    attributes: {
      ...item.attributes,
      hierarchy: [
        item.attributes.hierarchy[0]!,
        item.attributes.hierarchy[1]!,
        item.attributes.hierarchy[2]!,
        { ...item.attributes.hierarchy[3]!, id },
      ],
    },
  });
};
