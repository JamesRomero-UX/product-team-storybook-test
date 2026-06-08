import {
  ControlTypeEnum,
  RiskAssessmentResultControlTypeEnum,
} from 'generated/graphql';

import type { Controls, NumberOfControlsWithGapsConfig } from '../types';
import {
  calculateControlEffectiveness,
  calculateInherentScore,
  calculateResidualScore,
} from './numberOfControlsWithGaps';

describe('Number of controls with gaps', () => {
  describe('calculateInherentRating', () => {
    it('should allow overriding inherent score', () => {
      const latestInherentRating = null;
      const config: NumberOfControlsWithGapsConfig = {
        inherentScoreOverride: 5,
        nonEffectiveValues: [],
      };
      expect(
        calculateInherentScore({
          latestInherentRating,
          config,
          riskId: 'risk 1',
        })?.score
      ).toBe(5);
    });

    it('should return null if Likelihood is null', () => {
      const latestInherentRating = {
        Likelihood: null,
        Impact: 1,
        ControlType: RiskAssessmentResultControlTypeEnum.Controlled,
      };
      expect(
        calculateInherentScore({
          latestInherentRating,
          config: null,
          riskId: 'risk 1',
        })
      ).toBeNull();
    });

    it('should return null if Impact is null', () => {
      const latestInherentRating = {
        Likelihood: 1,
        Impact: null,
        ControlType: RiskAssessmentResultControlTypeEnum.Controlled,
      };
      expect(
        calculateInherentScore({
          latestInherentRating,
          config: null,
          riskId: 'risk 1',
        })
      ).toBeNull();
    });

    it('should return null if Likelihood and Impact are null', () => {
      const latestInherentRating = {
        Likelihood: null,
        Impact: null,
        ControlType: RiskAssessmentResultControlTypeEnum.Controlled,
      };
      expect(
        calculateInherentScore({
          latestInherentRating,
          config: null,
          riskId: 'risk 1',
        })
      ).toBeNull();
    });

    it.each`
      likelihood | impact | expected
      ${1}       | ${2}   | ${2}
      ${2}       | ${1}   | ${2}
      ${4}       | ${5}   | ${20}
      ${5}       | ${5}   | ${25}
    `(
      'should return the product of Likelihood and Impact',
      ({ likelihood, impact, expected }) => {
        const latestInherentRating = {
          Likelihood: likelihood,
          Impact: impact,
          ControlType: RiskAssessmentResultControlTypeEnum.Controlled,
        };
        expect(
          calculateInherentScore({
            latestInherentRating,
            config: null,
            riskId: 'risk 1',
          })
        ).toEqual({ likelihood, impact, score: expected });
      }
    );
  });

  describe('calculateControlEffectiveness', () => {
    it('should return null if there are no controls', () => {
      const controls: Partial<Controls> = [];
      const config: NumberOfControlsWithGapsConfig = {
        inherentScoreOverride: 5,
        nonEffectiveValues: [2],
      };
      expect(calculateControlEffectiveness({ controls, config })).toBeNull();
    });

    it.each`
      control_one | control_two | control_three | expected
      ${1}        | ${1}        | ${1}          | ${1}
      ${1}        | ${1}        | ${1}          | ${1}
      ${1}        | ${2}        | ${1}          | ${0.666}
      ${1}        | ${2}        | ${2}          | ${0.333}
      ${2}        | ${2}        | ${2}          | ${0}
      ${null}     | ${2}        | ${2}          | ${null}
      ${3}        | ${2}        | ${2}          | ${0}
      ${3}        | ${2}        | ${1}          | ${0.5}
      ${1}        | ${2}        | ${4}          | ${0.333}
    `(
      'should return the control effectiveness [$control_one, $control_two, $control_three] => $expected',
      ({ control_one, control_two, control_three, expected }) => {
        const config: NumberOfControlsWithGapsConfig = {
          inherentScoreOverride: 5,
          nonEffectiveValues: [2, 4],
          excludeControlsWithValues: [3],
        };
        const controls: Partial<Controls> = [
          {
            control: {
              Id: 'control-1',
              Type: ControlTypeEnum.Corrective,
              CustomAttributeData: {},
              testResults: [{ OverallEffectiveness: control_one }],
            },
          },
          {
            control: {
              Id: 'control-2',
              Type: ControlTypeEnum.Corrective,
              CustomAttributeData: {},
              testResults: [{ OverallEffectiveness: control_two }],
            },
          },
          {
            control: {
              Id: 'control-3',
              Type: ControlTypeEnum.Corrective,
              CustomAttributeData: {},
              testResults: [{ OverallEffectiveness: control_three }],
            },
          },
        ];
        if (expected !== null) {
          expect(
            calculateControlEffectiveness({ controls, config })
              ?.overallMitigation
          ).toBeCloseTo(expected, 2);
        } else {
          expect(
            calculateControlEffectiveness({ controls, config })
          ).toBeNull();
        }
      }
    );

    it('should filter controls based on CustomAttributeData', () => {
      const controls: Partial<Controls> = [
        {
          control: {
            Id: 'control-1',
            Type: ControlTypeEnum.Corrective,
            CustomAttributeData: { custom_field: 'yes' },
            testResults: [{ OverallEffectiveness: 1 }],
          },
        },
        {
          control: {
            Id: 'control-2',
            Type: ControlTypeEnum.Corrective,
            CustomAttributeData: { custom_field: 'yes' },
            testResults: [{ OverallEffectiveness: 2 }],
          },
        },
        {
          control: {
            Id: 'control-3',
            Type: ControlTypeEnum.Corrective,
            CustomAttributeData: { custom_field: 'maybe' },
            testResults: [{ OverallEffectiveness: 2 }],
          },
        },
        {
          control: {
            Id: 'control-4',
            Type: ControlTypeEnum.Corrective,
            CustomAttributeData: { custom_field: 'no' },
            testResults: [{ OverallEffectiveness: 2 }],
          },
        },
      ];
      expect(
        calculateControlEffectiveness({
          controls,
          config: {
            controlFilterField: 'CustomAttributeData',
            controlFilterCustomAttributeKey: 'custom_field',
            controlFilterValues: ['yes', 'maybe'],
            nonEffectiveValues: [2],
          },
        })?.overallMitigation
      ).toBeCloseTo(0.33, 2);
    });

    it('should filter controls by type if there is one provided', () => {
      const controls: Partial<Controls> = [
        {
          control: {
            Id: 'control-1',
            Type: ControlTypeEnum.Corrective,
            CustomAttributeData: {},
            testResults: [{ OverallEffectiveness: 1 }],
          },
        },
        {
          control: {
            Id: 'control-2',
            Type: ControlTypeEnum.Corrective,
            CustomAttributeData: {},
            testResults: [{ OverallEffectiveness: 2 }],
          },
        },
        {
          control: {
            Id: 'control-3',
            Type: ControlTypeEnum.Corrective,
            CustomAttributeData: {},
            testResults: [{ OverallEffectiveness: 2 }],
          },
        },
        {
          control: {
            Id: 'control-4',
            Type: ControlTypeEnum.Preventive,
            CustomAttributeData: {},
            testResults: [{ OverallEffectiveness: 2 }],
          },
        },
      ];
      expect(
        calculateControlEffectiveness({
          controls,
          config: {
            controlFilterField: 'Type',
            controlFilterValues: [ControlTypeEnum.Corrective],
            nonEffectiveValues: [2],
          },
        })?.overallMitigation
      ).toBeCloseTo(0.33, 2);
    });
  });

  describe('calculateResidualRating', () => {
    it('should return null if inherentRating is null', () => {
      expect(
        calculateResidualScore({
          inherentRating: null,
          controlEffectiveness: { overallMitigation: 1 },
          inherentScore: null,
          latestResidualRating: null,
        })
      ).toBeNull();
    });

    it('should return null if controlEffectiveness is null', () => {
      expect(
        calculateResidualScore({
          inherentRating: 1,
          controlEffectiveness: null,
          inherentScore: null,
          latestResidualRating: null,
        })
      ).toBeNull();
    });

    it('should return null if both inherentRating and controlEffectiveness are null', () => {
      expect(
        calculateResidualScore({
          inherentRating: null,
          controlEffectiveness: null,
          inherentScore: null,
          latestResidualRating: null,
        })
      ).toBeNull();
    });

    it.each`
      inherentRating | controlEffectiveness | expected
      ${1}           | ${1}                 | ${1}
      ${2}           | ${0.75}              | ${1}
      ${20}          | ${0.45}              | ${11}
      ${25}          | ${0.2}               | ${20}
    `(
      'should return the maximum of the product of inherentRating and controlEffectiveness or 1',
      ({ inherentRating, controlEffectiveness, expected }) => {
        expect(
          calculateResidualScore({
            inherentRating,
            controlEffectiveness: { overallMitigation: controlEffectiveness },
            inherentScore: null,
            latestResidualRating: null,
          })
        ).toBe(expected);
      }
    );
  });
});
