import { randomUUID } from 'crypto';
import type { NewRawExternalObligation, RegulatorId } from 'src/domain/types';
import { type Regulator, regulatorIdSchema } from 'src/domain/types';
import {
  type NewRawExternalObligationChange,
  newRawExternalObligationChangeSchema,
} from 'src/domain/types/obligation-change';
import {
  buildRawExternalObligation,
  withExternalId,
  withExternalParentId,
  withJson,
  withRegulatorId as withObligationRegulatorId,
} from 'test/builders/raw-external-obligation-builder';

import {
  buildAscentRule,
  withChapterId,
  withId,
  withRegulatorId as withRuleRegulatorId,
  withStandardId,
} from '../ascent-rule-builder';
import {
  buildAscentTask,
  withId as withTaskId,
  withRegulatorId as withTaskRegulatorId,
  withRuleId,
} from '../ascent-task-builder';

interface RegulatorConfig {
  name: string;
  hasData: boolean;
}

interface MockOptions {
  standardsPerRegulator?: number;
  chaptersPerStandard?: number;
  rulesPerChapter?: number;
  randomiseHashes?: boolean;
}

const DEFAULT_REGULATORS: RegulatorConfig[] = [
  { name: 'Mock FCA', hasData: true },
  { name: 'Mock PRA', hasData: true },
  { name: 'Mock Empty Regulator', hasData: false },
];

const PAGE_SIZE = 100;

const paginate = <T>(items: T[], pageNumber: number): T[] | null => {
  const startIndex = (pageNumber - 1) * PAGE_SIZE;

  const page = items.slice(startIndex, startIndex + PAGE_SIZE);

  return page.length > 0 ? page : null;
};

const generateId = (
  prefix: string,
  index: number,
  randomise: boolean
): string => (randomise ? randomUUID() : `${prefix}-${index + 1}`);

export const mockAscentApiAdaptor = (options: MockOptions = {}) => {
  const {
    standardsPerRegulator = 5,
    chaptersPerStandard = 2,
    rulesPerChapter = 25,
    randomiseHashes = false,
  } = options;

  const mockRegulators: Regulator[] = DEFAULT_REGULATORS.map((config) => ({
    id: regulatorIdSchema.parse(randomUUID()),
    name: config.name,
  }));

  const rulesByRegulator = new Map<RegulatorId, NewRawExternalObligation[]>();
  const allTasks: NewRawExternalObligation[] = [];
  const allTaskVersions: NewRawExternalObligationChange[] = [];
  let globalTaskCounter = 0;

  for (const [index, config] of DEFAULT_REGULATORS.entries()) {
    const regulator = mockRegulators[index]!;
    const regulatorRules: NewRawExternalObligation[] = [];

    if (!config.hasData) {
      rulesByRegulator.set(regulator.id, []);
      continue;
    }

    let ruleCounter = 0;
    for (let stdIdx = 0; stdIdx < standardsPerRegulator; stdIdx++) {
      const standardId = generateId('STD', stdIdx, randomiseHashes);

      for (let chapIdx = 0; chapIdx < chaptersPerStandard; chapIdx++) {
        const chapterIdx = stdIdx * chaptersPerStandard + chapIdx;
        const chapterId = generateId('CHAP', chapterIdx, randomiseHashes);

        for (let ruleIdx = 0; ruleIdx < rulesPerChapter; ruleIdx++) {
          const ruleId = generateId('RULE', ruleCounter, randomiseHashes);

          regulatorRules.push(
            buildRawExternalObligation(
              withExternalId(ruleId),
              withExternalParentId(chapterId),
              withObligationRegulatorId(regulator.id),
              withJson(
                JSON.stringify(
                  buildAscentRule(
                    withId(ruleId),
                    withStandardId(standardId),
                    withChapterId(chapterId),
                    withRuleRegulatorId(regulator.id)
                  )
                )
              )
            )
          );

          ruleCounter++;
        }
      }
    }

    rulesByRegulator.set(regulator.id, regulatorRules);

    // Generate one task per rule
    const regulatorTasks = regulatorRules.map((rule) => {
      const taskId = generateId('TASK', globalTaskCounter++, randomiseHashes);

      return buildRawExternalObligation(
        withExternalId(taskId),
        withExternalParentId(rule.externalId),
        withObligationRegulatorId(regulator.id),
        withJson(
          JSON.stringify(
            buildAscentTask(
              withTaskId(taskId),
              withRuleId(rule.externalId),
              withTaskRegulatorId(regulator.id)
            )
          )
        )
      );
    });

    allTasks.push(...regulatorTasks);

    // Generate one task version per task
    regulatorTasks.forEach((task, idx) => {
      const versionCounter = allTaskVersions.length + idx;
      const versionId = generateId('TV', versionCounter, randomiseHashes);

      allTaskVersions.push(
        newRawExternalObligationChangeSchema.parse({
          externalId: versionId,
          // externalParentId must match the task's externalId for regulator resolution during prefetch
          externalParentId: task.externalId,
          type: 'obligation_change',
          json: JSON.stringify({
            id: versionId,
            type: 'task version',
            attributes: {
              taskId: versionCounter + 1,
              startsAt: '2022-07-25',
              endsAt: null,
              content: 'Updated obligation content',
              createdAt: '2022-07-25T20:16:31+00:00',
              modifiedAt: '2022-07-25T20:16:31+00:00',
              changeSummary: 'Regulatory update applied',
              links: {
                app: `https://risksmart-7443.ascentregtech.com/tasks/${versionCounter + 1}`,
                changeDetail: `https://risksmart-7443.ascentregtech.com/task-versions/${versionCounter + 1}`,
              },
              diff: {
                previous:
                  'Previous obligation content before the regulatory change.',
                this: 'Updated obligation content after the regulatory change.',
              },
              changeSource: {},
            },
          }),
        })
      );
    });
  }

  return {
    getRegulators: (): Promise<Regulator[]> => Promise.resolve(mockRegulators),

    getRegulatorRules: (
      regulatorId: RegulatorId,
      pageNumber: number = 1
    ): Promise<NewRawExternalObligation[] | null> => {
      const rules = rulesByRegulator.get(regulatorId) ?? [];

      return Promise.resolve(paginate(rules, pageNumber));
    },

    getTasks: (
      pageNumber: number = 1
    ): Promise<NewRawExternalObligation[] | null> =>
      Promise.resolve(paginate(allTasks, pageNumber)),

    getTaskVersions: (
      pageNumber: number = 1
    ): Promise<NewRawExternalObligationChange[] | null> =>
      Promise.resolve(paginate(allTaskVersions, pageNumber)),
  };
};
