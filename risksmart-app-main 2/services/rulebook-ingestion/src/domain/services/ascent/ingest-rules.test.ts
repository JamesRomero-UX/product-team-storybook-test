import { transformRuleToObligation } from 'src/adaptors/ascent/transform';
import type { NewRawExternalObligation, Regulator } from 'src/domain/types';
import { regulatorIdSchema } from 'src/domain/types';
import {
  buildAscentRule,
  withId,
  withRegulatorId,
} from 'test/adaptors/ascent-rule-builder';
import {
  buildAscentTask,
  withId as withTaskId,
  withRegulatorId as withTaskRegulatorId,
} from 'test/adaptors/ascent-task-builder';
import { buildIngestionRun } from 'test/builders/ingestion-run-builder';
import {
  buildRawExternalObligation,
  withExternalId,
  withJson,
} from 'test/builders/raw-external-obligation-builder';

import { createAscentRegulatorIngestionService } from './ingest-rules';

describe('Ascent Regulator Ingestion Service', () => {
  const mockRegulator: Regulator = {
    id: regulatorIdSchema.parse('reg-1'),
    name: 'Regulator 1',
  };

  it('should process rules for a regulator even when there are no tasks', async () => {
    const mockRules: NewRawExternalObligation[] = [
      buildRawExternalObligation(
        withExternalId('rule-1'),
        withJson(
          JSON.stringify(
            buildAscentRule(withId('rule-1'), withRegulatorId('reg-1'))
          )
        )
      ),
    ];

    const mockGetRegulatorRules = vi
      .fn()
      .mockResolvedValueOnce(mockRules)
      .mockResolvedValueOnce(null);

    const mockSaveObligations = vi.fn().mockResolvedValue([]);
    const mockReportProgress = vi.fn().mockResolvedValue(undefined);
    const mockExtractRuleHierarchy = vi.fn().mockReturnValue({
      standards: [],
      chapters: [],
    });

    const service = createAscentRegulatorIngestionService({
      getRegulatorRules: mockGetRegulatorRules,
      extractRuleHierarchy: mockExtractRuleHierarchy,
      saveObligations: mockSaveObligations,
    });

    const ingestionRun = buildIngestionRun();

    await service(ingestionRun, mockRegulator.id, [], mockReportProgress);

    expect(mockGetRegulatorRules).toHaveBeenCalledTimes(2);
    expect(mockGetRegulatorRules).toHaveBeenNthCalledWith(1, 'reg-1', 1);
    expect(mockGetRegulatorRules).toHaveBeenNthCalledWith(2, 'reg-1', 2);

    expect(mockSaveObligations).toHaveBeenCalledTimes(1);
    expect(mockReportProgress).toHaveBeenCalledTimes(1);

    expect(mockReportProgress).toHaveBeenCalledWith({
      regulatorId: 'reg-1',
      batchesProcessed: 1,
      recordsProcessed: 1,
      standardsCreated: 0,
      chaptersCreated: 0,
      rulesCreated: 1,
    });
  });

  it('should save tasks for a regulator before processing rules', async () => {
    const mockTasks: NewRawExternalObligation[] = [
      buildRawExternalObligation(
        withExternalId('task-1'),
        withJson(
          JSON.stringify(
            buildAscentTask(withTaskId('task-1'), withTaskRegulatorId('reg-1'))
          )
        )
      ),
      buildRawExternalObligation(
        withExternalId('task-2'),
        withJson(
          JSON.stringify(
            buildAscentTask(withTaskId('task-2'), withTaskRegulatorId('reg-1'))
          )
        )
      ),
    ];

    const mockGetRegulatorRules = vi.fn().mockResolvedValue(null);
    const mockSaveObligations = vi.fn().mockResolvedValue([]);
    const mockReportProgress = vi.fn().mockResolvedValue(undefined);
    const mockExtractRuleHierarchy = vi.fn().mockReturnValue({
      standards: [],
      chapters: [],
    });

    const service = createAscentRegulatorIngestionService({
      getRegulatorRules: mockGetRegulatorRules,
      extractRuleHierarchy: mockExtractRuleHierarchy,
      saveObligations: mockSaveObligations,
    });

    const ingestionRun = buildIngestionRun();

    await service(
      ingestionRun,
      mockRegulator.id,
      mockTasks,
      mockReportProgress
    );

    expect(mockSaveObligations).toHaveBeenCalledTimes(1);
    expect(mockSaveObligations).toHaveBeenCalledWith(
      ingestionRun.id,
      expect.arrayContaining([
        expect.objectContaining({
          externalId: 'task-1',
          type: 'task',
        }),
        expect.objectContaining({
          externalId: 'task-2',
          type: 'task',
        }),
      ])
    );

    expect(mockReportProgress).toHaveBeenCalledWith({
      regulatorId: 'reg-1',

      batchesProcessed: 1,
      recordsProcessed: 2,
      tasksCreated: 2,
    });
  });

  it('should save both tasks and rules for a regulator', async () => {
    const mockTasks: NewRawExternalObligation[] = [
      buildRawExternalObligation(
        withExternalId('task-1'),
        withJson(
          JSON.stringify(
            buildAscentTask(withTaskId('task-1'), withTaskRegulatorId('reg-1'))
          )
        )
      ),
    ];

    const mockRules: NewRawExternalObligation[] = [
      buildRawExternalObligation(
        withExternalId('rule-1'),
        withJson(
          JSON.stringify(
            buildAscentRule(withId('rule-1'), withRegulatorId('reg-1'))
          )
        )
      ),
    ];

    const mockGetRegulatorRules = vi
      .fn()
      .mockResolvedValueOnce(mockRules)
      .mockResolvedValueOnce(null);

    const mockSaveObligations = vi.fn().mockResolvedValue([]);
    const mockReportProgress = vi.fn().mockResolvedValue(undefined);
    const mockExtractRuleHierarchy = vi.fn().mockReturnValue({
      standards: [],
      chapters: [],
    });

    const service = createAscentRegulatorIngestionService({
      getRegulatorRules: mockGetRegulatorRules,
      extractRuleHierarchy: mockExtractRuleHierarchy,
      saveObligations: mockSaveObligations,
    });

    const ingestionRun = buildIngestionRun();

    await service(
      ingestionRun,
      mockRegulator.id,
      mockTasks,
      mockReportProgress
    );

    // Tasks saved once, rules saved once
    expect(mockSaveObligations).toHaveBeenCalledTimes(2);

    // First call: tasks
    expect(mockSaveObligations).toHaveBeenNthCalledWith(
      1,
      ingestionRun.id,
      expect.arrayContaining([
        expect.objectContaining({
          externalId: 'task-1',
          type: 'task',
        }),
      ])
    );

    // Second call: rules
    expect(mockSaveObligations).toHaveBeenNthCalledWith(
      2,
      ingestionRun.id,
      expect.arrayContaining([
        expect.objectContaining({
          externalId: 'rule-1',
          type: 'rule',
        }),
      ])
    );

    // Progress reported for tasks and rules
    expect(mockReportProgress).toHaveBeenCalledTimes(2);
  });

  it('should save transformed rules with correct ingestion run id', async () => {
    const rawExternalObligations: NewRawExternalObligation[] = [
      buildRawExternalObligation(
        withExternalId('rule-1'),
        withJson(
          JSON.stringify(
            buildAscentRule(withId('rule-1'), withRegulatorId('reg-1'))
          )
        )
      ),
    ];

    const mockGetRegulatorRules = vi
      .fn()
      .mockResolvedValueOnce(rawExternalObligations)
      .mockResolvedValueOnce(null);
    const mockSaveObligations = vi.fn().mockResolvedValue([]);
    const mockReportProgress = vi.fn().mockResolvedValue(undefined);
    const mockExtractRuleHierarchy = vi.fn().mockReturnValue({
      standards: [],
      chapters: [],
    });

    const service = createAscentRegulatorIngestionService({
      getRegulatorRules: mockGetRegulatorRules,
      extractRuleHierarchy: mockExtractRuleHierarchy,
      saveObligations: mockSaveObligations,
    });

    const ingestionRun = buildIngestionRun();

    await service(ingestionRun, mockRegulator.id, [], mockReportProgress);

    const expectedObligations = rawExternalObligations.map((item) =>
      transformRuleToObligation(item)
    );

    expect(mockSaveObligations).toHaveBeenCalledWith(
      ingestionRun.id,
      expect.arrayContaining([
        expect.objectContaining({
          externalId: expectedObligations[0]!.externalId,
          type: 'rule',
        }),
      ])
    );
  });

  it('should report progress delta correctly during rule pagination', async () => {
    const createMockRules = (count: number): NewRawExternalObligation[] =>
      Array.from({ length: count }, (_, i) =>
        buildRawExternalObligation(
          withExternalId(`rule-${i}`),
          withJson(
            JSON.stringify(
              buildAscentRule(withId(`rule-${i}`), withRegulatorId('reg-1'))
            )
          )
        )
      );

    const mockGetRegulatorRules = vi
      .fn()
      .mockResolvedValueOnce(createMockRules(10)) // Page 1: 10 rules
      .mockResolvedValueOnce([]) // Page 2: Empty page
      .mockResolvedValueOnce(createMockRules(5)) // Page 3: 5 rules
      .mockResolvedValueOnce(createMockRules(3)) // Page 4: 3 rules
      .mockResolvedValueOnce(null); // Page 5: end of data

    const mockSaveObligations = vi.fn().mockResolvedValue([]);
    const mockReportProgress = vi.fn().mockResolvedValue(undefined);
    const mockExtractRuleHierarchy = vi.fn().mockReturnValue({
      standards: [],
      chapters: [],
    });

    const service = createAscentRegulatorIngestionService({
      getRegulatorRules: mockGetRegulatorRules,
      extractRuleHierarchy: mockExtractRuleHierarchy,
      saveObligations: mockSaveObligations,
    });

    const ingestionRun = buildIngestionRun();

    await service(ingestionRun, mockRegulator.id, [], mockReportProgress);

    expect(mockReportProgress).toHaveBeenCalledTimes(4);

    expect(mockReportProgress).toHaveBeenNthCalledWith(1, {
      regulatorId: 'reg-1',
      batchesProcessed: 1,
      recordsProcessed: 10,
      standardsCreated: 0,
      chaptersCreated: 0,
      rulesCreated: 10,
    });

    expect(mockReportProgress).toHaveBeenNthCalledWith(2, {
      regulatorId: 'reg-1',
      batchesProcessed: 1,
      recordsProcessed: 0,
      standardsCreated: 0,
      chaptersCreated: 0,
      rulesCreated: 0,
    });

    expect(mockReportProgress).toHaveBeenNthCalledWith(3, {
      regulatorId: 'reg-1',
      batchesProcessed: 1,
      recordsProcessed: 5,
      standardsCreated: 0,
      chaptersCreated: 0,
      rulesCreated: 5,
    });

    expect(mockReportProgress).toHaveBeenNthCalledWith(4, {
      regulatorId: 'reg-1',
      batchesProcessed: 1,
      recordsProcessed: 3,
      standardsCreated: 0,
      chaptersCreated: 0,
      rulesCreated: 3,
    });
  });
});
