import {
  ControlTypeEnum,
  RiskAssessmentResultControlTypeEnum,
} from 'generated/graphql';

import type { Controls } from '../types';
import {
  calculateControlEffectiveness,
  calculateInherentScore,
} from './typedControlEffectivenessAverages';

describe('Typed control effectiveness averages', () => {
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
      control_type                  | effectiveness_one | effectiveness_two | effectiveness_three | expected_impact | expected_likelihood
      ${ControlTypeEnum.Corrective} | ${0}              | ${0}              | ${0}                | ${0.95}         | ${1.0}
      ${ControlTypeEnum.Corrective} | ${0}              | ${0}              | ${0}                | ${0.95}         | ${1.0}
      ${ControlTypeEnum.Corrective} | ${1}              | ${2}              | ${1}                | ${0.75}         | ${1.0}
      ${ControlTypeEnum.Corrective} | ${1}              | ${2}              | ${3}                | ${0.45}         | ${1.0}
      ${ControlTypeEnum.Corrective} | ${2}              | ${2}              | ${3}                | ${0.45}         | ${1.0}
      ${ControlTypeEnum.Corrective} | ${3}              | ${3}              | ${3}                | ${0.2}          | ${1.0}
      ${ControlTypeEnum.Corrective} | ${4}              | ${4}              | ${4}                | ${0.01}         | ${1.0}
      ${ControlTypeEnum.Preventive} | ${0}              | ${0}              | ${0}                | ${1.0}          | ${0.95}
      ${ControlTypeEnum.Preventive} | ${0}              | ${0}              | ${0}                | ${1.0}          | ${0.95}
      ${ControlTypeEnum.Preventive} | ${1}              | ${2}              | ${1}                | ${1.0}          | ${0.75}
      ${ControlTypeEnum.Preventive} | ${1}              | ${2}              | ${3}                | ${1.0}          | ${0.45}
      ${ControlTypeEnum.Preventive} | ${2}              | ${2}              | ${3}                | ${1.0}          | ${0.45}
      ${ControlTypeEnum.Preventive} | ${3}              | ${3}              | ${3}                | ${1.0}          | ${0.2}
      ${ControlTypeEnum.Preventive} | ${4}              | ${4}              | ${4}                | ${1.0}          | ${0.01}
      ${ControlTypeEnum.Detective}  | ${0}              | ${0}              | ${0}                | ${0.95}         | ${0.95}
      ${ControlTypeEnum.Detective}  | ${0}              | ${0}              | ${0}                | ${0.95}         | ${0.95}
      ${ControlTypeEnum.Detective}  | ${1}              | ${2}              | ${1}                | ${0.75}         | ${0.75}
      ${ControlTypeEnum.Detective}  | ${1}              | ${2}              | ${3}                | ${0.45}         | ${0.45}
      ${ControlTypeEnum.Detective}  | ${2}              | ${2}              | ${3}                | ${0.45}         | ${0.45}
      ${ControlTypeEnum.Detective}  | ${3}              | ${3}              | ${3}                | ${0.2}          | ${0.2}
      ${ControlTypeEnum.Detective}  | ${4}              | ${4}              | ${4}                | ${0.01}         | ${0.01}
      ${ControlTypeEnum.Directive}  | ${0}              | ${0}              | ${0}                | ${0.95}         | ${0.95}
      ${ControlTypeEnum.Directive}  | ${0}              | ${0}              | ${0}                | ${0.95}         | ${0.95}
      ${ControlTypeEnum.Directive}  | ${1}              | ${2}              | ${1}                | ${0.75}         | ${0.75}
      ${ControlTypeEnum.Directive}  | ${1}              | ${2}              | ${3}                | ${0.45}         | ${0.45}
      ${ControlTypeEnum.Directive}  | ${2}              | ${2}              | ${3}                | ${0.45}         | ${0.45}
      ${ControlTypeEnum.Directive}  | ${3}              | ${3}              | ${3}                | ${0.2}          | ${0.2}
      ${ControlTypeEnum.Directive}  | ${4}              | ${4}              | ${4}                | ${0.01}         | ${0.01}
    `(
      'should return the correct divider based on the average OverallEffectivenesses and control type',
      ({
        control_type,
        effectiveness_one,
        effectiveness_two,
        effectiveness_three,
        expected_impact,
        expected_likelihood,
      }) => {
        const controls = [
          {
            control: {
              Id: '1',
              Type: control_type,
              CustomAttributeData: {},
              testResults: [{ OverallEffectiveness: effectiveness_one }],
            },
          },
          {
            control: {
              Id: '2',
              Type: control_type,
              CustomAttributeData: {},
              testResults: [{ OverallEffectiveness: effectiveness_two }],
            },
          },
          {
            control: {
              Id: '3',
              Type: control_type,
              CustomAttributeData: {},
              testResults: [{ OverallEffectiveness: effectiveness_three }],
            },
          },
        ];
        expect(
          calculateControlEffectiveness({ controls, config: null })
        ).toEqual({
          impactMitigation: expected_impact,
          likelihoodMitigation: expected_likelihood,
          overallMitigation: 1,
        });
      }
    );

    it.each`
      ce1  | ce2  | ce3  | ce4  | ce5  | ce6  | ce7  | ce8  | expected_impact | expected_likelihood
      ${1} | ${2} | ${3} | ${1} | ${2} | ${3} | ${1} | ${4} | ${0.75}         | ${0.45}
      ${2} | ${3} | ${4} | ${2} | ${3} | ${4} | ${2} | ${5} | ${0.45}         | ${0.2}
      ${3} | ${4} | ${5} | ${3} | ${4} | ${5} | ${3} | ${6} | ${0.2}          | ${0.01}
      ${4} | ${5} | ${6} | ${4} | ${5} | ${6} | ${4} | ${7} | ${0.01}         | ${0.01}
      ${4} | ${5} | ${0} | ${0} | ${0} | ${2} | ${3} | ${1} | ${0.2}          | ${0.95}
    `(
      'should return the correct mitigation based for mixed control types',
      ({
        ce1,
        ce2,
        ce3,
        ce4,
        ce5,
        ce6,
        ce7,
        ce8,
        expected_impact,
        expected_likelihood,
      }) => {
        const controls = [
          {
            control: {
              Id: '1',
              Type: ControlTypeEnum.Corrective,
              CustomAttributeData: {},
              testResults: [{ OverallEffectiveness: ce1 }],
            },
          },
          {
            control: {
              Id: '2',
              Type: ControlTypeEnum.Corrective,
              CustomAttributeData: {},
              testResults: [{ OverallEffectiveness: ce2 }],
            },
          },
          {
            control: {
              Id: '3',
              Type: ControlTypeEnum.Preventive,
              CustomAttributeData: {},
              testResults: [{ OverallEffectiveness: ce3 }],
            },
          },
          {
            control: {
              Id: '4',
              Type: ControlTypeEnum.Directive,
              CustomAttributeData: {},
              testResults: [{ OverallEffectiveness: ce4 }],
            },
          },
          {
            control: {
              Id: '5',
              Type: ControlTypeEnum.Directive,
              CustomAttributeData: {},
              testResults: [{ OverallEffectiveness: ce5 }],
            },
          },
          {
            control: {
              Id: '6',
              Type: ControlTypeEnum.Detective,
              CustomAttributeData: {},
              testResults: [{ OverallEffectiveness: ce6 }],
            },
          },
          {
            control: {
              Id: '7',
              Type: ControlTypeEnum.Detective,
              CustomAttributeData: {},
              testResults: [{ OverallEffectiveness: ce7 }],
            },
          },
          {
            control: {
              Id: '8',
              Type: ControlTypeEnum.Detective,
              CustomAttributeData: {},
              testResults: [{ OverallEffectiveness: ce8 }],
            },
          },
        ];
        expect(
          calculateControlEffectiveness({ controls, config: null })
        ).toEqual({
          impactMitigation: expected_impact,
          likelihoodMitigation: expected_likelihood,
          overallMitigation: 1,
        });
      }
    );
  });
});
