import { createApiAdaptor } from 'src/adaptors/ascent/api-adaptor';
import { createExtractRuleHierarchy } from 'src/adaptors/ascent/extract-rule-hierarchy';
import { createPrefetchStorageAdaptor } from 'src/adaptors/ascent/prefetch-storage-adaptor';
import { createDynamoDbAdaptor } from 'src/adaptors/database/dynamo-adaptor';
import { createS3Adaptor } from 'src/adaptors/s3-adaptor';
import { createFetchAllObligationChangesByRegulator } from 'src/domain/services/ascent/fetch-all-obligation-changes-by-regulator';
import { createFetchAllTasksByRegulator } from 'src/domain/services/ascent/fetch-all-tasks-by-regulator';
import { createAscentRegulatorIngestionService } from 'src/domain/services/ascent/ingest-rules';
import { createChangeDetectionService } from 'src/domain/services/change-detection-service';
import type { IngestionRunId, Obligation } from 'src/domain/types';
import type { IngestionManifest } from 'src/domain/types/change-detection';
import type { ObligationChange } from 'src/domain/types/obligation-change';
import { createChangeDetectionUseCase } from 'src/use-cases/change-detection';
import { createConcludeIngestionUseCase } from 'src/use-cases/conclude-ingestion';
import { createIngestAscentRulebooksUseCase } from 'src/use-cases/ingest-ascent-rulebooks';
import { createIngestObligationChangesUseCase } from 'src/use-cases/ingest-obligation-changes';
import { createInitialiseIngestionUseCase } from 'src/use-cases/initialise-ingestion';
import { createPrefetchTasksUseCase } from 'src/use-cases/prefetch-tasks';
import { mockAscentApiAdaptor } from 'test/adaptors/ascent/mock-api-adaptor';
import {
  getAllObligationChanges,
  getAllObligations,
  getRunById,
  localDynamoConfiguration,
} from 'test/adaptors/local-dynamo-adaptor';
import {
  getManifest,
  localS3Configuration,
} from 'test/adaptors/local-s3-adaptor';
import * as localS3Adaptor from 'test/adaptors/local-s3-adaptor';
import {
  type PipelineUseCases,
  runIngestionPipeline,
} from 'test/pipeline/run-pipeline';

describe('Ingest Ascent Rulebooks Handler', () => {
  let ingestionRunId: IngestionRunId;

  const mockEmitChangeEvent = vi.fn().mockResolvedValue(undefined);

  const getAscentAdaptor = ({ useMock = true }: { useMock: boolean }) => {
    if (useMock) {
      return mockAscentApiAdaptor({ randomiseHashes: false });
    }

    return createApiAdaptor({
      baseUrl: process.env.ASCENT_BASE_URL!,
      apiKey: process.env.ASCENT_API_KEY!,
      profileId: process.env.ASCENT_PROFILE_ID!,
    });
  };

  let useCases: PipelineUseCases;

  beforeAll(async () => {
    const databaseAdaptor = createDynamoDbAdaptor(localDynamoConfiguration);
    const ascentApiAdaptor = getAscentAdaptor({ useMock: true });
    const taskStorageAdaptor =
      createPrefetchStorageAdaptor(localS3Configuration);
    const s3Adaptor = createS3Adaptor(localS3Configuration);

    useCases = {
      initialiseIngestionRun: createInitialiseIngestionUseCase({
        saveNewIngestionRun: databaseAdaptor.saveNewIngestionRun,
        updateIngestionRun: databaseAdaptor.upsertIngestionRun,
        getRegulators: ascentApiAdaptor.getRegulators,
      }),
      prefetchTasks: createPrefetchTasksUseCase({
        getIngestionRun: databaseAdaptor.getIngestionRun,
        updateIngestionRun: databaseAdaptor.upsertIngestionRun,
        fetchAllTasksByRegulator: createFetchAllTasksByRegulator({
          getTasks: ascentApiAdaptor.getTasks,
        }),
        persistTasksByRegulator: taskStorageAdaptor.persistTasksByRegulator,
        fetchAllObligationChangesByRegulator:
          createFetchAllObligationChangesByRegulator({
            getObligationChanges: ascentApiAdaptor.getTaskVersions,
          }),
        persistObligationChangesByRegulator:
          taskStorageAdaptor.persistObligationChangesByRegulator,
      }),
      ingestRulebooks: createIngestAscentRulebooksUseCase({
        getIngestionRun: databaseAdaptor.getIngestionRun,
        updateIngestionRun: databaseAdaptor.upsertIngestionRun,
        loadRegulatorTasks: taskStorageAdaptor.loadRegulatorTasks,
        // A fresh createExtractRuleHierarchy() instance is created per invocation to mirror production
        // behaviour, where each Lambda invocation (one per regulator) gets its own instance with
        // clean seenStandardIds / seenChapterIds sets.
        ingestRegulatorData: (ingestionRun, regulatorId, tasks, onProgress) =>
          createAscentRegulatorIngestionService({
            getRegulatorRules: ascentApiAdaptor.getRegulatorRules,
            extractRuleHierarchy:
              createExtractRuleHierarchy().extractRuleHierarchy,
            saveObligations: databaseAdaptor.saveObligations,
          })(ingestionRun, regulatorId, tasks, onProgress),
      }),
      ingestObligationChanges: createIngestObligationChangesUseCase({
        getIngestionRun: databaseAdaptor.getIngestionRun,
        saveIngestionRun: databaseAdaptor.upsertIngestionRun,
        loadRegulatorObligationChanges:
          taskStorageAdaptor.loadObligationChangesByRegulator,
        saveObligationChanges: databaseAdaptor.saveObligationChanges,
      }),
      changeDetection: createChangeDetectionUseCase({
        getIngestionRun: databaseAdaptor.getIngestionRun,
        saveIngestionRun: databaseAdaptor.upsertIngestionRun,
        getLastSuccessfulIngestionRun:
          databaseAdaptor.getLastSuccessfulIngestionRun,
        detectChangesForObligations: createChangeDetectionService({
          getHashesForRegulator:
            databaseAdaptor.getObligationHashesForRegulator,
          getByRegulator: databaseAdaptor.getObligationsByRegulator,
        }),
        detectChangesForObligationChanges: createChangeDetectionService({
          getHashesForRegulator:
            databaseAdaptor.getObligationChangeHashesForRegulator,
          getByRegulator: databaseAdaptor.getObligationChangesByRegulator,
        }),
        exportRegulatorChanges: s3Adaptor.exportRegulatorChanges,
      }),
      concludeIngestion: createConcludeIngestionUseCase({
        getIngestionRun: databaseAdaptor.getIngestionRun,
        saveIngestionRun: databaseAdaptor.upsertIngestionRun,
        exportManifest: s3Adaptor.exportManifest,
        emitChangeEvent: mockEmitChangeEvent,
      }),
    };

    const { ingestionRunId: runId } = await runIngestionPipeline(useCases, {
      orgKey: 'test-org',
      tenant: 'test-tenant',
      providerName: 'ascent',
    });

    ingestionRunId = runId;
  }, 1200_000); // 20 minute timeout for API calls

  it('should have tracked the overall progress of the ingestion run', async () => {
    const run = await getRunById(ingestionRunId);

    expect(run).toEqual(
      expect.objectContaining({
        completedAtTimestamp: expect.any(String),
        id: ingestionRunId,
        phase: {
          enteredAt: expect.any(String),
          resultLocation: `s3://tech-admin-rulebook-changes/${ingestionRunId}/manifest.json`,
          type: 'completed',
        },
        providerName: 'ascent',
      })
    );

    expect(run.regulatorProgress).toHaveLength(3);
  });

  it('should track run progress for the mock regulators', async () => {
    const run = await getRunById(ingestionRunId);

    const mockFCARegulatorProgress = run.regulatorProgress.find(
      (r) => r.regulatorName === 'Mock FCA'
    );

    const mockPRARegulatorProgress = run.regulatorProgress.find(
      (r) => r.regulatorName === 'Mock PRA'
    );

    const mockEmptyRegulatorProgress = run.regulatorProgress.find(
      (r) => r.regulatorName === 'Mock Empty Regulator'
    );

    expect(mockFCARegulatorProgress).toBeDefined();
    expect(mockPRARegulatorProgress).toBeDefined();
    expect(mockEmptyRegulatorProgress).toBeDefined();

    // Verify per-regulator progress tracking

    expect(mockFCARegulatorProgress).toMatchObject({
      regulatorName: 'Mock FCA',
      batchesProcessed: 4, // 3 pages of rules (250/100) + 1 batch for all tasks
      recordsProcessed: 500, // 250 rules + 250 tasks
      standardsCreated: 5,
      chaptersCreated: 10,
      rulesCreated: 250,
      tasksCreated: 250,
    });

    expect(mockPRARegulatorProgress).toMatchObject({
      regulatorName: 'Mock PRA',
      batchesProcessed: 4, // 3 pages of rules (250/100) + 1 batch for all tasks
      recordsProcessed: 500, // 250 rules + 250 tasks
      standardsCreated: 5,
      chaptersCreated: 10,
      rulesCreated: 250,
      tasksCreated: 250,
    });

    expect(mockEmptyRegulatorProgress).toMatchObject({
      regulatorName: 'Mock Empty Regulator',
      batchesProcessed: 0, // no rules or tasks
      recordsProcessed: 0,
      standardsCreated: 0,
      chaptersCreated: 0,
      rulesCreated: 0,
      tasksCreated: 0,
    });
  });

  describe('Expected counts', () => {
    let allObligations: Obligation[];
    let allObligationChanges: ObligationChange[];
    let firstRunManifest: IngestionManifest;

    beforeAll(async () => {
      const results = await Promise.all([
        getAllObligations(ingestionRunId),
        getAllObligationChanges(ingestionRunId),
        getManifest(ingestionRunId),
      ]);
      allObligations = results[0];
      allObligationChanges = results[1];
      firstRunManifest = results[2];
    });

    it('should create the expected number of standards', () => {
      const totalCreatedStandards = allObligations.filter(
        (o) => o.type === 'standard'
      );

      expect(totalCreatedStandards.length).toBe(10); // 5 standards for each of the 2 regulators with data, none for the empty regulator
    });

    it('should create the expected number of chapters', () => {
      const result = allObligations.filter((o) => o.type === 'chapter');

      expect(result.length).toBe(20); // 10 chapters for each of the 2 regulators with data, none for the empty regulator
    });

    it('should create the expected number of rules', () => {
      const result = allObligations.filter((o) => o.type === 'rule');

      expect(result.length).toBe(500); // 250 rules for each of the 2 regulators with data, none for the empty regulator
    });

    it('should create the expected number of tasks', () => {
      const result = allObligations.filter((o) => o.type === 'task');

      expect(result.length).toBe(500); // 250 tasks for each of the 2 regulators with data, none for the empty regulator
    });

    it('should create the expected number of obligation changes', () => {
      expect(allObligationChanges).toHaveLength(500); // 250 per regulator × 2 data regulators, none for the empty regulator
    });

    it('should report all obligation changes as added in first run manifest', () => {
      const fcaEntry = firstRunManifest.regulators.find(
        (r) => r.name === 'Mock FCA'
      );
      const praEntry = firstRunManifest.regulators.find(
        (r) => r.name === 'Mock PRA'
      );
      const emptyEntry = firstRunManifest.regulators.find(
        (r) => r.name === 'Mock Empty Regulator'
      );

      expect(fcaEntry).toMatchObject({
        obligationChanges: { added: 250, updated: 0, removed: 0 },
      });
      expect(praEntry).toMatchObject({
        obligationChanges: { added: 250, updated: 0, removed: 0 },
      });
      expect(emptyEntry).toMatchObject({
        obligationChanges: { added: 0, updated: 0, removed: 0 },
      });
    });

    it('should emit change event once', () => {
      expect(mockEmitChangeEvent).toHaveBeenCalledTimes(1);
    });
  });

  describe('Change detection', () => {
    let secondIngestionRunId: IngestionRunId;

    beforeAll(async () => {
      const { ingestionRunId: runId } = await runIngestionPipeline(useCases, {
        orgKey: 'test-org',
        tenant: 'test-tenant',
        providerName: 'ascent',
      });

      secondIngestionRunId = runId;
    }, 1200_000);

    it('should not detect any changes when ingesting the same data again', async () => {
      const manifest = await getManifest(secondIngestionRunId);
      expect(manifest.regulators).toHaveLength(3);

      expect(manifest.regulators[0]).toMatchObject({
        obligations: { added: 0, updated: 0, removed: 0 },
        obligationChanges: { added: 0, updated: 0, removed: 0 },
      });

      expect(manifest.regulators[1]).toMatchObject({
        obligations: { added: 0, updated: 0, removed: 0 },
        obligationChanges: { added: 0, updated: 0, removed: 0 },
      });

      expect(manifest.regulators[2]).toMatchObject({
        obligations: { added: 0, updated: 0, removed: 0 },
        obligationChanges: { added: 0, updated: 0, removed: 0 },
      });

      const regulator1ChangeResult =
        await localS3Adaptor.getRegulatorChangeResult(
          secondIngestionRunId,
          manifest.regulators[0]!.id
        );

      const regulator2ChangeResult =
        await localS3Adaptor.getRegulatorChangeResult(
          secondIngestionRunId,
          manifest.regulators[1]!.id
        );

      const regulator3ChangeResult =
        await localS3Adaptor.getRegulatorChangeResult(
          secondIngestionRunId,
          manifest.regulators[2]!.id
        );

      expect(regulator1ChangeResult).toMatchObject({
        obligations: { added: [], updated: [] },
        obligationChanges: { added: [], updated: [] },
      });

      expect(regulator2ChangeResult).toMatchObject({
        obligations: { added: [], updated: [] },
        obligationChanges: { added: [], updated: [] },
      });

      expect(regulator3ChangeResult).toMatchObject({
        obligations: { added: [], updated: [] },
        obligationChanges: { added: [], updated: [] },
      });
    }, 100_000);
  });
});
