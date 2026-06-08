import FormField from '@risk-smart/themed-cloudscape-components/form';
import Input from '@risk-smart/themed-cloudscape-components/input';

import { nullDataChartLabel } from '../nullData';
import type { CellInfo, ReportFieldType } from './types';

const getText = ({ fieldData, fieldDef }: CellInfo): null | string => {
  const value = fieldData.value;
  if (fieldDef.displayType !== 'number') {
    throw new Error('number field type used out of context');
  }
  if (value === null) {
    return null;
  }
  if (fieldDef.prefix) {
    return `${fieldDef.prefix}${value}`;
  }

  return value.toString();
};

export const number: ReportFieldType = {
  cell: getText,
  getChartLabel: (cellData) => {
    const label = getText(cellData);

    if (label === null) {
      return nullDataChartLabel();
    }

    return label;
  },
  exportVal: (cellData) => {
    const label = getText(cellData);

    return label ?? '';
  },

  propertyConfig(fieldDef) {
    if (fieldDef.displayType !== 'number') {
      throw new Error('number field type used out of context');
    }

    return {
      key: fieldDef.key,
      groupValuesLabel: fieldDef.groupValuesLabel,
      propertyLabel: fieldDef.propertyLabel,
      // Could possibly add greater then or equal to/less then or equal to once server side updated
      operators: ['=', '!=', '<', '>'].map((operator) => {
        return {
          operator,
          form: (props) => {
            return (
              <FormField>
                <div className={'flex items-center'}>
                  {fieldDef.prefix ?? ''}
                  <Input
                    step={1}
                    value={props.value}
                    type={'number'}
                    onChange={(e) => props.onChange(e.detail.value)}
                  />
                </div>
              </FormField>
            );
          },
          format: (value) => {
            if (fieldDef.displayType !== 'number') {
              throw new Error('number field type used out of context');
            }
            if (fieldDef.prefix) {
              return `${fieldDef.prefix}${value}`;
            }

            return value;
          },
        };
      }),
    };
  },
};
