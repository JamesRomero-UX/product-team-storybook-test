import type {
  JsonFormsRendererRegistryEntry,
  RankedTester,
} from '@jsonforms/core';
import { and } from '@jsonforms/core';
import {
  isBooleanControl,
  isStringControl,
  rankWith,
  uiTypeIs,
} from '@jsonforms/core';

import { FieldOptionType, FieldUtilityType, LayoutType } from '../types';
import { AddConditionalControl } from './controls/AddConditionalControl';
import { AddOptionControl } from './controls/AddOptionControl';
import { BooleanControl } from './controls/BooleanControl';
import { DateControl } from './controls/DateControl';
import { DropdownMultiselectControl } from './controls/DropdownMultiSelectControl';
import { DropdownSelectControl } from './controls/DropdownSelectControl';
import { TextAreaControl } from './controls/TextAreaControl';
import { TextControl } from './controls/TextControl';
import { GroupLayoutRenderer } from './layouts/GroupLayout';
import { VerticalLayoutRenderer } from './layouts/VerticalLayout';

/*
RATIONALE:
  - `rankWith` expects an integer to determine the priority that each tester is picked with
  - The higher the number, the earlier this tester is used to determine which renderer to use
  - Generally speaking, rules with higher specificity should be given a higher priority
    as lower numbers will be used as fall back renderers
  - The default value used for `rankWith` is 2 so any custom renderers should have a minimum rank of 3
*/

const dropdownMultiselectControlTester: RankedTester = rankWith(
  4,
  (uischema) => {
    return uischema.options?.fieldType === FieldOptionType.Multiselect;
  }
);

const dropdownSelectControlTester: RankedTester = rankWith(4, (uischema) => {
  return (
    uischema.options?.fieldType === FieldOptionType.Dropdown ||
    uischema.options?.fieldType === FieldOptionType.Radio
  );
});

const addOptionControlTester: RankedTester = rankWith(4, (uischema) => {
  return uischema.options?.fieldType === FieldUtilityType.AddOption;
});

const addConditionalControlTester: RankedTester = rankWith(4, (uischema) => {
  return uischema.options?.fieldType === FieldUtilityType.AddConditional;
});

const textAreaControlTester: RankedTester = rankWith(
  4,
  and(isStringControl, (uischema) => {
    return uischema.options?.fieldType === FieldOptionType.TextArea;
  })
);

const dateControlTester: RankedTester = rankWith(
  4,
  and(isStringControl, (uischema) => {
    return uischema.options?.fieldType === FieldOptionType.Date;
  })
);

const verticalLayoutTester: RankedTester = rankWith(
  3,
  uiTypeIs(LayoutType.VerticalLayout)
);

const groupLayoutTester: RankedTester = rankWith(3, uiTypeIs(LayoutType.Group));

const textControlTester: RankedTester = rankWith(3, isStringControl);

const booleanControlTester: RankedTester = rankWith(3, isBooleanControl);

export const rendererRegistry: JsonFormsRendererRegistryEntry[] = [
  {
    tester: verticalLayoutTester,
    renderer: VerticalLayoutRenderer,
  },
  {
    tester: groupLayoutTester,
    renderer: GroupLayoutRenderer,
  },
  {
    tester: textControlTester,
    renderer: TextControl,
  },
  {
    tester: textAreaControlTester,
    renderer: TextAreaControl,
  },
  {
    tester: dateControlTester,
    renderer: DateControl,
  },
  {
    tester: booleanControlTester,
    renderer: BooleanControl,
  },
  {
    tester: dropdownSelectControlTester,
    renderer: DropdownSelectControl,
  },
  {
    tester: dropdownMultiselectControlTester,
    renderer: DropdownMultiselectControl,
  },
  {
    tester: addOptionControlTester,
    renderer: AddOptionControl,
  },
  {
    tester: addConditionalControlTester,
    renderer: AddConditionalControl,
  },
];
