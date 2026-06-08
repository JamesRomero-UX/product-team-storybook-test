// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import type {
  IngestionManifest,
  ManifestRegulatorEntry,
} from '../../../src/adaptors/s3-obligation-provider/types';

type IngestionManifestBuilder = (item: IngestionManifest) => IngestionManifest;

type ManifestRegulatorEntryInput = Partial<
  Omit<ManifestRegulatorEntry, 'id' | 'name'>
> & {
  id: string;
  name: string;
};

export const manifestRegulatorEntry = (
  input: ManifestRegulatorEntryInput
): ManifestRegulatorEntry => ({
  location: `s3://bucket/${input.id}.json`,
  obligations: {
    added: 0,
    updated: 0,
    removed: 0,
  },
  obligationChanges: {
    added: 0,
    updated: 0,
    removed: 0,
  },
  ...input,
});

export const withRunId =
  (runId: string): IngestionManifestBuilder =>
  (item) => ({
    ...item,
    runId,
  });

export const withRegulators =
  (...entries: ManifestRegulatorEntry[]): IngestionManifestBuilder =>
  (item) => ({
    ...item,
    regulators: [...item.regulators, ...entries],
  });

const getDefaultValue = (): IngestionManifest => ({
  runId: 'default-run-id',
  providerName: 'Test Provider',
  regulators: [],
  completedAtTimestamp: new Date().toISOString(),
});

export const createIngestionManifest = (
  ...builders: IngestionManifestBuilder[]
) => {
  const item = builders.reduce(
    (acc, builder) => builder(acc),
    getDefaultValue()
  );

  return item;
};
