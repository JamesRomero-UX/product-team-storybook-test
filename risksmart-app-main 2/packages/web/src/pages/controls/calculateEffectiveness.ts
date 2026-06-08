import type { ControlFlatFields } from './types';

export const calculateOverallEffectiveness = (
  d: Pick<ControlFlatFields, 'testResults'>
) =>
  d.testResults.length > 0
    ? (d.testResults[0].OverallEffectiveness ?? null)
    : null;

export const calculateDesignEffectiveness = (
  d: Pick<ControlFlatFields, 'testResults'>
) =>
  d.testResults.length > 0
    ? (d.testResults[0].DesignEffectiveness ?? null)
    : null;

export const calculatePerformanceEffectiveness = (
  d: Pick<ControlFlatFields, 'testResults'>
) =>
  d.testResults.length > 0
    ? (d.testResults[0].PerformanceEffectiveness ?? null)
    : null;
