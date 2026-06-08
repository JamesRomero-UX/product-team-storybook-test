import {
  type NewRawExternalObligation,
  regulatorIdSchema,
} from 'src/domain/types';
import {
  buildAscentTask,
  withId as withTaskId,
} from 'test/adaptors/ascent-task-builder';
import {
  buildRawExternalObligation,
  withExternalId,
  withJson,
  withRegulatorId,
} from 'test/builders/raw-external-obligation-builder';

import { createFetchAllTasksByRegulator } from './fetch-all-tasks-by-regulator';

describe('Ascent task ingestion service', () => {
  it('should return empty map when there are no tasks to fetch', async () => {
    const mockGetTasks = vi.fn().mockResolvedValue(null);

    const service = createFetchAllTasksByRegulator({
      getTasks: mockGetTasks,
    });

    const result = await service();

    expect(result.size).toEqual(0);
    expect(mockGetTasks).toHaveBeenCalledTimes(1);
    expect(mockGetTasks).toHaveBeenCalledWith(1);
  });

  it('should fetch all tasks across pages and return them grouped by regulator', async () => {
    const mockTasksPage1: NewRawExternalObligation[] = [
      buildRawExternalObligation(
        withExternalId('task-1'),
        withRegulatorId('regulator-1'),
        withJson(JSON.stringify(buildAscentTask(withTaskId('task-1'))))
      ),
      buildRawExternalObligation(
        withExternalId('task-2'),
        withRegulatorId('regulator-2'),
        withJson(JSON.stringify(buildAscentTask(withTaskId('task-2'))))
      ),
    ];

    const mockTasksPage2: NewRawExternalObligation[] = [
      buildRawExternalObligation(
        withExternalId('task-3'),
        withRegulatorId('regulator-1'),
        withJson(JSON.stringify(buildAscentTask(withTaskId('task-3'))))
      ),
    ];

    const mockGetTasks = vi
      .fn()
      .mockResolvedValueOnce(mockTasksPage1)
      .mockResolvedValueOnce(mockTasksPage2)
      .mockResolvedValueOnce(null);

    const service = createFetchAllTasksByRegulator({
      getTasks: mockGetTasks,
    });

    const result = await service();

    // two regulators: regulator-1 with task-1 and task-3, regulator-2 with task-2
    expect(result.size).toBe(2);

    expect(result.get(regulatorIdSchema.parse('regulator-1'))).toEqual([
      mockTasksPage1[0],
      ...mockTasksPage2,
    ]);

    expect(result.get(regulatorIdSchema.parse('regulator-2'))).toEqual([
      mockTasksPage1[1],
    ]);
  });
});
