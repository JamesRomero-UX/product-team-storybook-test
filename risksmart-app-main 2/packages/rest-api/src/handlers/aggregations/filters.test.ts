import { ControlTypeEnum } from 'generated/graphql';

import { filterControls } from './filters';
import type { Controls } from './types';

describe('filterControls', () => {
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
      filterControls(controls, {
        controlFilterField: 'CustomAttributeData',
        controlFilterCustomAttributeKey: 'custom_field',
        controlFilterValues: ['yes', 'maybe'],
      })
    ).toEqual([controls[0], controls[1], controls[2]]);
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
      filterControls(controls, {
        controlFilterField: 'Type',
        controlFilterValues: [ControlTypeEnum.Corrective],
      })
    ).toEqual([controls[0], controls[1], controls[2]]);
  });
});
