import type { CsvFile } from '../sheets';
import type { CsvLineErrorType } from './logging';
import type { KeysWithValuesOfType } from './lookCreator';

export const setId = <T, K extends KeysWithValuesOfType<T, string | null>>(
  csvFileName: CsvFile,
  idLookup: { [thirdPartyId: string]: string },
  index: number,
  record: T,
  key: K
) => {
  const thirdPartyId = record[key];
  const riskSmartRiskId = idLookup[thirdPartyId as string];
  if (riskSmartRiskId) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    record[key] = riskSmartRiskId as any;
  } else {
    const error: CsvLineErrorType = {
      row: index + 2,
      message: `Referenced key ${
        key as string
      } value ${thirdPartyId} not found`,
      file: csvFileName,
    };

    return error;
  }
};
