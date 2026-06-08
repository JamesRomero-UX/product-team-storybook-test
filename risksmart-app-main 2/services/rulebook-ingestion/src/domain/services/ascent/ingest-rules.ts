import {
  transformRuleToObligation,
  transformTaskToObligation,
} from 'src/adaptors/ascent/transform';
import type {
  IngestionProgressDelta,
  IngestionRun,
  IngestionRunId,
  NewRawExternalObligation,
  Obligation,
  RegulatorId,
} from 'src/domain/types';

export interface Dependencies {
  getRegulatorRules: (
    regulatorId: RegulatorId,
    page: number
  ) => Promise<NewRawExternalObligation[] | null>;

  extractRuleHierarchy: (rawObligations: NewRawExternalObligation[]) => {
    standards: Obligation[];
    chapters: Obligation[];
  };

  saveObligations: (
    ingestionRunId: IngestionRunId,
    obligations: Obligation[]
  ) => Promise<Obligation[]>;
}

export const createAscentRegulatorIngestionService = ({
  getRegulatorRules,
  extractRuleHierarchy,
  saveObligations,
}: Dependencies) => {
  /**
   * Ingest all rules and tasks for a single regulator.
   *
   * @param ingestionRun - The current ingestion run
   * @param regulator - The regulator to process
   * @param regulatorTasks - Pre-fetched and grouped tasks for this regulator
   * @param reportProgress - Callback to report progress
   */
  return async (
    ingestionRun: IngestionRun,
    regulatorId: RegulatorId,
    regulatorTasks: NewRawExternalObligation[],
    reportProgress: (progress: IngestionProgressDelta) => Promise<void>
  ) => {
    if (regulatorTasks.length > 0) {
      // importing these transformations from the adaptor layer is not the clean architecture violation it appears to be
      // because the service itself is tightly coupled to ascent already.
      // The services exist specifically to transform Ascent's data format into RiskSmart's domain types.
      const taskObligations = regulatorTasks.map((task) =>
        transformTaskToObligation(task)
      );

      await saveObligations(ingestionRun.id, taskObligations);

      await reportProgress({
        regulatorId,
        batchesProcessed: 1,
        recordsProcessed: taskObligations.length,
        tasksCreated: taskObligations.length,
      });
    }

    for (let pageNumber = 1; ; pageNumber++) {
      const regulatorRules = await getRegulatorRules(regulatorId, pageNumber);

      if (regulatorRules === null) {
        break;
      }

      const { standards, chapters } = extractRuleHierarchy(regulatorRules);

      if (standards.length || chapters.length) {
        await saveObligations(ingestionRun.id, [...standards, ...chapters]);
      }

      const ruleObligations = regulatorRules.map((item) =>
        transformRuleToObligation(item)
      );

      await saveObligations(ingestionRun.id, ruleObligations);

      await reportProgress({
        regulatorId,
        batchesProcessed: 1,
        recordsProcessed: regulatorRules.length,
        standardsCreated: standards.length,
        chaptersCreated: chapters.length,
        rulesCreated: ruleObligations.length,
      });
    }
  };
};
