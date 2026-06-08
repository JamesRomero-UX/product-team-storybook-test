import {
  ControlTypeEnum,
  RiskAssessmentResultControlTypeEnum,
} from 'generated/graphql';

import type { Controls } from '../types';
import {
  calculateControlEffectiveness,
  calculateInherentScore,
  calculateResidualScore,
} from './controlEffectivenessAverages';

describe('Control effectiveness averages', () => {
  describe('calculateInherentRating', () => {
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
        ).toEqual({ score: expected, likelihood, impact });
      }
    );
  });

  describe('calculateControlEffectiveness', () => {
    it('should return null if there are no controls', () => {
      const controls: Controls = [];
      expect(
        calculateControlEffectiveness({ controls, config: null })
      ).toBeNull();
    });

    it.each`
      config       | effectiveness_one | effectiveness_two | effectiveness_three | expected
      ${null}      | ${0}              | ${0}              | ${0}                | ${0.95}
      ${undefined} | ${0}              | ${0}              | ${0}                | ${0.95}
      ${undefined} | ${1}              | ${2}              | ${1}                | ${0.75}
      ${undefined} | ${1}              | ${2}              | ${3}                | ${0.45}
      ${undefined} | ${2}              | ${2}              | ${3}                | ${0.45}
      ${undefined} | ${3}              | ${3}              | ${3}                | ${0.2}
      ${undefined} | ${4}              | ${4}              | ${4}                | ${0.01}
    `(
      'should return the correct divider based on the average OverallEffectiveness {$effectiveness_one}, {$effectiveness_two}, {$effectiveness_three} => $expected',
      ({
        config,
        effectiveness_one,
        effectiveness_two,
        effectiveness_three,
        expected,
      }) => {
        const controls = [
          {
            control: {
              Id: '1',
              Type: ControlTypeEnum.Corrective,
              CustomAttributeData: {},
              testResults: [{ OverallEffectiveness: effectiveness_one }],
            },
          },
          {
            control: {
              Id: '2',
              Type: ControlTypeEnum.Corrective,
              CustomAttributeData: {},
              testResults: [{ OverallEffectiveness: effectiveness_two }],
            },
          },
          {
            control: {
              Id: '3',
              Type: ControlTypeEnum.Corrective,
              CustomAttributeData: {},
              testResults: [{ OverallEffectiveness: effectiveness_three }],
            },
          },
        ];
        expect(
          calculateControlEffectiveness({ controls, config })?.overallMitigation
        ).toBe(expected);
      }
    );

    it.each`
      effectiveness_one | effectiveness_two | effectiveness_three | expected
      ${0}              | ${0}              | ${0}                | ${1.0}
      ${1}              | ${2}              | ${3}                | ${1.0}
      ${2}              | ${3}              | ${10}               | ${1.0}
      ${6}              | ${6}              | ${6}                | ${0.75}
      ${7}              | ${8}              | ${9}                | ${0.65}
      ${8}              | ${9}              | ${10}               | ${0.5}
      ${9}              | ${10}             | ${11}               | ${0.25}
    `(
      'should return the correct mitigation when there is a custom config, {$effectiveness_one}, {$effectiveness_two}, {$effectiveness_three} => $expected',
      ({
        effectiveness_one,
        effectiveness_two,
        effectiveness_three,
        expected,
      }) => {
        const controls = [
          {
            control: {
              Id: '1',
              Type: ControlTypeEnum.Corrective,
              CustomAttributeData: {},
              testResults: [{ OverallEffectiveness: effectiveness_one }],
            },
          },
          {
            control: {
              Id: '2',
              Type: ControlTypeEnum.Corrective,
              CustomAttributeData: {},
              testResults: [{ OverallEffectiveness: effectiveness_two }],
            },
          },
          {
            control: {
              Id: '3',
              Type: ControlTypeEnum.Corrective,
              CustomAttributeData: {},
              testResults: [{ OverallEffectiveness: effectiveness_three }],
            },
          },
        ];
        expect(
          calculateControlEffectiveness({
            controls,
            config: {
              mitigations: [
                { lowerBound: 0, upperBound: 6, mitigationMultiplier: 1.0 },
                { lowerBound: 6, upperBound: 8, mitigationMultiplier: 0.75 },
                { lowerBound: 8, upperBound: 9, mitigationMultiplier: 0.65 },
                { lowerBound: 9, upperBound: 10, mitigationMultiplier: 0.5 },
                { lowerBound: 10, upperBound: 99, mitigationMultiplier: 0.25 },
              ],
            },
          })?.overallMitigation
        ).toBe(expected);
      }
    );

    it('throws when there is a missing DesignEffectiveness or PerformanceEffectiveness and ignoreOverallEffectiveness is true', () => {
      const controls = [
        {
          control: {
            Id: '1',
            Type: ControlTypeEnum.Corrective,
            CustomAttributeData: {},
            testResults: [
              {
                DesignEffectiveness: 3,
                PerformanceEffectiveness: 2,
              },
            ],
          },
        },
        {
          control: {
            Id: '2',
            Type: ControlTypeEnum.Corrective,
            CustomAttributeData: {},
            testResults: [
              {
                DesignEffectiveness: undefined,
                PerformanceEffectiveness: null,
              },
            ],
          },
        },
      ];
      expect(() =>
        calculateControlEffectiveness({
          config: {
            mitigations: [
              { lowerBound: 0, upperBound: 6, mitigationMultiplier: 1.0 },
            ],
            ignoreOverallEffectiveness: true,
          },
          controls,
        })
      ).toThrowError(
        'Design and Performance effectiveness must be present when ignoreOverallEffectiveness is true'
      );
    });

    it('doesnt throw when ignoreOverallEffectiveness is true and there are no test results', () => {
      const controls = [
        {
          control: {
            Id: '1',
            Type: ControlTypeEnum.Corrective,
            CustomAttributeData: {},
            testResults: [],
          },
        },
        {
          control: {
            Id: '2',
            Type: ControlTypeEnum.Corrective,
            CustomAttributeData: {},
            testResults: [],
          },
        },
      ];
      expect(() =>
        calculateControlEffectiveness({
          config: {
            mitigations: [
              { lowerBound: 0, upperBound: 6, mitigationMultiplier: 1.0 },
            ],
            ignoreOverallEffectiveness: true,
          },
          controls,
        })
      ).not.toThrowError(
        'Design and Performance effectiveness must be present when ignoreOverallEffectiveness is true'
      );
    });

    it.each`
      effectiveness_one | effectiveness_two | effectiveness_three | expected
      ${[1, 3]}         | ${[2, 2]}         | ${[3, 1]}           | ${1.0}
      ${[2, 2]}         | ${[3, 2]}         | ${[3, 4]}           | ${0.75}
      ${[3, 4]}         | ${[3, 4]}         | ${[3, 4]}           | ${0.25}
    `(
      'should return the correct mitigation when ignoreOverallEffectiveness is true {$effectiveness_one}, {$effectiveness_two}, {$effectiveness_three} => $expected',
      ({
        effectiveness_one,
        effectiveness_two,
        effectiveness_three,
        expected,
      }) => {
        const controls = [
          {
            control: {
              Id: '1',
              Type: ControlTypeEnum.Corrective,
              CustomAttributeData: {},
              testResults: [
                {
                  DesignEffectiveness: effectiveness_one[0],
                  PerformanceEffectiveness: effectiveness_one[1],
                },
              ],
            },
          },
          {
            control: {
              Id: '2',
              Type: ControlTypeEnum.Corrective,
              CustomAttributeData: {},
              testResults: [
                {
                  DesignEffectiveness: effectiveness_two[0],
                  PerformanceEffectiveness: effectiveness_two[1],
                },
              ],
            },
          },
          {
            control: {
              Id: '3',
              Type: ControlTypeEnum.Corrective,
              CustomAttributeData: {},
              testResults: [
                {
                  DesignEffectiveness: effectiveness_three[0],
                  PerformanceEffectiveness: effectiveness_three[1],
                },
              ],
            },
          },
        ];
        expect(
          calculateControlEffectiveness({
            config: {
              mitigations: [
                { lowerBound: 0, upperBound: 6, mitigationMultiplier: 1.0 },
                { lowerBound: 6, upperBound: 8, mitigationMultiplier: 0.75 },
                { lowerBound: 8, upperBound: 9, mitigationMultiplier: 0.65 },
                { lowerBound: 9, upperBound: 10, mitigationMultiplier: 0.5 },
                { lowerBound: 10, upperBound: 99, mitigationMultiplier: 0.25 },
              ],
              ignoreOverallEffectiveness: true,
            },
            controls,
          })?.overallMitigation
        ).toBe(expected);
      }
    );

    // foo: (10*0.9+10*0.6+10*0.3)/(0.9+0.6+0.3) = 10 -> 0.25
    // bar: (10*1.4+10*0.2+10*3.3)/(1.4+0.2+3.3) = 10 -> 0.25
    it.each`
      weightFieldName | weight_one | weight_two | weight_three | expected
      ${'foo'}        | ${0.9}     | ${0.6}     | ${0.3}       | ${0.25}
      ${'bar'}        | ${1.4}     | ${0.2}     | ${3.3}       | ${0.25}
    `(
      'should use weighting when enabled',
      ({ weightFieldName, weight_one, weight_two, weight_three, expected }) => {
        const controls = [
          {
            control: {
              Id: '1',
              Type: ControlTypeEnum.Corrective,
              CustomAttributeData: {
                foo: weight_one,
                bar: weight_one,
              },
              testResults: [
                {
                  OverallEffectiveness: 10,
                },
              ],
            },
          },
          {
            control: {
              Id: '2',
              Type: ControlTypeEnum.Corrective,
              CustomAttributeData: {
                foo: weight_two,
                bar: weight_two,
              },
              testResults: [
                {
                  OverallEffectiveness: 10,
                },
              ],
            },
          },
          {
            control: {
              Id: '3',
              Type: ControlTypeEnum.Corrective,
              CustomAttributeData: {
                foo: weight_three,
                bar: weight_three,
              },
              testResults: [
                {
                  OverallEffectiveness: 10,
                },
              ],
            },
          },
        ];
        expect(
          calculateControlEffectiveness({
            config: {
              mitigations: [
                { lowerBound: 0, upperBound: 6, mitigationMultiplier: 1.0 },
                { lowerBound: 6, upperBound: 8, mitigationMultiplier: 0.75 },
                { lowerBound: 8, upperBound: 9, mitigationMultiplier: 0.65 },
                { lowerBound: 9, upperBound: 10, mitigationMultiplier: 0.5 },
                { lowerBound: 10, upperBound: 14, mitigationMultiplier: 0.25 },
                { lowerBound: 14, upperBound: 17, mitigationMultiplier: 0.15 },
              ],
              enableWeighting: true,
              weightFieldName,
            },
            controls,
          })?.overallMitigation
        ).toBe(expected);
      }
    );

    it.each`
      effectiveness_one | effectiveness_two | effectiveness_three | expected
      ${1}              | ${2}              | ${3}                | ${0.75}
      ${2}              | ${2}              | ${3}                | ${0.75}
      ${2}              | ${3}              | ${3}                | ${0.55}
    `(
      'should return the correct mitigation multiplier when rounding is enabled',
      ({
        effectiveness_one,
        effectiveness_two,
        effectiveness_three,
        expected,
      }) => {
        const controls = [
          {
            control: {
              Id: '1',
              Type: ControlTypeEnum.Corrective,
              CustomAttributeData: {},
              testResults: [{ OverallEffectiveness: effectiveness_one }],
            },
          },
          {
            control: {
              Id: '2',
              Type: ControlTypeEnum.Corrective,
              CustomAttributeData: {},
              testResults: [{ OverallEffectiveness: effectiveness_two }],
            },
          },
          {
            control: {
              Id: '3',
              Type: ControlTypeEnum.Corrective,
              CustomAttributeData: {},
              testResults: [{ OverallEffectiveness: effectiveness_three }],
            },
          },
        ];
        expect(
          calculateControlEffectiveness({
            config: {
              mitigations: [
                { lowerBound: 1, upperBound: 2, mitigationMultiplier: 1.0 },
                { lowerBound: 2, upperBound: 3, mitigationMultiplier: 0.75 },
                { lowerBound: 3, upperBound: 4, mitigationMultiplier: 0.55 },
              ],
              roundControlEffectiveness: true,
            },
            controls,
          })?.overallMitigation
        ).toBe(expected);
      }
    );
  });

  describe('calculateResidualRating', () => {
    it('should return null if inherentScore is null', () => {
      expect(
        calculateResidualScore({
          inherentScore: null,
          controlEffectiveness: { overallMitigation: 0.5 },
          latestResidualRating: null,
        })
      ).toBeNull();
    });

    it('should return null if controlEffectiveness is null', () => {
      expect(
        calculateResidualScore({
          inherentScore: { score: 1, likelihood: 1, impact: 1 },
          controlEffectiveness: null,
          latestResidualRating: null,
        })
      ).toBeNull();
    });

    it('should return null if both inherentScore and controlEffectiveness are null', () => {
      expect(
        calculateResidualScore({
          inherentScore: null,
          controlEffectiveness: null,
          latestResidualRating: null,
        })
      ).toBeNull();
    });

    it.each`
      inherentScore | controlEffectiveness | expected
      ${1}          | ${1}                 | ${1}
      ${2}          | ${0.75}              | ${1.5}
      ${20}         | ${0.45}              | ${9}
      ${25}         | ${0.2}               | ${5}
    `(
      'should return the product of inherentRating $inherentScore and controlEffectiveness $controlEffectiveness = $expected',
      ({ inherentScore, controlEffectiveness, expected }) => {
        expect(
          calculateResidualScore({
            inherentScore: { score: inherentScore, likelihood: 1, impact: 1 },
            controlEffectiveness: { overallMitigation: controlEffectiveness },
            latestResidualRating: null,
          })
        ).toBe(expected);
      }
    );

    it('should return 1 if the product is less than 1', () => {
      expect(
        calculateResidualScore({
          inherentScore: { score: 1, likelihood: 1, impact: 1 },
          controlEffectiveness: { overallMitigation: 0.95 },
          latestResidualRating: null,
        })
      ).toBe(1);
    });
  });
});
