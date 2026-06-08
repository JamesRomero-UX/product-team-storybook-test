import type { ModuleKey } from '@risksmart-app/modules/src/index';
import { Risk_Scoring_Model_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { when } from 'jest-when';
import { random } from 'lodash';
import { vi } from 'vitest';

import { privateWidgets } from '../widgetPrivate';
import { getPaletteItems, riskModelSupportedByHeatmap } from './utils';

describe('widgets', () => {
  const totalWidgetCount = Object.keys(privateWidgets).length;
  const hasPermission = () => ({ hasPermission: true, loading: false });
  const isModuleEnabled = (id: ModuleKey) => {
    // Impact module must be disabled so the legacy heatmap/rating widgets remain visible
    if (id === 'risk.subModules.impact') {
      return false;
    }

    return true;
  };
  const riskModel = Risk_Scoring_Model_Enum.Default;

  describe('riskModelSupportedByHeatmap', () => {
    it.each([
      {
        model: Risk_Scoring_Model_Enum.Default,
        expected: true,
        description: 'Default',
      },
      {
        model: Risk_Scoring_Model_Enum.TypedControlEffectivenessAverages,
        expected: true,
        description: 'TypedControlEffectivenessAverages',
      },
      {
        model: Risk_Scoring_Model_Enum.ControlEffectivenessAverages,
        expected: false,
        description: 'ControlEffectivenessAverages',
      },
      {
        model: Risk_Scoring_Model_Enum.NumberOfControlsWithGaps,
        expected: false,
        description: 'NumberOfControlsWithGaps',
      },
    ])(
      'should return $expected for $description risk scoring model',
      ({ model, expected }) => {
        const result = riskModelSupportedByHeatmap(model);
        expect(result).toBe(expected);
      }
    );
  });

  describe('getPaletteItems', () => {
    it('should return all widgets when passed an empty array', () => {
      const items = getPaletteItems({
        widgets: privateWidgets,
        items: [],
        hasPermission,
        riskModel,
        isModuleEnabled,
      });
      expect(items.length).toEqual(totalWidgetCount);
    });

    it('should exclude widgets that are passed in', () => {
      const widgetType = 'actionsByStatus';
      const originalMultiple = privateWidgets[widgetType].multiple;
      privateWidgets[widgetType].multiple = false;
      const items = getPaletteItems({
        widgets: privateWidgets,
        items: [
          {
            id: random().toFixed(),
            data: { ...privateWidgets[widgetType], widgetType },
          },
        ],
        hasPermission,
        riskModel,
        isModuleEnabled,
      });
      privateWidgets[widgetType].multiple = originalMultiple;
      expect(items.length).toEqual(totalWidgetCount - 1);
      expect(
        items.find((i) => i.data.widgetType === widgetType)
      ).toBeUndefined();
    });

    it('should not exclude widgets that are passed in that are designated as multiple', () => {
      const widgetType = 'issuesTable';
      const items = getPaletteItems({
        widgets: privateWidgets,
        items: [
          {
            id: random().toFixed(),
            data: {
              ...privateWidgets[widgetType],
              widgetType,
              multiple: true,
            },
          },
        ],
        hasPermission,
        riskModel,
        isModuleEnabled,
      });
      expect(items.length).toEqual(totalWidgetCount);
      expect(items.find((i) => i.data.widgetType === widgetType)).toBeDefined();
    });

    it.each([
      {
        hasCustomDatasourcePermission: true,
        customDatasourceModuleEnabled: true,
        result: 'include',
      },
      {
        hasCustomDatasourcePermission: true,
        customDatasourceModuleEnabled: false,
        result: 'exclude',
      },
      {
        hasCustomDatasourcePermission: false,
        customDatasourceModuleEnabled: true,
        result: 'exclude',
      },
      {
        hasCustomDatasourcePermission: false,
        customDatasourceModuleEnabled: false,
        result: 'exclude',
      },
    ])(
      'should $result the customDataSourceWidget widget if custom_datasource module is $customDatasourceModuleEnabled and read:custom_datasource is $hasCustomDatasourcePermission',
      ({
        customDatasourceModuleEnabled,
        hasCustomDatasourcePermission,
        result,
      }) => {
        const widgetType = 'customDataSourceWidget';
        const hasPermission = vi.fn();
        const isModuleEnabled = vi.fn();

        when(isModuleEnabled)
          .calledWith('custom_datasource')
          .mockReturnValue(customDatasourceModuleEnabled);

        when(hasPermission)
          .calledWith('read:custom_datasource')
          .mockReturnValue({
            hasPermission: hasCustomDatasourcePermission,
            loading: false,
          });
        const items = getPaletteItems({
          widgets: privateWidgets,
          items: [],
          hasPermission,
          riskModel,
          isModuleEnabled,
        });
        const widget = items.find((i) => i.data.widgetType === widgetType);
        if (result === 'include') {
          expect(widget).toBeDefined();
        } else {
          expect(widget).toBeUndefined();
        }
      }
    );
  });
});
