import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import { getColorStyles } from '@risksmart-app/components/src/utils/colours';
import clsx from 'clsx';
import _ from 'lodash';
import type { FC, ReactNode } from 'react';
import { ConformanceIndicatorRating } from 'src/pages/indicators/types';

type Props = {
  upperTolerance?: null | number;
  upperAppetite?: null | number;
  lowerAppetite?: null | number;
  lowerTolerance?: null | number;
};

const Value: FC<{ children: number; align: 'left' | 'right' }> = ({
  children,
  align,
}) => {
  const classNames = clsx(
    'absolute top-[20px]  text-center w-full',
    align === 'right' ? 'ml-[50%]' : 'ml-[-50%]'
  );

  return <div className={classNames}>{children}</div>;
};

const Segment: FC<{ children?: ReactNode; color: string; title: string }> = ({
  children,
  color,
  title,
}) => (
  <div
    title={title}
    className={'flex-auto relative first:rounded-l last:rounded-r'}
    style={{ background: getColorStyles(color).backgroundColor }}
  >
    {children}
  </div>
);

const Tolerance: FC<Props> = ({
  upperTolerance,
  upperAppetite,
  lowerAppetite,
  lowerTolerance,
}) => {
  const sections = [];
  const hasLowerTolerance = !_.isNil(lowerTolerance);
  const hasUpperAppetite = !_.isNil(upperAppetite);
  const hasLowerAppetite = !_.isNil(lowerAppetite);
  const hasUpperTolerance = !_.isNil(upperTolerance);
  const hasAnyBoundary =
    hasLowerAppetite || hasLowerTolerance || upperAppetite || upperTolerance;
  const { getColorClass, getLabel } = useRating('indicator_conformance_status');
  if (hasLowerTolerance) {
    sections.push(
      <Segment
        color={getColorClass(ConformanceIndicatorRating.Outside) ?? ''}
        key={'lowerTolerance'}
        title={getLabel(ConformanceIndicatorRating.Outside)}
      >
        <Value align={'right'}>{lowerTolerance}</Value>
      </Segment>
    );
  }
  if (hasLowerAppetite) {
    sections.push(
      <Segment
        title={getLabel(ConformanceIndicatorRating.OutsideAppetite)}
        key={'lowerAppetite'}
        color={getColorClass(ConformanceIndicatorRating.OutsideAppetite) ?? ''}
      >
        <Value align={'right'}>{lowerAppetite}</Value>
      </Segment>
    );
  }
  if (hasAnyBoundary) {
    sections.push(
      <Segment
        title={getLabel(ConformanceIndicatorRating.Within)}
        key={'ok'}
        color={getColorClass(ConformanceIndicatorRating.Within) ?? ''}
      />
    );
  } else {
    sections.push(
      <Segment title={'Not set'} key={'not set'} color={'light-grey'} />
    );
  }
  if (hasUpperAppetite) {
    sections.push(
      <Segment
        key={'upperAppetite'}
        title={getLabel(ConformanceIndicatorRating.OutsideAppetite)}
        color={getColorClass(ConformanceIndicatorRating.OutsideAppetite) ?? ''}
      >
        <Value align={'left'}>{upperAppetite}</Value>
      </Segment>
    );
  }
  if (hasUpperTolerance) {
    sections.push(
      <Segment
        key={'upperTolerance'}
        title={getLabel(ConformanceIndicatorRating.Outside)}
        color={getColorClass(ConformanceIndicatorRating.Outside) ?? ''}
      >
        <Value align={'left'}>{upperTolerance}</Value>
      </Segment>
    );
  }

  return (
    <div className={'h-[20px] w-full flex rounded pb-[20px]'}>{sections}</div>
  );
};

export default Tolerance;
