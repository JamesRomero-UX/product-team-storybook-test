import type { NewRawExternalObligation, RegulatorId } from 'src/domain/types';

export interface Dependencies {
  getTasks: (page: number) => Promise<NewRawExternalObligation[] | null>;
}

/**
 * Ascent does not offer an endpoint to fetch all tasks for a regulator, so we have to page through them here and return them for grouping by regulator in the use case.
 */
export const createFetchAllTasksByRegulator = ({ getTasks }: Dependencies) => {
  const groupTasksByRegulator = (
    tasks: NewRawExternalObligation[]
  ): Map<RegulatorId, NewRawExternalObligation[]> => {
    const map = new Map<RegulatorId, NewRawExternalObligation[]>();

    for (const task of tasks) {
      const existing = map.get(task.regulatorId);
      if (existing) {
        existing.push(task);
      } else {
        map.set(task.regulatorId, [task]);
      }
    }

    return map;
  };

  return async (): Promise<Map<RegulatorId, NewRawExternalObligation[]>> => {
    const allTasks: Map<RegulatorId, NewRawExternalObligation[]> = new Map();

    for (let pageNumber = 1; ; pageNumber++) {
      const tasks = await getTasks(pageNumber);

      if (tasks === null) {
        break;
      }

      const tasksByRegulator = groupTasksByRegulator(tasks);

      for (const [regulatorId, regulatorTasks] of tasksByRegulator.entries()) {
        const existing = allTasks.get(regulatorId);
        if (existing) {
          existing.push(...regulatorTasks);
          allTasks.set(regulatorId, existing);
        } else {
          allTasks.set(regulatorId, regulatorTasks);
        }
      }
    }

    return allTasks;
  };
};
