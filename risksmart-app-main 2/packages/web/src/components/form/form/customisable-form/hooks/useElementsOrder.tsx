import _ from 'lodash';
import type { ReactElement } from 'react';
import { useEffect, useState } from 'react';

import type { Props as ConditionalFieldProps } from '../ConditionalField';
import ConditionalFields from '../ConditionalField';
import { useRiskSmartForm } from '../RiskSmartFormContext';

type Element = {
  key: string;
  value: ReactElement;
};

type FieldOrdering = {
  FieldId: string;
  Position: number;
};

const orderElements = (
  elementsByKey: Element[],
  ordering?: FieldOrdering[]
) => {
  if (!ordering) {
    return elementsByKey?.map(({ key }) => key);
  }

  return elementsByKey
    ?.map(({ key }) => key)
    .sort((a, b) => {
      const aPos = ordering.find((f) => f.FieldId === a)?.Position;
      const bPos = ordering.find((f) => f.FieldId === b)?.Position;
      // if one of the fields is not in the field config, put it at the end
      if (aPos === undefined) {
        return 1;
      }
      if (bPos === undefined) {
        return -1;
      }

      return aPos - bPos;
    });
};

export const useElementsOrder = (
  elementsByKey: Element[],
  ordering?: FieldOrdering[]
) => {
  const [elementsOrder, setElementsOrder] = useState<string[]>(() =>
    orderElements(elementsByKey, ordering)
  );
  const { editMode } = useRiskSmartForm();

  useEffect(() => {
    const newOrder = orderElements(elementsByKey, ordering);
    if (!_.isEqual(newOrder, elementsOrder)) {
      setElementsOrder(newOrder);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ordering, elementsByKey.length]);

  const visibleElements = elementsOrder?.filter((key) => {
    const element = elementsByKey.find((e) => e.key === key);
    if (element && element?.value?.type === ConditionalFields) {
      return (
        !!(element.value.props as ConditionalFieldProps)?.condition || editMode
      );
    }

    return true;
  });

  return {
    elementsOrder,
    visibleElements,
    setElementsOrder,
  };
};
